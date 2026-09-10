<?php
/**
 * CLI: CPA 독립도메인 전면 제거
 * php scripts/apply-clear-cpa-independent-domains.php
 */
$root = dirname(__DIR__);
$_SERVER['SCRIPT_FILENAME'] = $root . '/plugin/linkconnect/install/apply_clear_cpa_independent_domains.php';
include $root . '/plugin/linkconnect/install/apply_clear_cpa_independent_domains.php';
