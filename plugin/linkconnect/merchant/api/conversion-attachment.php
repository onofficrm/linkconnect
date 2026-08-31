<?php
require_once __DIR__ . '/_common.php';

if (function_exists('lc_merchant_api_use_strict_guard') && lc_merchant_api_use_strict_guard()) {
    $merchant = lc_api_require_active_merchant();
} else {
    lc_api_require_login();
    $merchant = lc_get_current_merchant();
}

$mt_id = is_array($merchant) ? (int) ($merchant['mt_id'] ?? 0) : 0;
$cv_id = isset($_GET['cvId']) ? (int) $_GET['cvId'] : (isset($_GET['cv_id']) ? (int) $_GET['cv_id'] : 0);
$inline = !isset($_GET['inline']) || $_GET['inline'] === '1' || $_GET['inline'] === 'true';

if ($cv_id <= 0 || $mt_id <= 0) {
    lc_api_error('디비 ID가 필요합니다.', 'INVALID_ID', 400);
}

if (!function_exists('lc_conversion_serve_attachment_for_merchant')) {
    lc_api_error('첨부 기능이 준비되지 않았습니다.', 'NOT_READY', 503);
}

$result = lc_conversion_serve_attachment_for_merchant($cv_id, $mt_id, $inline);
if (empty($result['ok'])) {
    $status = isset($result['status']) ? (int) $result['status'] : 404;
    lc_api_error((string) ($result['message'] ?? '첨부파일을 열 수 없습니다.'), 'NOT_FOUND', $status);
}

$path = (string) $result['path'];
$name = (string) ($result['name'] ?? basename($path));
$mime = (string) ($result['mime'] ?? 'application/octet-stream');
$disposition = !empty($result['inline']) ? 'inline' : 'attachment';
$safe_name = str_replace(array('"', "\r", "\n"), '', $name);

header('Content-Type: ' . $mime);
header('Content-Length: ' . (string) filesize($path));
header('Content-Disposition: ' . $disposition . '; filename="' . $safe_name . '"');
header('Cache-Control: private, no-store');
header('X-Content-Type-Options: nosniff');

readfile($path);
exit;
