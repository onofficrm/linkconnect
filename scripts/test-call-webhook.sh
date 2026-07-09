#!/usr/bin/env bash
# LinkConnect call_receive.php 웹훅 연동 테스트
#
# 사용 예:
#   CALL_WEBHOOK_TOKEN=secret VIRTUAL_NUMBER=050-7123-4567 ./scripts/test-call-webhook.sh
#   LINKCONNECT_BASE=https://linkconnect.co.kr CALL_WEBHOOK_TOKEN=secret ./scripts/test-call-webhook.sh

set -euo pipefail

BASE_URL="${LINKCONNECT_BASE:-https://linkconnect.co.kr}"
TOKEN="${CALL_WEBHOOK_TOKEN:-}"
VIRTUAL_NUMBER="${VIRTUAL_NUMBER:-050-0000-0000}"
CALLER="${CALLER:-010-1234-5678}"
DURATION="${DURATION:-90}"
RESULT="${RESULT:-success}"
CALL_ID="${CALL_ID:-TEST-$(date +%Y%m%d-%H%M%S)-$$}"

if [[ -z "$TOKEN" ]]; then
  echo "ERROR: CALL_WEBHOOK_TOKEN 환경변수가 필요합니다." >&2
  echo "예: CALL_WEBHOOK_TOKEN=your-token $0" >&2
  exit 1
fi

URL="${BASE_URL%/}/plugin/linkconnect/api/call_receive.php"
NOW="$(date -u +"%Y-%m-%dT%H:%M:%S+09:00" 2>/dev/null || date +"%Y-%m-%dT%H:%M:%S+09:00")"

PAYLOAD=$(cat <<EOF
{
  "providerCallId": "${CALL_ID}",
  "virtualNumber": "${VIRTUAL_NUMBER}",
  "caller": "${CALLER}",
  "startedAt": "${NOW}",
  "duration": ${DURATION},
  "result": "${RESULT}"
}
EOF
)

echo "→ POST ${URL}"
echo "  callId=${CALL_ID} virtualNumber=${VIRTUAL_NUMBER} duration=${DURATION}s result=${RESULT}"
echo

HTTP_CODE=$(curl -sS -w "\n%{http_code}" -X POST "$URL" \
  -H "Content-Type: application/json; charset=utf-8" \
  -H "X-CALL-TOKEN: ${TOKEN}" \
  -d "$PAYLOAD")

BODY=$(echo "$HTTP_CODE" | sed '$d')
CODE=$(echo "$HTTP_CODE" | tail -n 1)

echo "← HTTP ${CODE}"
echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
echo

if [[ "$CODE" != "200" ]]; then
  echo "FAIL: HTTP ${CODE}" >&2
  exit 1
fi

if echo "$BODY" | grep -q '"success"[[:space:]]*:[[:space:]]*true'; then
  echo "OK: 웹훅 수신 성공"
  exit 0
fi

echo "WARN: 200이지만 success=true가 아닙니다. 응답 본문을 확인하세요." >&2
exit 1
