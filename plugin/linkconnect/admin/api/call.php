<?php
require_once __DIR__ . '/_common.php';

$method = isset($_SERVER['REQUEST_METHOD']) ? strtoupper($_SERVER['REQUEST_METHOD']) : 'GET';

if ($method === 'GET') {
    lc_api_require_admin();
    $view = isset($_GET['view']) ? (string) $_GET['view'] : '';

    if ($view === 'numbers') {
        $filters = array();
        if (isset($_GET['status'])) {
            $filters['status'] = (string) $_GET['status'];
        }
        if (isset($_GET['q'])) {
            $filters['q'] = (string) $_GET['q'];
        }
        $rows = array_map('lc_call_number_to_api', lc_call_numbers_list($filters));
        lc_api_success(array('items' => $rows, 'dbReady' => lc_db_installed()));
    }

    if ($view === 'requests') {
        $filters = array();
        if (isset($_GET['status'])) {
            $filters['status'] = (string) $_GET['status'];
        }
        $rows = array_map('lc_call_request_to_api', lc_call_requests_list($filters));
        lc_api_success(array('items' => $rows, 'dbReady' => lc_db_installed()));
    }

    if ($view === 'logs') {
        $filters = array('limit' => 300);
        foreach (array('pt_id', 'cp_id', 'mt_id', 'result') as $k) {
            if (isset($_GET[$k]) && $_GET[$k] !== '') {
                $filters[$k] = $_GET[$k];
            }
        }
        if (isset($_GET['unmatched']) && $_GET['unmatched'] === '1') {
            $filters['unmatched'] = true;
        }
        $rows = array();
        foreach (lc_call_logs_list($filters) as $row) {
            $rows[] = lc_call_log_to_api($row, false, false);
        }
        lc_api_success(array('items' => $rows, 'dbReady' => lc_db_installed()));
    }

    if ($view === 'settings') {
        $cp_id = isset($_GET['cpId']) ? (int) $_GET['cpId'] : 0;
        if ($cp_id <= 0) {
            lc_api_error('cpId가 필요합니다.', 'INVALID_ID', 400);
        }
        lc_api_success(array('settings' => lc_call_settings_get($cp_id)));
    }

    if ($view === 'recording') {
        $clog_id = isset($_GET['clogId']) ? (int) $_GET['clogId'] : 0;
        $res = lc_call_recording_url($clog_id);
        if (!$res['ok']) {
            lc_api_error($res['message'], 'NO_RECORDING', 404);
        }
        lc_api_success(array('url' => $res['url']));
    }

    lc_api_error('유효하지 않은 view입니다.', 'INVALID_VIEW', 400);
}

if ($method === 'POST') {
    lc_api_require_admin();
    lc_api_require_method('POST');

    $is_multipart = !empty($_FILES);
    $body = $is_multipart ? $_POST : lc_api_read_json_body();
    $action = isset($body['action']) ? (string) $body['action'] : ($is_multipart ? 'import_logs' : '');

    if ($action === 'create_number') {
        $result = lc_call_number_create(array(
            'number'   => $body['number'] ?? '',
            'provider' => $body['provider'] ?? '',
            'providerNumberId' => $body['providerNumberId'] ?? '',
            'memo'     => $body['memo'] ?? '',
        ));
        $result['ok'] ? lc_api_success($result) : lc_api_error($result['message'], 'CREATE_FAILED', 400);
    }

    if ($action === 'provision_number') {
        $result = lc_call_number_provision(array(
            'areaCode' => $body['areaCode'] ?? '',
            'memo'     => $body['memo'] ?? '',
        ));
        $result['ok'] ? lc_api_success($result) : lc_api_error($result['message'], 'PROVISION_FAILED', 400);
    }

    if ($action === 'update_number') {
        $result = lc_call_number_update((int) ($body['cnId'] ?? 0), array(
            'status' => $body['status'] ?? null,
            'memo'   => $body['memo'] ?? null,
            'providerNumberId' => $body['providerNumberId'] ?? null,
        ));
        $result['ok'] ? lc_api_success($result) : lc_api_error($result['message'], 'UPDATE_FAILED', 400);
    }

    if ($action === 'assign_request') {
        $result = lc_call_request_assign((int) ($body['carId'] ?? 0), (int) ($body['cnId'] ?? 0), (string) ($body['adminMemo'] ?? ''));
        $result['ok'] ? lc_api_success($result) : lc_api_error($result['message'], 'ASSIGN_FAILED', 400);
    }

    if ($action === 'assign_direct') {
        $result = lc_call_request_assign_direct(
            (int) ($body['ptId'] ?? 0),
            (int) ($body['cpId'] ?? 0),
            (int) ($body['cnId'] ?? 0),
            (string) ($body['adminMemo'] ?? '')
        );
        $result['ok'] ? lc_api_success($result) : lc_api_error($result['message'], 'ASSIGN_FAILED', 400);
    }

    if ($action === 'import_logs') {
        $file_key = '';
        foreach (array('file', 'csv', 'excel') as $key) {
            if (!empty($_FILES[$key]) && is_array($_FILES[$key]) && (int) ($_FILES[$key]['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_OK) {
                $file_key = $key;
                break;
            }
        }
        if ($file_key === '') {
            lc_api_error('업로드 파일이 필요합니다.', 'NO_FILE', 400);
        }

        $file = $_FILES[$file_key];
        $parsed = lc_call_logs_import_parse_file($file['tmp_name'], (string) ($file['name'] ?? 'upload.csv'));
        if (!$parsed['ok']) {
            lc_api_error($parsed['message'], 'PARSE_FAILED', 400);
        }

        $dry_run = !empty($body['dryRun']) || (isset($body['dryRun']) && (string) $body['dryRun'] === '1');
        if ($dry_run) {
            lc_api_success(array(
                'message' => $parsed['message'],
                'dryRun'  => true,
                'total'   => count($parsed['rows'] ?? array()),
                'headers' => $parsed['headers'] ?? array(),
                'preview' => array_slice($parsed['rows'] ?? array(), 0, 5),
            ));
        }

        $skip_conversion = !empty($body['skipConversion']) || (isset($body['skipConversion']) && (string) $body['skipConversion'] === '1');
        $result = lc_call_logs_import_bulk($parsed['rows'] ?? array(), $skip_conversion);
        $result['ok'] ? lc_api_success($result) : lc_api_error($result['message'], 'IMPORT_FAILED', 400);
    }

    if ($action === 'reject_request') {
        $result = lc_call_request_reject((int) ($body['carId'] ?? 0), (string) ($body['adminMemo'] ?? ''));
        $result['ok'] ? lc_api_success($result) : lc_api_error($result['message'], 'REJECT_FAILED', 400);
    }

    if ($action === 'revoke_request') {
        $result = lc_call_request_revoke((int) ($body['carId'] ?? 0), (string) ($body['adminMemo'] ?? ''));
        $result['ok'] ? lc_api_success($result) : lc_api_error($result['message'], 'REVOKE_FAILED', 400);
    }

    if ($action === 'save_settings') {
        $result = lc_call_settings_save((int) ($body['cpId'] ?? 0), $body, 'admin');
        $result['ok'] ? lc_api_success($result) : lc_api_error($result['message'], 'SAVE_FAILED', 400);
    }

    if ($action === 'final_status') {
        $result = lc_conversion_admin_final_status((int) ($body['cvId'] ?? 0), (string) ($body['finalAction'] ?? ''), (string) ($body['memo'] ?? ''));
        $result['ok'] ? lc_api_success($result) : lc_api_error($result['message'], 'FINAL_FAILED', 400);
    }

    lc_api_error('유효하지 않은 action입니다.', 'INVALID_ACTION', 400);
}

lc_api_error('허용되지 않은 HTTP 메서드입니다.', 'METHOD_NOT_ALLOWED', 405);
