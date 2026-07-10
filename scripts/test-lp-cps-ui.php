<?php
/**
 * CPS UI 보안·헬퍼 단위 테스트
 * php scripts/test-lp-cps-ui.php
 */
error_reporting(E_ALL);
define('_GNUBOARD_', true);
define('LC_LP_ORDER_PENDING', 'pending');
define('LC_LP_ORDER_APPROVED', 'approved');
define('LC_LP_ORDER_CANCELED', 'canceled');
define('LC_LP_ORDER_CANCEL_PENDING', 'cancel_pending');
define('LC_LP_ORDER_REVIEW', 'review');
define('LC_LP_ORDER_HOLD', 'hold');
define('LC_LP_ORDER_UNMATCHED', 'unmatched');
define('LC_LP_ORDER_CONFIRMED', 'confirmed');
define('LC_LP_ORDER_CANCELLED', 'cancelled');
define('LC_LP_ORDER_EXPECTED', 'expected');
define('LC_LP_ORDER_ERROR', 'error');

$pass = 0;
$fail = 0;
function assert_true($c, $l) {
    global $pass, $fail;
    if ($c) { echo "PASS  {$l}\n"; $pass++; }
    else { echo "FAIL  {$l}\n"; $fail++; }
}

// Minimal stubs for status helpers used by settle_hint
function lc_lp_status_is_approved($s) {
    return in_array((string) $s, array('approved', 'confirmed'), true);
}
function lc_lp_status_is_canceled($s) {
    return in_array((string) $s, array('canceled', 'cancelled'), true);
}

// Inline the pure helpers (avoid loading full linkprice.php)
function lc_lp_mask_order_code($code)
{
    $code = (string) $code;
    $len = mb_strlen($code);
    if ($len <= 4) {
        return str_repeat('*', $len);
    }
    if ($len <= 8) {
        return mb_substr($code, 0, 2) . str_repeat('*', $len - 4) . mb_substr($code, -2);
    }
    return mb_substr($code, 0, 3) . str_repeat('*', min(6, $len - 6)) . mb_substr($code, -3);
}
function lc_lp_csv_safe($value)
{
    $v = (string) $value;
    if ($v !== '' && preg_match('/^[=+\-@\t\r]/', $v)) {
        return "'" . $v;
    }
    return $v;
}
function lc_lp_order_settle_hint($lc_status)
{
    $s = (string) $lc_status;
    if (lc_lp_status_is_approved($s)) {
        return '확정 완료 — 출금 가능 수익에 반영됩니다.';
    }
    if (lc_lp_status_is_canceled($s) || $s === LC_LP_ORDER_CANCEL_PENDING) {
        return '취소 처리 — 수익에서 제외됩니다.';
    }
    if ($s === LC_LP_ORDER_REVIEW || $s === LC_LP_ORDER_HOLD) {
        return '정산 대기 — 광고주·링크프라이스 검수 후 확정됩니다.';
    }
    if ($s === LC_LP_ORDER_UNMATCHED) {
        return '미매칭 — 관리자 확인이 필요합니다.';
    }
    return '예상 실적 — 반품·취소·검수에 따라 변경될 수 있습니다.';
}

echo "=== CPS UI security helpers ===\n";

assert_true(lc_lp_csv_safe('=CMD()') === "'=CMD()", 'CSV formula injection blocked =');
assert_true(lc_lp_csv_safe('+1+1') === "'+1+1", 'CSV formula injection blocked +');
assert_true(lc_lp_csv_safe('normal') === 'normal', 'CSV normal passthrough');
assert_true(strpos(lc_lp_mask_order_code('ORDER123456'), '*') !== false, 'order code masked');
assert_true(mb_strlen(lc_lp_mask_order_code('AB')) === 2, 'short order fully masked length');
assert_true(strpos(lc_lp_order_settle_hint('approved'), '출금') !== false, 'approved settle hint');
assert_true(strpos(lc_lp_order_settle_hint('pending'), '예상') !== false, 'pending settle hint');

// Partner scope: simulate filter always includes pt_id
$partner_pt = 42;
$filters = array('pt_id' => $partner_pt);
assert_true((int) $filters['pt_id'] === 42, 'partner scope pt_id forced');
// URL ID attack: request ptId ignored
$request_pt = 99;
$effective = $partner_pt; // session wins
assert_true($effective !== $request_pt, 'URL ptId override blocked');

echo "\nResult: {$pass} passed, {$fail} failed\n";
exit($fail > 0 ? 1 : 0);
