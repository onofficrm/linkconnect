<?php
/**
 * 링크프라이스 POSTBACK 시나리오 테스트 (인메모리 스텁)
 *
 * 실행: php scripts/test-lp-postback.php
 */
error_reporting(E_ALL);
define('_GNUBOARD_', true);
define('LC_PARTNER_STATUS_ACTIVE', 'active');
define('LC_LP_ORDER_EXPECTED', 'expected');
define('LC_LP_ORDER_PENDING', 'pending');
define('LC_LP_ORDER_HOLD', 'hold');
define('LC_LP_ORDER_CONFIRMED', 'confirmed');
define('LC_LP_PB_RECEIVED', 'received');
define('LC_LP_PB_PROCESSED', 'processed');
define('LC_LP_PB_DUPLICATE', 'duplicate');
define('LC_LP_PB_UNMATCHED', 'unmatched');
define('LC_LP_PB_ERROR', 'error');
define('G5_DATA_PATH', sys_get_temp_dir() . '/lc_lp_pb_test');
@mkdir(G5_DATA_PATH . '/linkconnect', 0755, true);

$G = array(
    'pass' => 0,
    'fail' => 0,
    'postbacks' => array(),
    'orders' => array(),
    'clicks' => array(),
    'merchants' => array(),
    'next_lpp' => 1,
    'next_lpo' => 1,
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
function lc_sql_query($sql)
{
    global $G;
    // Minimal INSERT/UPDATE simulation for postbacks & orders
    if (preg_match('/INSERT INTO `g5_lc_lp_postbacks`/i', $sql)) {
        $id = $G['next_lpp']++;
        $row = array(
            'lpp_id' => $id,
            'trlog_id' => '',
            'uniq_id' => '',
            'merchant_code' => '',
            'order_code' => '',
            'u_id' => '',
            'request_json' => '',
            'request_headers' => '',
            'request_ip' => '',
            'is_duplicate' => 0,
            'process_status' => 'received',
            'error_message' => '',
            'match_note' => '',
            'lpo_id' => 0,
            'received_at' => date('Y-m-d H:i:s'),
            'processed_at' => null,
        );
        // extract SET values roughly from escaped SQL is hard — filled by update calls
        if (preg_match("/request_json = '((?:\\\\'|[^'])*)'/u", $sql, $m)) {
            $row['request_json'] = stripcslashes($m[1]);
        }
        if (preg_match("/trlog_id = '((?:\\\\'|[^'])*)'/", $sql, $m)) {
            $row['trlog_id'] = stripcslashes($m[1]);
        }
        if (preg_match("/uniq_id = '((?:\\\\'|[^'])*)'/", $sql, $m)) {
            $row['uniq_id'] = stripcslashes($m[1]);
        }
        if (preg_match("/merchant_code = '((?:\\\\'|[^'])*)'/", $sql, $m)) {
            $row['merchant_code'] = stripcslashes($m[1]);
        }
        if (preg_match("/order_code = '((?:\\\\'|[^'])*)'/", $sql, $m)) {
            $row['order_code'] = stripcslashes($m[1]);
        }
        if (preg_match("/u_id = '((?:\\\\'|[^'])*)'/", $sql, $m)) {
            $row['u_id'] = stripcslashes($m[1]);
        }
        $G['postbacks'][$id] = $row;
        $G['_last_insert'] = $id;
        return true;
    }
    if (preg_match('/INSERT INTO `g5_lc_lp_orders`/i', $sql)) {
        $id = $G['next_lpo']++;
        $row = array('lpo_id' => $id, 'trlog_id' => '', 'uniq_id' => '', 'pt_id' => 0, 'lpm_id' => 0, 'lpc_id' => 0,
            'u_id' => '', 'merchant_code' => '', 'order_code' => '', 'product_code' => '', 'product_name' => '',
            'item_count' => 1, 'sales_amount' => 0, 'lp_commission' => 0, 'partner_rate' => 70,
            'partner_expected' => 0, 'partner_confirmed' => 0, 'platform_margin' => 0,
            'lc_status' => 'expected', 'raw_json' => '');
        foreach (array('trlog_id','uniq_id','u_id','merchant_code','order_code','product_code','product_name','lc_status') as $col) {
            if (preg_match("/{$col} = '((?:\\\\'|[^'])*)'/", $sql, $m)) {
                $row[$col] = stripcslashes($m[1]);
            }
        }
        foreach (array('pt_id','lpm_id','lpc_id','item_count') as $col) {
            if (preg_match("/{$col} = (\d+)/", $sql, $m)) {
                $row[$col] = (int) $m[1];
            }
        }
        foreach (array('sales_amount','lp_commission','partner_rate','partner_expected','partner_confirmed','platform_margin') as $col) {
            if (preg_match("/{$col} = '((?:\\\\'|[^'])*)'/", $sql, $m)) {
                $row[$col] = (float) stripcslashes($m[1]);
            }
        }
        $G['orders'][$id] = $row;
        $G['_last_insert'] = $id;
        return true;
    }
    if (preg_match('/UPDATE `g5_lc_lp_postbacks` SET (.+) WHERE lpp_id = (\d+)/is', $sql, $m)) {
        $id = (int) $m[2];
        if (!isset($G['postbacks'][$id])) {
            return false;
        }
        $set = $m[1];
        if (preg_match("/process_status = '((?:\\\\'|[^'])*)'/", $set, $x)) {
            $G['postbacks'][$id]['process_status'] = stripcslashes($x[1]);
        }
        if (preg_match("/error_message = '((?:\\\\'|[^'])*)'/", $set, $x)) {
            $G['postbacks'][$id]['error_message'] = stripcslashes($x[1]);
        }
        if (preg_match("/match_note = '((?:\\\\'|[^'])*)'/", $set, $x)) {
            $G['postbacks'][$id]['match_note'] = stripcslashes($x[1]);
        }
        if (preg_match('/lpo_id = (\d+)/', $set, $x)) {
            $G['postbacks'][$id]['lpo_id'] = (int) $x[1];
        }
        if (preg_match('/is_duplicate = (\d+)/', $set, $x)) {
            $G['postbacks'][$id]['is_duplicate'] = (int) $x[1];
        }
        return true;
    }
    return true;
}
function lc_sql_fetch($sql)
{
    global $G;
    if (preg_match("/FROM `g5_lc_lp_orders` WHERE trlog_id = '((?:\\\\'|[^'])*)'/", $sql, $m)) {
        $tr = stripcslashes($m[1]);
        foreach ($G['orders'] as $o) {
            if ($o['trlog_id'] === $tr) {
                return $o;
            }
        }
        return null;
    }
    if (preg_match("/FROM `g5_lc_lp_clicks` WHERE u_id = '((?:\\\\'|[^'])*)'/", $sql, $m)) {
        $uid = stripcslashes($m[1]);
        foreach ($G['clicks'] as $c) {
            if ($c['u_id'] === $uid) {
                return $c;
            }
        }
        return null;
    }
    if (preg_match("/FROM `g5_lc_lp_merchants` WHERE merchant_code = '((?:\\\\'|[^'])*)'/", $sql, $m)) {
        $code = stripcslashes($m[1]);
        foreach ($G['merchants'] as $mer) {
            if ($mer['merchant_code'] === $code) {
                return $mer;
            }
        }
        return null;
    }
    if (preg_match("/FROM `g5_lc_lp_orders`\s+WHERE uniq_id/is", $sql)) {
        return null; // uniq path rarely hit when trlog present
    }
    return null;
}
function sql_fetch_array($r) { return false; }
function lc_lp_config_get()
{
    return array('postback_secret' => '', 'default_partner_rate' => 80, 'affiliate_code' => 'A100TEST');
}
function lc_settings_get_bool($k) { return false; }
function lc_settings_get($k, $d = '') { return $d; }
function lc_lp_repo_get_merchant_by_code($code)
{
    global $G;
    foreach ($G['merchants'] as $m) {
        if ($m['merchant_code'] === $code) {
            return $m;
        }
    }
    return null;
}
function lc_lp_repo_get_order_by_trlog($trlog_id)
{
    global $G;
    foreach ($G['orders'] as $o) {
        if ($o['trlog_id'] === (string) $trlog_id) {
            return $o;
        }
    }
    return null;
}
function lc_lp_repo_parse_u_id($u_id)
{
    if (!preg_match('/^L(\d+)M(\d+)T([A-Za-z0-9]+)$/', (string) $u_id, $m)) {
        return null;
    }
    return array('pt_id' => (int) $m[1], 'lpm_id' => (int) $m[2], 'token' => $m[3]);
}
function lc_lp_repo_calc_shares($lp_commission, $partner_rate, $lc_status)
{
    $commission = max(0, (float) $lp_commission);
    $rate = max(0, min(100, (float) $partner_rate));
    $partner = round($commission * ($rate / 100), 2);
    $margin = round($commission - $partner, 2);
    return array('partner_expected' => $partner, 'partner_confirmed' => 0.0, 'platform_margin' => $margin);
}
function lc_lp_log_status_change() { return 0; }
function lc_lp_log_sync_start() { return 0; }
function lc_lp_log_sync_finish() {}

require dirname(__DIR__) . '/plugin/linkconnect/inc/linkprice.php';

$G['merchants'][] = array(
    'lpm_id' => 456,
    'merchant_code' => 'linkprice',
    'partner_rate' => 80,
    'click_url' => 'https://click.linkprice.com/click.php?m=linkprice',
    'subscript' => 'APR',
    'visible' => 1,
    'sync_active' => 1,
);
$G['clicks'][] = array(
    'lpc_id' => 1,
    'pt_id' => 123,
    'lpm_id' => 456,
    'u_id' => 'L123M456Tabc123def4567890',
);

function sample_payload($overrides = array())
{
    return array_merge(array(
        'day' => '20200701',
        'time' => '112719',
        'merchant_id' => 'linkprice',
        'order_code' => 'oc11123',
        'product_code' => 'pc11123',
        'product_name' => 'test%20product',
        'category_code' => 'cc11',
        'item_count' => 1,
        'price' => 20000,
        'commision' => 10000,
        'affiliate_id' => 'A100TEST',
        'affiliate_user_id' => 'L123M456Tabc123def4567890',
        'trlog_id' => 10000536080255,
        'uniq_id' => '6a2a12825aee4',
        'base_commission' => '8%',
        'incentive_commission' => '1%',
    ), $overrides);
}

$_SERVER['REMOTE_ADDR'] = '203.0.113.50';
$_SERVER['CONTENT_TYPE'] = 'application/json';
$_SERVER['REQUEST_METHOD'] = 'POST';

echo "=== LinkPrice POSTBACK Tests ===\n";

// 1. 정상 실적
$r1 = lc_lp_postback_receive(json_encode(sample_payload()), 'application/json', '203.0.113.50');
assert_true($r1['http'] === 200 && ($r1['body']['result'] ?? '') === 'success', '1. 정상 실적 HTTP 200');
assert_true(($r1['results'][0]['status'] ?? '') === 'processed', '1b. 상태 processed');
$o1 = reset($G['orders']);
assert_true($o1 && (float) $o1['partner_expected'] === 8000.0 && (float) $o1['platform_margin'] === 2000.0 && (float) $o1['partner_confirmed'] === 0.0, '1c. 커미션 10000×80% = 8000 / 마진 2000 / 확정 0');
assert_true($o1['lc_status'] === 'expected', '1d. lc_status=expected');

// 2. 동일 POSTBACK 재전송
$r2 = lc_lp_postback_receive(json_encode(sample_payload()), 'application/json', '203.0.113.50');
assert_true(($r2['results'][0]['status'] ?? '') === 'duplicate', '2. 동일 trlog 재전송 → duplicate');
assert_true(count($G['orders']) === 1, '2b. 주문 수 증가 없음');

// 3. trlog_id가 다른 동일 주문
$r3 = lc_lp_postback_receive(json_encode(sample_payload(array(
    'trlog_id' => 10000536089999,
    'commision' => 9000,
))), 'application/json', '203.0.113.50');
assert_true(($r3['results'][0]['status'] ?? '') === 'processed', '3. 다른 trlog 동일 주문 → 신규 등록');
assert_true(count($G['orders']) === 2, '3b. 주문 2건');

// 4. 잘못된 u_id
$r4 = lc_lp_postback_receive(json_encode(sample_payload(array(
    'trlog_id' => 2001,
    'affiliate_user_id' => 'INVALID_UID_XXX',
    'uniq_id' => 'uniq_bad_uid',
))), 'application/json', '203.0.113.50');
assert_true(($r4['results'][0]['status'] ?? '') === 'unmatched', '4. 잘못된 u_id → unmatched (원본 저장)');
assert_true(count($G['postbacks']) >= 1, '4b. postback 원본 존재');

// 5. 존재하지 않는 광고주
$r5 = lc_lp_postback_receive(json_encode(sample_payload(array(
    'trlog_id' => 2002,
    'merchant_id' => 'no_such_m',
    'uniq_id' => 'uniq_no_m',
))), 'application/json', '203.0.113.50');
assert_true(in_array(($r5['results'][0]['status'] ?? ''), array('unmatched', 'processed'), true), '5. 없는 광고주도 저장(미매칭/처리)');
$found5 = false;
foreach ($G['orders'] as $o) {
    if ($o['trlog_id'] === '2002') {
        $found5 = true;
        assert_true((int) $o['pt_id'] === 0 || $o['merchant_code'] === 'no_such_m', '5b. 없는 광고주 주문 저장됨');
    }
}
assert_true($found5, '5c. trlog 2002 주문 존재');

// 6. 커미션 0원
$r6 = lc_lp_postback_receive(json_encode(sample_payload(array(
    'trlog_id' => 2003,
    'commision' => 0,
    'uniq_id' => 'uniq_zero',
))), 'application/json', '203.0.113.50');
assert_true(($r6['results'][0]['status'] ?? '') === 'processed', '6. 커미션 0원 허용');
foreach ($G['orders'] as $o) {
    if ($o['trlog_id'] === '2003') {
        assert_true((float) $o['partner_expected'] === 0.0, '6b. 예상수익 0');
    }
}

// 7. 필수값 누락
$r7 = lc_lp_postback_receive(json_encode(sample_payload(array(
    'trlog_id' => 2004,
    'order_code' => '',
    'uniq_id' => 'uniq_miss',
))), 'application/json', '203.0.113.50');
assert_true(($r7['results'][0]['status'] ?? '') === 'error', '7. 필수값 누락 → error');
assert_true($r7['http'] === 200, '7b. 원본 저장 후 LP에는 200 (재전송 폭주 방지)');

// 8. 잘못된 JSON
$r8 = lc_lp_postback_receive('{not json', 'application/json', '203.0.113.50');
assert_true($r8['http'] === 400, '8. 잘못된 JSON → 400');

// 9. 음수 금액
$r9 = lc_lp_postback_receive(json_encode(sample_payload(array(
    'trlog_id' => 2005,
    'price' => -100,
    'uniq_id' => 'uniq_neg',
))), 'application/json', '203.0.113.50');
assert_true(($r9['results'][0]['status'] ?? '') === 'error', '9. 음수 price → error');

// 10. 상품이 여러 개인 주문 (배열)
$multi = array(
    sample_payload(array('trlog_id' => 3001, 'product_code' => 'p1', 'uniq_id' => 'bundle1', 'commision' => 1000)),
    sample_payload(array('trlog_id' => 3002, 'product_code' => 'p2', 'uniq_id' => 'bundle1', 'commision' => 2000)),
);
$r10 = lc_lp_postback_receive(json_encode($multi), 'application/json', '203.0.113.50');
assert_true(count($r10['results']) === 2, '10. 복수 상품 2라인 처리');
assert_true(($r10['results'][0]['status'] ?? '') === 'processed' && ($r10['results'][1]['status'] ?? '') === 'processed', '10b. 두 라인 모두 processed');

echo "\n--- Result: {$G['pass']} passed, {$G['fail']} failed ---\n";
exit($G['fail'] > 0 ? 1 : 0);
