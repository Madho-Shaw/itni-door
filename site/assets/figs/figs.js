/* Itni Door? figures. One file, no framework, no CDN. Every builder returns an SVG or HTML string from
   data/model_v2.json (MODEL_V2), data/evidence.json (EVIDENCE) and the game's content/rl_content.js (ITNI.rl).
   The same code runs in Node (tools/build.js pre-renders every figure, so pages work with no JS and in print)
   and in the browser (figs-live.js re-renders at the real width and wires the buttons).
   Rules: text wears ink, never the series colour; 2 px lines; >= 8 px markers; one axis;
   legend for 2+ series; "Both stay" is hatched kraft, never colour alone; a table under every figure. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.FIGS = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  var ORDER = ["SPLIT", "TOGETHER", "SON_ONLY", "NEAR"];   // fixed order of options in every grid and legend
  var COL = { SPLIT: "var(--opt-split)", TOGETHER: "var(--opt-together)", SON_ONLY: "var(--opt-son-only)", NEAR: "var(--opt-near)" };
  var FAM = { village: { her: "Shalini", him: "Sonu", place: "Saharsa village" },
              town: { her: "Kajal", him: "Kundan", place: "Begusarai town" },
              city: { her: "Ira", him: "Vivaan", place: "Patna city" } };
  var uid = 0;

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function n1(x) { return (Math.round(x * 10) / 10).toFixed(1); }
  function rs(x) { return Math.round(x).toLocaleString("en-IN"); }
  function lin(d0, d1, r0, r1) { return function (v) { return r0 + (v - d0) * (r1 - r0) / (d1 - d0); }; }
  function txt(x, y, s, a) {
    a = a || {};
    var at = ' x="' + n1(x) + '" y="' + n1(y) + '"';
    if (a.anchor) at += ' text-anchor="' + a.anchor + '"';
    if (a.size) at += ' font-size="' + a.size + '"';
    if (a.weight) at += ' font-weight="' + a.weight + '"';
    if (a.cls) at += ' class="' + a.cls + '"';
    if (a.base) at += ' dominant-baseline="' + a.base + '"';
    return "<text" + at + ">" + esc(s) + "</text>";
  }
  function svg(w, h, body, label, extra) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + Math.round(w) + " " + Math.round(h) + '" width="' + Math.round(w) +
      '" height="' + Math.round(h) + '" role="img" aria-label="' + esc(label) + '"' + (extra || "") + ">" + body + "</svg>";
  }
  function hatch(id) {
    return '<defs><pattern id="' + id + '" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">' +
      '<rect width="5" height="5" fill="var(--opt-near)"/><line x1="0" y1="0" x2="0" y2="5" stroke="rgba(43,33,24,.6)" stroke-width="1.4"/></pattern></defs>';
  }
  function legend(items) {
    return '<ul class="legend">' + items.map(function (i) {
      return '<li><span class="key ' + (i.cls || "") + '"' + (i.style ? ' style="' + i.style + '"' : "") + ' aria-hidden="true"></span>' + esc(i.label) + "</li>";
    }).join("") + "</ul>";
  }
  function table(head, rows, cap) {
    return "<details><summary>Table</summary><table>" + (cap ? "<caption class=\"sr\">" + esc(cap) + "</caption>" : "") +
      "<thead><tr>" + head.map(function (h, i) { return "<th" + (i ? ' class="r"' : "") + ' scope="col">' + esc(h) + "</th>"; }).join("") + "</tr></thead><tbody>" +
      rows.map(function (r) { return "<tr>" + r.map(function (c, i) { return i ? '<td class="r">' + esc(c) + "</td>" : '<th scope="row">' + esc(c) + "</th>"; }).join("") + "</tr>"; }).join("") +
      "</tbody></table></details>";
  }
  function names(M) { return M.meta.option_names; }
  function fsz(o) { return (o && o.fs) || 17; }

  /* ------------------------------------------------------------ 100-dot grid */
  function dots(M, counts, o) {
    o = o || {};
    var side = Math.min(o.w || 240, o.max || 240), cell = side / 10, r = cell * 0.41, id = "hn" + (++uid), k = 0, body = hatch(id);
    ORDER.forEach(function (opt) {
      for (var i = 0; i < (counts[opt] || 0); i++, k++) {
        var cx = (k % 10) * cell + cell / 2, cy = Math.floor(k / 10) * cell + cell / 2;
        var ring = o.prev && o.prevAt && o.prevAt[k] !== opt;
        body += '<circle class="dot" style="--i:' + k + '" cx="' + n1(cx) + '" cy="' + n1(cy) + '" r="' + n1(r) + '" fill="' + (opt === "NEAR" ? "url(#" + id + ")" : COL[opt]) + '"' +
          (opt === "NEAR" ? ' stroke="var(--ink)" stroke-width="1.2"' : "") + "/>";
        if (ring) body += '<circle cx="' + n1(cx) + '" cy="' + n1(cy) + '" r="' + n1(r + 2.2) + '" fill="none" stroke="var(--ink)" stroke-width="2"/>';
      }
    });
    var N = names(M), label = (o.label || "Out of 100 families like this") + ": " +
      ORDER.map(function (opt) { return (counts[opt] || 0) + " " + N[opt]; }).join(", ") + ".";
    return svg(side, side, body, label);
  }
  function layout(counts) { var at = [], k = 0; ORDER.forEach(function (opt) { for (var i = 0; i < (counts[opt] || 0); i++) at[k++] = opt; }); return at; }
  function optLegend(M) {
    var N = names(M);
    return legend(ORDER.map(function (o) { return { cls: "k-" + o.toLowerCase(), label: N[o] + (o === "SPLIT" ? " (she goes to NIT Delhi)" : "") }; }));
  }

  /* three families side by side, four options (F14) */
  function grids(M, o) {
    o = o || {};
    var fams = o.fams || ["village", "town", "city"], w = o.w || 720;
    var each = Math.max(150, Math.min(240, (w - 32 * (fams.length - 1)) / fams.length));
    if (w < 560) each = Math.min(220, w * 0.62);
    var N = names(M), out = '<div class="dots-wrap">';
    fams.forEach(function (f) {
      var F = M.families[f], c = o.fix ? F.fixes4[o.fix].dots : F.four.dots, delhi = o.fix ? F.fixes4[o.fix].delhi : F.four.dau_best;
      out += '<figure class="dots">' + dots(M, c, { w: each, label: "Out of 100 " + FAM[f].place + " families like " + FAM[f].her + "'s" }) +
        '<figcaption><span class="big">' + delhi + '</span> in 100 send ' + FAM[f].her + " to NIT Delhi" +
        '<br><span class="small">' + FAM[f].place + ". " + FAM[f].him + " goes to his best college in " + F.four.son_best + ".</span></figcaption></figure>";
    });
    out += "</div>" + optLegend(M);
    out += table(["Family"].concat(ORDER.map(function (x) { return N[x]; })).concat(["She at Delhi", "He at his best"]),
      fams.map(function (f) { var F = M.families[f], s = o.fix ? F.fixes4[o.fix].dots : F.four.shares;
        return [FAM[f].her + " / " + FAM[f].him + ", " + FAM[f].place].concat(ORDER.map(function (x) { return String(s[x]); }))
          .concat([String(o.fix ? F.fixes4[o.fix].delhi : F.four.dau_best), String(F.four.son_best)]); }),
      "Out of 100 families like this, four options");
    return out;
  }

  /* ------------------------------------------------------------ the weight stepper (F13) */
  var STEPS = ["Pay only", "+ fares, escort, lost wages", "+ worry we can fix (statistical)", "+ “log kya kahenge” (taste)"];
  function stepper(M, o) {
    o = o || {};
    var f = o.fam || "village", st = o.step || 4, F = M.families[f], w = o.w || 640, fs = fsz(o);
    var vals = F.stages.map(function (s) { return s.dau_best; });
    var btns = '<div class="ctl" role="group" aria-label="Family">' + ["village", "town", "city"].map(function (x) {
      return '<button type="button" data-fam="' + x + '" aria-pressed="' + (x === f) + '">' + FAM[x].her + ", " + FAM[x].place + "</button>"; }).join("") + "</div>";
    btns += '<div class="ctl" role="group" aria-label="Add one weight at a time">' + STEPS.map(function (s, i) {
      return '<button type="button" data-step="' + (i + 1) + '" aria-pressed="' + (i + 1 <= st) + '">' + (i + 1) + ". " + esc(s) + "</button>"; }).join("") + "</div>";
    // the four-point line
    var lw = Math.max(260, Math.min(w - (w >= 640 ? 260 : 0), 520)), lh = 170, pl = 34, pr = 34, pt = 18, pb = 44;
    var x = function (i) { return pl + i * (lw - pl - pr) / 3; }, y = lin(0, 100, lh - pb, pt);
    var g = "";
    [0, 50, 100].forEach(function (t) { g += '<line x1="' + pl + '" x2="' + (lw - pr) + '" y1="' + n1(y(t)) + '" y2="' + n1(y(t)) + '" stroke="var(--chart-grid)"/>' + txt(pl - 6, y(t) + 5, t, { anchor: "end", size: fs - 2, cls: "soft" }); });
    var pts = vals.slice(0, st).map(function (v, i) { return n1(x(i)) + "," + n1(y(v)); }).join(" ");
    g += '<polyline points="' + pts + '" fill="none" stroke="var(--opt-split)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
    vals.forEach(function (v, i) {
      var on = i < st;
      g += '<circle cx="' + n1(x(i)) + '" cy="' + n1(y(on ? v : 0)) + '" r="5" fill="' + (on ? "var(--opt-split)" : "none") + '" stroke="' + (on ? "var(--paper)" : "var(--hair-grey)") + '" stroke-width="2"' + (on ? "" : ' stroke-dasharray="2 2"') + "><title>Step " + (i + 1) + ": " + (on ? v + " in 100" : "not added yet") + "</title></circle>";
      if (on) g += txt(x(i), y(v) - 10, v, { anchor: "middle", size: fs, weight: 700 });
      g += txt(x(i), lh - pb + 20, "Step " + (i + 1), { anchor: "middle", size: fs - 2, cls: "soft" });
    });
    var line = svg(lw, lh, g, FAM[f].her + "'s chance of NIT Delhi out of 100 as each weight is added: " + vals.slice(0, st).join(", "));
    var grid = dots(M, F.stages[st - 1].dots, { w: Math.min(220, w * 0.6), label: "Out of 100 " + FAM[f].place + " families, step " + st,
      prev: false });
    var msg = "Step " + st + ": " + vals[st - 1] + " in 100 " + FAM[f].place + " families send " + FAM[f].her + " to NIT Delhi" +
      (st > 1 ? " (from " + vals[st - 2] + ")." : ".");
    return '<div class="stepper" data-fam="' + f + '" data-step="' + st + '">' + btns +
      '<div style="display:flex;flex-wrap:wrap;gap:var(--sp-4);align-items:flex-start"><div>' + grid + "</div><div>" + line + "</div></div>" +
      '<p class="live" aria-live="polite">' + esc(msg) + "</p>" + optLegend(M) +
      table(["Family"].concat(STEPS), ["village", "town", "city"].map(function (x) { return [FAM[x].her + ", " + FAM[x].place].concat(M.families[x].stages.map(function (s) { return String(s.dau_best); })); }),
        "Her chance of NIT Delhi out of 100, adding one weight at a time") + "</div>";
  }

  /* ------------------------------------------------------------ the fixes toggle (F17) */
  var FIXN = { baseline: "No fix", fares: "Escort's fares paid", credit: "Cheap credit", pickup: "Campus pickup",
               senior: "A senior girl from her district", hostel: "First-year hostel guarantee", both: "Senior girl + hostel" };
  var FIXT = { baseline: "", fares: "moves 2f, the escort's tickets", credit: "moves λ, the cost of money", pickup: "moves f and R at the college end",
               senior: "moves n, girls she knows who went", hostel: "moves σ, the statistical worry", both: "moves n and σ" };
  function fixes(M, o) {
    o = o || {};
    var k = o.fix || "baseline", w = o.w || 720;
    var btns = '<div class="ctl" role="group" aria-label="Pick one fix">' + Object.keys(FIXN).map(function (x) {
      return '<button type="button" data-fix="' + x + '" aria-pressed="' + (x === k) + '">' + esc(FIXN[x]) + "</button>"; }).join("") + "</div>";
    var v = M.families.village.fixes4[k].delhi, b = M.families.village.fixes4.baseline.delhi;
    var msg = k === "baseline" ? "No fix: " + b + " in 100 village families send Shalini to NIT Delhi." :
      FIXN[k] + " (" + FIXT[k] + "): Shalini's Delhi chance goes from " + b + " to " + v + " in 100.";
    return '<div class="fixes" data-fix="' + k + '">' + btns + '<p class="live" aria-live="polite">' + esc(msg) + "</p>" +
      grids(M, { fix: k, w: w }).replace(/<details>[\s\S]*<\/details>/, "") +
      '<p class="small">No fix moves τ, “log kya kahenge”. The size of the information fixes rests on our assumed worry split; the ranking does not.</p>' +
      table(["Fix", "Shalini, village", "Kajal, town", "Ira, city"], Object.keys(FIXN).map(function (x) {
        return [FIXN[x]].concat(["village", "town", "city"].map(function (f) { return String(M.families[f].fixes4[x].delhi); })); }),
        "Her chance of NIT Delhi out of 100 with each fix, four options") + "</div>";
  }

  /* ------------------------------------------------------------ pay ladder (F7): she has the better seat */
  function ladder(M, o) {
    o = o || {};
    var w = o.w || 640, fs = fsz(o), C = M.colleges, crl = M.crl;
    var list = ["Patna", "Jamshedpur", "Durgapur", "Delhi"], h = 64 + list.length * 46, pl = Math.min(150, Math.max(132, w * 0.3)), pr = 24;
    var x = lin(8, 16, pl, w - pr), g = "", y0 = 40;
    [8, 10, 12, 14, 16].forEach(function (t) { g += '<line x1="' + n1(x(t)) + '" x2="' + n1(x(t)) + '" y1="' + (y0 - 14) + '" y2="' + (h - 18) + '" stroke="var(--chart-grid)"/>' + txt(x(t), y0 - 20, "₹" + t + "L", { anchor: "middle", size: fs - 2, cls: "soft" }); });
    var hisBest = list.filter(function (c) { return C[c].son_can; }).sort(function (a, b) { return C[b].pay_lakh - C[a].pay_lakh; })[0];
    var herBest = list.filter(function (c) { return C[c].dau_can; }).sort(function (a, b) { return C[b].pay_lakh - C[a].pay_lakh; })[0];
    list.forEach(function (c, i) {
      var y = y0 + 14 + i * 46, p = C[c].pay_lakh;
      g += txt(pl - 10, y + 5, "NIT " + c, { anchor: "end", size: fs, weight: 600 });
      g += '<line x1="' + n1(x(8)) + '" x2="' + n1(x(p)) + '" y1="' + y + '" y2="' + y + '" stroke="var(--kraft-deep)" stroke-width="2"/>';
      g += '<circle cx="' + n1(x(p)) + '" cy="' + y + '" r="6" fill="var(--ink)" stroke="var(--card)" stroke-width="2"><title>NIT ' + c + ": ₹" + p + " lakh median starting pay</title></circle>";
      var tag = c === herBest ? { t: "her best", col: "var(--chart-her)" } : c === hisBest ? { t: "his best", col: "var(--chart-him)" } : null;
      var tw = tag ? fs * 4.6 : 0, flip = x(p) + 14 + fs * 2.2 + tw + 8 > w;
      var vx = flip ? x(p) - 14 : x(p) + 12;
      g += txt(vx, y + 5, p.toFixed(1), { size: fs, weight: 600, anchor: flip ? "end" : "start" });
      if (tag) {
        var rx0 = flip ? vx - fs * 2.2 - 8 - tw : vx + fs * 2.2 + 6;
        g += '<rect x="' + n1(rx0) + '" y="' + (y - 12) + '" width="' + n1(tw) + '" height="24" rx="12" fill="var(--card)" stroke="' + tag.col + '" stroke-width="2.5"/>' +
          txt(rx0 + tw / 2, y + 5, tag.t, { anchor: "middle", size: fs - 3, weight: 600 });
      }
    });
    var label = "Median starting pay of graduates, lakh a year (NIRF 2025): " + list.map(function (c) { return "NIT " + c + " " + C[c].pay_lakh; }).join(", ") +
      ". At rank " + crl + ", his best seat is NIT " + hisBest + "; hers, through the women-only pool, is NIT " + herBest + ".";
    return svg(w, h, g, label) + legend([{ cls: "k-him", label: "his best seat at rank " + crl.toLocaleString("en-IN") }, { cls: "k-her", label: "her best seat (women-only pool)" }]) +
      table(["NIT (CSE)", "Median pay, lakh", "Closes, open", "Closes, women-only", "He can", "She can"], list.map(function (c) {
        return ["NIT " + c, C[c].pay_lakh.toFixed(2), C[c].close_gn.toLocaleString("en-IN"), C[c].close_female.toLocaleString("en-IN"), C[c].son_can ? "yes" : "no", C[c].dau_can ? "yes" : "no"]; }),
        "Pay and closing ranks, JoSAA 2025 final round");
  }

  /* ------------------------------------------------------------ the scale: value minus money minus worry (one family, one option) */
  function scale(M, o) {
    o = o || {};
    var f = o.fam || "village", opt = o.opt || "SPLIT", L = M.families[f].ledger[opt], w = o.w || 560, fs = fsz(o), h = o.h || 232;
    var cx = w / 2, beamY = 70, half = Math.min(w * 0.36, 200), tilt = -6, rad = tilt * Math.PI / 180;
    var lx = cx - half * Math.cos(rad), ly = beamY - half * Math.sin(rad), rx = cx + half * Math.cos(rad), ry = beamY + half * Math.sin(rad);
    var g = '<path d="M' + n1(cx - 26) + "," + (h - 76) + " L" + n1(cx + 26) + "," + (h - 76) + " L" + n1(cx) + "," + beamY + ' Z" fill="var(--kraft-deep)" stroke="var(--ink)" stroke-width="2"/>';
    g += '<line x1="' + n1(lx) + '" y1="' + n1(ly) + '" x2="' + n1(rx) + '" y2="' + n1(ry) + '" stroke="var(--ink)" stroke-width="4" stroke-linecap="round"/>';
    g += '<circle cx="' + n1(cx) + '" cy="' + beamY + '" r="6" fill="var(--ink)"/>';
    function pan(px, py, blocks, side) {
      var pw = Math.min(150, half * 0.95), s = '<line x1="' + n1(px) + '" y1="' + n1(py) + '" x2="' + n1(px - pw / 2) + '" y2="' + n1(py + 40) + '" stroke="var(--ink)" stroke-width="1.5"/>' +
        '<line x1="' + n1(px) + '" y1="' + n1(py) + '" x2="' + n1(px + pw / 2) + '" y2="' + n1(py + 40) + '" stroke="var(--ink)" stroke-width="1.5"/>' +
        '<path d="M' + n1(px - pw / 2 - 6) + "," + n1(py + 40) + " Q" + n1(px) + "," + n1(py + 56) + " " + n1(px + pw / 2 + 6) + "," + n1(py + 40) + '" fill="none" stroke="var(--ink)" stroke-width="2.5"/>';
      var top = py + 40, total = blocks.reduce(function (a, b) { return a + b.v; }, 0), unit = 34 / Math.max(total, 1);
      if (side === "L") unit = 34 / total;
      var y = top;
      blocks.forEach(function (b) {
        var bh = Math.max(3, b.v * (side === "L" ? 34 / total : 34 / 23)), bw = pw * 0.82;
        y -= bh + 2;
        s += '<rect x="' + n1(px - bw / 2) + '" y="' + n1(y) + '" width="' + n1(bw) + '" height="' + n1(bh) + '" rx="3" fill="' + b.c + '"' + (b.stroke ? ' stroke="var(--ink)" stroke-width="1.2"' : "") + "><title>" + esc(b.t + ": " + b.v.toFixed(2) + " lakh") + "</title></rect>";
      });
      return s;
    }
    g += pan(lx, ly, [{ v: L.value, c: "var(--chart-him)", stroke: 1, t: "Value of the two seats" }], "L");
    g += pan(rx, ry, [{ v: L.money, c: "var(--opt-together)", t: "Money" }, { v: L.stat, c: "var(--opt-split)", t: "Worry we can fix (statistical)" }, { v: L.taste, c: "var(--opt-son-only)", t: "Log kya kahenge (taste)" }], "R");
    var N = names(M);
    var pic = svg(w, h - 70, g.replace(/ y2="(\d+)"/g, ' y2="$1"'), "The scale for the " + FAM[f].place + " family, option " + N[opt] + ": value of the two seats " + L.value.toFixed(1) +
      " lakh against money " + L.money.toFixed(2) + " and worry " + L.worry.toFixed(2) + " (statistical " + L.stat.toFixed(2) + ", taste " + L.taste.toFixed(2) + "). Score " + L.U.toFixed(2) + ".");
    return pic + '<div class="scale-key"><p><span class="key k-him" aria-hidden="true"></span><b>Value of the two seats</b><br>H × (his pay + her pay) = <span class="num">' + L.value.toFixed(1) + "</span> lakh</p>" +
      '<p><b>Minus what it costs to send them</b><br><span class="key k-together" aria-hidden="true"></span> money <span class="num">' + L.money.toFixed(2) + '</span><br><span class="key k-split" aria-hidden="true"></span> worry we can fix (statistical) <span class="num">' + L.stat.toFixed(2) +
      '</span><br><span class="key k-son_only" aria-hidden="true"></span> “log kya kahenge” (taste) <span class="num">' + L.taste.toFixed(2) + "</span></p>" +
      '<p><b>Score</b> <span class="num">' + L.value.toFixed(1) + " − " + L.money.toFixed(2) + " − " + L.worry.toFixed(2) + " = " + L.U.toFixed(2) + "</span></p></div>";
  }

  /* ------------------------------------------------------------ ledger bridge (F12): money is a sliver, worry is a slab */
  function ledger(M, o) {
    o = o || {};
    var f = o.fam || "village", w = o.w || 640, fs = fsz(o), N = names(M), F = M.families[f];
    var opts = ["SPLIT", "TOGETHER", "SON_ONLY", "NEAR"], pl = w < 480 ? 96 : 120, pr = 64, rowH = 54, h = 40 + opts.length * rowH;
    var x = lin(0, 80, pl, w - pr), g = "";
    [0, 20, 40, 60, 80].forEach(function (t) { g += '<line x1="' + n1(x(t)) + '" x2="' + n1(x(t)) + '" y1="22" y2="' + (h - 8) + '" stroke="var(--chart-grid)"/>' + txt(x(t), 16, t, { anchor: "middle", size: fs - 2, cls: "soft" }); });
    opts.forEach(function (op, i) {
      var L = F.ledger[op], y = 34 + i * rowH;
      g += txt(pl - 10, y + 14, N[op], { anchor: "end", size: fs, weight: 600 });
      // value bar, then money, stat, taste taken off its end
      var vEnd = x(L.value), m0 = vEnd - (x(L.money) - x(0)), s0 = m0 - (x(L.stat) - x(0)) - 2, t0 = s0 - (x(L.taste) - x(0)) - 2;
      g += '<rect x="' + n1(x(0)) + '" y="' + y + '" width="' + n1(Math.max(1, t0 - x(0) - 2)) + '" height="12" rx="3" fill="var(--ink)"><title>Score ' + L.U.toFixed(2) + "</title></rect>";
      g += '<rect x="' + n1(t0) + '" y="' + y + '" width="' + n1(Math.max(1, s0 - t0 - 2)) + '" height="12" fill="var(--opt-son-only)"><title>Taste ' + L.taste.toFixed(2) + "</title></rect>";
      g += '<rect x="' + n1(s0) + '" y="' + y + '" width="' + n1(Math.max(1, m0 - s0 - 2)) + '" height="12" fill="var(--opt-split)"><title>Statistical worry ' + L.stat.toFixed(2) + "</title></rect>";
      g += '<rect x="' + n1(m0) + '" y="' + y + '" width="' + n1(Math.max(1.5, vEnd - m0)) + '" height="12" fill="var(--opt-together)"><title>Money ' + L.money.toFixed(2) + "</title></rect>";
      g += txt(x(L.value) + 8, y + 11, L.U.toFixed(1), { size: fs - 1, weight: 700 });
      g += txt(x(0), y + 30, "value " + L.value.toFixed(1) + ", money " + L.money.toFixed(2) + ", worry " + L.worry.toFixed(2), { size: fs - 3, cls: "soft" });
    });
    return svg(w, h, g, "Score of each option for the " + FAM[f].place + " family, lakh: " + opts.map(function (op) { return N[op] + " " + F.ledger[op].U.toFixed(2); }).join(", ")) +
      legend([{ style: "background:var(--ink);border-color:var(--ink)", label: "what is left: the score" }, { cls: "k-son_only", label: "log kya kahenge (taste)" },
        { cls: "k-split", label: "worry we can fix (statistical)" }, { cls: "k-together", label: "money" }]) +
      table(["Option", "Value", "Money", "Statistical worry", "Taste", "Score"], opts.map(function (op) { var L = F.ledger[op];
        return [N[op], L.value.toFixed(1), L.money.toFixed(2), L.stat.toFixed(2), L.taste.toFixed(2), L.U.toFixed(2)]; }), "The ledger, lakh rupees");
  }

  /* ------------------------------------------------------------ journey strip (F11): hours, not kilometres */
  function journey(M, RL, o) {
    o = o || {};
    var to = o.to || "Delhi", fams = ["village", "town", "city"], max = 27;
    var out = '<ol class="journey">';
    fams.forEach(function (f) {
      var J = M.families[f].journey[to], legs = RL ? RL.fams[f].legs[to] : [], air = M.families[f].mode_far === "air" && to === "Delhi";
      out += '<li><span class="who">' + FAM[f].her + ", " + FAM[f].place + '</span><div><div class="track" style="width:' + n1(100 * J.hours / max) + '%;min-width:3.5rem">' +
        '<div class="legs"><span class="leg" style="width:100%" title="' + J.hours + ' hours door to door"></span></div></div>' +
        '<span class="tot">' + J.hours + " h</span> <span class=\"small\">door to door, ₹" + rs(J.fare) + " one way" + (air ? ", by air" : ", by train") + "</span>" +
        (legs.length ? '<ul class="tiny" style="margin:.2rem 0 0;padding-left:1.1rem">' + legs.map(function (l) {
          return "<li>" + esc(l.what.en) + ", " + esc(l.h) + ", ₹" + rs(l.rs) + ' <span class="chip ' + (l.src === "S" ? "is-s" : "is-a") + '">' + (l.src === "S" ? "Sourced" : "Assumed") + "</span></li>"; }).join("") + "</ul>" : "") +
        "</div></li>";
    });
    return out + "</ol>";
  }

  /* ------------------------------------------------------------ generic charts for the evidence */
  // lines on an ordinal axis (F1) or a year axis (F21)
  function lines(series, o) {
    o = o || {};
    var w = o.w || 640, fs = fsz(o), h = o.h || 280, pl = 40, pr = o.pr || 92, pt = 22, pb = o.pb || 56;
    var cats = o.cats, x = function (i) { return pl + i * (w - pl - pr) / (cats.length - 1); }, y = lin(o.y0, o.y1, h - pb, pt), g = "";
    o.ticks.forEach(function (t) { g += '<line x1="' + pl + '" x2="' + (w - pr) + '" y1="' + n1(y(t)) + '" y2="' + n1(y(t)) + '" stroke="var(--chart-grid)"/>' + txt(pl - 6, y(t) + 5, t + (o.unit || ""), { anchor: "end", size: fs - 2, cls: "soft" }); });
    cats.forEach(function (c, i) {
      if (o.every && i % o.every) return;
      var parts = String(c).split("|");
      parts.forEach(function (p, j) { g += txt(x(i), h - pb + 18 + j * (fs - 1), p, { anchor: "middle", size: fs - 3, cls: "soft" }); });
    });
    series.forEach(function (s) {
      var segs = [], cur = [];
      s.v.forEach(function (v, i) { if (v == null) { if (cur.length) segs.push(cur); cur = []; } else cur.push(n1(x(i)) + "," + n1(y(v))); });
      if (cur.length) segs.push(cur);
      segs.forEach(function (sg) { g += '<polyline points="' + sg.join(" ") + '" fill="none" stroke="' + s.col + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>'; });
      s.v.forEach(function (v, i) { if (v != null) g += '<circle cx="' + n1(x(i)) + '" cy="' + n1(y(v)) + '" r="4.5" fill="' + s.col + '" stroke="var(--card)" stroke-width="2"><title>' + esc(s.name + ", " + String(cats[i]).replace("|", " ") + ": " + v + (o.unit || "")) + "</title></circle>"; });
      var li = s.v.length - 1; while (li > 0 && s.v[li] == null) li--;
      g += txt(x(li) + 10, y(s.v[li]) + 5 + (s.dy || 0), s.end || s.name, { size: fs - 1, weight: 600 });
    });
    return svg(w, h, g, o.label);
  }
  // coefficient with 95% whisker per row (F2, F3, F9, F22); rows: {name, v, lo, hi, note, em}
  function whisker(rows, o) {
    o = o || {};
    var w = o.w || 640, fs = fsz(o), narrow = w < 520, pl = narrow ? 14 : Math.min(o.pl || 230, w * 0.46), pr = narrow ? 14 : 20, rowH = narrow ? 64 : (o.rowH || 40), pt = 30, h = pt + rows.length * rowH + 8;
    var lo = Math.min.apply(null, rows.map(function (r) { return r.lo; }).concat([o.min != null ? o.min : 0])), hi = Math.max.apply(null, rows.map(function (r) { return r.hi; }).concat([o.max != null ? o.max : 0]));
    var x = lin(lo, hi, pl, w - pr), g = "";
    (o.ticks || []).forEach(function (t) { g += txt(x(t), 16, t + (o.unit || ""), { anchor: "middle", size: fs - 3, cls: "soft" }) + '<line x1="' + n1(x(t)) + '" x2="' + n1(x(t)) + '" y1="22" y2="' + (h - 6) + '" stroke="var(--chart-grid)"/>'; });
    g += '<line x1="' + n1(x(0)) + '" x2="' + n1(x(0)) + '" y1="22" y2="' + (h - 6) + '" stroke="var(--ink)" stroke-width="1.5"/>';
    rows.forEach(function (r, i) {
      var y = narrow ? pt + i * rowH + rowH - 12 : pt + i * rowH + rowH / 2, col = r.em ? "var(--opt-together)" : "var(--ink-soft)";
      if (narrow) {
        g += txt(pl, y - 34, String(r.name).replace("|", " "), { size: fs - 2, weight: 600 });
        if (r.label) g += txt(pl, y - 17, r.label, { size: fs - 3, cls: "soft" });
      } else String(r.name).split("|").forEach(function (p, j, a) { g += txt(pl - 12, y + 5 + (j - (a.length - 1) / 2) * (fs + 1), p, { anchor: "end", size: fs - 2, weight: j ? null : 600 }); });
      g += '<line x1="' + n1(x(r.lo)) + '" x2="' + n1(x(r.hi)) + '" y1="' + y + '" y2="' + y + '" stroke="' + col + '" stroke-width="2" stroke-linecap="round"/>';
      g += '<circle cx="' + n1(x(r.v)) + '" cy="' + y + '" r="5.5" fill="' + col + '" stroke="var(--card)" stroke-width="2"><title>' + esc(String(r.name).replace("|", " ") + ": " + r.label) + "</title></circle>";
      if (r.label && !narrow) g += txt(x(r.hi) + 8 > w - 60 ? x(r.lo) - 8 : x(r.hi) + 8, y - 8, r.label, { anchor: x(r.hi) + 8 > w - 60 ? "end" : "start", size: fs - 3, cls: "soft" });
    });
    return svg(w, h, g, o.label);
  }
  // paired horizontal bars (F4): rows {name, a, b}
  function pairs(rows, o) {
    o = o || {};
    var w = o.w || 640, fs = fsz(o), pl = Math.min(150, w * 0.32), pr = 56, rowH = 58, h = 26 + rows.length * rowH, x = lin(0, o.max || 40, pl, w - pr), g = "";
    (o.ticks || [0, 10, 20, 30, 40]).forEach(function (t) { g += '<line x1="' + n1(x(t)) + '" x2="' + n1(x(t)) + '" y1="18" y2="' + (h - 4) + '" stroke="var(--chart-grid)"/>' + txt(x(t), 13, t + "%", { anchor: "middle", size: fs - 3, cls: "soft" }); });
    rows.forEach(function (r, i) {
      var y = 26 + i * rowH;
      g += txt(pl - 10, y + 20, r.name, { anchor: "end", size: fs - 1, weight: 600 });
      [[r.a, o.colA, o.nameA], [r.b, o.colB, o.nameB]].forEach(function (p, j) {
        var yy = y + 4 + j * 22;
        g += '<rect class="bar" x="' + n1(x(0)) + '" y="' + yy + '" width="' + n1(x(p[0]) - x(0)) + '" height="18" rx="4" fill="' + p[1] + '"><title>' + esc(r.name + ", " + p[2] + ": " + p[0] + "%") + "</title></rect>";
        g += txt(x(p[0]) + 6, yy + 14, p[0] + "%", { size: fs - 2, weight: j ? null : 700 });
      });
    });
    return svg(w, h, g, o.label);
  }
  // dot plot with a zero line (F19): rows {name, v, em}
  function dotplot(rows, o) {
    o = o || {};
    var w = o.w || 640, fs = fsz(o), pl = Math.min(130, w * 0.34), pr = 46, rowH = 26, h = 30 + rows.length * rowH;
    var x = lin(o.min, o.max, pl, w - pr), g = "";
    (o.ticks || []).forEach(function (t) { g += '<line x1="' + n1(x(t)) + '" x2="' + n1(x(t)) + '" y1="20" y2="' + (h - 4) + '" stroke="var(--chart-grid)"/>' + txt(x(t), 14, (t > 0 ? "+" : "") + t + (o.unit || ""), { anchor: "middle", size: fs - 3, cls: "soft" }); });
    g += '<line x1="' + n1(x(0)) + '" x2="' + n1(x(0)) + '" y1="20" y2="' + (h - 4) + '" stroke="var(--ink)" stroke-width="1.5"/>';
    rows.forEach(function (r, i) {
      var y = 30 + i * rowH, col = r.em ? "var(--opt-together)" : "var(--ink-soft)";
      g += txt(pl - 10, y + 5, r.name, { anchor: "end", size: fs - 2, weight: r.em ? 700 : null });
      g += '<line x1="' + n1(x(0)) + '" x2="' + n1(x(r.v)) + '" y1="' + y + '" y2="' + y + '" stroke="' + col + '" stroke-width="2"/>';
      g += '<circle cx="' + n1(x(r.v)) + '" cy="' + y + '" r="5" fill="' + col + '" stroke="var(--card)" stroke-width="2"><title>' + esc(r.name + ": " + (r.v > 0 ? "+" : "") + r.v + (o.unit || "")) + "</title></circle>";
      if (r.em || o.labelAll) g += txt(r.v >= 0 ? x(r.v) + 10 : x(0) + 10, y + 5, (r.v > 0 ? "+" : "") + r.v.toFixed(1), { anchor: "start", size: fs - 2, weight: 700 });
    });
    return svg(w, h, g, o.label);
  }
  // unit chart (F5): groups {name, n, col, hollow}
  function units(groups, o) {
    o = o || {};
    var w = o.w || 640, per = w < 480 ? 10 : 20, cell = Math.min(26, (w - 4) / per), r = cell * 0.4, k = 0, g = "", tot = groups.reduce(function (a, b) { return a + b.n; }, 0);
    var rows = Math.ceil(tot / per), h = rows * cell + 4;
    groups.forEach(function (gr) {
      for (var i = 0; i < gr.n; i++, k++) {
        var cx = (k % per) * cell + cell / 2 + 2, cy = Math.floor(k / per) * cell + cell / 2 + 2;
        g += '<rect x="' + n1(cx - r) + '" y="' + n1(cy - r) + '" width="' + n1(2 * r) + '" height="' + n1(2 * r) + '" rx="3" fill="' + (gr.hollow ? "none" : gr.col) + '"' +
          (gr.stroke ? ' stroke="var(--ink)" stroke-width="1.5"' : "") + "><title>" + esc(gr.name) + "</title></rect>";
      }
    });
    return svg(w, h, g, o.label);
  }
  // simple bars with N labels (F20): rows {name, v, n}
  function bars(rows, o) {
    o = o || {};
    var w = o.w || 640, fs = fsz(o), pl = Math.min(110, w * 0.3), pr = 120, rowH = 40, h = 26 + rows.length * rowH, x = lin(0, o.max || 10, pl, w - pr), g = "";
    (o.ticks || []).forEach(function (t) { g += '<line x1="' + n1(x(t)) + '" x2="' + n1(x(t)) + '" y1="18" y2="' + (h - 4) + '" stroke="var(--chart-grid)"/>' + txt(x(t), 13, t + (o.unit || ""), { anchor: "middle", size: fs - 3, cls: "soft" }); });
    rows.forEach(function (r, i) {
      var y = 26 + i * rowH;
      g += txt(pl - 10, y + 15, r.name, { anchor: "end", size: fs - 1, weight: 600 });
      g += '<rect class="bar" x="' + n1(x(0)) + '" y="' + (y + 2) + '" width="' + n1(x(r.v) - x(0)) + '" height="20" rx="4" fill="var(--opt-together)"><title>' + esc(r.name + ": " + r.v + (o.unit || "")) + "</title></rect>";
      g += txt(x(r.v) + 6, y + 17, r.v + (o.unit || "") + "  (" + r.n + ")", { size: fs - 2 });
    });
    return svg(w, h, g, o.label);
  }

  /* ------------------------------------------------------------ evidence figures, built from EVIDENCE */
  function F1(E, o) {
    var b = E.census_bands, cats = ["Same|district", "Other district,|same state", "Other state,|<500 km", "500-|1000 km", "1000-|1500 km", "1500+|km"];
    var y11 = b.filter(function (r) { return r.year === 2011; }).map(function (r) { return r.female_pct; }), y01 = b.filter(function (r) { return r.year === 2001; }).map(function (r) { return r.female_pct; });
    var w = (o && o.w) || 640;
    var full = cats;
    // below 640 px the six labels get about 50-80 px each: short words on up to three lines, so neighbours never touch
    if (w < 640) cats = ["Same|district", "Other|district", "Other|state|<500 km", "500-|1000|km", "1000-|1500|km", "1500+|km"];
    return lines([{ name: "2011", v: y11, col: "var(--opt-together)" }, { name: "2001", v: y01, col: "var(--chart-old)", dy: 4 }],
      { w: w, fs: fsz(o), cats: cats, y0: 15, y1: 50, ticks: [20, 30, 40, 50], unit: "%", pr: 46, pb: 58, label: "Women's share of people who moved to study, by distance band. 2011: " + y11.join(", ") + ". 2001: " + y01.join(", ") + "." }) +
      legend([{ cls: "line", style: "border-color:var(--opt-together)", label: "Census 2011" }, { cls: "line", style: "border-color:var(--chart-old)", label: "Census 2001" }]) +
      table(["Distance band", "2011, % women", "2011 movers", "2001, % women"], full.map(function (c, i) { return [c.replace("|", " "), y11[i].toFixed(1), b.filter(function (r) { return r.year === 2011; })[i].migrants.toLocaleString("en-IN"), y01[i].toFixed(1)]; }), "Census D-03, education migrants");
  }
  function F2(E, o) {
    var G = E.census_gravity.filter(function (r) { return /^G[12] /.test(r.model); });
    var rows = G.map(function (r) { var y = r.model.match(/(\d{4})/)[1], ed = /education/.test(r.model);
      return { name: (ed ? "Moved to study" : "Moved for work") + "|Census " + y, v: r.coef, lo: r.coef - 1.96 * r.se, hi: r.coef + 1.96 * r.se, em: ed,
        label: "odds " + r.odds_pct + "% per doubling" + (r.p < 0.001 ? ", p < 0.001" : ", p = " + r.p.toFixed(2)) }; });
    return whisker(rows, { w: (o && o.w) || 640, fs: fsz(o), min: -0.32, max: 0.06, ticks: [-0.3, -0.2, -0.1, 0], label: "Slope of women's share on log distance, with 95% intervals: " + rows.map(function (r) { return r.name.replace("|", " ") + " " + r.v.toFixed(3); }).join("; ") }) +
      table(["Model", "Slope on log km", "SE", "p", "State pairs", "Odds per doubling"], G.map(function (r) { return [r.model, r.coef.toFixed(3), r.se.toFixed(3), r.p < 0.001 ? "< 0.001" : r.p.toFixed(3), String(r.pairs), r.odds_pct + "%"]; }), "Census gravity tests");
  }
  function F3(E, o) {
    var m = E.mh_cap, pick = function (re) { return m.filter(function (r) { return re.test(r.model); }); };
    var rows = pick(/^M2a/).concat(pick(/^M2b/)).concat(pick(/^M2c/)).map(function (r) {
      var nm = /^M2a/.test(r.model) ? "All admits|same score, category, year" : /^M2b/.test(r.model) ? "Same college|and year" : "Score band|" + r.model.match(/score ([\d-]+)/)[1];
      return { name: nm, v: 100 * r.coef, lo: 100 * (r.coef - 1.96 * r.se), hi: 100 * (r.coef + 1.96 * r.se), em: /^M2a/.test(r.model),
        label: (100 * r.coef).toFixed(1) + " pp" + (r.p < 0.001 ? "" : ", p = " + r.p.toFixed(2)) };
    });
    return whisker(rows, { w: (o && o.w) || 640, fs: fsz(o), min: -6, max: 2, ticks: [-6, -4, -2, 0, 2], unit: "", label: "Women minus men, percentage points, chance of studying outside the home university region, Maharashtra CAP 2023-25: " + rows.map(function (r) { return r.name.replace("|", " ") + " " + r.v.toFixed(1); }).join("; ") }) +
      table(["Test", "Women minus men, pp", "SE, pp", "p", "Admits"], pick(/^M2/).map(function (r) { return [r.model, (100 * r.coef).toFixed(1), (100 * r.se).toFixed(1), r.p < 0.001 ? "< 0.001" : r.p.toFixed(2), r.n.toLocaleString("en-IN")]; }), "Maharashtra CAP tests");
  }
  function F4(E, o) {
    var T = E.vacancy_thirds_os;
    return pairs(T.map(function (r) { return { name: r.third.replace(" third", "") + " third", a: r.rate_F, b: r.rate_GN }; }),
      { w: (o && o.w) || 640, fs: fsz(o), colA: "var(--opt-split)", colB: "var(--chart-old)", nameA: "women-only seats empty", nameB: "open seats empty", max: 40,
        label: "Share of other-state seats left empty at NITs, by distance third: " + T.map(function (r) { return r.third + " " + r.rate_F + "% women-only, " + r.rate_GN + "% open"; }).join("; ") }) +
      legend([{ cls: "k-split", label: "women-only seats left empty" }, { style: "background:var(--chart-old);border-color:var(--chart-old)", label: "open seats left empty" }]) +
      table(["NITs by distance from their feeder states", "Women-only empty, %", "Open empty, %", "NITs"], T.map(function (r) { return [r.third, String(r.rate_F), String(r.rate_GN), String(r.nits)]; }), "Empty seats, other-state quota, 2025 and 2026 pooled");
  }
  function F9(E, o) {
    var t = E.josaa_tests.filter(function (r) { return /^T1/.test(r.test); });
    var rows = t.map(function (r) { var nm = /IIT all/.test(r.test) ? "IITs|all-India pool" : /IIIT/.test(r.test) ? "IIITs|all-India pool" : /GFTI/.test(r.test) ? "GFTIs|all-India pool" : "NITs|other-state pool";
      return { name: nm, v: r.slope_per_100km, lo: r.ci_low, hi: r.ci_high, em: /NIT other/.test(r.test), label: r.slope_per_100km.toFixed(3) + ", p = " + r.p.toFixed(2) }; });
    return whisker(rows, { w: (o && o.w) || 640, fs: fsz(o), min: -0.035, max: 0.025, ticks: [-0.03, -0.02, -0.01, 0, 0.01, 0.02], label: "Change in the women's closing-rank ratio per 100 km, with 95% intervals: " + rows.map(function (r) { return r.name.replace("|", " ") + " " + r.v.toFixed(3); }).join("; ") }) +
      table(["Test", "Slope per 100 km", "95% low", "95% high", "p", "Institutes"], t.map(function (r) { return [r.test, r.slope_per_100km.toFixed(4), r.ci_low.toFixed(4), r.ci_high.toFixed(4), r.p.toFixed(3), String(r.institutes)]; }), "JoSAA closing-rank tests");
  }
  function F19(E, o) {
    var rows = E.state_pay.slice().sort(function (a, b) { return b.gap - a.gap; }).map(function (r) { return { name: r.state, v: r.gap, em: r.state === "Bihar" || r.state === "Uttar Pradesh" }; });
    return dotplot(rows, { w: (o && o.w) || 640, fs: fsz(o), min: -2.5, max: 5, ticks: [-2, 0, 2, 4], unit: "L", label: "Best far NIT pay minus home NIT pay for a girl at her home NIT's median rank, lakh a year: " + rows.map(function (r) { return r.name + " " + r.v; }).join(", ") }) +
      table(["Home state", "Home NIT pay", "Best far NIT pay", "Gain from going far", "Far NITs in reach"], E.state_pay.map(function (r) { return [r.state, r.home_pay.toFixed(1), r.best_far_pay.toFixed(1), (r.gap > 0 ? "+" : "") + r.gap.toFixed(1), String(r.far_nits)]; }), "NIRF pay, near vs far");
  }
  function F20(E, o) {
    var b = E.last_mile_buckets, c = E.last_mile_coefs.filter(function (r) { return /^M1 /.test(r.model) && r.term === "air100"; })[0];
    return bars(b.map(function (r) { return { name: r.bucket, v: r.seat_weighted_gap_pp, n: r.nits + " NITs" }; }), { w: (o && o.w) || 640, fs: fsz(o), max: 10, ticks: ((o && o.w) < 480 ? [0, 5, 10] : [0, 2, 4, 6, 8, 10]), unit: " pp",
      label: "Women-only minus open vacancy gap by airport distance at the college end: " + b.map(function (r) { return r.bucket + " " + r.seat_weighted_gap_pp + " pp (" + r.nits + " NITs)"; }).join("; ") }) +
      '<p class="small">With distance from home and programme demand held fixed, each 100 km to the nearest airport goes with ' + c.coef.toFixed(2) + " pp (p = " + c.p.toFixed(2) + "): no sign that the college-end airport matters.</p>" +
      table(["Airport distance", "Gap, pp (seat-weighted)", "Mean of NIT gaps, pp", "NITs", "Cells"], b.map(function (r) { return [r.bucket, String(r.seat_weighted_gap_pp), String(r.mean_of_NIT_gaps_pp), String(r.nits), String(r.cells)]; }), "Last-mile buckets");
  }
  function F21(E, o) {
    var f = E.funnel, cats = f.map(function (r) { return String(r.year); });
    var pick = function (k) { return f.map(function (r) { return r[k]; }); };
    return lines([{ name: "Registered", v: pick("registered_f_pct"), col: "var(--chart-old)", dy: -6 }, { name: "Qualified", v: pick("qualified_f_pct"), col: "var(--opt-split)", dy: 8 },
      { name: "Allotted a seat", end: "Allotted", v: pick("allotted_f_pct"), col: "var(--opt-together)", dy: 2 }],
      { w: (o && o.w) || 640, fs: fsz(o), cats: cats, y0: 5, y1: 25, ticks: [5, 10, 15, 20, 25], unit: "%", every: (o && o.w) < 480 ? 3 : 1, pr: (o && o.w) < 480 ? 100 : 84, pb: 34,
        label: "Women's share at each stage of JEE Main and JoSAA, 2013 to 2026" }) +
      legend([{ cls: "line", style: "border-color:var(--chart-old)", label: "registered" }, { cls: "line", style: "border-color:var(--opt-split)", label: "qualified" }, { cls: "line", style: "border-color:var(--opt-together)", label: "allotted a seat" }]) +
      table(["Year", "Registered, % women", "Qualified", "Allotted"], f.map(function (r) { return [String(r.year), r.registered_f_pct == null ? "-" : String(r.registered_f_pct), r.qualified_f_pct == null ? "-" : String(r.qualified_f_pct), r.allotted_f_pct == null ? "-" : String(r.allotted_f_pct)]; }), "JEE funnel");
  }
  function F22(E, o) {
    var e = E.bhu_event;
    var rows = e.map(function (r) { return { name: String(r.year) + (r.year === 2023 ? "|reference" : ""), v: r.coef, lo: r.coef - 1.96 * r.se, hi: r.coef + 1.96 * r.se, em: r.year >= 2024, label: r.year === 2023 ? "0 by construction" : r.coef.toFixed(3) }; });
    return whisker(rows, { w: (o && o.w) || 640, fs: fsz(o), pl: 110, rowH: 34, min: -0.06, max: 0.16, ticks: [-0.05, 0, 0.05, 0.1, 0.15], label: "IIT-BHU minus other IITs, women's closing-rank gap, by year, with 95% intervals (2023 = 0)" }) +
      table(["Year", "BHU minus other IITs", "SE"], e.map(function (r) { return [String(r.year), r.coef.toFixed(3), r.se.toFixed(3)]; }), "BHU event study");
  }
  function F5(E, o) {
    var d = E.reddit.decides;
    var gr = [{ name: "Parents decided", n: d.parents || 0, col: "var(--opt-together)" }, { name: "Both decided", n: d.both || 0, col: "var(--opt-split)" },
      { name: "She decided", n: d.girl || 0, col: "var(--chart-him)", stroke: 1 }, { name: "Not clear", n: d.unclear || 0, hollow: 1, stroke: 1 }];
    return units(gr, { w: (o && o.w) || 640, label: "Who decides, in " + E.reddit.items + " Reddit posts and comments we tagged by hand: " + gr.map(function (g) { return g.n + " " + g.name.toLowerCase(); }).join(", ") }) +
      legend([{ cls: "k-together", label: "parents decided (" + gr[0].n + ")" }, { cls: "k-split", label: "both (" + gr[1].n + ")" }, { cls: "k-him", label: "she decided (" + gr[2].n + ")" }, { style: "background:transparent", label: "not clear (" + gr[3].n + ")" }]) +
      table(["Who decides", "Items"], gr.map(function (g) { return [g.name, String(g.n)]; }), "Reddit items by who decides");
  }

  var EV = { F1: F1, F2: F2, F3: F3, F4: F4, F5: F5, F9: F9, F19: F19, F20: F20, F21: F21, F22: F22 };

  /* mount: one entry point for build.js and figs-live.js. ctx = {M, E, RL} */
  function render(name, args, ctx, w) {
    var o = Object.assign({ w: w }, args || {});
    o.fs = args && args.fs || (ctx.fs || 17);
    if (EV[name]) return EV[name](ctx.E, o);
    switch (name) {
      case "grids": return grids(ctx.M, o);
      case "dots": return dots(ctx.M, ctx.M.families[o.fam || "village"].four.dots, o);
      case "stepper": return stepper(ctx.M, o);
      case "fixes": return fixes(ctx.M, o);
      case "ladder": return ladder(ctx.M, o);
      case "scale": return scale(ctx.M, o);
      case "ledger": return ledger(ctx.M, o);
      case "journey": return journey(ctx.M, ctx.RL, o);
    }
    throw new Error("unknown figure " + name);
  }
  return { render: render, dots: dots, layout: layout, ORDER: ORDER, FAM: FAM, FIXN: FIXN, STEPS: STEPS };
});
