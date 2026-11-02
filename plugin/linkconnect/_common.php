<?php
/**
 * LinkConnect 플러그인 — 그누보드 안전 부트스트랩
 *
 * - bbs/_common.php 경유 금지 (서브폴더 CWD 깨짐 방지)
 * - 그누보드 루트 common.php 만 직접 로드
 */
if (defined('LC_COMMON_LOADED')) {
    return;
}

define('LC_COMMON_LOADED', true);

$lc_g5_root = realpath(dirname(__FILE__) . '/../..');
if ($lc_g5_root === false || !is_file($lc_g5_root . '/common.php')) {
    header('HTTP/1.1 500 Internal Server Error');
    exit('LinkConnect: GNUBoard common.php를 찾을 수 없습니다.');
}

if (!defined('_GNUBOARD_')) {
    include_once $lc_g5_root . '/common.php';
}

if (!defined('_GNUBOARD_')) {
    header('HTTP/1.1 500 Internal Server Error');
    exit('LinkConnect: GNUBoard 초기화에 실패했습니다.');
}

if (is_file(G5_PATH . '/_site.config.php')) {
    include_once G5_PATH . '/_site.config.php';
}

require_once dirname(__FILE__) . '/config.php';

if (!defined('LC_BOOTSTRAP')) {
    define('LC_BOOTSTRAP', 'full');
}

if (!function_exists('lc_require_inc')) {
    function lc_require_inc($file)
    {
        $path = LC_PLUGIN_PATH . '/inc/' . ltrim((string) $file, '/');
        if (is_file($path)) {
            require_once $path;
        }
    }
}

$lc_public = (LC_BOOTSTRAP === 'public');

lc_require_inc('db.php');
if (function_exists('lc_db_installed') && lc_db_installed() && function_exists('lc_db_run_migrations')) {
    lc_db_run_migrations();
}
lc_require_inc('settings.php');
lc_require_inc('partner.php');
lc_require_inc('merchant.php');
lc_require_inc('conversion.php');
lc_require_inc('conversion_attachment.php');
if (function_exists('lc_conversion_attachment_ensure_schema')) {
    lc_conversion_attachment_ensure_schema();
}
lc_require_inc('campaign.php');
lc_require_inc('campaign_thumbnail.php');
lc_require_inc('campaign_promo_guide.php');
lc_require_inc('call.php');
lc_require_inc('link.php');
lc_require_inc('api.php');
lc_require_inc('landing.php');
lc_require_inc('abuse.php');

if (!$lc_public) {
    lc_require_inc('merchant_contract_config.php');
    lc_require_inc('merchant_contract_body.php');
    lc_require_inc('merchant_contract.php');
    lc_require_inc('merchant_contract_pdf.php');
    lc_require_inc('merchant_contract_access.php');
    lc_require_inc('merchant_contract_read.php');
    lc_require_inc('merchant_contract_addendum.php');
    lc_require_inc('merchant_contract_admin.php');
    lc_require_inc('merchant_contract_custom.php');
    lc_require_inc('merchant_ad_apply.php');
    lc_require_inc('wallet.php');
    lc_require_inc('admin.php');
    lc_require_inc('auth_bootstrap.php');
    lc_require_inc('image_process.php');
    lc_require_inc('settlement.php');
    lc_require_inc('net_profit.php');
    lc_require_inc('inquiry.php');
    lc_require_inc('email_notify.php');
    lc_require_inc('alimtalk.php');
    lc_require_inc('api_client.php');
    lc_require_inc('event.php');
    lc_require_inc('embed.php');
    lc_require_inc('embed_events.php');
    lc_require_inc('partner_analytics.php');
    lc_require_inc('merchant_marketing.php');
    lc_require_inc('ui.php');
    lc_require_inc('page.php');
    lc_require_inc('notice_board.php');
    lc_require_inc('community_board.php');
    lc_require_inc('push.php');
    lc_require_inc('notification.php');
    lc_require_inc('admin_log.php');
    lc_require_inc('impersonate.php');
    lc_require_inc('partner_tier.php');
    lc_require_inc('admin_ops.php');
    lc_require_inc('settlement_risk.php');
    lc_require_inc('event_roi.php');
    lc_require_inc('channel_report.php');
    lc_require_inc('call_recording_request.php');
    lc_require_inc('linkprice.php');
    lc_require_inc('platform.php');
    if (function_exists('lc_mp_enabled') && lc_mp_enabled()) {
        lc_require_inc('platform_db.php');
        lc_require_inc('platform_policy.php');
        lc_require_inc('platform_adapter.php');
        lc_require_inc('platform_sync.php');
        if (function_exists('lc_db_installed') && lc_db_installed()
            && function_exists('lc_mp_db_ensure_schema')) {
            lc_mp_db_ensure_schema();
        }
    }
}

if (function_exists('lc_link_enforce_tracking_host_gate')) {
    lc_link_enforce_tracking_host_gate();
}
