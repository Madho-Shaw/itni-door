/* Headless Edge through the DevTools protocol (no npm packages; Node 22 has WebSocket).
   node tools/edge.js shot <page> <out.png> [width=412] [height=900] [full] [present] [scale=1]
   node tools/edge.js pdf  <page> <out.pdf>          (A4, CSS @page size wins; prints the page count)
   <page> is a path under _site/ (e.g. one-pager/index.html) or a full URL. */
"use strict";
const { spawn } = require("child_process"), fs = require("fs"), path = require("path"), http = require("http"), os = require("os");
const ROOT = path.join(__dirname, "..");
const EDGE = ["C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Microsoft/Edge/Application/msedge.exe"].find(p => fs.existsSync(p));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const getJSON = (url, method) => new Promise((res, rej) => { const q = http.request(url, { method: method || "GET" }, r => { let b = ""; r.on("data", d => b += d); r.on("end", () => { try { res(JSON.parse(b)); } catch (e) { rej(e); } }); }); q.on("error", rej); q.end(); });

async function launch() {
  const prof = fs.mkdtempSync(path.join(os.tmpdir(), "eco463-site-"));
  const port = 9800 + Math.floor(Math.random() * 150);
  const edge = spawn(EDGE, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run", "--remote-debugging-port=" + port, "--user-data-dir=" + prof, "about:blank"], { stdio: "ignore" });
  let target = null;
  for (let i = 0; i < 60 && !target; i++) { await sleep(250); try { target = await getJSON(`http://127.0.0.1:${port}/json/new?about:blank`, "PUT"); } catch (e) { } }
  if (!target) { edge.kill(); throw new Error("Edge did not start"); }
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0; const waits = new Map(), errors = [];
  ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && waits.has(m.id)) { waits.get(m.id)(m); waits.delete(m.id); }
    if (m.method === "Runtime.exceptionThrown") errors.push(m.params.exceptionDetails.text + " " + ((m.params.exceptionDetails.exception || {}).description || ""));
    if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") errors.push("console.error " + m.params.args.map(a => a.value || a.description).join(" ")); };
  const send = (method, params) => new Promise((res, rej) => { const i = ++id;
    const t = setTimeout(() => { waits.delete(i); rej(new Error("timeout: " + method)); }, 30000);
    waits.set(i, m => { clearTimeout(t); m.error ? rej(new Error(method + ": " + m.error.message)) : res(m.result); }); ws.send(JSON.stringify({ id: i, method, params: params || {} })); });
  await send("Page.enable"); await send("Runtime.enable");
  const close = () => { try { ws.close(); } catch (e) { } try { edge.kill(); } catch (e) { } };
  return { send, close, errors };
}
function urlOf(p) {
  if (/^(https?|file):/.test(p)) return p;
  const [f, rest] = p.split(/(?=[?#])/);
  return "file:///" + path.join(ROOT, "_site", f).split(path.sep).join("/") + (rest || "");
}
async function open(E, page, w, h, mobile, scale) {
  await E.send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: scale || 1, mobile: !!mobile });
  await E.send("Page.navigate", { url: urlOf(page) });
  for (let i = 0; i < 60; i++) { await sleep(150); const r = await E.send("Runtime.evaluate", { expression: "document.readyState", returnByValue: true }); if (r.result.value === "complete") break; }
  await E.send("Runtime.evaluate", { expression: "document.fonts.ready.then(()=>1)", awaitPromise: true });
  await sleep(700);
}
async function shot(page, out, w, h, full, scale) {
  const E = await launch();
  try {
    await open(E, page, w, h, w < 768, scale);
    let clip;
    if (full) {
      const m = await E.send("Page.getLayoutMetrics");
      const ch = Math.ceil(m.cssContentSize.height), cw = Math.ceil(m.cssContentSize.width);
      clip = { x: 0, y: 0, width: Math.max(w, cw), height: Math.min(ch, 16000), scale: 1 };
      if (cw > w + 1) console.log("WARNING: page is wider than the viewport:", cw, ">", w);
    }
    const r = await E.send("Page.captureScreenshot", Object.assign({ format: "png" }, full ? { clip, captureBeyondViewport: true } : {}));
    fs.writeFileSync(out, Buffer.from(r.data, "base64"));
    const info = await E.send("Runtime.evaluate", { returnByValue: true, expression: `(() => {
      const small = [...document.querySelectorAll("body *")].filter(e => e.childNodes.length && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && e.offsetParent !== null)
        .map(e => [parseFloat(getComputedStyle(e).fontSize), e.tagName + "." + e.className + ": " + e.textContent.trim().slice(0, 30)]).filter(x => x[0] < ${w >= 1600 ? 28 : 14});
      return { wide: document.documentElement.scrollWidth, small: small.slice(0, 8), nSmall: small.length };
    })()` });
    console.log(out, "| scrollWidth", info.result.value.wide, "| text under floor:", info.result.value.nSmall, JSON.stringify(info.result.value.small));
    if (E.errors.length) console.log("PAGE ERRORS:", E.errors.join(" | "));
  } finally { E.close(); }
}
async function pdf(page, out) {
  const E = await launch();
  try {
    await open(E, page, 1240, 1754, false, 1);
    const r = await E.send("Page.printToPDF", { printBackground: true, preferCSSPageSize: true, paperWidth: 8.27, paperHeight: 11.69, marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0 });
    const buf = Buffer.from(r.data, "base64");
    fs.writeFileSync(out, buf);
    const pages = (buf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) || []).length;
    console.log(out, "| pages:", pages, "| bytes:", buf.length);
    if (E.errors.length) console.log("PAGE ERRORS:", E.errors.join(" | "));
    return pages;
  } finally { E.close(); }
}
module.exports = { shot, pdf, launch, open };
if (require.main === module) {
  const [cmd, page, out, ...rest] = process.argv.slice(2);
  const nums = rest.filter(x => /^\d+$/.test(x)).map(Number), full = rest.includes("full");
  const scale = Number((rest.find(x => /^scale=/.test(x)) || "scale=1").split("=")[1]);
  (cmd === "pdf" ? pdf(page, out).then(n => { if (n !== 1 && /one-pager/.test(page)) process.exitCode = 2; })
    : shot(page + (rest.includes("present") ? "#present" : ""), out, nums[0] || 412, nums[1] || 900, full, scale)).catch(e => { console.error(e); process.exit(1); });
}
