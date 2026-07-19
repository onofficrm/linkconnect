<?php
/**
 * LinkConnect React SPA — BrowserRouter 경로를 index.php로 전달
 *
 * /partner, /advertiser, /admin 등이 그누보드 게시판 short URL 규칙에 잡히지 않도록
 * add_mod_rewrite_rules 훅으로 board.php 규칙보다 앞에 삽입합니다.
 */
if (!defined('_GNUBOARD_')) {
    exit;
}

if (is_file(G5_PATH . '/_site.config.php')) {
    include_once G5_PATH . '/_site.config.php';
}

if (!function_exists('linkconnect_spa_rewrite_enabled')) {
    function linkconnect_spa_rewrite_enabled()
    {
        if (!function_exists('g5site_cfg')) {
            return false;
        }

        return g5site_cfg('home_builder_bridge_id', '') === 'linkconnect';
    }
}

if (!function_exists('linkconnect_spa_route_pattern')) {
    function linkconnect_spa_route_pattern()
    {
        return '^(about|affiliate|select-center|cpa-list|cpa|cps|events|notice|community|inquiry|terms|privacy|partner|advertiser|admin)(/.*)?$';
    }
}

if (!function_exists('linkconnect_add_tracking_rewrite_rules')) {
    function linkconnect_add_tracking_rewrite_rules($rules, $get_path_url, $base_path, $return_string)
    {
        if (!linkconnect_spa_rewrite_enabled()) {
            return $rules;
        }

        $extra = "# LinkConnect tracking / landing\n";
        $extra .= 'RewriteRule ^r/([a-zA-Z0-9_-]+)$ r/index.php?code=$1 [L,QSA]' . "\n";
        $extra .= 'RewriteRule ^c/([a-zA-Z0-9_-]+)$ c/index.php?code=$1 [L,QSA]' . "\n";
        $extra .= 'RewriteRule ^s/([a-zA-Z0-9_-]+)$ s/index.php?code=$1 [L,QSA]' . "\n";
        $extra .= 'RewriteRule ^go/lp/([A-Za-z0-9_-]+)$ go/lp/index.php?m=$1 [L,QSA]' . "\n";
        $extra .= 'RewriteRule ^api/external/linkprice/postback/?$ api/external/linkprice/postback.php [L,QSA]' . "\n";

        return $rules . $extra;
    }
}

if (!function_exists('linkconnect_add_spa_rewrite_rules')) {
    function linkconnect_add_spa_rewrite_rules($rules, $get_path_url, $base_path, $return_string)
    {
        if (!linkconnect_spa_rewrite_enabled()) {
            return $rules;
        }

        $pattern = linkconnect_spa_route_pattern();
        $extra = "# LinkConnect React SPA (BrowserRouter)\n";
        $extra .= 'RewriteRule ' . $pattern . ' index.php [L,QSA]' . "\n";

        return $rules . $extra;
    }
}

if (function_exists('add_replace')) {
    add_replace('add_mod_rewrite_rules', 'linkconnect_add_tracking_rewrite_rules', 4, 4);
    add_replace('add_mod_rewrite_rules', 'linkconnect_add_spa_rewrite_rules', 5, 4);
}

if (!function_exists('linkconnect_legal_content_redirect')) {
    function linkconnect_legal_content_redirect()
    {
        if (!function_exists('linkconnect_spa_rewrite_enabled') || !linkconnect_spa_rewrite_enabled()) {
            return;
        }

        $script = isset($_SERVER['SCRIPT_NAME']) ? (string) $_SERVER['SCRIPT_NAME'] : '';
        if (strpos($script, 'content.php') === false) {
            return;
        }

        $co_id = isset($_GET['co_id']) ? preg_replace('/[^a-z0-9_]/i', '', (string) $_GET['co_id']) : '';
        if ($co_id === 'provision') {
            header('Location: ' . G5_URL . '/terms', true, 301);
            exit;
        }
        if ($co_id === 'privacy') {
            header('Location: ' . G5_URL . '/privacy', true, 301);
            exit;
        }
    }
}

linkconnect_legal_content_redirect();

if (!function_exists('linkconnect_tracking_domain_spa_gate')) {
    /**
     * 독립 도메인(비-G5 호스트)에서 파트너/관리 SPA·홈이 열리면 메인 사이트로 보냅니다.
     * /r /c /s /merchant /plugin 은 그대로 둡니다.
     */
    function linkconnect_tracking_domain_spa_gate()
    {
        if (!linkconnect_spa_rewrite_enabled() || !defined('G5_URL') || G5_URL === '') {
            return;
        }

        $host = isset($_SERVER['HTTP_HOST']) ? strtolower((string) $_SERVER['HTTP_HOST']) : '';
        $host = preg_replace('/:\d+$/', '', $host);
        if ($host === '') {
            return;
        }

        $main_hosts = array('linkconnect.co.kr', 'www.linkconnect.co.kr');
        $g5_host = parse_url((string) G5_URL, PHP_URL_HOST);
        if (is_string($g5_host) && $g5_host !== '') {
            $main_hosts[] = strtolower($g5_host);
        }
        if (in_array($host, array_values(array_unique($main_hosts)), true)) {
            return;
        }

        $uri = isset($_SERVER['REQUEST_URI']) ? (string) $_SERVER['REQUEST_URI'] : '/';
        $path = parse_url($uri, PHP_URL_PATH);
        if (!is_string($path) || $path === '') {
            $path = '/';
        }

        $allow = array('/r/', '/c/', '/s/', '/merchant/', '/plugin/', '/go/', '/data/', '/api/');
        foreach ($allow as $prefix) {
            if (strpos($path, $prefix) === 0) {
                return;
            }
        }
        if (preg_match('#^/(r|c|s)/[A-Za-z0-9_-]+/?$#', $path)) {
            return;
        }
        if (in_array($path, array('/favicon.ico', '/robots.txt'), true)) {
            return;
        }

        $dest = rtrim((string) G5_URL, '/');
        if ($path !== '/' && $path !== '/index.php') {
            $dest .= $path;
            $query = parse_url($uri, PHP_URL_QUERY);
            if (is_string($query) && $query !== '') {
                $dest .= '?' . $query;
            }
        }

        if (!headers_sent()) {
            header('Location: ' . $dest, true, 302);
        }
        exit;
    }
}

linkconnect_tracking_domain_spa_gate();
