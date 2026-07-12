#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="$ROOT/lib/tcpdf"

if [[ -f "$TARGET/tcpdf.php" ]]; then
  echo "TCPDF already installed at $TARGET"
  exit 0
fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

curl -sL "https://github.com/tecnickcom/TCPDF/archive/refs/tags/6.8.0.tar.gz" | tar -xz -C "$TMP" --strip-components=1
rm -rf "$TMP/examples"
mkdir -p "$TARGET"
cp -R "$TMP/." "$TARGET/"

echo "TCPDF installed to $TARGET"
