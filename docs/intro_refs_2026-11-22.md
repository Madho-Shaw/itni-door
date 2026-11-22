# Hub intro: references and what we took, 22 Nov 2026

We looked at four open intro and preloader patterns before building ours. None of their code or art is copied;
the intro is our own build in the site's paper look (`site/index.html` #intro, `site/assets/intro.js`).

| Reference | What it does | Good | Not for us |
|---|---|---|---|
| Codrops, Image Stack Intro Animation (GSAP, MIT demos) | A stack of images is shown, then each one flies to its place in the page grid | Continuity: the intro becomes the page, so it never feels like a wall | Needs photographs and a grid to land in; our hub is text and one drawing |
| Codrops, Image Trail Animation for an Intro and the Page Preloading Effect | A loader runs, then an intro screen hands over to the layout | A clear hand-over moment at the end | The loader waits on loading; our pages load in well under a second, so a loader would only add waiting |
| GreenSock timeline and SplitText demos (gsap.com, CodePen) | Kinetic type: lines and words staggered on one timeline, with labels and overlaps | One timeline is easy to time, skip and replay; stagger reads as a sentence being said | Letter-by-letter splits make words hard to read for a screen reader and slow to read for anyone; we move whole words and lines |
| prashantkoirala465/modern-preloader (GSAP, MIT) | An agency-style counter from 0 to 100, split text, then a curtain lift | The curtain lift is a confident ending | A fake progress counter would sit next to our real "out of 100" numbers and confuse them |

Lenis and Motion examples were also on the list. Lenis is smooth scrolling, which would change how every page scrolls,
so it is not used. Motion's examples do the same things as GSAP's timeline; one library is enough.

## What we built

- Four slips of paper laid on the desk one over another (about 12 s in all): the project and its six parts; what we
  asked, with the red pen drawing Saharsa to Delhi and "Door to door, more than a day."; what we found (23 / 44 / 98 in
  100, stamped, not counted up); and where our model breaks. Every line is copied from the site, the script or the
  report, and the three numbers come from the data files through `data-v`, so `check_numbers.js` checks them.
- The ending lifts the whole sheet off the hub (the curtain idea), and the hub's own red pen then plays.
- Once per visit, only when a visit starts on the hub (`sessionStorage`, in try/catch). "Skip intro", Esc or a click
  anywhere ends it; "Play the intro again" under the doors replays it; `?intro` plays it on cue and so does I in
  projector mode, where it never plays by itself.
- Focus stays in the dialog while it plays (the rest of the page is `inert`) and goes to the hub's heading after.
  All four cards are in the page, so a screen reader reads them in order.
- Reduced motion: no autoplay; the replay shows the four cards still, on one sheet, with a Close button.
- Weight: GSAP core (72 KB, self-hosted from npm by `tools/build.js`) and `intro.js` (6 KB) load only when the
  intro plays. Other pages, prerender on hover and fast page changes are untouched. Transform and opacity only, plus
  the route line's dash offset.

Measured in headless Edge (no GPU): at normal CPU speed no long frame while the intro plays, at desktop or 375 px. With
the CPU slowed four times, three frames of about 60 ms during the number stamp at 375 px.

Sources: [Codrops intro demos](https://tympanus.net/codrops/demos/?tag=intro),
[Image Stack Intro Animation](https://tympanus.net/codrops/?p=52018),
[Image Trail Animation for an Intro](https://tympanus.net/codrops/2022/05/03/image-trail-animation-for-an-intro/),
[GreenSock timeline demo](https://codepen.io/GreenSock/pen/KCaBn),
[modern-preloader](https://awesome.ecosyste.ms/projects/github.com%2Fprashantkoirala465%2Fmodern-preloader),
[GSAP standard licence (free, plugins included, since 3.13)](https://webflow.com/blog/gsap-becomes-free).
