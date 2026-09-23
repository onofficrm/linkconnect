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
