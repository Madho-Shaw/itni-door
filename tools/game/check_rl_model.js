/* Checks the class-mode model (js/rl_model.js + content/rl_content.js) against model v2's published tables
   (vault _project_data/06_analysis/model_v2_results.md, four options, H = 3, sigma = 16). Run: node tools/check_rl_model.js */
global.window = globalThis;
const path = require("path"), root = path.join(__dirname, "..");
require(path.join(root, "content/rl_content.js"));
const m = require(path.join(root, "js/rl_model.js"));
const M = ITNI.rl.model;
const WANT = {   // of 100: NEAR / TOGETHER / SPLIT / SON-ONLY; daughter Delhi / far with each fix; 4-year bills SPLIT / NEAR
  village: { opt: [4, 59, 23, 14], delhi: 23, far: 82, senior: 85, hostel: 85, fares: 26, credit: 27, bill: [62366, 9600] },
  town:    { opt: [2, 42, 44, 12], delhi: 44, far: 86, senior: 89, hostel: 89, fares: 46, credit: 45, bill: [94560, 7040] },
  city:    { opt: [0, 2, 98, 0],   delhi: 98, far: 100, senior: 98, hostel: 98, fares: 98, credit: 98, bill: [165114, 6400] }
};
let bad = 0;
const eq = (a, b, what) => { if (a !== b) { bad++; console.log("MISMATCH", what, "got", a, "want", b); } };
for (const f in WANT) {
  const w = WANT[f], s = m.summary(M, f, 4), p = s.p, r = x => Math.round(x * 100);
  ["NEAR", "TOGETHER", "SPLIT", "SON_ONLY"].forEach((o, i) => eq(r(p[o]), w.opt[i], f + " " + o));
  eq(r(s.dauBest), w.delhi, f + " delhi"); eq(r(s.dauFar), w.far, f + " far");
  ["senior", "hostel", "fares", "credit"].forEach(k => eq(r(m.summary(M, f, 4, M.fixes[k]).dauBest), w[k], f + " fix " + k));
  eq(Math.round(m.utility(M, f, "SPLIT", 4).moneyRs), w.bill[0], f + " bill SPLIT");
  eq(Math.round(m.utility(M, f, "NEAR", 4).moneyRs), w.bill[1], f + " bill NEAR");
  const st = [1, 2, 3, 4].map(k => r(m.summary(M, f, k).dauBest));
  console.log(f.padEnd(8), "Delhi of 100 by stage (pay, +money, +worry, +taste):", st.join(" -> "));
}
console.log(bad ? bad + " mismatch(es)" : "OK: class-mode model matches model v2");
process.exit(bad ? 1 : 0);
