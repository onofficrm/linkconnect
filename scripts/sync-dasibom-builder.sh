#!/usr/bin/env bash
# 다시봄 개인회생/파산 머천트 랜딩 dist → onoff-builder-bridge imports 동기화
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/merchant/bankrupt_dasibom/dist"
DEST="$ROOT/plugin/onoff-builder-bridge/imports/dasibom"

if [[ ! -d "$SRC" ]]; then
  echo "dist 없음. 먼저 실행: cd merchant/bankrupt_dasibom && npm run build:imports" >&2
  exit 1
fi

mkdir -p "$DEST/assets"
rsync -a --delete \
  --exclude '._*' \
  --exclude '.DS_Store' \
  "$SRC/" "$DEST/"

echo "Synced: $SRC -> $DEST"
ls -la "$DEST/assets"
