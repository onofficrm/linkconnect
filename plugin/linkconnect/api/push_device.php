<?php
require_once dirname(__DIR__) . '/_common.php';

lc_api_require_login();

if (!function_exists('lc_push_session_targets')) {
    /**
     * @return array<int,array{center:string,userId:int}>
     */
    function lc_push_session_targets()
    {
        $targets = array();
        if (function_exists('lc_is_super_admin') && lc_is_super_admin()) {
            $targets[] = array('center' => 'admin', 'userId' => 0);
        }
        if (function_exists('lc_get_current_partner')) {
            $partner = lc_get_current_partner();
            if (is_array($partner) && (int) ($partner['pt_id'] ?? 0) > 0) {
                $status = (string) ($partner['pt_status'] ?? '');
                if ($status === '' || $status === 'active' || (function_exists('lc_is_super_admin') && lc_is_super_admin())) {
                    $targets[] = array('center' => 'partner', 'userId' => (int) $partner['pt_id']);
                }
            }
        }
        if (function_exists('lc_get_current_merchant')) {
            $merchant = lc_get_current_merchant();
            if (is_array($merchant) && (int) ($merchant['mt_id'] ?? 0) > 0) {
                $status = (string) ($merchant['mt_status'] ?? '');
                if ($status === '' || $status === 'active' || (function_exists('lc_is_super_admin') && lc_is_super_admin())) {
                    $targets[] = array('center' => 'merchant', 'userId' => (int) $merchant['mt_id']);
                }
            }
        }

        return $targets;
    }
}

global $member;
$mb_id = is_array($member) ? trim((string) ($member['mb_id'] ?? '')) : '';
if ($mb_id === '') {
    lc_api_error('회원 정보를 확인할 수 없습니다.', 'NO_MEMBER', 401);
}

$method = isset($_SERVER['REQUEST_METHOD']) ? strtoupper((string) $_SERVER['REQUEST_METHOD']) : 'GET';
$targets = lc_push_session_targets();

if ($method === 'GET') {
    $centers = array();
    foreach ($targets as $target) {
        $centers[] = array(
            'center' => $target['center'],
            'prefs'  => function_exists('lc_push_get_prefs') ? lc_push_get_prefs($mb_id, $target['center']) : array(),
        );
    }
    lc_api_success(array('centers' => $centers));
}

if ($method !== 'POST') {
    lc_api_error('허용되지 않은 HTTP 메서드입니다.', 'METHOD_NOT_ALLOWED', 405);
}

$body = lc_api_read_json_body();
$action = isset($body['action']) ? trim((string) $body['action']) : 'register';

if ($action === 'unregister') {
    $result = lc_push_unregister_device((string) ($body['token'] ?? ''), $mb_id);
    lc_api_success($result);
}

if ($action === 'save_prefs') {
    $center = trim((string) ($body['center'] ?? ''));
    $allowed = false;
    foreach ($targets as $target) {
        if ($target['center'] === $center) {
            $allowed = true;
            break;
        }
    }
    if (!$allowed) {
        lc_api_error('이 센터의 알림 설정을 바꿀 수 없습니다.', 'FORBIDDEN', 403);
    }
    $result = lc_push_save_prefs($mb_id, $center, $body['prefs'] ?? array());
    if (empty($result['ok'])) {
        lc_api_error((string) ($result['message'] ?? '저장에 실패했습니다.'), 'SAVE_FAILED', 400);
    }
    lc_api_success($result);
}

if ($action !== 'register') {
    lc_api_error('유효하지 않은 action입니다.', 'INVALID_ACTION', 400);
}

if (!$targets) {
    lc_api_error('푸시를 받을 센터가 없습니다.', 'NO_CENTER', 403);
}

$registered = array();
foreach ($targets as $target) {
    $result = lc_push_register_device(
        $mb_id,
        $target['center'],
        $target['userId'],
        (string) ($body['platform'] ?? ''),
        (string) ($body['token'] ?? ''),
        (string) ($body['appVersion'] ?? '')
    );
    if (empty($result['ok'])) {
        lc_api_error((string) ($result['message'] ?? '기기 등록에 실패했습니다.'), 'REGISTER_FAILED', 400);
    }
    $registered[] = $target['center'];
}

lc_api_success(array(
    'message' => '기기를 등록했습니다.',
    'centers' => $registered,
));
