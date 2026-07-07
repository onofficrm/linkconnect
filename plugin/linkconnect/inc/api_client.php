<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

if (!function_exists('lc_api_client_generate_code')) {
    function lc_api_client_generate_code()
    {
        return 'AC-' . date('ymd') . '-' . str_pad((string) mt_rand(1, 999), 3, '0', STR_PAD_LEFT);
    }
}

if (!function_exists('lc_api_client_generate_key')) {
    function lc_api_client_generate_key($prefix = 'sk_live_')
    {
        return $prefix . bin2hex(random_bytes(16));
    }
}

if (!function_exists('lc_api_client_get_by_id')) {
    function lc_api_client_get_by_id($ac_id)
    {
        if (!lc_db_installed()) {
            return null;
        }

        $ac_id = (int) $ac_id;
        $table = lc_table('api_clients');

        return lc_sql_fetch(" SELECT * FROM `{$table}` WHERE ac_id = '{$ac_id}' LIMIT 1 ");
    }
}

if (!function_exists('lc_api_client_get_by_key')) {
    function lc_api_client_get_by_key($api_key)
    {
        if (!lc_db_installed() || trim((string) $api_key) === '') {
            return null;
        }

        $table = lc_table('api_clients');
        $key = lc_sql_escape(trim((string) $api_key));

        return lc_sql_fetch(" SELECT * FROM `{$table}` WHERE ac_api_key = '{$key}' AND ac_status = 'active' LIMIT 1 ");
    }
}

if (!function_exists('lc_api_client_list')) {
    function lc_api_client_list()
    {
        if (!lc_db_installed()) {
            return array();
        }

        $table = lc_table('api_clients');
        $rows = array();
        $result = lc_sql_query(" SELECT * FROM `{$table}` ORDER BY ac_id DESC ", false);
        if ($result) {
            while ($row = sql_fetch_array($result)) {
                $rows[] = $row;
            }
        }

        return $rows;
    }
}

if (!function_exists('lc_api_client_ensure_default')) {
    function lc_api_client_ensure_default()
    {
        if (!lc_db_installed()) {
            return null;
        }

        $table = lc_table('api_clients');
        $existing = lc_sql_fetch(" SELECT * FROM `{$table}` LIMIT 1 ");
        if ($existing) {
            return $existing;
        }

        $code = lc_api_client_generate_code();
        $api_key = lc_api_client_generate_key();
        lc_sql_query(" INSERT INTO `{$table}` SET
            ac_code = '" . lc_sql_escape($code) . "',
            ac_name = '랜딩페이지',
            ac_type = 'landing',
            ac_api_key = '" . lc_sql_escape($api_key) . "',
            ac_api_secret = '" . lc_sql_escape(bin2hex(random_bytes(12))) . "',
            ac_allowed_ips = '',
            ac_status = 'active',
            ac_created_at = NOW() ", false);

        return lc_api_client_get_by_id((int) lc_sql_insert_id());
    }
}

if (!function_exists('lc_api_client_create')) {
    /**
     * @return array{ok:bool,message:string,client:array|null}
     */
    function lc_api_client_create(array $payload)
    {
        if (!lc_db_installed()) {
            return array('ok' => false, 'message' => 'DB가 설치되지 않았습니다.', 'client' => null);
        }

        $name = trim((string) ($payload['name'] ?? ''));
        if ($name === '') {
            return array('ok' => false, 'message' => '클라이언트명은 필수입니다.', 'client' => null);
        }

        $table = lc_table('api_clients');
        $code = lc_api_client_generate_code();
        $api_key = lc_api_client_generate_key();

        lc_sql_query(" INSERT INTO `{$table}` SET
            ac_code = '" . lc_sql_escape($code) . "',
            ac_name = '" . lc_sql_escape($name) . "',
            ac_type = '" . lc_sql_escape($payload['type'] ?? 'landing') . "',
            ac_api_key = '" . lc_sql_escape($api_key) . "',
            ac_api_secret = '" . lc_sql_escape(bin2hex(random_bytes(12))) . "',
            ac_allowed_ips = '" . lc_sql_escape($payload['allowedIps'] ?? '') . "',
            ac_status = 'active',
            ac_created_at = NOW() ", false);

        $ac_id = (int) lc_sql_insert_id();

        return array(
            'ok'      => true,
            'message' => 'API 클라이언트가 생성되었습니다.',
            'client'  => lc_api_client_get_by_id($ac_id),
        );
    }
}

if (!function_exists('lc_api_client_regenerate_key')) {
    function lc_api_client_regenerate_key($ac_id, $field = 'api_key')
    {
        if (!lc_db_installed()) {
            return array('ok' => false, 'message' => 'DB가 설치되지 않았습니다.', 'client' => null);
        }

        $client = lc_api_client_get_by_id($ac_id);
        if (!$client) {
            return array('ok' => false, 'message' => '클라이언트를 찾을 수 없습니다.', 'client' => null);
        }

        $table = lc_table('api_clients');
        if ($field === 'secret') {
            $value = bin2hex(random_bytes(12));
            lc_sql_query(" UPDATE `{$table}` SET ac_api_secret = '" . lc_sql_escape($value) . "' WHERE ac_id = '" . (int) $ac_id . "' LIMIT 1 ", false);
        } else {
            $value = lc_api_client_generate_key();
            lc_sql_query(" UPDATE `{$table}` SET ac_api_key = '" . lc_sql_escape($value) . "' WHERE ac_id = '" . (int) $ac_id . "' LIMIT 1 ", false);
        }

        return array(
            'ok'      => true,
            'message' => '키가 재발급되었습니다.',
            'client'  => lc_api_client_get_by_id($ac_id),
        );
    }
}

if (!function_exists('lc_api_client_update_status')) {
    function lc_api_client_update_status($ac_id, $status)
    {
        if (!lc_db_installed()) {
            return array('ok' => false, 'message' => 'DB가 설치되지 않았습니다.', 'client' => null);
        }

        $status = in_array($status, array('active', 'inactive'), true) ? $status : 'inactive';
        $table = lc_table('api_clients');
        lc_sql_query(" UPDATE `{$table}` SET ac_status = '" . lc_sql_escape($status) . "' WHERE ac_id = '" . (int) $ac_id . "' LIMIT 1 ", false);

        return array(
            'ok'      => true,
            'message' => $status === 'active' ? '활성화되었습니다.' : '비활성화되었습니다.',
            'client'  => lc_api_client_get_by_id($ac_id),
        );
    }
}

if (!function_exists('lc_api_client_touch')) {
    function lc_api_client_touch($ac_id)
    {
        if (!lc_db_installed()) {
            return;
        }

        $table = lc_table('api_clients');
        lc_sql_query(" UPDATE `{$table}` SET ac_last_call_at = NOW() WHERE ac_id = '" . (int) $ac_id . "' LIMIT 1 ", false);
    }
}

if (!function_exists('lc_api_client_validate_request')) {
    /**
     * @return array{ok:bool,message:string,client:array|null}
     */
    function lc_api_client_validate_request($api_key, $client_ip = '')
    {
        if (!lc_settings_get_bool('apiKeyEnabled', true)) {
            return array('ok' => true, 'message' => '', 'client' => null);
        }

        $client = lc_api_client_get_by_key($api_key);
        if (!$client) {
            return array('ok' => false, 'message' => 'Invalid API Key', 'client' => null);
        }

        if (lc_settings_get_bool('apiIpRestrict') && trim((string) $client['ac_allowed_ips']) !== '') {
            $allowed = array_filter(array_map('trim', explode(',', (string) $client['ac_allowed_ips'])));
            $ip_ok = false;
            foreach ($allowed as $pattern) {
                if ($pattern === $client_ip || ($pattern !== '' && strpos($pattern, '*') !== false && fnmatch($pattern, $client_ip))) {
                    $ip_ok = true;
                    break;
                }
            }
            if (!$ip_ok && $client_ip !== '') {
                return array('ok' => false, 'message' => 'IP not allowed', 'client' => $client);
            }
        }

        return array('ok' => true, 'message' => '', 'client' => $client);
    }
}

if (!function_exists('lc_api_log_mask_body')) {
    function lc_api_log_mask_body($body)
    {
        if (!lc_settings_get_bool('apiMaskPii', true) || !is_string($body) || $body === '') {
            return (string) $body;
        }

        $decoded = json_decode($body, true);
        if (!is_array($decoded)) {
            return $body;
        }

        foreach (array('name', 'phone', 'email') as $field) {
            if (!isset($decoded[$field])) {
                continue;
            }
            $value = (string) $decoded[$field];
            if ($field === 'phone' && strlen($value) > 4) {
                $decoded[$field] = substr($value, 0, 3) . '-****-' . substr($value, -4);
            } elseif ($field === 'name' && function_exists('mb_strlen') && mb_strlen($value, 'UTF-8') > 1) {
                $decoded[$field] = mb_substr($value, 0, 1, 'UTF-8') . '*';
            } else {
                $decoded[$field] = '***';
            }
        }

        return json_encode($decoded, JSON_UNESCAPED_UNICODE);
    }
}

if (!function_exists('lc_api_log_write')) {
    function lc_api_log_write(array $payload)
    {
        if (!lc_db_installed() || !lc_settings_get_bool('apiLogEnabled', true)) {
            return 0;
        }

        $table = lc_table('api_logs');
        $request = lc_api_log_mask_body((string) ($payload['requestBody'] ?? ''));
        $response = (string) ($payload['responseBody'] ?? '');

        lc_sql_query(" INSERT INTO `{$table}` SET
            ac_id = '" . (int) ($payload['acId'] ?? 0) . "',
            al_client_name = '" . lc_sql_escape($payload['clientName'] ?? '') . "',
            al_direction = '" . lc_sql_escape($payload['direction'] ?? 'receive') . "',
            al_endpoint = '" . lc_sql_escape($payload['endpoint'] ?? '') . "',
            al_ext_id = '" . lc_sql_escape($payload['extId'] ?? '') . "',
            al_int_code = '" . lc_sql_escape($payload['intCode'] ?? '') . "',
            al_status_code = '" . (int) ($payload['statusCode'] ?? 200) . "',
            al_status = '" . lc_sql_escape($payload['status'] ?? 'success') . "',
            al_error = '" . lc_sql_escape($payload['error'] ?? '') . "',
            al_request_body = '" . lc_sql_escape($request) . "',
            al_response_body = '" . lc_sql_escape($response) . "',
            al_created_at = NOW() ", false);

        if (!empty($payload['acId'])) {
            lc_api_client_touch((int) $payload['acId']);
        }

        return (int) lc_sql_insert_id();
    }
}

if (!function_exists('lc_api_log_status_label')) {
    function lc_api_log_status_label($status)
    {
        $labels = array(
            'success'  => '성공',
            'failed'   => '실패',
            'duplicate'=> '중복',
            'auth'     => '인증오류',
            'validate' => '검증오류',
        );

        return isset($labels[$status]) ? $labels[$status] : (string) $status;
    }
}

if (!function_exists('lc_api_log_list')) {
    function lc_api_log_list(array $filters = array(), $limit = 50)
    {
        if (!lc_db_installed()) {
            return array();
        }

        $table = lc_table('api_logs');
        $where = ' 1=1 ';

        if (!empty($filters['status'])) {
            $where .= " AND al_status = '" . lc_sql_escape($filters['status']) . "' ";
        }
        if (!empty($filters['client'])) {
            $where .= " AND al_client_name = '" . lc_sql_escape($filters['client']) . "' ";
        }
        if (!empty($filters['q'])) {
            $q = lc_sql_escape($filters['q']);
            $where .= " AND (al_endpoint LIKE '%{$q}%' OR al_int_code LIKE '%{$q}%' OR al_ext_id LIKE '%{$q}%') ";
        }
        if (!empty($filters['errors_only'])) {
            $where .= " AND al_status != 'success' ";
        }
        if (!empty($filters['since_hours'])) {
            $hours = max(1, (int) $filters['since_hours']);
            $where .= " AND al_created_at >= DATE_SUB(NOW(), INTERVAL {$hours} HOUR) ";
        }

        $limit = max(1, min(200, (int) $limit));
        $rows = array();
        $result = lc_sql_query(" SELECT * FROM `{$table}` WHERE {$where} ORDER BY al_id DESC LIMIT {$limit} ", false);
        if ($result) {
            while ($row = sql_fetch_array($result)) {
                $rows[] = $row;
            }
        }

        return $rows;
    }
}

if (!function_exists('lc_api_log_to_api')) {
    function lc_api_log_to_api(array $row, $detail = false)
    {
        $item = array(
            'id'         => 'LOG-' . str_pad((string) ($row['al_id'] ?? 0), 3, '0', STR_PAD_LEFT),
            'alId'       => (int) ($row['al_id'] ?? 0),
            'time'       => date('Y.m.d H:i:s', strtotime($row['al_created_at'] ?? 'now')),
            'client'     => (string) ($row['al_client_name'] ?? ''),
            'direction'  => (string) ($row['al_direction'] ?? ''),
            'endpoint'   => (string) ($row['al_endpoint'] ?? ''),
            'extId'      => (string) ($row['al_ext_id'] ?? ''),
            'intId'      => (string) ($row['al_int_code'] ?? ''),
            'statusCode' => (int) ($row['al_status_code'] ?? 0),
            'status'     => lc_api_log_status_label($row['al_status'] ?? ''),
            'statusCodeRaw' => (string) ($row['al_status'] ?? ''),
            'error'      => (string) ($row['al_error'] ?? ''),
        );

        if ($detail) {
            $item['requestBody'] = (string) ($row['al_request_body'] ?? '');
            $item['responseBody'] = (string) ($row['al_response_body'] ?? '');
        }

        return $item;
    }
}

if (!function_exists('lc_api_log_summary')) {
    function lc_api_log_summary()
    {
        if (!lc_db_installed()) {
            return array(
                'todayTotal' => 0,
                'todaySuccess' => 0,
                'todayFailed' => 0,
                'todayDuplicate' => 0,
                'dbshareTotal' => 0,
                'lastReceiveTime' => '-',
            );
        }

        $table = lc_table('api_logs');
        $today = date('Y-m-d');
        $row = lc_sql_fetch(" SELECT
            COUNT(*) AS total_cnt,
            SUM(CASE WHEN al_status = 'success' THEN 1 ELSE 0 END) AS success_cnt,
            SUM(CASE WHEN al_status = 'failed' THEN 1 ELSE 0 END) AS failed_cnt,
            SUM(CASE WHEN al_status = 'duplicate' THEN 1 ELSE 0 END) AS duplicate_cnt,
            SUM(CASE WHEN al_client_name LIKE '%디비쉐어%' OR al_client_name LIKE '%dbshare%' THEN 1 ELSE 0 END) AS dbshare_cnt,
            MAX(al_created_at) AS last_at
            FROM `{$table}` WHERE DATE(al_created_at) = '{$today}' ");

        $last = !empty($row['last_at']) ? date('H:i', strtotime($row['last_at'])) : '-';

        return array(
            'todayTotal'      => (int) ($row['total_cnt'] ?? 0),
            'todaySuccess'    => (int) ($row['success_cnt'] ?? 0),
            'todayFailed'     => (int) ($row['failed_cnt'] ?? 0),
            'todayDuplicate'  => (int) ($row['duplicate_cnt'] ?? 0),
            'dbshareTotal'    => (int) ($row['dbshare_cnt'] ?? 0),
            'lastReceiveTime' => $last,
        );
    }
}

if (!function_exists('lc_api_client_to_api')) {
    function lc_api_client_to_api(array $row)
    {
        return array(
            'id'          => (int) ($row['ac_id'] ?? 0),
            'code'        => (string) ($row['ac_code'] ?? ''),
            'name'        => (string) ($row['ac_name'] ?? ''),
            'type'        => (string) ($row['ac_type'] ?? ''),
            'apiKey'      => (string) ($row['ac_api_key'] ?? ''),
            'allowedIps'  => (string) ($row['ac_allowed_ips'] ?? ''),
            'status'      => (string) ($row['ac_status'] ?? '') === 'active' ? '정상' : '비활성',
            'statusCode'  => (string) ($row['ac_status'] ?? ''),
            'lastCallAt'  => !empty($row['ac_last_call_at']) ? date('Y.m.d H:i', strtotime($row['ac_last_call_at'])) : '-',
        );
    }
}
