#!/usr/bin/env bash
# =====================================================================
# リピートエンジン 送信バッチ（CEO 実行用）
# 本番 marketing-send API を叩く薄いラッパー。CRON_SECRET は web/.env.local から自動読込（値は表示しない）。
#
# 使い方（web/ ディレクトリで実行）:
#   bash scripts/send-repeat-batch.sh test                                        # 自分(narisawa@)に文面プレビューを2通送る（顧客DB非接触）
#   bash scripts/send-repeat-batch.sh dry  summer_harvest summer2026_harvest 40    # 送信せず対象数とサンプルを確認
#   bash scripts/send-repeat-batch.sh send summer_harvest summer2026_harvest 40    # 本送信（40人へ・250ms間隔）
#
# 後続バッチの例:
#   bash scripts/send-repeat-batch.sh send summer_harvest   summer2026_harvest   80   # H残り（バウンス確認後）
#   bash scripts/send-repeat-batch.sh send summer_discovery summer2026_discovery 100  # P（発見型）
# =====================================================================
set -euo pipefail

MODE="${1:-dry}"
SEGMENT="${2:-summer_harvest}"
CAMPAIGN="${3:-summer2026_harvest}"
LIMIT="${4:-40}"

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

BASE="https://dog-hub.shop/api/admin/marketing-send"

case "$MODE" in
  test)
    echo "✉️  テスト送信: narisawa@dog-hub.shop へ harvest / discovery の2通（顧客DBには触れません）"
    URL="${BASE}?test=narisawa@dog-hub.shop"
    ;;
  dry)
    echo "🔎 dryRun（送信しません）: segment=${SEGMENT} campaign=${CAMPAIGN} limit=${LIMIT}"
    URL="${BASE}?campaign=${CAMPAIGN}&segment=${SEGMENT}&limit=${LIMIT}&dryRun=1"
    ;;
  send)
    echo "🚀 本送信: segment=${SEGMENT} campaign=${CAMPAIGN} limit=${LIMIT}"
    echo "   （5秒後に開始します。中止する場合は Ctrl+C）"
    sleep 5
    URL="${BASE}?campaign=${CAMPAIGN}&segment=${SEGMENT}&limit=${LIMIT}"
    ;;
  *)
    echo "❌ 不明なモード: '${MODE}'（test / dry / send のいずれか）"; exit 1
    ;;
esac

curl -sS -X POST "$URL" -H "authorization: Bearer ${SECRET}" | python3 -m json.tool
echo ""
echo "✅ 完了"
