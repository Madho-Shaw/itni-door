/* Fails (exit 1) if any number the site shows disagrees with model v2.
   1. data/model_v2.json  vs  data/source/model_v2_results.md (every table the script prints)
   2. data/model_v2.json  vs  the game's own model (play/js/rl_model.js + play/content/rl_content.js)
      and the WANT values in the game's tools/check_rl_model.js (copied to tools/game/ by sync_game.py)
   3. every  data-v  number in the built pages (_site/, or site/ if not built)  vs  the files
   4. _variables.yml (the report's numbers)  vs  data/model_v2.json
   Run:  node tools/check_numbers.js   (CI runs it after the build) */
"use strict";
const fs = require("fs"), path = require("path");
const { load, resolve, fmt, ROOT } = require("./numfmt");
const D = load(), M = D.model;
let bad = 0, ok = 0;
function eq(got, want, what) {
  const a = typeof want === "number" ? Number(String(got).replace(/,/g, "")) : String(got);
  const pass = typeof want === "number" ? Math.abs(a - want) < 1e-9 : a === String(want);
  if (pass) ok++; else { bad++; console.log("MISMATCH", what, "| site:", got, "| source:", want); }
}
const num = s => Number(String(s).replace(/[,*\s]|Rs|lakh/g, ""));

/* ---------------------------------------------------------------- 1. results file */
const md = fs.readFileSync(path.join(ROOT, "data/source/model_v2_results.md"), "utf8").split(/\r?\n/);
const tables = []; let head = "", cur = null;
md.forEach(line => {
  if (/^#{2,3} /.test(line)) { head = line.replace(/^#+ /, "").trim(); cur = null; return; }
  if (line.startsWith("|")) {
    const cells = line.split("|").slice(1, -1).map(c => c.trim());
    if (cells.every(c => /^-+$/.test(c))) return;
    if (!cur) { cur = { head, cols: cells, rows: [] }; tables.push(cur); } else cur.rows.push(cells);
  } else cur = null;
});
const T = h => { const t = tables.find(x => x.head.startsWith(h)); if (!t) { bad++; console.log("MISSING TABLE", h); } return t || { rows: [], cols: [] }; };
const famOf = label => Object.keys(M.families).find(f => M.families[f].label.startsWith(label.split(",")[0].trim().split(":")[0].trim()));
const key4 = o => o === "SON-ONLY" ? "SON_ONLY" : o;

// A. inputs (first table under A is colleges, second the journeys)
const A = tables.filter(t => t.head.startsWith("A. Inputs"));
A[0].rows.forEach(r => {
  const c = M.colleges[r[0]];
  eq(c.pay_lakh, num(r[1]), "pay " + r[0]); eq(c.quota, r[2], "quota " + r[0]);
  eq(c.close_gn, num(r[3]), "close GN " + r[0]); eq(c.close_female, num(r[4]), "close F " + r[0]);
  eq(c.son_can ? "yes" : "no", r[5], "son can " + r[0]); eq(c.dau_can ? "yes" : "no", r[6], "dau can " + r[0]);
});
A[1].rows.forEach(r => {
  const j = M.families[famOf(r[0])].journey[r[1]];
  eq(j.fare, num(r[2]), "fare " + r[0] + " " + r[1]); eq(j.hours, num(r[3]), "hours " + r[0] + " " + r[1]);
  eq(j.escort_days, num(r[4]), "escort days " + r[0] + " " + r[1]);
});
// B. baseline ledger (three options)
T("B. Baseline").rows.forEach(r => {
  const L = M.families[famOf(r[0])].ledger[r[1]], w = r[0] + " " + r[1];
  eq(L.value.toFixed(1), r[2], "value " + w); eq(Math.round(L.money_rs), num(r[3]), "money Rs " + w);
  eq(L.money.toFixed(2), r[4], "lambda x money " + w); eq(L.worry.toFixed(2), r[5], "worry " + w); eq(L.U.toFixed(2), r[6], "U " + w);
});
T("Out of 100 families like this").rows.forEach(r => {
  const t = M.families[famOf(r[0])].three, w = r[0];
  eq(t.shares.NEAR, num(r[1]), "3opt NEAR " + w); eq(t.shares.TOGETHER, num(r[2]), "3opt TOGETHER " + w);
  eq(t.shares.SPLIT, num(r[3]), "3opt SPLIT " + w); eq(t.son_far, num(r[4]), "3opt son far " + w);
  eq(t.dau_far, num(r[5]), "3opt dau far " + w); eq(t.son_best, num(r[6]), "3opt son best " + w);
  eq(t.dau_best, num(r[7]), "3opt dau best " + w); eq(t.top, r[8], "3opt top " + w);
});
T("Robustness: add the classic").rows.forEach(r => {
  const t = M.families[famOf(r[0])].four, w = r[0];
  ["NEAR", "TOGETHER", "SPLIT", "SON_ONLY"].forEach((o, i) => eq(t.shares[o], num(r[1 + i]), "4opt " + o + " " + w));
  eq(t.son_far, num(r[5]), "4opt son far " + w); eq(t.dau_far, num(r[6]), "4opt dau far " + w); eq(t.dau_best, num(r[7]), "4opt Delhi " + w);
});
// C. sensitivity (three options)
const fams = Object.keys(M.families);
[["Horizon H", "H"], ["Worry scale sigma", "sigma"], ["Logit noise mu", "mu"], ["Brother's worry effect b", "b"]].forEach(([h, k]) => {
  T(h).rows.forEach((r, i) => {
    const row = M.sensitivity[k][i];
    eq(row.value, num(r[0]), "sens " + k + " value");
    fams.forEach((f, j) => eq(row[f].join(" / "), r[1 + j], "sens " + k + "=" + r[0] + " " + f));
  });
});
const line = re => md.find(l => re.test(l)) || "";
eq(M.sensitivity.town_fence_sigma.toFixed(1), (line(/fence at sigma = /).match(/sigma = ([\d.]+)/) || [])[1], "town fence sigma");
eq(M.sensitivity.city_n0.join(" / "), (line(/City family with n = 0/).match(/= (\d+ \/ \d+ \/ \d+)/) || [])[1], "city n = 0");
const fc = line(/village-only fixed cost of her leaving Bihar of about/);
eq(M.sensitivity.village_fixed_cost.F_lakh.toFixed(1), (fc.match(/about ([\d.]+) lakh/) || [])[1], "village fixed cost");
["NEAR", "TOGETHER", "SPLIT", "SON-ONLY"].forEach(o => eq(M.sensitivity.village_fixed_cost.shares[key4(o)], num((fc.match(new RegExp(o + " (\\d+)")) || [])[1]), "fixed cost " + o));
// D. bargaining
T("D. Bargaining").rows.forEach(r => {
  const n = M.families[famOf(r[0])].nash, w = r[0];
  eq(n.parents_gain.TOGETHER.toFixed(1) + " / " + n.parents_gain.SPLIT.toFixed(1), r[1], "nash parents " + w);
  eq(n.her_gain.TOGETHER.toFixed(1) + " / " + n.her_gain.SPLIT.toFixed(1), r[2], "nash her " + w);
  eq(n.choice["0.2"], r[3], "nash 0.2 " + w); eq(n.choice["0.3"], r[4], "nash 0.3 " + w); eq(n.choice["0.5"], r[5], "nash 0.5 " + w);
  eq(n.beta_star, num(r[6]), "beta* " + w);
});
// E. fixes, three and four options
const fixKeys = Object.keys(M.fixes.labels);
T("E. Fixes, tested").rows.forEach((r, i) => fams.forEach((f, j) => eq(M.families[f].fixes3[fixKeys[i]], num(r[1 + j]), "fix3 " + fixKeys[i] + " " + f)));
T("Same fixes with four options").rows.forEach((r, i) => fams.forEach((f, j) => {
  const x = M.families[f].fixes4[fixKeys[i]];
  eq(x.delhi + " / " + x.far, r[1 + j], "fix4 " + fixKeys[i] + " " + f);
}));
fixKeys.forEach((k, i) => eq(M.fixes.labels[k], T("E. Fixes, tested").rows[i][0], "fix label " + k));
// F. anchors
const fl = line(/Trade-down cost of TOGETHER/);
eq(M.anchors.tradedown_together_lakh.toFixed(2), (fl.match(/= \*\*([\d.]+) lakh/) || [])[1], "trade-down Durgapur");
eq(M.anchors.tradedown_jamshedpur_lakh.toFixed(2), (fl.match(/Jamshedpur instead: ([\d.]+)/) || [])[1], "trade-down Jamshedpur");
eq(M.anchors.stay_patna_lakh.toFixed(2), (fl.match(/NIT Patna: ([\d.]+) lakh/) || [])[1], "stay at Patna");
md.filter(l => /^- .*SPLIT.s whole travel bill/.test(l)).forEach(l => {
  const f = famOf(l.replace(/^- /, "")), m = l.match(/= Rs ([\d,]+); NEAR's = Rs ([\d,]+)/);
  eq(Math.round(M.families[f].ledger.SPLIT.money_rs), num(m[1]), "bill SPLIT " + f); eq(Math.round(M.families[f].ledger.NEAR.money_rs), num(m[2]), "bill NEAR " + f);
});
const up = line(/UP contrast/);
eq(M.anchors.up.gap_best_lakh, num((up.match(/gap (-?[\d.]+)/) || [])[1]), "UP gap");

/* ---------------------------------------------------------------- 2. the game */
const gameDir = [path.join(ROOT, "_site/play"), path.join(ROOT, "site/play"), process.env.GAME_DIR || path.join(ROOT, "../itni-door-real-life")]
  .find(d => fs.existsSync(path.join(d, "js/rl_model.js")));
if (!gameDir) { bad++; console.log("MISSING the game's js/rl_model.js (run py tools/sync_game.py)"); }
else {
  global.window = globalThis;
  require(path.join(gameDir, "content/rl_content.js"));
  const gm = require(path.join(gameDir, "js/rl_model.js")), GM = globalThis.ITNI.rl.model, r = x => Math.round(x * 100);
  fams.forEach(f => {
    const s = gm.summary(GM, f, 4), F = M.families[f];
    ["NEAR", "TOGETHER", "SPLIT", "SON_ONLY"].forEach(o => eq(F.four.shares[o], r(s.p[o]), "game " + f + " " + o));
    const dots = gm.of100(s.p);
    ["NEAR", "TOGETHER", "SPLIT", "SON_ONLY"].forEach(o => eq(F.four.dots[o], dots[o], "game dots " + f + " " + o));
    eq(F.four.dau_best, r(s.dauBest), "game Delhi " + f); eq(F.four.dau_far, r(s.dauFar), "game far " + f); eq(F.four.son_best, r(s.sonBest), "game son " + f);
    [1, 2, 3, 4].forEach(k => eq(F.stages[k - 1].dau_best, r(gm.summary(GM, f, k).dauBest), "game stage " + k + " " + f));
    ["senior", "hostel", "fares", "credit"].forEach(k => eq(F.fixes4[k].delhi, r(gm.summary(GM, f, 4, GM.fixes[k]).dauBest), "game fix " + k + " " + f));
    ["NEAR", "TOGETHER", "SPLIT", "SON_ONLY"].forEach(o => {
      const u = gm.utility(GM, f, o, 4);
      eq(F.ledger[o].U.toFixed(2), u.U.toFixed(2), "game U " + f + " " + o);
      eq(Math.round(F.ledger[o].money_rs), Math.round(u.moneyRs), "game bill " + f + " " + o);
      eq(F.ledger[o].stat.toFixed(2), u.stat.toFixed(2), "game statistical worry " + f + " " + o);
      eq(F.ledger[o].taste.toFixed(2), u.taste.toFixed(2), "game taste worry " + f + " " + o);
    });
  });
  ["Patna", "Durgapur", "Delhi"].forEach(c => eq(M.colleges[c].pay_lakh, GM.pay[c], "game pay " + c));
  // the game's own published WANT table
  const chk = [path.join(ROOT, "tools/game/check_rl_model.js"), path.join(gameDir, "tools/check_rl_model.js")].find(p => fs.existsSync(p));
  if (chk) {
    const src = fs.readFileSync(chk, "utf8"), m = src.match(/const WANT = (\{[\s\S]*?\n\});/);
    const WANT = Function("return " + m[1])();
    fams.forEach(f => {
      const w = WANT[f], F = M.families[f];
      ["NEAR", "TOGETHER", "SPLIT", "SON_ONLY"].forEach((o, i) => eq(F.four.shares[o], w.opt[i], "WANT " + f + " " + o));
      eq(F.four.dau_best, w.delhi, "WANT delhi " + f); eq(F.four.dau_far, w.far, "WANT far " + f);
      ["senior", "hostel", "fares", "credit"].forEach(k => eq(F.fixes4[k].delhi, w[k], "WANT fix " + k + " " + f));
      eq(Math.round(F.ledger.SPLIT.money_rs), w.bill[0], "WANT bill SPLIT " + f); eq(Math.round(F.ledger.NEAR.money_rs), w.bill[1], "WANT bill NEAR " + f);
    });
  } else { bad++; console.log("MISSING the game's tools/check_rl_model.js (run py tools/sync_game.py)"); }
}

/* ---------------------------------------------------------------- 3. pages */
const pageRoot = fs.existsSync(path.join(ROOT, "_site/index.html")) ? path.join(ROOT, "_site") : path.join(ROOT, "site");
let pages = 0, spans = 0;
(function walk(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(e => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!/^(play|assets|data|fonts)$/.test(e.name)) walk(p); return; }
    if (!/\.html$/.test(e.name)) return;
    pages++;
    const html = fs.readFileSync(p, "utf8"), re = /<([a-z0-9]+)([^>]*?)\sdata-v="([^"]+)"([^>]*)>([^<]*)<\/\1>/g;
    let m;
    while ((m = re.exec(html))) {
      spans++;
      const attrs = m[2] + m[4], f = (attrs.match(/data-f="([^"]*)"/) || [])[1], want = fmt(resolve(D, m[3]), f);
      if (want === undefined) { bad++; console.log("UNKNOWN KEY", m[3], "in", path.relative(ROOT, p)); continue; }
      eq(m[5].trim(), want, path.relative(ROOT, p) + " " + m[3]);
    }
  });
})(pageRoot);

/* ---------------------------------------------------------------- 4. report variables */
fams.forEach(f => {
  const V = D.vars[f], F = M.families[f];
  eq(V.delhi, F.four.dau_best, "_variables " + f + ".delhi"); eq(V.son_best, F.four.son_best, "_variables " + f + ".son_best");
  eq(V.stages, F.stages.map(s => s.dau_best).join(", "), "_variables " + f + ".stages");
  ["senior", "hostel", "fares", "credit", "pickup", "both"].forEach(k => eq(V["fix_" + k], F.fixes4[k].delhi, "_variables " + f + ".fix_" + k));
  eq(num(V.bill_split), Math.round(F.ledger.SPLIT.money_rs), "_variables " + f + ".bill_split");
});
Object.entries(D.ev.variables).forEach(([k, v]) => eq(D.vars.gap && D.vars.gap[k], v, "_variables gap." + k));

console.log(`${ok} checks passed, ${bad} failed; ${spans} page numbers in ${pages} pages (${path.relative(ROOT, pageRoot)})`);
console.log(bad ? "FAIL: numbers disagree with model v2" : "OK: every number matches model v2, the game and the evidence files");
process.exit(bad ? 1 : 0);
