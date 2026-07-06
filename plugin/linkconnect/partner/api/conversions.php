<?php
require_once __DIR__ . '/_common.php';

lc_api_require_method('GET');
$partner = lc_api_require_active_partner();
$pt_id = (int) $partner['pt_id'];

$status = isset($_GET['status']) ? trim((string) $_GET['status']) : '';
$q = isset($_GET['q']) ? trim((string) $_GET['q']) : '';
$rejected = isset($_GET['rejected']) && $_GET['rejected'] === '1';

$filters = array();
if ($status !== '') {
    $filters['status'] = $status;
}
if ($q !== '') {
    $filters['q'] = $q;
}
if ($rejected) {
    $filters['rejected_only'] = true;
}

$items = lc_conversion_list_for_partner_api($pt_id, $filters);
$summary = lc_conversion_partner_summary($pt_id);

lc_api_success(array(
    'items'   => $items,
    'summary' => $summary,
    'total'   => count($items),
));
