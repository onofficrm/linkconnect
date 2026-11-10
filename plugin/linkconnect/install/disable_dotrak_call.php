<?php
/**
 * 도트락 두피문신 콜디비 설정 해제
 *
 * 브라우저: /plugin/linkconnect/install/disable_dotrak_call.php?action=run&token=...
 * 또는:     /plugin/linkconnect/install/disable_dotrak_call.php?action=run&key=lc-air911-probe-2026
 */
require_once dirname(__DIR__) . '/_common.php';
if (function_exists('lc_require_inc')) {
    lc_require_inc('campaign_dotrak.php');
}

$is_cli = php_sapi_name() === 'cli';
$action = isset($_REQUEST['action']) ? (string) $_REQUEST['action'] : 'form';

if (!function_exists('lc_disable_dotrak_call_auth_ok')) {
    function lc_disable_dotrak_call_auth_ok()
    {
        $probe = isset($_REQUEST['key']) ? (string) $_REQUEST['key'] : '';
        if ($probe === 'lc-air911-probe-2026') {
            return true;
        }
        if (!function_exists('g5site_cfg')) {
            return false;
        }
        $expected = g5site_cfg('linkconnect_seed_token', '');
        if ($expected === '') {
            $expected = g5site_cfg('linkconnect_install_token', '');
        }
        if ($expected === '') {
            return false;
        }
        $given = isset($_REQUEST['token']) ? (string) $_REQUEST['token'] : '';

        return $given !== '' && hash_equals($expected, $given);
    }
}

$token_ok = lc_disable_dotrak_call_auth_ok();
$admin_ok = function_exists('lc_is_super_admin') && lc_is_super_admin();

if (!$is_cli && $action === 'run' && !$token_ok && !$admin_ok) {
    if (function_exists('lc_api_error')) {
        lc_api_error('권한이 없습니다.', 'FORBIDDEN', 403);
    }
    alert('최고관리자만 실행할 수 있습니다.', G5_URL);
}

if ($action === 'run' || $is_cli) {
    if (!function_exists('lc_dotrak_disable_call_db')) {
        if ($is_cli) {
            fwrite(STDERR, "lc_dotrak_disable_call_db not found.\n");
            exit(1);
        }
        if (function_exists('lc_api_error')) {
            lc_api_error('campaign_dotrak.php를 로드할 수 없습니다.', 'MISSING', 500);
        }
        alert('campaign_dotrak.php를 로드할 수 없습니다.');
    }

    $result = lc_dotrak_disable_call_db();
    if ($is_cli) {
        fwrite(STDOUT, json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "\n");
        exit(!empty($result['ok']) ? 0 : 1);
    }

    if (function_exists('lc_api_json')) {
        if (!empty($result['ok'])) {
            lc_api_success($result);
        }
        lc_api_error((string) ($result['message'] ?? '실패'), 'DISABLE_FAILED', 500);
    }

    alert((string) ($result['message'] ?? '완료'), G5_ADMIN_URL);
}

header('Content-Type: text/html; charset=utf-8');
?>
<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <title>도트락 콜디비 설정 해제</title>
</head>
<body>
  <h1>도트락 두피문신 콜디비 설정 해제</h1>
  <p>CPA-00015(도트락)의 콜디비 활성화를 끄고, 착신번호·가상번호 배정을 정리합니다.</p>
  <p><a href="?action=run">실행 (최고관리자)</a></p>
</body>
</html>
