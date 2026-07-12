<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

if (!function_exists('lc_partner_analytics_visitor_hash')) {
    function lc_partner_analytics_visitor_hash($ip)
    {
        $ip = trim((string) $ip);

        return hash('sha256', 'lc-visitor-v1|' . $ip);
    }
}

if (!function_exists('lc_partner_analytics_device_type')) {
    function lc_partner_analytics_device_type($user_agent)
    {
        $ua = (string) $user_agent;
        if ($ua === '') {
            return 'unknown';
        }
        if (preg_match('/Mobile|Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i', $ua)) {
            return 'mobile';
        }

        return 'desktop';
    }
}

if (!function_exists('lc_partner_analytics_referer_domain')) {
    function lc_partner_analytics_referer_domain($referer)
    {
        $referer = trim((string) $referer);
        if ($referer === '') {
            return '직접 유입';
        }

        $host = parse_url($referer, PHP_URL_HOST);
        if (is_string($host) && $host !== '') {
            return strtolower($host);
        }

        return '기타';
    }
}

if (!function_exists('lc_partner_analytics_parse_filters')) {
    function lc_partner_analytics_parse_filters(array $input = array())
    {
        $period = isset($input['period']) ? (int) $input['period'] : 7;
        if (!in_array($period, array(7, 30, 90), true)) {
            $period = 7;
        }

        $dateFrom = isset($input['dateFrom']) ? trim((string) $input['dateFrom']) : '';
        $dateTo = isset($input['dateTo']) ? trim((string) $input['dateTo']) : '';
        if ($dateFrom !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateFrom)) {
            $dateFrom = '';
        }
        if ($dateTo !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateTo)) {
            $dateTo = '';
        }
        if ($dateTo === '') {
            $dateTo = date('Y-m-d');
        }

        $compare_ids = array();
        if (!empty($input['compareIds'])) {
            foreach (explode(',', (string) $input['compareIds']) as $id) {
                $id = (int) trim($id);
                if ($id > 0) {
                    $compare_ids[] = $id;
                }
            }
            $compare_ids = array_values(array_unique(array_slice($compare_ids, 0, 5)));
        }

        return array(
            'period'     => $period,
            'dateFrom'   => $dateFrom,
            'dateTo'     => $dateTo,
            'linkId'     => isset($input['linkId']) ? (int) $input['linkId'] : 0,
            'channel'    => isset($input['channel']) ? trim((string) $input['channel']) : '',
            'linkName'   => isset($input['linkName']) ? trim((string) $input['linkName']) : '',
            'compareIds' => $compare_ids,
        );
    }
}

if (!function_exists('lc_partner_analytics_resolve_range')) {
    function lc_partner_analytics_resolve_range(array $filters)
    {
        $dateTo = $filters['dateTo'] !== '' ? $filters['dateTo'] : date('Y-m-d');
        if ($filters['dateFrom'] !== '') {
            $dateFrom = $filters['dateFrom'];
        } else {
            $days = max(1, (int) ($filters['period'] ?? 7));
            $dateFrom = date('Y-m-d', strtotime($dateTo . ' -' . ($days - 1) . ' days'));
        }

        if (strtotime($dateFrom) > strtotime($dateTo)) {
            $tmp = $dateFrom;
            $dateFrom = $dateTo;
            $dateTo = $tmp;
        }

        return array($dateFrom, $dateTo);
    }
}

if (!function_exists('lc_partner_analytics_link_sql')) {
    function lc_partner_analytics_link_sql(array $filters, $alias = 'lk')
    {
        $parts = array();

        if (!empty($filters['linkId'])) {
            $parts[] = "{$alias}.lk_id = '" . (int) $filters['linkId'] . "'";
        }
        if ($filters['channel'] !== '') {
            $parts[] = "{$alias}.lk_channel = '" . lc_sql_escape($filters['channel']) . "'";
        }
        if ($filters['linkName'] !== '') {
            $parts[] = "{$alias}.lk_sub_id = '" . lc_sql_escape($filters['linkName']) . "'";
        }

        return $parts ? ' AND ' . implode(' AND ', $parts) : '';
    }
}

if (!function_exists('lc_partner_analytics_filter_options')) {
    function lc_partner_analytics_filter_options($pt_id)
    {
        if (!lc_db_installed()) {
            return array('links' => array(), 'channels' => array(), 'linkNames' => array());
        }

        $pt_id = (int) $pt_id;
        $lk_table = lc_table('links');
        $cp_table = lc_table('campaigns');
        $links = array();
        $channels = array();
        $link_names = array();

        $result = lc_sql_query(" SELECT lk.lk_id, lk.lk_code, lk.lk_channel, lk.lk_sub_id, c.cp_name
            FROM `{$lk_table}` lk
            INNER JOIN `{$cp_table}` c ON c.cp_id = lk.cp_id
            WHERE lk.pt_id = '{$pt_id}'
            ORDER BY lk.lk_id DESC ", false);

        if ($result) {
            while ($row = sql_fetch_array($result)) {
                $channel = trim((string) ($row['lk_channel'] ?? ''));
                $link_name = trim((string) ($row['lk_sub_id'] ?? ''));
                $links[] = array(
                    'id'       => (int) $row['lk_id'],
                    'code'     => (string) $row['lk_code'],
                    'campaign' => (string) $row['cp_name'],
                    'channel'  => $channel !== '' ? $channel : '미지정',
                    'linkName' => $link_name,
                );
                if ($channel !== '' && !in_array($channel, $channels, true)) {
                    $channels[] = $channel;
                }
                if ($link_name !== '' && !in_array($link_name, $link_names, true)) {
                    $link_names[] = $link_name;
                }
            }
        }

        sort($channels);
        sort($link_names);

        return array(
            'links'     => $links,
            'channels'  => $channels,
            'linkNames' => $link_names,
        );
    }
}

if (!function_exists('lc_partner_analytics_summary')) {
    function lc_partner_analytics_summary($pt_id, array $filters)
    {
        if (!lc_db_installed()) {
            return array();
        }

        $pt_id = (int) $pt_id;
        list($dateFrom, $dateTo) = lc_partner_analytics_resolve_range($filters);
        $cl_table = lc_table('clicks');
        $cv_table = lc_table('conversions');
        $lk_table = lc_table('links');
        $link_sql = lc_partner_analytics_link_sql($filters, 'lk');

        $click_row = lc_sql_fetch(" SELECT COUNT(*) AS clicks
            FROM `{$cl_table}` cl
            INNER JOIN `{$lk_table}` lk ON lk.lk_id = cl.lk_id
            WHERE cl.pt_id = '{$pt_id}'
              AND DATE(cl.cl_created_at) BETWEEN '" . lc_sql_escape($dateFrom) . "' AND '" . lc_sql_escape($dateTo) . "'
              {$link_sql} ");

        $visitor_hashes = array();
        $visitor_result = lc_sql_query(" SELECT cl.cl_ip
            FROM `{$cl_table}` cl
            INNER JOIN `{$lk_table}` lk ON lk.lk_id = cl.lk_id
            WHERE cl.pt_id = '{$pt_id}'
              AND DATE(cl.cl_created_at) BETWEEN '" . lc_sql_escape($dateFrom) . "' AND '" . lc_sql_escape($dateTo) . "'
              {$link_sql} ", false);
        if ($visitor_result) {
            while ($row = sql_fetch_array($visitor_result)) {
                $visitor_hashes[lc_partner_analytics_visitor_hash($row['cl_ip'] ?? '')] = true;
            }
        }

        $cv_row = lc_sql_fetch(" SELECT
            COUNT(*) AS total_cnt,
            SUM(CASE WHEN cv.cv_status = '" . lc_sql_escape(LC_STATUS_APPROVED) . "' THEN 1 ELSE 0 END) AS approved_cnt,
            SUM(CASE WHEN cv.cv_status = '" . lc_sql_escape(LC_STATUS_REJECTED) . "' THEN 1 ELSE 0 END) AS rejected_cnt,
            SUM(CASE WHEN cv.cv_status = '" . lc_sql_escape(LC_STATUS_APPROVED) . "' THEN cv.cv_price ELSE 0 END) AS conf_revenue
            FROM `{$cv_table}` cv
            INNER JOIN `{$lk_table}` lk ON lk.lk_id = cv.lk_id
            WHERE cv.pt_id = '{$pt_id}'
              AND DATE(cv.cv_created_at) BETWEEN '" . lc_sql_escape($dateFrom) . "' AND '" . lc_sql_escape($dateTo) . "'
              {$link_sql} ");

        $clicks = (int) ($click_row['clicks'] ?? 0);
        $total_db = (int) ($cv_row['total_cnt'] ?? 0);
        $approved = (int) ($cv_row['approved_cnt'] ?? 0);
        $rejected = (int) ($cv_row['rejected_cnt'] ?? 0);
        $conf_revenue = (int) ($cv_row['conf_revenue'] ?? 0);

        return array(
            'totalClicks'     => $clicks,
            'uniqueVisitors'  => count($visitor_hashes),
            'totalDb'         => $total_db,
            'approvedDb'      => $approved,
            'rejectedDb'      => $rejected,
            'confRevenue'     => $conf_revenue,
            'avgConvRate'     => $clicks > 0 ? round(($total_db / $clicks) * 100, 1) : 0,
            'avgApprovalRate' => $total_db > 0 ? round(($approved / $total_db) * 100, 1) : 0,
            'epc'             => $clicks > 0 ? (int) round($conf_revenue / $clicks) : 0,
        );
    }
}

if (!function_exists('lc_partner_analytics_chart')) {
    function lc_partner_analytics_chart($pt_id, array $filters)
    {
        if (!lc_db_installed()) {
            return array();
        }

        $pt_id = (int) $pt_id;
        list($dateFrom, $dateTo) = lc_partner_analytics_resolve_range($filters);
        $cl_table = lc_table('clicks');
        $cv_table = lc_table('conversions');
        $lk_table = lc_table('links');
        $link_sql = lc_partner_analytics_link_sql($filters, 'lk');
        $items = array();

        $start = strtotime($dateFrom);
        $end = strtotime($dateTo);
        for ($ts = $start; $ts <= $end; $ts += 86400) {
            $day = date('Y-m-d', $ts);
            $label = date('m.d', $ts);

            $click_row = lc_sql_fetch(" SELECT COUNT(*) AS cnt
                FROM `{$cl_table}` cl
                INNER JOIN `{$lk_table}` lk ON lk.lk_id = cl.lk_id
                WHERE cl.pt_id = '{$pt_id}'
                  AND DATE(cl.cl_created_at) = '{$day}'
                  {$link_sql} ");

            $cv_row = lc_sql_fetch(" SELECT
                COUNT(*) AS db_cnt,
                SUM(CASE WHEN cv.cv_status = '" . lc_sql_escape(LC_STATUS_APPROVED) . "' THEN 1 ELSE 0 END) AS approval_cnt
                FROM `{$cv_table}` cv
                INNER JOIN `{$lk_table}` lk ON lk.lk_id = cv.lk_id
                WHERE cv.pt_id = '{$pt_id}'
                  AND DATE(cv.cv_created_at) = '{$day}'
                  {$link_sql} ");

            $items[] = array(
                'date'     => $label,
                'click'    => (int) ($click_row['cnt'] ?? 0),
                'db'       => (int) ($cv_row['db_cnt'] ?? 0),
                'approval' => (int) ($cv_row['approval_cnt'] ?? 0),
            );
        }

        return $items;
    }
}

if (!function_exists('lc_partner_analytics_channels')) {
    function lc_partner_analytics_channels($pt_id, array $filters, $limit = 8)
    {
        if (!lc_db_installed()) {
            return array();
        }

        $pt_id = (int) $pt_id;
        $limit = max(1, min(20, (int) $limit));
        list($dateFrom, $dateTo) = lc_partner_analytics_resolve_range($filters);
        $cl_table = lc_table('clicks');
        $cv_table = lc_table('conversions');
        $lk_table = lc_table('links');
        $link_sql = lc_partner_analytics_link_sql($filters, 'lk');

        $rows = array();
        $result = lc_sql_query(" SELECT
            CASE WHEN lk.lk_channel = '' THEN '미지정' ELSE lk.lk_channel END AS channel,
            COUNT(DISTINCT cl.cl_id) AS clicks,
            COUNT(DISTINCT cv.cv_id) AS dbs,
            SUM(CASE WHEN cv.cv_status = '" . lc_sql_escape(LC_STATUS_APPROVED) . "' THEN 1 ELSE 0 END) AS approved
            FROM `{$lk_table}` lk
            LEFT JOIN `{$cl_table}` cl ON cl.lk_id = lk.lk_id
              AND cl.pt_id = '{$pt_id}'
              AND DATE(cl.cl_created_at) BETWEEN '" . lc_sql_escape($dateFrom) . "' AND '" . lc_sql_escape($dateTo) . "'
            LEFT JOIN `{$cv_table}` cv ON cv.lk_id = lk.lk_id
              AND cv.pt_id = '{$pt_id}'
              AND DATE(cv.cv_created_at) BETWEEN '" . lc_sql_escape($dateFrom) . "' AND '" . lc_sql_escape($dateTo) . "'
            WHERE lk.pt_id = '{$pt_id}'
              {$link_sql}
            GROUP BY channel
            ORDER BY clicks DESC
            LIMIT {$limit} ", false);

        $total_clicks = 0;
        $items = array();
        if ($result) {
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
        }

        foreach ($items as &$item) {
            $item['percentage'] = $total_clicks > 0 ? (int) round(($item['clicks'] / $total_clicks) * 100) : 0;
        }
        unset($item);

        return $items;
    }
}

if (!function_exists('lc_partner_analytics_link_names')) {
    function lc_partner_analytics_link_names($pt_id, array $filters, $limit = 8)
    {
        if (!lc_db_installed()) {
            return array();
        }

        $pt_id = (int) $pt_id;
        $limit = max(1, min(20, (int) $limit));
        list($dateFrom, $dateTo) = lc_partner_analytics_resolve_range($filters);
        $cl_table = lc_table('clicks');
        $cv_table = lc_table('conversions');
        $lk_table = lc_table('links');
        $link_sql = lc_partner_analytics_link_sql($filters, 'lk');

        $rows = array();
        $result = lc_sql_query(" SELECT
            CASE WHEN lk.lk_sub_id = '' THEN '미지정' ELSE lk.lk_sub_id END AS link_name,
            lk.lk_channel AS channel,
            COUNT(DISTINCT cl.cl_id) AS clicks,
            COUNT(DISTINCT cv.cv_id) AS dbs,
            SUM(CASE WHEN cv.cv_status = '" . lc_sql_escape(LC_STATUS_APPROVED) . "' THEN 1 ELSE 0 END) AS approved
            FROM `{$lk_table}` lk
            LEFT JOIN `{$cl_table}` cl ON cl.lk_id = lk.lk_id
              AND cl.pt_id = '{$pt_id}'
              AND DATE(cl.cl_created_at) BETWEEN '" . lc_sql_escape($dateFrom) . "' AND '" . lc_sql_escape($dateTo) . "'
            LEFT JOIN `{$cv_table}` cv ON cv.lk_id = lk.lk_id
              AND cv.pt_id = '{$pt_id}'
              AND DATE(cv.cv_created_at) BETWEEN '" . lc_sql_escape($dateFrom) . "' AND '" . lc_sql_escape($dateTo) . "'
            WHERE lk.pt_id = '{$pt_id}'
              {$link_sql}
            GROUP BY link_name, lk.lk_channel
            ORDER BY clicks DESC
            LIMIT {$limit} ", false);

        if ($result) {
            while ($row = sql_fetch_array($result)) {
                $rows[] = array(
                    'linkName' => (string) $row['link_name'],
                    'channel'  => (string) ($row['channel'] !== '' ? $row['channel'] : '미지정'),
                    'clicks'   => (int) $row['clicks'],
                    'dbs'      => (int) $row['dbs'],
                    'approved' => (int) $row['approved'],
                );
            }
        }

        return $rows;
    }
}

if (!function_exists('lc_partner_analytics_links')) {
    function lc_partner_analytics_links($pt_id, array $filters, $limit = 50)
    {
        if (!lc_db_installed()) {
            return array();
        }

        $pt_id = (int) $pt_id;
        $limit = max(1, min(100, (int) $limit));
        list($dateFrom, $dateTo) = lc_partner_analytics_resolve_range($filters);
        $cl_table = lc_table('clicks');
        $cv_table = lc_table('conversions');
        $lk_table = lc_table('links');
        $cp_table = lc_table('campaigns');
        $link_sql = lc_partner_analytics_link_sql($filters, 'lk');

        $compare_filter = '';
        if (!empty($filters['compareIds'])) {
            $ids = array_map('intval', $filters['compareIds']);
            $compare_filter = ' AND lk.lk_id IN (' . implode(',', $ids) . ') ';
        }

        $rows = array();
        $result = lc_sql_query(" SELECT
            lk.lk_id,
            lk.lk_code,
            lk.lk_channel,
            lk.lk_sub_id,
            c.cp_name,
            COUNT(DISTINCT cl.cl_id) AS clicks,
            COUNT(DISTINCT cv.cv_id) AS received,
            SUM(CASE WHEN cv.cv_status = '" . lc_sql_escape(LC_STATUS_APPROVED) . "' THEN 1 ELSE 0 END) AS approved,
            SUM(CASE WHEN cv.cv_status = '" . lc_sql_escape(LC_STATUS_REJECTED) . "' THEN 1 ELSE 0 END) AS canceled,
            SUM(CASE WHEN cv.cv_status = '" . lc_sql_escape(LC_STATUS_APPROVED) . "' THEN cv.cv_price ELSE 0 END) AS conf_rev
            FROM `{$lk_table}` lk
            INNER JOIN `{$cp_table}` c ON c.cp_id = lk.cp_id
            LEFT JOIN `{$cl_table}` cl ON cl.lk_id = lk.lk_id
              AND DATE(cl.cl_created_at) BETWEEN '" . lc_sql_escape($dateFrom) . "' AND '" . lc_sql_escape($dateTo) . "'
            LEFT JOIN `{$cv_table}` cv ON cv.lk_id = lk.lk_id
              AND DATE(cv.cv_created_at) BETWEEN '" . lc_sql_escape($dateFrom) . "' AND '" . lc_sql_escape($dateTo) . "'
            WHERE lk.pt_id = '{$pt_id}'
              {$link_sql}
              {$compare_filter}
            GROUP BY lk.lk_id
            ORDER BY clicks DESC, lk.lk_id DESC
            LIMIT {$limit} ", false);

        if ($result) {
            while ($row = sql_fetch_array($result)) {
                $clicks = (int) $row['clicks'];
                $received = (int) $row['received'];
                $approved = (int) $row['approved'];
                $rows[] = array(
                    'id'        => (int) $row['lk_id'],
                    'code'      => (string) $row['lk_code'],
                    'campaign'  => (string) $row['cp_name'],
                    'channel'   => (string) ($row['lk_channel'] !== '' ? $row['lk_channel'] : '미지정'),
                    'linkName'  => (string) ($row['lk_sub_id'] !== '' ? $row['lk_sub_id'] : '-'),
                    'clicks'    => $clicks,
                    'received'  => $received,
                    'approved'  => $approved,
                    'canceled'  => (int) $row['canceled'],
                    'convRate'  => $clicks > 0 ? round(($received / $clicks) * 100, 1) : 0,
                    'appRate'   => $received > 0 ? round(($approved / $received) * 100, 1) : 0,
                    'epc'       => $clicks > 0 ? (int) round(((int) $row['conf_rev']) / $clicks) : 0,
                    'confRev'   => (int) $row['conf_rev'],
                );
            }
        }

        return $rows;
    }
}

if (!function_exists('lc_partner_analytics_referrers')) {
    function lc_partner_analytics_referrers($pt_id, array $filters, $limit = 8)
    {
        if (!lc_db_installed()) {
            return array();
        }

        $pt_id = (int) $pt_id;
        $limit = max(1, min(20, (int) $limit));
        list($dateFrom, $dateTo) = lc_partner_analytics_resolve_range($filters);
        $cl_table = lc_table('clicks');
        $lk_table = lc_table('links');
        $link_sql = lc_partner_analytics_link_sql($filters, 'lk');

        $domains = array();
        $result = lc_sql_query(" SELECT cl.cl_referer
            FROM `{$cl_table}` cl
            INNER JOIN `{$lk_table}` lk ON lk.lk_id = cl.lk_id
            WHERE cl.pt_id = '{$pt_id}'
              AND DATE(cl.cl_created_at) BETWEEN '" . lc_sql_escape($dateFrom) . "' AND '" . lc_sql_escape($dateTo) . "'
              {$link_sql} ", false);

        if ($result) {
            while ($row = sql_fetch_array($result)) {
                $domain = lc_partner_analytics_referer_domain($row['cl_referer'] ?? '');
                if (!isset($domains[$domain])) {
                    $domains[$domain] = 0;
                }
                $domains[$domain]++;
            }
        }

        arsort($domains);
        $items = array();
        $total = array_sum($domains);
        foreach (array_slice($domains, 0, $limit, true) as $domain => $clicks) {
            $items[] = array(
                'domain'     => $domain,
                'clicks'     => (int) $clicks,
                'percentage' => $total > 0 ? (int) round(($clicks / $total) * 100) : 0,
            );
        }

        return $items;
    }
}

if (!function_exists('lc_partner_analytics_devices')) {
    function lc_partner_analytics_devices($pt_id, array $filters)
    {
        if (!lc_db_installed()) {
            return array();
        }

        $pt_id = (int) $pt_id;
        list($dateFrom, $dateTo) = lc_partner_analytics_resolve_range($filters);
        $cl_table = lc_table('clicks');
        $lk_table = lc_table('links');
        $link_sql = lc_partner_analytics_link_sql($filters, 'lk');

        $counts = array('mobile' => 0, 'desktop' => 0, 'unknown' => 0);
        $result = lc_sql_query(" SELECT cl.cl_user_agent
            FROM `{$cl_table}` cl
            INNER JOIN `{$lk_table}` lk ON lk.lk_id = cl.lk_id
            WHERE cl.pt_id = '{$pt_id}'
              AND DATE(cl.cl_created_at) BETWEEN '" . lc_sql_escape($dateFrom) . "' AND '" . lc_sql_escape($dateTo) . "'
              {$link_sql} ", false);

        if ($result) {
            while ($row = sql_fetch_array($result)) {
                $type = lc_partner_analytics_device_type($row['cl_user_agent'] ?? '');
                if (!isset($counts[$type])) {
                    $counts[$type] = 0;
                }
                $counts[$type]++;
            }
        }

        $total = array_sum($counts);
        $labels = array(
            'mobile'  => '모바일',
            'desktop' => 'PC',
            'unknown' => '기타',
        );
        $items = array();
        foreach ($counts as $type => $clicks) {
            if ($clicks <= 0) {
                continue;
            }
            $items[] = array(
                'device'     => $labels[$type] ?? $type,
                'deviceCode' => $type,
                'clicks'     => (int) $clicks,
                'percentage' => $total > 0 ? (int) round(($clicks / $total) * 100) : 0,
            );
        }

        usort($items, function ($a, $b) {
            return $b['clicks'] <=> $a['clicks'];
        });

        return $items;
    }
}

if (!function_exists('lc_partner_analytics_campaigns')) {
    function lc_partner_analytics_campaigns($pt_id, array $filters, $limit = 10)
    {
        if (!lc_db_installed()) {
            return array();
        }

        $pt_id = (int) $pt_id;
        $limit = max(1, min(20, (int) $limit));
        list($dateFrom, $dateTo) = lc_partner_analytics_resolve_range($filters);
        $cl_table = lc_table('clicks');
        $cv_table = lc_table('conversions');
        $lk_table = lc_table('links');
        $cp_table = lc_table('campaigns');
        $link_sql = lc_partner_analytics_link_sql($filters, 'lk');

        $rows = array();
        $result = lc_sql_query(" SELECT c.cp_name AS campaign,
            COUNT(DISTINCT cl.cl_id) AS clicks,
            COUNT(DISTINCT cv.cv_id) AS received,
            SUM(CASE WHEN cv.cv_status = '" . lc_sql_escape(LC_STATUS_APPROVED) . "' THEN 1 ELSE 0 END) AS approved,
            SUM(CASE WHEN cv.cv_status = '" . lc_sql_escape(LC_STATUS_APPROVED) . "' THEN cv.cv_price ELSE 0 END) AS conf_rev
            FROM `{$cp_table}` c
            INNER JOIN `{$lk_table}` lk ON lk.cp_id = c.cp_id AND lk.pt_id = '{$pt_id}'
            LEFT JOIN `{$cl_table}` cl ON cl.lk_id = lk.lk_id
              AND DATE(cl.cl_created_at) BETWEEN '" . lc_sql_escape($dateFrom) . "' AND '" . lc_sql_escape($dateTo) . "'
            LEFT JOIN `{$cv_table}` cv ON cv.lk_id = lk.lk_id
              AND DATE(cv.cv_created_at) BETWEEN '" . lc_sql_escape($dateFrom) . "' AND '" . lc_sql_escape($dateTo) . "'
            WHERE lk.pt_id = '{$pt_id}'
              {$link_sql}
            GROUP BY c.cp_id
            ORDER BY conf_rev DESC, clicks DESC
            LIMIT {$limit} ", false);

        if ($result) {
            while ($row = sql_fetch_array($result)) {
                $received = (int) $row['received'];
                $approved = (int) $row['approved'];
                $rows[] = array(
                    'campaign' => (string) $row['campaign'],
                    'clicks'   => (int) $row['clicks'],
                    'received' => $received,
                    'approved' => $approved,
                    'appRate'  => $received > 0 ? round(($approved / $received) * 100, 1) . '%' : '-',
                    'confRev'  => (int) $row['conf_rev'],
                );
            }
        }

        return $rows;
    }
}

if (!function_exists('lc_partner_analytics_for_api')) {
    function lc_partner_analytics_for_api($pt_id, array $filters = array())
    {
        $filters = lc_partner_analytics_parse_filters($filters);
        list($dateFrom, $dateTo) = lc_partner_analytics_resolve_range($filters);
        $summary = lc_partner_analytics_summary($pt_id, $filters);

        $link_filters = $filters;
        $link_filters['compareIds'] = array();

        return array(
            'summary'       => $summary,
            'range'         => array(
                'dateFrom' => $dateFrom,
                'dateTo'   => $dateTo,
                'period'   => (int) $filters['period'],
            ),
            'funnel'        => array(
                'clicks'    => (int) ($summary['totalClicks'] ?? 0),
                'received'  => (int) ($summary['totalDb'] ?? 0),
                'approved'  => (int) ($summary['approvedDb'] ?? 0),
                'confirmed' => (int) ($summary['approvedDb'] ?? 0),
            ),
            'chart'         => lc_partner_analytics_chart($pt_id, $filters),
            'channels'      => lc_partner_analytics_channels($pt_id, $filters),
            'linkNames'     => lc_partner_analytics_link_names($pt_id, $filters),
            'links'         => lc_partner_analytics_links($pt_id, $link_filters),
            'compareLinks'  => !empty($filters['compareIds'])
                ? lc_partner_analytics_links($pt_id, $filters, 5)
                : array(),
            'referrers'     => lc_partner_analytics_referrers($pt_id, $filters),
            'devices'       => lc_partner_analytics_devices($pt_id, $filters),
            'campaigns'     => lc_partner_analytics_campaigns($pt_id, $filters),
            'filterOptions' => lc_partner_analytics_filter_options($pt_id),
        );
    }
}
