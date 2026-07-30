<?php
/**
 * CLI: CPA-HASUGU 독립도메인 skawning.co.kr 적용
 * php scripts/apply-skawning-hasugu-domain.php
 */
$root = dirname(__DIR__);
$_SERVER['SCRIPT_FILENAME'] = $root . '/plugin/linkconnect/install/apply_skawning_hasugu_domain.php';
include $root . '/plugin/linkconnect/install/apply_skawning_hasugu_domain.php';
