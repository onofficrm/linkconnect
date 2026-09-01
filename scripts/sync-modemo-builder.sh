#!/usr/bin/env bash
# 모두의 철거 Vite dist → onoff-builder-bridge imports/modemo 동기화 (LOCAL)
# Phase 2: local sync only — do not FTP / Production deploy from this script alone.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/merchant/모두의-철거/dist"
DEST="$ROOT/plugin/onoff-builder-bridge/imports/modemo"

if [[ ! -d "$SRC" ]]; then
  echo "dist 없음. 먼저 실행: cd merchant/모두의-철거 && npm run build:imports" >&2
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
find "$DEST" -type f -size 4096c 2>/dev/null | while IFS= read -r f; do
  if file "$f" 2>/dev/null | grep -q 'AppleDouble'; then
    rm -f "$f"
  fi
done

echo "Synced (LOCAL): $SRC -> $DEST"
ls -la "$DEST" | head -20
