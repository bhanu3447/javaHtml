// Face server for the course lock (Render free web service). Docs: kb/access-lock.md
//   GET  /       -> {ok:true}   (health check, also wakes the server)
//   POST /embed  {"image": "<base64 JPEG>"}  header x-face-secret: <FACE_API_SECRET>
//             -> {"embedding": [512 numbers]}  or  {"error": "..."}
// Only Supabase calls it; nothing is stored here.
import http from "node:http";
import { load, embed } from "./face.js";

const SECRET = process.env.FACE_API_SECRET || "", PORT = process.env.PORT || 10000, MAX = 6 * 1024 * 1024;
await load();

const send = (res, code, body) => { res.writeHead(code, { "Content-Type": "application/json" }); res.end(JSON.stringify(body)); };

http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/") return send(res, 200, { ok: true });
  if (req.method !== "POST" || req.url !== "/embed") return send(res, 404, { error: "not found" });
  if (!SECRET || req.headers["x-face-secret"] !== SECRET) return send(res, 403, { error: "forbidden" });
  let size = 0; const parts = [];
  req.on("data", (c) => { size += c.length; if (size > MAX) { send(res, 413, { error: "Image too large." }); req.destroy(); } else parts.push(c); });
  req.on("end", async () => {
    if (res.headersSent) return;
    try {
      const { image } = JSON.parse(Buffer.concat(parts).toString("utf8"));
      send(res, 200, await embed(image));
    } catch (e) { send(res, 400, { error: "Bad request." }); }
  });
}).listen(PORT, () => console.log("face server on port " + PORT));
