<?php
require_once dirname(__DIR__) . '/_common.php';

lc_api_require_method('GET');

$filters = array(
    'q' => isset($_GET['q']) ? (string) $_GET['q'] : '',
);

lc_api_success(lc_events_public_payload($filters));
