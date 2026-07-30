<?php
/**
 * CLI: CPA-MODEMO 독립도메인 yevely.jp 적용
 * php scripts/apply-yevely-modemo-domain.php
 */
$root = dirname(__DIR__);
$_SERVER['SCRIPT_FILENAME'] = $root . '/plugin/linkconnect/install/apply_yevely_modemo_domain.php';
include $root . '/plugin/linkconnect/install/apply_yevely_modemo_domain.php';
