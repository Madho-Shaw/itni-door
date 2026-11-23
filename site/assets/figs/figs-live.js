/* Browser side of the figures: re-render every [data-fig] at its real width (text stays at real pixel sizes),
   wire the stepper and fixes buttons, open source sheets for chips, and switch #present on.
   Pages work without this file: tools/build.js has already put a static render of every figure in the HTML. */
(function () {
  "use strict";
  var root = document.documentElement;
  if (/present/.test(location.search + location.hash)) root.classList.add("present");
  var ctx = { M: window.MODEL_V2, E: window.EVIDENCE, RL: window.ITNI && window.ITNI.rl };
  function fs() { var r = parseFloat(getComputedStyle(root).fontSize); return root.classList.contains("present") ? Math.round(r * 1.1) : Math.max(17, Math.round(r * 0.95)); }

  function draw(el) {
    var args = el.getAttribute("data-args"), a = args ? JSON.parse(args) : {};
    if (el._state) Object.assign(a, el._state);
    var w = Math.floor(el.clientWidth);
    if (!w) return;
    el.innerHTML = window.FIGS.render(el.getAttribute("data-fig"), a, Object.assign({ fs: fs() }, ctx), w);
    el._w = w;
  }
  function all() {
    if (!ctx.M) return;
    Array.prototype.forEach.call(document.querySelectorAll("[data-fig]"), draw);
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-step],button[data-fam],button[data-fix]");
    if (b) {
      var el = b.closest("[data-fig]");
      if (!el) return;
      el._state = el._state || {};
      if (b.dataset.step) el._state.step = Number(b.dataset.step);
      if (b.dataset.fam) el._state.fam = b.dataset.fam;
      if (b.dataset.fix) el._state.fix = b.dataset.fix;
      var key = b.dataset.step ? "step" : b.dataset.fam ? "fam" : "fix";
      draw(el);
      var again = el.querySelector('button[data-' + key + '="' + b.dataset[key] + '"]');
      if (again) again.focus();
      return;
    }
    var c = e.target.closest("a.chip[data-src], button.chip[data-src]");
    if (c) { e.preventDefault(); sheet(c); }
  });

  /* source sheet: the chip carries data-src (what), data-file (where it lives), data-url (web page) */
  var dlg;
  function sheet(c) {
    if (!dlg) {
      dlg = document.createElement("dialog");
      dlg.className = "sheet";
      document.body.appendChild(dlg);
      dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    }
    var h = '<button class="close" type="button" aria-label="Close">×</button><h2>' + esc(c.textContent.trim()) + "</h2><p>" + esc(c.dataset.src) + "</p>";
    if (c.dataset.file) h += '<p class="small">File: <code>' + esc(c.dataset.file) + "</code></p>";
    if (c.dataset.url) h += '<p class="small"><a href="' + esc(c.dataset.url) + '" rel="noopener">Open the source page</a></p>';
    if (c.getAttribute("href")) h += '<p class="small"><a href="' + esc(c.getAttribute("href")) + '">See it in the evidence room</a></p>';
    dlg.innerHTML = h;
    dlg.querySelector(".close").addEventListener("click", function () { dlg.close(); });
    dlg.showModal();
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  var t;
  window.addEventListener("resize", function () {
    clearTimeout(t);
    t = setTimeout(function () {
      Array.prototype.forEach.call(document.querySelectorAll("[data-fig]"), function (el) { if (Math.abs(el.clientWidth - (el._w || 0)) > 8) draw(el); });
    }, 150);
  });
  window.addEventListener("hashchange", function () { root.classList.toggle("present", /present/.test(location.hash)); all(); });

  /* ---- motion (only with motion allowed; nothing here is needed to read a figure)
     A figure that scrolls up into view fills its dots in order and grows its bars, once. A figure already on screen at load,
     or never scrolled to, stays exactly as drawn. Only opacity and transform move; the final frame is the drawn figure. */
  var calm = !window.matchMedia || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var io = null;
  function watch() {
    if (calm || !("IntersectionObserver" in window) || root.classList.contains("present")) return;
    root.classList.add("mo");
    var near = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting && e.boundingClientRect.top > window.innerHeight * 0.6) { e.target.classList.add("armed"); near.unobserve(e.target); io.observe(e.target); } });
    }, { rootMargin: "0px 0px 240px 0px" });
    io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.intersectionRatio >= 0.3 || (e.isIntersecting && e.intersectionRect.height > window.innerHeight * 0.3)) {
        e.target.classList.remove("armed"); e.target.classList.add("play"); io.unobserve(e.target); } });
    }, { threshold: [0, 0.1, 0.2, 0.3] });
    Array.prototype.forEach.call(document.querySelectorAll("[data-fig]"), function (el) {
      if (!el.querySelector(".dot, .bar")) return;
      var r = el.getBoundingClientRect();
      if (r.height && r.top > window.innerHeight) near.observe(el);   // below the fold: arm just before it arrives
    });
  }
  // after a button press: the dots whose option changed pop, so the eye sees what moved (and only those)
  var redraw = draw;
  draw = function (el) {
    var before = el._w && !calm ? Array.prototype.map.call(el.querySelectorAll("svg"), function (s) {
      return Array.prototype.map.call(s.querySelectorAll(".dot"), function (d) { return d.getAttribute("fill"); }); }) : null;
    redraw(el);
    if (!before) return;
    el.classList.remove("armed", "play");
    Array.prototype.forEach.call(el.querySelectorAll("svg"), function (s, i) {
      var old = before[i]; if (!old || !old.length) return;
      Array.prototype.forEach.call(s.querySelectorAll(".dot"), function (d, k) { if (old[k] !== d.getAttribute("fill")) d.classList.add("chg"); });
    });
  };
  window.addEventListener("beforeprint", function () { Array.prototype.forEach.call(document.querySelectorAll(".armed"), function (el) { el.classList.remove("armed"); }); });

  /* ---- contents: mark the part you are reading (report and evidence pages) */
  function spy() {
    var toc = document.querySelector("nav.toc-d");
    if (!toc) return;
    var links = Array.prototype.slice.call(toc.querySelectorAll('a[href^="#"]')), heads = links.map(function (a) {
      return document.getElementById(decodeURIComponent(a.getAttribute("href").slice(1))); });
    root.classList.add("spy");
    var cur = null, tick = false;
    function mark() {
      tick = false;
      var at = 0, line = Math.min(160, window.innerHeight * 0.25);
      heads.forEach(function (h, i) { if (h && h.getBoundingClientRect().top <= line) at = i; });
      if (links[at] === cur) return;
      if (cur) { cur.classList.remove("is-here"); cur.removeAttribute("aria-current"); }
      Array.prototype.forEach.call(toc.querySelectorAll(".is-open"), function (li) { li.classList.remove("is-open"); });
      cur = links[at]; cur.classList.add("is-here"); cur.setAttribute("aria-current", "location");
      for (var li = cur.closest("li"); li && toc.contains(li); li = li.parentElement.closest("li")) li.classList.add("is-open");
      var tr = toc.getBoundingClientRect(), cr = cur.getBoundingClientRect();
      if (cr.top < tr.top || cr.bottom > tr.bottom) toc.scrollTop += cr.top - tr.top - tr.height / 3;
    }
    window.addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(mark); } }, { passive: true });
    mark();
  }

  /* ---- tables that scroll sideways: .more while there is more to the right (report.css draws a soft shade on that edge) */
  function edges() {
    var boxes = Array.prototype.slice.call(document.querySelectorAll(".rpt .tbl, .rpt .quarto-float > div"));
    if (!boxes.length) return;
    function mark(b) { b.classList.toggle("wide", b.scrollWidth > b.clientWidth + 2); b.classList.toggle("more", b.scrollWidth - b.scrollLeft - b.clientWidth > 2); }
    boxes.forEach(function (b) { mark(b); b.addEventListener("scroll", function () { mark(b); }, { passive: true }); });
    window.addEventListener("resize", function () { boxes.forEach(mark); });
  }

  function start() { all(); watch(); spy(); edges(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
  window.addEventListener("beforeprint", all);
})();
