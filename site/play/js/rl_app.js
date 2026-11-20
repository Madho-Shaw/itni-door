/* Itni Door? Real Life: the 4-minute class mode.
   Start (family, language) -> D1 seat -> D2 journey -> D3 worry -> D4 log kya kahenge + the family decides
   -> 100 families -> ending (side-by-side tally, the equation in one line, fixes).
   Each decision adds one model term to the live "out of 100" bar (stage 1..4); stage 4 = model v2 exactly.
   Text and numbers: content/rl_content.js. Model: js/rl_model.js. Look: css/theme.css + css/rl.css. */
(function () {
  "use strict";
  var I = window.ITNI, R = I.rl, M = R.model, RM = I.rlModel, h = I.h;
  var OPTS = ["NEAR", "TOGETHER", "SPLIT", "SON_ONLY"];
  var PLAN_OF = { Delhi: "SPLIT", Durgapur: "TOGETHER", Patna: "SON_ONLY" };

  var S = { fam: null, step: 0, her: null, plan: null, stage: 0, prevDelhi: null, picked: {}, fix: null };
  var app;

  /* ---------- helpers ---------- */
  function F() { return R.fams[S.fam]; }
  function vars(extra) {
    var f = S.fam ? F() : null, v = {};
    if (f) { v.her = f.her; v.him = f.him; v.papa = I.T(f.papa); v.mummy = I.T(f.mummy); v.home = I.T(f.home); }
    for (var k in extra) v[k] = extra[k];
    return v;
  }
  function t(key, extra) { return I.T(R.t[key], vars(extra)); }
  function cname(c) { return I.T(R.colleges[c].name); }
  function rs(n) { return I.num(Math.round(n)); }
  function hrs(x) { return (Math.round(x * 100) / 100).toString(); }
  function sum(s) { return RM.summary(M, S.fam, s || S.stage || 1, S.fix); }
  function delhiNow(stage) { return Math.round(sum(stage).dauBest * 100); }
  /* the full game (full.html) ships only with the folder; the class-mode artifact does not carry it */
  function localHost() { return location.protocol === "file:" || /^(localhost|127\.0\.0\.1)$/.test(location.hostname); }
  function present() { return document.documentElement.classList.contains("present"); }

  function chip(kind) {
    return h("span.rl-tag." + (kind === "S" ? "is-s" : kind === "D" ? "is-d" : "is-a"),
      kind === "S" ? t("sourced") : kind === "D" ? t("dramatised") : t("assumed"));
  }
  function srcBtn(ids) {
    return h("button.rl-src", { type: "button", onclick: function () { openSources(ids); }, "aria-label": t("source") }, "i " + t("source"));
  }

  /* ---------- source sheet ---------- */
  function openSources(ids) {
    closeSheet();
    var list = (ids || Object.keys(R.sources)).map(function (id) {
      var s = R.sources[id];
      return h("li", h("span", s.en),
        s.url ? h("a", { href: s.url, target: "_blank", rel: "noopener" }, s.url) : null,
        s.file ? h("code", s.file) : null);
    });
    var sheet = h("div.rl-sheet", { role: "dialog", "aria-modal": "true", "aria-label": t("sources_title") },
      h("div.rl-sheet-card",
        h("h3", t("sources_title")),
        h("ul.rl-srclist", list),
        h("p.rl-small", t("fix_caveat")),
        h("button.rl-btn.ghost", { type: "button", onclick: closeSheet }, t("close"))));
    sheet.addEventListener("click", function (e) { if (e.target === sheet) closeSheet(); });
    document.body.appendChild(sheet);
    sheet.querySelector("button").focus();
  }
  function closeSheet() { var s = document.querySelector(".rl-sheet"); if (s) s.remove(); }

  /* ---------- pieces ---------- */
  function face(who, mood) {
    var f = F();
    var o = who === "her"
      ? { skin: f.skin, hair: "braid", outfit: "kurta", colour: "her", age: 17 }
      : { skin: f.skin, hair: "short", outfit: "tshirt", colour: "him", age: 17 };
    o.expression = mood || "neutral"; o.crop = "head";
    return h("span.rl-face", { html: I.puppet(o) });
  }

  function lanes() {
    var her = S.her ? cname(S.her) : "-";
    var him = S.plan === "NEAR" ? cname("Patna") : cname("Durgapur");
    var moodHer = S.step === 3 ? "worried" : S.step >= 5 ? (S.plan === "SPLIT" ? "proud" : "hurt") : "hopeful";
    return h("div.rl-lanes",
      h("div.rl-lane.her", face("her", moodHer),
        h("div", h("b", F().her), h("span.rl-small", t("lane_rank")), h("span.rl-now", t("lane_now") + " " + her))),
      h("div.rl-lane.him", face("him", "happy"),
        h("div", h("b", F().him), h("span.rl-small", t("lane_rank")), h("span.rl-now", t("lane_now") + " " + him))));
  }

  function bar(react) {
    var st = S.stage;
    if (!st) return null;
    var p = RM.of100(RM.probs(M, S.fam, st, S.fix));
    var segs = OPTS.map(function (o) {
      return h("span.rl-seg.o-" + o, { style: { "flex-grow": String(Math.max(p[o], 0.0001)) },
        title: I.T(R.opt[o].name) + ": " + p[o] }, p[o] >= 14 ? I.T(R.opt[o].name) + " " + p[o] : (p[o] >= 5 ? String(p[o]) : ""));
    });
    var terms = [1, 2, 3, 4].map(function (k) {
      return h("span.rl-term" + (k <= st ? ".on" : ""), t("term" + k));
    });
    var x = Math.round(RM.summary(M, S.fam, st, S.fix).dauBest * 100);
    var moved = S.prevDelhi != null && S.prevDelhi !== x ? h("span.rl-was", t("bar_moved", { x: S.prevDelhi })) : null;
    return h("section.rl-bar", { "aria-live": "polite" },
      h("div.rl-bar-head", h("b", t("bar_title")), srcBtn(["model"])),
      h("div.rl-segs", { role: "img", "aria-label": OPTS.map(function (o) { return I.T(R.opt[o].name) + " " + p[o]; }).join(", ") }, segs),
      h("div.rl-legend", OPTS.map(function (o) { return h("span", h("i.o-" + o), I.T(R.opt[o].name) + " " + p[o]); })),
      h("div.rl-terms", h("span.rl-small", t("bar_counting")), terms),
      h("p.rl-delhi", t("bar_delhi", { x: x }), " ", moved),
      react || null);
  }

  function header() {
    var n = S.step >= 1 && S.step <= 4 ? t("decision_n", { n: S.step }) : "";
    var dots = [1, 2, 3, 4].map(function (k) { return h("i" + (k < S.step || S.step > 4 ? ".done" : k === S.step ? ".now" : "")); });
    return h("header.rl-head",
      h("span.rl-brand", t("title")),
      S.step >= 1 ? h("span.rl-step", h("span.rl-dots", dots), n) : null,
      h("span.rl-head-r", langToggle()));
  }

  function langToggle() {
    return h("button.rl-btn.ghost.small", { type: "button", onclick: function () { setLang(I.lang === "en" ? "hn" : "en"); } },
      I.lang === "en" ? t("lang_hn") : t("lang_en"));
  }
  function setLang(l) { I.lang = l; I.store.set("rl_lang", l); document.documentElement.lang = l === "hn" ? "hi-Latn" : "en-IN"; render(); }

  function choiceBtn(label, sub, on, key, cls) {
    return h("button.rl-choice" + (cls ? "." + cls : ""), { type: "button", "data-key": key, onclick: on },
      h("span.rl-k", String(key)), h("span.rl-choice-t", h("b", label), sub ? h("span.rl-small", sub) : null));
  }
  function nextBtn(label, on) {
    return h("button.rl-btn.main", { type: "button", "data-next": "1", onclick: on }, label || t("next"));
  }

  function pick(step, value) {
    S.picked[step] = value;
    S.prevDelhi = S.stage ? delhiNow(S.stage) : null;
    S.stage = step;
    if (step <= 3) { S.her = value; S.plan = PLAN_OF[value]; }
    else { S.plan = value; S.her = M.options[value][1]; }
    I.buzz(8);
    render();
    var b = app.querySelector(".rl-bar");
    if (b && !present()) b.scrollIntoView({ block: "start", behavior: I.reduced() ? "auto" : "smooth" });
  }
  function go(step) { S.step = step; if (step <= 4) { S.prevDelhi = null; } render(); window.scrollTo(0, 0); }

  /* ---------- screens ---------- */
  function startScreen() {
    var cards = ["village", "town", "city"].map(function (k, i) {
      var f = R.fams[k];
      var p = { skin: f.skin, age: 17, crop: "head", expression: "hopeful" };
      return h("button.rl-fam", { type: "button", "data-key": i + 1, onclick: function () { S.fam = k; go(1); } },
        h("span.rl-fam-faces",
          h("span.rl-face", { html: I.puppet(Object.assign({ hair: "braid", outfit: "kurta", colour: "her" }, p)) }),
          h("span.rl-face", { html: I.puppet(Object.assign({ hair: "short", outfit: "tshirt", colour: "him" }, p)) })),
        h("b", f.her + " & " + f.him),
        h("span", I.T(f.home)),
        h("span.rl-small", I.T(f.income)));
    });
    return h("main.rl-start",
      h("div.rl-start-top", langToggle()),
      h("h1", t("title")),
      h("p.rl-lead", t("tagline")),
      h("p.rl-small", t("how")),
      h("h2", t("pick_family")),
      h("div.rl-fams", cards),
      h("p.rl-foot", localHost() ? [h("a", { href: "full.html" }, t("full_game")), " · "] : null,
        h("button.rl-link", { type: "button", onclick: function () { openSources(); } }, t("sources_title"))));
  }

  function d1() {
    var rows = ["Delhi", "Durgapur", "Patna"].map(function (c) {
      var col = R.colleges[c], him = R.crl <= col.closeHim, her = R.crl <= col.closeHer;
      return h("tr",
        h("th", cname(c), h("span.rl-small", " " + I.T(col.where))),
        h("td.rl-num", t("lakh_yr", { x: M.pay[c].toFixed(1) })),
        h("td" + (him ? ".ok" : ".no"), him ? "✓ " : "✗ ", h("span.rl-small", t("d1_closes", { r: rs(col.closeHim) }))),
        h("td" + (her ? ".ok" : ".no"), her ? "✓ " : "✗ ", h("span.rl-small", t("d1_closes", { r: rs(col.closeHer) }))));
    });
    var table = h("table.rl-table",
      h("thead", h("tr", h("th", t("d1_col_college")), h("th", t("d1_col_pay")), h("th.him", t("d1_col_him")), h("th.her", t("d1_col_her")))),
      h("tbody", rows));
    var done = S.picked[1];
    return card(1, t("d1_title"), [
      h("p.rl-lead", t("d1_lead")),
      table,
      h("p.rl-twist", t("d1_twist")),
      h("p.rl-him", t("d1_him_note")),
      h("div.rl-srcrow", srcBtn(["josaa", "nirf"]))
    ], done ? h("p.rl-react", t("d1_react", { x: delhiNow(1) })) : null,
    done ? null : [
      choiceBtn(t("choice_delhi"), t("lakh_yr", { x: M.pay.Delhi.toFixed(1) }), function () { pick(1, "Delhi"); }, 1),
      choiceBtn(t("choice_durg"), t("lakh_yr", { x: M.pay.Durgapur.toFixed(1) }), function () { pick(1, "Durgapur"); }, 2),
      choiceBtn(t("choice_patna"), t("lakh_yr", { x: M.pay.Patna.toFixed(1) }), function () { pick(1, "Patna"); }, 3)
    ], t("d1_q"));
  }

  function legsList(c) {
    var j = M.journey[S.fam][c];
    return h("div.rl-journey",
      h("ol.rl-legs", F().legs[c].map(function (l) {
        return h("li", h("span.rl-leg-what", I.T(l.what)), h("span.rl-leg-h", l.h),
          h("span.rl-num", "₹" + rs(l.rs)), chip(l.src), l.note ? h("span.rl-small", " " + I.T(l.note)) : null);
      })),
      h("p.rl-total", t("d2_total", { h: hrs(j.hours), rs: rs(j.fare) })));
  }

  function d2() {
    var her = S.her, u = RM.utility(M, S.fam, S.plan, 4);
    var esc;
    if (u.same) esc = t("d2_escort_none");
    else if (u.J === 0) esc = t("d2_escort_local");
    else if (S.fam === "city" && her === "Delhi") esc = t("d2_escort_air", { j: u.J });
    else esc = t("d2_escort", { d: u.days, dd: u.days === 1 ? "1 day" : u.days + " days", wage: I.T(F().wage), j: u.J });
    var done = S.picked[2];
    var alts = [];
    alts.push(choiceBtn(t("d2_keep", { college: cname(her) }), null, function () { pick(2, her); }, 1));
    if (her !== "Durgapur") alts.push(choiceBtn(t("d2_together"), null, function () { pick(2, "Durgapur"); }, 2));
    if (her !== "Delhi") alts.push(choiceBtn(t("d2_keep", { college: cname("Delhi") }), null, function () { pick(2, "Delhi"); }, alts.length + 1));
    var bill = RM.utility(M, S.fam, "SPLIT", 4).moneyRs;
    return card(2, t("d2_title"), [
      h("p.rl-lead", t("d2_lead")),
      h("div.rl-two",
        h("div.rl-col.him", h("h4", t("d2_his")), legsList("Durgapur")),
        h("div.rl-col.her", h("h4", t("d2_hers", { college: cname(her) })), legsList(her))),
      h("p.rl-escort", esc, " ", u.J && !u.same && !(S.fam === "city" && her === "Delhi") ? chip(F().wageSrc) : null),
      h("p.rl-bill", t("d2_bill", { rs: rs(u.moneyRs) })),
      h("div.rl-srcrow", srcBtn(["journeys", "confirmtkt", "goibibo_rr", "erail", "ixigo_bgs", "rome2rio_bgs", "ixigo_air", "rome2rio_narela", "rome2rio_t3", "wage", "model"]))
    ], done ? h("p.rl-react", t("d2_react", { bill: rs(bill) })) : null,
    done ? null : alts, t("d2_q"));
  }

  function d3() {
    var her = S.her, j = M.journey[S.fam][her];
    var calls = Math.max(1, Math.ceil(j.hours / 2));
    var phones = [];
    for (var i = 0; i < Math.min(calls, 14); i++) phones.push(h("i.rl-phone", { "aria-hidden": "true" }));
    var done = S.picked[3];
    var alts = [];
    alts.push(choiceBtn(t("d3_stay", { college: cname(her) }), null, function () { pick(3, her); }, 1));
    if (her !== "Durgapur") alts.push(choiceBtn(t("d3_bro"), null, function () { pick(3, "Durgapur"); }, alts.length + 1));
    if (her !== "Patna") alts.push(choiceBtn(t("d3_near", { h: hrs(M.journey[S.fam].Patna.hours) }), null, function () { pick(3, "Patna"); }, alts.length + 1));
    return card(3, t("d3_title"), [
      h("p.rl-quote", t("d3_lead"), " ", chip("D")),
      h("p.rl-big", t("d3_reach", { h: hrs(j.hours) })),
      h("p", t("d3_calls")),
      h("div.rl-phones", phones, h("span.rl-small", t("d3_calls_n", { n: calls }))),
      h("p.rl-him", t("d3_him")),
      h("p.rl-small", t("d3_known", { n: M.families[S.fam].n })),
      h("div.rl-srcrow", srcBtn(["journeys", "model"]))
    ], done ? h("p.rl-react", t("d3_react")) : null,
    done ? null : alts, t("d3_q"));
  }

  function d4() {
    var done = S.picked[4];
    var alts = OPTS.map(function (o, i) {
      return choiceBtn(I.T(R.opt[o].name), I.T(R.opt[o].line), function () { pick(4, o); }, i + 1, "o-" + o);
    });
    return card(4, t("d4_title"), [
      h("p.rl-quote", t("d4_line")),
      h("p.rl-quote.him", t("d4_him")),
      h("p", t("d4_note")),
      h("div.rl-srcrow", srcBtn(["model"]))
    ], done ? h("p.rl-react", t("d4_react", { x: delhiNow(4) })) : null, done ? null : alts, t("d4_q"));
  }

  /* one decision card: body, reaction after the pick, the choices (or Next), the question */
  function card(n, title, body, react, choices, q) {
    var done = !!S.picked[n];
    return h("main.rl-main.d" + n + (!done && n !== 2 && choices && choices.length > 2 ? ".has-choices" : ""),
      lanes(),
      bar(react),
      h("section.rl-card",
        h("h2", title),
        body,
        done ? h("p.rl-picked", t("you_picked") + ": " + pickedLabel(n)) : null),
      h("div.rl-dock",
        done ? null : h("p.rl-q", q),
        done ? nextBtn(null, function () { go(n + 1); }) : h("div.rl-choices", choices)));
  }
  function pickedLabel(n) {
    var v = S.picked[n];
    return n === 4 ? I.T(R.opt[v].name) : cname(v);
  }

  function resultScreen() {
    var p = RM.of100(RM.probs(M, S.fam, 4, null));
    var dots = [];
    OPTS.forEach(function (o) { for (var i = 0; i < p[o]; i++) dots.push(h("i.o-" + o + (o === S.plan ? ".mine" : ""))); });
    var top = OPTS.reduce(function (a, b) { return p[b] > p[a] ? b : a; });
    return h("main.rl-main",
      lanes(),
      h("section.rl-card",
        h("h2", t("res_title")),
        h("div.rl-grid", { role: "img", "aria-label": OPTS.map(function (o) { return I.T(R.opt[o].name) + " " + p[o]; }).join(", ") }, dots),
        h("div.rl-legend", OPTS.map(function (o) { return h("span", h("i.o-" + o), I.T(R.opt[o].name) + " " + p[o]); })),
        h("p.rl-small", t("res_legend")),
        h("p.rl-lead", t("res_you", { plan: I.T(R.opt[S.plan].name), x: p[S.plan] })),
        h("p", t("res_most", { plan: I.T(R.opt[top].name), x: p[top] })),
        h("div.rl-srcrow", srcBtn(["model"]))),
      h("div.rl-dock", nextBtn(null, function () { go(6); })));
  }

  function endScreen() {
    var s = RM.summary(M, S.fam, 4, null);
    var him = Math.round(s.sonBest * 100), her = Math.round(s.dauBest * 100);
    var other = {};
    ["village", "town", "city"].forEach(function (k) { other[k[0]] = Math.round(RM.summary(M, k, 4, null).dauBest * 100); });
    var fixBox = h("div.rl-fixout", { "aria-live": "polite" });
    var fixes = ["fares", "credit", "senior", "hostel"].map(function (k) {
      return h("button.rl-btn.ghost", { type: "button", onclick: function (e) {
        var x = Math.round(RM.summary(M, S.fam, 4, M.fixes[k]).dauBest * 100);
        Array.prototype.forEach.call(e.currentTarget.parentNode.children, function (b) { b.classList.remove("on"); });
        e.currentTarget.classList.add("on");
        fixBox.textContent = t("fix_result", { x: x, y: her });
        fixBox.className = "rl-fixout " + (x - her >= 20 ? "big" : "small");
      } }, t("fix_" + k));
    });
    return h("main.rl-main.rl-end",
      h("h1", t("end_head")),
      h("div.rl-tally",
        h("div.rl-t.him", face("him", "happy"), h("b", t("end_him")), h("span.rl-hero", him), h("span", t("end_of100", { x: him }))),
        h("div.rl-t.her", face("her", her >= 50 ? "proud" : "hurt"), h("b", t("end_her")), h("span.rl-hero", her), h("span", t("end_of100", { x: her })))),
      h("p.rl-lead", her >= 90 ? t("end_why_city") : t("end_why")),
      h("section.rl-eq",
        h("span.rl-small", t("end_eq_label")),
        h("p.rl-eq-line", "U = H·(pay", h("sub", "son"), " + pay", h("sub", "daughter"), ") − λ·M − (σ / (1 + n + b·same) + τ) · R"),
        h("p.rl-small", t("end_eq_words"))),
      h("p.rl-other", t("end_other", { v: other.v, t: other.t, c: other.c })),
      h("section.rl-fix",
        h("h3", t("fix_title")),
        h("div.rl-fixes", fixes),
        fixBox,
        h("p.rl-small", t("fix_moral"), " ", t("fix_caveat"))),
      h("div.rl-srcrow", srcBtn(["model", "nirf", "josaa", "journeys", "wage"])),
      h("div.rl-dock.end",
        h("button.rl-btn.ghost", { type: "button", onclick: function () { reset(S.fam); } }, t("restart")),
        h("button.rl-btn.main", { type: "button", onclick: function () { reset(null); } }, t("other_family"))));
  }

  function reset(fam) { S = { fam: fam, step: fam ? 1 : 0, her: null, plan: null, stage: 0, prevDelhi: null, picked: {}, fix: null }; render(); window.scrollTo(0, 0); }

  /* ---------- render + keys ---------- */
  function render() {
    closeSheet();
    app.innerHTML = "";
    if (!S.fam || S.step === 0) { app.appendChild(startScreen()); return; }
    app.appendChild(header());
    var scr = [null, d1, d2, d3, d4, resultScreen, endScreen][S.step];
    app.appendChild(scr());
  }

  document.addEventListener("keydown", function (e) {
    if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    if (e.key === "Escape") { closeSheet(); return; }
    if (document.querySelector(".rl-sheet")) return;
    if (/^[1-4]$/.test(e.key)) {
      var b = app.querySelector('[data-key="' + e.key + '"]');
      if (b) { b.click(); e.preventDefault(); }
    } else if (e.key === "Enter" || e.key === "ArrowRight" || e.key === " ") {
      var n = app.querySelector("[data-next]");
      if (n && document.activeElement !== n) { n.click(); e.preventDefault(); }
    }
  });

  function boot() {
    app = document.getElementById("app");
    var q = location.search + location.hash;
    if (/present/.test(q)) document.documentElement.classList.add("present");
    var l = (q.match(/lang=(en|hn)/) || [])[1] || (/-hn/.test(q) ? "hn" : null) || I.store.get("rl_lang");
    if (l) I.lang = l;
    var fm = (q.match(/(village|town|city)/) || [])[1];
    if (fm) S.fam = fm, S.step = 1;
    render();
  }
  I.rlApp = { state: function () { return S; }, reset: reset, render: render };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
