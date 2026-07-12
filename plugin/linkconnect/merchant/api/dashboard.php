<?php
require_once __DIR__ . '/_common.php';

lc_api_require_method('GET');

$merchant = null;
if (function_exists('lc_merchant_api_use_strict_guard') && lc_merchant_api_use_strict_guard()) {
    $merchant = lc_api_require_active_merchant();
} else {
    lc_api_require_login();
    $merchant = lc_get_current_merchant();
}

$mt_id = is_array($merchant) ? (int) $merchant['mt_id'] : 0;

if ($mt_id > 0) {
    $data = lc_merchant_dashboard_for_api($mt_id);
} else {
    $data = array(
        'balance'          => 2350000,
        'balanceFormatted' => '2,350,000',
        'summary'          => array(
            'pending'       => 9,
            'approved'      => 21,
            'rejected'      => 4,
            'needsAction'   => 9,
            'todayReceived' => 17,
            'todaySpend'    => 300000,
        ),
        'chart7d'          => function_exists('lc_sample_merchant_chart_7d') ? lc_sample_merchant_chart_7d() : array(),
        'recent'           => lc_conversion_list_for_api(0),
        'pendingAction'    => 9,
    );
}

lc_api_success($data);
