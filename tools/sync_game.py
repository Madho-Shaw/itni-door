"""Copy the class mode of Itni Door? Real Life into site/play/ (the game repo stays the source; read-only).

What changes in the copy, and only in the copy:
  - the Google Fonts <link> is dropped (the woff2 files ship in assets/fonts, so no third-party request)
  - a slim "Itni Door? hub" bar and the site's play.css are added (hidden in #present)
The full 12-minute game (full.html) is NOT copied: it stays local until Mshaw decides.
Also copies the game's tools/check_rl_model.js to tools/game/ so check_numbers.js can read its WANT table.

Run:  py tools/sync_game.py   (set GAME_DIR to use another checkout)
"""
import os
import re
import shutil
from pathlib import Path

SITE = Path(__file__).resolve().parents[1]
GAME = Path(os.environ.get("GAME_DIR", SITE.parent / "itni-door-real-life"))
OUT = SITE / "site" / "play"
FILES = ["css/theme.css", "css/rl.css", "content/rl_content.js", "js/util.js", "js/puppet.js", "js/rl_model.js",
         "js/rl_app.js", "assets/paper-grain.svg", "assets/fonts/baloo2-latin-var.woff2", "assets/fonts/hind-400.woff2",
         "assets/fonts/hind-500.woff2", "assets/fonts/hind-600.woff2", "assets/fonts/kalam-400.woff2",
         "assets/fonts/kalam-700.woff2"]

if OUT.exists():
    shutil.rmtree(OUT)
for f in FILES:
    (OUT / f).parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(GAME / f, OUT / f)

html = (GAME / "index.html").read_text(encoding="utf-8")
html, n = re.subn(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com[^>]*>\n?', "", html)
assert n == 1, "Google Fonts link not found: check the game's index.html"
html = html.replace('<link rel="stylesheet" href="css/rl.css">',
                    '<link rel="stylesheet" href="css/rl.css">\n<link rel="stylesheet" href="../assets/play.css">\n'
                    '<meta name="description" content="Itni Door? Real Life: you are the parents of twins in Bihar with the same JEE rank. Four decisions, about four minutes.">')
html = html.replace('<div id="app"></div>',
                    '<nav class="hub-bar" aria-label="Site"><a href="../">Itni Door?</a><span>ECO463, Group 7</span>'
                    '<a href="../one-pager/">The model on one page</a></nav>\n<main id="app"></main>')
html = html.replace("<!-- Class mode (4 decisions, about 4 minutes). The full game is full.html. Fonts are in assets/fonts (offline). -->",
                    "<!-- Copied from itni-door-real-life by eco463-site/tools/sync_game.py. Edit the game repo, not this copy. -->")
(OUT / "index.html").write_text(html, encoding="utf-8")

(SITE / "tools" / "game").mkdir(parents=True, exist_ok=True)
shutil.copyfile(GAME / "tools" / "check_rl_model.js", SITE / "tools" / "game" / "check_rl_model.js")
rev = (GAME / ".git" / "HEAD").read_text().strip() if (GAME / ".git").exists() else "unknown"
print("copied", len(FILES) + 1, "files from", GAME, "into site/play/ (game HEAD:", rev + ")")
