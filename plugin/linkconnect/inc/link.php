<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

if (!function_exists('lc_link_tracking_base_url')) {
    function lc_link_tracking_base_url()
    {
        if (function_exists('lc_settings_get_bool') && lc_settings_get_bool('cpaTrackingDomainEnabled')) {
            $base = trim((string) lc_settings_get('cpaTrackingBaseUrl', ''));
            if ($base !== '') {
                return rtrim($base, '/');
            }
        }

        return defined('G5_URL') ? rtrim((string) G5_URL, '/') : '';
    }
}

if (!function_exists('lc_link_public_url')) {
    function lc_link_public_url($lk_code)
    {
        $lk_code = trim((string) $lk_code);

        return lc_link_tracking_base_url() . '/r/' . rawurlencode($lk_code);
    }
}

if (!function_exists('lc_landing_public_url')) {
    function lc_landing_public_url($lk_code)
    {
        $lk_code = trim((string) $lk_code);

        return lc_link_tracking_base_url() . '/c/' . rawurlencode($lk_code);
    }
}

if (!function_exists('lc_link_landing_seo_replace')) {
    function lc_link_landing_seo_replace($template, $campaign_name)
    {
        $template = trim((string) $template);
        $campaign_name = trim((string) $campaign_name);
        $site = function_exists('lc_settings_get')
            ? trim((string) lc_settings_get('siteName', '링크커넥트'))
            : '링크커넥트';

        return str_replace(
            array('{campaign}', '{site}'),
            array($campaign_name !== '' ? $campaign_name : '상담 신청', $site),
            $template
        );
    }
}

if (!function_exists('lc_link_landing_seo_meta')) {
    /**
     * @return array{title:string,description:string,keywords:string,robots:string,ogImage:string,canonical:string}
     */
    function lc_link_landing_seo_meta($campaign_name, $lk_code)
    {
        $campaign_name = trim((string) $campaign_name);
        $lk_code = trim((string) $lk_code);
        $canonical = $lk_code !== '' ? lc_landing_public_url($lk_code) : lc_link_tracking_base_url();

        $title_tpl = function_exists('lc_settings_get')
            ? (string) lc_settings_get('cpaLandingSeoTitle', '{campaign} 상담 신청 | {site}')
            : '{campaign} 상담 신청 | {site}';
        $desc_tpl = function_exists('lc_settings_get')
            ? (string) lc_settings_get('cpaLandingSeoDescription', '')
            : '';
        $keywords = function_exists('lc_settings_get')
            ? trim((string) lc_settings_get('cpaLandingSeoKeywords', ''))
            : '';
        $robots = function_exists('lc_settings_get')
            ? trim((string) lc_settings_get('cpaLandingSeoRobots', 'index,follow'))
            : 'index,follow';
        $og_image = function_exists('lc_settings_get')
            ? trim((string) lc_settings_get('cpaLandingSeoOgImage', ''))
            : '';

        $title = lc_link_landing_seo_replace($title_tpl, $campaign_name);
        if ($title === '') {
            $title = $campaign_name !== '' ? $campaign_name . ' 상담 신청' : '상담 신청';
        }

        $description = lc_link_landing_seo_replace($desc_tpl, $campaign_name);
        if ($description === '' && $campaign_name !== '') {
            $description = $campaign_name . ' 무료 상담 신청 페이지입니다.';
        }

        if ($robots === '') {
            $robots = 'index,follow';
        }

        return array(
            'title'       => $title,
            'description' => $description,
            'keywords'    => $keywords,
            'robots'      => $robots,
            'ogImage'     => $og_image,
            'canonical'   => $canonical,
        );
    }
}

if (!function_exists('lc_link_generate_code')) {
    function lc_link_generate_code()
    {
        return strtolower(substr(bin2hex(random_bytes(6)), 0, 10));
    }
}

if (!function_exists('lc_link_get_by_code')) {
    function lc_link_get_by_code($lk_code)
    {
        if (!lc_db_installed() || $lk_code === '') {
            return null;
        }

        $table = lc_table('links');
        $lk_code_esc = lc_sql_escape($lk_code);

        return lc_sql_fetch(" SELECT * FROM `{$table}` WHERE lk_code = '{$lk_code_esc}' LIMIT 1 ");
    }
}

if (!function_exists('lc_link_get_by_id')) {
    function lc_link_get_by_id($lk_id)
    {
        if (!lc_db_installed()) {
            return null;
        }

        $lk_id = (int) $lk_id;
        $table = lc_table('links');

        return lc_sql_fetch(" SELECT * FROM `{$table}` WHERE lk_id = '{$lk_id}' LIMIT 1 ");
    }
}

if (!function_exists('lc_link_get_with_campaign')) {
    function lc_link_get_with_campaign($lk_code)
    {
        if (!lc_db_installed() || $lk_code === '') {
            return null;
        }

        $lk_table = lc_table('links');
        $cp_table = lc_table('campaigns');
        $lk_code_esc = lc_sql_escape($lk_code);

        return lc_sql_fetch(" SELECT lk.*, c.cp_name, c.cp_price, c.cp_status AS cp_status, c.cp_landing_url, c.mt_id
            FROM `{$lk_table}` lk
            INNER JOIN `{$cp_table}` c ON c.cp_id = lk.cp_id
            WHERE lk.lk_code = '{$lk_code_esc}' LIMIT 1 ");
    }
}

if (!function_exists('lc_link_list_for_partner')) {
    function lc_link_list_for_partner($pt_id)
    {
        if (!lc_db_installed()) {
            return array();
        }

        $pt_id = (int) $pt_id;
        $lk_table = lc_table('links');
        $cp_table = lc_table('campaigns');
        $cl_table = lc_table('clicks');
        $cv_table = lc_table('conversions');

        $sql = " SELECT lk.*, c.cp_name, c.cp_price,
            (SELECT COUNT(*) FROM `{$cl_table}` cl WHERE cl.lk_id = lk.lk_id) AS click_cnt,
            (SELECT COUNT(*) FROM `{$cv_table}` cv WHERE cv.lk_id = lk.lk_id) AS received_cnt,
            (SELECT COUNT(*) FROM `{$cv_table}` cv WHERE cv.lk_id = lk.lk_id AND cv.cv_status = '" . lc_sql_escape(LC_STATUS_APPROVED) . "') AS approved_cnt,
            (SELECT COUNT(*) FROM `{$cv_table}` cv WHERE cv.lk_id = lk.lk_id AND cv.cv_status = '" . lc_sql_escape(LC_STATUS_REJECTED) . "') AS canceled_cnt,
            (SELECT COALESCE(SUM(cv.cv_price), 0) FROM `{$cv_table}` cv WHERE cv.lk_id = lk.lk_id) AS est_revenue,
            (SELECT COALESCE(SUM(cv.cv_price), 0) FROM `{$cv_table}` cv WHERE cv.lk_id = lk.lk_id AND cv.cv_status = '" . lc_sql_escape(LC_STATUS_APPROVED) . "') AS conf_revenue
            FROM `{$lk_table}` lk
            INNER JOIN `{$cp_table}` c ON c.cp_id = lk.cp_id
            WHERE lk.pt_id = '{$pt_id}'
            ORDER BY lk.lk_id DESC ";

        $rows = array();
        $result = lc_sql_query($sql, false);
        if ($result) {
            while ($row = sql_fetch_array($result)) {
                $rows[] = $row;
            }
        }

        return $rows;
    }
}

if (!function_exists('lc_link_status_label')) {
    function lc_link_status_label($status)
    {
        $labels = array(
            'active'  => '운영중',
            'paused'  => '중지',
            'expired' => '만료',
        );

        return isset($labels[$status]) ? $labels[$status] : (string) $status;
    }
}

if (!function_exists('lc_link_to_api')) {
    function lc_link_to_api(array $row)
    {
        return array(
            'id'          => (int) $row['lk_id'],
            'code'        => (string) $row['lk_code'],
            'campaign'    => (string) ($row['cp_name'] ?? ''),
            'campaignId'  => (int) $row['cp_id'],
            'channel'     => (string) $row['lk_channel'],
            'subId'       => (string) $row['lk_sub_id'],
            'url'         => lc_link_public_url($row['lk_code']),
            'landingUrl'  => lc_landing_public_url($row['lk_code']),
            'clicks'      => (int) ($row['click_cnt'] ?? 0),
            'received'    => (int) ($row['received_cnt'] ?? 0),
            'approved'    => (int) ($row['approved_cnt'] ?? 0),
            'canceled'    => (int) ($row['canceled_cnt'] ?? 0),
            'estRevenue'  => (int) ($row['est_revenue'] ?? 0),
            'confRevenue' => (int) ($row['conf_revenue'] ?? 0),
            'status'      => lc_link_status_label($row['lk_status']),
            'statusCode'  => (string) $row['lk_status'],
            'createdAt'   => (string) $row['lk_created_at'],
        );
    }
}

if (!function_exists('lc_cpa_partner_create_shortlink')) {
    /**
     * CPA /r/{code} 추적 링크를 /s/{short} 숏링크로 변환
     *
     * @return array{ok:bool,message:string,shortUrl:string,promoUrl:string,shortCode:string}
     */
    function lc_cpa_partner_create_shortlink($pt_id, $lk_id)
    {
        $pt_id = (int) $pt_id;
        $lk_id = (int) $lk_id;
        $empty = array('ok' => false, 'message' => '', 'shortUrl' => '', 'promoUrl' => '', 'shortCode' => '');

        if ($pt_id <= 0 || $lk_id <= 0) {
            $empty['message'] = '링크 정보가 올바르지 않습니다.';

            return $empty;
        }

        $link = lc_link_get_by_id($lk_id);
        if (!$link || (int) ($link['pt_id'] ?? 0) !== $pt_id) {
            $empty['message'] = '본인 홍보 링크만 숏코드로 변환할 수 있습니다.';

            return $empty;
        }
        if (($link['lk_status'] ?? '') !== 'active') {
            $empty['message'] = '운영중인 링크만 숏코드로 변환할 수 있습니다.';

            return $empty;
        }

        $promo_url = lc_link_public_url((string) ($link['lk_code'] ?? ''));
        if ($promo_url === '' || !function_exists('lc_shortlink_store_for_partner')) {
            $empty['message'] = '숏링크를 만들 수 없습니다.';

            return $empty;
        }

        return lc_shortlink_store_for_partner($pt_id, $promo_url, array(
            'merchant_code' => 'cpa:' . (string) ($link['lk_code'] ?? ''),
            'product_url'   => 'lk:' . $lk_id,
        ));
    }
}

if (!function_exists('lc_link_create')) {
    /**
     * @return array{ok:bool,message:string,link:array|null}
     */
    function lc_link_create($pt_id, $cp_id, $channel = '', $sub_id = '')
    {
        if (!lc_db_installed()) {
            return array('ok' => false, 'message' => 'DB가 설치되지 않았습니다.', 'link' => null);
        }

        $pt_id = (int) $pt_id;
        $cp_id = (int) $cp_id;
        $partner = lc_get_partner_by_id($pt_id);
        if (!$partner || $partner['pt_status'] !== LC_PARTNER_STATUS_ACTIVE) {
            return array('ok' => false, 'message' => '활성 파트너만 링크를 생성할 수 있습니다.', 'link' => null);
        }

        $cp_table = lc_table('campaigns');
        $campaign = lc_sql_fetch(" SELECT * FROM `{$cp_table}` WHERE cp_id = '{$cp_id}' AND cp_status = '" . lc_sql_escape(LC_STATUS_ACTIVE) . "' LIMIT 1 ");
        if (!$campaign) {
            return array('ok' => false, 'message' => '진행 중인 캠페인을 찾을 수 없습니다.', 'link' => null);
        }

        $channel = trim((string) $channel);
        $sub_id = trim((string) $sub_id);
        $lk_code = lc_link_generate_code();
        $attempts = 0;
        while (lc_link_get_by_code($lk_code) && $attempts < 5) {
            $lk_code = lc_link_generate_code();
            $attempts++;
        }

        $table = lc_table('links');
        lc_sql_query(" INSERT INTO `{$table}` SET
            pt_id = '{$pt_id}',
            cp_id = '{$cp_id}',
            lk_code = '" . lc_sql_escape($lk_code) . "',
            lk_channel = '" . lc_sql_escape($channel) . "',
            lk_sub_id = '" . lc_sql_escape($sub_id) . "',
            lk_status = 'active',
            lk_created_at = NOW(),
            lk_updated_at = NOW() ", false);

        $lk_id = (int) lc_sql_insert_id();
        if ($lk_id <= 0) {
            return array('ok' => false, 'message' => '링크 생성에 실패했습니다.', 'link' => null);
        }

        $rows = lc_link_list_for_partner($pt_id);
        foreach ($rows as $row) {
            if ((int) $row['lk_id'] === $lk_id) {
                return array('ok' => true, 'message' => '홍보 링크가 생성되었습니다.', 'link' => lc_link_to_api($row));
            }
        }

        $link = lc_link_get_by_id($lk_id);

        return array(
            'ok'      => true,
            'message' => '홍보 링크가 생성되었습니다.',
            'link'    => $link ? lc_link_to_api(array_merge($link, array('cp_name' => $campaign['cp_name'], 'cp_price' => $campaign['cp_price']))) : null,
        );
    }
}

if (!function_exists('lc_link_record_click')) {
    function lc_link_record_click(array $link)
    {
        if (!lc_db_installed() || empty($link['lk_id'])) {
            return 0;
        }

        $lk_id = (int) $link['lk_id'];
        $pt_id = (int) $link['pt_id'];
        $cp_id = (int) $link['cp_id'];
        $ip = isset($_SERVER['REMOTE_ADDR']) ? preg_replace('/[^0-9a-fA-F:\.]/', '', $_SERVER['REMOTE_ADDR']) : '';
        $ua = isset($_SERVER['HTTP_USER_AGENT']) ? substr((string) $_SERVER['HTTP_USER_AGENT'], 0, 500) : '';
        $referer = isset($_SERVER['HTTP_REFERER']) ? substr((string) $_SERVER['HTTP_REFERER'], 0, 500) : '';

        $table = lc_table('clicks');
        lc_sql_query(" INSERT INTO `{$table}` SET
            lk_id = '{$lk_id}',
            pt_id = '{$pt_id}',
            cp_id = '{$cp_id}',
            cl_ip = '" . lc_sql_escape($ip) . "',
            cl_user_agent = '" . lc_sql_escape($ua) . "',
            cl_referer = '" . lc_sql_escape($referer) . "',
            cl_created_at = NOW() ", false);

        return (int) lc_sql_insert_id();
    }
}

if (!function_exists('lc_link_resolve_redirect_url')) {
    function lc_link_resolve_redirect_url(array $link)
    {
        $landing = trim((string) ($link['cp_landing_url'] ?? ''));
        $lk_code = trim((string) ($link['lk_code'] ?? ''));
        if ($landing !== '') {
            if ($lk_code !== '' && stripos($landing, 'lkcode=') === false && stripos($landing, 'code=') === false) {
                $landing .= (strpos($landing, '?') !== false ? '&' : '?') . 'lkCode=' . rawurlencode($lk_code);
            }
            if (strpos($landing, '://') === false && defined('G5_URL') && G5_URL !== '') {
                return rtrim(G5_URL, '/') . '/' . ltrim($landing, '/');
            }

            return $landing;
        }

        return lc_landing_public_url($lk_code);
    }
}

if (!function_exists('lc_link_partner_click_summary')) {
    function lc_link_partner_click_summary($pt_id)
    {
        if (!lc_db_installed()) {
            return array('today' => 0, 'total' => 0);
        }

        $pt_id = (int) $pt_id;
        $table = lc_table('clicks');
        $today = date('Y-m-d');
        $row = lc_sql_fetch(" SELECT
            COUNT(*) AS total_cnt,
            SUM(CASE WHEN DATE(cl_created_at) = '{$today}' THEN 1 ELSE 0 END) AS today_cnt
            FROM `{$table}` WHERE pt_id = '{$pt_id}' ");

        return array(
            'today' => (int) ($row['today_cnt'] ?? 0),
            'total' => (int) ($row['total_cnt'] ?? 0),
        );
    }
}

if (!function_exists('lc_link_partner_channel_stats')) {
    function lc_link_partner_channel_stats($pt_id, $limit = 5)
    {
        if (!lc_db_installed()) {
            return array();
        }

        $pt_id = (int) $pt_id;
        $limit = max(1, min(20, (int) $limit));
        $lk_table = lc_table('links');
        $cl_table = lc_table('clicks');
        $cv_table = lc_table('conversions');

        $rows = array();
        $result = lc_sql_query(" SELECT lk.lk_channel AS channel,
            COUNT(DISTINCT cl.cl_id) AS clicks,
            COUNT(DISTINCT cv.cv_id) AS dbs,
            SUM(CASE WHEN cv.cv_status = '" . lc_sql_escape(LC_STATUS_APPROVED) . "' THEN 1 ELSE 0 END) AS approved
            FROM `{$lk_table}` lk
            LEFT JOIN `{$cl_table}` cl ON cl.lk_id = lk.lk_id
            LEFT JOIN `{$cv_table}` cv ON cv.lk_id = lk.lk_id
            WHERE lk.pt_id = '{$pt_id}' AND lk.lk_channel != ''
            GROUP BY lk.lk_channel
            ORDER BY clicks DESC
            LIMIT {$limit} ", false);

        if ($result) {
            $total_clicks = 0;
            $items = array();
            while ($row = sql_fetch_array($result)) {
                $clicks = (int) $row['clicks'];
                $total_clicks += $clicks;
                $items[] = array(
                    'channel'  => (string) $row['channel'],
                    'clicks'   => $clicks,
                    'dbs'      => (int) $row['dbs'],
                    'approved' => (int) $row['approved'],
                );
            }

            foreach ($items as &$item) {
                $item['percentage'] = $total_clicks > 0 ? (int) round(($item['clicks'] / $total_clicks) * 100) : 0;
            }
            unset($item);

            return $items;
        }

        return array();
    }
}
