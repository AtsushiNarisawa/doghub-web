#!/usr/bin/env python3
"""
Google Drive ↔ web/public/images 同期スクリプト

使い方:
  # ローカル → Google Drive（アップロード）
  python scripts/sync-drive-images.py upload

  # Google Drive → ローカル（ダウンロード：新しい画像のみ）
  python scripts/sync-drive-images.py download

  # 特定ファイルをアップロード
  python scripts/sync-drive-images.py upload img-079.jpg
"""

import sys
import os
import json
import mimetypes
from pathlib import Path

import requests

# --- 設定 ---
TOKEN_PATH = os.path.expanduser("~/credentials/doghub-workspace-token.json")
IMAGES_DIR = Path(__file__).resolve().parent.parent / "public" / "images"
DRIVE_FOLDER_ID = "1WlXtBuOjogXLv01w5uexksJkGA6hn1pi"  # DogHub Web Images


def get_access_token():
    """リフレッシュトークンからアクセストークンを取得"""
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


def list_drive_files(token, folder_id):
    """指定フォルダ内のファイル一覧を取得"""
    files = []
    page_token = None
    while True:
        params = {
            "q": f"'{folder_id}' in parents and trashed = false",
            "fields": "nextPageToken, files(id, name, mimeType, modifiedTime)",
            "pageSize": 100,
        }
        if page_token:
            params["pageToken"] = page_token

        resp = requests.get(
            "https://www.googleapis.com/drive/v3/files",
            headers={"Authorization": f"Bearer {token}"},
            params=params,
        )
        resp.raise_for_status()
        data = resp.json()
        files.extend(data.get("files", []))
        page_token = data.get("nextPageToken")
        if not page_token:
            break
    return files


def upload_file(token, filepath, folder_id):
    """ファイルをGoogle Driveにアップロード"""
    mime_type = mimetypes.guess_type(str(filepath))[0] or "application/octet-stream"
    metadata = {
        "name": filepath.name,
        "parents": [folder_id],
    }

    # multipart upload
    boundary = "---drive-upload-boundary---"
    meta_json = json.dumps(metadata)
    file_data = filepath.read_bytes()

    body = (
        f"--{boundary}\r\n"
        f"Content-Type: application/json; charset=UTF-8\r\n\r\n"
        f"{meta_json}\r\n"
        f"--{boundary}\r\n"
        f"Content-Type: {mime_type}\r\n\r\n"
    ).encode() + file_data + f"\r\n--{boundary}--".encode()

    resp = requests.post(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": f"multipart/related; boundary={boundary}",
        },
        data=body,
    )
    resp.raise_for_status()
    return resp.json()


def download_file(token, file_id, dest_path):
    """Google Driveからファイルをダウンロード"""
    resp = requests.get(
        f"https://www.googleapis.com/drive/v3/files/{file_id}?alt=media",
        headers={"Authorization": f"Bearer {token}"},
    )
    resp.raise_for_status()
    dest_path.write_bytes(resp.content)


def cmd_upload(token, specific_file=None):
    """ローカル画像をDriveにアップロード"""
    existing = {f["name"] for f in list_drive_files(token, DRIVE_FOLDER_ID)}

    if specific_file:
        files = [IMAGES_DIR / specific_file]
    else:
        files = sorted(IMAGES_DIR.iterdir())

    uploaded = 0
    skipped = 0
    for fp in files:
        if not fp.is_file():
            continue
        if fp.name.startswith("."):
            continue
        if fp.name in existing:
            skipped += 1
            continue

        print(f"  アップロード中: {fp.name} ...", end=" ", flush=True)
        upload_file(token, fp, DRIVE_FOLDER_ID)
        print("✓")
        uploaded += 1

    print(f"\n完了: {uploaded}件アップロード, {skipped}件スキップ（既に存在）")


def cmd_download(token):
    """Driveの新しい画像をローカルにダウンロード"""
    drive_files = list_drive_files(token, DRIVE_FOLDER_ID)
    local_files = {f.name for f in IMAGES_DIR.iterdir() if f.is_file()}

    downloaded = 0
    skipped = 0
    for df in drive_files:
        if df["mimeType"].startswith("application/vnd.google-apps"):
            continue  # Google Docsなどはスキップ
        if df["name"] in local_files:
            skipped += 1
            continue

        dest = IMAGES_DIR / df["name"]
        print(f"  ダウンロード中: {df['name']} ...", end=" ", flush=True)
        download_file(token, df["id"], dest)
        print("✓")
        downloaded += 1

    print(f"\n完了: {downloaded}件ダウンロード, {skipped}件スキップ（既に存在）")


def main():
    if len(sys.argv) < 2:
        print("使い方: python sync-drive-images.py [upload|download] [filename]")
        sys.exit(1)

    command = sys.argv[1]
    print("アクセストークン取得中...")
    token = get_access_token()

    if command == "upload":
        specific = sys.argv[2] if len(sys.argv) > 2 else None
        cmd_upload(token, specific)
    elif command == "download":
        cmd_download(token)
    else:
        print(f"不明なコマンド: {command}")
        sys.exit(1)


if __name__ == "__main__":
    main()
