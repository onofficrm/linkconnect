<?php
/**
 * 계약 접근 제어 순수 로직 검증 (DB·세션 없음)
 * 실행: php plugin/linkconnect/tests/merchant_contract_access_logic_test.php
 */

declare(strict_types=1);

function assert_true(bool $cond, string $msg): void
{
    if (!$cond) {
        fwrite(STDERR, "FAIL: {$msg}\n");
        exit(1);
    }
}

function grace_active_for_until(string $until): bool
{
    if ($until === '') {
        return false;
    }
    $ts = strtotime($until . ' 23:59:59');

    return $ts !== false && time() <= $ts;
}

function access_state(bool $signed, string $grace_until): array
{
    $grace = !$signed && grace_active_for_until($grace_until);
    $blocked = !$signed && !$grace;

    return array(
        'signed'  => $signed,
        'grace'   => $grace,
        'blocked' => $blocked,
    );
}

// 체결 완료
$s = access_state(true, '');
assert_true($s['signed'] && !$s['grace'] && !$s['blocked'], 'signed merchant not blocked');

// 미체결 + 유예 없음
$s = access_state(false, '');
assert_true(!$s['signed'] && !$s['grace'] && $s['blocked'], 'unsigned without grace is blocked');

// 미체결 + 미래 유예
$future = date('Y-m-d', strtotime('+30 days'));
$s = access_state(false, $future);
assert_true(!$s['signed'] && $s['grace'] && !$s['blocked'], 'unsigned with future grace is not blocked');

// 미체결 + 과거 유예
$past = date('Y-m-d', strtotime('-1 day'));
$s = access_state(false, $past);
assert_true(!$s['signed'] && !$s['grace'] && $s['blocked'], 'unsigned with expired grace is blocked');

echo "OK: merchant contract access logic tests passed\n";
