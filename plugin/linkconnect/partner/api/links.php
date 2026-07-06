<?php
require_once __DIR__ . '/_common.php';

$method = isset($_SERVER['REQUEST_METHOD']) ? strtoupper($_SERVER['REQUEST_METHOD']) : 'GET';

if ($method === 'GET') {
    $partner = lc_api_require_active_partner();
    $pt_id = (int) $partner['pt_id'];
    $items = array_map('lc_link_to_api', lc_link_list_for_partner($pt_id));

    lc_api_success(array(
        'items' => $items,
        'total' => count($items),
    ));
}

if ($method === 'POST') {
    $partner = lc_api_require_active_partner();
    $pt_id = (int) $partner['pt_id'];
    $body = lc_api_read_json_body();

    $cp_id = isset($body['campaignId']) ? (int) $body['campaignId'] : (isset($body['cp_id']) ? (int) $body['cp_id'] : 0);
    $channel = isset($body['channel']) ? trim((string) $body['channel']) : '';
    $sub_id = isset($body['subId']) ? trim((string) $body['subId']) : (isset($body['sub_id']) ? trim((string) $body['sub_id']) : '');

    if ($cp_id <= 0) {
        lc_api_error('캠페인 ID가 필요합니다.', 'INVALID_CAMPAIGN', 400);
    }

    $result = lc_link_create($pt_id, $cp_id, $channel, $sub_id);
    if (!$result['ok']) {
        lc_api_error($result['message'], 'CREATE_FAILED', 400);
    }

    lc_api_success(array(
        'message' => $result['message'],
        'link'    => $result['link'],
    ));
}

lc_api_error('허용되지 않은 HTTP 메서드입니다.', 'METHOD_NOT_ALLOWED', 405);
