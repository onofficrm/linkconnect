<?php
/**
 * CLI: CPA-MODEMO 독립도메인 제거 → linkconnect.co.kr/merchant/modemo/
 * php scripts/apply-modemo-main-domain.php
 */
$root = dirname(__DIR__);
$_SERVER['SCRIPT_FILENAME'] = $root . '/plugin/linkconnect/install/apply_modemo_main_domain.php';
include $root . '/plugin/linkconnect/install/apply_modemo_main_domain.php';
