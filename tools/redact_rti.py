"""Public copies of our four RTI papers with the applicant's address, phone, e-mail and the portal link covered.
Pages are rasterised (the applications are vector prints, the replies are scans), boxes drawn in PDF points, and a
new image-only PDF is written, so nothing under a box survives. Blank back pages of the DU reply are left out.
Run: py -I tools/redact_rti.py <folder with the originals>   (writes site/how-we-built-it/rti/)"""
import sys, os, io
import pymupdf
from PIL import Image, ImageDraw

SRC = sys.argv[1]
OUT = os.path.join(os.path.dirname(__file__), "..", "site", "how-we-built-it", "rti")
APP = {1: [(258, 220, 600, 238), (258, 304, 600, 358), (0, 768, 600, 792)], 2: [(0, 768, 600, 792)]}
JOBS = {
    "RTI_IITK_JoSAA_application.pdf": ("iitk_request_2026-10-21.pdf", APP, None),
    "RTI_IITK_reply_2026-11-05.pdf": ("iitk_reply_2026-11-05.pdf", {1: [(34, 157, 320, 196)]}, None),
    "RTI_DU_application.pdf": ("du_request_2026-10-23.pdf", APP, None),
    "RTI_DU_reply_2026-11-18.pdf": ("du_reply_2026-11-18.pdf", {1: [(70, 168, 330, 207)]}, [1, 2, 3, 5]),
}
DPI = 110
os.makedirs(OUT, exist_ok=True)
for src, (dst, boxes, keep) in JOBS.items():
    d = pymupdf.open(os.path.join(SRC, src))
    out = pymupdf.open()
    for i, p in enumerate(d, start=1):
        if keep and i not in keep:
            continue
        pix = p.get_pixmap(dpi=DPI)
        im = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
        k = DPI / 72
        dr = ImageDraw.Draw(im)
        for (x0, y0, x1, y1) in boxes.get(i, []):
            dr.rectangle([x0 * k, y0 * k, x1 * k, y1 * k], fill=(43, 33, 24))
        buf = io.BytesIO()
        im.convert("L").save(buf, "JPEG", quality=62)
        page = out.new_page(width=p.rect.width, height=p.rect.height)
        page.insert_image(page.rect, stream=buf.getvalue())
    out.set_metadata({"title": dst[:-4].replace("_", " "), "author": "ECO463 Group 7"})
    out.save(os.path.join(OUT, dst), garbage=4, deflate=True)
    print(dst, out.page_count, "pages", os.path.getsize(os.path.join(OUT, dst)) // 1024, "KB")
