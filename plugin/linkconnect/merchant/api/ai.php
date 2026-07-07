<?php
require_once __DIR__ . '/_common.php';

lc_api_require_method('POST');
$merchant = lc_api_require_active_merchant();
$mt_id = (int) $merchant['mt_id'];
lc_ai_require_ready('summary');

$body = lc_api_read_json_body();
$action = isset($body['action']) ? (string) $body['action'] : 'summary';

if ($action !== 'summary') {
    lc_api_error('유효하지 않은 action입니다.', 'INVALID_ACTION', 400);
}

$report = lc_ai_merchant_summary_data($mt_id);
$result = lc_ai_report_summary($report, 'merchant');
if (!$result['ok']) {
    lc_api_error($result['message'], 'AI_SUMMARY_FAILED', 400);
}

lc_api_success(array(
    'summary'  => $result['summary'],
    'fallback' => !empty($result['fallback']),
    'report'   => array(
        'summary' => $report['summary'] ?? array(),
    ),
));
