<?php
/**
 * CPS 숏링크 리다이렉트 — /s/{code} → /go/lp/... (클릭 추적 유지)
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

// 오픈 리다이렉트 방지: 자사 /go/lp/ 추적 URL만 허용
$host = parse_url($target, PHP_URL_HOST);
$path = (string) parse_url($target, PHP_URL_PATH);
$base_host = defined('G5_URL') ? parse_url(G5_URL, PHP_URL_HOST) : '';
if (!$host || !$base_host || strtolower((string) $host) !== strtolower((string) $base_host)) {
    header('HTTP/1.1 400 Bad Request');
    exit('잘못된 숏링크입니다.');
}
if (strpos($path, '/go/lp/') !== 0) {
    header('HTTP/1.1 400 Bad Request');
    exit('잘못된 숏링크입니다.');
}

goto_url($target);
