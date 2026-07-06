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
        return '^(select-center|cpa-list|events|partner|advertiser|admin)(/.*)?$';
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
    add_replace('add_mod_rewrite_rules', 'linkconnect_add_spa_rewrite_rules', 5, 4);
}
