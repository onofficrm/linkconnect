<?php
/**
 * LinkConnect — 회원(로그인·가입) 화면 브랜딩
 */
if (!defined('_GNUBOARD_')) {
    exit;
}

if (is_file(G5_PATH . '/_site.config.php')) {
    include_once G5_PATH . '/_site.config.php';
}

if (!function_exists('linkconnect_is_active_site')) {
    function linkconnect_is_active_site()
    {
        return function_exists('g5site_cfg') && g5site_cfg('home_builder_bridge_id', '') === 'linkconnect';
    }
}

if (!function_exists('linkconnect_is_member_bbs_page')) {
    function linkconnect_is_member_bbs_page()
    {
        $script = isset($_SERVER['SCRIPT_NAME']) ? (string) $_SERVER['SCRIPT_NAME'] : '';

        return strpos($script, '/bbs/login.php') !== false
            || strpos($script, '/bbs/register.php') !== false
            || strpos($script, '/bbs/password_lost.php') !== false
            || strpos($script, '/bbs/member_confirm.php') !== false;
    }
}

if (!function_exists('linkconnect_member_head_sub_before')) {
    function linkconnect_member_head_sub_before()
    {
        if (!linkconnect_is_active_site() || !linkconnect_is_member_bbs_page()) {
            return;
        }

        global $config;
        $config['cf_title'] = '링크커넥트';
    }
}

if (function_exists('add_event')) {
    add_event('head_sub_before', 'linkconnect_member_head_sub_before', 5, 0);
}
