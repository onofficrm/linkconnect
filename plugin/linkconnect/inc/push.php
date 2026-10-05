<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

/**
 * 앱 푸시 (FCM HTTP v1).
 * 알림 저장 뒤 lc_push_send_for_notification() 이 기기로 보낸다.
 */

if (!function_exists('lc_push_enabled')) {
    function lc_push_enabled()
    {
        if (!function_exists('lc_settings_get_bool') || !lc_settings_get_bool('pushEnabled')) {
            return false;
        }
        $project = trim((string) lc_settings_get('pushFcmProjectId', ''));
        $account = trim((string) lc_settings_get('pushFcmServiceAccount', ''));

        return $project !== '' && $account !== '';
    }
}

if (!function_exists('lc_push_default_prefs')) {
    function lc_push_default_prefs()
    {
        return array(
            'conversion' => true,
            'wallet'     => true,
            'event'      => true,
            'system'     => true,
            'campaign'   => true,
            'call'       => true,
            'contract'   => true,
            'notice'     => true,
            'quietStart' => '',
            'quietEnd'   => '',
        );
    }
}

if (!function_exists('lc_push_normalize_prefs')) {
    function lc_push_normalize_prefs($raw)
    {
        $defaults = lc_push_default_prefs();
        $decoded = array();
        if (is_string($raw) && $raw !== '') {
            $json = json_decode($raw, true);
            if (is_array($json)) {
                $decoded = $json;
            }
        } elseif (is_array($raw)) {
            $decoded = $raw;
        }

        $out = $defaults;
        foreach ($defaults as $key => $default) {
            if (!array_key_exists($key, $decoded)) {
                continue;
            }
            if ($key === 'quietStart' || $key === 'quietEnd') {
                $value = trim((string) $decoded[$key]);
                $out[$key] = preg_match('/^\d{2}:\d{2}$/', $value) ? $value : '';
                continue;
            }
            $val = $decoded[$key];
            $out[$key] = !($val === false || $val === 0 || $val === '0' || $val === 'false' || $val === 'off');
        }

        return $out;
    }
}

if (!function_exists('lc_push_get_prefs')) {
    function lc_push_get_prefs($mb_id, $center)
    {
        if (function_exists('lc_db_ensure_push_tables')) {
            lc_db_ensure_push_tables();
        }
        $mb_id = trim((string) $mb_id);
        $center = trim((string) $center);
        if ($mb_id === '' || !function_exists('lc_db_table_exists') || !lc_db_table_exists(lc_table('push_prefs'))) {
            return lc_push_default_prefs();
        }
        $table = lc_table('push_prefs');
        $row = lc_sql_fetch(" SELECT pp_prefs FROM `{$table}` WHERE mb_id = '" . lc_sql_escape($mb_id) . "' AND pp_center = '" . lc_sql_escape($center) . "' LIMIT 1 ");

        return lc_push_normalize_prefs(is_array($row) ? ($row['pp_prefs'] ?? '') : '');
    }
}

if (!function_exists('lc_push_save_prefs')) {
    /**
     * @return array{ok:bool,message:string,prefs:array}
     */
    function lc_push_save_prefs($mb_id, $center, $raw)
    {
        if (function_exists('lc_db_ensure_push_tables')) {
            $ready = lc_db_ensure_push_tables();
            if (empty($ready['ok'])) {
                return array('ok' => false, 'message' => $ready['message'], 'prefs' => array());
            }
        }
        $mb_id = trim((string) $mb_id);
        $center = trim((string) $center);
        if ($mb_id === '' || $center === '') {
            return array('ok' => false, 'message' => '대상을 확인할 수 없습니다.', 'prefs' => array());
        }
        $prefs = lc_push_normalize_prefs($raw);
        $json = lc_sql_escape(json_encode($prefs, JSON_UNESCAPED_UNICODE));
        $table = lc_table('push_prefs');
        $ok = lc_sql_query(" INSERT INTO `{$table}` (mb_id, pp_center, pp_prefs) VALUES (
            '" . lc_sql_escape($mb_id) . "',
            '" . lc_sql_escape($center) . "',
            '{$json}'
        ) ON DUPLICATE KEY UPDATE pp_prefs = '{$json}', pp_updated_at = NOW() ", false);
        if ($ok === false) {
            return array('ok' => false, 'message' => '알림 설정을 저장하지 못했습니다.', 'prefs' => array());
        }

        return array('ok' => true, 'message' => '앱 알림 설정을 저장했습니다.', 'prefs' => $prefs);
    }
}

if (!function_exists('lc_push_in_quiet_hours')) {
    function lc_push_in_quiet_hours(array $prefs)
    {
        $start = (string) ($prefs['quietStart'] ?? '');
        $end = (string) ($prefs['quietEnd'] ?? '');
        if ($start === '' || $end === '' || $start === $end) {
            return false;
        }
        $now = date('H:i');
        if ($start < $end) {
            return $now >= $start && $now < $end;
        }

        return $now >= $start || $now < $end;
    }
}

if (!function_exists('lc_push_register_device')) {
    /**
     * @return array{ok:bool,message:string}
     */
    function lc_push_register_device($mb_id, $center, $user_id, $platform, $token, $app_version = '')
    {
        if (function_exists('lc_db_ensure_push_tables')) {
            $ready = lc_db_ensure_push_tables();
            if (empty($ready['ok'])) {
                return array('ok' => false, 'message' => $ready['message']);
            }
        }
        $mb_id = trim((string) $mb_id);
        $center = trim((string) $center);
        $token = trim((string) $token);
        $platform = strtolower(trim((string) $platform));
        $user_id = (int) $user_id;
        if ($mb_id === '' || $token === '' || !in_array($center, array('partner', 'merchant', 'admin'), true)) {
            return array('ok' => false, 'message' => '기기 정보가 올바르지 않습니다.');
        }
        if (!in_array($platform, array('ios', 'android'), true)) {
            $platform = 'android';
        }
        $table = lc_table('push_devices');
        $ok = lc_sql_query(" INSERT INTO `{$table}` (
            mb_id, pd_center, pd_user_id, pd_platform, pd_token, pd_app_version, pd_active, pd_last_seen_at
        ) VALUES (
            '" . lc_sql_escape($mb_id) . "',
            '" . lc_sql_escape($center) . "',
            {$user_id},
            '" . lc_sql_escape($platform) . "',
            '" . lc_sql_escape($token) . "',
            '" . lc_sql_escape((string) $app_version) . "',
            1,
            NOW()
        ) ON DUPLICATE KEY UPDATE
            mb_id = VALUES(mb_id),
            pd_user_id = VALUES(pd_user_id),
            pd_platform = VALUES(pd_platform),
            pd_app_version = VALUES(pd_app_version),
            pd_active = 1,
            pd_last_seen_at = NOW() ", false);
        if ($ok === false) {
            return array('ok' => false, 'message' => '기기를 등록하지 못했습니다.');
        }

        return array('ok' => true, 'message' => '기기를 등록했습니다.');
    }
}

if (!function_exists('lc_push_unregister_device')) {
    function lc_push_unregister_device($token, $mb_id = '')
    {
        $token = trim((string) $token);
        if ($token === '' || !function_exists('lc_db_table_exists') || !lc_db_table_exists(lc_table('push_devices'))) {
            return array('ok' => true, 'message' => '등록 해제했습니다.');
        }
        $table = lc_table('push_devices');
        $where = "pd_token = '" . lc_sql_escape($token) . "'";
        $mb_id = trim((string) $mb_id);
        if ($mb_id !== '') {
            $where .= " AND mb_id = '" . lc_sql_escape($mb_id) . "'";
        }
        lc_sql_query(" UPDATE `{$table}` SET pd_active = 0 WHERE {$where} ", false);

        return array('ok' => true, 'message' => '기기 등록을 해제했습니다.');
    }
}

if (!function_exists('lc_push_deactivate_token')) {
    function lc_push_deactivate_token($token)
    {
        $token = trim((string) $token);
        if ($token === '') {
            return;
        }
        $table = lc_table('push_devices');
        if (function_exists('lc_db_table_exists') && lc_db_table_exists($table)) {
            lc_sql_query(" UPDATE `{$table}` SET pd_active = 0 WHERE pd_token = '" . lc_sql_escape($token) . "' ", false);
        }
    }
}

if (!function_exists('lc_push_devices_for_notification')) {
    /**
     * @return array<int,array<string,mixed>>
     */
    function lc_push_devices_for_notification($center, $user_id)
    {
        $table = lc_table('push_devices');
        if (!function_exists('lc_db_table_exists') || !lc_db_table_exists($table)) {
            return array();
        }
        $center = lc_sql_escape(trim((string) $center));
        $user_id = (int) $user_id;
        $where = "pd_center = '{$center}' AND pd_active = 1";
        if (!($center === 'admin' && $user_id === 0)) {
            $where .= " AND pd_user_id = {$user_id}";
        }
        $rows = array();
        $result = lc_sql_query(" SELECT * FROM `{$table}` WHERE {$where} ", false);
        if ($result) {
            while ($row = sql_fetch_array($result)) {
                $rows[] = $row;
            }
        }

        return $rows;
    }
}

if (!function_exists('lc_push_b64url')) {
    function lc_push_b64url($raw)
    {
        return rtrim(strtr(base64_encode($raw), '+/', '-_'), '=');
    }
}

if (!function_exists('lc_push_service_account')) {
    function lc_push_service_account()
    {
        $raw = trim((string) lc_settings_get('pushFcmServiceAccount', ''));
        if ($raw === '') {
            return null;
        }
        $json = json_decode($raw, true);
        if (!is_array($json) || empty($json['client_email']) || empty($json['private_key'])) {
            return null;
        }

        return $json;
    }
}

if (!function_exists('lc_push_access_token')) {
    /**
     * @return array{ok:bool,message:string,token?:string}
     */
    function lc_push_access_token()
    {
        static $cached = null;
        static $expires = 0;
        if (is_string($cached) && $cached !== '' && $expires > time() + 60) {
            return array('ok' => true, 'message' => 'cached', 'token' => $cached);
        }

        $cache_file = dirname(__DIR__) . '/data/fcm_access_token.json';
        if (is_file($cache_file)) {
            $stored = json_decode((string) file_get_contents($cache_file), true);
            if (is_array($stored) && !empty($stored['token']) && (int) ($stored['exp'] ?? 0) > time() + 60) {
                $cached = (string) $stored['token'];
                $expires = (int) $stored['exp'];
                return array('ok' => true, 'message' => 'cached', 'token' => $cached);
            }
        }

        $account = lc_push_service_account();
        if (!$account) {
            return array('ok' => false, 'message' => 'FCM 서비스 계정이 없습니다.');
        }
        $now = time();
        $header = lc_push_b64url(json_encode(array('alg' => 'RS256', 'typ' => 'JWT')));
        $claim = lc_push_b64url(json_encode(array(
            'iss'   => (string) $account['client_email'],
            'scope' => 'https://www.googleapis.com/auth/firebase.messaging',
            'aud'   => 'https://oauth2.googleapis.com/token',
            'iat'   => $now,
            'exp'   => $now + 3600,
        )));
        $input = $header . '.' . $claim;
        $signature = '';
        $signed = openssl_sign($input, $signature, (string) $account['private_key'], OPENSSL_ALGO_SHA256);
        if (!$signed) {
            return array('ok' => false, 'message' => 'FCM 서명에 실패했습니다.');
        }
        $jwt = $input . '.' . lc_push_b64url($signature);

        $ch = curl_init('https://oauth2.googleapis.com/token');
        curl_setopt_array($ch, array(
            CURLOPT_POST           => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 12,
            CURLOPT_HTTPHEADER     => array('Content-Type: application/x-www-form-urlencoded'),
            CURLOPT_POSTFIELDS     => http_build_query(array(
                'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                'assertion'  => $jwt,
            )),
        ));
        $raw = curl_exec($ch);
        $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        $body = is_string($raw) ? json_decode($raw, true) : null;
        $token = is_array($body) ? (string) ($body['access_token'] ?? '') : '';
        if ($code !== 200 || $token === '') {
            return array('ok' => false, 'message' => 'FCM 인증에 실패했습니다.');
        }
        $cached = $token;
        $expires = $now + (int) ($body['expires_in'] ?? 3600);
        $dir = dirname($cache_file);
        if (is_dir($dir) && is_writable($dir)) {
            @file_put_contents($cache_file, json_encode(array('token' => $token, 'exp' => $expires)));
        }

        return array('ok' => true, 'message' => 'ok', 'token' => $token);
    }
}

if (!function_exists('lc_push_send_token')) {
    /**
     * @param array<string,string> $data
     * @return array{ok:bool,message:string,unregistered?:bool}
     */
    function lc_push_send_token($token, $title, $body, array $data, $channel)
    {
        $project = trim((string) lc_settings_get('pushFcmProjectId', ''));
        $auth = lc_push_access_token();
        if (empty($auth['ok'])) {
            return array('ok' => false, 'message' => (string) ($auth['message'] ?? '인증 실패'));
        }
        $payload = array(
            'message' => array(
                'token' => $token,
                'notification' => array(
                    'title' => $title,
                    'body'  => $body,
                ),
                'data' => $data,
                'android' => array(
                    'priority' => 'HIGH',
                    'notification' => array(
                        'channel_id' => $channel,
                    ),
                ),
                'apns' => array(
                    'payload' => array(
                        'aps' => array(
                            'sound' => 'default',
                        ),
                    ),
                ),
            ),
        );
        $ch = curl_init('https://fcm.googleapis.com/v1/projects/' . rawurlencode($project) . '/messages:send');
        curl_setopt_array($ch, array(
            CURLOPT_POST           => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 12,
            CURLOPT_HTTPHEADER     => array(
                'Authorization: Bearer ' . $auth['token'],
                'Content-Type: application/json',
            ),
            CURLOPT_POSTFIELDS     => json_encode($payload, JSON_UNESCAPED_UNICODE),
        ));
        $raw = curl_exec($ch);
        $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($code >= 200 && $code < 300) {
            return array('ok' => true, 'message' => '발송했습니다.');
        }
        $decoded = is_string($raw) ? json_decode($raw, true) : null;
        $status = '';
        if (is_array($decoded) && isset($decoded['error']['details']) && is_array($decoded['error']['details'])) {
            foreach ($decoded['error']['details'] as $detail) {
                if (is_array($detail) && !empty($detail['errorCode'])) {
                    $status = (string) $detail['errorCode'];
                }
            }
        }
        if ($status === '' && is_array($decoded) && isset($decoded['error']['status'])) {
            $status = (string) $decoded['error']['status'];
        }
        $unregistered = in_array($status, array('UNREGISTERED', 'NOT_FOUND'), true);

        return array(
            'ok'           => false,
            'message'      => $status !== '' ? $status : 'FCM 발송에 실패했습니다.',
            'unregistered' => $unregistered,
        );
    }
}

if (!function_exists('lc_push_log')) {
    function lc_push_log($ok, $center, $user_id, $message)
    {
        if (function_exists('lc_admin_log_write')) {
            lc_admin_log_write($ok ? 'push_ok' : 'push_fail', (string) $center, (int) $user_id, (string) $message);
        }
    }
}

if (!function_exists('lc_push_send_for_notification')) {
    /**
     * @param array<string,mixed> $nf
     * @return array{ok:bool,sent:int,failed:int,message:string}
     */
    function lc_push_send_for_notification(array $nf)
    {
        if (!lc_push_enabled()) {
            return array('ok' => false, 'sent' => 0, 'failed' => 0, 'message' => '푸시 비활성');
        }
        $center = trim((string) ($nf['center'] ?? ''));
        $user_id = (int) ($nf['userId'] ?? 0);
        $type = trim((string) ($nf['type'] ?? 'system'));
        $priority = trim((string) ($nf['priority'] ?? 'normal'));
        $title = trim((string) ($nf['title'] ?? ''));
        $body = trim((string) ($nf['body'] ?? ''));
        if ($title === '' || $center === '') {
            return array('ok' => false, 'sent' => 0, 'failed' => 0, 'message' => '알림 내용이 없습니다.');
        }

        $devices = lc_push_devices_for_notification($center, $user_id);
        if (!$devices) {
            return array('ok' => true, 'sent' => 0, 'failed' => 0, 'message' => '등록된 기기가 없습니다.');
        }

        $channel = $type === 'conversion' ? 'db_received' : 'general';
        $data = array(
            'link'  => (string) ($nf['link'] ?? ''),
            'type'  => $type,
            'refId' => (string) (int) ($nf['refId'] ?? 0),
        );
        $sent = 0;
        $failed = 0;
        foreach ($devices as $device) {
            $prefs = lc_push_get_prefs((string) ($device['mb_id'] ?? ''), $center);
            if (array_key_exists($type, $prefs) && empty($prefs[$type])) {
                continue;
            }
            if ($priority !== 'critical' && lc_push_in_quiet_hours($prefs)) {
                continue;
            }
            $token = (string) ($device['pd_token'] ?? '');
            $result = lc_push_send_token($token, $title, $body, $data, $channel);
            if (!empty($result['ok'])) {
                $sent++;
                lc_push_log(true, $center, $user_id, $title);
            } else {
                $failed++;
                if (!empty($result['unregistered'])) {
                    lc_push_deactivate_token($token);
                }
                lc_push_log(false, $center, $user_id, (string) ($result['message'] ?? '실패'));
            }
        }

        return array('ok' => $failed === 0, 'sent' => $sent, 'failed' => $failed, 'message' => '발송 ' . $sent . '건');
    }
}
