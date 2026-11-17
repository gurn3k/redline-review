// Films a short silent loop of the public sample review: clicking through four flags while the
// contract scrolls to the exact sentence each one quotes. It ends on the frame it starts with.
//   node scripts/card-loop.mjs <work dir> [url]
// Needs Chrome or Edge (set CHROME_PATH if it isn't found) and ffmpeg on PATH. Writes
// <work dir>/loop-redline.mp4 (1280x744, 30 fps, 11 s) and <work dir>/loop-redline-poster.jpg.
// Frames are stepped one at a time rather than captured in real time, so the clip is an exact
// 30 fps whatever the machine's speed; the contract's scroll is eased here, not by the browser.
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const OUT = process.argv[2];
if (!OUT) throw new Error("usage: node scripts/card-loop.mjs <work dir> [url]");
const URL_ = process.argv[3] ?? "https://redline-review-nine.vercel.app/sample";
const W = 1280, H = 744, FPS = 30, SECONDS = 11.0, SCROLL = 0.75;
// 980px keeps the two-column workspace (it starts at 960px) while filming it as large as it goes.
const VW = 980;

const CHROME = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome", "/usr/bin/chromium",
].filter(Boolean).find((p) => existsSync(p));
if (!CHROME) throw new Error("no Chrome or Edge found (set CHROME_PATH)");

// A headless Chrome driven over its DevTools protocol with Node's built-in WebSocket.
const profile = mkdtempSync(join(tmpdir(), "redline-loop-"));
const proc = spawn(CHROME, ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check", "--disable-gpu", "about:blank"], { stdio: ["ignore", "ignore", "pipe"] });
const wsUrl = await new Promise((ok, fail) => {
  let err = "";
  const timer = setTimeout(() => fail(new Error(`Chrome didn't start: ${err}`)), 15000);
  proc.stderr.on("data", (d) => {
    err += d;
    const m = err.match(/DevTools listening on (ws:\/\/\S+)/);
    if (m) { clearTimeout(timer); ok(m[1]); }
  });
});
const ws = new WebSocket(wsUrl);
await new Promise((ok, fail) => { ws.onopen = ok; ws.onerror = fail; });
let seq = 0;
const waiting = new Map();
const errors = [];
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && waiting.has(msg.id)) {
    const { ok, fail } = waiting.get(msg.id);
    waiting.delete(msg.id);
    if (msg.error) fail(new Error(msg.error.message));
    else ok(msg.result);
  } else if (msg.method === "Runtime.exceptionThrown") {
    errors.push(msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text);
  }
};
const send = (method, params = {}, sessionId) => new Promise((ok, fail) => {
  const id = ++seq;
  waiting.set(id, { ok, fail });
  ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
});
const { targetId } = await send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
const cdp = (method, params) => send(method, params, sessionId);
const js = async (expr) => {
  const r = await cdp("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(`${expr}\n${r.exceptionDetails.exception?.description ?? r.exceptionDetails.text}`);
  return r.result.value;
};
const until = async (expr, what, ms = 15000) => {
  for (const end = Date.now() + ms; Date.now() < end;) {
    if (await js(expr).catch(() => false)) return;
    await new Promise((ok) => setTimeout(ok, 100));
  }
  throw new Error(`timed out waiting for ${what}`);
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const metrics = (height) => cdp("Emulation.setDeviceMetricsOverride", { width: VW, height, deviceScaleFactor: 2, mobile: false });

await cdp("Runtime.enable");
await cdp("Page.enable");
await cdp("Network.enable");
// Filming shouldn't count as a visit.
await cdp("Network.setBlockedURLs", { urls: ["*googletagmanager*", "*google-analytics*", "*/_vercel/insights*"] });
await cdp("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "light" }] });
await metrics(700);
await cdp("Page.navigate", { url: URL_ });
await until(`document.querySelectorAll(".flag-head").length >= 5`, "the flags");
await js(`document.fonts.ready.then(() => true)`);
await until(`[...document.fonts].filter((f) => f.status === "loaded").length >= 2`, "the fonts");

// The page's own smooth scrolling is switched off; this script moves the contract itself.
await js(`(() => {
  Element.prototype.scrollIntoView = function () {};
  document.documentElement.style.scrollBehavior = "auto";
  document.documentElement.style.overflow = "hidden";
  document.querySelector(".workspace .doc-paper").style.scrollbarWidth = "none";
  return true;
})()`);
const titles = await js(`[...document.querySelectorAll(".flag-head .flag-title")].map((e) => e.textContent)`);
const flag = (name) => {
  const i = titles.findIndex((t) => t.toLowerCase().includes(name));
  if (i < 0) throw new Error(`no flag titled like "${name}" in: ${titles.join(", ")}`);
  return i;
};
const click = (i) => js(`document.querySelectorAll(".flag-head")[${i}].click(); true`);
const frame = () => js(`new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(true))))`);
const setScroll = (y) => js(`document.querySelector(".workspace .doc-paper").scrollTop = ${y}; true`);
// Where the page would scroll: the selected flag's sentence centred in the contract.
const target = () => js(`(() => {
  const paper = document.querySelector(".workspace .doc-paper");
  const m = paper.querySelector("mark.hl-selected").getBoundingClientRect();
  const top = m.top - paper.getBoundingClientRect().top + paper.scrollTop;
  return Math.max(0, Math.min(paper.scrollHeight - paper.clientHeight, top - paper.clientHeight / 2 + m.height / 2));
})()`);
const toWorkspace = () => js(`window.scrollTo(0, document.querySelector(".workspace").getBoundingClientRect().top + scrollY - 88); true`);

// Size the window so the contract pane, which is sticky and viewport-tall, fills the clip's height.
const width = await js(`document.querySelector(".workspace").getBoundingClientRect().width`);
const clipW = width + 28, clipH = clipW * H / W;
await metrics(Math.round(clipH + 86));
await wait(400);
await toWorkspace();
await wait(300);

const start = flag("terminat");
await click(start); await frame();
let from = await target(), to = from, since = -1;
await setScroll(from);
const box = await js(`(() => { const r = document.querySelector(".workspace").getBoundingClientRect(); return { x: r.left, y: r.top + scrollY }; })()`);
const clip = { x: box.x - 14, y: box.y - 14, width: clipW, height: clipH, scale: 1 };

const steps = [
  { at: 1.6, flag: flag("indemn") },
  { at: 4.2, flag: flag("guarantee") },
  { at: 6.8, flag: flag("red line") },
  { at: 9.4, flag: start },
];
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const frames = join(OUT, "frames");
rmSync(frames, { recursive: true, force: true });
mkdirSync(frames, { recursive: true });
const n = Math.round(SECONDS * FPS);
for (let k = 0; k < n; k++) {
  const t = k / FPS;
  if (steps.length && steps[0].at <= t) {
    await click(steps.shift().flag); await frame();
    to = await target(); since = t;
    await setScroll(from);
  }
  if (since >= 0) {
    const p = Math.min(1, (t - since) / SCROLL);
    await setScroll(from + (to - from) * ease(p));
    if (p >= 1) { from = to; since = -1; }
  }
  await frame();
  const { data } = await cdp("Page.captureScreenshot", { format: "png", clip });
  writeFileSync(join(frames, `f${String(k).padStart(4, "0")}.png`), Buffer.from(data, "base64"));
}
ws.close();
proc.kill();
if (errors.length) throw new Error(`page errors: ${errors.join("; ")}`);
console.log(`${n} frames in ${frames}`);

const ffmpeg = (args) => {
  const r = spawnSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: "inherit" });
  if (r.status !== 0) throw new Error("ffmpeg failed (is it on PATH?)");
};
const scale = `scale=${W}:${H}:flags=lanczos`;
ffmpeg(["-framerate", String(FPS), "-i", join(frames, "f%04d.png"), "-vf", `${scale},format=yuv420p`, "-c:v", "libx264", "-preset", "slow", "-crf", "28", "-tune", "stillimage", "-movflags", "+faststart", "-an", join(OUT, "loop-redline.mp4")]);
ffmpeg(["-i", join(frames, "f0000.png"), "-vf", scale, "-q:v", "5", join(OUT, "loop-redline-poster.jpg")]);
console.log(`wrote ${join(OUT, "loop-redline.mp4")} and its poster`);
