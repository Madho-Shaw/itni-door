"""Crop a tall screenshot into readable tiles: py tools/crop.py in.png [tile_height=1100] -> in_1.png, in_2.png ..."""
import sys
from PIL import Image
p = sys.argv[1]; th = int(sys.argv[2]) if len(sys.argv) > 2 else 1100
im = Image.open(p); w, h = im.size
for i, y in enumerate(range(0, h, th), 1):
    im.crop((0, y, w, min(h, y + th))).save(p.replace(".png", f"_{i}.png"))
print(p, w, h, "tiles:", (h + th - 1) // th)
