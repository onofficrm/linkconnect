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
    'sindok'     => 'sindok',
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
// 신독환경 등: import 루트에 둔 작업사진·로고 (images/ 하위 아님)
$is_root_image = (bool) preg_match('/^[A-Za-z0-9][A-Za-z0-9._-]*\.(jpe?g|png|gif|webp|svg|ico)$/i', $rel);
if ($rel === '' || strpos($rel, '..') !== false || !($is_image || $is_icon || $is_root_image)) {
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

/**
 * macOS(NFD) ↔ Linux/Cafe24(NFC) 파일명 정규화 차이로 404 나는 경우를 보완.
 */
function lc_merchant_static_resolve_file($base, $rel) {
    $candidates = array($rel);
    if (class_exists('Normalizer')) {
        $nfc = Normalizer::normalize($rel, Normalizer::FORM_C);
        $nfd = Normalizer::normalize($rel, Normalizer::FORM_D);
        if (is_string($nfc) && $nfc !== '') {
            $candidates[] = $nfc;
        }
        if (is_string($nfd) && $nfd !== '') {
            $candidates[] = $nfd;
        }
    }
    $candidates = array_values(array_unique($candidates));

    foreach ($candidates as $try) {
        $full = realpath($base . '/' . $try);
        if ($full !== false && strpos($full, $base) === 0 && is_file($full)) {
            return $full;
        }
    }

    // realpath 실패 시(정규화만 다른 경우) 디렉터리 스캔으로 매칭
    $dir_rel = str_replace('\\', '/', dirname($rel));
    $name = basename($rel);
    $dir_abs = ($dir_rel === '.' || $dir_rel === '') ? $base : realpath($base . '/' . $dir_rel);
    if ($dir_abs === false || strpos($dir_abs, $base) !== 0 || !is_dir($dir_abs)) {
        return false;
    }

    $name_nfc = class_exists('Normalizer') ? Normalizer::normalize($name, Normalizer::FORM_C) : $name;
    $name_nfd = class_exists('Normalizer') ? Normalizer::normalize($name, Normalizer::FORM_D) : $name;
    $dh = opendir($dir_abs);
    if ($dh === false) {
        return false;
    }
    while (($entry = readdir($dh)) !== false) {
        if ($entry === '.' || $entry === '..') {
            continue;
        }
        $entry_nfc = class_exists('Normalizer') ? Normalizer::normalize($entry, Normalizer::FORM_C) : $entry;
        $entry_nfd = class_exists('Normalizer') ? Normalizer::normalize($entry, Normalizer::FORM_D) : $entry;
        if ($entry === $name || $entry_nfc === $name_nfc || $entry_nfd === $name_nfd) {
            $full = $dir_abs . '/' . $entry;
            if (is_file($full)) {
                closedir($dh);
                return $full;
            }
        }
    }
    closedir($dh);
    return false;
}

$full = lc_merchant_static_resolve_file($base, $rel);
if ($full === false) {
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
header('Cache-Control: public, max-age=604800, stale-while-revalidate=86400');
header('X-Content-Type-Options: nosniff');
header('Access-Control-Allow-Origin: *');
readfile($full);
exit;
