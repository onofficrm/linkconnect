<?php
/**
 * 신독환경 유품정리서비스 CPA 광고상품 등록
 *
 * 브라우저: /plugin/linkconnect/install/apply_sindok_campaign.php?action=run
 */
require_once dirname(__DIR__) . '/_common.php';

$is_cli = php_sapi_name() === 'cli';
$action = isset($_REQUEST['action']) ? (string) $_REQUEST['action'] : 'form';

if (!function_exists('lc_apply_sindok_token_ok')) {
    function lc_apply_sindok_token_ok()
    {
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

$token_ok = lc_apply_sindok_token_ok();

if (!$is_cli && $action === 'run' && !$token_ok && !lc_is_super_admin()) {
    alert('최고관리자만 실행할 수 있습니다.', G5_URL);
}

if ($action === 'run' || $is_cli) {
    if (!function_exists('lc_campaign_ensure_sindok')) {
        if ($is_cli) {
            fwrite(STDERR, "lc_campaign_ensure_sindok not found.\n");
            exit(1);
        }
        alert('campaign_sindok.php를 로드할 수 없습니다.');
    }

    $opts = array('activate' => true);
    if (isset($_REQUEST['advertiser_mb_id']) && trim((string) $_REQUEST['advertiser_mb_id']) !== '') {
        $opts['advertiser_mb_id'] = trim((string) $_REQUEST['advertiser_mb_id']);
    }
    if (isset($_REQUEST['mt_id']) && (int) $_REQUEST['mt_id'] > 0) {
        $opts['mt_id'] = (int) $_REQUEST['mt_id'];
    }
    if (isset($_REQUEST['activate']) && (string) $_REQUEST['activate'] === '0') {
        unset($opts['activate']);
    }

    $result = lc_campaign_ensure_sindok($opts);

    if ($is_cli) {
        if (!$result['ok']) {
            fwrite(STDERR, $result['message'] . PHP_EOL);
            exit(1);
        }
        echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . PHP_EOL;
        exit(0);
    }

    if (!$result['ok']) {
        alert($result['message']);
    }

    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(array('ok' => true, 'data' => $result), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>신독환경 CPA 광고상품 등록</title>
</head>
<body style="font-family:sans-serif;max-width:640px;margin:2rem auto;padding:1rem;">
  <h1>신독환경 CPA 광고상품 등록</h1>
  <p>유품정리서비스 상담 DB(CPA-00014)를 등록/갱신하고 랜딩 URL을 <code>/merchant/sindok/</code> 로 연결합니다. 상호에 「신독」이 포함된 광고주가 있으면 자동 연결합니다.</p>
  <p><a href="?action=run">실행</a></p>
</body>
</html>
