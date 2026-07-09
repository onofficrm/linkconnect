#!/usr/bin/env php
<?php
/**
 * banktupt CPA 단일 상품 적용 CLI
 *
 * Usage:
 *   php scripts/apply-banktupt-campaign.php
 *   php scripts/apply-banktupt-campaign.php --advertiser=lc_advertiser
 */
$root = realpath(__DIR__ . '/..');
if ($root === false) {
    fwrite(STDERR, "Project root not found.\n");
    exit(1);
}

$_SERVER['REQUEST_METHOD'] = 'GET';
$_REQUEST['action'] = 'run';

foreach ($argv as $arg) {
    if (strpos($arg, '--advertiser=') === 0) {
        $_REQUEST['advertiser_mb_id'] = substr($arg, 13);
    }
}

chdir($root);
$_SERVER['SCRIPT_FILENAME'] = $root . '/plugin/linkconnect/install/apply_banktupt_campaign.php';
include $root . '/plugin/linkconnect/install/apply_banktupt_campaign.php';
