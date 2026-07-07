<?php
/**
 * 콜업체 통화 웹훅 수신 → 통화로그 적재 + 조건 충족 시 콜DB 전환 생성
 *
 * 인증:
 *  1) 콜업체 웹훅 토큰(callWebhookToken)  — X-CALL-TOKEN 헤더 또는 body.token
 *  2) 미설정 시 API 클라이언트 키(X-API-KEY) 검증으로 대체
 */
require_once dirname(__DIR__) . '/_common.php';

lc_api_require_method('POST');

$endpoint = '/api/call_receive.php';
$raw_body = file_get_contents('php://input');
$body = lc_api_read_json_body();
if (!$body && $_POST) {
    $body = $_POST;
}

$cfg = lc_call_provider_config();
$webhook_token = $cfg['webhookToken'];

$provided_token = '';
if (isset($_SERVER['HTTP_X_CALL_TOKEN'])) {
    $provided_token = trim((string) $_SERVER['HTTP_X_CALL_TOKEN']);
} elseif (isset($body['token'])) {
    $provided_token = trim((string) $body['token']);
}

$client_ip = isset($_SERVER['REMOTE_ADDR']) ? (string) $_SERVER['REMOTE_ADDR'] : '';
$authorized = false;
$client_name = '콜업체';
$ac_id = 0;

if ($webhook_token !== '') {
    $authorized = hash_equals($webhook_token, $provided_token);
} else {
    $api_key = '';
    if (isset($_SERVER['HTTP_X_API_KEY'])) {
        $api_key = trim((string) $_SERVER['HTTP_X_API_KEY']);
    } elseif (isset($body['api_key'])) {
        $api_key = trim((string) $body['api_key']);
    }
    if (function_exists('lc_api_client_validate_request')) {
        $auth = lc_api_client_validate_request($api_key, $client_ip);
        $authorized = !empty($auth['ok']);
        if (is_array($auth['client'])) {
            $client_name = (string) $auth['client']['ac_name'];
            $ac_id = (int) $auth['client']['ac_id'];
        }
    }
}

$log_base = array(
    'acId'        => $ac_id,
    'clientName'  => $client_name,
    'direction'   => '수신',
    'endpoint'    => $endpoint,
    'requestBody' => $raw_body ?: json_encode($body, JSON_UNESCAPED_UNICODE),
);

if (!$authorized) {
    $response = array('success' => false, 'error' => '인증 실패', 'code' => 401);
    if (function_exists('lc_api_log_write')) {
        lc_api_log_write(array_merge($log_base, array(
            'statusCode'   => 401,
            'status'       => 'auth',
            'error'        => '인증 실패',
            'responseBody' => json_encode($response, JSON_UNESCAPED_UNICODE),
        )));
    }
    lc_api_json($response, 401);
}

$result = lc_call_ingest_log(array(
    'providerCallId' => $body['providerCallId'] ?? ($body['callId'] ?? ''),
    'virtualNumber'  => $body['virtualNumber'] ?? ($body['calledNumber'] ?? ($body['did'] ?? '')),
    'caller'         => $body['caller'] ?? ($body['from'] ?? ($body['callerNumber'] ?? '')),
    'callee'         => $body['callee'] ?? ($body['to'] ?? ''),
    'startedAt'      => $body['startedAt'] ?? ($body['startTime'] ?? ($body['calledAt'] ?? '')),
    'duration'       => $body['duration'] ?? ($body['durationSec'] ?? 0),
    'result'         => $body['result'] ?? ($body['status'] ?? ''),
    'recordingUrl'   => $body['recordingUrl'] ?? ($body['recordUrl'] ?? ''),
    'recordingId'    => $body['recordingId'] ?? ($body['recordId'] ?? ''),
));

$status_code = $result['ok'] ? 200 : 400;
$response = array(
    'success' => (bool) $result['ok'],
    'message' => (string) $result['message'],
);
if (!empty($result['cvCode'])) {
    $response['db_code'] = (string) $result['cvCode'];
}
if (!empty($result['clogId'])) {
    $response['call_log_id'] = (int) $result['clogId'];
}

if (function_exists('lc_api_log_write')) {
    lc_api_log_write(array_merge($log_base, array(
        'intCode'      => (string) ($result['cvCode'] ?? ''),
        'statusCode'   => $status_code,
        'status'       => $result['ok'] ? 'success' : 'failed',
        'error'        => $result['ok'] ? '' : (string) $result['message'],
        'responseBody' => json_encode($response, JSON_UNESCAPED_UNICODE),
    )));
}

lc_api_json($response, $status_code);
