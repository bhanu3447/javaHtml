// Build step (npm run models): download InsightFace's buffalo_s pack and keep only the two models the server uses.
// Pure Node (fetch + zlib), so the build needs no curl/unzip. Optional argument: a local zip path instead of downloading.
import fs from "node:fs";
import zlib from "node:zlib";

const URL = "https://github.com/deepinsight/insightface/releases/download/v0.7/buffalo_s.zip";
const WANT = ["det_500m.onnx", "w600k_mbf.onnx"];
const dir = new globalThis.URL("./models/", import.meta.url);

let buf;
if (process.argv[2]) buf = fs.readFileSync(process.argv[2]);
else {
  const r = await fetch(URL);
  if (!r.ok) throw new Error("download failed: HTTP " + r.status);
  buf = Buffer.from(await r.arrayBuffer());
}
fs.mkdirSync(dir, { recursive: true });

// zip: end-of-central-directory -> central directory entries -> local headers -> data
const eocd = buf.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
if (eocd < 0) throw new Error("not a zip file");
const count = buf.readUInt16LE(eocd + 10);
let p = buf.readUInt32LE(eocd + 16), done = 0;
for (let i = 0; i < count; i++) {
  const method = buf.readUInt16LE(p + 10), size = buf.readUInt32LE(p + 20);
  const nameLen = buf.readUInt16LE(p + 28), extraLen = buf.readUInt16LE(p + 30), commentLen = buf.readUInt16LE(p + 32);
  const local = buf.readUInt32LE(p + 42), name = buf.toString("utf8", p + 46, p + 46 + nameLen);
  p += 46 + nameLen + extraLen + commentLen;
  if (!WANT.includes(name)) continue;
  const start = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
  const data = buf.subarray(start, start + size);
  fs.writeFileSync(new globalThis.URL(name, dir), method === 0 ? data : zlib.inflateRawSync(data));
  console.log("saved models/" + name);
  done++;
}
if (done !== WANT.length) throw new Error("models missing from the zip");
