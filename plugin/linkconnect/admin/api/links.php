<?php
require_once __DIR__ . '/_common.php';

lc_api_require_admin();

$method = isset($_SERVER['REQUEST_METHOD']) ? strtoupper((string) $_SERVER['REQUEST_METHOD']) : 'GET';

if ($method === 'GET') {
    $code = isset($_GET['code']) ? trim((string) $_GET['code']) : '';
    if ($code === '') {
        lc_api_error('링크 코드를 입력해 주세요.', 'CODE_REQUIRED', 400);
    }
    $link = lc_link_admin_lookup($code);
    if (!$link) {
        lc_api_error('홍보 링크를 찾을 수 없습니다.', 'NOT_FOUND', 404);
    }
    lc_api_success(array('link' => $link));
}

if ($method !== 'POST') {
    lc_api_error('허용되지 않은 HTTP 메서드입니다.', 'METHOD_NOT_ALLOWED', 405);
}

$body = lc_api_read_json_body();
$action = isset($body['action']) ? trim((string) $body['action']) : '';
if ($action !== 'save_script') {
    lc_api_error('유효하지 않은 action입니다.', 'INVALID_ACTION', 400);
}

$result = lc_link_save_head_script(
    isset($body['code']) ? (string) $body['code'] : '',
    isset($body['script']) ? (string) $body['script'] : ''
);
if (empty($result['ok'])) {
    lc_api_error((string) ($result['message'] ?? '저장에 실패했습니다.'), 'SAVE_FAILED', 400);
}

$link = lc_link_admin_lookup(isset($body['code']) ? (string) $body['code'] : '');
lc_api_success(array(
    'message' => (string) $result['message'],
    'link'    => $link,
));
