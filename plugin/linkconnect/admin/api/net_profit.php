<?php
require_once __DIR__ . '/_common.php';

$method = isset($_SERVER['REQUEST_METHOD']) ? strtoupper((string) $_SERVER['REQUEST_METHOD']) : 'GET';

if ($method !== 'GET') {
    lc_api_error('허용되지 않은 요청입니다.', 'METHOD_NOT_ALLOWED', 405);
}

lc_api_require_admin();

if (!function_exists('lc_net_profit_platform_allowed') || !lc_net_profit_platform_allowed()) {
    lc_api_error('이 사이트에서는 사용할 수 없는 기능입니다.', 'NOT_AVAILABLE', 404);
}

if (!function_exists('lc_net_profit_summary')) {
    lc_api_error('순이익 모듈이 로드되지 않았습니다.', 'MODULE_MISSING', 500);
}

$filters = array(
    'dateFrom' => isset($_GET['dateFrom']) ? (string) $_GET['dateFrom'] : (isset($_GET['date_from']) ? (string) $_GET['date_from'] : ''),
    'dateTo'   => isset($_GET['dateTo']) ? (string) $_GET['dateTo'] : (isset($_GET['date_to']) ? (string) $_GET['date_to'] : ''),
);

$result = lc_net_profit_summary($filters);
if (empty($result['ok'])) {
    lc_api_error((string) ($result['message'] ?? '조회에 실패했습니다.'), 'NET_PROFIT_ERROR', 400);
}

lc_api_success($result);
