<?php
/**
 * 0503 통화내역 2026-09-01~02 일회 반영 (linkconnect)
 * ?action=run&token=...
 */
require_once dirname(__DIR__) . '/_common.php';

header('Content-Type: application/json; charset=utf-8');

$expected_token = 'callimport-sept-9c2e4a17b8d0f635';
$given = isset($_REQUEST['token']) ? (string) $_REQUEST['token'] : '';
$token_ok = ($given !== '' && hash_equals($expected_token, $given));
$admin_ok = function_exists('lc_is_super_admin') && lc_is_super_admin();
if (!$token_ok && !$admin_ok) {
    http_response_code(403);
    echo json_encode(array('ok' => false, 'error' => 'FORBIDDEN'), JSON_UNESCAPED_UNICODE);
    exit;
}

$action = isset($_REQUEST['action']) ? (string) $_REQUEST['action'] : '';
$dry_run = !empty($_REQUEST['dryRun']) || (isset($_REQUEST['dryRun']) && (string) $_REQUEST['dryRun'] === '1');
$skip_conversion = !isset($_REQUEST['skipConversion']) || (string) $_REQUEST['skipConversion'] !== '0';

if ($action !== 'run') {
    echo json_encode(array('ok' => true, 'message' => 'action=run&token=...'), JSON_UNESCAPED_UNICODE);
    exit;
}

$done_flag = dirname(__DIR__) . '/install/data/call_import_0503_202609.done';
if (is_file($done_flag) && empty($_REQUEST['force'])) {
    echo json_encode(array(
        'ok' => false,
        'error' => 'ALREADY_DONE',
        'doneAt' => trim((string) @file_get_contents($done_flag)),
    ), JSON_UNESCAPED_UNICODE);
    exit;
}

$csv_path = dirname(__DIR__) . '/install/data/call_import_0503_202609.csv';
if (!is_readable($csv_path)) {
    http_response_code(500);
    echo json_encode(array('ok' => false, 'error' => 'CSV missing'), JSON_UNESCAPED_UNICODE);
    exit;
}

$parsed = lc_call_logs_import_parse_file($csv_path, basename($csv_path));
if (empty($parsed['ok'])) {
    http_response_code(400);
    echo json_encode(array('ok' => false, 'error' => (string) ($parsed['message'] ?? 'parse')), JSON_UNESCAPED_UNICODE);
    exit;
}

if ($dry_run) {
    echo json_encode(array(
        'ok' => true,
        'dryRun' => true,
        'message' => $parsed['message'],
        'total' => count($parsed['rows'] ?? array()),
        'preview' => array_slice($parsed['rows'] ?? array(), 0, 5),
    ), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

$result = lc_call_logs_import_bulk($parsed['rows'] ?? array(), $skip_conversion);
if (!empty($result['ok'])) {
    @mkdir(dirname($done_flag), 0755, true);
    @file_put_contents($done_flag, date('c') . ' ' . json_encode(array(
        'total' => (int) ($result['total'] ?? 0),
        'imported' => (int) ($result['imported'] ?? 0),
        'duplicate' => (int) ($result['duplicate'] ?? 0),
        'failed' => (int) ($result['failed'] ?? 0),
    ), JSON_UNESCAPED_UNICODE) . PHP_EOL);
}
echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
