/* Itni Door? hub intro. Loaded by the hub only when the intro plays, together with vendor/gsap.min.js.
   Two versions share this file: "duo" (Kajal and Kundan, cut-paper figures, tell it in speech bubbles, about 14 s)
   and "slips" (four paper slips laid one over another, about 11 s). Every word and number is in the hub HTML
   (#intro), so the number check reads them and a screen reader hears them. Transform and opacity only, plus
   one stroke-dashoffset. Any key, click or tap ends it; focus is held in the dialog (the page behind is inert)
   and handed to the hub's heading after. Reduced motion: the still cards, no timeline. */
(function () {
  "use strict";
  var d = document.documentElement, el = document.getElementById("intro");
  if (!el) return;
  var skip = el.querySelector(".intro-skip");
  var tl = null, loops = [], ending = false, held = [];
  var MOD = { Shift: 1, Control: 1, Alt: 1, Meta: 1, CapsLock: 1, Fn: 1 };

  function lock() {
    held = [];
    Array.prototype.forEach.call(document.body.children, function (c) {
      if (c !== el && c.tagName !== "SCRIPT" && !c.hasAttribute("inert")) { c.setAttribute("inert", ""); held.push(c); }
    });
    skip.focus({ preventScroll: true });
  }
  function close() {
    if (tl) { tl.kill(); tl = null; }
    loops.forEach(function (t) { t.kill(); }); loops = [];
    held.forEach(function (c) { c.removeAttribute("inert"); }); held = [];
    if (window.gsap) gsap.set([el].concat(Array.prototype.slice.call(el.querySelectorAll("*"))), { clearProps: "transform,opacity,visibility,strokeDasharray,strokeDashoffset" });
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
    gsap.to(el, { yPercent: -104, rotation: -1.2, duration: .55, ease: "power3.inOut", onComplete: close });   // the sheet lifts off the hub
  }

  /* ---------------------------------------------------------------- slips */
  function slips() {
    var b = el.querySelectorAll(".intro-beat"), path = el.querySelector(".intro-route path"), len = path.getTotalLength();
    var $ = function (i, s) { return b[i].querySelectorAll(s); };
    gsap.set(b, { autoAlpha: 0 });
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    tl = gsap.timeline({ defaults: { ease: "power3.out" }, onComplete: end });
    tl.fromTo(b[0], { autoAlpha: 0, y: 40, rotation: 3 }, { autoAlpha: 1, y: 0, rotation: -1.2, duration: .6 }, .1)
      .from($(0, ".intro-title span"), { autoAlpha: 0, yPercent: 60, rotation: 4, stagger: .1, duration: .5 }, .25)
      .from($(0, ".intro-label"), { autoAlpha: 0, duration: .35, stagger: .15 }, .4)
      .from($(0, ".intro-tags li"), { autoAlpha: 0, y: -14, scale: 1.15, stagger: .06, duration: .3, ease: "back.out(2)" }, .7);
    tl.to(b[0], { x: "-14vw", rotation: -4, autoAlpha: 0, duration: .5, ease: "power2.in" }, 2.1)
      .fromTo(b[1], { autoAlpha: 0, x: "55vw", rotation: 7 }, { autoAlpha: 1, x: 0, rotation: 1, duration: .6 }, 2.1)
      .from($(1, ".intro-label"), { autoAlpha: 0, duration: .3 }, 2.35)
      .from($(1, ".intro-big span"), { autoAlpha: 0, y: 18, stagger: .25, duration: .4 }, 2.4)
      .from($(1, ".intro-route circle, .intro-route text"), { autoAlpha: 0, scale: 0, transformOrigin: "50% 50%", stagger: .07, duration: .3, ease: "back.out(2)" }, 3.05)
      .to(path, { strokeDashoffset: 0, duration: .9, ease: "power2.inOut" }, 3.25)
      .from($(1, ".intro-hand"), { autoAlpha: 0, x: -12, duration: .4 }, 4.0);
    tl.to(b[1], { x: "14vw", rotation: 4, autoAlpha: 0, duration: .5, ease: "power2.in" }, 5.1)
      .fromTo(b[2], { autoAlpha: 0, x: "-55vw", rotation: -7 }, { autoAlpha: 1, x: 0, rotation: -.8, duration: .6 }, 5.1)
      .from($(2, ".intro-label")[0], { autoAlpha: 0, duration: .3 }, 5.35)
      .from($(2, ".intro-big"), { autoAlpha: 0, y: 16, duration: .45 }, 5.4)
      .from($(2, "p:not(.intro-label):not(.intro-big)"), { autoAlpha: 0, duration: .3 }, 5.8)
      .from($(2, ".intro-nums b"), { autoAlpha: 0, scale: 1.4, rotation: -6, stagger: .14, duration: .35, ease: "back.out(1.8)" }, 5.95)
      .from($(2, ".intro-nums span"), { autoAlpha: 0, stagger: .14, duration: .3 }, 6.1)
      .from($(2, ".intro-label")[1], { autoAlpha: 0, duration: .3 }, 6.5);
    tl.to(b[2], { y: "-8vh", rotation: -3, autoAlpha: 0, duration: .5, ease: "power2.in" }, 7.6)
      .fromTo(b[3], { autoAlpha: 0, y: "45vh", rotation: 5 }, { autoAlpha: 1, y: 0, rotation: .6, duration: .6 }, 7.6)
      .from($(3, ".intro-label"), { autoAlpha: 0, duration: .3 }, 7.85)
      .from($(3, "li"), { autoAlpha: 0, x: -16, stagger: .28, duration: .35 }, 7.9)
      .to({}, { duration: 1.9 });   // hold to read; about 10.5 s, then the sheet lifts
  }

  /* ---------------------------------------------------------------- duo */
  function duo() {
    var D = el.querySelector(".duo"), q = function (s) { return D.querySelector(s); }, qa = function (s) { return D.querySelectorAll(s); };
    var her = q(".kid.her"), him = q(".kid.him"), line = q(".duo-line"), ground = q(".duo-ground");
    var title = q(".duo-title"), bHim = q(".b-him"), bAunt = q(".b-aunt"), bPapa = q(".b-papa"), cFound = q(".c-found"), cLimits = q(".c-limits");
    var G = ground.getBoundingClientRect(), cx = function (n) { var r = n.getBoundingClientRect(); return r.left + r.width / 2 - G.left; };
    var herX = cx(her), himX = cx(him), delhiX = cx(q(".p-delhi")), dgpX = cx(q(".p-dgp"));
    var toDelhi = delhiX - herX + her.offsetWidth * .8, nudge = Math.max(0, Math.min(36, dgpX - himX - him.offsetWidth * .9));   // they stop short of the signposts
    // the red line runs from Delhi's pin to Kundan; it shows only the part between the two of them
    var full = himX - delhiX; gsap.set(line, { left: delhiX, width: full, scaleX: (himX - herX) / full, transformOrigin: "100% 50%" });
    var talk = function (who, at, n) { var o = who.querySelector(".m-talk"), s = who.querySelector(".m-smile");
      for (var i = 0; i < n; i++) { tl.set(o, { autoAlpha: 1 }, at + i * .26).set(s, { autoAlpha: 0 }, at + i * .26).set(o, { autoAlpha: 0 }, at + i * .26 + .14).set(s, { autoAlpha: 1 }, at + i * .26 + .14); } };
    var pop = function (n, at, from) { tl.fromTo(n, { autoAlpha: 0, scale: .85, y: from || 12 }, { autoAlpha: 1, scale: 1, y: 0, duration: .4, ease: "back.out(1.7)" }, at); };
    var out = function (n, at) { tl.to(n, { autoAlpha: 0, y: -10, duration: .3, ease: "power2.in" }, at); };

    gsap.set(her.querySelector(".arm-l"), { svgOrigin: "36 98" });   // arms turn at the shoulder
    gsap.set(him.querySelector(".arm-r"), { svgOrigin: "84 98" });
    gsap.set([title, bHim, bAunt, bPapa, cFound, cLimits, her, him, line, qa(".pin"), q(".duo-tag")], { autoAlpha: 0 });
    gsap.set(qa(".m-talk"), { autoAlpha: 0 });
    tl = gsap.timeline({ defaults: { ease: "power3.out" }, onComplete: end });

    // the title card is pinned up; the two of them pop up from below like paper figures
    tl.fromTo(title, { autoAlpha: 0, y: -30, rotation: 3 }, { autoAlpha: 1, y: 0, rotation: -1, duration: .6 }, .1)
      .fromTo(her, { autoAlpha: 0, y: 70, rotation: -8 }, { autoAlpha: 1, y: 0, rotation: 0, duration: .55, ease: "back.out(1.6)" }, .45)
      .fromTo(him, { autoAlpha: 0, y: 70, rotation: 8 }, { autoAlpha: 1, y: 0, rotation: 0, duration: .55, ease: "back.out(1.6)" }, .6)
      .to(q(".duo-tag"), { autoAlpha: 1, duration: .4 }, 1.0)
      .to(line, { autoAlpha: 1, duration: .3 }, 1.2);
    out(title, 2.3);

    // Kundan: "Mera Durgapur aaya. Kajal ka Dilli!" He cheers; she turns to him
    pop(bHim, 2.45); talk(him, 2.55, 5);
    tl.to(him.querySelector(".arm-r"), { rotation: -125, duration: .35, ease: "back.out(2)" }, 2.6)
      .to(her.querySelector(".look"), { x: 3, duration: .2 }, 2.7)
      .to(him.querySelector(".arm-r"), { rotation: 0, duration: .3 }, 4.3);
    out(bHim, 4.4);

    // she sets off for Delhi and the line between them stretches; the aunt: "Akeli Dilli?"
    tl.to(qa(".pin"), { autoAlpha: 1, duration: .3, stagger: .1 }, 4.3)
      .to(her.querySelector(".look"), { x: -3, duration: .15 }, 4.5)
      .to(her, { x: toDelhi, duration: 1.5, ease: "power1.inOut" }, 4.6)
      .to(her.querySelector(".body"), { y: -5, duration: .19, repeat: 7, yoyo: true, ease: "sine.inOut" }, 4.6)
      .to(line, { scaleX: (himX - herX - toDelhi) / full, duration: 1.5, ease: "power1.inOut" }, 4.6)
      .to(him.querySelector(".look"), { x: -3, duration: .2 }, 4.8);
    pop(bAunt, 5.1, -12);
    tl.to(her.querySelector(".look"), { x: 4, duration: .2 }, 6.3);   // she stops and looks back at him
    out(bAunt, 7.3);

    // Papa: "Dono saath jaoge." She comes back to his side and they set off together
    pop(bPapa, 7.4, -12);
    tl.to(her, { x: 0, duration: 1.0, ease: "power2.inOut" }, 7.8)
      .to(her.querySelector(".body"), { y: -5, duration: .17, repeat: 5, yoyo: true, ease: "sine.inOut" }, 7.8)
      .to(line, { scaleX: (himX - herX) / full, duration: 1.0, ease: "power2.inOut" }, 7.8)
      .to(line, { autoAlpha: 0, duration: .3 }, 8.8)
      .to([her, him], { x: "+=" + nudge, duration: .5, ease: "power1.inOut" }, 8.9)
      .to([her.querySelector(".look"), him.querySelector(".look")], { x: 2, duration: .2 }, 8.9);
    out(bPapa, 9.3);

    // what we found, then where our model breaks
    pop(cFound, 9.4);
    tl.from(cFound.querySelectorAll(".intro-nums b"), { autoAlpha: 0, scale: 1.4, rotation: -6, stagger: .14, duration: .35, ease: "back.out(1.8)" }, 9.85)
      .from(cFound.querySelectorAll(".intro-nums span"), { autoAlpha: 0, stagger: .14, duration: .3 }, 10.0);
    out(cFound, 11.6);
    pop(cLimits, 11.7);
    tl.from(cLimits.querySelectorAll("li"), { autoAlpha: 0, x: -14, stagger: .28, duration: .35 }, 11.9)
      .to([her.querySelector(".arm-l"), him.querySelector(".arm-r")], { rotation: function (i) { return i ? -130 : 130; }, duration: .3, ease: "back.out(2)" }, 13.0)   // both wave goodbye
      .to([her.querySelector(".arm-l"), him.querySelector(".arm-r")], { rotation: function (i) { return i ? -105 : 105; }, duration: .2, repeat: 3, yoyo: true, ease: "sine.inOut" }, 13.3)
      .to({}, { duration: .1 }, 14.0);   // about 14 s, then the sheet lifts

    // blinks, off the main timeline so they never hold it up
    [her, him].forEach(function (k, i) {
      loops.push(gsap.to(k.querySelector(".eyes"), { scaleY: .1, transformOrigin: "50% 50%", duration: .08, yoyo: true, repeat: -1, repeatDelay: 2.4 + i * .7, delay: 1.2 + i * .5 }));
    });
  }

  function play() {
    el.classList.remove("wait");
    if (window.itniIntroOff || el.hidden) return;   // the loader gave up (slow network or an early Skip): leave the page alone
    ending = false;
    lock();
    if (window.itniIntroStill || !window.gsap) { skip.textContent = "Close"; el.scrollTop = 0; return; }
    skip.textContent = "Skip intro";
    gsap.set(el, { yPercent: 0, rotation: 0 });
    (el.getAttribute("data-mode") === "duo" ? duo : slips)();
  }

  skip.addEventListener("click", function (e) { e.stopPropagation(); end(); });
  el.addEventListener("pointerdown", function (e) { if (!window.itniIntroStill && e.target !== skip) end(); });
  document.addEventListener("keydown", function (e) {
    if (el.hidden || MOD[e.key]) return;
    if (window.itniIntroStill) { if (e.key === "Escape") { e.preventDefault(); end(); } return; }
    if (e.key !== "Tab") e.preventDefault();
    end();
  });
  addEventListener("beforeprint", function () { if (!el.hidden) close(); });
  addEventListener("orientationchange", function () { if (!el.hidden && !window.itniIntroStill) end(); });   // a turned phone: the layout changed, let the page through

  window.itniIntroPlay = function () { el.classList.toggle("still", !!window.itniIntroStill); play(); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", play, { once: true }); else play();
})();
