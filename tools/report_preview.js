/* Local preview of the Quarto pages without Quarto: renders report/index.qmd and the evidence qmd pages into _site/
   with markdown-it, so the design can be checked before Quarto is installed (Quarto does the real build in CI).
   Handles what our pages use: front matter, {{< var key >}}, ::: {.class} divs, [text]{.class} spans, table captions
   ": caption {#tbl-id}", {#id .unnumbered} headings with section numbers, @sec-/@tbl- references, footnotes, math (MathML).
   Then runs `node tools/build.js --post`, which adds the top bar, footer, numbers and figures exactly as it does for
   Quarto output. Run: node tools/report_preview.js   (after node tools/build.js) */
"use strict";
const fs = require("fs"), path = require("path"), cp = require("child_process");
const yaml = require("js-yaml"), katex = require("katex");
const { load, resolve, ROOT } = require("./numfmt");
const D = load();
const md = require("markdown-it")({ html: true, typographer: false })
  .use(require("markdown-it-attrs")).use(require("markdown-it-footnote"));
const OUT = path.join(ROOT, "_site");
const log = [];
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const parts = n => fs.readFileSync(path.join(ROOT, "report/_parts", n), "utf8");

function attrs(s) {
  const cls = [], other = []; let id = "";
  (s.match(/[.#][\w-]+|[\w-]+="[^"]*"/g) || []).forEach(t => {
    if (t[0] === ".") cls.push(t.slice(1)); else if (t[0] === "#") id = t.slice(1); else other.push(t);
  });
  return (id ? ` id="${id}"` : "") + (cls.length ? ` class="${cls.join(" ")}"` : "") + (other.length ? " " + other.join(" ") : "");
}

function renderQmd(file) {
  let src = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const fm = src.match(/^---\n([\s\S]*?)\n---\n/);
  const meta = fm ? yaml.load(fm[1]) : {};
  if (fm) src = src.slice(fm[0].length);
  src = src.replace(/<!--[\s\S]*?-->/g, "");
  src = src.replace(/\{\{<\s*var\s+([\w.]+)\s*>\}\}/g, (m, k) => { const v = resolve(D, k); if (v === undefined) { log.push("unknown var " + k + " in " + path.relative(ROOT, file)); return m; } return v; });
  // math out, back in after markdown
  const maths = [];
  src = src.replace(/\$\$([\s\S]+?)\$\$/g, (m, t) => { maths.push([t, true]); return "@@MATH" + (maths.length - 1) + "@@"; });
  src = src.replace(/\$([^$\n]+?)\$/g, (m, t) => { maths.push([t, false]); return "@@MATH" + (maths.length - 1) + "@@"; });
  // spans
  src = src.replace(/\[([^\]\n]+)\]\{\.([\w-]+)\}/g, '<span class="$2">$1</span>');
  // divs and table captions
  const out = [], lines = src.split("\n"); const tblNum = {}; let nt = 0, inTable = false;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i], op = l.match(/^:{3,}\s*\{([^}]*)\}\s*$/);
    if (op) { out.push("", `<div${attrs(op[1])}>`, ""); continue; }
    if (/^:{3,}\s*$/.test(l)) { out.push("", "</div>", ""); continue; }
    if (/^\|/.test(l)) { inTable = true; out.push(l); continue; }
    const cap = inTable && l.match(/^:\s+(.*?)\s*(\{([^}]*)\})?\s*$/);
    if (cap) {
      const idm = cap[3] && cap[3].match(/#(tbl-[\w-]+)/), n = ++nt; if (idm) tblNum[idm[1]] = n;
      const cls = (cap[3] || "").match(/\.([\w-]+)/g) || [];
      out.push("", `<p class="tbl-cap ${cls.map(c => c.slice(1)).join(" ")}"${idm ? ` id="${idm[1]}"` : ""}><b>Table ${n}.</b> ${cap[1]}</p>`, ""); inTable = false; continue;
    }
    if (l.trim() !== "") inTable = false;
    out.push(l);
  }
  let html = md.render(out.join("\n"));
  html = html.replace(/@@MATH(\d+)@@/g, (m, i) => { try { return katex.renderToString(maths[i][0], { displayMode: maths[i][1], output: "mathml", throwOnError: true }); } catch (e) { log.push("math failed: " + maths[i][0].slice(0, 40)); return esc(maths[i][0]); } });
  html = html.replace(/<table>/g, '<div class="tbl"><table>').replace(/<\/table>/g, "</table></div>");
  // section numbers
  const num = {}, toc = []; let h1 = 0, h2 = 0;
  html = html.replace(/<h([12])([^>]*)>([\s\S]*?)<\/h\1>/g, (m, lv, a, t) => {
    const id = (a.match(/id="([^"]+)"/) || [])[1] || t.replace(/<[^>]+>/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const un = /unnumbered/.test(a); let label = "";
    if (!un) { if (lv === "1") { h1++; h2 = 0; label = String(h1); } else { h2++; label = h1 + "." + h2; } num[id] = label; }
    if (lv === "1") toc.push([id, (label ? label + " " : "") + t.replace(/<[^>]+>/g, "")]);
    return `<h${lv} id="${id}"${a.replace(/\sid="[^"]+"/, "")}>${label ? `<span class="secnum">${label}</span>` : ""}${t}</h${lv}>`;
  });
  // like Quarto's HTML: the title is the only h1, so sections become h2 and subsections h3
  html = html.replace(/<(\/?)h2([ >])/g, "<$1h3$2").replace(/<(\/?)h1([ >])/g, "<$1h2$2");
  html = html.replace(/@((?:sec|tbl)-[\w-]+)/g, (m, id) => {
    if (id.startsWith("tbl-") && tblNum[id]) return `<a href="#${id}">Table ${tblNum[id]}</a>`;
    if (num[id]) return `<a href="#${id}">Section ${num[id]}</a>`;
    log.push("unresolved reference " + m + " in " + path.relative(ROOT, file)); return m;
  });
  return { meta, html, toc };
}

function page(file) {
  const rel = path.relative(ROOT, file), dir = path.dirname(rel), door = dir === "report" ? "report" : "evidence";
  const { meta, html, toc } = renderQmd(file);
  const authors = (meta.author || []).map(a => a.name || a).join(", ");
  const abs = meta.abstract ? `<div class="takeaway"><b>Abstract.</b> ${md.renderInline(String(meta.abstract).replace(/\n/g, " "))}</div>` : "";
  const lis = toc.map(([id, t]) => `<li><a href="#${id}">${t}</a></li>`).join("");
  const tocHtml = toc.length > 2 ? `<div class="toc"><details class="toc-m"><summary>On this page</summary><ul>${lis}</ul></details><nav class="toc-d" aria-label="On this page"><h2>On this page</h2><ul>${lis}</ul></nav></div>` : "";
  const doc = `<!DOCTYPE html>
<html lang="en-IN"><head><meta charset="utf-8"><title>${esc(meta.title)}${meta.title.startsWith("Itni") ? "" : ": Itni Door? (ECO463, Group 7)"}</title>
${parts("head.html")}</head>
<body>
${parts("before.html").replace(/bar:report/, "bar:" + door)}<main id="main" class="rpt${tocHtml ? " has-toc" : ""}">
${tocHtml}<article>
<header class="title"><h1>${esc(meta.title)}</h1>${meta.subtitle ? `<p class="subtitle">${esc(meta.subtitle)}</p>` : ""}<p class="by">${esc(authors)}${meta.date ? " &middot; " + esc(meta.date) : ""}</p></header>
${abs}
${html}
</article></main>
${parts("after.html")}</body></html>`;
  const dest = path.join(OUT, dir, "index.html");
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, doc);
  return rel;
}

const files = ["report/index.qmd", "evidence/data/index.qmd", "evidence/tests/index.qmd", "evidence/model/index.qmd", "evidence/sources/index.qmd"]
  .map(f => path.join(ROOT, f)).filter(f => fs.existsSync(f));
if (!fs.existsSync(OUT)) { console.error("run node tools/build.js first"); process.exit(1); }
const done = files.map(page);
console.log("preview rendered:", done.join(", "));
log.forEach(l => console.log("  " + l));
cp.execFileSync(process.execPath, [path.join(__dirname, "build.js"), "--post"], { stdio: "inherit" });
if (log.some(l => /unknown var/.test(l))) process.exit(1);
