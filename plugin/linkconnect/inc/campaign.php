<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

if (!function_exists('lc_campaign_status_label')) {
    function lc_campaign_status_label($status)
    {
        $labels = array(
            LC_STATUS_DRAFT  => '준비중',
            LC_STATUS_ACTIVE => '진행중',
            'paused'         => '일시중지',
            'ended'          => '종료',
            'closing'        => '마감임박',
        );

        return isset($labels[$status]) ? $labels[$status] : (string) $status;
    }
}

if (!function_exists('lc_campaign_to_api')) {
    function lc_campaign_to_api(array $row)
    {
        return array(
            'id'                => (int) $row['cp_id'],
            'code'              => (string) $row['cp_code'],
            'title'             => (string) $row['cp_name'],
            'category'          => (string) $row['cp_category'],
            'type'              => (string) $row['cp_type'],
            'description'       => (string) ($row['cp_description'] ?? ''),
            'price'             => (int) $row['cp_price'],
            'priceFormatted'    => number_format((int) $row['cp_price']),
            'approvalRate'      => (string) $row['cp_approval_rate'],
            'avgTime'           => (string) $row['cp_avg_time'],
            'allowedChannels'   => (string) $row['cp_allowed_channels'],
            'forbiddenChannels' => (string) $row['cp_forbidden_channels'],
            'status'            => lc_campaign_status_label($row['cp_status']),
            'statusCode'        => (string) $row['cp_status'],
            'badge'             => (string) $row['cp_badge'],
            'recommended'       => (bool) (int) ($row['cp_recommended'] ?? 0),
            'landingUrl'        => (string) $row['cp_landing_url'],
        );
    }
}

if (!function_exists('lc_campaign_list_active')) {
    /**
     * @param array{category?:string,q?:string} $filters
     * @return array<int,array>
     */
    function lc_campaign_list_active(array $filters = array())
    {
        if (!lc_db_installed()) {
            return array();
        }

        $table = lc_table('campaigns');
        $where = " cp_status = '" . lc_sql_escape(LC_STATUS_ACTIVE) . "' ";

        if (!empty($filters['category']) && $filters['category'] !== '전체') {
            $where .= " AND cp_category = '" . lc_sql_escape($filters['category']) . "' ";
        }

        if (!empty($filters['q'])) {
            $q = lc_sql_escape($filters['q']);
            $where .= " AND (cp_name LIKE '%{$q}%' OR cp_description LIKE '%{$q}%') ";
        }

        $rows = array();
        $result = lc_sql_query(" SELECT * FROM `{$table}` WHERE {$where} ORDER BY cp_recommended DESC, cp_sort ASC, cp_id DESC ", false);

        if ($result) {
            while ($row = sql_fetch_array($result)) {
                $rows[] = $row;
            }
        }

        return $rows;
    }
}

if (!function_exists('lc_campaign_seed_defaults')) {
    /**
     * @return array{ok:bool,inserted:int}
     */
    function lc_campaign_seed_defaults()
    {
        if (!lc_db_installed() || !function_exists('lc_sample_cpa_campaigns')) {
            return array('ok' => false, 'inserted' => 0);
        }

        $table = lc_table('campaigns');
        $count_row = lc_sql_fetch(" SELECT COUNT(*) AS cnt FROM `{$table}` ");
        if ($count_row && (int) $count_row['cnt'] > 0) {
            return array('ok' => true, 'inserted' => 0);
        }

        $inserted = 0;
        $sort = 0;
        foreach (lc_sample_cpa_campaigns() as $item) {
            $sort++;
            $code = 'CPA-' . str_pad((string) $item['id'], 3, '0', STR_PAD_LEFT);
            $status = LC_STATUS_ACTIVE;
            if (isset($item['status']) && $item['status'] === '마감임박') {
                $status = 'closing';
            }

            $sql = " INSERT INTO `{$table}` SET
                cp_code = '" . lc_sql_escape($code) . "',
                cp_name = '" . lc_sql_escape($item['title']) . "',
                cp_category = '" . lc_sql_escape($item['category']) . "',
                cp_type = 'cpa',
                cp_price = '" . (int) $item['price'] . "',
                cp_approval_rate = '" . lc_sql_escape($item['approval_rate']) . "',
                cp_avg_time = '" . lc_sql_escape($item['avg_time']) . "',
                cp_allowed_channels = '" . lc_sql_escape($item['allowed_channels']) . "',
                cp_forbidden_channels = '" . lc_sql_escape($item['forbidden_channels']) . "',
                cp_description = '" . lc_sql_escape($item['title'] . ' 캠페인') . "',
                cp_status = '" . lc_sql_escape($status) . "',
                cp_badge = '" . lc_sql_escape($item['badge'] ?? '') . "',
                cp_recommended = '" . (!empty($item['recommended']) ? 1 : 0) . "',
                cp_sort = '{$sort}',
                cp_created_at = NOW(),
                cp_updated_at = NOW() ";
            lc_sql_query($sql, false);
            $inserted++;
        }

        return array('ok' => true, 'inserted' => $inserted);
    }
}

if (!function_exists('lc_campaign_list_for_api')) {
    function lc_campaign_list_for_api(array $filters = array())
    {
        if (lc_db_installed()) {
            $rows = lc_campaign_list_active($filters);

            return array_map('lc_campaign_to_api', $rows);
        }

        if (!function_exists('lc_sample_cpa_campaigns')) {
            return array();
        }

        $items = array();
        foreach (lc_sample_cpa_campaigns() as $item) {
            if (!empty($filters['category']) && $filters['category'] !== '전체' && $item['category'] !== $filters['category']) {
                continue;
            }
            if (!empty($filters['q'])) {
                $q = mb_strtolower((string) $filters['q'], 'UTF-8');
                $hay = mb_strtolower($item['title'] . ' ' . ($item['category'] ?? ''), 'UTF-8');
                if (mb_strpos($hay, $q, 0, 'UTF-8') === false) {
                    continue;
                }
            }

            $items[] = array(
                'id'                => (int) $item['id'],
                'code'              => 'CPA-' . str_pad((string) $item['id'], 3, '0', STR_PAD_LEFT),
                'title'             => (string) $item['title'],
                'category'          => (string) $item['category'],
                'type'              => 'cpa',
                'description'       => (string) $item['title'] . ' 캠페인',
                'price'             => (int) $item['price'],
                'priceFormatted'    => number_format((int) $item['price']),
                'approvalRate'      => (string) $item['approval_rate'],
                'avgTime'           => (string) $item['avg_time'],
                'allowedChannels'   => (string) $item['allowed_channels'],
                'forbiddenChannels' => (string) $item['forbidden_channels'],
                'status'            => (string) $item['status'],
                'statusCode'        => LC_STATUS_ACTIVE,
                'badge'             => (string) ($item['badge'] ?? ''),
                'recommended'       => !empty($item['recommended']),
                'landingUrl'        => '',
            );
        }

        return $items;
    }
}
