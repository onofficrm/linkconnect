<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

/**
 * 링크커넥트 전용 — 광고주 수취 / 파트너 지급 차액(순이익) 집계.
 */

if (!function_exists('lc_net_profit_platform_allowed')) {
    function lc_net_profit_platform_allowed()
    {
        $code = defined('LC_PLATFORM_CODE') ? (string) LC_PLATFORM_CODE : '';
        $expected = defined('LC_PLATFORM_LINKCONNECT') ? (string) LC_PLATFORM_LINKCONNECT : 'LINKCONNECT';

        return strtoupper($code) === strtoupper($expected);
    }
}

if (!function_exists('lc_net_profit_summary')) {
    /**
     * 기간 내 승인 전환 기준 순이익.
     * - 광고주 금액: SUM(cv_price)
     * - 파트너 금액: SUM(파트너 단가)
     * - 순이익: 광고주 − 파트너
     * - 20%: 순이익 × 0.2
     *
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
            'ok'               => true,
            'allowed'          => true,
            'dbReady'          => lc_db_installed(),
            'dateFrom'         => $period['from'],
            'dateTo'           => $period['to'],
            'advertiserAmount' => 0,
            'partnerAmount'    => 0,
            'netProfit'        => 0,
            'netProfitShare20' => 0,
            'approvedCount'    => 0,
            'daily'            => array(),
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
            'approvedCount'    => (int) ($row['approved_count'] ?? 0),
            'daily'            => $daily,
        );
    }
}
