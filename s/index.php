<?php
/**
 * 숏링크 리다이렉트 — /s/{code}
 *  - CPS: → /go/lp/...
 *  - CPA: → /r/...
 */
require_once dirname(__DIR__) . '/plugin/linkconnect/_common.php';

$code = isset($_GET['code']) ? trim((string) $_GET['code']) : '';
if ($code === '' && isset($_SERVER['PATH_INFO'])) {
    $code = trim((string) $_SERVER['PATH_INFO'], '/');
}
if ($code === '' && isset($_SERVER['REQUEST_URI'])) {
    if (preg_match('#/s/([a-zA-Z0-9_-]+)#', (string) $_SERVER['REQUEST_URI'], $m)) {
        $code = $m[1];
    }
}

if ($code === '' || !function_exists('lc_lp_shortlink_get_by_code')) {
    header('HTTP/1.1 404 Not Found');
    exit('유효하지 않은 링크입니다.');
}

$row = lc_lp_shortlink_get_by_code($code);
$target = is_array($row) ? trim((string) ($row['target_url'] ?? '')) : '';
if ($target === '' || !preg_match('#^https?://#i', $target)) {
    header('HTTP/1.1 404 Not Found');
    exit('만료되었거나 유효하지 않은 숏링크입니다.');
}

$host = strtolower((string) parse_url($target, PHP_URL_HOST));
$path = (string) parse_url($target, PHP_URL_PATH);

$allowed_hosts = array();
if (defined('G5_URL')) {
    $h = parse_url(G5_URL, PHP_URL_HOST);
    if ($h) {
        $allowed_hosts[] = strtolower((string) $h);
    }
}
if (function_exists('lc_link_tracking_base_url')) {
    $h = parse_url(lc_link_tracking_base_url(), PHP_URL_HOST);
    if ($h) {
        $allowed_hosts[] = strtolower((string) $h);
    }
}
$allowed_hosts = array_values(array_unique(array_filter($allowed_hosts)));

if ($host === '' || !in_array($host, $allowed_hosts, true)) {
    header('HTTP/1.1 400 Bad Request');
    exit('잘못된 숏링크입니다.');
}

$allowed_path = (strpos($path, '/go/lp/') === 0) || (bool) preg_match('#^/r/[A-Za-z0-9_-]+$#', $path);
if (!$allowed_path) {
    header('HTTP/1.1 400 Bad Request');
    exit('잘못된 숏링크입니다.');
}

goto_url($target);
