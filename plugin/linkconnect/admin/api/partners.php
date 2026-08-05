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
        'items'   => lc_admin_partners_for_api($filters),
        'summary' => lc_admin_partner_summary(),
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
    $pt_id = isset($body['ptId']) ? (int) $body['ptId'] : 0;

    if ($pt_id <= 0) {
        lc_api_error('파트너 ID가 필요합니다.', 'INVALID_REQUEST', 400);
    }

    if ($action === 'delete') {
        if (!lc_is_super_admin()) {
            lc_api_error('최고관리자만 파트너를 삭제할 수 있습니다.', 'FORBIDDEN', 403);
        }
        $confirm = isset($body['confirm']) ? trim((string) $body['confirm']) : '';
        if ($confirm !== '삭제') {
            lc_api_error('삭제를 확인하려면 confirm에 "삭제"를 입력해주세요.', 'CONFIRM_REQUIRED', 400);
        }
        $force = !empty($body['force']);
        $result = lc_partner_delete($pt_id, $force);
        if (empty($result['ok'])) {
            lc_api_error($result['message'], 'DELETE_FAILED', 400);
        }
        lc_api_success(array(
            'message'         => $result['message'],
            'conversionCount' => (int) ($result['conversionCount'] ?? 0),
        ));
    }

    $status_map = array(
        'activate' => LC_PARTNER_STATUS_ACTIVE,
        'suspend'  => LC_PARTNER_STATUS_SUSPENDED,
        'pending'  => LC_PARTNER_STATUS_PENDING,
    );

    if (!isset($status_map[$action])) {
        lc_api_error('유효하지 않은 action입니다.', 'INVALID_ACTION', 400);
    }

    $result = lc_partner_update_status($pt_id, $status_map[$action]);
    if (!$result['ok']) {
        lc_api_error($result['message'], 'UPDATE_FAILED', 400);
    }

    $partner = lc_get_partner_by_id($pt_id);
    $api_partner = null;
    if (is_array($partner)) {
        $api_partner = array(
            'id'         => (int) $partner['pt_id'],
            'code'       => (string) $partner['pt_code'],
            'name'       => (string) $partner['pt_name'],
            'status'     => lc_admin_partner_status_ui($partner['pt_status']),
            'statusCode' => (string) $partner['pt_status'],
        );
    }

    lc_api_success(array(
        'message' => $result['message'],
        'partner' => $api_partner,
    ));
}

lc_api_error('허용되지 않은 메서드입니다.', 'METHOD_NOT_ALLOWED', 405);
