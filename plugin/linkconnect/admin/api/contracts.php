<?php
require_once __DIR__ . '/_common.php';

lc_api_require_admin();

if (function_exists('lc_merchant_contract_db_ensure_schema')) {
    lc_merchant_contract_db_ensure_schema();
}
if (function_exists('lc_merchant_contract_status_log_db_ensure_schema')) {
    lc_merchant_contract_status_log_db_ensure_schema();
}

$method = isset($_SERVER['REQUEST_METHOD']) ? strtoupper($_SERVER['REQUEST_METHOD']) : 'GET';

if ($method === 'GET') {
    $mc_id = isset($_GET['mcId']) ? (int) $_GET['mcId'] : (isset($_GET['id']) ? (int) $_GET['id'] : 0);

    if ($mc_id > 0) {
        $detail = lc_merchant_contract_admin_detail_for_api($mc_id);
        if ($detail === null) {
            lc_api_error('계약서를 찾을 수 없습니다.', 'NOT_FOUND', 404);
        }
        lc_api_success($detail);
    }

    $filters = array(
        'q'          => isset($_GET['q']) ? (string) $_GET['q'] : '',
        'status'     => isset($_GET['status']) ? (string) $_GET['status'] : '',
        'version'    => isset($_GET['version']) ? (string) $_GET['version'] : '',
        'mtId'       => isset($_GET['mtId']) ? (int) $_GET['mtId'] : 0,
        'signedFrom' => isset($_GET['signedFrom']) ? (string) $_GET['signedFrom'] : '',
        'signedTo'   => isset($_GET['signedTo']) ? (string) $_GET['signedTo'] : '',
        'page'       => isset($_GET['page']) ? (int) $_GET['page'] : 1,
        'limit'      => isset($_GET['limit']) ? (int) $_GET['limit'] : 30,
    );

  $data = lc_merchant_contract_admin_list_for_api($filters);
    $data['dbReady'] = lc_db_installed();
    $data['currentVersion'] = lc_merchant_contract_current_version();

    lc_api_success($data);
}

if ($method === 'POST') {
    lc_api_require_method('POST');
    $body = lc_api_read_json_body();
    $action = isset($body['action']) ? (string) $body['action'] : '';

    if ($action === 'seed_demo') {
        if (!function_exists('lc_demo_contract_seed_for_merchant')) {
            if (is_file(LC_PLUGIN_PATH . '/inc/demo_seed.php')) {
                require_once LC_PLUGIN_PATH . '/inc/demo_seed.php';
            }
        }

        $mt_id = isset($body['mtId']) ? (int) $body['mtId'] : 0;
        if ($mt_id <= 0 && function_exists('lc_demo_default_advertiser_mb_id') && function_exists('lc_get_merchant_by_mb_id')) {
            $demo = lc_get_merchant_by_mb_id(lc_demo_default_advertiser_mb_id());
            if (is_array($demo)) {
                $mt_id = (int) ($demo['mt_id'] ?? 0);
            }
        }
        if ($mt_id <= 0) {
            lc_api_error('광고주 ID(mtId)가 필요합니다.', 'INVALID_REQUEST', 400);
        }

        $result = lc_demo_contract_seed_for_merchant($mt_id);
        if (empty($result['ok'])) {
            lc_api_error($result['message'], 'SEED_FAILED', 400);
        }

        lc_api_success(array(
            'message'      => $result['message'],
            'skipped'      => !empty($result['skipped']),
            'contractCode' => (string) ($result['contractCode'] ?? ''),
            'mtId'         => $mt_id,
        ));
    }

    $mc_id = isset($body['mcId']) ? (int) $body['mcId'] : 0;
    $reason = isset($body['reason']) ? (string) $body['reason'] : '';

    if ($mc_id <= 0) {
        lc_api_error('계약 ID가 필요합니다.', 'INVALID_REQUEST', 400);
    }

    $status_map = array(
        'cancel'        => LC_MERCHANT_CONTRACT_STATUS_CANCELLED,
        'expire'        => LC_MERCHANT_CONTRACT_STATUS_EXPIRED,
        'requireRenewal'=> LC_MERCHANT_CONTRACT_STATUS_RENEWAL,
    );

    if (!isset($status_map[$action])) {
        lc_api_error('유효하지 않은 action입니다.', 'INVALID_ACTION', 400);
    }

    $result = lc_merchant_contract_admin_update_status($mc_id, $status_map[$action], $reason);
    if (empty($result['ok'])) {
        lc_api_error($result['message'], 'UPDATE_FAILED', 400);
    }

    lc_api_success(array(
        'message' => $result['message'],
        'detail'  => lc_merchant_contract_admin_detail_for_api($mc_id),
    ));
}

lc_api_error('허용되지 않은 HTTP 메서드입니다.', 'METHOD_NOT_ALLOWED', 405);
