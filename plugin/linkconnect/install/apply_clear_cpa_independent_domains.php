<?php
/**
 * CPA 광고상품 독립도메인 전면 제거
 * (air911 / skawning / agrio / yevely 등 → linkconnect.co.kr)
 *
 * 브라우저: /plugin/linkconnect/install/apply_clear_cpa_independent_domains.php?action=run
 * CLI: php scripts/apply-clear-cpa-independent-domains.php
 */
require_once dirname(__DIR__) . '/_common.php';

$is_cli = php_sapi_name() === 'cli';
$action = isset($_REQUEST['action']) ? (string) $_REQUEST['action'] : 'form';

if (!function_exists('lc_apply_clear_cpa_domains_token_ok')) {
    function lc_apply_clear_cpa_domains_token_ok()
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

$token_ok = lc_apply_clear_cpa_domains_token_ok();

if (!$is_cli && $action === 'run' && !$token_ok && !lc_is_super_admin()) {
    alert('최고관리자만 실행할 수 있습니다.', G5_URL);
}

if ($action === 'run' || $is_cli) {
    if (!function_exists('lc_campaign_clear_independent_tracking_domains')) {
        if ($is_cli) {
            fwrite(STDERR, "lc_campaign_clear_independent_tracking_domains not found.\n");
            exit(1);
        }
        alert('link.php 를 로드할 수 없습니다.');
    }

    // ensure 함수들도 빈 tracking_base 로 맞춘 뒤 DB 정리
    if (function_exists('lc_campaign_ensure_dasibom')) {
        lc_campaign_ensure_dasibom(array());
    }
    if (function_exists('lc_campaign_ensure_hasugu_cpa')) {
        lc_campaign_ensure_hasugu_cpa(array('activate' => false));
    }
    if (function_exists('lc_campaign_ensure_modemo')) {
        lc_campaign_ensure_modemo(array('activate' => false));
    }
    if (function_exists('lc_campaign_ensure_sindok')) {
        lc_campaign_ensure_sindok(array('activate' => false));
    }

    $result = lc_campaign_clear_independent_tracking_domains(array('migrate_shortlinks' => true));

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
  <title>CPA 독립도메인 전면 제거</title>
</head>
<body style="font-family:sans-serif;max-width:640px;margin:2rem auto;padding:1rem;">
  <h1>CPA 독립도메인 전면 제거</h1>
  <p>모든 CPA 광고상품의 <code>cp_tracking_base_url</code> 을 비웁니다.</p>
  <ul>
    <li>https://air911.co.kr → /merchant/dasibom/</li>
    <li>https://skawning.co.kr → /merchant/hasugu_cpa/</li>
    <li>https://agrio.co.kr → /merchant/sindok/</li>
    <li>(잔여) yevely.kr → /merchant/modemo/</li>
  </ul>
  <p>파트너 홍보 링크는 <code>https://linkconnect.co.kr/r/…</code> 형식으로 나갑니다.
    숏링크 타겟의 독립도메인도 메인으로 교체합니다.</p>
  <p><a href="?action=run">실행</a></p>
</body>
</html>
