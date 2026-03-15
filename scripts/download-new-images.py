#!/usr/bin/env python3
"""
Google Driveから新しい画像をダウンロードし、
HEIC→JPG変換、リサイズ、リネームして web/public/images/ に保存
"""

import json
import os
import subprocess
import sys
from pathlib import Path

import requests

TOKEN_PATH = os.path.expanduser("~/credentials/doghub-workspace-token.json")
IMAGES_DIR = Path(__file__).resolve().parent.parent / "public" / "images"
TEMP_DIR = Path(__file__).resolve().parent.parent / "tmp_download"
MAX_WIDTH = 1920  # web用最大幅


def get_access_token():
    with open(TOKEN_PATH) as f:
        creds = json.load(f)
    resp = requests.post("https://oauth2.googleapis.com/token", data={
        "client_id": creds["client_id"],
        "client_secret": creds["client_secret"],
        "refresh_token": creds["refresh_token"],
        "grant_type": "refresh_token",
    })
    resp.raise_for_status()
    return resp.json()["access_token"]


def download_file(token, file_id, dest_path):
    resp = requests.get(
        f"https://www.googleapis.com/drive/v3/files/{file_id}?alt=media",
        headers={"Authorization": f"Bearer {token}"},
    )
    resp.raise_for_status()
    dest_path.write_bytes(resp.content)


def convert_heic_to_jpg(heic_path, jpg_path):
    """macOS sips を使って HEIC → JPG 変換"""
    subprocess.run([
        "sips", "-s", "format", "jpeg",
        "-s", "formatOptions", "85",
        str(heic_path), "--out", str(jpg_path),
    ], capture_output=True, check=True)


def resize_image(img_path, max_width=MAX_WIDTH):
    """画像幅がmax_widthを超える場合リサイズ"""
    result = subprocess.run(
        ["sips", "-g", "pixelWidth", str(img_path)],
        capture_output=True, text=True,
    )
    for line in result.stdout.splitlines():
        if "pixelWidth" in line:
            width = int(line.split(":")[-1].strip())
            if width > max_width:
                subprocess.run([
                    "sips", "--resampleWidth", str(max_width), str(img_path),
                ], capture_output=True, check=True)
                return True
    return False


# 新しい画像ファイル一覧 (id, name, type)
NEW_FILES = [
    # JPG files
    ("1jvpXDnUkTmjdtIXgBrax9-TMXAf_XwBv", "IMG_1917.JPG", "jpg"),
    ("13SLeIiJLDsEKMUvMfLTA2IQf7WjzqDMD", "IMG_0334.JPG", "jpg"),
    ("1xl_DUx8s-Wd0q1aJdMYGEXguoh0QqGb6", "IMG_1810.JPG", "jpg"),
    ("1cptNPJ_DUrxdoz9vyiSgOIxKiJ0GAXBX", "IMG_1645.JPG", "jpg"),
    ("1v4IEiKmlFk7O_wV1b1cP0NwbnQDZayPm", "IMG_1918.JPG", "jpg"),
    ("1tbPNgR9ynnJ95VxDhfbcm6mI5QK3Xb5u", "IMG_1931.JPG", "jpg"),
    ("1Z5ngFUaF3--oHhDhBNUxtaDoVvCoIFyp", "IMG_1919.JPG", "jpg"),
    ("1JSURHaMsqbbfnv7dciDRfuhN_DxGdQPq", "IMG_2034.JPG", "jpg"),
    ("1I3Js6PkPheyVOQx6aAkoODVqthil_E9B", "IMG_1916.JPG", "jpg"),
    ("1gs6tk2q_RGipyLAS6ZhH9BW0RkPGrGWA", "IMG_0336.JPG", "jpg"),
    ("1MBj-yx-bUFqVp9r5yDShpK8KBVsk63Zt", "IMG_0045.JPG", "jpg"),
    ("1uRlOiUknY68agtwp7pyki9ZsnkFKUggZ", "IMG_2025.JPG", "jpg"),
    ("1Gx8d4LWmdj42cntDP4OamBj7em2AIXD1", "IMG_0076.JPG", "jpg"),
    ("1pXEF5y760Nu4LYihsUDSR2gR3AudJLGi", "IMG_1684.JPG", "jpg"),
    ("1OJ8rLl7dD4G1luYcEoDL9e5RfG5LW73n", "IMG_1811.JPG", "jpg"),
    ("17HBKUW4GdYLWeEO0vJTUT1YY4K5Dllc2", "IMG_1890.JPG", "jpg"),
    ("1-lrc_g1AYUz2W_mHfcKDZ7FIloOv6jwo", "IMG_0333.JPG", "jpg"),
    ("1tJ8FVydsstHgTqikJQqBuNTeCOLQPMCU", "IMG_1926.JPG", "jpg"),
    ("1m8hSYDyivjghYZKMtriB6OBg_t2nsMW9", "IMG_2361.JPG", "jpg"),
    ("1v4i3s7Sy6OStCFu3AcCzFk6fTHO0Z1re", "IMG_1925.JPG", "jpg"),
    ("1H7ZX_jkqUu_d8IndZ48z2RGL3XWa0YVh", "IMG_0061.JPG", "jpg"),
    ("1OQlrmdGErAnyrzhBiQksg_H6IueYpQqF", "IMG_1929.JPG", "jpg"),
    ("1YXpHlADSNaFLlcbB_CJWWOktWqgiVo0h", "IMG_2280.JPG", "jpg"),
    ("1YMT530dj6qQLbZgBdi510McvmdJYyZMh", "IMG_1683.JPG", "jpg"),
    ("1CGBaqHDI-eLo1Hi7YJeKazox51frrcli", "IMG_0117.JPG", "jpg"),
    ("14zQGcNwCHGW6yDQmuJO6aRFsX0gdsRqp", "IMG_0330.JPG", "jpg"),
    ("19MreNbv7f-DrRgD-U6JPjGVIokBjLYUn", "IMG_1928.JPG", "jpg"),
    ("1PMkNgKJdZH7SpyfszGLOasv2dEv9_pjx", "IMG_0286_1.JPG", "jpg"),
    ("1JWTuc6s4Ucpq0zOxtoiLYLIwWIU12G-2", "IMG_2097.JPG", "jpg"),
    ("1MyVIOP_qsIqCZmeoUaIt7Qy_KOuJefDV", "IMG_0328.JPG", "jpg"),
    ("1AiqdqdaWqgpyLZWdviaEj7pRX5LCL-yM", "IMG_0045_1.JPG", "jpg"),
    ("1zaepyRGWu4dZCEAfZGlg--u5mu__leXB", "IMG_2323.JPG", "jpg"),
    ("12URQj-4AvG_g_yecIIKZop2bKjX7Dm0o", "IMG_0277.JPG", "jpg"),
    ("1s-urn92C7MICR915EiWEV0F2TKtOKWhM", "IMG_0172.JPG", "jpg"),
    ("1MKFal7WSyh6jyFCA3_M0GlFQW0tCtuLC", "IMG_0286.JPG", "jpg"),
    # PNG files
    ("1V3SCjJM4OLquSNiZIk2CAwFXotDkQ_rx", "Gemini_Generated.png", "png"),
    ("1_jPYkQUadKD4RAQggNGzRGVU65ViOLzX", "IMG_0279.PNG", "png"),
    # HEIC files (need conversion)
    ("1jSRNUw8bOpG1C9dDK17UnVPrSJiz2_0q", "IMG_2045.HEIC", "heic"),
    ("1Y8yZ_8-krpoc4S-sq9lbwI3gttIrjmp2", "IMG_2045_1.HEIC", "heic"),
    ("11UVv6hAqC0OS7q0THX7V4UYce2Oa8S6a", "IMG_1670.HEIC", "heic"),
    ("1pTUkrHZr-1gFr8xSj9k_MprvJy0gI0L6", "IMG_1610.HEIC", "heic"),
    ("1_pd6N-wFgkpKjY4fx2yGeBFo0cj7TEO7", "IMG_2043.HEIC", "heic"),
    ("1gKybTP4FWTsSiX0XaQwsylb_EPUHeHJo", "IMG_1901.HEIC", "heic"),
    ("11b0Um7jNajsX49tbCVaMtqmHBrfLtnTH", "IMG_2046.HEIC", "heic"),
    ("124MK7jB_c8_FP-tnrjOkK_YhjxK7BgWG", "IMG_2028.HEIC", "heic"),
    ("1ZUa3zzMtSKqGa088LKR37acpdsjIQxvc", "IMG_1936.HEIC", "heic"),
    ("1vIiic00EVL4kBTrcNAUuSk-RpDWtYHD2", "IMG_1943.HEIC", "heic"),
    ("1_HLd4KzF9n3SRnlk1ZDeZYeuylw4lNcg", "IMG_2063.HEIC", "heic"),
    ("1SIhEHH0SGdPJKuWJ-4S7pz7xLObvA36_", "IMG_0226.HEIC", "heic"),
    ("1VBe71Zl9PUni9eNM2Y36NJbBiV_rZkEy", "IMG_2058.HEIC", "heic"),
    ("1bm9KlGEkB2YGRWYFi_0mKDuPXdaT41h-", "IMG_0252.HEIC", "heic"),
    ("1FL1r0qMiwDe7RU-1dYkHyy4rRs4zzLIl", "IMG_2065.HEIC", "heic"),
]


def main():
    TEMP_DIR.mkdir(exist_ok=True)
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)

    print("アクセストークン取得中...")
    token = get_access_token()

    # 現在の最大番号を取得
    existing = sorted(IMAGES_DIR.glob("img-*"))
    if existing:
        last_num = max(int(f.stem.split("-")[1]) for f in existing)
    else:
        last_num = 0

    next_num = last_num + 1
    print(f"img-{next_num:03d} から連番開始\n")

    processed = 0
    errors = 0

    for file_id, name, ftype in NEW_FILES:
        dest_name = f"img-{next_num:03d}.jpg"
        temp_path = TEMP_DIR / name

        print(f"  [{next_num:03d}] {name} → {dest_name} ...", end=" ", flush=True)

        try:
            # 1. ダウンロード
            download_file(token, file_id, temp_path)

            # 2. HEIC変換
            if ftype == "heic":
                jpg_path = TEMP_DIR / f"{temp_path.stem}.jpg"
                convert_heic_to_jpg(temp_path, jpg_path)
                temp_path.unlink()
                temp_path = jpg_path
            elif ftype == "png":
                # PNG → JPG 変換（サイズ削減）
                jpg_path = TEMP_DIR / f"{temp_path.stem}.jpg"
                subprocess.run([
                    "sips", "-s", "format", "jpeg",
                    "-s", "formatOptions", "85",
                    str(temp_path), "--out", str(jpg_path),
                ], capture_output=True, check=True)
                temp_path.unlink()
                temp_path = jpg_path

            # 3. リサイズ
            resized = resize_image(temp_path)

            # 4. 保存
            final_path = IMAGES_DIR / dest_name
            temp_path.rename(final_path)

            size_kb = final_path.stat().st_size / 1024
            status = "リサイズ済" if resized else "OK"
            print(f"✓ ({size_kb:.0f}KB, {status})")

            next_num += 1
            processed += 1

        except Exception as e:
            print(f"✗ エラー: {e}")
            errors += 1
            if temp_path.exists():
                temp_path.unlink()

    # 一時ディレクトリ削除
    try:
        TEMP_DIR.rmdir()
    except OSError:
        pass

    print(f"\n完了: {processed}件処理, {errors}件エラー")
    print(f"img-079 〜 img-{next_num - 1:03d} を保存しました")


if __name__ == "__main__":
    main()
