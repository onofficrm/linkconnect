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

        if (!empty($filters['type'])) {
            $type = strtolower((string) $filters['type']);
            $where .= " AND cp_type = '" . lc_sql_escape($type) . "' ";
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
        $type = !empty($filters['type']) ? strtolower((string) $filters['type']) : '';

        if (lc_db_installed()) {
            $rows = lc_campaign_list_active($filters);

            if ($type === 'cps' && count($rows) === 0 && function_exists('lc_sample_cps_items')) {
                return lc_campaign_cps_sample_for_api($filters);
            }

            return array_map('lc_campaign_to_api', $rows);
        }

        if ($type === 'cps' && function_exists('lc_sample_cps_items')) {
            return lc_campaign_cps_sample_for_api($filters);
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

if (!function_exists('lc_campaign_cps_sample_for_api')) {
    function lc_campaign_cps_sample_for_api(array $filters = array())
    {
        if (!function_exists('lc_sample_cps_items')) {
            return array();
        }

        $category_map = array(
            '건강' => '건강',
            '뷰티' => '뷰티',
            '생활' => '생활',
        );

        $items = array();
        foreach (lc_sample_cps_items() as $item) {
            $title = (string) ($item['brand'] ?? '');
            $category = '쇼핑몰';
            foreach ($category_map as $needle => $cat) {
                if (mb_strpos($title, $needle, 0, 'UTF-8') !== false) {
                    $category = $cat;
                    break;
                }
            }

            if (!empty($filters['category']) && $filters['category'] !== '전체' && $category !== $filters['category']) {
                continue;
            }
            if (!empty($filters['q'])) {
                $q = mb_strtolower((string) $filters['q'], 'UTF-8');
                $hay = mb_strtolower($title . ' ' . $category, 'UTF-8');
                if (mb_strpos($hay, $q, 0, 'UTF-8') === false) {
                    continue;
                }
            }

            $items[] = array(
                'id'                => (int) $item['id'],
                'code'              => 'CPS-' . str_pad((string) $item['id'], 3, '0', STR_PAD_LEFT),
                'title'             => $title,
                'category'          => $category,
                'type'              => 'cps',
                'description'       => $title . ' 구매 연동 CPS 캠페인',
                'price'             => 0,
                'priceFormatted'    => (string) ($item['rate'] ?? ''),
                'approvalRate'      => (string) ($item['rate'] ?? ''),
                'avgTime'           => (string) ($item['cookie'] ?? ''),
                'allowedChannels'   => '블로그, SNS, 유튜브, 커뮤니티',
                'forbiddenChannels' => '스팸, 브랜드 사칭, 허위광고',
                'status'            => (string) ($item['badge'] ?? '진행중'),
                'statusCode'        => LC_STATUS_ACTIVE,
                'badge'             => (string) ($item['badge'] ?? ''),
                'recommended'       => ($item['badge'] ?? '') === '인기',
                'landingUrl'        => '',
            );
        }

        return $items;
    }
}

if (!function_exists('lc_campaign_admin_status_ui')) {
    function lc_campaign_admin_status_ui($status, $low_balance = false)
    {
        if ($low_balance && $status === LC_STATUS_ACTIVE) {
            return '광고비부족';
        }

        $labels = array(
            LC_STATUS_ACTIVE => '운영중',
            'paused'         => '일시중지',
            'ended'          => '종료',
            LC_STATUS_DRAFT  => '검수중',
            'closing'        => '마감임박',
        );

        return isset($labels[$status]) ? $labels[$status] : (string) $status;
    }
}

if (!function_exists('lc_campaign_merchant_status_ui')) {
    function lc_campaign_merchant_status_ui($status)
    {
        $labels = array(
            LC_STATUS_ACTIVE => '진행중',
            'paused'         => '일시중지',
            'ended'          => '종료',
            LC_STATUS_DRAFT  => '대기중',
            'closing'        => '마감임박',
        );

        return isset($labels[$status]) ? $labels[$status] : (string) $status;
    }
}

if (!function_exists('lc_campaign_get_by_id')) {
    function lc_campaign_get_by_id($cp_id)
    {
        if (!lc_db_installed()) {
            return null;
        }

        $cp_id = (int) $cp_id;
        $table = lc_table('campaigns');

        return lc_sql_fetch(" SELECT * FROM `{$table}` WHERE cp_id = '{$cp_id}' LIMIT 1 ");
    }
}

if (!function_exists('lc_campaign_generate_code')) {
    function lc_campaign_generate_code()
    {
        if (!lc_db_installed()) {
            return 'CPA-00001';
        }

        $table = lc_table('campaigns');
        $row = lc_sql_fetch(" SELECT cp_id FROM `{$table}` ORDER BY cp_id DESC LIMIT 1 ");
        $next = $row ? (int) $row['cp_id'] + 1 : 1;

        return 'CPA-' . str_pad((string) $next, 5, '0', STR_PAD_LEFT);
    }
}

if (!function_exists('lc_campaign_list_admin')) {
    /**
     * @param array{status?:string,category?:string,q?:string} $filters
     * @return array<int,array>
     */
    function lc_campaign_list_admin(array $filters = array())
    {
        if (!lc_db_installed()) {
            return array();
        }

        $cp_table = lc_table('campaigns');
        $mt_table = lc_table('merchants');
        $cv_table = lc_table('conversions');
        $where = '1=1';

        if (!empty($filters['status'])) {
            $status = (string) $filters['status'];
            if ($status === 'low_balance') {
                $where .= " AND c.cp_status = '" . lc_sql_escape(LC_STATUS_ACTIVE) . "' AND m.mt_balance < c.cp_price ";
            } elseif ($status === LC_STATUS_ACTIVE) {
                $where .= " AND c.cp_status = '" . lc_sql_escape(LC_STATUS_ACTIVE) . "' AND m.mt_balance >= c.cp_price ";
            } else {
                $where .= " AND c.cp_status = '" . lc_sql_escape($status) . "' ";
            }
        }

        if (!empty($filters['category']) && $filters['category'] !== '전체') {
            $where .= " AND c.cp_category = '" . lc_sql_escape($filters['category']) . "' ";
        }

        if (!empty($filters['q'])) {
            $q = lc_sql_escape($filters['q']);
            $where .= " AND (c.cp_name LIKE '%{$q}%' OR c.cp_code LIKE '%{$q}%' OR m.mt_company LIKE '%{$q}%') ";
        }

        $sql = " SELECT c.*, m.mt_company, m.mt_code, m.mt_balance,
            COUNT(cv.cv_id) AS total_db,
            SUM(CASE WHEN cv.cv_status = '" . lc_sql_escape(LC_STATUS_APPROVED) . "' THEN 1 ELSE 0 END) AS approved_db,
            SUM(CASE WHEN cv.cv_status = '" . lc_sql_escape(LC_STATUS_REJECTED) . "' THEN 1 ELSE 0 END) AS canceled_db,
            SUM(CASE WHEN cv.cv_status = '" . lc_sql_escape(LC_STATUS_APPROVED) . "' THEN cv.cv_price ELSE 0 END) AS spend
            FROM `{$cp_table}` c
            LEFT JOIN `{$mt_table}` m ON m.mt_id = c.mt_id
            LEFT JOIN `{$cv_table}` cv ON cv.cp_id = c.cp_id
            WHERE {$where}
            GROUP BY c.cp_id
            ORDER BY c.cp_id DESC ";

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

if (!function_exists('lc_campaign_admin_summary')) {
    function lc_campaign_admin_summary()
    {
        if (!lc_db_installed()) {
            return array(
                'total'       => 0,
                'active'      => 0,
                'paused'      => 0,
                'lowBalance'  => 0,
                'avgPrice'    => 0,
                'avgApproval' => 0,
            );
        }

        $cp_table = lc_table('campaigns');
        $mt_table = lc_table('merchants');
        $cv_table = lc_table('conversions');

        $row = lc_sql_fetch(" SELECT
            COUNT(*) AS total_cnt,
            SUM(CASE WHEN c.cp_status = '" . lc_sql_escape(LC_STATUS_ACTIVE) . "' AND m.mt_balance >= c.cp_price THEN 1 ELSE 0 END) AS active_cnt,
            SUM(CASE WHEN c.cp_status = 'paused' THEN 1 ELSE 0 END) AS paused_cnt,
            SUM(CASE WHEN c.cp_status = '" . lc_sql_escape(LC_STATUS_ACTIVE) . "' AND m.mt_balance < c.cp_price THEN 1 ELSE 0 END) AS low_balance_cnt,
            AVG(c.cp_price) AS avg_price
            FROM `{$cp_table}` c
            LEFT JOIN `{$mt_table}` m ON m.mt_id = c.mt_id ");

        $rate_row = lc_sql_fetch(" SELECT
            COUNT(*) AS total_cnt,
            SUM(CASE WHEN cv_status = '" . lc_sql_escape(LC_STATUS_APPROVED) . "' THEN 1 ELSE 0 END) AS approved_cnt
            FROM `{$cv_table}` ");
        $total_cv = (int) ($rate_row['total_cnt'] ?? 0);
        $approved_cv = (int) ($rate_row['approved_cnt'] ?? 0);

        return array(
            'total'       => (int) ($row['total_cnt'] ?? 0),
            'active'      => (int) ($row['active_cnt'] ?? 0),
            'paused'      => (int) ($row['paused_cnt'] ?? 0),
            'lowBalance'  => (int) ($row['low_balance_cnt'] ?? 0),
            'avgPrice'    => (int) round((float) ($row['avg_price'] ?? 0)),
            'avgApproval' => $total_cv > 0 ? round(($approved_cv / $total_cv) * 100, 1) : 0,
        );
    }
}

if (!function_exists('lc_campaign_to_admin_api')) {
    function lc_campaign_to_admin_api(array $row)
    {
        $total = (int) ($row['total_db'] ?? 0);
        $approved = (int) ($row['approved_db'] ?? 0);
        $canceled = (int) ($row['canceled_db'] ?? 0);
        $rate = $total > 0 ? round(($approved / $total) * 100, 1) . '%' : '-';
        $cancel_rate = $total > 0 ? round(($canceled / $total) * 100, 1) . '%' : '-';
        $price = (int) $row['cp_price'];
        $balance = (int) ($row['mt_balance'] ?? 0);
        $low_balance = $row['cp_status'] === LC_STATUS_ACTIVE && $balance < $price;

        return array(
            'id'              => (int) $row['cp_id'],
            'code'            => (string) $row['cp_code'],
            'name'            => (string) $row['cp_name'],
            'advertiser'      => (string) ($row['mt_company'] ?? ''),
            'mtId'            => (int) ($row['mt_id'] ?? 0),
            'category'        => (string) $row['cp_category'],
            'type'            => strtoupper((string) $row['cp_type']),
            'partnerPrice'    => $price,
            'advertiserPrice' => $price,
            'margin'          => 0,
            'totalDb'         => $total,
            'approvedDb'      => $approved,
            'canceledDb'      => $canceled,
            'spend'           => (int) ($row['spend'] ?? 0),
            'rate'            => $rate,
            'cancelRate'      => $cancel_rate,
            'status'          => lc_campaign_admin_status_ui($row['cp_status'], $low_balance),
            'statusCode'      => (string) $row['cp_status'],
            'lowBalance'      => $low_balance,
            'description'     => (string) ($row['cp_description'] ?? ''),
            'approvalRate'    => (string) $row['cp_approval_rate'],
            'avgTime'         => (string) $row['cp_avg_time'],
            'allowedChannels' => (string) $row['cp_allowed_channels'],
            'forbiddenChannels' => (string) $row['cp_forbidden_channels'],
            'landingUrl'      => (string) $row['cp_landing_url'],
            'badge'           => (string) $row['cp_badge'],
            'recommended'     => (bool) (int) ($row['cp_recommended'] ?? 0),
        );
    }
}

if (!function_exists('lc_campaign_admin_for_api')) {
    function lc_campaign_admin_for_api(array $filters = array())
    {
        return array_map('lc_campaign_to_admin_api', lc_campaign_list_admin($filters));
    }
}

if (!function_exists('lc_campaign_list_for_merchant')) {
    function lc_campaign_list_for_merchant($mt_id, array $filters = array())
    {
        if (!lc_db_installed()) {
            return array();
        }

        $mt_id = (int) $mt_id;
        $cp_table = lc_table('campaigns');
        $cv_table = lc_table('conversions');
        $where = " c.mt_id = '{$mt_id}' ";

        if (!empty($filters['status'])) {
            $where .= " AND c.cp_status = '" . lc_sql_escape($filters['status']) . "' ";
        }

        $sql = " SELECT c.*,
            COUNT(cv.cv_id) AS total_db,
            SUM(CASE WHEN cv.cv_status = '" . lc_sql_escape(LC_STATUS_APPROVED) . "' THEN cv.cv_price ELSE 0 END) AS spend
            FROM `{$cp_table}` c
            LEFT JOIN `{$cv_table}` cv ON cv.cp_id = c.cp_id
            WHERE {$where}
            GROUP BY c.cp_id
            ORDER BY c.cp_id DESC ";

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

if (!function_exists('lc_campaign_merchant_to_api')) {
    function lc_campaign_merchant_to_api(array $row)
    {
        return array(
            'id'       => (int) $row['cp_id'],
            'code'     => (string) $row['cp_code'],
            'name'     => (string) $row['cp_name'],
            'type'     => strtoupper((string) $row['cp_type']),
            'status'   => lc_campaign_merchant_status_ui($row['cp_status']),
            'statusCode' => (string) $row['cp_status'],
            'cpa'      => (int) $row['cp_price'],
            'budget'   => 0,
            'spend'    => (int) ($row['spend'] ?? 0),
            'dbCount'  => (int) ($row['total_db'] ?? 0),
            'category' => (string) $row['cp_category'],
        );
    }
}

if (!function_exists('lc_campaign_merchant_summary')) {
    function lc_campaign_merchant_summary($mt_id)
    {
        $rows = lc_campaign_list_for_merchant($mt_id);
        $summary = array(
            'total'   => count($rows),
            'active'  => 0,
            'pending' => 0,
            'ended'   => 0,
        );

        foreach ($rows as $row) {
            $status = (string) $row['cp_status'];
            if ($status === LC_STATUS_ACTIVE || $status === 'closing') {
                $summary['active']++;
            } elseif ($status === LC_STATUS_DRAFT) {
                $summary['pending']++;
            } elseif ($status === 'ended') {
                $summary['ended']++;
            }
        }

        return $summary;
    }
}

if (!function_exists('lc_campaign_save')) {
    /**
     * @param array<string,mixed> $payload
     * @return array{ok:bool,message:string,campaign?:array|null}
     */
    function lc_campaign_save(array $payload, $cp_id = 0)
    {
        if (!lc_db_installed()) {
            return array('ok' => false, 'message' => 'DB가 설치되지 않았습니다.');
        }

        $cp_id = (int) $cp_id;
        $mt_id = isset($payload['mtId']) ? (int) $payload['mtId'] : 0;
        $name = isset($payload['name']) ? trim((string) $payload['name']) : '';
        $category = isset($payload['category']) ? trim((string) $payload['category']) : '';
        $type = isset($payload['type']) ? strtolower(trim((string) $payload['type'])) : 'cpa';
        $price = isset($payload['price']) ? (int) $payload['price'] : (isset($payload['partnerPrice']) ? (int) $payload['partnerPrice'] : 0);

        if ($name === '') {
            return array('ok' => false, 'message' => '광고상품명을 입력해주세요.');
        }

        if ($cp_id <= 0 && $mt_id <= 0) {
            return array('ok' => false, 'message' => '광고주를 선택해주세요.');
        }

        if ($price <= 0) {
            return array('ok' => false, 'message' => '단가를 입력해주세요.');
        }

        $table = lc_table('campaigns');
        $fields = array(
            'cp_name'               => $name,
            'cp_category'           => $category,
            'cp_type'               => $type,
            'cp_price'              => $price,
            'cp_approval_rate'      => isset($payload['approvalRate']) ? trim((string) $payload['approvalRate']) : '',
            'cp_avg_time'           => isset($payload['avgTime']) ? trim((string) $payload['avgTime']) : '',
            'cp_allowed_channels'   => isset($payload['allowedChannels']) ? trim((string) $payload['allowedChannels']) : '',
            'cp_forbidden_channels' => isset($payload['forbiddenChannels']) ? trim((string) $payload['forbiddenChannels']) : '',
            'cp_description'        => isset($payload['description']) ? trim((string) $payload['description']) : '',
            'cp_landing_url'        => isset($payload['landingUrl']) ? trim((string) $payload['landingUrl']) : '',
            'cp_badge'              => isset($payload['badge']) ? trim((string) $payload['badge']) : '',
            'cp_recommended'        => !empty($payload['recommended']) ? 1 : 0,
        );

        if (isset($payload['statusCode']) && $payload['statusCode'] !== '') {
            $fields['cp_status'] = (string) $payload['statusCode'];
        }

        $is_update = $cp_id > 0;

        if ($is_update) {
            $existing = lc_campaign_get_by_id($cp_id);
            if (!$existing) {
                return array('ok' => false, 'message' => '캠페인을 찾을 수 없습니다.');
            }

            if ($mt_id > 0) {
                $fields['mt_id'] = $mt_id;
            }

            $sets = array();
            foreach ($fields as $key => $value) {
                if ($key === 'cp_recommended' || $key === 'cp_price' || $key === 'mt_id') {
                    $sets[] = "`{$key}` = '" . (int) $value . "'";
                } else {
                    $sets[] = "`{$key}` = '" . lc_sql_escape((string) $value) . "'";
                }
            }
            $sets[] = 'cp_updated_at = NOW()';

            lc_sql_query(" UPDATE `{$table}` SET " . implode(', ', $sets) . " WHERE cp_id = '{$cp_id}' ", false);
        } else {
            $code = lc_campaign_generate_code();
            $status = isset($fields['cp_status']) ? $fields['cp_status'] : LC_STATUS_DRAFT;

            lc_sql_query(" INSERT INTO `{$table}` SET
                mt_id = '{$mt_id}',
                cp_code = '" . lc_sql_escape($code) . "',
                cp_name = '" . lc_sql_escape($fields['cp_name']) . "',
                cp_category = '" . lc_sql_escape($fields['cp_category']) . "',
                cp_type = '" . lc_sql_escape($fields['cp_type']) . "',
                cp_price = '" . (int) $fields['cp_price'] . "',
                cp_approval_rate = '" . lc_sql_escape($fields['cp_approval_rate']) . "',
                cp_avg_time = '" . lc_sql_escape($fields['cp_avg_time']) . "',
                cp_allowed_channels = '" . lc_sql_escape($fields['cp_allowed_channels']) . "',
                cp_forbidden_channels = '" . lc_sql_escape($fields['cp_forbidden_channels']) . "',
                cp_description = '" . lc_sql_escape($fields['cp_description']) . "',
                cp_landing_url = '" . lc_sql_escape($fields['cp_landing_url']) . "',
                cp_status = '" . lc_sql_escape($status) . "',
                cp_badge = '" . lc_sql_escape($fields['cp_badge']) . "',
                cp_recommended = '" . (int) $fields['cp_recommended'] . "',
                cp_created_at = NOW(),
                cp_updated_at = NOW() ", false);

            $cp_id = (int) lc_sql_insert_id();
        }

        $saved = lc_campaign_get_by_id($cp_id);
        $api_campaign = null;
        if (is_array($saved)) {
            $saved['mt_company'] = '';
            $saved['mt_code'] = '';
            $saved['mt_balance'] = 0;
            $saved['total_db'] = 0;
            $saved['approved_db'] = 0;
            $saved['canceled_db'] = 0;
            $saved['spend'] = 0;
            if ($saved['mt_id'] > 0 && function_exists('lc_get_merchant_by_id')) {
                $merchant = lc_get_merchant_by_id((int) $saved['mt_id']);
                if (is_array($merchant)) {
                    $saved['mt_company'] = $merchant['mt_company'];
                    $saved['mt_code'] = $merchant['mt_code'];
                    $saved['mt_balance'] = $merchant['mt_balance'];
                }
            }
            $api_campaign = lc_campaign_to_admin_api($saved);
        }

        return array(
            'ok'       => true,
            'message'  => $is_update ? '광고상품이 저장되었습니다.' : '광고상품이 등록되었습니다.',
            'campaign' => $api_campaign,
        );
    }
}

if (!function_exists('lc_campaign_update_status')) {
    /**
     * @return array{ok:bool,message:string,campaign?:array|null}
     */
    function lc_campaign_update_status($cp_id, $status)
    {
        if (!lc_db_installed()) {
            return array('ok' => false, 'message' => 'DB가 설치되지 않았습니다.');
        }

        $cp_id = (int) $cp_id;
        $allowed = array(LC_STATUS_ACTIVE, 'paused', 'ended', LC_STATUS_DRAFT, 'closing');
        if (!in_array($status, $allowed, true)) {
            return array('ok' => false, 'message' => '유효하지 않은 상태입니다.');
        }

        $existing = lc_campaign_get_by_id($cp_id);
        if (!$existing) {
            return array('ok' => false, 'message' => '캠페인을 찾을 수 없습니다.');
        }

        $table = lc_table('campaigns');
        lc_sql_query(" UPDATE `{$table}` SET cp_status = '" . lc_sql_escape($status) . "', cp_updated_at = NOW() WHERE cp_id = '{$cp_id}' ", false);

        $saved = lc_campaign_get_by_id($cp_id);
        $saved['mt_company'] = '';
        $saved['mt_balance'] = 0;
        if ($saved['mt_id'] > 0 && function_exists('lc_get_merchant_by_id')) {
            $merchant = lc_get_merchant_by_id((int) $saved['mt_id']);
            if (is_array($merchant)) {
                $saved['mt_company'] = $merchant['mt_company'];
                $saved['mt_balance'] = $merchant['mt_balance'];
            }
        }

        return array(
            'ok'       => true,
            'message'  => '상태가 변경되었습니다.',
            'campaign' => lc_campaign_to_admin_api($saved),
        );
    }
}
