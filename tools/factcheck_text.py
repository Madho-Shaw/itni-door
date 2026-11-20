# Rerun after any text edit:  py -I -X utf8 tools/factcheck_text.py . ../eco463-media/video_v2/scenes.js .tmp/unmatched.tsv
# Every hand-typed number in report/one-pager/video text must match a value in data/*.json or model_v2_results.md;
# what it prints is the list to check by hand (train numbers, citations and RTI facts are expected there).
"""Flag numbers typed by hand that match no value in the source files.
Usage: py -I factcheck.py <site_root> <video_scenes_js> <out_tsv>"""
import json, re, sys, os

site, scenes, out = sys.argv[1], sys.argv[2], sys.argv[3]
allowed = set()

def add(v):
    if isinstance(v, bool): return
    if isinstance(v, (int, float)):
        for x in {v, round(v), round(v, 1), round(v, 2), round(v * 100), round(v * 100, 1), round(abs(v), 1), round(abs(v)), round(v / 1e5, 1), round(v / 1e5, 2), round(v / 1000)}:
            allowed.add(float(x))
    elif isinstance(v, str):
        for m in re.findall(r'-?\d[\d,]*\.?\d*', v):
            try: allowed.add(float(m.replace(',', '').rstrip('.')))
            except ValueError: pass

def walk(o):
    if isinstance(o, dict):
        for v in o.values(): walk(v)
    elif isinstance(o, list):
        for v in o: walk(v)
    else: add(o)

for f in ['data/model_v2.json', 'data/evidence.json', 'data/evidence_variables.json']:
    walk(json.load(open(os.path.join(site, f), encoding='utf-8')))
walk(open(os.path.join(site, 'data/source/model_v2_results.md'), encoding='utf-8').read())

# numbers that are not data claims
SKIP = re.compile(r'^(19|20)\d\d$')        # years
NUM = re.compile(r'(?<![\w.\-/#{@])(-?\d[\d,]*(?:\.\d+)?)(?![\w/])')

def scan(path, label, text_filter=None):
    rows = []
    for i, line in enumerate(open(path, encoding='utf-8'), 1):
        s = line
        if text_filter: s = text_filter(s)
        if not s: continue
        s = re.sub(r'\{\{<.*?>\}\}', ' ', s)          # quarto vars: checked by check_numbers.js
        s = re.sub(r'\$[^$]*\$', ' ', s)               # maths
        s = re.sub(r'`[^`]*`', ' ', s)                 # code / paths
        s = re.sub(r'\[[^\]]*\]\([^)]*\)', ' ', s)      # links
        s = re.sub(r'@\w[\w-]*', ' ', s)               # cross refs
        s = re.sub(r'\b[LB]\d+(-[LB]?\d+)?\b|\b[bn]\d\d(_\d\d)?\b|\bF\d+\b|\bQ\d+\b|\bR\d+\b', ' ', s)  # lecture / beat ids
        s = re.sub(r'\d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*', ' ', s)          # dates
        s = re.sub(r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w* \d{1,2}', ' ', s)
        s = re.sub(r'\b\d{1,2}:\d\d\b', ' ', s)          # clock / video times
        for m in NUM.finditer(s):
            tok = m.group(1)
            v = float(tok.replace(',', ''))
            if SKIP.match(tok) or abs(v) < 2 and '.' not in tok: continue   # 0, 1, years
            if v in allowed or abs(v) in allowed: continue
            ctx = s[max(0, m.start() - 70): m.end() + 50].strip().replace('\t', ' ')
            rows.append((label, i, tok, ctx))
    return rows

rows = []
rows += scan(os.path.join(site, 'report/index.qmd'), 'report')
rows += scan(os.path.join(site, 'content/one_pager_text.md'), 'onepager')
def only_text(line):
    got = re.findall(r'(?:text|t|en): "([^"]*)"', line)
    return ' | '.join(got)
rows += scan(scenes, 'video', only_text)
with open(out, 'w', encoding='utf-8') as f:
    for r in rows: f.write('\t'.join(map(str, r)) + '\n')
from collections import Counter
print(len(allowed), 'source values;', len(rows), 'unmatched numbers', Counter(r[0] for r in rows))
