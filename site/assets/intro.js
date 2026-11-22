/* Itni Door? hub intro (about 12 s). Loaded by the hub only when the intro plays, after vendor/gsap.min.js.
   Four slips of paper are laid on the desk one over the other: the project, what we asked (with the red-pen line from
   Saharsa to Delhi), what we found, and where our model breaks. Every word and number is in the hub HTML (#intro),
   so the number check reads them and a screen reader hears all four cards. Transform and opacity only, plus one
   stroke-dashoffset on the route line. Skip button, Esc or a click anywhere ends it; focus is held in the dialog
   (everything else is inert) and handed to the hub's heading after. Reduced motion: the still cards, no timeline. */
(function () {
  "use strict";
  var d = document.documentElement, el = document.getElementById("intro");
  if (!el) return;
  var skip = el.querySelector(".intro-skip"), beats = el.querySelectorAll(".intro-beat");
  var tl = null, ending = false, held = [];

  function lock() {
    held = [];
    Array.prototype.forEach.call(document.body.children, function (c) {
      if (c !== el && c.tagName !== "SCRIPT" && !c.hasAttribute("inert")) { c.setAttribute("inert", ""); held.push(c); }
    });
    skip.focus({ preventScroll: true });
  }
  function close() {
    if (tl) { tl.kill(); tl = null; }
    held.forEach(function (c) { c.removeAttribute("inert"); }); held = [];
    if (window.gsap) gsap.set([el].concat(Array.prototype.slice.call(el.querySelectorAll(".intro-beat, .intro-beat *"))), { clearProps: "all" });
    el.hidden = true; el.scrollTop = 0; ending = false;
    d.classList.remove("intro-on");
    var h = document.querySelector("main h1");
    if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true });
      h.addEventListener("blur", function () { h.removeAttribute("tabindex"); }, { once: true }); }
  }
  function end() {
    if (ending || el.hidden) return;
    ending = true;
    if (window.itniIntroStill || !window.gsap) return close();
    if (tl) tl.pause();
    gsap.to(el, { yPercent: -104, rotation: -1.2, duration: .6, ease: "power3.inOut", onComplete: close });   // the sheet lifts off the hub
  }

  function timeline() {
    var b = beats, path = el.querySelector(".intro-route path"), len = path.getTotalLength();
    var $ = function (i, s) { return b[i].querySelectorAll(s); };
    gsap.set(el, { yPercent: 0, rotation: 0 });
    gsap.set(b, { autoAlpha: 0 });
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    tl = gsap.timeline({ defaults: { ease: "power3.out" }, onComplete: end });

    // 1. the project: the title slip is laid down, its name drops in, the six parts are pinned on
    tl.fromTo(b[0], { autoAlpha: 0, y: 40, rotation: 3 }, { autoAlpha: 1, y: 0, rotation: -1.2, duration: .7 }, .15)
      .from($(0, ".intro-title span"), { autoAlpha: 0, yPercent: 60, rotation: 4, stagger: .1, duration: .6 }, .35)
      .from($(0, ".intro-label"), { autoAlpha: 0, duration: .4, stagger: .2 }, .5)
      .from($(0, ".intro-tags li"), { autoAlpha: 0, y: -14, scale: 1.15, stagger: .07, duration: .35, ease: "back.out(2)" }, .9);

    // 2. what we asked: a new slip slides over from the right; the red pen draws Saharsa to Delhi
    tl.to(b[0], { x: "-14vw", rotation: -4, autoAlpha: 0, duration: .55, ease: "power2.in" }, 2.5)
      .fromTo(b[1], { autoAlpha: 0, x: "55vw", rotation: 7 }, { autoAlpha: 1, x: 0, rotation: 1, duration: .7 }, 2.5)
      .from($(1, ".intro-label"), { autoAlpha: 0, duration: .3 }, 2.8)
      .from($(1, ".intro-big span"), { autoAlpha: 0, y: 18, stagger: .28, duration: .45 }, 2.85)
      .from($(1, ".intro-route circle, .intro-route text"), { autoAlpha: 0, scale: 0, transformOrigin: "50% 50%", stagger: .08, duration: .3, ease: "back.out(2)" }, 3.6)
      .to(path, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" }, 3.85)
      .from($(1, ".intro-hand"), { autoAlpha: 0, x: -12, duration: .45 }, 4.8);

    // 3. what we found: from the left; the three numbers are stamped, no counting up
    tl.to(b[1], { x: "14vw", rotation: 4, autoAlpha: 0, duration: .55, ease: "power2.in" }, 5.9)
      .fromTo(b[2], { autoAlpha: 0, x: "-55vw", rotation: -7 }, { autoAlpha: 1, x: 0, rotation: -.8, duration: .7 }, 5.9)
      .from($(2, ".intro-label")[0], { autoAlpha: 0, duration: .3 }, 6.2)
      .from($(2, ".intro-big"), { autoAlpha: 0, y: 16, duration: .5 }, 6.25)
      .from($(2, "p:not(.intro-label):not(.intro-big)"), { autoAlpha: 0, duration: .35 }, 6.7)
      .from($(2, ".intro-nums b"), { autoAlpha: 0, scale: 1.6, rotation: -6, stagger: .16, duration: .4, ease: "back.out(1.8)" }, 6.85)
      .from($(2, ".intro-nums span"), { autoAlpha: 0, stagger: .16, duration: .3 }, 7.0)
      .from($(2, ".intro-label")[1], { autoAlpha: 0, duration: .35 }, 7.5);

    // 4. where our model breaks: from below, each limit struck in with the red pen
    tl.to(b[2], { y: "-8vh", rotation: -3, autoAlpha: 0, duration: .55, ease: "power2.in" }, 8.5)
      .fromTo(b[3], { autoAlpha: 0, y: "45vh", rotation: 5 }, { autoAlpha: 1, y: 0, rotation: .6, duration: .7 }, 8.5)
      .from($(3, ".intro-label"), { autoAlpha: 0, duration: .3 }, 8.8)
      .from($(3, "li"), { autoAlpha: 0, x: -16, stagger: .3, duration: .4 }, 8.9)
      .to({}, { duration: 1.7 });   // hold to read, then the sheet lifts (about 11.8 s in all)
  }

  function play() {
    ending = false;
    lock();
    if (window.itniIntroStill || !window.gsap) { skip.textContent = "Close"; el.scrollTop = 0; return; }
    skip.textContent = "Skip intro";
    timeline();
  }

  skip.addEventListener("click", function (e) { e.stopPropagation(); end(); });
  el.addEventListener("click", function () { if (!window.itniIntroStill) end(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !el.hidden) { e.preventDefault(); end(); } });
  addEventListener("beforeprint", function () { if (!el.hidden) close(); });

  window.itniIntroPlay = function () { el.classList.toggle("still", !!window.itniIntroStill); play(); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", play, { once: true }); else play();
})();
