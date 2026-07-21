#!/usr/bin/env bash
# =====================================================================
# LINE会話の「誰なのか」を遡って埋めるバックフィル（CEO 実行用）
#
# 何をするか:
#   これまでLINEでやり取りした方の会話に、表示名と（分かる場合は）お客様情報を結びつけます。
#   ※これまでは記録する仕組みが無く、受信トレイを見ても誰からのメッセージか分かりませんでした。
#   ※今後のやり取りは自動で埋まります。これは過去分の一度きりの処理です。
#
# 使い方（web/ ディレクトリで実行）:
#   bash scripts/line-backfill.sh dry    # 更新せず、何件埋まるかだけ確認
#   bash scripts/line-backfill.sh run    # 実行
# =====================================================================
set -euo pipefail

MODE="${1:-dry}"

cd "$(dirname "$0")/.."   # web/ へ移動

if [ ! -f .env.local ]; then
  echo "❌ .env.local が見つかりません（web/ ディレクトリで実行してください）"; exit 1
fi
SECRET=$(python3 -c "import sys
for l in open('.env.local'):
    if l.startswith('CRON_SECRET='):
        print(l.split('=',1)[1].strip().strip(chr(34)).strip(chr(39))); break")
if [ -z "${SECRET:-}" ]; then
  echo "❌ CRON_SECRET を .env.local から読めませんでした"; exit 1
fi

BASE="https://dog-hub.shop/api/admin/line/backfill-conversations"

case "$MODE" in
  dry)
    echo "🔎 確認のみ（更新しません）"
    URL="${BASE}?dryRun=1"
    ;;
  run)
    echo "🚀 バックフィルを実行します"
    URL="${BASE}"
    ;;
  *)
    echo "❌ 不明なモード: '${MODE}'（dry / run のいずれか）"; exit 1
    ;;
esac

curl -sS -X POST "$URL" -H "authorization: Bearer ${SECRET}" | python3 -m json.tool
echo ""
echo "✅ 完了"
echo "  total           … 会話の総数"
echo "  nameFilled      … 表示名を新たに保存できた数"
echo "  customerLinked  … お客様情報と結びついた数"
echo "  nameUnavailable … 表示名を取得できなかった数（ブロック済み等）"
echo "  skipped         … 既に埋まっていて何もしなかった数"
