/* Static accessibility checks on every built page in _site/ (the parts a script can see; contrast is by the token table in
   tokens.css, touch size and text floor are checked by tools/edge.js shots). Run: node tools/a11y_check.js
   Checks: lang, title, one h1, one main, skip link on pages with a bar, no heading level skipped, unique ids, img alt,
   buttons/links with a name, svg with role=img has a label, fragment links point at an id, tables have a header row. */
"use strict";
const fs = require("fs"), path = require("path");
const OUT = path.join(__dirname, "../_site");
const pages = [];
(function walk(d) { fs.readdirSync(d, { withFileTypes: true }).forEach(e => { const p = path.join(d, e.name);
  if (e.isDirectory()) { if (!["play", "assets", "data", "og"].includes(e.name)) walk(p); } else if (/\.html$/.test(e.name)) pages.push(p); }); })(OUT);
pages.push(path.join(OUT, "play/index.html"));
let bad = 0;
const strip = h => h.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "").replace(/<!--[\s\S]*?-->/g, "");
pages.forEach(f => {
  const rel = path.relative(OUT, f), raw = fs.readFileSync(f, "utf8"), h = strip(raw), msg = [];
  if (!/<html[^>]*\slang="/.test(h)) msg.push("no lang");
  if (!/<title>[^<]+<\/title>/.test(h)) msg.push("no title");
  const h1 = (h.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1 && rel !== "play\\index.html" && rel !== "play/index.html") msg.push(h1 + " h1");
  const mains = (h.match(/<main[\s>]/g) || []).length; if (mains !== 1 && rel !== "404.html" || (rel === "404.html" && mains !== 1)) msg.push(mains + " main");
  if (/class="bar"/.test(h) && !/class="skip"/.test(h)) msg.push("no skip link");
  let last = 0; (h.match(/<h([1-6])[\s>]/g) || []).forEach(t => { const n = Number(t[2]); if (last && n > last + 1) msg.push("heading jumps h" + last + " to h" + n); last = n; });
  const ids = {}; (h.match(/\sid="([^"]+)"/g) || []).forEach(t => { const id = t.slice(5, -1); ids[id] = (ids[id] || 0) + 1; });
  Object.keys(ids).filter(k => ids[k] > 1).slice(0, 5).forEach(k => msg.push("duplicate id " + k));
  (h.match(/<img\b[^>]*>/g) || []).forEach(t => { if (!/\salt="/.test(t)) msg.push("img without alt"); });
  (h.match(/<button\b[^>]*>[\s\S]*?<\/button>/g) || []).forEach(t => { const txt = t.replace(/<[^>]+>/g, "").trim(); if (!txt && !/aria-label=/.test(t)) msg.push("button without a name"); });
  (h.match(/<a\b[^>]*>[\s\S]*?<\/a>/g) || []).forEach(t => { const txt = t.replace(/<[^>]+>/g, "").trim(); if (!txt && !/aria-label=/.test(t)) msg.push("link without a name: " + t.slice(0, 50)); });
  (h.match(/<svg\b[^>]*role="img"[^>]*>/g) || []).forEach(t => { if (!/aria-label=/.test(t) && !/aria-labelledby=/.test(t)) msg.push("svg role=img without a label"); });
  (h.match(/href="#([^"]+)"/g) || []).forEach(t => { const id = t.slice(7, -1); if (id && !ids[id]) msg.push("fragment link to missing id #" + id); });
  (h.match(/<table\b[\s\S]*?<\/table>/g) || []).forEach(t => { if (!/<th[\s>]/.test(t)) msg.push("table without header cells"); });
  if (msg.length) { bad++; console.log(rel + ": " + [...new Set(msg)].join("; ")); }
});
console.log(pages.length + " pages checked, " + bad + " with findings");
process.exit(bad ? 1 : 0);
