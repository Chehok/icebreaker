#!/usr/bin/env python3
"""Generate 1200x630 Open Graph share image for Icebreaker (offline one-shot)."""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "og-image.png"
ICON = ROOT / "icons" / "icon-512.png"
FONT = Path("/usr/share/fonts/truetype/wqy/wqy-microhei.ttc")

W, H = 1200, 630
BG = (244, 245, 249)
ACCENT = (79, 70, 229)
ACCENT_SOFT = (238, 240, 255)
TEXT = (23, 25, 35)
MUTED = (96, 101, 121)
WHITE = (255, 255, 255)
LINE = (228, 230, 238)


def load(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    # WenQuanYi Micro Hei — single face for titles and body
    return ImageFont.truetype(str(FONT), size=size)


def rounded_rect(draw, xy, radius, fill, outline=None, width=0):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def main() -> None:
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    # Accent glow (top center)
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse((W // 2 - 520, -200, W // 2 + 520, 420), fill=(79, 70, 229, 38))
    img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")
    draw = ImageDraw.Draw(img)

    # Left: app icon
    icon = Image.open(ICON).convert("RGBA")
    icon_size = 280
    icon = icon.resize((icon_size, icon_size), Image.Resampling.LANCZOS)
    ix, iy = 120, (H - icon_size) // 2
    img.paste(icon, (ix, iy), icon)

    # Right column
    tx = 460
    title_font = load(72)
    sub_font = load(34)
    chip_font = load(26)
    small_font = load(24)

    draw.text((tx, 155), "Icebreaker", font=title_font, fill=TEXT)

    lines = [
        "모임에서 어색함을 풀어주는",
        "대화 주제 · 밸런스게임 · 이 중 누가?",
    ]
    y = 250
    for line in lines:
        draw.text((tx, y), line, font=sub_font, fill=MUTED)
        y += 48

    # Mode chips
    chips = ["💬 대화 주제", "⚖️ 밸런스게임", "🎯 이 중 누가?"]
    # Use text-only chips to avoid emoji font issues in raster export
    chips = ["대화 주제", "밸런스게임", "이 중 누가?"]
    chip_y = 380
    cx = tx
    for label in chips:
        bbox = chip_font.getbbox(label)
        tw = bbox[2] - bbox[0]
        pad_x, pad_y = 22, 14
        cw = tw + pad_x * 2
        rounded_rect(draw, (cx, chip_y, cx + cw, chip_y + 52), 26, ACCENT_SOFT, LINE, 1)
        draw.text((cx + pad_x, chip_y + pad_y - 2), label, font=chip_font, fill=ACCENT)
        cx += cw + 14

    # A / B balance motif
    box_y = 470
    half_w = 140
    rounded_rect(draw, (tx, box_y, tx + half_w, box_y + 72), 18, WHITE, LINE, 2)
    rounded_rect(
        draw, (tx + half_w + 16, box_y, tx + half_w * 2 + 16, box_y + 72), 18, WHITE, LINE, 2
    )
    draw.text((tx + 52, box_y + 18), "A", font=title_font, fill=ACCENT)
    draw.text((tx + half_w + 16 + 52, box_y + 18), "B", font=title_font, fill=ACCENT)
    draw.text((tx + half_w * 2 + 40, box_y + 22), "골라보세요", font=small_font, fill=MUTED)

    img.save(OUT, "PNG", optimize=True)
    print(f"Wrote {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
