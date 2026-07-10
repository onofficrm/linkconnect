<?php
/**
 * 프로덕션 CPS 헬스 점검
 *
 * php scripts/verify-lp-prod-health.php
 * php scripts/verify-lp-prod-health.php --base=https://linkconnect.co.kr --token=CRON_TOKEN
 */
$opts = getopt('', array('base:', 'token:'));
$base = rtrim((string) ($opts['base'] ?? 'https://linkconnect.co.kr'), '/');
$token = isset($opts['token']) ? (string) $opts['token'] : '';

$pass = 0;
$fail = 0;

function check($label, $ok, $detail = '')
{
    global $pass, $fail;
    if ($ok) {
        echo "PASS  {$label}" . ($detail !== '' ? " — {$detail}" : '') . "\n";
        $pass++;
    } else {
        echo "FAIL  {$label}" . ($detail !== '' ? " — {$detail}" : '') . "\n";
        $fail++;
    }
}

function http_get($url)
{
    $ch = curl_init($url);
    curl_setopt_array($ch, array(
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_SSL_VERIFYPEER => true,
    ));
    $body = curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    return array($code, $body === false ? '' : (string) $body);
}

function http_post_json($url, $payload)
{
    $ch = curl_init($url);
    curl_setopt_array($ch, array(
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => array('Content-Type: application/json'),
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_SSL_VERIFYPEER => true,
    ));
    $body = curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    return array($code, $body === false ? '' : (string) $body);
}

echo "=== LinkPrice CPS production health ===\n";
echo "Base: {$base}\n\n";

list($code, $body) = http_get("{$base}/admin/cps/settings");
check('SPA /admin/cps/settings', $code === 200, "HTTP {$code}");

list($code, $body) = http_post_json("{$base}/api/external/linkprice/postback", '{}');
check('POSTBACK alias empty body', strpos($body, '"empty"') !== false, "HTTP {$code} " . substr($body, 0, 60));

list($code, $body) = http_post_json("{$base}/plugin/linkconnect/api/lp_postback.php", 'not-json');
check('POSTBACK direct invalid json', $code === 400 && strpos($body, 'invalid json') !== false, "HTTP {$code}");

list($code, $body) = http_get("{$base}/plugin/linkconnect/admin/api/linkprice.php?view=config");
check('Admin API requires auth', $code === 401, "HTTP {$code}");

list($code, $body) = http_get("{$base}/cron/linkprice_sync_conversions.php");
check('Cron requires token', $code === 403, "HTTP {$code}");

$healthUrl = "{$base}/plugin/linkconnect/api/lp_health.php";
if ($token !== '') {
    $healthUrl .= '?token=' . rawurlencode($token);
}
list($code, $body) = http_get($healthUrl);
$health = json_decode($body, true);
if (!is_array($health)) {
    check('Health API JSON', false, "HTTP {$code}");
} else {
    check('Health API reachable', $code === 200 || $code === 503, "HTTP {$code}");
    if (isset($health['checks']['dbReady'])) {
        check('DB tables ready', !empty($health['checks']['dbReady']));
    }
    if (isset($health['checks']['affiliateConfigured'])) {
        $aff = !empty($health['checks']['affiliateConfigured']);
        check('A코드 설정', $aff, $aff ? 'configured' : '미설정 — /admin/cps/settings 에서 입력 필요');
    }
    if (isset($health['checks']['authKeySet'])) {
        $key = !empty($health['checks']['authKeySet']);
        check('API 인증키', $key, $key ? 'set' : '미설정');
    }
    if (isset($health['checks']['postbackSecretSet'])) {
        $sec = !empty($health['checks']['postbackSecretSet']);
        check('POSTBACK Secret', $sec, $sec ? 'set' : '미설정 (API 활성 전 필수)');
    }
    if (isset($health['checks']['cronTokenSet'])) {
        $cron = !empty($health['checks']['cronTokenSet']);
        check('크론 토큰', $cron, $cron ? 'set' : '미설정 — settings lpCronToken 권장');
    }
    if (isset($health['checks']['readyForSync'])) {
        $ready = !empty($health['checks']['readyForSync']);
        check('동기화 준비 완료', $ready, $ready ? 'ready' : 'API 비활성 또는 인증 미완료');
    }
    if (!empty($health['counts']) && is_array($health['counts'])) {
        echo "\n--- Row counts ---\n";
        foreach ($health['counts'] as $k => $v) {
            echo "  {$k}: {$v}\n";
        }
    }
}

echo "\n--- Result: {$pass} passed, {$fail} failed ---\n";
exit($fail > 0 ? 1 : 0);
