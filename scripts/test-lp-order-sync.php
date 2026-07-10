<?php
/**
 * 링크프라이스 실적 동기화(확정·취소·금액변경) 시나리오 테스트 (인메모리 스텁)
 *
 * 실행: php scripts/test-lp-order-sync.php
 */
error_reporting(E_ALL);
define('_GNUBOARD_', true);

define('LC_LP_ORDER_EXPECTED', 'expected');
define('LC_LP_ORDER_PENDING', 'pending');
define('LC_LP_ORDER_REVIEW', 'review');
define('LC_LP_ORDER_CONFIRMED', 'confirmed');
define('LC_LP_ORDER_APPROVED', 'approved');
define('LC_LP_ORDER_CANCEL_PENDING', 'cancel_pending');
define('LC_LP_ORDER_CANCELLED', 'cancelled');
define('LC_LP_ORDER_CANCELED', 'canceled');
define('LC_LP_ORDER_HOLD', 'hold');
define('LC_LP_ORDER_UNMATCHED', 'unmatched');
define('LC_LP_ORDER_ERROR', 'error');
define('LC_LP_RAW_NORMAL', '100');
define('LC_LP_RAW_SETTLE_WAIT', '200');
define('LC_LP_RAW_SETTLED', '210');
define('LC_LP_RAW_CANCEL_WAIT', '300');
define('LC_LP_RAW_CANCELLED', '310');
define('LC_LP_LEDGER_CREDIT', 'CREDIT');
define('LC_LP_LEDGER_DEBIT', 'DEBIT');
define('LC_LP_LEDGER_REVERSAL', 'REVERSAL');
define('LC_LP_SYNC_ORDERS', 'orders');
define('G5_DATA_PATH', sys_get_temp_dir() . '/lc_lp_order_sync_test');
@mkdir(G5_DATA_PATH . '/linkconnect', 0755, true);

$G = array(
    'pass' => 0,
    'fail' => 0,
    'orders' => array(),
    'ledger' => array(),
    'partners' => array(1 => array('pt_id' => 1, 'pt_balance' => 0)),
    'clicks' => array(
        'L1M1Tabcdef0123456789' => array('lpc_id' => 10, 'pt_id' => 1, 'lpm_id' => 1, 'u_id' => 'L1M1Tabcdef0123456789'),
    ),
    'merchants' => array(
        'shopA' => array('lpm_id' => 1, 'merchant_code' => 'shopA', 'partner_rate' => 70),
    ),
    'status_logs' => array(),
    'notifications' => array(),
    'sync_logs' => array(),
    'next_lpo' => 1,
    'next_lpl' => 1,
    'next_log' => 1,
    'api_pages' => array(), // ymd => [page => [rows...]]
    'api_fail_dates' => array(),
    '_last_insert' => 0,
);

function assert_true($cond, $label)
{
    global $G;
    if ($cond) {
        echo "PASS  {$label}\n";
        $G['pass']++;
    } else {
        echo "FAIL  {$label}\n";
        $G['fail']++;
    }
}

function lc_sql_escape($v) { return addslashes((string) $v); }
function lc_table($n) { return 'g5_lc_' . $n; }
function lc_db_table_exists($t) { return true; }
function lc_sql_error() { return ''; }
function lc_sql_insert_id()
{
    global $G;
    return (int) ($G['_last_insert'] ?? 0);
}

function _extract_set($sql)
{
    $out = array();
    if (!preg_match('/SET\s+(.+?)(?:\s+WHERE\s|\s*$)/is', $sql, $m)) {
        return $out;
    }
    $chunk = $m[1];
    if (preg_match_all("/([a-z_]+)\s*=\s*'((?:\\\\'|[^'])*)'/u", $chunk, $mm, PREG_SET_ORDER)) {
        foreach ($mm as $x) {
            $out[$x[1]] = stripcslashes($x[2]);
        }
    }
    if (preg_match_all('/([a-z_]+)\s*=\s*(NULL|NOW\(\)|COALESCE\([^)]+\)|-?\d+(?:\.\d+)?)/i', $chunk, $mm2, PREG_SET_ORDER)) {
        foreach ($mm2 as $x) {
            $k = $x[1];
            if (isset($out[$k])) {
                continue;
            }
            $v = $x[2];
            if (strcasecmp($v, 'NULL') === 0) {
                $out[$k] = null;
            } elseif (stripos($v, 'NOW') === 0 || stripos($v, 'COALESCE') === 0) {
                $out[$k] = date('Y-m-d H:i:s');
            } else {
                $out[$k] = $v;
            }
        }
    }
    return $out;
}

function lc_sql_query($sql)
{
    global $G;
    $sql = trim($sql);

    if (preg_match('/INSERT INTO `g5_lc_lp_orders`/i', $sql)) {
        $id = $G['next_lpo']++;
        $row = array_merge(array(
            'lpo_id' => $id,
            'trlog_id' => '',
            'uniq_id' => '',
            'pt_id' => 0,
            'lpm_id' => 0,
            'lpc_id' => 0,
            'u_id' => '',
            'merchant_code' => '',
            'order_code' => '',
            'product_code' => '',
            'product_name' => '',
            'item_count' => 1,
            'sales_amount' => 0,
            'lp_commission' => 0,
            'partner_rate' => 70,
            'partner_expected' => 0,
            'partner_confirmed' => 0,
            'platform_margin' => 0,
            'raw_status' => '',
            'lc_status' => 'pending',
            'occurred_at' => null,
            'confirmed_at' => null,
            'cancelled_at' => null,
            'last_synced_at' => null,
            'raw_json' => '',
        ), _extract_set($sql));
        $row['lpo_id'] = $id;
        $G['orders'][$id] = $row;
        $G['_last_insert'] = $id;
        return true;
    }

    if (preg_match('/UPDATE `g5_lc_lp_orders` SET (.+) WHERE lpo_id = (\d+)/is', $sql, $m)) {
        $id = (int) $m[2];
        if (!isset($G['orders'][$id])) {
            return false;
        }
        foreach (_extract_set('SET ' . $m[1]) as $k => $v) {
            $G['orders'][$id][$k] = $v;
        }
        return true;
    }

    if (preg_match('/INSERT INTO `g5_lc_lp_ledger`/i', $sql)) {
        $set = _extract_set($sql);
        $key = (string) ($set['idempotency_key'] ?? '');
        foreach ($G['ledger'] as $e) {
            if (($e['idempotency_key'] ?? '') === $key) {
                return false; // UNIQUE
            }
        }
        $id = $G['next_lpl']++;
        $row = array_merge(array('lpl_id' => $id), $set);
        $G['ledger'][$id] = $row;
        $G['_last_insert'] = $id;
        return true;
    }

    if (preg_match('/UPDATE `g5_lc_partners` SET pt_balance = pt_balance \+ \((-?\d+)\)/i', $sql, $m)) {
        if (preg_match('/WHERE pt_id = (\d+)/', $sql, $w)) {
            $pt = (int) $w[1];
            if (isset($G['partners'][$pt])) {
                $G['partners'][$pt]['pt_balance'] += (int) $m[1];
            }
        }
        return true;
    }

    if (preg_match('/INSERT INTO `g5_lc_lp_order_status_logs`/i', $sql) || preg_match('/INSERT INTO `g5_lc_lp_sync_logs`/i', $sql)) {
        return true;
    }

    return true;
}

function lc_sql_fetch($sql)
{
    global $G;
    if (preg_match("/FROM `g5_lc_lp_orders`.*trlog_id = '([^']+)'/is", $sql, $m)) {
        foreach ($G['orders'] as $o) {
            if ((string) $o['trlog_id'] === stripcslashes($m[1])) {
                return $o;
            }
        }
        return null;
    }
    if (preg_match("/FROM `g5_lc_lp_orders`.*uniq_id = '([^']+)'/is", $sql, $m)) {
        foreach ($G['orders'] as $o) {
            if ((string) ($o['uniq_id'] ?? '') === stripcslashes($m[1])) {
                return $o;
            }
        }
        return null;
    }
    if (preg_match("/FROM `g5_lc_lp_orders`.*merchant_code = '([^']+)'.*order_code = '([^']+)'.*product_code = '([^']+)'.*u_id = '([^']+)'/is", $sql, $m)) {
        foreach ($G['orders'] as $o) {
            if (
                (string) $o['merchant_code'] === stripcslashes($m[1])
                && (string) $o['order_code'] === stripcslashes($m[2])
                && (string) $o['product_code'] === stripcslashes($m[3])
                && (string) $o['u_id'] === stripcslashes($m[4])
            ) {
                return $o;
            }
        }
        return null;
    }
    if (preg_match('/FROM `g5_lc_lp_orders` WHERE lpo_id = (\d+)/', $sql, $m)) {
        return $G['orders'][(int) $m[1]] ?? null;
    }
    if (preg_match("/FROM `g5_lc_lp_ledger` WHERE idempotency_key = '([^']+)'/", $sql, $m)) {
        $key = stripcslashes($m[1]);
        foreach ($G['ledger'] as $e) {
            if (($e['idempotency_key'] ?? '') === $key) {
                return $e;
            }
        }
        return null;
    }
    if (preg_match('/FROM `g5_lc_partners` WHERE pt_id = (\d+)/', $sql, $m)) {
        return $G['partners'][(int) $m[1]] ?? null;
    }
    return null;
}

function lc_lp_config_get()
{
    return array('affiliate_code' => 'A_TEST', 'api_auth_key' => 'KEY', 'default_partner_rate' => 70);
}
function lc_lp_config_touch_sync($k) {}
function lc_lp_sync_acquire_lock($n) { return array('fp' => null); }
function lc_lp_sync_release_lock($l) {}
function lc_lp_log_sync_start($t, $e, $r) { global $G; return $G['next_log']++; }
function lc_lp_log_sync_finish($id, $ok, $code, $raw, $cnt, $msg) {}
function lc_lp_log_status_change($lpo, $from, $to, $fc, $tc, $note, $raw)
{
    global $G;
    $G['status_logs'][] = compact('lpo', 'from', 'to', 'fc', 'tc', 'note');
}
function lc_lp_repo_get_order_by_trlog($trlog)
{
    global $G;
    foreach ($G['orders'] as $o) {
        if ((string) $o['trlog_id'] === (string) $trlog) {
            return $o;
        }
    }
    return null;
}
function lc_lp_repo_get_merchant_by_code($code)
{
    global $G;
    return $G['merchants'][$code] ?? null;
}
function lc_lp_repo_find_click_by_u_id($u_id)
{
    global $G;
    return $G['clicks'][$u_id] ?? null;
}
function lc_lp_repo_parse_u_id($u_id)
{
    if (preg_match('/^L(\d+)M(\d+)T([a-f0-9]{16})$/i', $u_id, $m)) {
        return array('pt_id' => (int) $m[1], 'lpm_id' => (int) $m[2]);
    }
    return null;
}
function lc_notification_create($p)
{
    global $G;
    $G['notifications'][] = $p;
}
function lc_notification_recent_exists($c, $u, $t, $h) { return false; }

function lc_lp_client_fetch_orders($yyyymmdd, array $opts = array())
{
    global $G;
    $ymd = (string) $yyyymmdd;
    if (isset($G['api_fail_dates'][$ymd])) {
        return array('ok' => false, 'message' => 'API fail ' . $ymd, 'data' => array('result' => '500'), 'raw' => '');
    }
    $page = (int) ($opts['page'] ?? 1);
    $per = (int) ($opts['per_page'] ?? 1000);
    $pages = $G['api_pages'][$ymd] ?? array(1 => array());
    $chunk = $pages[$page] ?? array();
    $all = array();
    foreach ($pages as $rows) {
        foreach ($rows as $r) {
            $all[] = $r;
        }
    }
    return array(
        'ok' => true,
        'message' => 'OK',
        'data' => array(
            'result' => '0',
            'list_count' => count($all),
            'order_list' => $chunk,
        ),
        'raw' => json_encode(array('result' => '0', 'list_count' => count($all))),
    );
}

// Load mapping + sync helpers from production module (partial): redefine only what we need inline
require_once dirname(__DIR__) . '/plugin/linkconnect/inc/linkprice.php';

function seed_pending($trlog, $commission = 1000, $extra = array())
{
    global $G;
    $u = $extra['u_id'] ?? 'L1M1Tabcdef0123456789';
    $id = $G['next_lpo']++;
    $partner = round($commission * 0.7, 2);
    $G['orders'][$id] = array_merge(array(
        'lpo_id' => $id,
        'trlog_id' => $trlog,
        'uniq_id' => $extra['uniq_id'] ?? '',
        'pt_id' => 1,
        'lpm_id' => 1,
        'lpc_id' => 10,
        'u_id' => $u,
        'merchant_code' => 'shopA',
        'order_code' => $extra['order_code'] ?? ('ORD-' . $trlog),
        'product_code' => $extra['product_code'] ?? ('P-' . $trlog),
        'product_name' => 'item',
        'item_count' => 1,
        'sales_amount' => 50000,
        'lp_commission' => $commission,
        'partner_rate' => 70,
        'partner_expected' => $partner,
        'partner_confirmed' => 0,
        'platform_margin' => round($commission - $partner, 2),
        'raw_status' => '100',
        'lc_status' => 'pending',
        'occurred_at' => '2026-07-09 12:00:00',
        'confirmed_at' => null,
        'cancelled_at' => null,
        'last_synced_at' => null,
        'raw_json' => '',
    ), $extra);
    return $id;
}

function api_row($trlog, $status, $commission, $extra = array())
{
    return array_merge(array(
        'trlog_id' => $trlog,
        'm_id' => 'shopA',
        'o_cd' => $extra['o_cd'] ?? ('ORD-' . $trlog),
        'p_cd' => $extra['p_cd'] ?? ('P-' . $trlog),
        'p_nm' => 'item',
        'it_cnt' => '1',
        'user_id' => $extra['user_id'] ?? 'L1M1Tabcdef0123456789',
        'status' => (string) $status,
        'sales' => 50000,
        'commission' => $commission,
        'yyyymmdd' => $extra['yyyymmdd'] ?? '20260709',
        'hhmiss' => '120000',
        'trans_comment' => '',
    ), $extra);
}

echo "=== LinkPrice order sync tests ===\n";

// 1) pending → approved
$G['orders'] = array();
$G['ledger'] = array();
$G['partners'][1]['pt_balance'] = 0;
$G['next_lpo'] = 1;
$G['next_lpl'] = 1;
$id1 = seed_pending('T1', 1000);
$up = lc_lp_order_upsert_from_api(api_row('T1', '210', 1000));
assert_true(!empty($up['ok']) && $up['action'] === 'updated', '1. pending→approved upsert ok');
assert_true(($G['orders'][$id1]['lc_status'] ?? '') === 'approved', '1. lc_status=approved');
assert_true((float) ($G['orders'][$id1]['partner_confirmed'] ?? 0) === 700.0, '1. partner_confirmed=700');
assert_true(count($G['ledger']) === 1 && ($G['ledger'][1]['entry_type'] ?? '') === 'CREDIT', '1. CREDIT ledger');
assert_true((int) $G['partners'][1]['pt_balance'] === 700, '1. balance +700');

// 2) pending → canceled
$G['orders'] = array();
$G['ledger'] = array();
$G['partners'][1]['pt_balance'] = 0;
$G['next_lpo'] = 1;
$G['next_lpl'] = 1;
$id2 = seed_pending('T2', 1000);
$up = lc_lp_order_upsert_from_api(api_row('T2', '310', 1000));
assert_true(($G['orders'][$id2]['lc_status'] ?? '') === 'canceled', '2. pending→canceled');
assert_true((float) ($G['orders'][$id2]['partner_expected'] ?? -1) === 0.0, '2. expected cleared');
assert_true((float) ($G['orders'][$id2]['partner_confirmed'] ?? -1) === 0.0, '2. confirmed=0');
assert_true(count($G['ledger']) === 0, '2. no ledger on pre-confirm cancel');
assert_true(!empty($G['orders'][$id2]['cancelled_at']), '2. cancelled_at set');

// 3) approved → canceled (REVERSAL)
$G['orders'] = array();
$G['ledger'] = array();
$G['partners'][1]['pt_balance'] = 0;
$G['next_lpo'] = 1;
$G['next_lpl'] = 1;
$id3 = seed_pending('T3', 1000);
lc_lp_order_upsert_from_api(api_row('T3', '210', 1000));
$bal_after_credit = (int) $G['partners'][1]['pt_balance'];
$up = lc_lp_order_upsert_from_api(api_row('T3', '310', 1000));
assert_true(($G['orders'][$id3]['lc_status'] ?? '') === 'canceled', '3. approved→canceled');
assert_true((float) ($G['orders'][$id3]['partner_confirmed'] ?? -1) === 0.0, '3. confirmed cleared');
$types = array_column($G['ledger'], 'entry_type');
assert_true(in_array('CREDIT', $types, true) && in_array('REVERSAL', $types, true), '3. CREDIT+REVERSAL');
assert_true((int) $G['partners'][1]['pt_balance'] === 0 && $bal_after_credit === 700, '3. balance back to 0');
$cancel_notices = array_filter($G['notifications'], function ($n) {
    return ($n['type'] ?? '') === 'lp_cancel_after_confirm';
});
assert_true(count($cancel_notices) >= 1, '3. cancel-after-confirm notify');

// 4) commission increase while approved
$G['orders'] = array();
$G['ledger'] = array();
$G['partners'][1]['pt_balance'] = 0;
$G['notifications'] = array();
$G['next_lpo'] = 1;
$G['next_lpl'] = 1;
$id4 = seed_pending('T4', 1000);
lc_lp_order_upsert_from_api(api_row('T4', '210', 1000));
lc_lp_order_upsert_from_api(api_row('T4', '210', 2000));
assert_true((float) ($G['orders'][$id4]['lp_commission'] ?? 0) === 2000.0, '4. commission=2000');
assert_true((float) ($G['orders'][$id4]['partner_confirmed'] ?? 0) === 1400.0, '4. confirmed=1400');
assert_true((int) $G['partners'][1]['pt_balance'] === 1400, '4. balance +1400 (700+700)');
$chg = array_filter($G['notifications'], function ($n) {
    return ($n['type'] ?? '') === 'lp_commission_change';
});
assert_true(count($chg) >= 1, '4. commission change notify');

// 5) commission decrease
$G['orders'] = array();
$G['ledger'] = array();
$G['partners'][1]['pt_balance'] = 0;
$G['next_lpo'] = 1;
$G['next_lpl'] = 1;
$id5 = seed_pending('T5', 2000);
lc_lp_order_upsert_from_api(api_row('T5', '210', 2000));
lc_lp_order_upsert_from_api(api_row('T5', '210', 1000));
assert_true((float) ($G['orders'][$id5]['partner_confirmed'] ?? 0) === 700.0, '5. confirmed=700 after decrease');
assert_true((int) $G['partners'][1]['pt_balance'] === 700, '5. balance 1400-700=700');
$debits = array_filter($G['ledger'], function ($e) {
    return ($e['entry_type'] ?? '') === 'DEBIT';
});
assert_true(count($debits) === 1, '5. DEBIT for decrease');

// 6) idempotent re-sync
$G['orders'] = array();
$G['ledger'] = array();
$G['partners'][1]['pt_balance'] = 0;
$G['next_lpo'] = 1;
$G['next_lpl'] = 1;
seed_pending('T6', 1000);
lc_lp_order_upsert_from_api(api_row('T6', '210', 1000));
$ledger_cnt = count($G['ledger']);
$bal = (int) $G['partners'][1]['pt_balance'];
$up = lc_lp_order_upsert_from_api(api_row('T6', '210', 1000));
assert_true(($up['action'] ?? '') === 'unchanged', '6. second sync unchanged');
assert_true(count($G['ledger']) === $ledger_cnt, '6. no duplicate ledger');
assert_true((int) $G['partners'][1]['pt_balance'] === $bal, '6. balance unchanged');

// 7) trlog_id change → new registration (composite match updates trlog)
$G['orders'] = array();
$G['ledger'] = array();
$G['partners'][1]['pt_balance'] = 0;
$G['next_lpo'] = 1;
$G['next_lpl'] = 1;
$id7 = seed_pending('OLD7', 1000, array('order_code' => 'ORD7', 'product_code' => 'P7'));
// Simulate: old trlog gone; new trlog same order/product/u_id (batch re-create)
$G['orders'][$id7]['trlog_id'] = 'OLD7';
$up = lc_lp_order_upsert_from_api(api_row('NEW7', '210', 1000, array('o_cd' => 'ORD7', 'p_cd' => 'P7')));
assert_true(($up['action'] ?? '') === 'updated' || ($up['action'] ?? '') === 'inserted', '7. rematch ok');
// Prefer update via composite when old trlog not found
$matched = null;
foreach ($G['orders'] as $o) {
    if (($o['order_code'] ?? '') === 'ORD7') {
        $matched = $o;
        break;
    }
}
assert_true(is_array($matched) && (string) $matched['trlog_id'] === 'NEW7', '7. trlog updated to NEW7');

// 8) API partial failure (one date fails, other continues)
$G['orders'] = array();
$G['ledger'] = array();
$G['api_pages'] = array(
    '20260708' => array(1 => array(api_row('T8A', '100', 500, array('yyyymmdd' => '20260708')))),
    '20260709' => array(1 => array(api_row('T8B', '100', 500, array('yyyymmdd' => '20260709')))),
);
$G['api_fail_dates'] = array('20260708' => true);
$G['next_lpo'] = 1;
$res = lc_lp_sync_orders(array(
    'mode' => 'range',
    'from' => '2026-07-08',
    'to' => '2026-07-09',
    'skip_lock' => true,
));
assert_true(!empty($res['ok']) || ($res['inserted'] ?? 0) + ($res['updated'] ?? 0) > 0, '8. sync continues after partial fail');
assert_true(($res['failed'] ?? 0) >= 1, '8. failed count >= 1');
assert_true(isset($G['orders']) && count(array_filter($G['orders'], function ($o) {
    return ($o['trlog_id'] ?? '') === 'T8B';
})) === 1, '8. T8B inserted despite T8A date fail');
$G['api_fail_dates'] = array();

// 9) pagination
$G['orders'] = array();
$page1 = array();
$page2 = array();
for ($i = 0; $i < 3; $i++) {
    $page1[] = api_row('P9_' . $i, '100', 100, array('yyyymmdd' => '20260701'));
}
for ($i = 3; $i < 5; $i++) {
    $page2[] = api_row('P9_' . $i, '100', 100, array('yyyymmdd' => '20260701'));
}
$G['api_pages'] = array('20260701' => array(1 => $page1, 2 => $page2));
$G['next_lpo'] = 1;
$paged = lc_lp_client_fetch_orders_paged('20260701', array('per_page' => 3));
assert_true(!empty($paged['ok']) && count($paged['orders']) === 5, '9. pagination fetches 5');
assert_true(($paged['pages'] ?? 0) === 2, '9. pages=2');

// 10) month boundary dates
$dates = lc_lp_sync_orders_dates(array('mode' => 'prev_month'));
assert_true(count($dates) === 1 && preg_match('/^\d{6}$/', $dates[0]), '10. prev_month is YYYYMM');
$dates7 = lc_lp_sync_orders_dates(array('mode' => 'last7'));
assert_true(count($dates7) === 7, '10. last7 has 7 days');
$G['orders'] = array();
$G['api_pages'] = array(
    '20260630' => array(1 => array(api_row('MB1', '210', 1000, array('yyyymmdd' => '20260630')))),
    '20260701' => array(1 => array(api_row('MB2', '210', 1000, array('yyyymmdd' => '20260701')))),
);
$G['next_lpo'] = 1;
$G['next_lpl'] = 1;
$G['partners'][1]['pt_balance'] = 0;
$res = lc_lp_sync_orders(array(
    'mode' => 'range',
    'from' => '2026-06-30',
    'to' => '2026-07-01',
    'skip_lock' => true,
));
assert_true(($res['inserted'] ?? 0) === 2, '10. month-boundary 2 inserts');
assert_true(count($G['ledger']) === 2, '10. two CREDIT ledgers');

// status map sanity
$map = lc_lp_status_map();
assert_true($map['100'] === 'pending' && $map['210'] === 'approved' && $map['310'] === 'canceled', 'map. official codes');

echo "\nResult: {$G['pass']} passed, {$G['fail']} failed\n";
exit($G['fail'] > 0 ? 1 : 0);
