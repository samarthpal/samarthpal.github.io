#!/usr/bin/env python3
"""
Renders the PNG brand assets from the same pixel geometry as public/favicon.svg:
  public/apple-touch-icon.png (180), public/icon-512.png, public/og.png (1200×630)

    python3 -m pip install pillow
    python3 scripts/build_brand.py
"""
import math
import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageOps
except ImportError:
    sys.exit("Pillow is not installed. Run: python3 -m pip install pillow")

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
PHOTO = ROOT / "src/images/me.jpeg"

INK = (11, 11, 12)
PAPER = (236, 235, 230)
ACCENT = (255, 178, 26)  # #ffb21a amber; keep in sync with --accent in styles/mixins.scss
MUTED = (143, 142, 136)

LETTERS = [
    (14, 22, 12, 3), (11, 25, 3, 6), (14, 31, 9, 3), (23, 34, 3, 6), (11, 40, 12, 3),
    (29, 22, 12, 3), (29, 25, 3, 18), (41, 25, 3, 6), (32, 31, 9, 3),
]
CARET = (47, 22, 6, 21)


def hexagon(cx, cy, r):
    return [(cx + r * math.cos(math.radians(a)), cy + r * math.sin(math.radians(a))) for a in (-90, -30, 30, 90, 150, 210)]


def draw_logo(d, ox, oy, size):
    s = size / 64.0
    stroke = 3 * s
    outer = 30 * s + stroke / 2 / math.cos(math.radians(30))
    inner = 30 * s - stroke / 2 / math.cos(math.radians(30))
    cx, cy = ox + 32 * s, oy + 32 * s
    d.polygon(hexagon(cx, cy, outer), fill=ACCENT)
    d.polygon(hexagon(cx, cy, inner), fill=INK)
    for x, y, w, h in LETTERS:
        d.rectangle([ox + x * s, oy + y * s, ox + (x + w) * s - 1, oy + (y + h) * s - 1], fill=PAPER)
    x, y, w, h = CARET
    d.rectangle([ox + x * s, oy + y * s, ox + (x + w) * s - 1, oy + (y + h) * s - 1], fill=ACCENT)


# 5×7 pixel font — only the glyphs the OG image needs
FONT = {
    "A": [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
    "B": ["####.", "#...#", "#...#", "####.", "#...#", "#...#", "####."],
    "C": [".####", "#....", "#....", "#....", "#....", "#....", ".####"],
    "D": ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
    "E": ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
    "F": ["#####", "#....", "#....", "####.", "#....", "#....", "#...."],
    "G": [".####", "#....", "#....", "#..##", "#...#", "#...#", ".###."],
    "H": ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
    "I": ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "#####"],
    "L": ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
    "M": ["#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"],
    "N": ["#...#", "##..#", "#.#.#", "#..##", "#...#", "#...#", "#...#"],
    "O": [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
    "P": ["####.", "#...#", "#...#", "####.", "#....", "#....", "#...."],
    "R": ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
    "S": [".####", "#....", "#....", ".###.", "....#", "....#", "####."],
    "T": ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
    "U": ["#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
    "V": ["#...#", "#...#", "#...#", "#...#", "#...#", ".#.#.", "..#.."],
    "W": ["#...#", "#...#", "#...#", "#.#.#", "#.#.#", "##.##", "#...#"],
    "·": [".....", ".....", ".....", "..#..", ".....", ".....", "....."],
    "-": [".....", ".....", ".....", ".###.", ".....", ".....", "....."],
    "&": [".##..", "#..#.", "#.#..", ".#...", "#.#.#", "#..#.", ".##.#"],
    ".": [".....", ".....", ".....", ".....", ".....", ".....", "..#.."],
    " ": [".....", ".....", ".....", ".....", ".....", ".....", "....."],
}


def pixel_text(d, x, y, text, px, color):
    for ch in text:
        rows = FONT.get(ch, FONT[" "])
        for r, row in enumerate(rows):
            for c, bit in enumerate(row):
                if bit == "#":
                    d.rectangle([x + c * px, y + r * px, x + (c + 1) * px - 1, y + (r + 1) * px - 1], fill=color)
        x += 6 * px
    return x


def hex_portrait(img, cx, cy, r):
    """The real photo (natural colour) inside a hive hexagon with an accent rim."""
    if not PHOTO.exists():
        return
    photo = ImageOps.exif_transpose(Image.open(PHOTO)).convert("RGB")
    pw, ph = photo.size
    # square crop around the face/shoulders
    side = int(0.62 * pw)
    left = int(0.56 * pw - side / 2)
    top = int(0.47 * ph - side / 2)
    size = int(2 * r)
    face = photo.crop((left, top, left + side, top + side)).resize((size, size), Image.LANCZOS)

    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).polygon(hexagon(r, r, r - 4), fill=255)
    d = ImageDraw.Draw(img)
    d.polygon(hexagon(cx, cy, r + 4), fill=ACCENT)  # rim
    img.paste(face, (int(cx - r), int(cy - r)), mask)


def icon(size, logo_ratio=0.82):
    img = Image.new("RGB", (size, size), INK)
    d = ImageDraw.Draw(img)
    logo = size * logo_ratio
    draw_logo(d, (size - logo) / 2, (size - logo) / 2, logo)
    return img


def og():
    img = Image.new("RGB", (1200, 630), INK)
    d = ImageDraw.Draw(img)
    hex_portrait(img, 985, 315, 205)
    draw_logo(d, 80, 70, 110)
    end = pixel_text(d, 80, 250, "SAMARTH PAL", 10, PAPER)
    d.rectangle([end + 6, 250, end + 6 + 40, 250 + 70 - 1], fill=ACCENT)  # caret
    pixel_text(d, 80, 350, "CO-FOUNDER & CTO", 4, ACCENT)
    pixel_text(d, 80, 392, "DAEMONHIVE TECHNOLOGIES", 4, ACCENT)
    pixel_text(d, 80, 450, "REACT · NODE · MONGODB · AWS", 3, MUTED)
    pixel_text(d, 80, 540, "SAMARTHPAL.GITHUB.IO", 3, PAPER)
    d.rectangle([0, 622, 1200, 630], fill=ACCENT)
    return img


def main():
    PUBLIC.mkdir(exist_ok=True)
    icon(180).save(PUBLIC / "apple-touch-icon.png", optimize=True)
    icon(512, 0.78).save(PUBLIC / "icon-512.png", optimize=True)
    og().save(PUBLIC / "og.png", optimize=True)
    print("wrote public/apple-touch-icon.png, public/icon-512.png, public/og.png")


if __name__ == "__main__":
    main()
