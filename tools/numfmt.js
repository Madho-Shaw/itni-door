/* One resolver + formatter for every number placed in a page.
   In HTML:  <span data-v="village.delhi">23</span>   (key from _variables.yml style paths, see resolve())
             <span data-v="m:families.village.ledger.SPLIT.U" data-f="2">55.53</span>  (m: = model_v2.json path, e: = evidence.json path)
   tools/build.js fills the text; tools/check_numbers.js fails the build if a page's text and the file disagree. */
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");

function load() {
  const model = JSON.parse(fs.readFileSync(path.join(ROOT, "data/model_v2.json"), "utf8"));
  const ev = JSON.parse(fs.readFileSync(path.join(ROOT, "data/evidence.json"), "utf8"));
  const vars = parseVars(fs.readFileSync(path.join(ROOT, "_variables.yml"), "utf8"));
  return { model, ev, vars };
}

/* _variables.yml is written by export_model_json.py as two-level  key: "value"  lines; parse that subset only. */
function parseVars(txt) {
  const out = {}; let sec = null;
  txt.split(/\r?\n/).forEach(line => {
    if (!line.trim() || line.trim().startsWith("#")) return;
    let m = line.match(/^(\S[^:]*):\s*$/);
    if (m) { sec = m[1]; out[sec] = out[sec] || {}; return; }
    m = line.match(/^(\s*)([^:]+):\s*"(.*)"\s*$/);
    if (!m) return;
    const v = m[3].replace(/\\"/g, '"');
    if (m[1].length && sec) out[sec][m[2].trim()] = v; else { out[m[2].trim()] = v; sec = null; }
  });
  return out;
}

function dig(obj, p) {
  return p.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

function resolve(D, key) {
  if (key.startsWith("m:")) return dig(D.model, key.slice(2));
  if (key.startsWith("e:")) return dig(D.ev, key.slice(2));
  return dig(D.vars, key);
}

/* f: number of decimals ("0", "1", "2"), "rs" (Indian grouping), "lakh" (x / 1e5, 2 dp), or empty = as stored */
function fmt(v, f) {
  if (v === undefined || v === null) return undefined;
  if (!f) return String(v);
  const n = Number(v);
  if (f === "rs") return n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
  if (f === "lakh") return (n / 1e5).toFixed(2);
  if (/^\d$/.test(f)) return n.toFixed(Number(f));
  if (f === "abs1") return Math.abs(n).toFixed(1);
  if (f === "abs0") return Math.abs(n).toFixed(0);
  if (f === "pp") return (100 * n).toFixed(1);
  return String(v);
}

module.exports = { load, parseVars, resolve, fmt, dig, ROOT };
