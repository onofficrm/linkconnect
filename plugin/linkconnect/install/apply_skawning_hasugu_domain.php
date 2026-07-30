<?php
/**
 * CPA-HASUGU 독립도메인 skawning.co.kr 적용
 *
 * 브라우저: /plugin/linkconnect/install/apply_skawning_hasugu_domain.php?action=run
 * CLI: php scripts/apply-skawning-hasugu-domain.php
 */
require_once dirname(__DIR__) . '/_common.php';

$is_cli = php_sapi_name() === 'cli';
$action = isset($_REQUEST['action']) ? (string) $_REQUEST['action'] : 'form';

if (!function_exists('lc_apply_skawning_token_ok')) {
    function lc_apply_skawning_token_ok()
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

$token_ok = lc_apply_skawning_token_ok();

if (!$is_cli && $action === 'run' && !$token_ok && !lc_is_super_admin()) {
    alert('최고관리자만 실행할 수 있습니다.', G5_URL);
}

if ($action === 'run' || $is_cli) {
    if (!function_exists('lc_campaign_ensure_hasugu_cpa')) {
        if ($is_cli) {
            fwrite(STDERR, "lc_campaign_ensure_hasugu_cpa not found.\n");
            exit(1);
        }
        alert('campaign_hasugu_cpa.php를 로드할 수 없습니다.');
    }

    $result = lc_campaign_ensure_hasugu_cpa(array('activate' => true));
    if (function_exists('lc_campaign_sync_builtin_tracking_domains')) {
        lc_campaign_sync_builtin_tracking_domains();
    }

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
  <title>skawning.co.kr → 하수구 독립도메인</title>
</head>
<body style="font-family:sans-serif;max-width:640px;margin:2rem auto;padding:1rem;">
  <h1>skawning.co.kr 독립도메인 적용</h1>
  <p>CPA-HASUGU 의 <code>cp_tracking_base_url</code> 을 <strong>https://skawning.co.kr</strong> 로 설정하고 ADV-0007에 연결·활성화합니다.</p>
  <p>랜딩 본체 URL은 <code>/merchant/hasugu_cpa/</code> (linkconnect) 유지, 파트너 공개 링크만 skawning.co.kr/r/… 로 나갑니다.</p>
  <p><a href="?action=run">실행</a></p>
</body>
</html>
