/* The one character builder. Every person in the game is drawn here from parameters:
   ITNI.puppet({ skin, hair, outfit, colour, age, expression, pose, role, glasses, moustache, bindi, crop })
   returns an SVG string. Colours are token names from theme.css, never hex (skin is the one hex parameter).
   Unknown hair or outfit values fall back to a neutral default. */
(function () {
  "use strict";
  var I = window.ITNI = window.ITNI || {};

  var TOKENS = { her: "--her", him: "--him", ink: "--ink-soft", data: "--data", sindoor: "--sindoor",
                 yes: "--yes", kraft: "--kraft-deep", card: "--card", paper: "--paper" };
  function tok(name) { return "var(" + (TOKENS[name] || "--kraft-deep") + ")"; }
  function mix(c, pct, other) { return "color-mix(in srgb, " + c + " " + pct + "%, " + (other || "var(--card)") + ")"; }

  var INK = 'stroke="var(--ink)" stroke-width="var(--puppet-stroke, 2.5px)" stroke-linecap="round" stroke-linejoin="round"';
  var THIN = 'stroke="var(--ink)" stroke-width="var(--puppet-thin, 1.8px)" stroke-linecap="round" stroke-linejoin="round" fill="none"';

  function p(d, fill, extra) { return '<path d="' + d + '" fill="' + (fill || "none") + '" ' + (extra || INK) + "/>"; }
  function c(cx, cy, r, fill, extra) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + fill + '" ' + (extra == null ? INK : extra) + "/>"; }

  /* ---- hair: [behind the head, in front of the head] ---- */
  var HAIR = {
    short: function (h) { return ["", p("M33 55 C29 26 50 19 62 20 C79 21 91 32 87 55 C85 44 79 37 70 36 L47 36 C40 38 35 45 33 55 Z", h)]; },
    side_part: function (h) { return ["", p("M33 56 C29 28 48 19 62 20 C80 21 91 34 87 56 C84 46 80 40 74 37 C62 40 50 38 44 33 C39 38 35 46 33 56 Z", h)]; },
    balding: function (h) { return ["", p("M33 58 C31 48 33 42 37 38 C38 44 38 50 37 56 Z", h) + p("M87 58 C89 48 87 42 83 38 C82 44 82 50 83 56 Z", h) + p("M50 27 q10 -4 20 0", "none", THIN)]; },
    braid: function (h, o) {
      var b = "", i, y;
      for (i = 0; i < 5; i++) { y = 66 + i * 11; b += '<ellipse cx="' + (88 + i * 1.2) + '" cy="' + y + '" rx="6.5" ry="7.5" fill="' + h + '" ' + INK + "/>"; }
      b += '<rect x="87" y="117" width="12" height="6" rx="3" fill="' + o.accent + '" ' + INK + "/>" + p("M90 123 l-2 9 M96 123 l2 9", "none");
      return [p("M31 58 C27 28 46 20 60 20 C74 20 93 28 89 58 L84 70 L36 70 Z", h),
              p("M33 57 C30 30 46 22 60 22 C74 22 90 30 87 57 C84 45 74 35 60 33 C46 35 36 45 33 57 Z", h) + b];
    },
    ponytail: function (h) {
      return [p("M82 30 C104 30 106 60 98 84 C96 66 92 52 84 46 Z", h),
              p("M33 57 C30 30 46 22 60 22 C74 22 90 30 87 57 C84 45 74 35 60 33 C46 35 36 45 33 57 Z", h)];
    },
    long: function (h) {
      return [p("M30 56 C25 92 29 112 35 120 L85 120 C91 112 95 92 90 56 C90 14 30 14 30 56 Z", h),
              p("M33 57 C30 30 46 22 60 22 C74 22 90 30 87 57 C84 45 74 35 60 33 C46 35 36 45 33 57 Z", h)];
    },
    bob: function (h) {
      return [p("M30 56 C27 74 29 84 34 90 L86 90 C91 84 93 74 90 56 C90 14 30 14 30 56 Z", h),
              p("M33 57 C30 30 46 22 60 22 C74 22 90 30 87 57 C82 44 70 38 52 38 C44 40 37 46 33 57 Z", h)];
    },
    bun: function (h) {
      return [c(60, 17, 11, h),
              p("M33 57 C30 30 46 22 60 22 C74 22 90 30 87 57 C84 45 74 35 60 33 C46 35 36 45 33 57 Z", h)];
    },
    low_bun: function (h) {
      return [c(84, 30, 11, h),
              p("M33 57 C30 30 46 22 60 22 C74 22 90 30 87 57 C84 45 74 35 60 33 C46 35 36 45 33 57 Z", h)];
    }
  };
  HAIR.short_grey = HAIR.short; HAIR.grey_bun = HAIR.low_bun; HAIR.grey_short = HAIR.short;

  /* ---- outfits, drawn over the torso ---- */
  var TORSO = "M14 152 C14 122 28 108 46 104 L74 104 C92 108 106 122 106 152 Z";
  var OUTFIT = {
    tshirt: function (col, skin) { return p(TORSO, col) + p("M48 104 Q60 117 72 104", skin); },
    kurta: function (col, skin) {
      return p(TORSO, col) + p("M50 104 L60 118 L70 104 Z", skin) + p("M60 118 L60 138", "none", THIN) +
             c(60, 126, 1.3, "var(--ink)", "") + c(60, 133, 1.3, "var(--ink)", "");
    },
    shirt: function (col) {
      return p(TORSO, col) + p("M50 103 L60 115 L51 121 L46 106 Z", "var(--card)") + p("M70 103 L60 115 L69 121 L74 106 Z", "var(--card)") +
             p("M60 116 L60 150", "none", THIN) + c(60, 128, 1.3, "var(--ink)", "") + c(60, 139, 1.3, "var(--ink)", "");
    },
    saree: function (col, skin) {
      return p(TORSO, mix(col, 70, "var(--ink)")) + p("M49 104 Q60 114 71 104", skin) +
             p("M38 106 L58 104 L106 148 L106 152 L74 152 Z", mix(col, 62)) + p("M46 108 L88 152", "none", THIN);
    },
    salwar: function (col, skin) {
      return p(TORSO, col) + p("M49 104 Q60 116 71 104", skin) +
             '<path d="M32 110 Q60 146 88 110" fill="none" stroke="var(--ink)" stroke-width="13" stroke-linecap="round"/>' +
             '<path d="M32 110 Q60 146 88 110" fill="none" stroke="' + mix(col, 45) + '" stroke-width="8.5" stroke-linecap="round"/>';
    },
    blazer: function (col) {
      return p(TORSO, col) + p("M49 104 L60 132 L71 104 Z", "var(--card)") +
             p("M49 104 L42 122 L59 134 Z", mix(col, 78, "var(--ink)")) + p("M71 104 L78 122 L61 134 Z", mix(col, 78, "var(--ink)"));
    },
    sweater: function (col) {
      return p(TORSO, col) + p("M49 104 L60 124 L71 104 Z", "var(--card)") +
             p("M50 103 L60 114 L53 118 Z", "var(--card)") + p("M70 103 L60 114 L67 118 Z", "var(--card)") +
             p("M22 140 L98 140", "none", THIN);
    },
    shawl: function (col, skin) {
      return p(TORSO, mix(col, 70, "var(--ink)")) + p("M49 104 Q60 114 71 104", skin) +
             p("M20 124 Q36 104 52 106 Q60 124 68 106 Q84 104 100 124 Q60 150 20 124 Z", mix(col, 55));
    }
  };

  /* ---- faces ---- */
  function face(mood, young) {
    var r = young ? 3 : 2.6, ex1 = 49, ex2 = 71, ey = 58, s = "";
    function eyes(kind) {
      if (kind === "arc") return p("M" + (ex1 - 4) + " " + (ey + 1) + " q4 -5.5 8 0", "none") + p("M" + (ex2 - 4) + " " + (ey + 1) + " q4 -5.5 8 0", "none");
      if (kind === "down") return p("M" + (ex1 - 4) + " " + (ey - 1) + " q4 4.5 8 0", "none") + p("M" + (ex2 - 4) + " " + (ey - 1) + " q4 4.5 8 0", "none");
      return '<g class="eyes">' + c(ex1, ey, r, "var(--ink)", "") + c(ex2, ey, r, "var(--ink)", "") + "</g>";
    }
    function brows(l, rgt) { return p(l, "none") + p(rgt, "none"); }
    var blush = c(42, 67, 4.2, "var(--sindoor-soft)", 'opacity=".75"') + c(78, 67, 4.2, "var(--sindoor-soft)", 'opacity=".75"');
    switch (mood) {
      case "happy":
        s = blush + brows("M43 46 q6 -4 12 -1", "M65 45 q6 -3 12 1") + eyes("arc") + p("M50 69 Q60 83 70 69 Z", "#5B2A20");
        break;
      case "worried":
        s = brows("M43 49 L55 45", "M65 45 L77 49") + eyes() + p("M53 75 q7 -5 14 0", "none") +
            p("M91 34 q4 7 0 10 q-4 -3 0 -10 Z", "var(--data-soft)", THIN.replace('fill="none"', ""));
        break;
      case "angry":
        s = brows("M42 44 L55 49.5", "M78 44 L65 49.5") + eyes() + p("M52 76 q8 -7 16 0", "none") + p("M90 30 l5 -4 M93 36 l7 -1", "none", THIN);
        break;
      case "sad":
        s = brows("M43 49 L55 45.5", "M65 45.5 L77 49") + eyes("down") + p("M53 76 q7 -6 14 0", "none") +
            p("M47 63 q3 6 0 8 q-3 -2 0 -8 Z", "var(--data-soft)", THIN.replace('fill="none"', ""));
        break;
      case "determined":
        s = brows("M43 45.5 L55 48.5", "M77 45.5 L65 48.5") + eyes() + p("M52 73 L66 73 q3 -.5 4 -3", "none");
        break;
      case "proud":
        s = blush + brows("M43 45 q6 -4 12 -1", "M65 44 q6 -3 12 1") + eyes("arc") + p("M52 71 q8 8 16 0", "none") +
            p("M95 26 l1.6 4.4 4.4 1.6 -4.4 1.6 -1.6 4.4 -1.6 -4.4 -4.4 -1.6 4.4 -1.6 Z", "var(--him)", THIN.replace('fill="none"', ""));
        break;
      /* hopeful: brows up, eyes open, a small open smile (waiting for the answer). hurt: brows pulled in, eyes down, a crooked mouth, no tear. */
      case "hopeful":
        s = brows("M43 44 q6 -4.5 12 -1.5", "M65 42.5 q6 -3 12 1.5") + eyes() + c(ex1 + 1.1, ey - 1.1, .9, "var(--card)", "") + c(ex2 + 1.1, ey - 1.1, .9, "var(--card)", "") +
            p("M53 71 Q60 79 67 71 Z", "#5B2A20");
        break;
      case "hurt":
        s = brows("M43 50.5 L55 45", "M65 45 L77 50.5") + eyes("down") + p("M53 75.5 q3.5 -3.5 7 -.5 q3.5 3 7 -1", "none");
        break;
      default:
        s = brows("M43 48 q6 -3 12 0", "M65 48 q6 -3 12 0") + eyes() + p("M53 72 q7 5 14 0", "none");
    }
    return s + p("M60 60 q-3 6 1 7.5", "none", THIN);
  }

  /* ---- arms ---- */
  function arm(d, col, hx, hy, skin) {
    return '<path d="' + d + '" fill="none" stroke="var(--ink)" stroke-width="16" stroke-linecap="round"/>' +
           '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="11" stroke-linecap="round"/>' + c(hx, hy, 6.5, skin);
  }
  function arms(pose, col, skin) {
    switch (pose) {
      case "cheer": return arm("M22 126 Q8 108 12 86", col, 12, 80, skin) + arm("M98 126 Q112 108 108 86", col, 108, 80, skin);
      case "wave": return arm("M98 126 Q114 108 106 84", col, 105, 78, skin);
      case "crossed": return arm("M24 132 Q50 148 82 136", col, 86, 135, skin) + arm("M96 132 Q70 150 38 138", col, 34, 137, skin);
      case "think": return arm("M96 136 Q92 112 74 94", col, 71, 90, skin);
      /* leave: a backpack on both shoulders and a wave. phone: a phone held up in front. hold: a sheet of paper in the hand. */
      case "leave": return p("M40 106 Q35 128 39 152 L47 152 Q43 128 48 105 Z", "var(--kraft-deep)") + p("M80 106 Q85 128 81 152 L73 152 Q77 128 72 105 Z", "var(--kraft-deep)") +
        arm("M98 126 Q114 108 106 84", col, 105, 78, skin);
      case "phone": return arm("M96 136 Q100 116 84 106", col, 82, 104, skin) +
        '<rect x="70" y="84" width="15" height="25" rx="3" fill="var(--ink)" ' + INK + '/><rect x="72.5" y="87.5" width="10" height="16" rx="1" fill="var(--data-soft)"/>';
      case "hold": return '<g transform="rotate(-8 34 104)">' + p("M20 86 H50 V124 H20 Z", "var(--card)") + p("M25 95 h20 M25 102 h20 M25 109 h13", "none", THIN) + "</g>" +
        arm("M24 136 Q20 124 30 116", col, 32, 114, skin);
      default: return "";
    }
  }
  var POSE_FOR = { angry: "crossed", worried: "think", happy: "neutral", proud: "cheer", determined: "neutral" };

  I.puppet = function (o) {
    o = o || {};
    var age = o.age == null ? 30 : o.age, young = age < 21, old = age >= 60;
    var skin = o.skin || "#B9785A";
    var col = tok(o.colour || o.color || "kraft");
    var mood = o.expression || o.mood || "neutral";
    var pose = o.pose || POSE_FOR[mood] || "neutral";
    var hairName = HAIR[o.hair] ? o.hair : (o.role === "father" || o.role === "son" || o.role === "uncle" || o.role === "husband" ? "short" : "bun");
    var grey = old || /grey/.test(o.hair || "");
    var hairCol = grey ? "var(--hair-grey)" : "var(--hair)";
    var hair = HAIR[hairName](hairCol, { accent: col });
    var outfit = (OUTFIT[o.outfit] || OUTFIT.kurta)(col, skin);
    var moustache = o.moustache != null ? o.moustache : (o.role === "father" || o.role === "uncle");
    var extras = "";
    if (old || age >= 45) extras += p("M44 76 q-3 3 -2 7 M76 76 q3 3 2 7", "none", THIN);
    if (old) extras += p("M50 40 q10 -3 20 0", "none", THIN);
    if (o.bindi || (o.bindi == null && (o.outfit === "saree" || o.role === "mother"))) extras += c(60, 45, 1.9, "var(--sindoor)", "");
    if (moustache) extras += p("M50 68 q5 -4 10 -.5 q5 -3.5 10 .5 q-5 4 -10 1.5 q-5 2.5 -10 -1.5 Z", hairCol);
    if (o.glasses || (o.glasses == null && old)) {
      extras += '<rect x="41" y="52" width="16" height="12" rx="5" fill="rgba(255,255,255,.25)" ' + INK + '/><rect x="63" y="52" width="16" height="12" rx="5" fill="rgba(255,255,255,.25)" ' + INK + "/>" + p("M57 57 h6 M41 56 l-7 -2 M79 56 l7 -2", "none");
    }
    var head = '<g class="head"' + (young ? ' transform="translate(60 70) scale(1.07) translate(-60 -70)"' : "") + ">" +
      hair[0] + c(34, 59, 5, skin) + c(86, 59, 5, skin) +
      '<ellipse cx="60" cy="56" rx="26" ry="29" fill="' + skin + '" ' + INK + "/>" +
      face(mood, young) + extras + hair[1] + "</g>";
    var view = o.crop === "head" ? "22 6 76 88" : "0 0 120 150";
    return '<svg class="puppet" viewBox="' + view + '" data-mood="' + mood + '" role="img" aria-hidden="true" focusable="false">' +
      (o.crop === "head" ? "" : outfit) +
      '<rect x="52" y="84" width="16" height="24" rx="7" fill="' + skin + '" ' + INK + "/>" +
      (o.crop === "head" ? "" : arms(pose, col, skin)) + head + "</svg>";
  };

  /* A cast member by id, with a mood. Twins grow up in act 3 if the cast has an "<id>_29" entry or an age override. */
  I.puppetOf = function (castId, opts) {
    opts = opts || {};
    var cast = I.cast || {}, m = cast[castId] || {};
    var base = Object.assign({ role: m.role }, m.puppet || {});
    if (opts.act >= 3 && cast[castId + "_29"]) base = Object.assign({ role: m.role }, cast[castId + "_29"].puppet || {});
    else if (opts.act >= 3 && m.lane && (base.age || 17) < 21) { base.age = 29; if (base.outfit === "tshirt" || base.outfit === "kurta") base.outfit = "blazer"; if (base.hair === "braid") base.hair = "bun"; }
    return I.puppet(Object.assign(base, opts));
  };
  I.puppetOptions = { hair: Object.keys(HAIR), outfit: Object.keys(OUTFIT),
    expression: ["neutral", "happy", "worried", "angry", "sad", "determined", "proud", "hopeful", "hurt"],
    pose: ["neutral", "cheer", "wave", "crossed", "think", "leave", "phone", "hold"] };
})();
