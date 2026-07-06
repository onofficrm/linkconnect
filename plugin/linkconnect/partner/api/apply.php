<?php
require_once __DIR__ . '/_common.php';

lc_api_require_method('POST');
lc_api_require_login();

global $member;

if (!lc_db_installed()) {
    lc_api_error('DB가 설치되지 않았습니다. 관리자에게 문의하세요.', 'DB_NOT_READY', 503);
}

$wants_json = (
    (isset($_SERVER['HTTP_ACCEPT']) && stripos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false)
    || (isset($_SERVER['CONTENT_TYPE']) && stripos($_SERVER['CONTENT_TYPE'], 'application/json') !== false)
);

$result = lc_partner_create($member['mb_id']);

if (!$result['ok']) {
    if ($wants_json) {
        lc_api_error($result['message'], 'APPLY_FAILED', 400);
    }
    alert($result['message'], lc_url('partner/dashboard.php'));
}

if ($wants_json) {
    lc_api_success(array(
        'partner' => is_array($result['partner']) ? lc_partner_to_api($result['partner']) : null,
        'message' => $result['message'],
    ));
}

alert('파트너 신청이 접수되었습니다. 관리자 승인 후 이용 가능합니다.', lc_url('partner/dashboard.php'));
