# Design and motion pass, 22 Nov 2026

A polish pass on the live site (hub, watch, one page, play, report, evidence room, talk). The look stays as it is:
the paper-collage tokens in `site/assets/tokens.css`, Baloo 2 / Hind / Kalam. No copy, number or source changes.

How it was checked: a local build (`node tools/build.js` on top of the last `quarto render`), served from `_site/`,
headless Edge shots at 1280 x 800 and 375 px full page (`tools/edge.js`), and a read of the CSS against a standard
front-end audit (accessibility, performance, theming, responsive, consistency) and a motion checklist (hover and press
states, tap size, reduced motion, browser surfaces such as text selection).

## Score (0-4 each)

| Dimension | Before | Key finding |
|---|---|---|
| Accessibility | 3 | repo check passes; report's phone contents toggle has no open/closed cue |
| Performance | 3 | lean: self-hosted fonts, video `preload="none"`, prerender on hover; nothing heavy found |
| Theming | 4 | one paper theme on purpose, every colour a token; selection colour was the browser's blue |
| Responsive | 2 | the one-page parameter table breaks at 375 px; scrolling tables give no sign they scroll |
| Implementation integrity | 3 | the game page links a stylesheet that does not exist, so its site bar is unstyled |
| **Total** | **15 / 20** | Good: fix the weak spots, keep the system |

## Findings, ranked

| # | Sev | Page | Finding | Fix in this pass |
|---|---|---|---|---|
| 1 | P1 | play | `site/play/index.html` (written by `tools/sync_game.py`) links `../assets/play.css`, which was never created (404 on the live site too). The site bar reads "Itni Door?ECO463, Group 7The model on one page" as bare run-together links at the top left, at every width. | Add `site/assets/play.css`: the bar in the site's style, hidden in projector mode. |
| 2 | P1 | watch | The video has no poster. With `preload="none"` the first thing on the watch page is an empty dark box. `content/site.yml` already names a poster, but the file was never made. | A 54 KB frame from the class cut (0:33, the "Itni Door?" title card) as `assets/img/poster.jpg`; point `video.poster` at it. |
| 3 | P1 | one page, 375 px | The nine-column parameter table (H, σ, τ, b, μ, λ, n, day wage, J) squeezes into narrow columns: "2.5 / 1.2 / 1.0" and the wage values stack one word per line. | Give wide tables a minimum width inside the scroller they already have, so they scroll instead of crushing. |
| 4 | P2 | hub, one page | Tables that scroll sideways on a phone (the brief map on the hub, the wide one-page tables) look cut off: the "Game" column just stops. | Paper-coloured edge shadows that show only while there is more to scroll (CSS only). |
| 5 | P2 | report, phone | The "On this page" box has no marker, so it reads like an empty field, not something to open. | A small chevron that turns when the list opens. |
| 6 | P2 | hub, evidence | Card hover runs on touch too, so a tapped door stays lifted. Evidence room cards jump on hover (no transition) and give no press feedback. | Hover only where there is a real pointer; one shared lift and press for door and room cards. |
| 7 | P2 | evidence | Room cards in a row have different heights ("Tests" is shorter than "Data" and "Model"). | Cards fill their grid cell. |
| 8 | P2 | watch | The link row under the chapters sits flush against the last chapter line. | Space above it. |
| 9 | P3 | all | Selected text shows the browser's blue, the one surface not in the paper palette. | Turmeric-soft selection with ink text. |
| 10 | P3 | hand-built pages | First arrival is static apart from the hub's red pen; the page title just appears. | A short settle on the page heading (CSS, off with reduced motion). |
| 11 | P3 | hub, evidence | Desk objects below the fold (door and room cards) appear with no sense of being put down. | A one-time "placed" settle for cards that scroll up into view; cards already on screen never hide. |
| 12 | P3 | watch | Speaker tags in the script read like file labels ("Nar1", "Maa_phone"). | Not changed: script text is content. For the group to decide. |
| 13 | P3 | hub, phone | The QR code to the site shows on a phone that is already on the site. | Not changed: flagged only. |

Kept on purpose (a generic checklist would flag them, but they are the settled paper-collage look): the cut-paper
offset shadow (`--pin`), the coloured left edge on option cards and quotes, the tilted slips, section numbers in the report.

## Motion plan

- Focal moment: the hub's red pen (strike, then the parents' line). Unchanged.
- Continuity: page-to-page cross-fade (View Transitions, already there) plus a short heading settle on arrival.
- Feedback: every card and button answers the pointer: lift on hover (real pointers only), press on click.
- Placed, not flown in: below-the-fold desk cards settle once when they arrive (opacity and a 6 px drop, under
  half a second, siblings 60 ms apart). Content already on screen is never hidden, and with reduced motion or
  without JavaScript every page is the finished drawing.
- Budget: CSS and the existing inline script only. No animation library is added (GSAP would add about 70 KB
  for effects CSS already does), transform and opacity only.

## After the pass

| Dimension | Before | After | What changed |
|---|---|---|---|
| Accessibility | 3 | 3 | contents and doors toggles show open/closed; hover no longer sticks on touch |
| Performance | 3 | 3 | a 54 KB poster and about 1 KB of CSS and script; no library added |
| Theming | 4 | 4 | selection colour from the palette |
| Responsive | 2 | 3 | parameter table and brief map scroll with a visible edge on a phone |
| Implementation integrity | 3 | 4 | the game page's stylesheet exists; the video slot has its poster |
| **Total** | **15** | **17 / 20** | |

Checks after the pass: `node tools/check_numbers.js` (521 checks, 0 failed), `node tools/a11y_check.js` (15 pages, 0 with
findings), the one-page PDF still prints on one page, no page wider than 375 px, no text under the 14 px floor on the
site's own pages. Motion tested in headless Edge: cards below the fold settle when scrolled to, also after a jump
straight to the end of the page; with reduced motion nothing hides or moves.

Commits: 937ddaa (this file), 1693ca1 (game page stylesheet, video poster), 32ec5cf (polish and motion CSS),
6a5c4cb (card placement script). Not pushed.

Left for the group: speaker tags in the video script (#12), the QR code on phones (#13), and the game's own small
text (the "Hinglish" button and the family lines under 14 px at 1280 px), which lives in the game repo.
