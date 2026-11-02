<?php
if (!defined('LC_BOOTSTRAP')) {
    define('LC_BOOTSTRAP', 'public');
}
require_once dirname(__DIR__) . '/_common.php';

lc_api_require_method('GET');

$category = isset($_GET['category']) ? trim((string) $_GET['category']) : '';
$q = isset($_GET['q']) ? trim((string) $_GET['q']) : '';
$type = isset($_GET['type']) ? trim((string) $_GET['type']) : '';
$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
$code = isset($_GET['code']) ? trim((string) $_GET['code']) : '';

$filters = array(
    'category' => $category,
    'q'        => $q,
    'type'     => $type,
    'id'       => $id,
    'code'     => $code,
);

$cache_key = 'pub_campaigns_' . md5(json_encode($filters));
$cached = function_exists('lc_runtime_cache_get') ? lc_runtime_cache_get($cache_key, 30) : null;
if (is_array($cached) && isset($cached['items'])) {
    lc_api_success($cached, array(), 30);
}

$items = lc_campaign_list_for_api($filters);

$categories = $type === 'cps'
    ? (function_exists('lc_campaign_cps_linkprice_categories') ? lc_campaign_cps_linkprice_categories() : array('전체', '여행/티켓', '종합쇼핑몰', '건강', '패션', '뷰티', '생활/인테리어', '기타'))
    : array('전체', '금융', '법률', '병원', '교육', '생활서비스', '렌탈', '기타');

$payload = array(
    'items'      => $items,
    'categories' => $categories,
    'dbReady'    => lc_db_installed(),
);

if (function_exists('lc_runtime_cache_set')) {
    lc_runtime_cache_set($cache_key, $payload);
}

lc_api_success($payload, array(), 30);
