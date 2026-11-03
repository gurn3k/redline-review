// npm run label
// Serves the labelling page and saves labels to eval/labels/labels.json.
// Node built-ins only. Listens on 127.0.0.1 so nothing else on the network can reach it.
import { createServer } from "node:http";
import { readFile, writeFile, rename } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..", "..");
const LABELS_FILE = path.join(HERE, "labels.json");
const FIRST_PORT = 4317;
const LAST_PORT = FIRST_PORT + 100;
const MAX_BODY = 1_000_000;

let port = FIRST_PORT;

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(new Error("too large"));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    req.on("error", reject);
  });
}

// The two PRD sections, cut out of PRD.md as written. Nothing is retyped.
async function prdSections() {
  const text = (await readFile(path.join(ROOT, "PRD.md"), "utf-8")).replace(/\r\n/g, "\n");
  const lines = text.split("\n");
  const grab = (heading) => {
    const start = lines.findIndex((l) => l.trim() === heading);
    if (start === -1) return null;
    let end = lines.length;
    for (let i = start + 1; i < lines.length; i++) {
      if (lines[i].startsWith("## ")) {
        end = i;
        break;
      }
    }
    return lines.slice(start, end).join("\n").replace(/\s+$/, "");
  };
  return [grab("## What good looks like"), grab("## My red lines")].filter(Boolean);
}

function validLabels(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return false;
  if (typeof data.labels !== "object" || data.labels === null || Array.isArray(data.labels)) return false;
  if (data.whatChanged !== undefined && typeof data.whatChanged !== "string") return false;
  for (const [key, v] of Object.entries(data.labels)) {
    if (!/^\d{1,3}$/.test(key) || !v || typeof v !== "object") return false;
    if (v.label !== "PASS" && v.label !== "FAIL" && v.label !== null) return false;
    if (typeof v.note !== "string") return false;
    if (v.history !== undefined && !Array.isArray(v.history)) return false;
  }
  return true;
}

async function handle(req, res) {
  const url = new URL(req.url, `http://127.0.0.1:${port}`);

  // Refuse requests that name another host (DNS rebinding) or come from another origin.
  const host = req.headers.host;
  if (host !== `127.0.0.1:${port}` && host !== `localhost:${port}`) return send(res, 403, '{"error":"bad host"}');
  if (req.method !== "GET" && req.headers.origin && req.headers.origin !== `http://${host}`) {
    return send(res, 403, '{"error":"bad origin"}');
  }

  if (req.method === "GET" && url.pathname === "/") {
    return send(res, 200, await readFile(path.join(HERE, "index.html")), "text/html; charset=utf-8");
  }
  if (req.method === "GET" && url.pathname === "/flags.json") {
    return send(res, 200, await readFile(path.join(HERE, "flags.json")));
  }
  if (req.method === "GET" && url.pathname === "/api/prd") {
    return send(res, 200, JSON.stringify({ sections: await prdSections() }));
  }
  if (req.method === "GET" && url.pathname === "/api/ping") {
    return send(res, 200, '{"ok":true}');
  }
  if (req.method === "GET" && url.pathname === "/labels.json") {
    if (!existsSync(LABELS_FILE)) return send(res, 200, '{"labels":{},"whatChanged":"","savedAt":null}');
    return send(res, 200, await readFile(LABELS_FILE));
  }
  if (req.method === "PUT" && url.pathname === "/labels.json") {
    if (!String(req.headers["content-type"] || "").startsWith("application/json")) {
      return send(res, 415, '{"error":"send application/json"}');
    }
    let data;
    try {
      data = JSON.parse(await readBody(req));
    } catch {
      return send(res, 400, '{"error":"not valid JSON"}');
    }
    if (!validLabels(data)) return send(res, 400, '{"error":"unexpected shape"}');
    const tmp = LABELS_FILE + ".tmp";
    await writeFile(tmp, JSON.stringify(data, null, 2) + "\n");
    await rename(tmp, LABELS_FILE);
    return send(res, 200, '{"saved":true}');
  }
  send(res, 404, '{"error":"not found"}');
}

const server = createServer((req, res) => {
  handle(req, res).catch(() => {
    if (!res.headersSent) send(res, 500, '{"error":"server error"}');
    else res.end();
  });
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE" && port < LAST_PORT) {
    port += 1;
    server.listen(port, "127.0.0.1");
  } else {
    console.error(err.message);
    process.exit(1);
  }
});

server.on("listening", () => {
  console.log(`Labelling page: http://127.0.0.1:${port}`);
  console.log(`Labels are saved to ${path.relative(process.cwd(), LABELS_FILE) || LABELS_FILE}. Press Ctrl+C to stop.`);
});

server.listen(port, "127.0.0.1");
