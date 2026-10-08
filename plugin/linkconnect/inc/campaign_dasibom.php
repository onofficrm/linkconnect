<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

if (!function_exists('lc_dasibom_campaign_definition')) {
    /**
     * 다시봄 개인회생/파산 CPA 광고상품.
     *
     * @return array<string,mixed>
     */
    function lc_dasibom_campaign_definition()
    {
        return array(
            'code'               => 'CPA-DASIBOM',
            'title'              => '다시봄 개인회생/파산 상담 DB',
            'category'           => '법률',
            'price'              => 30000,
            'approval_rate'      => '68%',
            'avg_time'           => '1.8일',
            'allowed_channels'   => '블로그, 카페, 지식iN, SNS',
            'forbidden_channels' => '허위광고, 브랜드 사칭, 스팸문자',
            'description'        => '다시봄 재정회복센터 개인회생·개인파산 무료 상담 DB. dasibom 랜딩 연동.',
            'badge'              => '추천',
            'recommended'        => true,
            'status'             => LC_STATUS_ACTIVE,
        );
    }
}

if (!function_exists('lc_dasibom_landing_path')) {
    function lc_dasibom_landing_path()
    {
        return '/merchant/dasibom/';
    }
}

if (!function_exists('lc_dasibom_landing_url')) {
    function lc_dasibom_landing_url()
    {
        $path = lc_dasibom_landing_path();
        if (defined('G5_URL') && G5_URL !== '') {
            return rtrim(G5_URL, '/') . $path;
        }

        return $path;
    }
}

if (!function_exists('lc_campaign_ensure_dasibom')) {
    /**
     * 다시봄 CPA 상품을 생성/갱신한다. 다른 캠페인은 종료하지 않음.
     *
     * @param array{advertiser_mb_id?:string,mt_id?:int} $options
     * @return array{ok:bool,message:string,cpId?:int,created?:bool}
     */
    function lc_campaign_ensure_dasibom(array $options = array())
    {
        if (!lc_db_installed()) {
            return array('ok' => false, 'message' => 'DB가 설치되지 않았습니다.');
        }

        $def = lc_dasibom_campaign_definition();
        $landing = lc_dasibom_landing_url();
        // 독립도메인 미사용 — 메인 linkconnect.co.kr/merchant/dasibom/
        $tracking_base = '';
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
                cp_landing_url = '" . lc_sql_escape($landing) . "',
                cp_tracking_base_url = '" . lc_sql_escape($tracking_base) . "',
                cp_updated_at = NOW()
                WHERE cp_id = '{$cp_id}' ", false);

            return array(
                'ok'      => true,
                'message' => '다시봄 캠페인을 갱신했습니다.',
                'cpId'    => $cp_id,
                'created' => false,
            );
        }

        if ($mt_id <= 0) {
            return array(
                'ok'      => false,
                'message' => '광고주(mt_id 또는 advertiser_mb_id)를 지정해 주세요.',
            );
        }

        if (!function_exists('lc_campaign_save')) {
            return array('ok' => false, 'message' => 'lc_campaign_save 를 사용할 수 없습니다.');
        }

        $saved = lc_campaign_save(array(
            'mtId'               => $mt_id,
            'name'               => (string) $def['title'],
            'category'           => (string) $def['category'],
            'type'               => 'cpa',
            'price'              => (int) $def['price'],
            'advertiserPrice'    => (int) $def['price'],
            'approvalRate'       => (string) $def['approval_rate'],
            'avgTime'            => (string) $def['avg_time'],
            'allowedChannels'    => (string) $def['allowed_channels'],
            'forbiddenChannels'  => (string) $def['forbidden_channels'],
            'description'        => (string) $def['description'],
            'landingUrl'         => $landing,
            'trackingBaseUrl'    => $tracking_base,
            'badge'              => (string) $def['badge'],
            'recommended'        => !empty($def['recommended']),
            'statusCode'         => (string) $def['status'],
        ), 0);

        if (empty($saved['ok']) || empty($saved['campaign']['id'])) {
            return array(
                'ok'      => false,
                'message' => isset($saved['message']) ? (string) $saved['message'] : '캠페인 생성에 실패했습니다.',
            );
        }

        $cp_id = (int) $saved['campaign']['id'];
        lc_sql_query(" UPDATE `{$table}` SET
            cp_code = '{$code_esc}',
            cp_landing_url = '" . lc_sql_escape($landing) . "',
            cp_tracking_base_url = '" . lc_sql_escape($tracking_base) . "'
            WHERE cp_id = '{$cp_id}' ", false);

        return array(
            'ok'      => true,
            'message' => '다시봄 캠페인을 생성했습니다.',
            'cpId'    => $cp_id,
            'created' => true,
        );
    }
}

if (!function_exists('lc_dasibom_promo_guide_payload')) {
    /**
     * @return array<string,mixed>
     */
    function lc_dasibom_promo_guide_payload()
    {
        $brand = '다시봄';
        $specific = array(
            '승인률은 매체마다 다릅니다. 검색광고(웹사이트 상위노출, 키워드, 자동완성)는 최대 90%이고, 페이스북·인스타그램 등 SNS(어웨어니스)는 부재가 많아 50% 안팎입니다.',
            '부채 1,500만 원 이하, 신청한 적 없음, 잘못 누름, 만 19세 미만, 부재 3회 이상은 승인되지 않습니다.',
            '광고주는 2012년부터 진행해 온 신뢰 관계로, 기준에 맞는 DB는 가능한 한 승인해 드리고 있습니다.',
            '홍보 랜딩은 https://linkconnect.co.kr/merchant/dasibom 입니다. 발급 링크의 lkCode를 유지하고, 승인·지급·탕감을 보장하는 문구는 쓰지 마세요.',
        );
        $common = function_exists('lc_campaign_promo_guide_common_precautions')
            ? lc_campaign_promo_guide_common_precautions($brand)
            : array();
        $precautions = function_exists('lc_campaign_promo_guide_merge_precautions')
            ? lc_campaign_promo_guide_merge_precautions($specific, $common)
            : array_merge($common, $specific);

        return array(
            'promotionPoints' => array(
                '검색광고(컨시더레이션) 확정 단가는 건당 65,000원입니다. 웹사이트 상위노출, 키워드, 자동완성 등 검색광고의 승인률은 최대 90%까지 나오고 있습니다.',
                '페이스북·인스타그램 등 SNS(어웨어니스)는 부재가 많아 승인률이 50% 안팎으로 결정됩니다.',
                '랜딩은 https://linkconnect.co.kr/merchant/dasibom 입니다. 홍보 링크의 lkCode를 유지해 유입시켜 주세요.',
            ),
            'recommendedKeywords' => array(
                '개인회생 무료상담',
                '개인회생 변호사',
                '개인파산 상담',
                '채무조정 상담',
                '개인회생 비용',
                '다시봄 개인회생',
            ),
            'forbiddenWords' => array(
                '무조건 승인',
                '지급 보장',
                '비용 0원',
                '100% 탕감',
                '정부지원 확정',
            ),
            'precautions' => $precautions,
            'validDbRules' => array(
                '검색광고(웹사이트 상위노출, 키워드, 자동완성)로 유입되고 상담 의사가 확인된 신청. 승인률은 최대 90%이며, 확정 시 65,000원이 지급됩니다.',
                '부채가 1,500만 원을 넘고, 이름과 실제 연락처가 있는 개인회생·개인파산 상담 신청.',
                '기준에 맞는 DB는 2012년부터 함께해 온 광고주가 가능한 한 승인해 드립니다.',
            ),
            'invalidDbRules' => array(
                '부채 1,500만 원 이하인 신청은 승인되지 않습니다.',
                '상담을 신청한 적이 없다고 하거나, 잘못 눌렀다고 하는 경우는 승인되지 않습니다.',
                '만 19세 미만은 승인되지 않습니다.',
                '부재 3회 이상은 승인되지 않습니다.',
                'SNS(어웨어니스)는 부재가 많아 승인률이 50% 안팎입니다. 허위·결번 연락처와 상담 의사가 없는 신청도 승인되지 않습니다.',
            ),
            'approvalType' => 'free',
            'guideStatus' => 'published',
        );
    }
}

if (!function_exists('lc_campaign_ensure_dasibom_promo_guide')) {
    /**
     * 다시봄 랜딩 캠페인에 파트너 공개 홍보 가이드를 만든다.
     *
     * @return array{ok:bool,message:string,updated?:int}
     */
    function lc_campaign_ensure_dasibom_promo_guide()
    {
        static $ran = false;
        if ($ran) {
            return array('ok' => true, 'message' => 'already ran', 'updated' => 0);
        }
        $ran = true;

        if (!function_exists('lc_db_installed') || !lc_db_installed() || !function_exists('lc_campaign_promo_guide_admin_save')) {
            return array('ok' => false, 'message' => 'DB 또는 홍보 가이드 모듈이 없습니다.', 'updated' => 0);
        }
        if (function_exists('lc_campaign_promo_guide_db_ensure_schema')) {
            lc_campaign_promo_guide_db_ensure_schema();
        }

        $campaigns = lc_table('campaigns');
        $guides = lc_campaign_promo_guide_table();
        $rows = array();
        $result = lc_sql_query(" SELECT c.cp_id, c.mt_id, c.cp_status, g.cpg_id, g.cpg_status, g.cpg_promotion_points
            FROM `{$campaigns}` c
            LEFT JOIN `{$guides}` g ON g.cpg_cp_id = c.cp_id
            WHERE c.cp_landing_url LIKE '%/merchant/dasibom%'
               OR c.cp_code IN ('CPA-DASIBOM', 'CPA-00011') ", false);
        if ($result) {
            while ($row = sql_fetch_array($result)) {
                if (is_array($row)) {
                    $rows[] = $row;
                }
            }
        }
        if (!$rows) {
            return array('ok' => true, 'message' => '다시봄 캠페인이 없습니다.', 'updated' => 0);
        }

        $payload = lc_dasibom_promo_guide_payload();
        $updated = 0;
        foreach ($rows as $row) {
            $points = (string) ($row['cpg_promotion_points'] ?? '');
            $status = (string) ($row['cpg_status'] ?? '');
            if ($status === 'published' && strpos($points, '최대 90%') !== false) {
                continue;
            }

            $cp_id = (int) $row['cp_id'];
            $mt_id = (int) $row['mt_id'];
            $cpg_id = (int) ($row['cpg_id'] ?? 0);
            if ($cpg_id <= 0) {
                if ($mt_id <= 0 || !function_exists('lc_campaign_promo_guide_create')) {
                    continue;
                }
                $created = lc_campaign_promo_guide_create($mt_id, $cp_id);
                if (empty($created['ok']) || empty($created['guide']['cpg_id'])) {
                    continue;
                }
                $cpg_id = (int) $created['guide']['cpg_id'];
            }

            $saved = lc_campaign_promo_guide_admin_save($cpg_id, $payload);
            if (!empty($saved['ok'])) {
                $updated++;
            }
        }

        return array('ok' => true, 'message' => '다시봄 홍보 가이드를 반영했습니다.', 'updated' => $updated);
    }
}

if (function_exists('lc_campaign_ensure_dasibom_promo_guide')) {
    lc_campaign_ensure_dasibom_promo_guide();
}
