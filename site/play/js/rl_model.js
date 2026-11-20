/* Itni Door? Real Life: model v2 (vault 107 §3b; _project_data/scripts/model_v2_bihar.py), ported line by line.
   U = H*(pay_son + pay_dau) - lambda*M - W
   M = 16*fare(son) + 16*fare(dau) + J*(2*fare(dau) + days(dau)*w)            (rupees, 4 years)
   W = (sigma/(1 + n + b*same) + tau) * R(dau)                                (R = door-to-door hours / 24)
   P = multinomial logit with noise mu, read as "out of 100 families like this".
   stage 1..4 adds the terms one at a time (pay; + money; + statistical worry; + taste "log kya kahenge").
   Numbers only; every input lives in content/rl_content.js (ITNI.rl.model). Runs in node too (for the check). */
(function (root) {
  "use strict";
  var I = root.ITNI = root.ITNI || {};

  function escortDays(hours) { return Math.ceil(2 * hours / 24 + (hours > 8 ? 1 : 0)); }

  function utility(M, fam, opt, stage, fix) {
    var pair = M.options[opt], sonC = pair[0], dauC = pair[1];
    var f = M.families[fam], J0 = M.journey[fam], P = M.base;
    fix = fix || {};
    var same = sonC === dauC;
    var fareS = J0[sonC].fare, fareD = J0[dauC].fare, hrsD = J0[dauC].hours;
    var sigma = P.sigma, n = f.n;
    if (dauC === "Delhi") {
      sigma *= fix.sigma_mult_delhi || 1;
      n += fix.n_add_delhi || 0;
      fareD -= fix.fare_cut_delhi || 0;
      hrsD -= fix.hours_cut_delhi || 0;
    }
    var J;
    if (same) J = 0;
    else if (fam === "city" && dauC === "Patna") J = 0;
    else if (fam === "city" && dauC === "Delhi") J = P.J_air;
    else J = P.J_train;
    var escFare = (fix.escort_fares_paid && J) ? 0 : 2 * fareD;
    var days = escortDays(hrsD);
    var moneyRs = P.trips * (fareS + fareD) + J * (escFare + days * f.w);
    var lam = fix.lam != null ? fix.lam : f.lam;
    var money = lam * moneyRs / 1e5;
    var R = hrsD / 24;
    var stat = sigma / (1 + n + P.b * (same ? 1 : 0)) * R;
    var taste = P.tau * R;
    var value = P.H * (M.pay[sonC] + M.pay[dauC]);
    stage = stage || 4;
    var U = value - (stage >= 2 ? money : 0) - (stage >= 3 ? stat : 0) - (stage >= 4 ? taste : 0);
    return { value: value, moneyRs: moneyRs, money: money, stat: stat, taste: taste, worry: stat + taste,
             U: U, J: J, R: R, days: days, escortRs: J * (escFare + days * f.w), same: same };
  }

  function probs(M, fam, stage, fix) {
    var opts = Object.keys(M.options), U = {}, m = -Infinity, z = 0, out = {};
    opts.forEach(function (o) { U[o] = utility(M, fam, o, stage, fix).U; if (U[o] > m) m = U[o]; });
    opts.forEach(function (o) { out[o] = Math.exp((U[o] - m) / M.base.mu); z += out[o]; });
    opts.forEach(function (o) { out[o] /= z; });
    return out;
  }

  /* Whole numbers out of 100 that add to 100 (largest remainder), so the dot grid always has 100 dots. */
  function of100(p) {
    var keys = Object.keys(p), fl = {}, rem = [], sum = 0;
    keys.forEach(function (k) { fl[k] = Math.floor(p[k] * 100); sum += fl[k]; rem.push([k, p[k] * 100 - fl[k]]); });
    rem.sort(function (a, b) { return b[1] - a[1]; });
    for (var i = 0; sum < 100; i++, sum++) fl[rem[i % rem.length][0]]++;
    return fl;
  }

  /* The four headline numbers: son far / at his best seat, daughter far / at her best seat (Delhi). */
  function summary(M, fam, stage, fix) {
    var p = probs(M, fam, stage, fix), s = { p: p };
    s.sonFar = 0; s.dauFar = 0; s.dauBest = 0;
    Object.keys(M.options).forEach(function (o) {
      var pr = M.options[o];
      if (pr[0] !== "Patna") s.sonFar += p[o];
      if (pr[1] !== "Patna") s.dauFar += p[o];
      if (pr[1] === "Delhi") s.dauBest += p[o];
    });
    s.sonBest = s.sonFar;   // Durgapur is his best CSE seat in every option where he leaves
    return s;
  }

  I.rlModel = { utility: utility, probs: probs, of100: of100, summary: summary, escortDays: escortDays };
  if (typeof module !== "undefined") module.exports = I.rlModel;
})(typeof window !== "undefined" ? window : globalThis);
