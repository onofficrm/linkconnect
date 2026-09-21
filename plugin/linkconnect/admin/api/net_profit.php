<?php
require_once __DIR__ . '/_common.php';

$method = isset($_SERVER['REQUEST_METHOD']) ? strtoupper((string) $_SERVER['REQUEST_METHOD']) : 'GET';

lc_api_require_admin();

if (!function_exists('lc_net_profit_platform_allowed') || !lc_net_profit_platform_allowed()) {
    lc_api_error('이 사이트에서는 사용할 수 없는 기능입니다.', 'NOT_AVAILABLE', 404);
}

if (!function_exists('lc_net_profit_summary')) {
    lc_api_error('순이익 모듈이 로드되지 않았습니다.', 'MODULE_MISSING', 500);
}

if ($method === 'GET') {
    $filters = array(
        'dateFrom' => isset($_GET['dateFrom']) ? (string) $_GET['dateFrom'] : (isset($_GET['date_from']) ? (string) $_GET['date_from'] : ''),
        'dateTo'   => isset($_GET['dateTo']) ? (string) $_GET['dateTo'] : (isset($_GET['date_to']) ? (string) $_GET['date_to'] : ''),
    );

    $result = lc_net_profit_summary($filters);
    if (empty($result['ok'])) {
        lc_api_error((string) ($result['message'] ?? '조회에 실패했습니다.'), 'NET_PROFIT_ERROR', 400);
    }

    lc_api_success($result);
}

if ($method === 'POST') {
    $payload = lc_api_read_json_body();
    $action = isset($payload['action']) ? (string) $payload['action'] : 'create_payout';

    if ($action === 'create_payout') {
        $result = lc_net_profit_payout_create(array(
            'amount'     => $payload['amount'] ?? 0,
            'memo'       => $payload['memo'] ?? '',
            'paidAt'     => $payload['paidAt'] ?? '',
            'periodFrom' => $payload['periodFrom'] ?? ($payload['dateFrom'] ?? ''),
            'periodTo'   => $payload['periodTo'] ?? ($payload['dateTo'] ?? ''),
        ));
        if (empty($result['ok'])) {
            lc_api_error((string) ($result['message'] ?? '저장 실패'), 'PAYOUT_CREATE_FAILED', 400);
        }

        $summary = lc_net_profit_summary(array(
            'dateFrom' => (string) ($payload['periodFrom'] ?? ($payload['dateFrom'] ?? '')),
            'dateTo'   => (string) ($payload['periodTo'] ?? ($payload['dateTo'] ?? '')),
        ));

        lc_api_success(array(
            'message' => $result['message'],
            'payout'  => $result['payout'] ?? null,
            'summary' => $summary,
        ));
    }

    if ($action === 'delete_payout') {
        $npp_id = isset($payload['id']) ? (int) $payload['id'] : (isset($payload['nppId']) ? (int) $payload['nppId'] : 0);
        $result = lc_net_profit_payout_delete($npp_id);
        if (empty($result['ok'])) {
            lc_api_error((string) ($result['message'] ?? '삭제 실패'), 'PAYOUT_DELETE_FAILED', 400);
        }

        $summary = lc_net_profit_summary(array(
            'dateFrom' => (string) ($payload['periodFrom'] ?? ($payload['dateFrom'] ?? '')),
            'dateTo'   => (string) ($payload['periodTo'] ?? ($payload['dateTo'] ?? '')),
        ));

        lc_api_success(array(
            'message' => $result['message'],
            'summary' => $summary,
        ));
    }

    lc_api_error('알 수 없는 요청입니다.', 'INVALID_ACTION', 400);
}

lc_api_error('허용되지 않은 요청입니다.', 'METHOD_NOT_ALLOWED', 405);
