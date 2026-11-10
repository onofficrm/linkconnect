<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

if (!function_exists('lc_dotrak_campaign_definition')) {
    /**
     * 도트락 두피문신(SMP) CPA 광고상품 정의 (CPA-00015).
     * 관리자에서 이미 등록된 상품이 있으면 ensure가 랜딩 URL만 연결한다.
     *
     * @return array<string,mixed>
     */
    function lc_dotrak_campaign_definition()
    {
        return array(
            'code'               => 'CPA-00015',
            'alias_codes'        => array('CPA-DOTRAK'),
            'title'              => '도트락 두피문신',
            'category'           => '병원',
            'price'              => 15000,
            'merchant_price'     => 25000,
            'approval_rate'      => '70%',
            'avg_time'           => '1.5일',
            'allowed_channels'   => '블로그, 카페, 지식iN, SNS',
            'forbidden_channels' => '허위광고, 브랜드 사칭, 스팸문자',
            'description'        => '무제한 두피문신(SMP) 상담 DB. dotrak 랜딩 연동 (도트락SMP).',
            'badge'              => '신규',
            'recommended'        => true,
            'status'             => 'paused',
            'name_needles'       => array('도트락', '두피문신'),
        );
    }
}

if (!function_exists('lc_dotrak_landing_path')) {
    function lc_dotrak_landing_path()
    {
        return '/merchant/dotrak/';
    }
}

if (!function_exists('lc_dotrak_landing_url')) {
    function lc_dotrak_landing_url()
    {
        $path = lc_dotrak_landing_path();
        if (defined('G5_URL') && G5_URL !== '') {
            return rtrim(G5_URL, '/') . $path;
        }

        return $path;
    }
}

if (!function_exists('lc_dotrak_resolve_merchant_id')) {
    /**
     * 도트락/위픽그로스 광고주 mt_id 조회.
     *
     * @param array{advertiser_mb_id?:string,mt_id?:int} $options
     */
    function lc_dotrak_resolve_merchant_id(array $options = array())
    {
        $mt_id = isset($options['mt_id']) ? (int) $options['mt_id'] : 0;
        if ($mt_id > 0) {
            return $mt_id;
        }

        $advertiser_mb = isset($options['advertiser_mb_id']) ? trim((string) $options['advertiser_mb_id']) : '';
        if ($advertiser_mb !== '' && function_exists('lc_get_merchant_by_mb_id')) {
            $merchant = lc_get_merchant_by_mb_id($advertiser_mb);
            $mt_id = is_array($merchant) ? (int) $merchant['mt_id'] : 0;
            if ($mt_id > 0) {
                return $mt_id;
            }
        }

        if (!function_exists('lc_sql_fetch')) {
            return 0;
        }

        $merchants = lc_table('merchants');
        $row = lc_sql_fetch(" SELECT mt_id FROM `{$merchants}`
            WHERE mt_company LIKE '%도트락%'
               OR mt_company LIKE '%위픽그로스%'
               OR mt_name LIKE '%도트락%'
               OR mt_name LIKE '%위픽%'
            ORDER BY mt_id ASC LIMIT 1 ", false);
        if ($row) {
            return (int) $row['mt_id'];
        }

        return 0;
    }
}

if (!function_exists('lc_campaign_ensure_dotrak')) {
    /**
     * 도트락 CPA 상품을 생성/갱신한다. 기존 CPA-00015가 있으면 랜딩 URL을 연결한다.
     * 광고주·단가·상태·문구는 이미 등록된 행이 있으면 유지하고, 랜딩 URL만 비어 있을 때 채운다.
     *
     * @param array{advertiser_mb_id?:string,mt_id?:int,activate?:bool,force?:bool} $options
     * @return array{ok:bool,message:string,cpId?:int,created?:bool,updated?:bool,mtId?:int}
     */
    function lc_campaign_ensure_dotrak(array $options = array())
    {
        if (!lc_db_installed()) {
            return array('ok' => false, 'message' => 'DB가 설치되지 않았습니다.');
        }

        $def = lc_dotrak_campaign_definition();
        $landing = lc_dotrak_landing_url();
        $table = lc_table('campaigns');
        $mt_id = lc_dotrak_resolve_merchant_id($options);

        $status = (string) $def['status'];
        if ($mt_id > 0 && !empty($options['activate'])) {
            $status = LC_STATUS_ACTIVE;
        }

        $codes = array_merge(array((string) $def['code']), (array) $def['alias_codes']);
        $keep = null;
        foreach ($codes as $code) {
            $code_esc = lc_sql_escape($code);
            $row = lc_sql_fetch(" SELECT * FROM `{$table}` WHERE cp_code = '{$code_esc}' LIMIT 1 ", false);
            if ($row) {
                $keep = $row;
                break;
            }
        }

        // 코드로 못 찾으면 상품명으로 기존 관리자 등록 행을 찾는다.
        if (!$keep) {
            foreach ((array) $def['name_needles'] as $needle) {
                $needle = trim((string) $needle);
                if ($needle === '') {
                    continue;
                }
                $like = lc_sql_escape('%' . $needle . '%');
                $row = lc_sql_fetch(" SELECT * FROM `{$table}` WHERE cp_name LIKE '{$like}' ORDER BY cp_id ASC LIMIT 1 ", false);
                if ($row) {
                    $keep = $row;
                    break;
                }
            }
        }

        $primary_code = (string) $def['code'];
        $code_esc = lc_sql_escape($primary_code);

        if ($keep) {
            $cp_id = (int) $keep['cp_id'];
            $next_mt = $mt_id > 0 ? $mt_id : (int) $keep['mt_id'];
            $next_status = (string) $keep['cp_status'];
            if (!empty($options['activate']) && $next_mt > 0) {
                $next_status = LC_STATUS_ACTIVE;
            }

            $current_landing = trim((string) ($keep['cp_landing_url'] ?? ''));
            $landing_changed = ($current_landing === '' || !empty($options['force']));
            if (!$landing_changed && $next_mt === (int) $keep['mt_id'] && $next_status === (string) $keep['cp_status']) {
                return array(
                    'ok'      => true,
                    'message' => '도트락 랜딩 URL이 이미 설정되어 있습니다.',
                    'cpId'    => $cp_id,
                    'created' => false,
                    'updated' => false,
                    'mtId'    => $next_mt,
                );
            }

            $sets = array(
                "mt_id = '{$next_mt}'",
                "cp_code = '{$code_esc}'",
                "cp_status = '" . lc_sql_escape($next_status) . "'",
                'cp_updated_at = NOW()',
            );
            if ($landing_changed) {
                $sets[] = "cp_landing_url = '" . lc_sql_escape($landing) . "'";
                $sets[] = "cp_tracking_base_url = ''";
            }

            lc_sql_query(" UPDATE `{$table}` SET " . implode(', ', $sets) . " WHERE cp_id = '{$cp_id}' ", false);

            return array(
                'ok'      => true,
                'message' => $landing_changed
                    ? '도트락 CPA 캠페인(CPA-00015)에 랜딩 URL을 연결했습니다.'
                    : '도트락 CPA 캠페인을 갱신했습니다.',
                'cpId'    => $cp_id,
                'created' => false,
                'updated' => true,
                'mtId'    => $next_mt,
            );
        }

        lc_sql_query(" INSERT INTO `{$table}` SET
            mt_id = '{$mt_id}',
            cp_code = '{$code_esc}',
            cp_name = '" . lc_sql_escape((string) $def['title']) . "',
            cp_category = '" . lc_sql_escape((string) $def['category']) . "',
            cp_type = 'cpa',
            cp_price = '" . (int) $def['price'] . "',
            cp_merchant_price = '" . (int) $def['merchant_price'] . "',
            cp_approval_rate = '" . lc_sql_escape((string) $def['approval_rate']) . "',
            cp_avg_time = '" . lc_sql_escape((string) $def['avg_time']) . "',
            cp_allowed_channels = '" . lc_sql_escape((string) $def['allowed_channels']) . "',
            cp_forbidden_channels = '" . lc_sql_escape((string) $def['forbidden_channels']) . "',
            cp_description = '" . lc_sql_escape((string) $def['description']) . "',
            cp_landing_url = '" . lc_sql_escape($landing) . "',
            cp_tracking_base_url = '',
            cp_status = '" . lc_sql_escape($status) . "',
            cp_badge = '" . lc_sql_escape((string) $def['badge']) . "',
            cp_recommended = '" . (!empty($def['recommended']) ? 1 : 0) . "',
            cp_sort = 0,
            cp_created_at = NOW(),
            cp_updated_at = NOW() ", false);

        $cp_id = 0;
        if (function_exists('sql_insert_id')) {
            $cp_id = (int) sql_insert_id();
        }
        if ($cp_id <= 0) {
            $row = lc_sql_fetch(" SELECT cp_id FROM `{$table}` WHERE cp_code = '{$code_esc}' LIMIT 1 ", false);
            $cp_id = $row ? (int) $row['cp_id'] : 0;
        }

        if ($cp_id <= 0) {
            return array('ok' => false, 'message' => '도트락 CPA 캠페인 생성에 실패했습니다.');
        }

        return array(
            'ok'      => true,
            'message' => $mt_id > 0
                ? '도트락 CPA 캠페인(CPA-00015)을 생성·연결했습니다.'
                : '도트락 CPA 캠페인을 광고주 미연결(일시중지) 상태로 등록했습니다.',
            'cpId'    => $cp_id,
            'created' => true,
            'updated' => true,
            'mtId'    => $mt_id,
        );
    }
}

if (!function_exists('lc_dotrak_resolve_campaign_row')) {
    /**
     * 도트락 캠페인 행 조회 (코드 → 상품명).
     *
     * @return array<string,mixed>|null
     */
    function lc_dotrak_resolve_campaign_row()
    {
        if (!lc_db_installed() || !function_exists('lc_sql_fetch')) {
            return null;
        }

        $def = lc_dotrak_campaign_definition();
        $table = lc_table('campaigns');
        $codes = array_merge(array((string) $def['code']), (array) $def['alias_codes']);
        foreach ($codes as $code) {
            $code = trim((string) $code);
            if ($code === '') {
                continue;
            }
            $row = lc_sql_fetch(
                " SELECT * FROM `{$table}` WHERE cp_code = '" . lc_sql_escape($code) . "' LIMIT 1 ",
                false
            );
            if ($row) {
                return $row;
            }
        }

        foreach ((array) $def['name_needles'] as $needle) {
            $needle = trim((string) $needle);
            if ($needle === '') {
                continue;
            }
            $row = lc_sql_fetch(
                " SELECT * FROM `{$table}` WHERE cp_name LIKE '" . lc_sql_escape('%' . $needle . '%') . "' ORDER BY cp_id ASC LIMIT 1 ",
                false
            );
            if ($row) {
                return $row;
            }
        }

        return null;
    }
}

if (!function_exists('lc_dotrak_disable_call_db')) {
    /**
     * 도트락 두피문신 콜디비 설정 해제.
     * - 관리자/광고주 콜 활성화 off
     * - 착신번호 비움
     * - 해당 상품 가상번호 배정 회수·대기 신청 반려
     *
     * @return array{ok:bool,message:string,cpId?:int,settingsCleared?:bool,revoked?:int,rejected?:int}
     */
    function lc_dotrak_disable_call_db()
    {
        if (!lc_db_installed()) {
            return array('ok' => false, 'message' => 'DB가 설치되지 않았습니다.');
        }

        $campaign = lc_dotrak_resolve_campaign_row();
        if (!$campaign) {
            return array('ok' => false, 'message' => '도트락 캠페인을 찾을 수 없습니다.');
        }

        $cp_id = (int) ($campaign['cp_id'] ?? 0);
        if ($cp_id <= 0) {
            return array('ok' => false, 'message' => '도트락 캠페인 ID가 올바르지 않습니다.');
        }

        $settings_cleared = false;
        if (function_exists('lc_call_settings_save')) {
            $save = lc_call_settings_save($cp_id, array(
                'adminEnabled' => false,
                'enabled'      => false,
                'forward1'     => '',
                'forward2'     => '',
                'memo'         => '콜디비 설정 해제',
            ), 'admin');
            if (empty($save['ok'])) {
                return array(
                    'ok'      => false,
                    'message' => (string) ($save['message'] ?? '콜 설정 해제에 실패했습니다.'),
                    'cpId'    => $cp_id,
                );
            }
            $settings_cleared = true;
        } elseif (lc_db_table_exists(lc_table('call_settings'))) {
            $cs = lc_table('call_settings');
            lc_sql_query(
                " UPDATE `{$cs}` SET
                    cs_admin_enabled = 0,
                    cs_enabled = 0,
                    cs_forward1 = '',
                    cs_forward2 = '',
                    cs_memo = '" . lc_sql_escape('콜디비 설정 해제') . "',
                    cs_updated_at = NOW()
                  WHERE cp_id = '{$cp_id}' ",
                false
            );
            $settings_cleared = true;
        }

        $revoked = 0;
        $rejected = 0;
        if (lc_db_table_exists(lc_table('call_requests'))) {
            $car = lc_table('call_requests');
            $result = lc_sql_query(
                " SELECT car_id, car_status FROM `{$car}`
                  WHERE cp_id = '{$cp_id}'
                    AND car_status IN ('" . LC_CALL_REQ_PENDING . "','" . LC_CALL_REQ_ASSIGNED . "')
                  ORDER BY car_id ASC ",
                false
            );
            if ($result) {
                while ($row = sql_fetch_array($result)) {
                    $car_id = (int) ($row['car_id'] ?? 0);
                    if ($car_id <= 0) {
                        continue;
                    }
                    $status = (string) ($row['car_status'] ?? '');
                    if ($status === LC_CALL_REQ_ASSIGNED && function_exists('lc_call_request_revoke')) {
                        $rel = lc_call_request_revoke($car_id, '도트락 콜디비 설정 해제로 회수');
                        if (!empty($rel['ok'])) {
                            $revoked++;
                        }
                    } elseif ($status === LC_CALL_REQ_PENDING && function_exists('lc_call_request_reject')) {
                        $rej = lc_call_request_reject($car_id, '도트락 콜디비 설정 해제로 반려');
                        if (!empty($rej['ok'])) {
                            $rejected++;
                        }
                    }
                }
            }
        }

        if (function_exists('lc_runtime_cache_clear')) {
            lc_runtime_cache_clear('pub_campaigns');
        }

        return array(
            'ok'              => true,
            'message'         => '도트락 두피문신 콜디비 설정을 해제했습니다.',
            'cpId'            => $cp_id,
            'cpCode'          => (string) ($campaign['cp_code'] ?? ''),
            'cpName'          => (string) ($campaign['cp_name'] ?? ''),
            'settingsCleared' => $settings_cleared,
            'revoked'         => $revoked,
            'rejected'        => $rejected,
        );
    }
}
