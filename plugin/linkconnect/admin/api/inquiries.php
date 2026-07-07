<?php
require_once __DIR__ . '/_common.php';

lc_api_require_admin();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $iq_id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    $center = isset($_GET['center']) ? trim((string) $_GET['center']) : '';
    $status = isset($_GET['status']) ? trim((string) $_GET['status']) : '';
    $q = isset($_GET['q']) ? trim((string) $_GET['q']) : '';

    if ($iq_id > 0) {
        $row = lc_inquiry_get_by_id($iq_id);
        if (!$row) {
            lc_api_error('문의를 찾을 수 없습니다.', 'NOT_FOUND', 404);
        }
        $rows = lc_inquiry_list(array('q' => (string) ($row['iq_code'] ?? '')), 1);
        $detail = $rows ? $rows[0] : $row;
        lc_api_success(array(
            'item' => lc_inquiry_to_api($detail, true),
        ));
    }

    $filters = array();
    if ($center !== '') {
        $filters['center'] = $center;
    }
    if ($status !== '') {
        $filters['status'] = $status;
    }
    if ($q !== '') {
        $filters['q'] = $q;
    }

    lc_api_success(array(
        'summary' => lc_inquiry_summary($filters),
        'items'   => array_map(function ($row) {
            return lc_inquiry_to_api($row, false);
        }, lc_inquiry_list($filters)),
        'dbReady' => lc_db_installed(),
    ));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = lc_api_read_json_body();
    $iq_id = isset($body['iqId']) ? (int) $body['iqId'] : 0;
    if ($iq_id <= 0) {
        lc_api_error('문의 ID가 필요합니다.', 'INVALID_ID', 400);
    }

    $result = lc_inquiry_admin_reply($iq_id, $body);
    if (!$result['ok']) {
        lc_api_error($result['message'], 'INQUIRY_UPDATE_FAILED', 400);
    }

    $rows = lc_inquiry_list(array('q' => (string) ($result['inquiry']['iq_code'] ?? '')), 1);
    $detail = $rows ? $rows[0] : $result['inquiry'];

    lc_api_success(array(
        'message' => $result['message'],
        'item'    => lc_inquiry_to_api($detail, true),
        'summary' => lc_inquiry_summary(),
    ));
}

lc_api_error('허용되지 않은 HTTP 메서드입니다.', 'METHOD_NOT_ALLOWED', 405);
