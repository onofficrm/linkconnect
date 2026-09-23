<?php
/**
 * 도트락 두피문신(SMP) CPA 광고상품 등록
 *
 * 브라우저: /plugin/linkconnect/install/apply_dotrak_campaign.php?action=run
 * CLI: php scripts/apply-dotrak-campaign.php
 */
require_once dirname(__DIR__) . '/_common.php';

$is_cli = php_sapi_name() === 'cli';
$action = isset($_REQUEST['action']) ? (string) $_REQUEST['action'] : 'form';

if (!function_exists('lc_apply_dotrak_token_ok')) {
    function lc_apply_dotrak_token_ok()
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

$token_ok = lc_apply_dotrak_token_ok();

if (!$is_cli && $action === 'run' && !$token_ok && !lc_is_super_admin()) {
    alert('최고관리자만 실행할 수 있습니다.', G5_URL);
}

if ($action === 'run' || $is_cli) {
    if (!function_exists('lc_campaign_ensure_dotrak')) {
        if ($is_cli) {
            fwrite(STDERR, "lc_campaign_ensure_dotrak not found.\n");
            exit(1);
        }
        alert('campaign_dotrak.php를 로드할 수 없습니다.');
    }

    $opts = array('activate' => false, 'force' => !empty($_REQUEST['force']));
    if (isset($_REQUEST['advertiser_mb_id']) && trim((string) $_REQUEST['advertiser_mb_id']) !== '') {
        $opts['advertiser_mb_id'] = trim((string) $_REQUEST['advertiser_mb_id']);
    }
    if (isset($_REQUEST['mt_id']) && (int) $_REQUEST['mt_id'] > 0) {
        $opts['mt_id'] = (int) $_REQUEST['mt_id'];
    }
    if (!empty($_REQUEST['activate'])) {
        $opts['activate'] = true;
    }

    $result = lc_campaign_ensure_dotrak($opts);
    if ($is_cli) {
        fwrite(STDOUT, ($result['ok'] ? 'OK: ' : 'FAIL: ') . $result['message'] . "\n");
        exit($result['ok'] ? 0 : 1);
    }

    $msg = $result['message'];
    if (!empty($result['cpId'])) {
        $msg .= ' (cpId=' . (int) $result['cpId'] . ')';
    }
    alert($msg, G5_ADMIN_URL);
}

if ($is_cli) {
    exit(0);
}
?>
<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <title>도트락 CPA 광고상품 등록</title>
</head>
<body>
  <h1>도트락 두피문신 CPA 광고상품 등록</h1>
  <p>CPA-00015를 등록/갱신하고 랜딩 URL을 <code>/merchant/dotrak/</code> 로 연결합니다. 상호에 「도트락」「위픽」이 포함된 광고주가 있으면 자동 연결합니다.</p>
  <p><a href="?action=run">실행</a></p>
</body>
</html>
