<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

if (!function_exists('lc_conversion_status_label')) {
    function lc_conversion_status_label($status)
    {
        $labels = array(
            LC_STATUS_PENDING  => '신규접수',
            LC_STATUS_APPROVED => '승인완료',
            LC_STATUS_REJECTED => '취소/무효',
            LC_STATUS_SETTLED  => '정산완료',
        );

        return isset($labels[$status]) ? $labels[$status] : (string) $status;
    }
}

if (!function_exists('lc_conversion_mask_phone')) {
    function lc_conversion_mask_phone($phone)
    {
        $phone = preg_replace('/[^0-9]/', '', (string) $phone);
        if (strlen($phone) < 8) {
            return (string) $phone;
        }

        return substr($phone, 0, 3) . '-****-' . substr($phone, -4);
    }
}

if (!function_exists('lc_conversion_needs_action')) {
    function lc_conversion_needs_action($status)
    {
        return $status === LC_STATUS_PENDING;
    }
}

if (!function_exists('lc_conversion_get_by_id')) {
    function lc_conversion_get_by_id($cv_id)
    {
        if (!lc_db_installed()) {
            return null;
        }

        $cv_id = (int) $cv_id;
        $table = lc_table('conversions');

        return sql_fetch(" SELECT * FROM `{$table}` WHERE cv_id = '{$cv_id}' LIMIT 1 ");
    }
}

if (!function_exists('lc_conversion_merchant_campaign_ids')) {
    function lc_conversion_merchant_campaign_ids($mt_id)
    {
        if (!lc_db_installed()) {
            return array();
        }

        $mt_id = (int) $mt_id;
        $table = lc_table('campaigns');
        $ids = array();
        $result = sql_query(" SELECT cp_id FROM `{$table}` WHERE mt_id = '{$mt_id}' ", false);

        if ($result) {
            while ($row = sql_fetch_array($result)) {
                $ids[] = (int) $row['cp_id'];
            }
        }

        return $ids;
    }
}

if (!function_exists('lc_conversion_list_for_merchant')) {
    function lc_conversion_list_for_merchant($mt_id, array $filters = array())
    {
        if (!lc_db_installed()) {
            return array();
        }

        $mt_id = (int) $mt_id;
        $campaign_ids = lc_conversion_merchant_campaign_ids($mt_id);
        if (!$campaign_ids) {
            return array();
        }

        $cv_table = lc_table('conversions');
        $cp_table = lc_table('campaigns');
        $pt_table = lc_table('partners');

        $where = ' c.cp_id IN (' . implode(',', array_map('intval', $campaign_ids)) . ') ';

        if (!empty($filters['status'])) {
            $where .= " AND cv.cv_status = '" . lc_sql_escape($filters['status']) . "' ";
        }

        if (!empty($filters['q'])) {
            $q = lc_sql_escape($filters['q']);
            $where .= " AND (cv.cv_name LIKE '%{$q}%' OR cv.cv_phone LIKE '%{$q}%' OR cv.cv_code LIKE '%{$q}%') ";
        }

        if (!empty($filters['needs_action'])) {
            $where .= " AND cv.cv_status = '" . lc_sql_escape(LC_STATUS_PENDING) . "' ";
        }

        $sql = " SELECT cv.*, c.cp_name, p.pt_code
            FROM `{$cv_table}` cv
            INNER JOIN `{$cp_table}` c ON c.cp_id = cv.cp_id
            LEFT JOIN `{$pt_table}` p ON p.pt_id = cv.pt_id
            WHERE {$where}
            ORDER BY cv.cv_id DESC
            LIMIT 200 ";

        $rows = array();
        $result = sql_query($sql, false);
        if ($result) {
            while ($row = sql_fetch_array($result)) {
                $rows[] = $row;
            }
        }

        return $rows;
    }
}

if (!function_exists('lc_conversion_to_api_merchant')) {
    function lc_conversion_to_api_merchant(array $row, $mask_phone = true)
    {
        $status = (string) $row['cv_status'];

        return array(
            'id'          => (string) $row['cv_code'],
            'cvId'        => (int) $row['cv_id'],
            'date'        => date('Y.m.d H:i', strtotime($row['cv_created_at'])),
            'campaign'    => (string) ($row['cp_name'] ?? ''),
            'name'        => (string) $row['cv_name'],
            'phone'       => $mask_phone ? lc_conversion_mask_phone($row['cv_phone']) : (string) $row['cv_phone'],
            'email'       => (string) ($row['cv_email'] ?? ''),
            'region'      => (string) ($row['cv_region'] ?? ''),
            'inquiry'     => (string) ($row['cv_inquiry'] ?? ''),
            'partner'     => (string) ($row['pt_code'] ?? '-'),
            'status'      => lc_conversion_status_label($status),
            'statusCode'  => $status,
            'price'       => (int) $row['cv_price'],
            'comment'     => (string) $row['cv_comment'],
            'needsAction' => lc_conversion_needs_action($status),
            'channel'     => (string) $row['cv_channel'],
            'subId'       => (string) $row['cv_sub_id'],
        );
    }
}

if (!function_exists('lc_conversion_list_for_api')) {
    function lc_conversion_list_for_api($mt_id, array $filters = array())
    {
        if (lc_db_installed()) {
            $rows = lc_conversion_list_for_merchant($mt_id, $filters);

            return array_map('lc_conversion_to_api_merchant', $rows);
        }

        if (!function_exists('lc_sample_merchant_dbs')) {
            return array();
        }

        $items = array();
        foreach (lc_sample_merchant_dbs() as $row) {
            $status_map = array(
                '신규접수' => LC_STATUS_PENDING,
                '확인중'   => LC_STATUS_PENDING,
                '승인완료' => LC_STATUS_APPROVED,
                '취소/무효' => LC_STATUS_REJECTED,
                '취소요청' => LC_STATUS_PENDING,
            );
            $status_code = isset($status_map[$row['status']]) ? $status_map[$row['status']] : LC_STATUS_PENDING;

            if (!empty($filters['status']) && $filters['status'] !== $status_code) {
                continue;
            }

            $items[] = array(
                'id'          => (string) $row['id'],
                'cvId'        => 0,
                'date'        => (string) $row['date'],
                'campaign'    => (string) $row['campaign'],
                'name'        => (string) $row['name'],
                'phone'       => lc_conversion_mask_phone($row['phone']),
                'email'       => (string) ($row['email'] ?? ''),
                'region'      => (string) ($row['region'] ?? ''),
                'inquiry'     => (string) ($row['inquiry'] ?? ''),
                'partner'     => (string) $row['partner'],
                'status'      => (string) $row['status'],
                'statusCode'  => $status_code,
                'price'       => (int) $row['price'],
                'comment'     => (string) ($row['comment'] ?? ''),
                'needsAction' => !empty($row['needs_action']),
                'channel'     => (string) ($row['channel'] ?? ''),
                'subId'       => (string) ($row['sub_id'] ?? ''),
            );
        }

        return $items;
    }
}

if (!function_exists('lc_conversion_belongs_to_merchant')) {
    function lc_conversion_belongs_to_merchant(array $conversion, $mt_id)
    {
        $campaign_ids = lc_conversion_merchant_campaign_ids($mt_id);

        return in_array((int) $conversion['cp_id'], $campaign_ids, true);
    }
}

if (!function_exists('lc_conversion_update_status')) {
    /**
     * @return array{ok:bool,message:string,conversion?:array}
     */
    function lc_conversion_update_status($cv_id, $mt_id, $new_status, $comment = '')
    {
        if (!lc_db_installed()) {
            return array('ok' => false, 'message' => 'DB가 설치되지 않았습니다.');
        }

        $conversion = lc_conversion_get_by_id($cv_id);
        if (!$conversion) {
            return array('ok' => false, 'message' => '디비를 찾을 수 없습니다.');
        }

        if (!lc_conversion_belongs_to_merchant($conversion, $mt_id)) {
            return array('ok' => false, 'message' => '접근 권한이 없습니다.');
        }

        if ($conversion['cv_status'] !== LC_STATUS_PENDING) {
            return array('ok' => false, 'message' => '이미 처리된 디비입니다.');
        }

        $allowed = array(LC_STATUS_APPROVED, LC_STATUS_REJECTED);
        if (!in_array($new_status, $allowed, true)) {
            return array('ok' => false, 'message' => '유효하지 않은 상태입니다.');
        }

        if ($new_status === LC_STATUS_APPROVED) {
            $deduct = lc_wallet_deduct_for_conversion(
                $mt_id,
                $cv_id,
                (int) $conversion['cv_price'],
                $conversion['cv_code'] . ' 승인 차감'
            );
            if (!$deduct['ok']) {
                return $deduct;
            }

            if (function_exists('lc_partner_credit_for_conversion')) {
                lc_partner_credit_for_conversion($conversion);
            }
        }

        $table = lc_table('conversions');
        $status_esc = lc_sql_escape($new_status);
        $comment_esc = lc_sql_escape($comment);

        sql_query(" UPDATE `{$table}` SET
            cv_status = '{$status_esc}',
            cv_comment = '{$comment_esc}',
            cv_updated_at = NOW()
            WHERE cv_id = '" . (int) $cv_id . "' ", false);

        return array(
            'ok'         => true,
            'message'    => $new_status === LC_STATUS_APPROVED ? '승인 처리되었습니다.' : '취소/무효 처리되었습니다.',
            'conversion' => lc_conversion_get_by_id($cv_id),
        );
    }
}

if (!function_exists('lc_partner_credit_for_conversion')) {
    function lc_partner_credit_for_conversion(array $conversion)
    {
        if (!lc_db_installed() || empty($conversion['pt_id'])) {
            return;
        }

        $pt_id = (int) $conversion['pt_id'];
        $amount = (int) $conversion['cv_price'];
        $table = lc_table('partners');

        sql_query(" UPDATE `{$table}` SET pt_balance = pt_balance + '{$amount}', pt_updated_at = NOW() WHERE pt_id = '{$pt_id}' ", false);
    }
}

if (!function_exists('lc_conversion_merchant_summary')) {
    function lc_conversion_merchant_summary($mt_id)
    {
        if (!lc_db_installed()) {
            return array();
        }

        $campaign_ids = lc_conversion_merchant_campaign_ids($mt_id);
        if (!$campaign_ids) {
            return array(
                'pending'      => 0,
                'approved'     => 0,
                'rejected'     => 0,
                'needsAction'  => 0,
                'todayReceived'=> 0,
                'todaySpend'   => 0,
            );
        }

        $cv_table = lc_table('conversions');
        $in = implode(',', array_map('intval', $campaign_ids));
        $today = date('Y-m-d');

        $row = sql_fetch(" SELECT
            SUM(CASE WHEN cv_status = '" . lc_sql_escape(LC_STATUS_PENDING) . "' THEN 1 ELSE 0 END) AS pending_cnt,
            SUM(CASE WHEN cv_status = '" . lc_sql_escape(LC_STATUS_APPROVED) . "' THEN 1 ELSE 0 END) AS approved_cnt,
            SUM(CASE WHEN cv_status = '" . lc_sql_escape(LC_STATUS_REJECTED) . "' THEN 1 ELSE 0 END) AS rejected_cnt,
            SUM(CASE WHEN DATE(cv_created_at) = '{$today}' THEN 1 ELSE 0 END) AS today_received,
            SUM(CASE WHEN cv_status = '" . lc_sql_escape(LC_STATUS_APPROVED) . "' AND DATE(cv_updated_at) = '{$today}' THEN cv_price ELSE 0 END) AS today_spend
            FROM `{$cv_table}` WHERE cp_id IN ({$in}) ");

        return array(
            'pending'       => (int) ($row['pending_cnt'] ?? 0),
            'approved'      => (int) ($row['approved_cnt'] ?? 0),
            'rejected'      => (int) ($row['rejected_cnt'] ?? 0),
            'needsAction'   => (int) ($row['pending_cnt'] ?? 0),
            'todayReceived' => (int) ($row['today_received'] ?? 0),
            'todaySpend'    => (int) ($row['today_spend'] ?? 0),
        );
    }
}

if (!function_exists('lc_conversion_merchant_chart_7d')) {
    function lc_conversion_merchant_chart_7d($mt_id)
    {
        if (!lc_db_installed()) {
            return function_exists('lc_sample_merchant_chart_7d') ? lc_sample_merchant_chart_7d() : array();
        }

        $campaign_ids = lc_conversion_merchant_campaign_ids($mt_id);
        if (!$campaign_ids) {
            return array();
        }

        $cv_table = lc_table('conversions');
        $in = implode(',', array_map('intval', $campaign_ids));
        $items = array();

        for ($i = 6; $i >= 0; $i--) {
            $day = date('Y-m-d', strtotime('-' . $i . ' days'));
            $label = date('m.d', strtotime($day));
            $row = sql_fetch(" SELECT
                COUNT(*) AS db_cnt,
                SUM(CASE WHEN cv_status = '" . lc_sql_escape(LC_STATUS_APPROVED) . "' THEN 1 ELSE 0 END) AS approval_cnt,
                SUM(CASE WHEN cv_status = '" . lc_sql_escape(LC_STATUS_REJECTED) . "' THEN 1 ELSE 0 END) AS cancel_cnt
                FROM `{$cv_table}`
                WHERE cp_id IN ({$in}) AND DATE(cv_created_at) = '{$day}' ");

            $items[] = array(
                'date'     => $label,
                'db'       => (int) ($row['db_cnt'] ?? 0),
                'approval' => (int) ($row['approval_cnt'] ?? 0),
                'cancel'   => (int) ($row['cancel_cnt'] ?? 0),
            );
        }

        return $items;
    }
}

if (!function_exists('lc_conversion_generate_code')) {
    function lc_conversion_generate_code()
    {
        return 'DB' . date('ymd') . '-' . strtoupper(substr(uniqid(), -4));
    }
}

if (!function_exists('lc_conversion_seed_for_merchant')) {
    function lc_conversion_seed_for_merchant($mt_id)
    {
        if (!lc_db_installed() || !function_exists('lc_sample_merchant_dbs')) {
            return 0;
        }

        $mt_id = (int) $mt_id;
        $cv_table = lc_table('conversions');
        $cp_table = lc_table('campaigns');
        $pt_table = lc_table('partners');

        $count_row = sql_fetch(" SELECT COUNT(*) AS cnt FROM `{$cv_table}` cv
            INNER JOIN `{$cp_table}` c ON c.cp_id = cv.cp_id
            WHERE c.mt_id = '{$mt_id}' ");
        if ($count_row && (int) $count_row['cnt'] > 0) {
            return 0;
        }

        $status_map = array(
            '신규접수' => LC_STATUS_PENDING,
            '확인중'   => LC_STATUS_PENDING,
            '승인완료' => LC_STATUS_APPROVED,
            '취소/무효' => LC_STATUS_REJECTED,
            '취소요청' => LC_STATUS_PENDING,
        );

        $inserted = 0;
        foreach (lc_sample_merchant_dbs() as $sample) {
            $campaign = sql_fetch(" SELECT cp_id, cp_price FROM `{$cp_table}` WHERE cp_name = '" . lc_sql_escape($sample['campaign']) . "' AND mt_id = '{$mt_id}' LIMIT 1 ");
            if (!$campaign) {
                continue;
            }

            $partner = sql_fetch(" SELECT pt_id FROM `{$pt_table}` WHERE pt_code = '" . lc_sql_escape($sample['partner']) . "' LIMIT 1 ");
            $pt_id = $partner ? (int) $partner['pt_id'] : 0;
            $status = isset($status_map[$sample['status']]) ? $status_map[$sample['status']] : LC_STATUS_PENDING;
            $price = $status === LC_STATUS_APPROVED ? (int) $campaign['cp_price'] : (int) $sample['price'];

            sql_query(" INSERT INTO `{$cv_table}` SET
                cv_code = '" . lc_sql_escape($sample['id']) . "',
                pt_id = '{$pt_id}',
                cp_id = '" . (int) $campaign['cp_id'] . "',
                cv_name = '" . lc_sql_escape($sample['name']) . "',
                cv_phone = '" . lc_sql_escape($sample['phone']) . "',
                cv_email = '" . lc_sql_escape($sample['email'] ?? '') . "',
                cv_region = '" . lc_sql_escape($sample['region'] ?? '') . "',
                cv_inquiry = '" . lc_sql_escape($sample['inquiry'] ?? '') . "',
                cv_status = '" . lc_sql_escape($status) . "',
                cv_price = '{$price}',
                cv_channel = '" . lc_sql_escape($sample['channel'] ?? '') . "',
                cv_sub_id = '" . lc_sql_escape($sample['sub_id'] ?? '') . "',
                cv_comment = '" . lc_sql_escape($sample['comment'] ?? '') . "',
                cv_created_at = NOW(),
                cv_updated_at = NOW() ", false);
            $inserted++;
        }

        return $inserted;
    }
}

if (!function_exists('lc_merchant_dashboard_for_api')) {
    function lc_merchant_dashboard_for_api($mt_id)
    {
        $merchant = lc_get_merchant_by_id($mt_id);
        $summary = lc_conversion_merchant_summary($mt_id);
        $chart = lc_conversion_merchant_chart_7d($mt_id);
        $recent = array_slice(lc_conversion_list_for_api($mt_id), 0, 5);

        return array(
            'balance'       => is_array($merchant) ? (int) $merchant['mt_balance'] : 0,
            'balanceFormatted' => is_array($merchant) ? number_format((int) $merchant['mt_balance']) : '0',
            'summary'       => $summary,
            'chart7d'       => $chart,
            'recent'        => $recent,
            'pendingAction' => (int) ($summary['needsAction'] ?? 0),
        );
    }
}
