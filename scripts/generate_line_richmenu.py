#!/usr/bin/env python3
"""DogHub LINE リッチメニュー画像を生成（2500×1686・6マス）。
ブランドカラー（globals.css の @theme と一致）で6分割の固定メニューを描画する。
出力: web/scripts/line-richmenu.png
"""
from PIL import Image, ImageDraw, ImageFont
import os

W, H = 2500, 1686
COLS, ROWS = 3, 2
CW, CH = W // COLS, H // ROWS

# ブランドカラー
BG = (247, 245, 240)        # #F7F5F0 背景
TEXT = (60, 32, 15)         # #3C200F テキスト
ACCENT = (184, 121, 66)     # #B87942 アクセント
BORDER = (229, 221, 216)    # #E5DDD8 ボーダー
SUB = (136, 123, 101)       # サブテキスト
WHITE = (255, 255, 255)

FONT_PATH = "/System/Library/Fonts/Hiragino Sans GB.ttc"

def font(size, bold=False):
    # index 1 = W6(太), index 0 = W3(細)
    try:
        return ImageFont.truetype(FONT_PATH, size, index=1 if bold else 0)
    except Exception:
        return ImageFont.truetype(FONT_PATH, size, index=0)

# 各セル: (見出し, サブ, アクセント背景か)
CELLS = [
    ("料金・プラン", "半日4時間 ¥3,300", False),
    ("アクセス", "場所・駐車場", False),
    ("営業時間", "9-17 / 水木定休", False),
    ("持ち物", "ワクチン・ご準備", False),
    ("予約する", "24時間受付", True),
    ("お電話", "0460-80-0290", True),
]

img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)

def center_text(cx, cy, text, fnt, fill):
    bbox = d.textbbox((0, 0), text, font=fnt)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    d.text((cx - tw / 2, cy - th / 2 - bbox[1]), text, font=fnt, fill=fill)

def fit_font(text, max_w, start, bold):
    """テキストが max_w に収まる最大フォントを返す（はみ出し防止）。"""
    size = start
    while size > 30:
        f = font(size, bold=bold)
        bbox = d.textbbox((0, 0), text, font=f)
        if bbox[2] - bbox[0] <= max_w:
            return f
        size -= 4
    return font(30, bold=bold)

for i, (head, sub, is_accent) in enumerate(CELLS):
    r, c = divmod(i, COLS)
    x0, y0 = c * CW, r * CH
    x1, y1 = x0 + CW, y0 + CH
    pad = 18
    cell_bg = ACCENT if is_accent else WHITE
    d.rectangle([x0 + pad, y0 + pad, x1 - pad, y1 - pad], fill=cell_bg, outline=BORDER, width=4)
    cx = (x0 + x1) / 2
    head_fill = WHITE if is_accent else TEXT
    sub_fill = (245, 238, 230) if is_accent else SUB
    inner_w = CW - pad * 2 - 60  # 左右マージン
    f_head = fit_font(head, inner_w, 124, True)
    f_sub = fit_font(sub, inner_w, 60, False)
    center_text(cx, (y0 + y1) / 2 - 55, head, f_head, head_fill)
    center_text(cx, (y0 + y1) / 2 + 90, sub, f_sub, sub_fill)

out = os.path.join(os.path.dirname(__file__), "line-richmenu.png")
img.save(out, "PNG", optimize=True)
print("saved:", out, os.path.getsize(out), "bytes")
