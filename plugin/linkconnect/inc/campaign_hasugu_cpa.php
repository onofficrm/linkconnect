<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

if (!function_exists('lc_hasugu_cpa_campaign_definition')) {
    /**
     * 하수구/배관 CPA 광고상품 정의 (광고주 연결 전 준비용).
     *
     * @return array<string,mixed>
     */
    function lc_hasugu_cpa_campaign_definition()
    {
        return array(
            'code'               => 'CPA-HASUGU',
            'title'              => '하수구·배관 상담 DB',
            'category'           => '생활서비스',
            'price'              => 25000,
            'approval_rate'      => '70%',
            'avg_time'           => '1.5일',
            'allowed_channels'   => '블로그, 카페, 지식iN, SNS',
            'forbidden_channels' => '허위광고, 브랜드 사칭, 스팸문자',
            'description'        => '하수구막힘·싱크대막힘·변기막힘·악취·역류 상담 DB. hasugu_cpa 랜딩 연동.',
            'badge'              => '신규',
            'recommended'        => true,
            'status'             => LC_STATUS_ACTIVE,
        );
    }
}

if (!function_exists('lc_hasugu_cpa_landing_path')) {
    function lc_hasugu_cpa_landing_path()
    {
        return '/merchant/hasugu_cpa/';
    }
}

if (!function_exists('lc_hasugu_cpa_landing_url')) {
    function lc_hasugu_cpa_landing_url()
    {
        $path = lc_hasugu_cpa_landing_path();
        if (defined('G5_URL') && G5_URL !== '') {
            return rtrim(G5_URL, '/') . $path;
        }

        return $path;
    }
}

if (!function_exists('lc_campaign_ensure_hasugu_cpa')) {
    /**
     * 하수구 CPA 상품을 생성/갱신한다. 광고주(mt_id) 없으면 생성하지 않음.
     *
     * @param array{advertiser_mb_id?:string,mt_id?:int} $options
     * @return array{ok:bool,message:string,cpId?:int,created?:bool}
     */
    function lc_campaign_ensure_hasugu_cpa(array $options = array())
    {
        if (!lc_db_installed()) {
            return array('ok' => false, 'message' => 'DB가 설치되지 않았습니다.');
        }

        $def = lc_hasugu_cpa_campaign_definition();
        $landing = lc_hasugu_cpa_landing_url();
        $tracking_base = defined('G5_URL') ? rtrim((string) G5_URL, '/') : '';
        $table = lc_table('campaigns');

        $mt_id = isset($options['mt_id']) ? (int) $options['mt_id'] : 0;
        if ($mt_id <= 0) {
            $advertiser_mb = isset($options['advertiser_mb_id']) ? trim((string) $options['advertiser_mb_id']) : '';
            if ($advertiser_mb !== '' && function_exists('lc_get_merchant_by_mb_id')) {
                $merchant = lc_get_merchant_by_mb_id($advertiser_mb);
                $mt_id = is_array($merchant) ? (int) $merchant['mt_id'] : 0;
            }
        }

        $code_esc = lc_sql_escape((string) $def['code']);
        $keep = lc_sql_fetch(" SELECT * FROM `{$table}` WHERE cp_code = '{$code_esc}' LIMIT 1 ");

        if ($keep) {
            $cp_id = (int) $keep['cp_id'];
            $next_mt = $mt_id > 0 ? $mt_id : (int) $keep['mt_id'];
            lc_sql_query(" UPDATE `{$table}` SET
                mt_id = '{$next_mt}',
                cp_code = '{$code_esc}',
                cp_name = '" . lc_sql_escape((string) $def['title']) . "',
                cp_category = '" . lc_sql_escape((string) $def['category']) . "',
                cp_type = 'cpa',
                cp_price = '" . (int) $def['price'] . "',
                cp_approval_rate = '" . lc_sql_escape((string) $def['approval_rate']) . "',
                cp_avg_time = '" . lc_sql_escape((string) $def['avg_time']) . "',
                cp_allowed_channels = '" . lc_sql_escape((string) $def['allowed_channels']) . "',
                cp_forbidden_channels = '" . lc_sql_escape((string) $def['forbidden_channels']) . "',
                cp_description = '" . lc_sql_escape((string) $def['description']) . "',
                cp_landing_url = '" . lc_sql_escape($landing) . "',
                cp_tracking_base_url = '" . lc_sql_escape($tracking_base) . "',
                cp_status = '" . lc_sql_escape((string) $def['status']) . "',
                cp_badge = '" . lc_sql_escape((string) $def['badge']) . "',
                cp_recommended = '" . (!empty($def['recommended']) ? 1 : 0) . "',
                cp_updated_at = NOW()
                WHERE cp_id = '{$cp_id}' ", false);

            return array(
                'ok'      => true,
                'message' => '하수구 CPA 캠페인을 갱신했습니다.',
                'cpId'    => $cp_id,
                'created' => false,
            );
        }

        if ($mt_id <= 0) {
            return array(
                'ok'      => false,
                'message' => '광고주(mt_id 또는 advertiser_mb_id)를 지정해 주세요. 랜딩(/merchant/hasugu_cpa/)은 이미 준비되어 있습니다.',
            );
        }

        if (!function_exists('lc_campaign_save')) {
            return array('ok' => false, 'message' => 'lc_campaign_save 를 사용할 수 없습니다.');
        }

        $saved = lc_campaign_save(array(
            'mt_id'               => $mt_id,
            'cp_code'             => $def['code'],
            'cp_name'             => $def['title'],
            'cp_category'         => $def['category'],
            'cp_type'             => 'cpa',
            'cp_price'            => $def['price'],
            'cp_approval_rate'    => $def['approval_rate'],
            'cp_avg_time'         => $def['avg_time'],
            'cp_allowed_channels' => $def['allowed_channels'],
            'cp_forbidden_channels' => $def['forbidden_channels'],
            'cp_description'      => $def['description'],
            'cp_landing_url'      => $landing,
            'cp_tracking_base_url'=> $tracking_base,
            'cp_status'           => $def['status'],
            'cp_badge'            => $def['badge'],
            'cp_recommended'      => !empty($def['recommended']) ? 1 : 0,
        ));

        if (empty($saved['ok'])) {
            return array('ok' => false, 'message' => (string) ($saved['message'] ?? '캠페인 생성 실패'));
        }

        return array(
            'ok'      => true,
            'message' => '하수구 CPA 캠페인을 생성했습니다.',
            'cpId'    => (int) ($saved['cpId'] ?? 0),
            'created' => true,
        );
    }
}
