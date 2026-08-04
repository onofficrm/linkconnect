#!/usr/bin/env bash
# 모두의철거 CPA 머천트 랜딩 out → onoff-builder-bridge imports 동기화
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/merchant/modemo-onepage/out"
DEST="$ROOT/plugin/onoff-builder-bridge/imports/modemo"

if [[ ! -d "$SRC" ]]; then
  echo "out 없음. 먼저 실행: cd merchant/modemo-onepage && npm run build:imports" >&2
  exit 1
fi

mkdir -p "$DEST"
rsync -a --delete \
  --exclude '._*' \
  --exclude '.DS_Store' \
  --exclude '*.map' \
  "$SRC/" "$DEST/"

find "$DEST" -name '._*' -delete 2>/dev/null || true
find "$DEST" -name '.DS_Store' -delete 2>/dev/null || true
find "$DEST" -name '*.map' -delete 2>/dev/null || true
# macOS AppleDouble (파일명이 ._ 없이 생성되는 경우)
find "$DEST" -type f -size 4096c 2>/dev/null | while IFS= read -r f; do
  if file "$f" 2>/dev/null | grep -q 'AppleDouble'; then
    rm -f "$f"
  fi
done

echo "Synced: $SRC -> $DEST"
ls -la "$DEST" | head -20
