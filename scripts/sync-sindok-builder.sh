#!/usr/bin/env bash
# 신독환경 정리·폐기물 CPA 랜딩 dist → onoff-builder-bridge imports 동기화
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/merchant/sindok/dist"
DEST="$ROOT/plugin/onoff-builder-bridge/imports/sindok"

if [[ ! -d "$SRC" ]]; then
  echo "dist 없음. 먼저 실행: cd merchant/sindok && npm run build:imports" >&2
  exit 1
fi

mkdir -p "$DEST/assets"
rsync -a --delete \
  --exclude '._*' \
  --exclude '.DS_Store' \
  --exclude '*.map' \
  "$SRC/" "$DEST/"

find "$DEST" -name '._*' -delete 2>/dev/null || true
find "$DEST" -name '.DS_Store' -delete 2>/dev/null || true
find "$DEST" -name '*.map' -delete 2>/dev/null || true

echo "Synced: $SRC -> $DEST"
ls -la "$DEST/assets"
