# Itni Door? (ECO463 Group 7 website)

The hub, video, one-page note, game, talk, full report and evidence room for our ECO463 project.
Every number on the site comes from a data file; a check script fails the build if any page disagrees.

## Where things live

| You want to change | Edit | Who |
|---|---|---|
| Report text | `report/index.qmd` (numbers as `{{< var key >}}`, from `_variables.yml`) | report writers |
| Evidence pages (data, tests, model, sources) | `evidence/*/index.qmd` | report writers |
| One-page note text | `content/one_pager_text.md` | writers |
| Video chapters, site address, names | `content/site.yml` | anyone |
| Video script on the watch page | `content/video_script.json` | video team |
| Hand-built pages (hub, watch, one-pager, play, talk, evidence room, RTI, figures, credits, 404) | `site/**/index.html` | design |
| Colours, fonts, sizes, spacing, motion timings | `site/assets/tokens.css` only | design |
| Layout and components | `site/assets/site.css`; long reading in `report.css`; small page parts in `page.css` | design |
| Figures (drawn from the data, also pre-drawn into the HTML) | `site/assets/figs/figs.js`; browser side `figs-live.js` | design |
| Model numbers | never by hand: `data/model_v2.json` and `_variables.yml` come from `npm run data` | model |

`site/play/` is copied from the game repo by `tools/sync_game.py`: fix the game there, then run `npm run game`.

## Build and preview

You need Node 22 and Quarto 1.11 (on Mshaw's laptop Quarto is not on PATH: use
`C:/Users/mshaw/AppData/Local/Programs/Quarto/bin/quarto.exe` wherever this says `quarto`).

```
npm ci                                      # once
quarto render                               # report + evidence pages (HTML) into _site/
quarto render report/index.qmd --to typst   # the report PDF (_site/report/index.pdf)
node tools/build.js                         # hand-built pages, numbers, figures, top bar; no --clean (it would delete Quarto's output)
node tools/check_numbers.js                 # must pass (every number matches model v2, the game and the evidence files)
node tools/a11y_check.js                    # must say 0 with findings
```

Preview: serve `_site/` (for example `py -m http.server 8463 --directory _site`) and open http://localhost:8463.
After a change, rebuild and reload; there is no watcher.

Screenshots (headless Edge, no extra installs):
`node tools/edge.js shot report/index.html .tmp/r.png 412 900 full` (phone) and `... 1280 800` (laptop);
add `present` for projector mode. `npm run pdf` reprints the one-page PDF (`site/one-pager/one-pager.pdf`): run it
after the one-pager changes, and check it is still one page.

## Rules we keep

- No number typed by hand on a page: use `data-v="key"` in HTML or `{{< var key >}}` in Quarto.
- Nothing loads from another site (fonts are self-hosted; the video loads YouTube only when you press play).
- Motion only on transform and opacity, off with reduced motion, and every page must read fully without it or without JavaScript.
- Phone width 412 px and a 1280x720 projector are the two sizes to check before a push.
- `tools/report_preview.js` is the old Quarto-less preview; Quarto is the real build now.

Publishing: `.github/workflows/pages.yml` builds and checks the site on GitHub Pages once the repo is on GitHub
(its Quarto version must match the laptops). Until then this repo is local only.
