/* Small helpers shared by the engine and every ui file. No text lives here. */
(function () {
  "use strict";
  var I = window.ITNI = window.ITNI || {};
  I.ui = I.ui || {};
  I.lang = I.lang || "en";

  /* h("div.slip.big", {onclick: fn, "aria-label": "x"}, child, "text", [more]) */
  I.h = function (spec, attrs) {
    var idAt = spec.indexOf("#"), id = "", i, k;
    if (idAt >= 0) { id = spec.slice(idAt + 1).split(".")[0]; spec = spec.slice(0, idAt) + spec.slice(idAt + 1 + id.length); }
    var parts = spec.split("."), el = document.createElement(parts[0] || "div");
    if (parts.length > 1) el.className = parts.slice(1).join(" ");
    if (id) el.id = id;
    var kids = Array.prototype.slice.call(arguments, 1);
    if (attrs && typeof attrs === "object" && !attrs.nodeType && !Array.isArray(attrs)) {
      kids.shift();
      for (k in attrs) {
        var v = attrs[k];
        if (v == null || v === false) continue;
        if (k === "html") el.innerHTML = v;
        else if (k === "class") el.className += (el.className ? " " : "") + v;
        else if (k === "style" && typeof v === "object") { for (var s in v) el.style.setProperty(s, v[s]); }
        else if (k.slice(0, 2) === "on" && typeof v === "function") el.addEventListener(k.slice(2), v);
        else if (k === "disabled" || k === "checked" || k === "hidden") el[k] = !!v;
        else el.setAttribute(k, v === true ? "" : v);
      }
    }
    (function add(list) {
      for (var i = 0; i < list.length; i++) {
        var c = list[i];
        if (c == null || c === false) continue;
        if (Array.isArray(c)) add(c);
        else el.appendChild(c.nodeType ? c : document.createTextNode(String(c)));
      }
    })(kids);
    return el;
  };

  /* T object -> string in the current language, placeholders filled. */
  I.T = function (t, vars) {
    if (t == null) return "";
    var s = typeof t === "object" ? (t[I.lang] != null && t[I.lang] !== "" ? t[I.lang] : t.en) : t;
    if (s == null) return "";
    s = String(s);
    if (s.indexOf("{") < 0) return s;
    var base = I.vars ? I.vars() : {};
    return s.replace(/\{(\w+)\}/g, function (m, k) {
      if (vars && vars[k] != null) return vars[k];
      if (base[k] != null) return base[k];
      return m;
    });
  };
  /* UI label from content strings.js */
  I.s = function (key, vars) {
    var t = I.strings && I.strings[key];
    if (t == null) { if (I.missing) I.missing[key] = 1; return "[" + key + "]"; }
    return I.T(t, vars);
  };
  I.has = function (key) { return !!(I.strings && I.strings[key] != null); };
  I.missing = {};

  I.clamp = function (x, a, b) { return Math.max(a, Math.min(b, x)); };
  I.pct = function (p) { return Math.round(p * 100) + "%"; };
  I.num = function (n) { return Number(n).toLocaleString("en-IN"); };
  I.clone = function (o) { return JSON.parse(JSON.stringify(o)); };
  I.merge = function (a, b) {           /* deep merge b over a, returns new */
    var out = Array.isArray(a) ? a.slice() : Object.assign({}, a), k;
    for (k in b || {}) {
      out[k] = (b[k] && typeof b[k] === "object" && !Array.isArray(b[k]) && a && a[k] && typeof a[k] === "object")
        ? I.merge(a[k], b[k]) : b[k];
    }
    return out;
  };

  /* Seeded dice: same seed + same key = same number in [0,1). */
  I.dice = function (seed, key) {
    var str = String(seed) + "|" + key, h = 2166136261 >>> 0, i;
    for (i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    h += 0x6D2B79F5; var t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  I.reduced = function () {
    try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; }
  };
  /* A phone-sized window that is not the projector: the header goes on a diet there (design round 1). */
  I.narrow = function () {
    try { return !(I.cfg && I.cfg.present) && window.matchMedia("(max-width: 859px)").matches; } catch (e) { return false; }
  };
  /* A tiny buzz where the device has one; never an error where it does not. */
  I.buzz = function (ms) { try { if (!I.reduced() && navigator.vibrate) navigator.vibrate(ms || 10); } catch (e) { /* no vibration */ } };
  I.store = {
    get: function (k) { try { return window.localStorage.getItem("itni." + k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem("itni." + k, v); } catch (e) { /* private mode */ } }
  };

  /* One shared tooltip for chart marks: I.tip(el, "text") */
  var tipEl;
  I.tip = function (el, text) {
    el.setAttribute("tabindex", "0");
    el.setAttribute("data-tip", "1");          /* a tooltip carrier (focus or hover shows the words), not a control to tap */
    el.setAttribute("aria-label", text);
    function show() {
      if (!tipEl) { tipEl = I.h("div.tip", { role: "tooltip" }); document.body.appendChild(tipEl); }
      tipEl.textContent = text; tipEl.hidden = false;
      var r = el.getBoundingClientRect(), w = tipEl.offsetWidth, x = r.left + r.width / 2 - w / 2;
      tipEl.style.left = I.clamp(x, 8, window.innerWidth - w - 8) + "px";
      tipEl.style.top = Math.max(8, r.top - tipEl.offsetHeight - 8) + "px";
    }
    function hide() { if (tipEl) tipEl.hidden = true; }
    el.addEventListener("pointerenter", show); el.addEventListener("pointerleave", hide);
    el.addEventListener("focus", show); el.addEventListener("blur", hide);
    return el;
  };

  /* A wobbly red-pen line across a box: returns an svg element sized to its parent. */
  I.penStrike = function (animate) {
    var d = "M2 " + (52 + Math.random() * 10) + " C 22 " + (38 + Math.random() * 10) + ", 40 " + (62 - Math.random() * 8) +
      ", 60 " + (46 + Math.random() * 8) + " S 88 " + (40 + Math.random() * 12) + ", 98 " + (46 + Math.random() * 10);
    var wrap = I.h("span.pen" + (animate ? ".draw" : ""), { "aria-hidden": "true" });
    wrap.innerHTML = '<svg viewBox="0 0 100 100" preserveAspectRatio="none"><path pathLength="1" d="' + d + '"/></svg>';
    return wrap;
  };
})();
