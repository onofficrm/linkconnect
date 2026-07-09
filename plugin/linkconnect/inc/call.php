<?php
/**
 * LinkConnect 콜디비(Call DB)
 *
 * - 콜업체(Call Provider) API 연동: 가상번호 발급/해제, 녹취 조회
 * - 통화 웹훅 수신 → 통화로그 적재 → CPA 전환 자동 생성
 * - 역할별 책임
 *   · 광고주: 콜디비 on/off, 착신번호1/2, 상품 별칭
 *   · 파트너: 가상번호 신청(관리자 배정 후 노출)
 *   · 관리자: 번호풀 관리, 신청 배정/반려, 녹음/콜설정, 콜DB 최종 승인/불가, 녹취 열람
 */
if (!defined('_GNUBOARD_')) {
    exit;
}

/* ───────────────────────────── 설정 / 콜업체 API ───────────────────────────── */

if (!function_exists('lc_call_enabled')) {
    function lc_call_enabled()
    {
        return lc_settings_get_bool('callEnabled', false);
    }
}

if (!function_exists('lc_call_provider_config')) {
    /**
     * @return array{provider:string,baseUrl:string,apiKey:string,apiSecret:string,webhookToken:string}
     */
    function lc_call_provider_config()
    {
        return array(
            'provider'     => trim((string) lc_settings_get('callProvider', '')),
            'baseUrl'      => rtrim(trim((string) lc_settings_get('callApiBaseUrl', '')), '/'),
            'apiKey'       => trim((string) lc_settings_get('callApiKey', '')),
            'apiSecret'    => trim((string) lc_settings_get('callApiSecret', '')),
            'webhookToken' => trim((string) lc_settings_get('callWebhookToken', '')),
        );
    }
}

if (!function_exists('lc_call_api_request')) {
    /**
     * 콜업체 REST API 호출 (아웃바운드)
     *
     * @param string $method GET|POST|DELETE
     * @param string $path   /virtual-numbers 처럼 baseUrl 뒤에 붙는 경로
     * @param array  $body   요청 바디 (POST)
     * @return array{ok:bool,status:int,data:array,message:string,raw:string}
     */
    function lc_call_api_request($method, $path, array $body = array(), array $options = array())
    {
        $cfg = lc_call_provider_config();
        if ($cfg['baseUrl'] === '') {
            return array('ok' => false, 'status' => 0, 'data' => array(), 'message' => '콜업체 API 주소가 설정되지 않았습니다.', 'raw' => '');
        }
        if (!function_exists('curl_init')) {
            return array('ok' => false, 'status' => 0, 'data' => array(), 'message' => 'PHP curl 확장이 필요합니다.', 'raw' => '');
        }

        $method = strtoupper($method);
        $url = $cfg['baseUrl'] . '/' . ltrim((string) $path, '/');

        $headers = array(
            'Content-Type: application/json',
            'Accept: application/json',
        );
        if ($cfg['apiKey'] !== '') {
            $headers[] = 'X-API-KEY: ' . $cfg['apiKey'];
            $headers[] = 'Authorization: Bearer ' . $cfg['apiKey'];
        }

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, isset($options['timeout']) ? (int) $options['timeout'] : 15);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        if ($method !== 'GET' && $body) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body, JSON_UNESCAPED_UNICODE));
        }

        $raw = curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $err = curl_error($ch);
        curl_close($ch);

        if ($raw === false) {
            return array('ok' => false, 'status' => $status, 'data' => array(), 'message' => 'API 호출 실패: ' . $err, 'raw' => '');
        }

        $decoded = json_decode((string) $raw, true);
        $data = is_array($decoded) ? $decoded : array();
        $ok = $status >= 200 && $status < 300;

        return array(
            'ok'      => $ok,
            'status'  => $status,
            'data'    => $data,
            'message' => $ok ? 'OK' : ('API 오류(' . $status . ')'),
            'raw'     => (string) $raw,
        );
    }
}

/* ───────────────────────────── 가상번호 풀 ───────────────────────────── */

if (!function_exists('lc_call_number_normalize')) {
    function lc_call_number_normalize($number)
    {
        return preg_replace('/[^0-9]/', '', (string) $number);
    }
}

if (!function_exists('lc_call_numbers_list')) {
    function lc_call_numbers_list(array $filters = array())
    {
        if (!lc_db_installed() || !lc_db_table_exists(lc_table('call_numbers'))) {
            return array();
        }

        $table = lc_table('call_numbers');
        $where = ' 1=1 ';
        if (!empty($filters['status'])) {
            $where .= " AND cn_status = '" . lc_sql_escape($filters['status']) . "' ";
        }
        if (!empty($filters['q'])) {
            $q = lc_sql_escape($filters['q']);
            $where .= " AND (cn_number LIKE '%{$q}%' OR cn_memo LIKE '%{$q}%') ";
        }

        $rows = array();
        $result = lc_sql_query(" SELECT * FROM `{$table}` WHERE {$where} ORDER BY cn_id DESC LIMIT 500 ", false);
        if ($result) {
            while ($row = sql_fetch_array($result)) {
                $rows[] = $row;
            }
        }

        return $rows;
    }
}

if (!function_exists('lc_call_number_get')) {
    function lc_call_number_get($cn_id)
    {
        if (!lc_db_installed()) {
            return null;
        }
        $table = lc_table('call_numbers');

        return lc_sql_fetch(" SELECT * FROM `{$table}` WHERE cn_id = '" . (int) $cn_id . "' LIMIT 1 ");
    }
}

if (!function_exists('lc_call_number_create')) {
    /**
     * @return array{ok:bool,message:string,cnId?:int}
     */
    function lc_call_number_create(array $payload)
    {
        if (!lc_db_installed()) {
            return array('ok' => false, 'message' => 'DB가 설치되지 않았습니다.');
        }

        $number = lc_call_number_normalize($payload['number'] ?? '');
        if ($number === '') {
            return array('ok' => false, 'message' => '가상번호를 입력하세요.');
        }

        $table = lc_table('call_numbers');
        $exists = lc_sql_fetch(" SELECT cn_id FROM `{$table}` WHERE cn_number = '" . lc_sql_escape($number) . "' LIMIT 1 ");
        if ($exists) {
            return array('ok' => false, 'message' => '이미 등록된 번호입니다.');
        }

        lc_sql_query(" INSERT INTO `{$table}` SET
            cn_number = '" . lc_sql_escape($number) . "',
            cn_provider = '" . lc_sql_escape($payload['provider'] ?? lc_settings_get('callProvider', '')) . "',
            cn_provider_number_id = '" . lc_sql_escape($payload['providerNumberId'] ?? '') . "',
            cn_status = '" . lc_sql_escape($payload['status'] ?? LC_CALL_NUMBER_AVAILABLE) . "',
            cn_memo = '" . lc_sql_escape($payload['memo'] ?? '') . "',
            cn_created_at = NOW(),
            cn_updated_at = NOW() ", false);

        return array('ok' => true, 'message' => '가상번호가 등록되었습니다.', 'cnId' => (int) lc_sql_insert_id());
    }
}

if (!function_exists('lc_call_number_update')) {
    function lc_call_number_update($cn_id, array $payload)
    {
        if (!lc_db_installed()) {
            return array('ok' => false, 'message' => 'DB가 설치되지 않았습니다.');
        }
        $cn_id = (int) $cn_id;
        $number = lc_call_number_get($cn_id);
        if (!$number) {
            return array('ok' => false, 'message' => '번호를 찾을 수 없습니다.');
        }

        $table = lc_table('call_numbers');
        $sets = array();
        if (isset($payload['status'])) {
            $sets[] = "cn_status = '" . lc_sql_escape($payload['status']) . "'";
        }
        if (isset($payload['memo'])) {
            $sets[] = "cn_memo = '" . lc_sql_escape($payload['memo']) . "'";
        }
        if (isset($payload['providerNumberId'])) {
            $sets[] = "cn_provider_number_id = '" . lc_sql_escape($payload['providerNumberId']) . "'";
        }
        if (!$sets) {
            return array('ok' => true, 'message' => '변경사항이 없습니다.');
        }
        $sets[] = 'cn_updated_at = NOW()';

        lc_sql_query(" UPDATE `{$table}` SET " . implode(', ', $sets) . " WHERE cn_id = '{$cn_id}' ", false);

        return array('ok' => true, 'message' => '수정되었습니다.');
    }
}

if (!function_exists('lc_call_number_provision')) {
    /**
     * 콜업체 API로 가상번호 발급 요청 후 풀에 등록.
     * 실패 시 수동 등록으로 대체 가능.
     */
    function lc_call_number_provision(array $payload = array())
    {
        $cfg = lc_call_provider_config();
        if ($cfg['baseUrl'] === '') {
            return array('ok' => false, 'message' => '콜업체 API가 설정되지 않아 자동 발급할 수 없습니다. 수동 등록을 이용하세요.');
        }

        $res = lc_call_api_request('POST', 'virtual-numbers', array(
            'areaCode' => $payload['areaCode'] ?? '',
            'memo'     => $payload['memo'] ?? '',
        ));
        if (!$res['ok']) {
            return array('ok' => false, 'message' => $res['message']);
        }

        $data = $res['data'];
        $number = (string) ($data['number'] ?? $data['virtualNumber'] ?? $data['phone'] ?? '');
        $providerId = (string) ($data['id'] ?? $data['numberId'] ?? '');
        if ($number === '') {
            return array('ok' => false, 'message' => '콜업체 응답에 번호가 없습니다.');
        }

        return lc_call_number_create(array(
            'number'           => $number,
            'providerNumberId' => $providerId,
            'memo'             => $payload['memo'] ?? '',
        ));
    }
}

/* ───────────────────────────── 캠페인 콜 설정 ───────────────────────────── */

if (!function_exists('lc_call_settings_defaults')) {
    function lc_call_settings_defaults($cp_id = 0, $mt_id = 0)
    {
        return array(
            'cs_id'             => 0,
            'cp_id'             => (int) $cp_id,
            'mt_id'             => (int) $mt_id,
            'cs_enabled'        => 0,
            'cs_alias'          => '',
            'cs_forward1'       => '',
            'cs_forward2'       => '',
            'cs_admin_enabled'  => 1,
            'cs_recording_mode' => lc_settings_get('callRecordingMode', 'normal'),
            'cs_coloring'       => '',
            'cs_call_ment'      => '',
            'cs_business_start' => '00:00',
            'cs_business_end'   => '23:59',
            'cs_holiday_weeks'  => '',
            'cs_holiday_days'   => '',
            'cs_price'          => 0,
            'cs_min_duration'   => (int) lc_settings_get_int('callMinDuration', 0),
            'cs_memo'           => '',
        );
    }
}

if (!function_exists('lc_call_settings_get')) {
    function lc_call_settings_get($cp_id, $mt_id = 0)
    {
        $cp_id = (int) $cp_id;
        if (!lc_db_installed() || !lc_db_table_exists(lc_table('call_settings'))) {
            return lc_call_settings_defaults($cp_id, $mt_id);
        }

        $table = lc_table('call_settings');
        $row = lc_sql_fetch(" SELECT * FROM `{$table}` WHERE cp_id = '{$cp_id}' LIMIT 1 ");
        if (!$row) {
            return lc_call_settings_defaults($cp_id, $mt_id);
        }

        return $row;
    }
}

if (!function_exists('lc_call_settings_save')) {
    /**
     * 저장 범위(scope): 'merchant' = 광고주 편집 필드만, 'admin' = 관리자 필드만.
     */
    function lc_call_settings_save($cp_id, array $payload, $scope = 'admin')
    {
        if (!lc_db_installed()) {
            return array('ok' => false, 'message' => 'DB가 설치되지 않았습니다.');
        }
        $cp_id = (int) $cp_id;
        if ($cp_id <= 0) {
            return array('ok' => false, 'message' => '캠페인 정보가 없습니다.');
        }

        $cp_table = lc_table('campaigns');
        $campaign = lc_sql_fetch(" SELECT cp_id, mt_id FROM `{$cp_table}` WHERE cp_id = '{$cp_id}' LIMIT 1 ");
        if (!$campaign) {
            return array('ok' => false, 'message' => '캠페인을 찾을 수 없습니다.');
        }
        $mt_id = (int) $campaign['mt_id'];

        $table = lc_table('call_settings');
        $existing = lc_sql_fetch(" SELECT cs_id FROM `{$table}` WHERE cp_id = '{$cp_id}' LIMIT 1 ");

        // 광고주가 편집 가능한 필드
        $merchant_fields = array(
            'cs_enabled'  => isset($payload['enabled']) ? (!empty($payload['enabled']) ? 1 : 0) : null,
            'cs_alias'    => isset($payload['alias']) ? (string) $payload['alias'] : null,
            'cs_forward1' => isset($payload['forward1']) ? lc_call_number_normalize($payload['forward1']) : null,
            'cs_forward2' => isset($payload['forward2']) ? lc_call_number_normalize($payload['forward2']) : null,
        );

        // 관리자 전용 필드
        $admin_fields = array(
            'cs_admin_enabled'  => isset($payload['adminEnabled']) ? (!empty($payload['adminEnabled']) ? 1 : 0) : null,
            'cs_recording_mode' => isset($payload['recordingMode']) ? (string) $payload['recordingMode'] : null,
            'cs_coloring'       => isset($payload['coloring']) ? (string) $payload['coloring'] : null,
            'cs_call_ment'      => isset($payload['callMent']) ? (string) $payload['callMent'] : null,
            'cs_business_start' => isset($payload['businessStart']) ? (string) $payload['businessStart'] : null,
            'cs_business_end'   => isset($payload['businessEnd']) ? (string) $payload['businessEnd'] : null,
            'cs_holiday_weeks'  => isset($payload['holidayWeeks']) ? (string) $payload['holidayWeeks'] : null,
            'cs_holiday_days'   => isset($payload['holidayDays']) ? (string) $payload['holidayDays'] : null,
            'cs_price'          => isset($payload['price']) ? (int) $payload['price'] : null,
            'cs_min_duration'   => isset($payload['minDuration']) ? (int) $payload['minDuration'] : null,
            'cs_memo'           => isset($payload['memo']) ? (string) $payload['memo'] : null,
        );

        $fields = array();
        if ($scope === 'merchant' || $scope === 'all') {
            $fields = array_merge($fields, $merchant_fields);
        }
        if ($scope === 'admin' || $scope === 'all') {
            $fields = array_merge($fields, $admin_fields);
        }

        $sets = array();
        foreach ($fields as $col => $val) {
            if ($val === null) {
                continue;
            }
            if (is_int($val)) {
                $sets[] = "`{$col}` = '" . (int) $val . "'";
            } else {
                $sets[] = "`{$col}` = '" . lc_sql_escape($val) . "'";
            }
        }

        if ($existing) {
            if (!$sets) {
                return array('ok' => true, 'message' => '변경사항이 없습니다.');
            }
            $sets[] = 'cs_updated_at = NOW()';
            lc_sql_query(" UPDATE `{$table}` SET " . implode(', ', $sets) . " WHERE cp_id = '{$cp_id}' ", false);
        } else {
            $base = lc_call_settings_defaults($cp_id, $mt_id);
            $merged = array();
            foreach ($fields as $col => $val) {
                if ($val !== null) {
                    $merged[$col] = $val;
                }
            }
            $insert = array(
                'cp_id' => $cp_id,
                'mt_id' => $mt_id,
            );
            foreach (array('cs_enabled','cs_alias','cs_forward1','cs_forward2','cs_admin_enabled','cs_recording_mode','cs_coloring','cs_call_ment','cs_business_start','cs_business_end','cs_holiday_weeks','cs_holiday_days','cs_price','cs_min_duration','cs_memo') as $col) {
                $insert[$col] = array_key_exists($col, $merged) ? $merged[$col] : $base[$col];
            }
            $cols = array();
            foreach ($insert as $col => $val) {
                if (is_int($val)) {
                    $cols[] = "`{$col}` = '" . (int) $val . "'";
                } else {
                    $cols[] = "`{$col}` = '" . lc_sql_escape($val) . "'";
                }
            }
            $cols[] = 'cs_created_at = NOW()';
            $cols[] = 'cs_updated_at = NOW()';
            lc_sql_query(" INSERT INTO `{$table}` SET " . implode(', ', $cols) . " ", false);
        }

        return array('ok' => true, 'message' => '콜 설정이 저장되었습니다.', 'settings' => lc_call_settings_get($cp_id, $mt_id));
    }
}

/* ───────────────────────────── 가상번호 신청 / 배정 ───────────────────────────── */

if (!function_exists('lc_call_request_get')) {
    function lc_call_request_get($car_id)
    {
        if (!lc_db_installed()) {
            return null;
        }
        $table = lc_table('call_requests');

        return lc_sql_fetch(" SELECT * FROM `{$table}` WHERE car_id = '" . (int) $car_id . "' LIMIT 1 ");
    }
}

if (!function_exists('lc_call_requests_list')) {
    function lc_call_requests_list(array $filters = array())
    {
        if (!lc_db_installed() || !lc_db_table_exists(lc_table('call_requests'))) {
            return array();
        }

        $car = lc_table('call_requests');
        $pt = lc_table('partners');
        $cp = lc_table('campaigns');

        $where = ' 1=1 ';
        if (!empty($filters['status'])) {
            $where .= " AND r.car_status = '" . lc_sql_escape($filters['status']) . "' ";
        }
        if (!empty($filters['pt_id'])) {
            $where .= " AND r.pt_id = '" . (int) $filters['pt_id'] . "' ";
        }
        if (!empty($filters['cp_id'])) {
            $where .= " AND r.cp_id = '" . (int) $filters['cp_id'] . "' ";
        }

        $rows = array();
        $sql = " SELECT r.*, p.pt_code, p.pt_name, c.cp_name
            FROM `{$car}` r
            LEFT JOIN `{$pt}` p ON p.pt_id = r.pt_id
            LEFT JOIN `{$cp}` c ON c.cp_id = r.cp_id
            WHERE {$where}
            ORDER BY r.car_id DESC LIMIT 500 ";
        $result = lc_sql_query($sql, false);
        if ($result) {
            while ($row = sql_fetch_array($result)) {
                $rows[] = $row;
            }
        }

        return $rows;
    }
}

if (!function_exists('lc_call_request_create')) {
    /**
     * 파트너가 캠페인에 대해 가상번호 신청.
     */
    function lc_call_request_create($pt_id, $cp_id, $memo = '')
    {
        if (!lc_db_installed()) {
            return array('ok' => false, 'message' => 'DB가 설치되지 않았습니다.');
        }
        $pt_id = (int) $pt_id;
        $cp_id = (int) $cp_id;
        if ($pt_id <= 0 || $cp_id <= 0) {
            return array('ok' => false, 'message' => '파트너/캠페인 정보가 필요합니다.');
        }

        $cp_table = lc_table('campaigns');
        $campaign = lc_sql_fetch(" SELECT cp_id, mt_id FROM `{$cp_table}` WHERE cp_id = '{$cp_id}' LIMIT 1 ");
        if (!$campaign) {
            return array('ok' => false, 'message' => '캠페인을 찾을 수 없습니다.');
        }

        $table = lc_table('call_requests');
        $dup = lc_sql_fetch(" SELECT car_id FROM `{$table}` WHERE pt_id = '{$pt_id}' AND cp_id = '{$cp_id}' AND car_status IN ('" . LC_CALL_REQ_PENDING . "','" . LC_CALL_REQ_ASSIGNED . "') LIMIT 1 ");
        if ($dup) {
            return array('ok' => false, 'message' => '이미 신청했거나 배정된 캠페인입니다.');
        }

        lc_sql_query(" INSERT INTO `{$table}` SET
            pt_id = '{$pt_id}',
            cp_id = '{$cp_id}',
            mt_id = '" . (int) $campaign['mt_id'] . "',
            car_status = '" . LC_CALL_REQ_PENDING . "',
            car_request_memo = '" . lc_sql_escape($memo) . "',
            car_created_at = NOW() ", false);

        $car_id = (int) lc_sql_insert_id();

        if (function_exists('lc_notification_create')) {
            lc_notification_create(array(
                'center'  => 'admin',
                'type'    => 'call',
                'title'   => '가상번호 신청',
                'body'    => '파트너 #' . $pt_id . ' · 캠페인 #' . $cp_id,
                'link'    => '/admin/call',
                'refType' => 'call_request',
                'refId'   => $car_id,
            ));
        }

        return array('ok' => true, 'message' => '가상번호를 신청했습니다. 관리자 배정을 기다려주세요.', 'carId' => $car_id);
    }
}

if (!function_exists('lc_call_request_assign')) {
    /**
     * 관리자가 신청에 가상번호 배정.
     */
    function lc_call_request_assign($car_id, $cn_id, $admin_memo = '')
    {
        if (!lc_db_installed()) {
            return array('ok' => false, 'message' => 'DB가 설치되지 않았습니다.');
        }
        $car_id = (int) $car_id;
        $cn_id = (int) $cn_id;

        $request = lc_call_request_get($car_id);
        if (!$request) {
            return array('ok' => false, 'message' => '신청 내역을 찾을 수 없습니다.');
        }
        if ($request['car_status'] === LC_CALL_REQ_ASSIGNED) {
            return array('ok' => false, 'message' => '이미 배정된 신청입니다.');
        }

        $number = lc_call_number_get($cn_id);
        if (!$number) {
            return array('ok' => false, 'message' => '가상번호를 찾을 수 없습니다.');
        }
        if ($number['cn_status'] !== LC_CALL_NUMBER_AVAILABLE) {
            return array('ok' => false, 'message' => '사용 가능한 번호가 아닙니다. (현재: ' . $number['cn_status'] . ')');
        }

        $car_table = lc_table('call_requests');
        $cn_table = lc_table('call_numbers');

        lc_sql_query(" UPDATE `{$car_table}` SET
            car_status = '" . LC_CALL_REQ_ASSIGNED . "',
            cn_id = '{$cn_id}',
            car_virtual_number = '" . lc_sql_escape($number['cn_number']) . "',
            car_admin_memo = '" . lc_sql_escape($admin_memo) . "',
            car_processed_at = NOW()
            WHERE car_id = '{$car_id}' ", false);

        lc_sql_query(" UPDATE `{$cn_table}` SET cn_status = '" . LC_CALL_NUMBER_ASSIGNED . "', cn_updated_at = NOW() WHERE cn_id = '{$cn_id}' ", false);

        // 콜업체에 착신 매핑 등록 (설정된 경우)
        lc_call_provider_bind_number($number, $request);

        if (function_exists('lc_notification_create')) {
            lc_notification_create(array(
                'center'  => 'partner',
                'userId'  => (int) $request['pt_id'],
                'type'    => 'call',
                'title'   => '가상번호 배정 완료',
                'body'    => $number['cn_number'] . ' 번호가 배정되었습니다.',
                'link'    => '/partner/call',
                'refType' => 'call_request',
                'refId'   => $car_id,
            ));
        }

        return array('ok' => true, 'message' => '가상번호를 배정했습니다.', 'number' => $number['cn_number']);
    }
}

if (!function_exists('lc_call_provider_bind_number')) {
    /**
     * 콜업체 API에 "가상번호 → 착신번호" 라우팅 등록.
     * baseUrl 미설정 시 조용히 skip (수동 운영).
     */
    function lc_call_provider_bind_number(array $number, array $request)
    {
        $cfg = lc_call_provider_config();
        if ($cfg['baseUrl'] === '' || empty($number['cn_provider_number_id'])) {
            return array('ok' => false, 'message' => 'skip');
        }

        $settings = lc_call_settings_get((int) $request['cp_id']);

        return lc_call_api_request('POST', 'virtual-numbers/' . rawurlencode((string) $number['cn_provider_number_id']) . '/route', array(
            'forward1'      => (string) ($settings['cs_forward1'] ?? ''),
            'forward2'      => (string) ($settings['cs_forward2'] ?? ''),
            'recordingMode' => (string) ($settings['cs_recording_mode'] ?? 'normal'),
            'coloring'      => (string) ($settings['cs_coloring'] ?? ''),
            'ment'          => (string) ($settings['cs_call_ment'] ?? ''),
        ));
    }
}

if (!function_exists('lc_call_request_reject')) {
    function lc_call_request_reject($car_id, $admin_memo = '')
    {
        if (!lc_db_installed()) {
            return array('ok' => false, 'message' => 'DB가 설치되지 않았습니다.');
        }
        $car_id = (int) $car_id;
        $request = lc_call_request_get($car_id);
        if (!$request) {
            return array('ok' => false, 'message' => '신청 내역을 찾을 수 없습니다.');
        }

        $table = lc_table('call_requests');
        lc_sql_query(" UPDATE `{$table}` SET
            car_status = '" . LC_CALL_REQ_REJECTED . "',
            car_admin_memo = '" . lc_sql_escape($admin_memo) . "',
            car_processed_at = NOW()
            WHERE car_id = '{$car_id}' ", false);

        if (function_exists('lc_notification_create')) {
            lc_notification_create(array(
                'center'  => 'partner',
                'userId'  => (int) $request['pt_id'],
                'type'    => 'call',
                'title'   => '가상번호 신청 반려',
                'body'    => $admin_memo !== '' ? $admin_memo : '신청이 반려되었습니다.',
                'link'    => '/partner/call',
                'refType' => 'call_request',
                'refId'   => $car_id,
            ));
        }

        return array('ok' => true, 'message' => '신청을 반려했습니다.');
    }
}

if (!function_exists('lc_call_request_revoke')) {
    /**
     * 배정된 번호 회수 → 번호를 다시 available 로.
     */
    function lc_call_request_revoke($car_id, $admin_memo = '')
    {
        if (!lc_db_installed()) {
            return array('ok' => false, 'message' => 'DB가 설치되지 않았습니다.');
        }
        $car_id = (int) $car_id;
        $request = lc_call_request_get($car_id);
        if (!$request) {
            return array('ok' => false, 'message' => '신청 내역을 찾을 수 없습니다.');
        }

        $car_table = lc_table('call_requests');
        $cn_table = lc_table('call_numbers');

        lc_sql_query(" UPDATE `{$car_table}` SET car_status = '" . LC_CALL_REQ_REVOKED . "', car_admin_memo = '" . lc_sql_escape($admin_memo) . "', car_processed_at = NOW() WHERE car_id = '{$car_id}' ", false);
        if ((int) $request['cn_id'] > 0) {
            lc_sql_query(" UPDATE `{$cn_table}` SET cn_status = '" . LC_CALL_NUMBER_AVAILABLE . "', cn_updated_at = NOW() WHERE cn_id = '" . (int) $request['cn_id'] . "' ", false);
        }

        return array('ok' => true, 'message' => '번호를 회수했습니다.');
    }
}

if (!function_exists('lc_call_assignment_by_number')) {
    /**
     * 활성 배정(가상번호 → 파트너/캠페인) 조회.
     */
    function lc_call_assignment_by_number($virtual_number)
    {
        if (!lc_db_installed()) {
            return null;
        }
        $number = lc_call_number_normalize($virtual_number);
        if ($number === '') {
            return null;
        }
        $table = lc_table('call_requests');

        return lc_sql_fetch(" SELECT * FROM `{$table}` WHERE car_virtual_number = '" . lc_sql_escape($number) . "' AND car_status = '" . LC_CALL_REQ_ASSIGNED . "' ORDER BY car_id DESC LIMIT 1 ");
    }
}

/* ───────────────────────────── 통화로그 / 전환 생성 ───────────────────────────── */

if (!function_exists('lc_call_normalize_result')) {
    function lc_call_normalize_result($result, $duration)
    {
        $result = strtolower(trim((string) $result));
        $map = array(
            'success' => LC_CALL_RESULT_SUCCESS, 'answered' => LC_CALL_RESULT_SUCCESS, 'completed' => LC_CALL_RESULT_SUCCESS, 'connect' => LC_CALL_RESULT_SUCCESS,
            'missed' => LC_CALL_RESULT_MISSED, 'noanswer' => LC_CALL_RESULT_MISSED, 'no-answer' => LC_CALL_RESULT_MISSED,
            'busy' => LC_CALL_RESULT_BUSY,
            'fail' => LC_CALL_RESULT_FAIL, 'failed' => LC_CALL_RESULT_FAIL, 'canceled' => LC_CALL_RESULT_FAIL,
        );
        if (isset($map[$result])) {
            return $map[$result];
        }

        return (int) $duration > 0 ? LC_CALL_RESULT_SUCCESS : LC_CALL_RESULT_MISSED;
    }
}

if (!function_exists('lc_call_ingest_log')) {
    /**
     * 콜업체 웹훅/조회로 받은 통화 1건 적재 + 조건 충족 시 전환 생성.
     *
     * @param array $payload {
     *   providerCallId, virtualNumber, caller, callee,
     *   startedAt, duration, result, recordingUrl, recordingId
     * }
     * @return array{ok:bool,message:string,clogId?:int,cvCode?:string,duplicate?:bool}
     */
    function lc_call_ingest_log(array $payload)
    {
        if (!lc_db_installed()) {
            return array('ok' => false, 'message' => 'DB가 설치되지 않았습니다.');
        }

        $provider_call_id = trim((string) ($payload['providerCallId'] ?? $payload['callId'] ?? ''));
        $virtual_number = lc_call_number_normalize($payload['virtualNumber'] ?? $payload['calledNumber'] ?? $payload['did'] ?? '');
        $caller = lc_call_number_normalize($payload['caller'] ?? $payload['from'] ?? $payload['callerNumber'] ?? '');
        $callee = lc_call_number_normalize($payload['callee'] ?? $payload['to'] ?? '');
        $duration = (int) ($payload['duration'] ?? $payload['durationSec'] ?? 0);
        $result = lc_call_normalize_result($payload['result'] ?? $payload['status'] ?? '', $duration);
        $recording_url = trim((string) ($payload['recordingUrl'] ?? $payload['recordUrl'] ?? ''));
        $recording_id = trim((string) ($payload['recordingId'] ?? $payload['recordId'] ?? ''));

        $started_at = '';
        $raw_started = (string) ($payload['startedAt'] ?? $payload['startTime'] ?? $payload['calledAt'] ?? '');
        if ($raw_started !== '') {
            $ts = strtotime($raw_started);
            if ($ts !== false) {
                $started_at = date('Y-m-d H:i:s', $ts);
            }
        }
        if ($started_at === '') {
            $started_at = date('Y-m-d H:i:s');
        }

        if ($virtual_number === '') {
            return array('ok' => false, 'message' => '가상번호(virtualNumber)가 필요합니다.');
        }

        $clog_table = lc_table('call_logs');

        // 중복 통화 방지 (provider call id)
        if ($provider_call_id !== '') {
            $exists = lc_sql_fetch(" SELECT clog_id FROM `{$clog_table}` WHERE clog_provider_call_id = '" . lc_sql_escape($provider_call_id) . "' LIMIT 1 ");
            if ($exists) {
                return array('ok' => true, 'message' => '이미 수신된 통화입니다.', 'clogId' => (int) $exists['clog_id'], 'duplicate' => true);
            }
        } else {
            // provider call id 미제공 시 UNIQUE 충돌 방지용 합성 키 생성
            $provider_call_id = 'auto-' . date('YmdHis') . '-' . substr(md5(uniqid('', true) . $virtual_number . $caller . $started_at), 0, 12);
        }

        $assignment = lc_call_assignment_by_number($virtual_number);
        $pt_id = $assignment ? (int) $assignment['pt_id'] : 0;
        $cp_id = $assignment ? (int) $assignment['cp_id'] : 0;
        $mt_id = $assignment ? (int) $assignment['mt_id'] : 0;
        $cn_id = $assignment ? (int) $assignment['cn_id'] : 0;
        $car_id = $assignment ? (int) $assignment['car_id'] : 0;

        lc_sql_query(" INSERT INTO `{$clog_table}` SET
            clog_provider_call_id = '" . lc_sql_escape($provider_call_id) . "',
            cn_id = '{$cn_id}',
            car_id = '{$car_id}',
            pt_id = '{$pt_id}',
            cp_id = '{$cp_id}',
            mt_id = '{$mt_id}',
            clog_virtual_number = '" . lc_sql_escape($virtual_number) . "',
            clog_caller = '" . lc_sql_escape($caller) . "',
            clog_callee = '" . lc_sql_escape($callee) . "',
            clog_started_at = '" . lc_sql_escape($started_at) . "',
            clog_duration = '{$duration}',
            clog_result = '" . lc_sql_escape($result) . "',
            clog_recording_url = '" . lc_sql_escape($recording_url) . "',
            clog_recording_id = '" . lc_sql_escape($recording_id) . "',
            cv_id = '0',
            clog_created_at = NOW() ", false);

        $clog_id = (int) lc_sql_insert_id();

        // INSERT 실패(동시성/UNIQUE 충돌) 방어: 기존 로그 재조회
        if ($clog_id <= 0) {
            $again = lc_sql_fetch(" SELECT clog_id FROM `{$clog_table}` WHERE clog_provider_call_id = '" . lc_sql_escape($provider_call_id) . "' LIMIT 1 ");
            if ($again) {
                return array('ok' => true, 'message' => '이미 수신된 통화입니다.', 'clogId' => (int) $again['clog_id'], 'duplicate' => true);
            }

            return array('ok' => false, 'message' => '통화 기록 저장에 실패했습니다.');
        }

        $out = array('ok' => true, 'message' => '통화가 기록되었습니다.', 'clogId' => $clog_id);

        // 배정 없음 → 미매칭 로그만 남김 (관리자 확인용)
        if (!$assignment) {
            $out['message'] = '배정되지 않은 가상번호 통화입니다. (미매칭)';

            return $out;
        }

        // 전환 생성 조건 판정
        $create = lc_call_should_create_conversion($cp_id, $result, $duration);
        if (!$create['create']) {
            $out['message'] = '통화 기록됨 (전환 생성 제외: ' . $create['reason'] . ')';

            return $out;
        }

        $conv = lc_call_conversion_create(array(
            'clog_id'   => $clog_id,
            'pt_id'     => $pt_id,
            'cp_id'     => $cp_id,
            'caller'    => $caller,
            'duration'  => $duration,
            'result'    => $result,
            'started_at' => $started_at,
            'price'     => $create['price'],
        ));

        if ($conv['ok'] && !empty($conv['cvId'])) {
            lc_sql_query(" UPDATE `{$clog_table}` SET cv_id = '" . (int) $conv['cvId'] . "' WHERE clog_id = '{$clog_id}' ", false);
            $out['cvCode'] = $conv['cvCode'] ?? '';
            $out['message'] = '통화 기록 및 콜DB 전환이 생성되었습니다.';
        } else {
            $out['message'] = '통화 기록됨 (전환 생성 실패: ' . ($conv['message'] ?? '') . ')';
        }

        return $out;
    }
}

if (!function_exists('lc_call_should_create_conversion')) {
    /**
     * @return array{create:bool,reason:string,price:int}
     */
    function lc_call_should_create_conversion($cp_id, $result, $duration)
    {
        $settings = lc_call_settings_get((int) $cp_id);

        if (empty($settings['cs_admin_enabled'])) {
            return array('create' => false, 'reason' => '관리자 콜설정 비활성', 'price' => 0);
        }
        if (empty($settings['cs_enabled'])) {
            return array('create' => false, 'reason' => '광고주 콜디비 수신 OFF', 'price' => 0);
        }

        $min = (int) ($settings['cs_min_duration'] ?? 0);
        $create_on_missed = lc_settings_get_bool('callCreateOnMissed', false);

        if ($result === LC_CALL_RESULT_SUCCESS) {
            if ($min > 0 && (int) $duration < $min) {
                return array('create' => false, 'reason' => '최소 통화시간 미달(' . $duration . 's/' . $min . 's)', 'price' => 0);
            }
        } elseif ($result === LC_CALL_RESULT_MISSED) {
            if (!$create_on_missed) {
                return array('create' => false, 'reason' => '부재중 제외', 'price' => 0);
            }
        } else {
            return array('create' => false, 'reason' => '통화실패/통화중', 'price' => 0);
        }

        // 단가: 콜설정 cs_price > 캠페인 cp_price > 전역 callDefaultPrice
        $price = (int) ($settings['cs_price'] ?? 0);
        if ($price <= 0) {
            $cp_table = lc_table('campaigns');
            $campaign = lc_sql_fetch(" SELECT cp_price FROM `{$cp_table}` WHERE cp_id = '" . (int) $cp_id . "' LIMIT 1 ");
            $price = $campaign ? (int) $campaign['cp_price'] : 0;
        }
        if ($price <= 0) {
            $price = (int) lc_settings_get_int('callDefaultPrice', 0);
        }

        return array('create' => true, 'reason' => '', 'price' => $price);
    }
}

if (!function_exists('lc_call_conversion_create')) {
    /**
     * 콜 통화 기반 CPA 전환 생성 (cv_source = call).
     */
    function lc_call_conversion_create(array $payload)
    {
        if (!lc_db_installed()) {
            return array('ok' => false, 'message' => 'DB가 설치되지 않았습니다.');
        }

        $cp_id = (int) ($payload['cp_id'] ?? 0);
        $pt_id = (int) ($payload['pt_id'] ?? 0);
        if ($cp_id <= 0) {
            return array('ok' => false, 'message' => '캠페인 정보가 없습니다.');
        }

        $caller = (string) ($payload['caller'] ?? '');
        $duration = (int) ($payload['duration'] ?? 0);
        $result = (string) ($payload['result'] ?? '');
        $price = (int) ($payload['price'] ?? 0);
        $clog_id = (int) ($payload['clog_id'] ?? 0);
        $started_at = (string) ($payload['started_at'] ?? date('Y-m-d H:i:s'));

        $cv_code = lc_conversion_generate_code();
        $table = lc_table('conversions');
        $name = $caller !== '' ? lc_conversion_mask_phone($caller) : '콜인입';
        $mm = floor($duration / 60);
        $ss = $duration % 60;
        $inquiry = '콜디비 통화 ' . sprintf('%d분 %d초', $mm, $ss) . ' (' . $result . ')';
        $campaign = function_exists('lc_campaign_get_by_id') ? lc_campaign_get_by_id($cp_id) : null;
        $partner_price = is_array($campaign) ? lc_campaign_resolve_partner_price($campaign) : $price;

        lc_sql_query(" INSERT INTO `{$table}` SET
            cv_code = '" . lc_sql_escape($cv_code) . "',
            pt_id = '{$pt_id}',
            cp_id = '{$cp_id}',
            lk_id = '0',
            cv_name = '" . lc_sql_escape($name) . "',
            cv_phone = '" . lc_sql_escape($caller) . "',
            cv_email = '',
            cv_region = '',
            cv_inquiry = '" . lc_sql_escape($inquiry) . "',
            cv_status = '" . lc_sql_escape(LC_STATUS_PENDING) . "',
            cv_price = '{$price}',
            cv_partner_price = '" . (int) $partner_price . "',
            cv_channel = '콜디비',
            cv_sub_id = '',
            cv_comment = '',
            cv_source = '" . LC_SOURCE_CALL . "',
            cv_call_id = '{$clog_id}',
            cv_call_duration = '{$duration}',
            cv_call_result = '" . lc_sql_escape($result) . "',
            cv_created_at = '" . lc_sql_escape($started_at) . "',
            cv_updated_at = NOW() ", false);

        $cv_id = (int) lc_sql_insert_id();
        if ($cv_id <= 0) {
            return array('ok' => false, 'message' => '콜DB 전환 생성 실패');
        }

        if (function_exists('lc_notification_emit_conversion')) {
            $meta = function_exists('lc_conversion_with_meta') ? lc_conversion_with_meta($cv_id) : lc_conversion_get_by_id($cv_id);
            if (is_array($meta)) {
                lc_notification_emit_conversion($meta, 'received');
            }
        }

        return array('ok' => true, 'message' => '콜DB 전환 생성됨', 'cvId' => $cv_id, 'cvCode' => $cv_code);
    }
}

/* ───────────────────────────── 통화로그 조회 ───────────────────────────── */

if (!function_exists('lc_call_logs_list')) {
    function lc_call_logs_list(array $filters = array())
    {
        if (!lc_db_installed() || !lc_db_table_exists(lc_table('call_logs'))) {
            return array();
        }

        $clog = lc_table('call_logs');
        $cp = lc_table('campaigns');
        $pt = lc_table('partners');

        $where = ' 1=1 ';
        if (!empty($filters['pt_id'])) {
            $where .= " AND l.pt_id = '" . (int) $filters['pt_id'] . "' ";
        }
        if (!empty($filters['cp_id'])) {
            $where .= " AND l.cp_id = '" . (int) $filters['cp_id'] . "' ";
        }
        if (!empty($filters['mt_id'])) {
            $where .= " AND l.mt_id = '" . (int) $filters['mt_id'] . "' ";
        }
        if (!empty($filters['result'])) {
            $where .= " AND l.clog_result = '" . lc_sql_escape($filters['result']) . "' ";
        }
        if (isset($filters['unmatched']) && $filters['unmatched']) {
            $where .= " AND l.pt_id = '0' ";
        }

        $limit = isset($filters['limit']) ? (int) $filters['limit'] : 200;

        $rows = array();
        $sql = " SELECT l.*, c.cp_name, p.pt_code
            FROM `{$clog}` l
            LEFT JOIN `{$cp}` c ON c.cp_id = l.cp_id
            LEFT JOIN `{$pt}` p ON p.pt_id = l.pt_id
            WHERE {$where}
            ORDER BY l.clog_id DESC LIMIT {$limit} ";
        $result = lc_sql_query($sql, false);
        if ($result) {
            while ($row = sql_fetch_array($result)) {
                $rows[] = $row;
            }
        }

        return $rows;
    }
}

if (!function_exists('lc_call_log_get')) {
    function lc_call_log_get($clog_id)
    {
        if (!lc_db_installed()) {
            return null;
        }
        $table = lc_table('call_logs');

        return lc_sql_fetch(" SELECT * FROM `{$table}` WHERE clog_id = '" . (int) $clog_id . "' LIMIT 1 ");
    }
}

if (!function_exists('lc_call_recording_url')) {
    /**
     * 녹취 URL (관리자 전용). 저장된 URL 없으면 콜업체 API로 조회.
     */
    function lc_call_recording_url($clog_id)
    {
        $log = lc_call_log_get($clog_id);
        if (!$log) {
            return array('ok' => false, 'message' => '통화 기록을 찾을 수 없습니다.');
        }
        if (!empty($log['clog_recording_url'])) {
            return array('ok' => true, 'url' => (string) $log['clog_recording_url']);
        }
        if (empty($log['clog_recording_id'])) {
            return array('ok' => false, 'message' => '녹취 파일이 없습니다.');
        }

        $res = lc_call_api_request('GET', 'recordings/' . rawurlencode((string) $log['clog_recording_id']));
        if (!$res['ok']) {
            return array('ok' => false, 'message' => $res['message']);
        }
        $url = (string) ($res['data']['url'] ?? $res['data']['recordingUrl'] ?? '');
        if ($url === '') {
            return array('ok' => false, 'message' => '녹취 URL을 가져오지 못했습니다.');
        }

        $table = lc_table('call_logs');
        lc_sql_query(" UPDATE `{$table}` SET clog_recording_url = '" . lc_sql_escape($url) . "' WHERE clog_id = '" . (int) $clog_id . "' ", false);

        return array('ok' => true, 'url' => $url);
    }
}

/* ───────────────────────────── to_api ───────────────────────────── */

if (!function_exists('lc_call_number_to_api')) {
    function lc_call_number_to_api(array $row)
    {
        return array(
            'cnId'       => (int) $row['cn_id'],
            'number'     => (string) $row['cn_number'],
            'provider'   => (string) $row['cn_provider'],
            'status'     => (string) $row['cn_status'],
            'memo'       => (string) $row['cn_memo'],
            'createdAt'  => date('Y.m.d', strtotime($row['cn_created_at'])),
        );
    }
}

if (!function_exists('lc_call_request_to_api')) {
    function lc_call_request_to_api(array $row)
    {
        return array(
            'carId'        => (int) $row['car_id'],
            'ptId'         => (int) $row['pt_id'],
            'partner'      => (string) ($row['pt_code'] ?? ($row['pt_name'] ?? '')),
            'cpId'         => (int) $row['cp_id'],
            'campaign'     => (string) ($row['cp_name'] ?? ''),
            'status'       => (string) $row['car_status'],
            'virtualNumber' => (string) $row['car_virtual_number'],
            'requestMemo'  => (string) $row['car_request_memo'],
            'adminMemo'    => (string) $row['car_admin_memo'],
            'createdAt'    => date('Y.m.d H:i', strtotime($row['car_created_at'])),
            'processedAt'  => !empty($row['car_processed_at']) ? date('Y.m.d H:i', strtotime($row['car_processed_at'])) : '',
        );
    }
}

if (!function_exists('lc_call_log_to_api')) {
    /**
     * @param bool $with_recording 관리자만 true (녹취 노출)
     */
    function lc_call_log_to_api(array $row, $with_recording = false, $mask = true)
    {
        $caller = (string) $row['clog_caller'];
        $out = array(
            'clogId'        => (int) $row['clog_id'],
            'virtualNumber' => (string) $row['clog_virtual_number'],
            'caller'        => $mask ? lc_conversion_mask_phone($caller) : $caller,
            'campaign'      => (string) ($row['cp_name'] ?? ''),
            'partner'       => (string) ($row['pt_code'] ?? '-'),
            'startedAt'     => !empty($row['clog_started_at']) ? date('Y.m.d H:i', strtotime($row['clog_started_at'])) : '',
            'duration'      => (int) $row['clog_duration'],
            'result'        => (string) $row['clog_result'],
            'cvId'          => (int) $row['cv_id'],
            'hasRecording'  => !empty($row['clog_recording_url']) || !empty($row['clog_recording_id']),
        );
        if ($with_recording) {
            $out['recordingUrl'] = (string) $row['clog_recording_url'];
        }

        return $out;
    }
}
