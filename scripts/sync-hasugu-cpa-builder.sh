#!/usr/bin/env bash
# 하수구/배관 CPA 머천트 랜딩 dist → onoff-builder-bridge imports 동기화
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/merchant/hasugu_cpa/dist"
DEST="$ROOT/plugin/onoff-builder-bridge/imports/hasugu_cpa"

if [[ ! -d "$SRC" ]]; then
  echo "dist 없음. 먼저 실행: cd merchant/hasugu_cpa && npm run build:imports" >&2
  exit 1
fi

mkdir -p "$DEST/assets"
rsync -a --delete \
  --exclude '._*' \
  --exclude '.DS_Store' \
  "$SRC/" "$DEST/"

echo "Synced: $SRC -> $DEST"
ls -la "$DEST/assets"
