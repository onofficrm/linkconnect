<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

/**
 * 링크커넥트 전용 — 광고주 수취 / 파트너 지급 차액(순이익) 집계 + 20% 지급 메모.
 */

if (!function_exists('lc_net_profit_platform_allowed')) {
    function lc_net_profit_platform_allowed()
    {
        $code = defined('LC_PLATFORM_CODE') ? (string) LC_PLATFORM_CODE : '';
        $expected = defined('LC_PLATFORM_LINKCONNECT') ? (string) LC_PLATFORM_LINKCONNECT : 'LINKCONNECT';

        return strtoupper($code) === strtoupper($expected);
    }
}

if (!function_exists('lc_net_profit_payout_table')) {
    function lc_net_profit_payout_table()
    {
        return lc_table('net_profit_payouts');
    }
}

if (!function_exists('lc_net_profit_payout_db_ensure_schema')) {
    /**
     * @return array{ok:bool,message:string}
     */
    function lc_net_profit_payout_db_ensure_schema()
    {
        if (!lc_db_installed()) {
            return array('ok' => false, 'message' => 'DB 미설치');
        }

        $table = lc_net_profit_payout_table();
        if (lc_db_table_exists($table)) {
            return array('ok' => true, 'message' => 'ready');
        }

        $create = lc_sql_query(
            "CREATE TABLE IF NOT EXISTS `{$table}` (
                `npp_id` bigint unsigned NOT NULL AUTO_INCREMENT,
                `npp_amount` int unsigned NOT NULL DEFAULT 0,
                `npp_memo` varchar(1000) NOT NULL DEFAULT '',
                `npp_paid_at` date NOT NULL,
                `npp_period_from` date NOT NULL,
                `npp_period_to` date NOT NULL,
                `admin_mb_id` varchar(50) NOT NULL DEFAULT '',
                `npp_created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (`npp_id`),
                KEY `idx_npp_period` (`npp_period_from`, `npp_period_to`),
                KEY `idx_npp_paid_at` (`npp_paid_at`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
            false
        );

        if ($create === false) {
            return array('ok' => false, 'message' => 'net_profit_payouts 테이블 생성 실패: ' . lc_sql_error());
        }

        return array('ok' => true, 'message' => 'created');
    }
}

if (!function_exists('lc_net_profit_payout_to_api')) {
    /**
     * @param array<string,mixed> $row
     * @return array<string,mixed>
     */
    function lc_net_profit_payout_to_api(array $row)
    {
        return array(
            'id'         => (int) ($row['npp_id'] ?? 0),
            'amount'     => (int) ($row['npp_amount'] ?? 0),
            'memo'       => (string) ($row['npp_memo'] ?? ''),
            'paidAt'     => (string) ($row['npp_paid_at'] ?? ''),
            'periodFrom' => (string) ($row['npp_period_from'] ?? ''),
            'periodTo'   => (string) ($row['npp_period_to'] ?? ''),
            'adminId'    => (string) ($row['admin_mb_id'] ?? ''),
            'createdAt'  => (string) ($row['npp_created_at'] ?? ''),
        );
    }
}

if (!function_exists('lc_net_profit_payouts_for_period')) {
    /**
     * @return list<array<string,mixed>>
     */
    function lc_net_profit_payouts_for_period($period_from, $period_to)
    {
        lc_net_profit_payout_db_ensure_schema();
        $table = lc_net_profit_payout_table();
        if (!lc_db_table_exists($table)) {
            return array();
        }

        $from = lc_sql_escape((string) $period_from);
        $to = lc_sql_escape((string) $period_to);
        $rows = array();
        $result = lc_sql_query(
            " SELECT * FROM `{$table}`
              WHERE npp_period_from = '{$from}' AND npp_period_to = '{$to}'
              ORDER BY npp_paid_at DESC, npp_id DESC ",
            false
        );
        if ($result) {
            while ($row = sql_fetch_array($result)) {
                $rows[] = lc_net_profit_payout_to_api($row);
            }
        }

        return $rows;
    }
}

if (!function_exists('lc_net_profit_payout_create')) {
    /**
     * @param array{amount:int|string,memo?:string,paidAt?:string,periodFrom:string,periodTo:string} $payload
     * @return array{ok:bool,message:string,payout?:array<string,mixed>|null}
     */
    function lc_net_profit_payout_create(array $payload)
    {
        if (!lc_net_profit_platform_allowed()) {
            return array('ok' => false, 'message' => '이 사이트에서는 사용할 수 없는 기능입니다.');
        }

        lc_net_profit_payout_db_ensure_schema();
        $table = lc_net_profit_payout_table();
        if (!lc_db_table_exists($table)) {
            return array('ok' => false, 'message' => '지급 내역 테이블을 준비하지 못했습니다.');
        }

        $amount = (int) ($payload['amount'] ?? 0);
        $memo = trim((string) ($payload['memo'] ?? ''));
        $paid_at = trim((string) ($payload['paidAt'] ?? ''));
        $period_from = trim((string) ($payload['periodFrom'] ?? ''));
        $period_to = trim((string) ($payload['periodTo'] ?? ''));

        if ($amount <= 0) {
            return array('ok' => false, 'message' => '지급 금액을 입력해 주세요.');
        }
        if ($amount > 1000000000) {
            return array('ok' => false, 'message' => '지급 금액이 너무 큽니다.');
        }
        if ($paid_at === '' || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $paid_at)) {
            $paid_at = date('Y-m-d');
        }
        if ($period_from === '' || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $period_from)
            || $period_to === '' || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $period_to)) {
            return array('ok' => false, 'message' => '정산 기간이 올바르지 않습니다.');
        }
        if ($period_from > $period_to) {
            $tmp = $period_from;
            $period_from = $period_to;
            $period_to = $tmp;
        }
        if (mb_strlen($memo, 'UTF-8') > 1000) {
            return array('ok' => false, 'message' => '메모는 1000자 이내로 입력해 주세요.');
        }

        global $member;
        $admin_mb_id = is_array($member) ? (string) ($member['mb_id'] ?? '') : '';

        $insert = lc_sql_query(
            " INSERT INTO `{$table}` SET
                npp_amount = '{$amount}',
                npp_memo = '" . lc_sql_escape($memo) . "',
                npp_paid_at = '" . lc_sql_escape($paid_at) . "',
                npp_period_from = '" . lc_sql_escape($period_from) . "',
                npp_period_to = '" . lc_sql_escape($period_to) . "',
                admin_mb_id = '" . lc_sql_escape($admin_mb_id) . "',
                npp_created_at = NOW() ",
            false
        );
        if ($insert === false) {
            return array('ok' => false, 'message' => '지급 내역 저장에 실패했습니다.');
        }

        $id = (int) lc_sql_insert_id();
        $row = lc_sql_fetch(" SELECT * FROM `{$table}` WHERE npp_id = '{$id}' LIMIT 1 ");

        if (function_exists('lc_admin_log_write')) {
            lc_admin_log_write(
                'net_profit_payout',
                'net_profit',
                $id,
                '순이익 20% 지급 등록: ' . number_format($amount) . '원',
                array('periodFrom' => $period_from, 'periodTo' => $period_to, 'memo' => $memo)
            );
        }

        return array(
            'ok'      => true,
            'message' => '지급 내역을 등록했습니다.',
            'payout'  => is_array($row) ? lc_net_profit_payout_to_api($row) : null,
        );
    }
}

if (!function_exists('lc_net_profit_payout_delete')) {
    /**
     * @return array{ok:bool,message:string}
     */
    function lc_net_profit_payout_delete($npp_id)
    {
        if (!lc_net_profit_platform_allowed()) {
            return array('ok' => false, 'message' => '이 사이트에서는 사용할 수 없는 기능입니다.');
        }

        $npp_id = (int) $npp_id;
        if ($npp_id <= 0) {
            return array('ok' => false, 'message' => '지급 내역 ID가 올바르지 않습니다.');
        }

        lc_net_profit_payout_db_ensure_schema();
        $table = lc_net_profit_payout_table();
        if (!lc_db_table_exists($table)) {
            return array('ok' => false, 'message' => '지급 내역 테이블이 없습니다.');
        }

        $row = lc_sql_fetch(" SELECT * FROM `{$table}` WHERE npp_id = '{$npp_id}' LIMIT 1 ");
        if (!is_array($row)) {
            return array('ok' => false, 'message' => '지급 내역을 찾을 수 없습니다.');
        }

        lc_sql_query(" DELETE FROM `{$table}` WHERE npp_id = '{$npp_id}' LIMIT 1 ", false);

        if (function_exists('lc_admin_log_write')) {
            lc_admin_log_write(
                'net_profit_payout_delete',
                'net_profit',
                $npp_id,
                '순이익 20% 지급 내역 삭제: ' . number_format((int) ($row['npp_amount'] ?? 0)) . '원',
                array('memo' => (string) ($row['npp_memo'] ?? ''))
            );
        }

        return array('ok' => true, 'message' => '지급 내역을 삭제했습니다.');
    }
}

if (!function_exists('lc_net_profit_summary')) {
    /**
     * @param array{dateFrom?:string,dateTo?:string,date_from?:string,date_to?:string} $filters
     * @return array<string,mixed>
     */
    function lc_net_profit_summary(array $filters = array())
    {
        if (!lc_net_profit_platform_allowed()) {
            return array(
                'ok'      => false,
                'message' => '이 사이트에서는 사용할 수 없는 기능입니다.',
                'allowed' => false,
            );
        }

        $period = function_exists('lc_wallet_normalize_period')
            ? lc_wallet_normalize_period($filters)
            : array(
                'from'   => date('Y-m-01'),
                'to'     => date('Y-m-d'),
                'fromDt' => date('Y-m-01') . ' 00:00:00',
                'toDt'   => date('Y-m-d') . ' 23:59:59',
            );

        $empty = array(
            'ok'                    => true,
            'allowed'               => true,
            'dbReady'               => lc_db_installed(),
            'dateFrom'              => $period['from'],
            'dateTo'                => $period['to'],
            'advertiserAmount'      => 0,
            'partnerAmount'         => 0,
            'netProfit'             => 0,
            'netProfitShare20'      => 0,
            'share20Paid'           => 0,
            'share20Remaining'      => 0,
            'approvedCount'         => 0,
            'daily'                 => array(),
            'payouts'               => array(),
        );

        if (!lc_db_installed() || !lc_db_table_exists(lc_table('conversions'))) {
            return $empty;
        }

        $cv = lc_table('conversions');
        $status = lc_sql_escape(defined('LC_STATUS_APPROVED') ? LC_STATUS_APPROVED : 'approved');
        $partner_expr = function_exists('lc_conversion_partner_price_expr')
            ? lc_conversion_partner_price_expr('cv')
            : 'IF(cv.cv_partner_price > 0, cv.cv_partner_price, cv.cv_price)';
        $from_esc = lc_sql_escape($period['fromDt']);
        $to_esc = lc_sql_escape($period['toDt']);

        $row = lc_sql_fetch(
            " SELECT
                COUNT(*) AS approved_count,
                COALESCE(SUM(cv.cv_price), 0) AS advertiser_amount,
                COALESCE(SUM({$partner_expr}), 0) AS partner_amount
              FROM `{$cv}` cv
              WHERE cv.cv_status = '{$status}'
                AND cv.cv_updated_at >= '{$from_esc}'
                AND cv.cv_updated_at <= '{$to_esc}' "
        );

        $advertiser = (int) ($row['advertiser_amount'] ?? 0);
        $partner = (int) ($row['partner_amount'] ?? 0);
        $net = $advertiser - $partner;
        $share20 = (int) round($net * 0.2);

        $daily = array();
        $daily_result = lc_sql_query(
            " SELECT
                DATE(cv.cv_updated_at) AS day,
                COUNT(*) AS approved_count,
                COALESCE(SUM(cv.cv_price), 0) AS advertiser_amount,
                COALESCE(SUM({$partner_expr}), 0) AS partner_amount
              FROM `{$cv}` cv
              WHERE cv.cv_status = '{$status}'
                AND cv.cv_updated_at >= '{$from_esc}'
                AND cv.cv_updated_at <= '{$to_esc}'
              GROUP BY DATE(cv.cv_updated_at)
              ORDER BY day DESC ",
            false
        );
        if ($daily_result) {
            while ($d = sql_fetch_array($daily_result)) {
                $adv = (int) ($d['advertiser_amount'] ?? 0);
                $pt = (int) ($d['partner_amount'] ?? 0);
                $day_net = $adv - $pt;
                $daily[] = array(
                    'date'             => (string) ($d['day'] ?? ''),
                    'approvedCount'    => (int) ($d['approved_count'] ?? 0),
                    'advertiserAmount' => $adv,
                    'partnerAmount'    => $pt,
                    'netProfit'        => $day_net,
                    'netProfitShare20' => (int) round($day_net * 0.2),
                );
            }
        }

        $payouts = lc_net_profit_payouts_for_period($period['from'], $period['to']);
        $share20_paid = 0;
        foreach ($payouts as $p) {
            $share20_paid += (int) ($p['amount'] ?? 0);
        }
        $share20_remaining = $share20 - $share20_paid;

        return array(
            'ok'               => true,
            'allowed'          => true,
            'dbReady'          => true,
            'dateFrom'         => $period['from'],
            'dateTo'           => $period['to'],
            'advertiserAmount' => $advertiser,
            'partnerAmount'    => $partner,
            'netProfit'        => $net,
            'netProfitShare20' => $share20,
            'share20Paid'      => $share20_paid,
            'share20Remaining' => $share20_remaining,
            'approvedCount'    => (int) ($row['approved_count'] ?? 0),
            'daily'            => $daily,
            'payouts'          => $payouts,
        );
    }
}
