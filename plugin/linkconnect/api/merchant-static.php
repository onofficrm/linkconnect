<?php
/**
 * 머천트 랜딩 정적 이미지 프록시.
 *
 * Cafe24 핫링크 차단: 독립도메인(yevely.kr 등)에서 Referer 가 오리진과 다르면
 * /plugin/onoff-builder-bridge/imports/... 직접 요청이 403 이 된다.
 * 이 엔드포인트는 디스크에서 읽어 동일 호스트로 내려주므로 이미지가 깨지지 않는다.
 */
require_once dirname(__DIR__) . '/_common.php';

$merchant = isset($_GET['m']) ? strtolower(trim((string) $_GET['m'])) : '';
$rel = isset($_GET['p']) ? trim((string) $_GET['p']) : '';

$allowed = array(
    'modemo'     => 'modemo',
    'dasibom'    => 'dasibom',
    'hasugu_cpa' => 'hasugu_cpa',
    'hasugu'     => 'hasugu_cpa',
);

if ($merchant === '' || !isset($allowed[$merchant]) || $rel === '') {
    http_response_code(400);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Bad request';
    exit;
}

$rel = str_replace('\\', '/', $rel);
$rel = ltrim($rel, '/');
$allowed_root_icons = array(
    'favicon.ico',
    'favicon.svg',
    'favicon-32x32.png',
    'apple-touch-icon.png',
    'apple-icon.png',
    'icon.png',
);
$is_image = (strpos($rel, 'images/') === 0);
$is_icon = in_array($rel, $allowed_root_icons, true);
if ($rel === '' || strpos($rel, '..') !== false || !($is_image || $is_icon)) {
    http_response_code(400);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Invalid path';
    exit;
}

if (!preg_match('/\.(jpe?g|png|gif|webp|svg|ico)$/i', $rel)) {
    http_response_code(400);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Invalid file type';
    exit;
}

$import_dir = $allowed[$merchant];
$base = realpath(G5_PATH . '/plugin/onoff-builder-bridge/imports/' . $import_dir);
if ($base === false || !is_dir($base)) {
    http_response_code(404);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Not found';
    exit;
}

$full = realpath($base . '/' . $rel);
if ($full === false || strpos($full, $base) !== 0 || !is_file($full)) {
    http_response_code(404);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Not found';
    exit;
}

$ext = strtolower(pathinfo($full, PATHINFO_EXTENSION));
$mime_map = array(
    'jpg'  => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'png'  => 'image/png',
    'gif'  => 'image/gif',
    'webp' => 'image/webp',
    'svg'  => 'image/svg+xml',
    'ico'  => 'image/x-icon',
);
$mime = isset($mime_map[$ext]) ? $mime_map[$ext] : 'application/octet-stream';

header('Content-Type: ' . $mime);
header('Content-Length: ' . (string) filesize($full));
header('Cache-Control: public, max-age=86400');
header('X-Content-Type-Options: nosniff');
header('Access-Control-Allow-Origin: *');
readfile($full);
exit;
