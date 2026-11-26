/* Build the hand-built part of the site into _site/.
   - copies site/ and data/ (model_v2.js, evidence.js, the public CSVs)
   - fills the shared top bar and footer (<!--#bar:door--> <!--#foot-->), {{root}} and {{site.*}}
   - fills every data-v number from data/model_v2.json, evidence.json or _variables.yml (tools/numfmt.js)
   - pre-renders every data-fig figure (site/assets/figs/figs.js), so pages work with no JS and in print
   - inlines <link data-inline> CSS (the hub's first paint needs no second request)
   - puts the one-pager copy from content/one_pager_text.md into the one-pager when that file exists
   - QR codes from content/site.yml url (<!--#qr:path-->)
   Run: node tools/build.js [--clean]. In CI Quarto renders report/ and evidence/ into _site first; this runs after. */
"use strict";
const fs = require("fs"), path = require("path");
const yaml = require("js-yaml"), QR = require("qrcode");
const { load, resolve, fmt, ROOT } = require("./numfmt");
const FIGS = require(path.join(ROOT, "site/assets/figs/figs.js"));
const SRC = path.join(ROOT, "site"), OUT = path.join(ROOT, "_site");
const SITE = yaml.load(fs.readFileSync(path.join(ROOT, "content/site.yml"), "utf8"));
const D = load();
global.window = globalThis;
const rlPath = path.join(SRC, "play/content/rl_content.js");
if (fs.existsSync(rlPath)) require(rlPath);
const ctx = { M: D.model, E: D.ev, RL: globalThis.ITNI && globalThis.ITNI.rl, fs: 17 };
const log = [];

const POST = process.argv.includes("--post");
if (process.argv.includes("--clean") && fs.existsSync(OUT)) fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

function copyDir(a, b, filter) {
  fs.mkdirSync(b, { recursive: true });
  fs.readdirSync(a, { withFileTypes: true }).forEach(e => {
    const s = path.join(a, e.name), d = path.join(b, e.name);
    if (filter && !filter(s, e)) return;
    if (e.isDirectory()) copyDir(s, d, filter); else fs.copyFileSync(s, d);
  });
}
copyDir(SRC, OUT, s => !/\.html$/.test(s));
if (!POST) copyDir(path.join(ROOT, "data"), path.join(OUT, "data"), s => !/source|evidence_variables/.test(s));
// GSAP core for the hub intro, self-hosted from npm (nothing loads from another site); fetched only when the intro plays
fs.mkdirSync(path.join(OUT, "assets/vendor"), { recursive: true });
fs.copyFileSync(path.join(ROOT, "node_modules/gsap/dist/gsap.min.js"), path.join(OUT, "assets/vendor/gsap.min.js"));
if (!POST) fs.writeFileSync(path.join(OUT, ".nojekyll"), "");

/* ---------------------------------------------------------------- shared parts */
const DOORS = [["watch", "Watch", "watch/"], ["one-pager", "One page", "one-pager/"], ["play", "Play", "play/"],
  ["report", "Report", "report/"], ["evidence", "Evidence", "evidence/"], ["diary", "Diary", "how-we-built-it/"]];
// the same doors with Home first, for the phone menu and the footer; "next" walks them in this order and back to Home
const ALL = [["hub", "Home", ""]].concat(DOORS);
const NEXT = { hub: "watch", watch: "one-pager", "one-pager": "play", play: "report", report: "evidence", evidence: "diary", diary: "hub" };
const doorLinks = (door, root, list) => list.map(([k, label, href]) =>
  `<li><a href="${root}${href || (root ? "" : "./")}"${k === door ? ' aria-current="page"' : ""}>${label}</a></li>`).join("\n");
function bar(door, root) {
  return `<a class="skip" href="#main">Skip to the content</a>
<header class="bar"><div class="wrap">
<a class="brand" href="${root || "./"}">Itni Door?</a>
<nav class="doors doors-wide" aria-label="Doors"><ul>
${DOORS.map(([k, label, href]) => `<li><a href="${root}${href}"${k === door ? ' aria-current="page"' : ""}>${label}</a></li>`).join("\n")}
</ul></nav>
<details class="doors doors-phone"><summary>Doors</summary><nav aria-label="Doors (menu)"><ul>
${doorLinks(door, root, ALL)}
</ul></nav></details>
</div></header>
<div class="navload" aria-hidden="true"></div>
${NAV_SPEED}`;
}
/* Page-to-page speed. Edge/Chrome prerender a page when the pointer rests on its link (speculation rules), so most
   clicks open at once; other browsers get a prefetch on hover or touch. If a page still takes time, a red-pen line
   runs across the top and the old page dims, so a click never looks dead. pageshow clears it on Back.
   The last script sets down desk cards that start below the fold as they scroll into view (site.css, .desk-wait/.desk-in). */
const NAV_SPEED = `<script type="speculationrules">{"prerender":[{"where":{"and":[{"href_matches":"/itni-door/*"},{"not":{"selector_matches":"[download], [target=_blank], [href$='.pdf'], [href$='.mp4'], [href$='.csv']"}}]},"eagerness":"moderate"}]}</script>
<script>(function(){var d=document.documentElement,seen={};function link(e){var a=e.target.closest&&e.target.closest("a[href]");if(!a||a.hasAttribute("download")||(a.target&&a.target!=="_self"))return null;var u=new URL(a.href,location.href);if(u.origin!==location.origin||/\\.(pdf|mp4|csv|zip)$/i.test(u.pathname))return null;if(u.pathname===location.pathname&&u.search===location.search)return null;return u}
document.addEventListener("click",function(e){if(e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;if(link(e))d.classList.add("navgo")});
addEventListener("pageshow",function(){d.classList.remove("navgo")});
function pf(e){var u=link(e);if(!u||seen[u.pathname])return;seen[u.pathname]=1;var l=document.createElement("link");l.rel="prefetch";l.href=u.pathname;document.head.appendChild(l)}
document.addEventListener("pointerover",pf,{passive:true});document.addEventListener("touchstart",pf,{passive:true});
try{localStorage.setItem("itni-visit",Date.now())}catch(e){}
var y=scrollY,q=0;addEventListener("scroll",function(){if(q)return;q=requestAnimationFrame(function(){q=0;var n=scrollY,b=document.querySelector("header.bar"),o=b&&b.querySelector("details[open]");
if(n<120||n<y-8||o)d.classList.remove("bar-away");else if(n>y+8)d.classList.add("bar-away");y=n})},{passive:true})})();</script>
<script>(function(){var d=document.documentElement;if(d.classList.contains("present")||!window.matchMedia||matchMedia("(prefers-reduced-motion: reduce)").matches)return;
var w=[],q=0;function check(){q=0;var vh=innerHeight;w=w.filter(function(el){if(el.getBoundingClientRect().top>vh*.94)return true;el.classList.replace("desk-wait","desk-in");return false});if(!w.length)removeEventListener("scroll",tick)}
function tick(){if(!q)q=requestAnimationFrame(check)}
function go(){var vh=innerHeight;[].forEach.call(document.querySelectorAll(".doors-list > li, .rooms > li"),function(el){var r=el.getBoundingClientRect();if(r.height&&r.top>vh){el.style.setProperty("--k",[].indexOf.call(el.parentNode.children,el)%3);el.classList.add("desk-wait");w.push(el)}});if(w.length){addEventListener("scroll",tick,{passive:true});addEventListener("resize",tick)}}
document.readyState==="loading"?addEventListener("DOMContentLoaded",go):go()})();</script>`;
function foot(root, door) {
  const d = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const nx = ALL.find(x => x[0] === NEXT[door]);
  const nextLink = nx ? `<a class="foot-next" href="${root}${nx[2] || (root ? "" : "./")}">Next: ${nx[0] === "hub" ? "back to the start" : nx[1]}</a>` : "";
  return `<nav class="foot-doors" aria-label="Doors (footer)"><div class="wrap">
<ul>${doorLinks(door, root, ALL)}</ul>${nextLink}
</div></nav>
<footer class="foot"><div class="wrap">
<p><b>${SITE.group}, ${SITE.course.split(" Gender")[0]}</b><br>${SITE.members.join(", ")}<br>${SITE.month}</p>
<p><a href="${root}report/#sec-who">Who did what</a><br><a href="${root}credits/">Credits: fonts, data, tools</a><br><a href="${root}talk/">The talk (projector)</a></p>
<p>Last built ${d}.<br>No cookies, no tracking. Nothing loads from another site until you press play on a video.</p>
</div></footer>`;
}

/* ---------------------------------------------------------------- Quarto pages: reading layout
   Quarto (theme: none) writes the title block, the contents and the text straight into <body>. This wraps them in the
   site's reading layout: .wrap.rpt grid = sticky contents column (wide screens) + <main id="main" class="article">.
   It adds a "On this page" sheet for phones (a copy of the contents, ids removed) and copies each footnote into a
   margin note next to its marker (shown from 1110 px; aria-hidden, because the numbered note at the end stays the real one).
   Layout markup only: no words are changed. Runs once per Quarto render (skips a page it already wrapped). */
function quartoLayout(html, rel) {
  if (/class="wrap rpt/.test(html) || !/<header id="title-block-header">/.test(html)) return html;
  const barAt = html.indexOf('<header class="bar">');
  if (barAt < 0) return html;
  const fd = html.indexOf('<nav class="foot-doors"');
  const start = html.indexOf("</header>", barAt) + "</header>".length, end = fd >= 0 ? fd : html.indexOf('<footer class="foot">');
  if (end < start) return html;
  let body = html.slice(start, end), toc = "";
  body = body.replace(/<nav id="TOC"[\s\S]*?<\/nav>\s*/, m => { toc = m; return ""; });
  if ((toc.match(/<a href=/g) || []).length < 3) toc = "";   // a one- or two-line contents list is noise
  // margin copies of the footnotes
  const notes = {};
  body.replace(/<li id="(fn\d+)"><p>([\s\S]*?)<\/p><\/li>/g, (m, id, t) => { notes[id] = t; return m; });
  body = body.replace(/(<a href="#(fn\d+)" class="footnote-ref"[^>]*><sup>(\d+)<\/sup><\/a>)/g, (m, ref, id, n) => !notes[id] ? m :
    ref + '<span class="sidenote" aria-hidden="true"><sup>' + n + "</sup> " +
    notes[id].replace(/<a [^>]*class="footnote-back"[\s\S]*?<\/a>/, "").replace(/<\/?a\b[^>]*>/g, "").trim() + "</span>");
  // a table without a caption sits straight in the text: give it the same sideways-scroll box as Quarto's captioned ones
  body = body.replace(/(<div aria-describedby="[^"]*">\s*)?(<table\b[\s\S]*?<\/table>)/g, (m, pre, t) => pre ? m : '<div class="tbl">' + t + "</div>");
  // Quarto gives every column of a pipe table the same width (<colgroup>, 33% / 33% / 33%); without it the browser sizes
  // columns by their content, so a column of lecture codes or two-digit numbers stays narrow and the text gets the room
  body = body.replace(/<colgroup>[\s\S]*?<\/colgroup>\s*/g, "");
  // the report's choice-set table ("Option (name in our tables) | Son | Daughter | In words") becomes the railway line
  body = body.replace(/<table\b[^>]*>[\s\S]*?<\/table>/g, t => /^Option \(name/.test(stripTags((tableRows(t)[0] || [])[0] || "")) ? RAIL_FIG : t);
  // authors and date read as one line ("A, B, C · November 2026"): drop the whitespace between their <p>s
  body = body.replace(/<\/p>\s*(<p class="(?:author|date)")/g, "</p>$1");
  // the report's PDF (Quarto's Typst render, next to the page): a stamp under the byline and a line at the foot of the contents
  const pdf = /^report[\\/]index\.html$/.test(rel) && path.join(OUT, "report", "index.pdf");
  if (pdf && fs.existsSync(pdf)) {
    const n = Math.max(0, ...(fs.readFileSync(pdf).toString("latin1").match(/\/Count \d+/g) || []).map(c => +c.slice(7)));
    const pages = n ? ", " + n + " pages" : "";
    body = body.replace(/(<p class="date">[\s\S]*?<\/p>)/, '$1\n<p class="pdf-line"><a class="stamp" href="index.pdf">Report PDF · A4' + pages.replace(", ", " · ") + "</a></p>");
    if (toc) toc = toc.replace(/<\/ul>\s*<\/nav>\s*$/, '</ul>\n<p class="toc-pdf"><a href="index.pdf">The report as a PDF (A4' + pages + ")</a></p>\n</nav>\n");
  }
  let phoneToc = "";
  if (toc) {
    const list = (toc.match(/<ul>[\s\S]*<\/ul>/) || [""])[0].replace(/\sid="toc-[^"]*"/g, "");
    phoneToc = '<details class="toc-m"><summary>On this page</summary><nav aria-label="On this page (menu)">' + list + "</nav></details>\n";
    toc = toc.replace('<nav id="TOC"', '<nav id="TOC" class="toc-d"');
  }
  body = body.replace(/(<header id="title-block-header">[\s\S]*?<\/header>\s*)/, "$1" + phoneToc);
  // the evidence pages get the same way back as the hand-built ones (RTI, Figures)
  if (/^evidence[\\/]/.test(rel)) {
    const t = (body.match(/<h1 class="title">([\s\S]*?)<\/h1>/) || [, ""])[1].replace(/<[^>]+>/g, "").trim();
    body = '<p class="small crumb"><a href="../">Evidence room</a> / ' + t + "</p>\n" + body;
  }
  return html.slice(0, start) + '\n<div class="wrap rpt' + (toc ? " has-toc" : "") + '">\n' + toc +
    '<main id="main" class="article">\n' + body + "</main>\n</div>\n" + html.slice(end);
}

/* ---------------------------------------------------------------- model pieces (one-pager and report)
   The four-options table becomes the railway line and the value / money / worry table becomes the family's hisaab;
   both are figures in site/assets/figs/figs.js (rail, bill), so they are drawn from the model data. */
const OPT_KEY = { "both stay": "near", "together": "together", "best seats": "split", "only he goes": "son_only" };
const stripTags = s => String(s).replace(/<[^>]+>/g, "").trim();
const RAIL_FIG = `<div class="rail-fig" data-fig="rail" data-w="480" data-args='{"fam":"village"}'></div>`;
const BILL_FIG = `<div class="bill-fig" data-fig="bill" data-w="420" data-args='{"fam":"village","opt":"SPLIT"}'></div>`;
function tableRows(t) {   // [[cells of header], [cells of row 1], ...] as inner HTML
  return (t.match(/<tr[\s\S]*?<\/tr>/g) || []).map(r => (r.match(/<t[hd][^>]*>[\s\S]*?<\/t[hd]>/g) || []).map(c => c.replace(/^<t[hd][^>]*>|<\/t[hd]>$/g, "").trim()));
}
/* a markdown table that is one of the model pieces becomes cards; anything else gets the sideways-scroll box */
function cardifyTable(t) {
  const rows = tableRows(t), head = (rows[0] || []).map(c => stripTags(c).toLowerCase());
  // the four options become the railway line, the value / money / worry blocks become the family's hisaab (figs.js rail, bill)
  if (head.length === 4 && head.every(h => OPT_KEY[h]) && rows.length === 2) return RAIL_FIG;
  if (/^block/.test(head[0] || "") && /formula/.test(head[1] || "")) return BILL_FIG;
  return '<div class="scroll-x">' + t + "</div>";
}

/* ---------------------------------------------------------------- one-pager copy */
function onePagerCopy() {
  const p = path.join(ROOT, "content/one_pager_text.md");
  if (!fs.existsSync(p)) return null;
  const md = require("markdown-it")({ html: false, typographer: false });
  let txt = fs.readFileSync(p, "utf8").replace(/^---[\s\S]*?\n---\n/, "");
  txt = txt.replace(/\{\{<\s*var\s+([\w.]+)\s*>\}\}/g, (m, k) => { const v = resolve(D, k); if (v === undefined) log.push("one-pager: unknown var " + k); return v === undefined ? m : v; });
  const parts = {}; let cur = "_intro";
  txt.split(/\r?\n/).forEach(l => {
    const h = l.match(/^##\s+(.*)/);
    if (h) { cur = h[1].trim(); parts[cur] = ""; return; }
    parts[cur] = (parts[cur] || "") + l + "\n";
  });
  const KEYS = { gap: /gap|question/i, textbook: /standard|textbook|becker|theory/i, model: /our model|model/i, worked: /worked|shalini|family/i,
    results: /out of 100|result/i, predict: /predict/i, fixes: /fix|policy/i, limits: /limit|assum|break/i, refs: /reference|source/i };
  const out = {};
  Object.keys(parts).forEach(h => {
    const k = Object.keys(KEYS).find(k => !out[k] && KEYS[k].test(h));
    if (k) out[k] = md.render(parts[h].trim()).replace(/<table>[\s\S]*?<\/table>/g, cardifyTable)
      .replace(/<p>Score = value − money − worry[\s\S]*?(The son has no escort and no worry term\.)?<\/p>/, (m, son) => son ? '<p class="bill-after">' + son + "</p>" : ""); else if (h !== "_intro") log.push("one-pager: section not placed: " + h);
  });
  return out;
}
const OPC = onePagerCopy();

/* ---------------------------------------------------------------- per page */
const wordsReport = (() => { const p = path.join(ROOT, "report/index.qmd"); if (!fs.existsSync(p)) return 0;
  return fs.readFileSync(p, "utf8").replace(/```[\s\S]*?```/g, "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length; })();
const readMin = wordsReport ? Math.max(1, Math.round(wordsReport / 200)) : null;

async function page(file, base) {
  const rel = path.relative(base || SRC, file), depth = rel.split(path.sep).length - 1, root = depth ? "../".repeat(depth) : "";
  let html = fs.readFileSync(file, "utf8");
  // the Quarto pages all share report/_parts/before.html (bar:report); the evidence pages belong to the Evidence door
  const mb = html.match(/<!--#bar:([\w-]+)-->/), door = mb ? (base && /^evidence/.test(rel) ? "evidence" : mb[1]) : null;
  html = html.replace(/<!--#bar:([\w-]+)-->/g, () => bar(door, root)).replace(/<!--#foot-->/g, () => foot(root, door));
  if (base) html = quartoLayout(html, rel);
  html = html.replace(/\{\{root\}\}/g, root);
  html = html.replace(/\{\{site\.([\w.]+)\}\}/g, (m, k) => { const v = k.split(".").reduce((o, x) => o && o[x], SITE); return v == null ? "" : String(v); });
  html = html.replace(/\{\{report\.minutes\}\}/g, readMin ? `about ${readMin} min` : "about 30 min");
  // watch page parts: video player, chapters, script
  const esc = x => String(x).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const mmss = t => Math.floor(t / 60) + ":" + String(t % 60).padStart(2, "0");
  html = html.replace(/<!--#video-->/g, () => {
    const V = SITE.video, local = !!videoSource();
    const label = "";
    let player;
    // YouTube player loads with the page but never autoplays; a cover says how to start it and hides once it plays.
    // What the cover says depends on the device: keys for a mouse and keyboard, "tap" for a touch screen (CSS: pointer).
    // two versions on YouTube (class_id set): a Full / Short switch above the player; Full is the default (?v=short opens the short one)
    const secs = s => s.split(":").reduce((a, x) => a * 60 + Number(x), 0);
    const fast = s => Math.round(secs(s) / 1.5 / 60);
    const pick = V.master_id && V.class_id ? '<div class="cutpick" role="group" aria-label="Which version"><span class="lbl">Version</span>' +
      '<button type="button" data-cut="full" data-id="' + esc(V.master_id) + '" data-len="' + esc(V.master_len) + '" data-fast="' + fast(V.master_len) + '" aria-pressed="true">Full video<small>' + esc(V.master_len) + '</small></button>' +
      '<button type="button" data-cut="short" data-id="' + esc(V.class_id) + '" data-len="' + esc(V.class_len) + '" data-fast="' + fast(V.class_len) + '" aria-pressed="false">Short video<small>' + esc(V.class_len) + '</small></button></div>' : "";
    if (V.master_id) player = pick + '<div class="player yt" data-yt="' + esc(V.master_id) + '"><div id="yt-frame"></div>' +
      '<button type="button" class="yt-cover" aria-label="Play the video">' +
        '<span class="go"><span class="tri" aria-hidden="true"></span><span class="on-key">Press <kbd>Space</kbd> or click to play</span><span class="on-touch">Tap to play</span></span>' +
        '<span class="tip">We suggest <b>1.5&times;</b>: still clear, and <span class="len">' + esc(V.master_len || "14:44") + '</span> becomes about <span class="fast">' + fast(V.master_len || "14:44") + '</span> minutes.</span>' +
        '<span class="keys on-key"><kbd>Space</kbd> play / pause &middot; <kbd>Shift</kbd>+<kbd>&gt;</kbd> faster &middot; <kbd>Shift</kbd>+<kbd>&lt;</kbd> slower &middot; <kbd>&larr;</kbd> <kbd>&rarr;</kbd> 5 seconds &middot; <kbd>F</kbd> full screen</span>' +
      '</button></div>' +
      '<div class="speed" role="group" aria-label="Playback speed"><span class="lbl">Speed</span>' +
      [1, 1.25, 1.5, 1.75, 2].map(r => '<button type="button" data-rate="' + r + '" aria-pressed="' + (r === 1) + '">' + r + '&times;' + (r === 1.5 ? '<small>suggested</small>' : '') + '</button>').join("") +
      '</div>';
    else if (local) player = '<video class="player" controls preload="none" playsinline' + (fs.existsSync(path.join(SRC, V.poster || "x")) ? ' poster="' + root + V.poster + '"' : "") + '><source src="media/video.mp4" type="video/mp4">Your browser cannot play this file. The script is below.</video>' +
      '<div class="speed" role="group" aria-label="Playback speed"><span class="lbl">Speed</span>' +
      [1, 1.25, 1.5, 1.75, 2].map(r => '<button type="button" data-rate="' + r + '" aria-pressed="' + (r === 1) + '">' + r + '&times;' + (r === 1.5 ? '<small>suggested</small>' : '') + '</button>').join("") +
      '</div>';
    else player = '<div class="player none"><p><b>The video is not on this copy yet.</b> The full script is below and the game and report work without it.</p></div>';
    return label + player;
  });
  const chList = (list, cut, hide) => '<ol class="chapters" data-for="' + cut + '"' + (hide ? " hidden" : "") + '>' + (list || []).map(c =>
    '<li><button type="button" data-t="' + c.t + '"><span class="t">' + mmss(c.t) + "</span> " + esc(c.title) + "</button></li>").join("") + "</ol>";
  html = html.replace(/<!--#chapters-->/g, () => chList(SITE.video.chapters, "full", false) +
    (SITE.video.master_id && SITE.video.class_id ? chList(SITE.video.class_chapters, "short", true) : ""));
  html = html.replace(/<!--#script-->/g, () => {
    const p = path.join(ROOT, "content/video_script.json");
    if (!fs.existsSync(p)) return "<p>The script file is missing.</p>";
    return JSON.parse(fs.readFileSync(p, "utf8")).map(a => "<h3>" + esc(a.name) + "</h3>" + a.lines.map(l =>
      '<p class="sl"><b>' + esc(l.role.charAt(0) + l.role.slice(1).toLowerCase()) + "</b> " + esc(l.text) + (l.en ? ' <span class="en">(' + esc(l.en) + ")</span>" : "") + "</p>").join("")).join("");
  });
  // CSS inline
  html = html.replace(/<link rel="stylesheet" href="([^"]+)" data-inline>/g, (m, href) =>
    "<style>" + fs.readFileSync(path.join(path.dirname(file), href), "utf8").replace(/url\("(fonts|img)\//g, `url("${root}assets/$1/`).replace(/\/\*[\s\S]*?\*\//g, "").replace(/\n\s*/g, "\n") + "</style>");
  // numbers
  html = html.replace(/<([a-z0-9]+)([^>]*?)\sdata-v="([^"]+)"([^>]*)>([^<]*)<\/\1>/g, (m, tag, a1, key, a2) => {
    const f = ((a1 + a2).match(/data-f="([^"]*)"/) || [])[1], v = fmt(resolve(D, key), f);
    if (v === undefined) { log.push("UNKNOWN number key " + key + " in " + rel); return m; }
    return `<${tag}${a1} data-v="${key}"${a2}>${v}</${tag}>`;
  });
  // figure slots in the Quarto report: the slot holds the table as written; the figure replaces it
  const SLOT = { F1: "F1", F7: "ladder", F12: "ledger", F14: "grids", F17: "fixes", scale: "scale" };
  html = html.replace(/<div class="fig-slot"\s+data-fig="([^"]+)">([\s\S]*?)<\/div>/g, (m, id, inner) => SLOT[id]
    ? '<div class="fig-slot" data-slot="' + id + '"><div data-fig="' + SLOT[id] + '" data-w="640"></div>' + (/^\s*(<div[^>]*>\s*)?<table/.test(inner) ? "" : inner) + "</div>" : m.replace('data-fig="', 'data-slot="'));
  // one-pager copy (before the figures: the copy can hold figures, the railway line and the bill)
  if (OPC) html = html.replace(/<div class="copy" data-copy="(\w+)">[\s\S]*?<\/div><!--\/copy-->/g, (m, k) =>
    OPC[k] ? `<div class="copy" data-copy="${k}" data-from="content/one_pager_text.md">${OPC[k]}</div><!--/copy-->` : m);
  // figures
  html = html.replace(/<div([^>]*?)\sdata-fig="([^"]+)"([^>]*)><\/div>/g, (m, a1, name, a2) => {
    const at = a1 + a2, args = ((at.match(/data-args='([^']*)'/) || [])[1]) || "{}", w = Number((at.match(/data-w="(\d+)"/) || [])[1] || 640);
    try { return `<div${a1} data-fig="${name}"${a2}>${FIGS.render(name, JSON.parse(args), ctx, w)}</div>`; }
    catch (e) { log.push("FIGURE " + name + " failed in " + rel + ": " + e.message); return m; }
  });
  // QR codes
  const qrs = [...html.matchAll(/<!--#qr:([^>]*?)-->/g)];
  for (const q of qrs) {
    const target = SITE.url + q[1].replace(/^\//, "");
    const s = await QR.toString(target, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#2B2118", light: "#0000" } });
    html = html.replace(q[0], s.replace("<svg ", `<svg role="img" aria-label="QR code for ${target}" `) +
      `<span class="qr-url">${target.replace(/^https:\/\//, "")}</span>` + (SITE.url_confirmed ? "" : `<span class="qr-draft">draft address, not final</span>`));
  }
  const dest = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, html);
}

/* ---------------------------------------------------------------- the video copy
   First existing file in site.yml video.local. On GitHub (CI) only files inside the repo count
   (media/itni_door_v3.mp4, the web copy of the v3 explainer); the full-size renders in ../eco463-media stay local. */
function videoSource() {
  return (SITE.video.local || []).map(p => path.resolve(ROOT, p))
    .filter(p => !process.env.CI || !path.relative(ROOT, p).startsWith(".."))
    .find(p => fs.existsSync(p));
}
function video() {
  const f = videoSource();
  if (!f) { log.push("video: no local file found"); return; }
  const d = path.join(OUT, "watch/media");
  fs.mkdirSync(d, { recursive: true });
  fs.copyFileSync(f, path.join(d, "video.mp4"));
  log.push("video: local copy from " + path.relative(ROOT, f));
}

(async () => {
  const pages = [];
  (function walk(d) { fs.readdirSync(d, { withFileTypes: true }).forEach(e => { const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p); else if (/\.html$/.test(e.name)) pages.push(p); }); })(SRC);
  if (!POST) for (const p of pages) await page(p);
  // pages rendered by Quarto (report, evidence data/tests/model/sources) get the same bar, footer, numbers and figures
  const QPAGES = ["report/index.html", "evidence/data/index.html", "evidence/tests/index.html", "evidence/model/index.html", "evidence/sources/index.html"];
  let nq = 0;
  for (const q of QPAGES) { const f = path.join(OUT, q); if (fs.existsSync(f)) { await page(f, OUT); nq++; } }
  if (nq) log.push("quarto pages post-processed: " + nq);
  if (!POST) video();
  console.log("built", pages.length, "pages into _site/" + (OPC ? " (one-pager copy from content/one_pager_text.md)" : " (one-pager placeholder copy)"));
  log.forEach(l => console.log("  " + l));
  if (log.some(l => /UNKNOWN|FIGURE/.test(l))) process.exit(1);
})();
