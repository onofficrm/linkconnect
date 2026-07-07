<?php
require_once __DIR__ . '/_common.php';

$method = isset($_SERVER['REQUEST_METHOD']) ? strtoupper($_SERVER['REQUEST_METHOD']) : 'GET';

/**
 * 파트너 콜디비 API
 * - 가상번호 신청(관리자 배정 대기), 신청/배정 현황, 배정된 번호 노출, 콜 통화내역
 */

function lc_partner_call_current_pt()
{
    if (LC_PARTNER_GUARD_ENABLED && lc_db_installed() && !lc_is_super_admin()) {
        $partner = lc_api_require_active_partner();
    } else {
        lc_api_require_login();
        $partner = lc_get_current_partner();
    }

    return is_array($partner) ? (int) $partner['pt_id'] : 0;
}

if ($method === 'GET') {
    $pt_id = lc_partner_call_current_pt();
    $view = isset($_GET['view']) ? (string) $_GET['view'] : 'requests';

    if ($view === 'requests') {
        $rows = array_map('lc_call_request_to_api', lc_call_requests_list(array('pt_id' => $pt_id)));
        lc_api_success(array('items' => $rows, 'dbReady' => lc_db_installed()));
    }

    if ($view === 'logs') {
        $rows = array();
        foreach (lc_call_logs_list(array('pt_id' => $pt_id, 'limit' => 200)) as $row) {
            $rows[] = lc_call_log_to_api($row, false, true);
        }
        lc_api_success(array('items' => $rows, 'dbReady' => lc_db_installed()));
    }

    lc_api_error('유효하지 않은 view입니다.', 'INVALID_VIEW', 400);
}

if ($method === 'POST') {
    $pt_id = lc_partner_call_current_pt();
    lc_api_require_method('POST');

    $body = lc_api_read_json_body();
    $action = isset($body['action']) ? (string) $body['action'] : '';

    if ($action === 'request') {
        $result = lc_call_request_create($pt_id, (int) ($body['cpId'] ?? 0), (string) ($body['memo'] ?? ''));
        $result['ok'] ? lc_api_success($result) : lc_api_error($result['message'], 'REQUEST_FAILED', 400);
    }

    lc_api_error('유효하지 않은 action입니다.', 'INVALID_ACTION', 400);
}

lc_api_error('허용되지 않은 HTTP 메서드입니다.', 'METHOD_NOT_ALLOWED', 405);
