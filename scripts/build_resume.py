#!/usr/bin/env python3
"""
Builds public/resume.pdf (A4, one page) from src/data/profile.json.

    python3 -m pip install reportlab
    python3 scripts/build_resume.py
"""
import json
import sys
from pathlib import Path
from xml.sax.saxutils import escape

try:
    from reportlab.lib.colors import HexColor
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import ParagraphStyle
    from reportlab.lib.units import mm
    from reportlab.pdfbase.pdfmetrics import stringWidth
    from reportlab.platypus import BaseDocTemplate, Frame, FrameBreak, PageTemplate, Paragraph, Spacer
    from reportlab.platypus.flowables import HRFlowable
except ImportError as err:
    sys.exit(
        f"Could not import reportlab ({err}).\n"
        f"Python used: {sys.executable}\n"
        "Install it for this interpreter: python3 -m pip install reportlab"
    )

ROOT = Path(__file__).resolve().parent.parent
PROFILE = json.loads((ROOT / "src/data/profile.json").read_text(encoding="utf-8"))
OUT = ROOT / "public/resume.pdf"

INK = HexColor("#0b0b0c")
PAPER = HexColor("#ecebe6")
AMBER = HexColor("#ffb21a")
AMBER_DARK = HexColor("#a86400")
BODY = HexColor("#2a2a2a")
MUTED = HexColor("#6b6a64")
LINE = HexColor("#dcdad2")

W, H = A4
M = 13 * mm
HEADER_H = 40 * mm
GAP = 8 * mm
INNER_W = W - 2 * M - GAP
LEFT_W = INNER_W * 0.61
RIGHT_W = INNER_W - LEFT_W
TOP = H - HEADER_H - 7 * mm
FRAME_H = TOP - M

# ── logo (same geometry as public/favicon.svg, 64-unit grid) ──────────────
HEX = [(32, 2), (58, 17), (58, 47), (32, 62), (6, 47), (6, 17)]
LETTERS = [
    (14, 22, 12, 3), (11, 25, 3, 6), (14, 31, 9, 3), (23, 34, 3, 6), (11, 40, 12, 3),  # S
    (29, 22, 12, 3), (29, 25, 3, 18), (41, 25, 3, 6), (32, 31, 9, 3),  # P
]
CARET = (47, 22, 6, 21)


def draw_logo(c, ox, oy, size):
    s = size / 64.0
    pt = lambda x, y: (ox + x * s, oy + (64 - y) * s)
    path = c.beginPath()
    path.moveTo(*pt(*HEX[0]))
    for p in HEX[1:]:
        path.lineTo(*pt(*p))
    path.close()
    c.setLineJoin(1)
    c.setLineWidth(3 * s)
    c.setStrokeColor(AMBER)
    c.setFillColor(INK)
    c.drawPath(path, stroke=1, fill=1)
    c.setFillColor(PAPER)
    for x, y, w, h in LETTERS:
        c.rect(ox + x * s, oy + (64 - y - h) * s, w * s, h * s, stroke=0, fill=1)
    c.setFillColor(AMBER)
    x, y, w, h = CARET
    c.rect(ox + x * s, oy + (64 - y - h) * s, w * s, h * s, stroke=0, fill=1)


def link_row(c, x, y, items, font="Helvetica", size=8.3, sep="   ·   "):
    """Draws items left→right; items with a url become clickable."""
    for i, (text, url) in enumerate(items):
        if i:
            c.setFillColor(HexColor("#6b6a64"))
            c.drawString(x, y, sep)
            x += stringWidth(sep, font, size)
        c.setFillColor(HexColor("#d6d4cc"))
        c.drawString(x, y, text)
        w = stringWidth(text, font, size)
        if url:
            c.linkURL(url, (x, y - 2, x + w, y + size), relative=0)
        x += w


def header(c, _doc):
    c.saveState()
    c.setFillColor(INK)
    c.rect(0, H - HEADER_H, W, HEADER_H, stroke=0, fill=1)
    c.setFillColor(AMBER)
    c.rect(0, H - HEADER_H, W, 1.1 * mm, stroke=0, fill=1)

    logo = 20 * mm
    draw_logo(c, M, H - HEADER_H / 2 - logo / 2 + 0.5 * mm, logo)
    x = M + logo + 6 * mm

    c.setFillColor(PAPER)
    c.setFont("Helvetica-Bold", 21)
    c.drawString(x, H - 14.5 * mm, PROFILE["name"].upper())
    c.setFillColor(AMBER)
    c.setFont("Helvetica", 10.5)
    c.drawString(x, H - 20.5 * mm, f"{PROFILE['title']}  ·  {PROFILE['company']}")

    contact = PROFILE["contact"]
    social = {s["label"]: s for s in PROFILE["socials"]}
    c.setFont("Helvetica", 8.3)
    link_row(c, x, H - 27.5 * mm, [
        (contact["email"], f"mailto:{contact['email']}"),
        (contact["phone"], f"tel:{contact['phoneHref']}"),
        (PROFILE["location"], None),
    ])
    link_row(c, x, H - 32.5 * mm, [
        ("samarthpal.github.io", PROFILE["site"]),
        ("linkedin.com/in/samarth-pal", social["LinkedIn"]["url"]),
        ("github.com/samarthpal", social["GitHub"]["url"]),
    ])
    c.restoreState()


# ── styles ────────────────────────────────────────────────────────────────
H2 = ParagraphStyle("h2", fontName="Helvetica-Bold", fontSize=9.4, leading=12, textColor=INK, spaceBefore=7, spaceAfter=2)
TEXT = ParagraphStyle("text", fontName="Helvetica", fontSize=8.4, leading=11.4, textColor=BODY)
SMALL = ParagraphStyle("small", parent=TEXT, fontSize=7.9, leading=10.4, textColor=MUTED)
ROLE = ParagraphStyle("role", fontName="Helvetica-Bold", fontSize=10, leading=13, textColor=INK, spaceBefore=4)
ORG = ParagraphStyle("org", parent=SMALL, textColor=AMBER_DARK, spaceAfter=3)
BULLET = ParagraphStyle("bullet", parent=TEXT, leftIndent=9, bulletIndent=0, spaceAfter=1.2)
ITEM = ParagraphStyle("item", parent=TEXT, fontSize=8.1, leading=10.6, spaceAfter=2.6)
SKILL = ParagraphStyle("skill", parent=TEXT, fontSize=8.1, leading=10.8, spaceAfter=3.2)


def e(text):
    return escape(str(text))


def section(title):
    return [
        Paragraph(f'<font color="#a86400">//</font> {e(title.upper())}', H2),
        HRFlowable(width="100%", thickness=0.6, color=LINE, spaceBefore=1, spaceAfter=4),
    ]


def left_column():
    out = section("Summary")
    out.append(Paragraph(e(PROFILE["summary"]), TEXT))

    out += section("Experience")
    exp = {x["id"]: x for x in PROFILE["experience"]}

    dh = exp["daemonhive"]
    out.append(Paragraph(f"{e(dh['title'])}", ROLE))
    out.append(Paragraph(f'{e(dh["org"])}  ·  <a href="{dh["url"]}" color="#a86400">daemonhive.com</a>', ORG))
    for h in dh["highlights"]:
        out.append(Paragraph(e(h), BULLET, bulletText="•"))

    out.append(Spacer(1, 4))
    out.append(Paragraph("Selected products", ParagraphStyle("sub", parent=SMALL, fontName="Helvetica-Bold", textColor=INK, spaceAfter=3)))
    for w in [w for w in PROFILE["work"] if w["company"] == "DaemonHive Technologies"]:
        name = f'<a href="{w["url"]}" color="#0b0b0c">{e(w["name"])}</a>' if w["url"] else e(w["name"])
        out.append(Paragraph(
            f'<b>{name}</b> <font color="#6b6a64">({e(w["industry"])})</font>: {e(w["summary"])}',
            ITEM,
        ))

    jq = exp["joahquin"]
    out.append(Paragraph(e(jq["title"]), ROLE))
    out.append(Paragraph(f'{e(jq["org"])}  ·  <a href="{jq["url"]}" color="#a86400">joahquin.com</a>', ORG))
    for h in jq["highlights"]:
        out.append(Paragraph(e(h), BULLET, bulletText="•"))
    return out


def right_column():
    out = section("Skills")
    for g in PROFILE["skills"]:
        names = ", ".join(i["name"] for i in g["items"])
        out.append(Paragraph(f"<b>{e(g['group'])}</b><br/>{e(names)}", SKILL))

    out += section("Education")
    for ed in PROFILE["education"]:
        out.append(Paragraph(f"<b>{e(ed['degree'])}</b>", ParagraphStyle("ed", parent=TEXT, spaceBefore=1)))
        out.append(Paragraph(f"{e(ed['school'])}<br/>{e(ed['years'])}  ·  {e(ed['score'])}", SMALL))
        out.append(Spacer(1, 3))

    out += section("Certifications")
    for cert in PROFILE["certifications"]:
        out.append(Paragraph(f"<b>{e(cert['issuer'])}</b> {e(cert['name'])}  <font color='#6b6a64'>{e(cert['date'])}</font>", ITEM))

    out += section("More")
    out.append(Paragraph(f"<b>Languages</b>: {e(', '.join(PROFILE['spokenLanguages']))}", ITEM))
    out.append(Paragraph(f"<b>Interests</b>: {e(', '.join(PROFILE['interests']))}", ITEM))
    out.append(Paragraph(
        f'<b>Interactive portfolio</b>: case studies, an ASCII lab and a terminal at '
        f'<a href="{PROFILE["site"]}" color="#a86400">samarthpal.github.io</a>',
        ITEM,
    ))
    return out


def main():
    doc = BaseDocTemplate(
        str(OUT),
        pagesize=A4,
        leftMargin=M,
        rightMargin=M,
        topMargin=M,
        bottomMargin=M,
        title=f"{PROFILE['name']} — Resume",
        author=PROFILE["name"],
        subject=f"{PROFILE['title']}, {PROFILE['company']}",
    )
    left = Frame(M, M, LEFT_W, FRAME_H, id="left", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    right = Frame(M + LEFT_W + GAP, M, RIGHT_W, FRAME_H, id="right", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    doc.addPageTemplates([PageTemplate(id="page", frames=[left, right], onPage=header)])

    story = left_column() + [FrameBreak()] + right_column()
    doc.build(story)

    pages = doc.page
    print(f"wrote {OUT.relative_to(ROOT)} ({pages} page{'s' if pages != 1 else ''})")
    if pages > 1:
        print("warning: content overflowed to a second page — trim text in profile.json or adjust font sizes.")


if __name__ == "__main__":
    main()
