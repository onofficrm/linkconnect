<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

if (!function_exists('lc_settings_defaults')) {
    function lc_settings_defaults()
    {
        return array(
            'siteName'              => '링크커넥트',
            'siteStatus'            => 'active',
            'adminEmail'            => 'admin@linkconnect.com',
            'supportPhone'          => '1588-0000',
            'timezone'              => 'Asia/Seoul',
            'duplicateDays'         => 30,
            'defaultCvStatus'       => 'pending',
            'duplicateByPhone'      => '1',
            'duplicateByCampaign'   => '1',
            'duplicateByMerchant'   => '0',
            'merchantProcessDays'   => 7,
            'billingDeductMode'     => 'on_receive',
            'billingLowMode'        => 'hold',
            'minChargeAmount'       => 500000,
            'chargeApprovalMode'    => 'manual',
            'showEstRevenue'        => '1',
            'confirmOnApprove'      => '1',
            'excludeCanceled'       => '1',
            'minSettlementAmount'   => 50000,
            'settlementPeriod'      => '매월 1일 ~ 5일',
            'merchantInstantCancel' => '0',
            'adminReviewRequired'   => '1',
            'cancelReasonRequired'  => '1',
            'cancelCommentRequired' => '1',
            'partnerAppealAllowed'  => '1',
            'apiKeyEnabled'         => '1',
            'apiSecretEnabled'      => '1',
            'apiIpRestrict'         => '1',
            'apiLogEnabled'         => '1',
            'apiMaskPii'            => '1',
            'apiRetryCount'         => 3,
            'geminiApiKey'          => '',
            'geminiEnabled'         => '1',
            'geminiModel'           => 'gemini-2.0-flash',
            'aiChatDailyLimit'      => 30,
            'aiPromoDailyLimit'     => 20,
            'aiSummaryDailyLimit'   => 10,
            'notifyLowBalanceEmail' => '1',
            'notifyLowBalanceSms'   => '0',
            'notifyLowBalanceKakao' => '0',
            'notifyLowBalanceEmailTpl' => '[{site}] {company}님, 광고비 잔액이 {balance}원입니다. (기준 {threshold}원) 충전을 진행해 주세요.',
            'notifyLowBalanceSmsTpl'   => '[{site}] 광고비 잔액 {balance}원. 충전 필요.',
            'notifyLowBalanceKakaoTpl' => '{company}님, 광고비 잔액 {balance}원입니다. 충전해 주세요.',
        );
    }
}

if (!function_exists('lc_settings_get_all')) {
    function lc_settings_get_all()
    {
        $defaults = lc_settings_defaults();
        if (!lc_db_installed() || !lc_db_table_exists(lc_table('settings'))) {
            return $defaults;
        }

        $table = lc_table('settings');
        $result = lc_sql_query(" SELECT st_key, st_value FROM `{$table}` ", false);
        if ($result) {
            while ($row = sql_fetch_array($result)) {
                $key = (string) ($row['st_key'] ?? '');
                if ($key !== '' && array_key_exists($key, $defaults)) {
                    $defaults[$key] = (string) ($row['st_value'] ?? '');
                }
            }
        }

        return $defaults;
    }
}

if (!function_exists('lc_settings_get')) {
    function lc_settings_get($key, $default = null)
    {
        $all = lc_settings_get_all();
        if (array_key_exists($key, $all)) {
            return $all[$key];
        }

        return $default;
    }
}

if (!function_exists('lc_settings_get_int')) {
    function lc_settings_get_int($key, $default = 0)
    {
        return (int) lc_settings_get($key, (string) $default);
    }
}

if (!function_exists('lc_settings_get_bool')) {
    function lc_settings_get_bool($key, $default = false)
    {
        $value = lc_settings_get($key, $default ? '1' : '0');

        return in_array((string) $value, array('1', 'true', 'yes', 'on'), true);
    }
}

if (!function_exists('lc_settings_save')) {
    /**
     * @return array{ok:bool,message:string,settings:array}
     */
    function lc_settings_save(array $values)
    {
        if (!lc_db_installed()) {
            return array('ok' => false, 'message' => 'DB가 설치되지 않았습니다.', 'settings' => lc_settings_defaults());
        }

        $defaults = lc_settings_defaults();
        $table = lc_table('settings');

        foreach ($values as $key => $value) {
            if (!array_key_exists($key, $defaults)) {
                continue;
            }
            if ($key === 'geminiApiKey') {
                $key_val = trim((string) $value);
                if ($key_val !== '') {
                    $key_esc = lc_sql_escape($key);
                    $val_esc = lc_sql_escape($key_val);
                    lc_sql_query(" INSERT INTO `{$table}` (st_key, st_value) VALUES ('{$key_esc}', '{$val_esc}')
                        ON DUPLICATE KEY UPDATE st_value = '{$val_esc}', st_updated_at = NOW() ", false);
                }
                continue;
            }
            $key_esc = lc_sql_escape((string) $key);
            $val_esc = lc_sql_escape(is_bool($value) ? ($value ? '1' : '0') : (string) $value);
            lc_sql_query(" INSERT INTO `{$table}` (st_key, st_value) VALUES ('{$key_esc}', '{$val_esc}')
                ON DUPLICATE KEY UPDATE st_value = '{$val_esc}', st_updated_at = NOW() ", false);
        }

        return array(
            'ok'       => true,
            'message'  => '설정이 저장되었습니다.',
            'settings' => lc_settings_get_all(),
        );
    }
}

if (!function_exists('lc_settings_to_api')) {
    function lc_settings_to_api(array $settings)
    {
        return array(
            'general' => array(
                'siteName'     => (string) ($settings['siteName'] ?? ''),
                'siteStatus'   => (string) ($settings['siteStatus'] ?? 'active'),
                'adminEmail'   => (string) ($settings['adminEmail'] ?? ''),
                'supportPhone' => (string) ($settings['supportPhone'] ?? ''),
                'timezone'     => (string) ($settings['timezone'] ?? 'Asia/Seoul'),
            ),
            'cpa' => array(
                'duplicateDays'       => (int) ($settings['duplicateDays'] ?? 30),
                'defaultCvStatus'     => (string) ($settings['defaultCvStatus'] ?? 'pending'),
                'duplicateByPhone'    => lc_settings_get_bool('duplicateByPhone'),
                'duplicateByCampaign' => lc_settings_get_bool('duplicateByCampaign'),
                'duplicateByMerchant' => lc_settings_get_bool('duplicateByMerchant'),
                'merchantProcessDays' => (int) ($settings['merchantProcessDays'] ?? 7),
            ),
            'billing' => array(
                'billingDeductMode'  => (string) ($settings['billingDeductMode'] ?? 'on_receive'),
                'billingLowMode'     => (string) ($settings['billingLowMode'] ?? 'hold'),
                'minChargeAmount'    => (int) ($settings['minChargeAmount'] ?? 500000),
                'chargeApprovalMode' => (string) ($settings['chargeApprovalMode'] ?? 'manual'),
                'notifyLowBalanceEmail' => lc_settings_get_bool('notifyLowBalanceEmail', true),
                'notifyLowBalanceSms'   => lc_settings_get_bool('notifyLowBalanceSms'),
                'notifyLowBalanceKakao' => lc_settings_get_bool('notifyLowBalanceKakao'),
                'notifyLowBalanceEmailTpl' => (string) ($settings['notifyLowBalanceEmailTpl'] ?? ''),
                'notifyLowBalanceSmsTpl'   => (string) ($settings['notifyLowBalanceSmsTpl'] ?? ''),
                'notifyLowBalanceKakaoTpl' => (string) ($settings['notifyLowBalanceKakaoTpl'] ?? ''),
            ),
            'partner' => array(
                'showEstRevenue'      => lc_settings_get_bool('showEstRevenue'),
                'confirmOnApprove'    => lc_settings_get_bool('confirmOnApprove'),
                'excludeCanceled'     => lc_settings_get_bool('excludeCanceled'),
                'minSettlementAmount' => (int) ($settings['minSettlementAmount'] ?? 50000),
                'settlementPeriod'    => (string) ($settings['settlementPeriod'] ?? ''),
            ),
            'cancel' => array(
                'merchantInstantCancel' => lc_settings_get_bool('merchantInstantCancel'),
                'adminReviewRequired'   => lc_settings_get_bool('adminReviewRequired'),
                'cancelReasonRequired'  => lc_settings_get_bool('cancelReasonRequired'),
                'cancelCommentRequired' => lc_settings_get_bool('cancelCommentRequired'),
                'partnerAppealAllowed'  => lc_settings_get_bool('partnerAppealAllowed'),
            ),
            'api' => array(
                'apiKeyEnabled'    => lc_settings_get_bool('apiKeyEnabled'),
                'apiSecretEnabled' => lc_settings_get_bool('apiSecretEnabled'),
                'apiIpRestrict'    => lc_settings_get_bool('apiIpRestrict'),
                'apiLogEnabled'    => lc_settings_get_bool('apiLogEnabled'),
                'apiMaskPii'       => lc_settings_get_bool('apiMaskPii'),
                'apiRetryCount'    => (int) ($settings['apiRetryCount'] ?? 3),
            ),
            'ai' => array(
                'geminiEnabled'       => lc_settings_get_bool('geminiEnabled', true),
                'geminiModel'         => (string) ($settings['geminiModel'] ?? 'gemini-2.0-flash'),
                'geminiApiKeySet'     => trim((string) ($settings['geminiApiKey'] ?? '')) !== '',
                'geminiApiKeyMasked'  => lc_gemini_mask_key((string) ($settings['geminiApiKey'] ?? '')),
                'aiChatDailyLimit'    => (int) ($settings['aiChatDailyLimit'] ?? 30),
                'aiPromoDailyLimit'   => (int) ($settings['aiPromoDailyLimit'] ?? 20),
                'aiSummaryDailyLimit' => (int) ($settings['aiSummaryDailyLimit'] ?? 10),
            ),
        );
    }
}
