<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

if (!function_exists('lc_modemo_campaign_definition')) {
    /**
     * 모두의철거 CPA 광고상품 정의 (ADV-0008).
     *
     * @return array<string,mixed>
     */
    function lc_modemo_campaign_definition()
    {
        return array(
            'code'               => 'CPA-MODEMO',
            'title'              => '철거·원상복구 상담 DB',
            'category'           => '생활서비스',
            'price'              => 30000,
            'merchant_price'     => 45000,
            'approval_rate'      => '70%',
            'avg_time'           => '1.5일',
            'allowed_channels'   => '블로그, 카페, 지식iN, SNS',
            'forbidden_channels' => '허위광고, 브랜드 사칭, 스팸문자',
            'description'        => '상가·주택 철거, 사무실 원상복구, 폐기물 처리 상담 DB. modemo 랜딩 연동.',
            'badge'              => '',
            'recommended'        => false,
            'status'             => 'ended',
        );
    }
}

if (!function_exists('lc_modemo_landing_path')) {
    function lc_modemo_landing_path()
    {
        return '/merchant/modemo/';
    }
}

if (!function_exists('lc_modemo_landing_url')) {
    function lc_modemo_landing_url()
    {
        $path = lc_modemo_landing_path();
        if (defined('G5_URL') && G5_URL !== '') {
            return rtrim(G5_URL, '/') . $path;
        }

        return $path;
    }
}

if (!function_exists('lc_campaign_ensure_modemo')) {
    /**
     * 모두의철거 CPA 상품을 생성/갱신한다.
     *
     * @param array{advertiser_mb_id?:string,mt_id?:int,activate?:bool} $options
     * @return array{ok:bool,message:string,cpId?:int,created?:bool}
     */
    function lc_campaign_ensure_modemo(array $options = array())
    {
        static $ran = false;
        if ($ran && empty($options['force'])) {
            return array('ok' => true, 'message' => '이미 반영했습니다.');
        }
        $ran = true;

        if (!lc_db_installed()) {
            return array('ok' => false, 'message' => 'DB가 설치되지 않았습니다.');
        }

        $def = lc_modemo_campaign_definition();
        $landing = lc_modemo_landing_url();
        // 독립도메인 미사용 — 파트너 홍보링크는 linkconnect.co.kr/r/… → /merchant/modemo/
        $tracking_base = '';
        $table = lc_table('campaigns');
        $status = 'ended';

        $mt_id = isset($options['mt_id']) ? (int) $options['mt_id'] : 0;
        if ($mt_id <= 0) {
            $advertiser_mb = isset($options['advertiser_mb_id']) ? trim((string) $options['advertiser_mb_id']) : '';
            if ($advertiser_mb !== '' && function_exists('lc_get_merchant_by_mb_id')) {
                $merchant = lc_get_merchant_by_mb_id($advertiser_mb);
                $mt_id = is_array($merchant) ? (int) $merchant['mt_id'] : 0;
            }
        }

        // ADV-0008(모두의철거) 자동 연결 시도
        if ($mt_id <= 0 && function_exists('lc_sql_fetch')) {
            $merchants = lc_table('merchants');
            $adv = lc_sql_fetch(" SELECT mt_id FROM `{$merchants}` WHERE mt_code = 'ADV-0008' LIMIT 1 ");
            if ($adv) {
                $mt_id = (int) $adv['mt_id'];
            }
        }

        $code_esc = lc_sql_escape((string) $def['code']);
        $keep = lc_sql_fetch(" SELECT * FROM `{$table}` WHERE cp_code = '{$code_esc}' LIMIT 1 ");

        if ($keep) {
            $cp_id = (int) $keep['cp_id'];
            $next_mt = $mt_id > 0 ? $mt_id : (int) $keep['mt_id'];
            $already_ended = (string) ($keep['cp_status'] ?? '') === 'ended'
                && (int) ($keep['cp_recommended'] ?? 0) === 0;

            if (!$already_ended) {
                lc_sql_query(" UPDATE `{$table}` SET
                    mt_id = '{$next_mt}',
                    cp_code = '{$code_esc}',
                    cp_landing_url = '" . lc_sql_escape($landing) . "',
                    cp_tracking_base_url = '" . lc_sql_escape($tracking_base) . "',
                    cp_status = '" . lc_sql_escape($status) . "',
                    cp_recommended = '0',
                    cp_updated_at = NOW()
                    WHERE cp_id = '{$cp_id}' ", false);
            }

            $lk_table = lc_table('links');
            if (function_exists('lc_db_table_exists') && lc_db_table_exists($lk_table)) {
                lc_sql_query(" UPDATE `{$lk_table}` SET
                    lk_status = 'expired',
                    lk_updated_at = NOW()
                    WHERE cp_id = '{$cp_id}' AND lk_status = 'active' ", false);
            }

            if (function_exists('lc_campaign_promo_guide_table')
                && defined('LC_CPG_STATUS_HIDDEN')
                && defined('LC_CPG_STATUS_PUBLISHED')
            ) {
                $guides = lc_campaign_promo_guide_table();
                if (function_exists('lc_db_table_exists') && lc_db_table_exists($guides)) {
                    lc_sql_query(" UPDATE `{$guides}` SET
                        cpg_status = '" . lc_sql_escape(LC_CPG_STATUS_HIDDEN) . "',
                        cpg_updated_at = NOW()
                        WHERE cpg_cp_id = '{$cp_id}'
                          AND cpg_status = '" . lc_sql_escape(LC_CPG_STATUS_PUBLISHED) . "' ", false);
                }
            }

            return array(
                'ok'      => true,
                'message' => '모두의철거 CPA 캠페인을 계약종료로 반영했습니다.',
                'cpId'    => $cp_id,
                'created' => false,
                'trackingBaseUrl' => $tracking_base,
                'landingUrl' => $landing,
            );
        }

        return array(
            'ok'      => true,
            'message' => '모두의철거 캠페인이 없어 계약종료만 유지합니다.',
            'created' => false,
            'trackingBaseUrl' => $tracking_base,
            'landingUrl' => $landing,
        );
    }
}

if (!function_exists('lc_modemo_migrate_off_yevely')) {
    /**
     * yevely.kr 독립도메인 잔여 데이터 정리 → linkconnect 메인 도메인.
     *
     * @return array{ok:bool,message:string,campaignUpdated?:bool,shortlinksUpdated?:int,landingUrl?:string}
     */
    function lc_modemo_migrate_off_yevely()
    {
        if (!lc_db_installed()) {
            return array('ok' => false, 'message' => 'DB가 설치되지 않았습니다.');
        }

        $ensure = lc_campaign_ensure_modemo(array('activate' => false));
        if (empty($ensure['ok'])) {
            return array('ok' => false, 'message' => (string) ($ensure['message'] ?? '캠페인 갱신 실패'));
        }

        $main = defined('G5_URL') ? rtrim((string) G5_URL, '/') : 'https://linkconnect.co.kr';
        $landing = $main . lc_modemo_landing_path();
        $short_updated = 0;

        $table = lc_table('campaigns');
        $code_esc = lc_sql_escape('CPA-MODEMO');
        // 기존 yevely 값이 남아 있으면 강제 비움 + 랜딩 URL 보정
        lc_sql_query(
            " UPDATE `{$table}` SET
                cp_tracking_base_url = '',
                cp_landing_url = '" . lc_sql_escape($landing) . "',
                cp_updated_at = NOW()
              WHERE cp_code = '{$code_esc}' ",
            false
        );

        if (function_exists('lc_lp_shortlink_ensure_table') && lc_lp_shortlink_ensure_table()) {
            $sl = lc_table('lp_shortlinks');
            $links = lc_table('links');
            // MODEMO 캠페인 링크의 숏링크 타겟 yevely → 메인 도메인
            $result = lc_sql_query(
                " SELECT s.id, s.target_url, s.short_code
                  FROM `{$sl}` s
                  INNER JOIN `{$links}` lk
                    ON (s.product_url = CONCAT('lk:', lk.lk_id) OR s.merchant_code = CONCAT('cpa:', lk.lk_code))
                  INNER JOIN `{$table}` c ON c.cp_id = lk.cp_id
                  WHERE c.cp_code = 'CPA-MODEMO'
                    AND (s.target_url LIKE '%yevely.kr%' OR s.target_url LIKE '%yevely.jp%') ",
                false
            );
            if ($result) {
                while ($row = sql_fetch_array($result)) {
                    $target = (string) ($row['target_url'] ?? '');
                    $next = preg_replace('#https?://(?:www\.)?yevely\.(?:kr|jp)#i', $main, $target);
                    if (!is_string($next) || $next === '' || $next === $target) {
                        continue;
                    }
                    $hash = hash('sha256', $next);
                    lc_sql_query(
                        " UPDATE `{$sl}` SET
                            target_url = '" . lc_sql_escape($next) . "',
                            target_hash = '" . lc_sql_escape($hash) . "'
                          WHERE id = '" . (int) $row['id'] . "' ",
                        false
                    );
                    $short_updated++;
                }
            }
        }

        return array(
            'ok'                => true,
            'message'           => '모두의철거 독립도메인을 제거하고 메인 랜딩으로 전환했습니다.',
            'campaignUpdated'   => true,
            'shortlinksUpdated' => $short_updated,
            'landingUrl'        => $landing,
            'trackingBaseUrl'   => '',
        );
    }
}

if (function_exists('lc_campaign_ensure_modemo')) {
    lc_campaign_ensure_modemo();
}
