// Face embedding with two small InsightFace ONNX models (buffalo_s pack):
//   det_500m.onnx  (SCRFD detector: boxes + 5 landmarks)  ->  align the face to 112x112  ->  w600k_mbf.onnx (512-number embedding)
// Pure JS around onnxruntime-node; images are JPEG (the browser sends canvas JPEGs).
import ort from "onnxruntime-node";
import jpeg from "jpeg-js";

const DET_SIZE = 640, DET_THRESH = 0.5, NMS_THRESH = 0.4, STRIDES = [8, 16, 32];
// where the eyes, nose and mouth corners sit in a 112x112 ArcFace input
const ARC = [[38.2946, 51.6963], [73.5318, 51.5014], [56.0252, 71.7366], [41.5493, 92.3655], [70.7299, 92.2041]];
let det, rec;

export async function load(dir = new URL("./models/", import.meta.url).pathname.replace(/^\/(\w:)/, "$1")) {
  det = await ort.InferenceSession.create(dir + "det_500m.onnx");
  rec = await ort.InferenceSession.create(dir + "w600k_mbf.onnx");
}

export function decode(base64) {
  const buf = Buffer.from(String(base64).split(",").pop(), "base64");
  return jpeg.decode(buf, { useTArray: true, formatAsRGBA: true, maxResolutionInMP: 40 }); // {width, height, data: RGBA}
}

function sample(img, x, y, c) { // bilinear, 0 outside
  const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0, w = img.width, h = img.height, d = img.data;
  const px = (xx, yy) => (xx < 0 || yy < 0 || xx >= w || yy >= h ? 0 : d[(yy * w + xx) * 4 + c]);
  return (px(x0, y0) * (1 - fx) + px(x0 + 1, y0) * fx) * (1 - fy) + (px(x0, y0 + 1) * (1 - fx) + px(x0 + 1, y0 + 1) * fx) * fy;
}

function iou(a, b) {
  const w = Math.max(0, Math.min(a.box[2], b.box[2]) - Math.max(a.box[0], b.box[0]));
  const h = Math.max(0, Math.min(a.box[3], b.box[3]) - Math.max(a.box[1], b.box[1]));
  const area = (f) => (f.box[2] - f.box[0]) * (f.box[3] - f.box[1]);
  return (w * h) / (area(a) + area(b) - w * h);
}

/* faces in the image, biggest first: [{box:[x1,y1,x2,y2], kps:[[x,y]x5], score}] */
export async function detect(img) {
  const S = DET_SIZE, r = Math.min(S / img.width, S / img.height), nw = Math.round(img.width * r), nh = Math.round(img.height * r);
  const t = new Float32Array(3 * S * S).fill(-127.5 / 128);        // padding = black after normalisation
  for (let y = 0; y < nh; y++) for (let x = 0; x < nw; x++) {
    const sx = (x + 0.5) / r - 0.5, sy = (y + 0.5) / r - 0.5;
    for (let c = 0; c < 3; c++) t[c * S * S + y * S + x] = (sample(img, sx, sy, c) - 127.5) / 128;  // RGB
  }
  const out = await det.run({ [det.inputNames[0]]: new ort.Tensor("float32", t, [1, 3, S, S]) });
  const o = det.outputNames.map((n) => out[n].data);
  let faces = [];
  STRIDES.forEach((s, i) => {
    const scores = o[i], bb = o[i + 3], kp = o[i + 6], fw = S / s, n = scores.length;
    for (let k = 0; k < n; k++) {
      if (scores[k] < DET_THRESH) continue;
      const cell = k >> 1, cx = (cell % fw) * s, cy = Math.floor(cell / fw) * s;
      const box = [(cx - bb[k * 4] * s) / r, (cy - bb[k * 4 + 1] * s) / r, (cx + bb[k * 4 + 2] * s) / r, (cy + bb[k * 4 + 3] * s) / r];
      const kps = [0, 1, 2, 3, 4].map((j) => [(cx + kp[k * 10 + j * 2] * s) / r, (cy + kp[k * 10 + j * 2 + 1] * s) / r]);
      faces.push({ box, kps, score: scores[k] });
    }
  });
  faces.sort((a, b) => b.score - a.score);
  const keep = [];
  for (const f of faces) if (keep.every((k) => iou(k, f) <= NMS_THRESH)) keep.push(f);
  const size = (f) => (f.box[2] - f.box[0]) * (f.box[3] - f.box[1]);
  return keep.sort((a, b) => size(b) - size(a));
}

/* 512 numbers (unit length) for one face, after aligning its 5 landmarks onto ARC */
export async function embedFace(img, face) {
  // least-squares similarity transform kps -> ARC: [a -b tx; b a ty]
  const src = face.kps, m = (p, i) => p.reduce((s, q) => s + q[i], 0) / 5;
  const sx = m(src, 0), sy = m(src, 1), dx = m(ARC, 0), dy = m(ARC, 1);
  let num1 = 0, num2 = 0, den = 0;
  for (let i = 0; i < 5; i++) {
    const ux = src[i][0] - sx, uy = src[i][1] - sy, vx = ARC[i][0] - dx, vy = ARC[i][1] - dy;
    num1 += ux * vx + uy * vy; num2 += ux * vy - uy * vx; den += ux * ux + uy * uy;
  }
  const a = num1 / den, b = num2 / den, tx = dx - (a * sx - b * sy), ty = dy - (b * sx + a * sy), q = a * a + b * b;
  const t = new Float32Array(3 * 112 * 112);
  for (let v = 0; v < 112; v++) for (let u = 0; u < 112; u++) {
    const ox = u - tx, oy = v - ty, x = (a * ox + b * oy) / q, y = (-b * ox + a * oy) / q;   // inverse transform
    for (let c = 0; c < 3; c++) t[c * 12544 + v * 112 + u] = (sample(img, x, y, c) - 127.5) / 127.5;
  }
  const out = await rec.run({ [rec.inputNames[0]]: new ort.Tensor("float32", t, [1, 3, 112, 112]) });
  const e = Array.from(out[rec.outputNames[0]].data), len = Math.hypot(...e);
  return e.map((x) => x / len);
}

/* the one main face of a picture -> {embedding} or {error} */
export async function embed(base64) {
  let img;
  try { img = decode(base64); } catch { return { error: "Could not read the image (send a JPEG)." }; }
  const faces = await detect(img);
  if (!faces.length) return { error: "No clear face found. Face the camera in good light." };
  const big = (f) => (f.box[2] - f.box[0]) * (f.box[3] - f.box[1]);
  if (faces.length > 1 && big(faces[1]) > 0.3 * big(faces[0])) return { error: "Exactly one face must be in the picture." };
  return { embedding: await embedFace(img, faces[0]) };
}
