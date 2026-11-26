/* Reads the video project's scenes (../eco463-media/video_v2, scenes.js + scenes_v3.js) and writes content/video_script.json:
   the v3 explainer's script (cut "3") grouped by chapter, for the watch page (#script). Words stay in the scenes; this only copies them.
   Narrators show as NARRATOR; the families keep their names. Women's interview words are on screen only, so they are not in this list.
   Run: node tools/export_script.js  (only when the script changes; the JSON is committed so CI needs no media repo). 26 Nov: v3 instead of the old master cut. */
"use strict";
const fs = require("fs"), path = require("path");
const { cutBeats } = require("../../eco463-media/video_v2/tools/common.js");
const NAMES = ["The three girls", "The gap", "The textbook", "Our model", "Out of 100", "How sure are we?", "Fixes", "Where it breaks", "You decide"];
const { ACTS, beats } = cutBeats("3");
const v3 = ACTS.filter(a => NAMES.includes(a.name)).slice(-NAMES.length);
const idx = new Map(v3.map((a, i) => [a.id, i]));
const out = v3.map((a, i) => ({ id: i, name: a.name, lines: [] }));
for (const b of beats) {
  if (!idx.has(b.act)) continue;
  for (const l of b.lines) out[idx.get(b.act)].lines.push({ role: /^NAR/.test(l.role) ? "NARRATOR" : l.role, text: l.text, en: l.en || null });
}
fs.writeFileSync(path.join(__dirname, "../content/video_script.json"), JSON.stringify(out, null, 1));
console.log("script:", out.map(a => a.name + " " + a.lines.length).join(", "));
