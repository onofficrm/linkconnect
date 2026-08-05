<?php
require_once __DIR__ . '/_common.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    lc_api_require_admin();

    $filters = array(
        'status' => isset($_GET['status']) ? (string) $_GET['status'] : '',
        'q'      => isset($_GET['q']) ? (string) $_GET['q'] : '',
    );

    lc_api_success(array(
        'items'   => lc_admin_merchants_for_api($filters),
        'summary' => lc_admin_merchant_summary(),
        'dbReady' => lc_db_installed(),
    ));
}

if ($method === 'POST') {
    lc_api_require_admin();
    lc_api_require_method('POST');

    if (!lc_db_installed()) {
        lc_api_error('DB가 설치되지 않았습니다.', 'DB_NOT_READY', 400);
    }

    $body = lc_api_read_json_body();
    $action = isset($body['action']) ? (string) $body['action'] : '';
    $mt_id = isset($body['mtId']) ? (int) $body['mtId'] : 0;

    if ($mt_id <= 0) {
        lc_api_error('광고주 ID가 필요합니다.', 'INVALID_REQUEST', 400);
    }

    if ($action === 'delete') {
        if (!lc_is_super_admin()) {
            lc_api_error('최고관리자만 광고주를 삭제할 수 있습니다.', 'FORBIDDEN', 403);
        }
        $confirm = isset($body['confirm']) ? trim((string) $body['confirm']) : '';
        if ($confirm !== '삭제') {
            lc_api_error('삭제를 확인하려면 confirm에 "삭제"를 입력해주세요.', 'CONFIRM_REQUIRED', 400);
        }
        $force = !empty($body['force']);
        $result = lc_merchant_delete($mt_id, $force);
        if (empty($result['ok'])) {
            lc_api_error($result['message'], 'DELETE_FAILED', 400);
        }
        lc_api_success(array(
            'message'            => $result['message'],
            'deletedCampaigns'   => (int) ($result['deletedCampaigns'] ?? 0),
            'deletedConversions' => (int) ($result['deletedConversions'] ?? 0),
        ));
    }

    $status_map = array(
        'activate' => LC_MERCHANT_STATUS_ACTIVE,
        'suspend'  => LC_MERCHANT_STATUS_SUSPENDED,
        'pending'  => LC_MERCHANT_STATUS_PENDING,
    );

    if (!isset($status_map[$action])) {
        lc_api_error('유효하지 않은 action입니다.', 'INVALID_ACTION', 400);
    }

    $result = lc_merchant_update_status($mt_id, $status_map[$action]);
    if (!$result['ok']) {
        lc_api_error($result['message'], 'UPDATE_FAILED', 400);
    }

    $merchant = lc_get_merchant_by_id($mt_id);
    $api_merchant = null;
    if (is_array($merchant)) {
        $api_merchant = array(
            'id'         => (int) $merchant['mt_id'],
            'code'       => (string) $merchant['mt_code'],
            'name'       => (string) $merchant['mt_company'],
            'status'     => lc_admin_merchant_status_ui($merchant['mt_status']),
            'statusCode' => (string) $merchant['mt_status'],
        );
    }

    lc_api_success(array(
        'message'  => $result['message'],
        'merchant' => $api_merchant,
    ));
}

lc_api_error('허용되지 않은 메서드입니다.', 'METHOD_NOT_ALLOWED', 405);
