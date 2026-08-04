#!/usr/bin/env bash
# LinkConnect 빌더 dist → onoff-builder-bridge imports 동기화
# 절대 onoffcpa 저장소 경로로 복사하지 말 것 (브랜드 분리).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/builder/linkconnect_source/dist"
DEST="$ROOT/plugin/onoff-builder-bridge/imports/linkconnect"

# 교차 저장소 복사 차단
case "$ROOT" in
  */onoffcpa|*/onoffcpa/)
    echo "sync-linkconnect-builder: REFUSE — onoffcpa 트리에서 linkconnect sync 실행 금지" >&2
    exit 1
    ;;
esac
if [[ "$DEST" == *"/onoffcpa/"* ]] || [[ "$SRC" == *"/onoffcpa/"* ]]; then
  echo "sync-linkconnect-builder: REFUSE — onoffcpa 경로로 SPA 동기화 금지" >&2
  echo "  onoffcpa SPA 는 onoffcpa/builder/linkconnect_source 에서만 빌드하세요." >&2
  exit 1
fi
if [[ -f "$DEST/spa-brand.onoffcpa" ]] && grep -qE '^brand=onoffcpa$' "$DEST/spa-brand.onoffcpa" 2>/dev/null; then
  echo "sync-linkconnect-builder: REFUSE — 대상이 온오프CPA SPA lock 을 가지고 있음: $DEST" >&2
  exit 1
fi

if [[ ! -d "$SRC" ]]; then
  echo "dist 없음. 먼저 실행: cd builder/linkconnect_source && npm run build" >&2
  exit 1
fi

mkdir -p "$DEST/assets"
rsync -a --delete \
  --exclude '._*' \
  --exclude '.DS_Store' \
  "$SRC/" "$DEST/"

echo "Synced: $SRC -> $DEST"
ls -la "$DEST/assets"
