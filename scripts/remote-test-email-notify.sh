#!/usr/bin/env bash
# LinkConnect 이메일 알림 테스트 발송
#
# Usage:
#   LC_EMAIL_TEST_TOKEN=token ./scripts/remote-test-email-notify.sh
#   ./scripts/remote-test-email-notify.sh https://linkconnect.co.kr token you@example.com
set -euo pipefail

BASE_URL="${1:-https://linkconnect.co.kr}"
TOKEN="${2:-${LC_EMAIL_TEST_TOKEN:-${LC_SEED_TOKEN:-${LC_INSTALL_TOKEN:-}}}}"
TO="${3:-jong8040@gmail.com}"

if [[ -z "$TOKEN" ]]; then
  echo "Usage: LC_EMAIL_TEST_TOKEN=token $0 [base_url] [token] [to_email]" >&2
  exit 1
fi

URL="${BASE_URL%/}/plugin/linkconnect/install/test_email_notify.php"
echo "POST $URL -> $TO"

curl -fsS -X POST "$URL" \
  -d "token=${TOKEN}" \
  -d "to=${TO}"

echo ""
