<?php
require_once dirname(__DIR__) . '/_common.php';

lc_api_require_method('GET');

$category = isset($_GET['category']) ? trim((string) $_GET['category']) : '';
$q = isset($_GET['q']) ? trim((string) $_GET['q']) : '';
$type = isset($_GET['type']) ? trim((string) $_GET['type']) : '';

$items = lc_campaign_list_for_api(array(
    'category' => $category,
    'q'        => $q,
    'type'     => $type,
));

$categories = $type === 'cps'
    ? (function_exists('lc_campaign_cps_linkprice_categories') ? lc_campaign_cps_linkprice_categories() : array('전체', '쇼핑몰', '뷰티', '건강', '생활', '기타'))
    : array('전체', '금융', '법률', '병원', '교육', '생활서비스', '렌탈', '기타');

lc_api_success(array(
    'items'      => $items,
    'categories' => $categories,
    'dbReady'    => lc_db_installed(),
));
