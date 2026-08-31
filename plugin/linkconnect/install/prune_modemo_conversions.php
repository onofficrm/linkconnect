<?php
/**
 * 모두의철거(modemo) 테스트 디비 정리 — 지정 고객 1건만 남기고 삭제
 *
 * 브라우저(최고관리자): /plugin/linkconnect/install/prune_modemo_conversions.php?action=run
 * CLI: php scripts/prune-modemo-conversions.php
 */
require_once dirname(__DIR__) . '/_common.php';

$is_cli = php_sapi_name() === 'cli';
$action = isset($_REQUEST['action']) ? (string) $_REQUEST['action'] : 'form';
$keep_name = isset($_REQUEST['keep_name']) ? trim((string) $_REQUEST['keep_name']) : '이동익';
$keep_phone = isset($_REQUEST['keep_phone']) ? trim((string) $_REQUEST['keep_phone']) : '010-9562-2599';

if (!function_exists('lc_prune_modemo_token_ok')) {
    function lc_prune_modemo_token_ok()
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

$token_ok = lc_prune_modemo_token_ok();

if (!$is_cli && $action === 'run' && !$token_ok && !lc_is_super_admin()) {
    alert('최고관리자만 실행할 수 있습니다.', G5_URL);
}

if ($action === 'run' || $is_cli) {
    if (!function_exists('lc_conversion_prune_modemo_except')) {
        if ($is_cli) {
            fwrite(STDERR, "lc_conversion_prune_modemo_except not found.\n");
            exit(1);
        }
        alert('conversion_attachment.php를 로드할 수 없습니다.');
    }

    $result = lc_conversion_prune_modemo_except($keep_name, $keep_phone);
    if ($is_cli) {
        if (empty($result['ok'])) {
            fwrite(STDERR, (string) ($result['message'] ?? 'failed') . "\n");
            exit(1);
        }
        echo (string) ($result['message'] ?? 'done') . "\n";
        if (!empty($result['kept']['cv_id'])) {
            echo 'kept cv_id=' . (int) $result['kept']['cv_id'] . "\n";
        }
        exit(0);
    }

    $msg = (string) ($result['message'] ?? '');
    if (empty($result['ok'])) {
        alert($msg !== '' ? $msg : '실패했습니다.');
    }
    alert($msg, G5_URL);
}

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <title>modemo 디비 정리</title>
</head>
<body>
  <h1>모두의철거(modemo) 디비 정리</h1>
  <p>지정한 고객 1건만 남기고 CPA-MODEMO 캠페인 디비를 모두 삭제합니다.</p>
  <form method="get">
    <input type="hidden" name="action" value="run">
    <p><label>유지 고객명 <input name="keep_name" value="<?php echo htmlspecialchars($keep_name, ENT_QUOTES, 'UTF-8'); ?>"></label></p>
    <p><label>유지 연락처 <input name="keep_phone" value="<?php echo htmlspecialchars($keep_phone, ENT_QUOTES, 'UTF-8'); ?>"></label></p>
    <p><button type="submit">실행</button></p>
  </form>
</body>
</html>
