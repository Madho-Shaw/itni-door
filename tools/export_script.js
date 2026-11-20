/* Reads the video project's scenes.js (../eco463-media/video_v2) and writes content/video_script.json:
   the master-cut script grouped by act, for the watch page (#script). Words stay in scenes.js; this only copies them.
   Run: node tools/export_script.js  (only when the script changes; the JSON is committed so CI needs no media repo). */
"use strict";
const fs = require("fs"), path = require("path");
const src = path.join(__dirname, "../../eco463-media/video_v2/scenes.js");
global.window = globalThis;
require(src);
const acts = globalThis.ACTS.map(a => ({ id: a.id, name: a.name, lines: [] }));
globalThis.BEATS.forEach(b => {
  if (!/M/.test(b.cut || "M5")) return;
  (b.lines || []).forEach(l => {
    if (!/M/.test(l.cut || "M5")) return;
    acts[b.act].lines.push({ role: l.role, text: l.text, en: l.en || null });
  });
});
const out = acts.filter(a => a.lines.length);
fs.writeFileSync(path.join(__dirname, "../content/video_script.json"), JSON.stringify(out, null, 1));
console.log("script:", out.map(a => a.name + " " + a.lines.length).join(", "));
