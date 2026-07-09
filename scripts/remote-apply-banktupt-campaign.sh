#!/usr/bin/env bash
# banktupt CPA 단일 상품 원격 적용 (linkconnect_seed_token 또는 linkconnect_install_token)
#
# Usage:
#   LC_SEED_TOKEN=your_token ./scripts/remote-apply-banktupt-campaign.sh
#   ./scripts/remote-apply-banktupt-campaign.sh https://linkconnect.co.kr your_token
set -euo pipefail

BASE_URL="${1:-https://linkconnect.co.kr}"
TOKEN="${2:-${LC_SEED_TOKEN:-${LC_INSTALL_TOKEN:-}}}"
ADVERTISER_MB="${3:-lc_advertiser}"

if [[ -z "$TOKEN" ]]; then
  echo "Usage: LC_SEED_TOKEN=token $0 [base_url] [token] [advertiser_mb_id]" >&2
  exit 1
fi

URL="${BASE_URL%/}/plugin/linkconnect/install/apply_banktupt_campaign.php"
echo "POST $URL"

curl -fsS -X POST "$URL" \
  -d "action=run" \
  -d "token=${TOKEN}" \
  -d "advertiser_mb_id=${ADVERTISER_MB}"

echo ""
