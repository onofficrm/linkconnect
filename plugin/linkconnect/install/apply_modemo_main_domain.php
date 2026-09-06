<?php
/**
 * CPA-MODEMO 독립도메인(yevely.kr) 제거 → linkconnect.co.kr/merchant/modemo/
 *
 * 브라우저: /plugin/linkconnect/install/apply_modemo_main_domain.php?action=run
 * CLI: php scripts/apply-modemo-main-domain.php
 */
require_once dirname(__DIR__) . '/_common.php';

$is_cli = php_sapi_name() === 'cli';
$action = isset($_REQUEST['action']) ? (string) $_REQUEST['action'] : 'form';

if (!function_exists('lc_apply_modemo_main_domain_token_ok')) {
    function lc_apply_modemo_main_domain_token_ok()
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

$token_ok = lc_apply_modemo_main_domain_token_ok();

if (!$is_cli && $action === 'run' && !$token_ok && !lc_is_super_admin()) {
    alert('최고관리자만 실행할 수 있습니다.', G5_URL);
}

if ($action === 'run' || $is_cli) {
    if (!function_exists('lc_modemo_migrate_off_yevely')) {
        if ($is_cli) {
            fwrite(STDERR, "lc_modemo_migrate_off_yevely not found.\n");
            exit(1);
        }
        alert('campaign_modemo.php를 로드할 수 없습니다.');
    }

    $result = lc_modemo_migrate_off_yevely();

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
  <title>모두의철거 → 메인 도메인</title>
</head>
<body style="font-family:sans-serif;max-width:640px;margin:2rem auto;padding:1rem;">
  <h1>모두의철거 독립도메인 제거</h1>
  <p>CPA-MODEMO 의 <code>cp_tracking_base_url</code> 을 비우고 랜딩을
    <strong>https://linkconnect.co.kr/merchant/modemo/</strong> 로 맞춥니다.</p>
  <p>파트너 홍보 링크는 <code>https://linkconnect.co.kr/r/…</code> 형식이며,
    숏링크 타겟의 yevely.kr 도메인도 메인으로 교체합니다.</p>
  <p><a href="?action=run">실행</a></p>
</body>
</html>
