<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

if (!function_exists('lc_landing_param')) {
    function lc_landing_param(array $source, $keys)
    {
        foreach ((array) $keys as $key) {
            if (isset($source[$key]) && trim((string) $source[$key]) !== '') {
                return trim((string) $source[$key]);
            }
        }

        return '';
    }
}

if (!function_exists('lc_landing_resolve_id_by_code')) {
    /**
     * @param string $table  lc_table() 결과
     * @param string $code_field
     * @param string $id_field
     */
    function lc_landing_resolve_id_by_code($table, $code_field, $id_field, $code)
    {
        $code = trim((string) $code);
        if ($code === '' || !lc_db_installed()) {
            return 0;
        }
        if (ctype_digit($code)) {
            return (int) $code;
        }

        $code_esc = lc_sql_escape($code);
        $row = lc_sql_fetch(" SELECT `{$id_field}` FROM `{$table}` WHERE `{$code_field}` = '{$code_esc}' LIMIT 1 ");

        return $row ? (int) $row[$id_field] : 0;
    }
}

if (!function_exists('lc_call_partner_phone_for_assignment')) {
    /**
     * 콜디비 배정된 파트너 전용 가상번호 (없으면 빈 문자열).
     */
    function lc_call_partner_phone_for_assignment($pt_id, $cp_id)
    {
        if (!lc_db_installed() || $pt_id <= 0 || $cp_id <= 0) {
            return '';
        }

        $pt_id = (int) $pt_id;
        $cp_id = (int) $cp_id;
        $table = lc_table('call_requests');

        $row = lc_sql_fetch(" SELECT car_virtual_number FROM `{$table}`
            WHERE pt_id = '{$pt_id}' AND cp_id = '{$cp_id}'
            AND car_status = '" . lc_sql_escape(LC_CALL_REQ_ASSIGNED) . "'
            AND car_virtual_number != ''
            ORDER BY car_id DESC LIMIT 1 ");

        if (!$row) {
            return '';
        }

        return trim((string) $row['car_virtual_number']);
    }
}

if (!function_exists('lc_landing_format_phone_display')) {
    function lc_landing_format_phone_display($phone)
    {
        $digits = preg_replace('/\D+/', '', (string) $phone);
        if (strlen($digits) === 11) {
            return substr($digits, 0, 3) . '-' . substr($digits, 3, 4) . '-' . substr($digits, 7);
        }
        if (strlen($digits) === 10) {
            return substr($digits, 0, 3) . '-' . substr($digits, 3, 3) . '-' . substr($digits, 6);
        }

        return trim((string) $phone);
    }
}

if (!function_exists('lc_landing_context_resolve')) {
    /**
     * URL/GET 파라미터 + lkCode 로 랜딩 컨텍스트(파트너·캠페인·전화번호) 해석.
     *
     * @return array{
     *   lkCode:string,partnerId:int,campaignId:int,merchantId:int,
     *   partnerCode:string,campaignCode:string,merchantCode:string,
     *   partnerPhone:string,partnerPhoneDisplay:string,hasPartnerPhone:bool,
     *   utmSource:string,utmMedium:string,utmCampaign:string
     * }
     */
    function lc_landing_context_resolve(array $params = array())
    {
        $lk_code = lc_landing_param($params, array('lkCode', 'lk_code', 'code'));
        $partner_ref = lc_landing_param($params, array('pid', 'partner_id'));
        $campaign_ref = lc_landing_param($params, array('cid', 'campaign_id'));
        $merchant_ref = lc_landing_param($params, array('mid', 'merchant_id'));
        $utm_source = lc_landing_param($params, array('utm_source'));
        $utm_medium = lc_landing_param($params, array('utm_medium'));
        $utm_campaign = lc_landing_param($params, array('utm_campaign'));

        $pt_id = 0;
        $cp_id = 0;
        $mt_id = 0;
        $pt_code = '';
        $cp_code = '';
        $mt_code = $merchant_ref !== '' ? $merchant_ref : 'banktupt';

        $link = null;
        if ($lk_code !== '' && function_exists('lc_link_get_with_campaign')) {
            $link = lc_link_get_with_campaign($lk_code);
            if (is_array($link)) {
                $pt_id = (int) $link['pt_id'];
                $cp_id = (int) $link['cp_id'];
                $mt_id = (int) ($link['mt_id'] ?? 0);
            }
        }

        if ($partner_ref !== '') {
            $resolved_pt = lc_landing_resolve_id_by_code(lc_table('partners'), 'pt_code', 'pt_id', $partner_ref);
            if ($resolved_pt > 0) {
                $pt_id = $resolved_pt;
            }
        }
        if ($campaign_ref !== '') {
            $resolved_cp = lc_landing_resolve_id_by_code(lc_table('campaigns'), 'cp_code', 'cp_id', $campaign_ref);
            if ($resolved_cp > 0) {
                $cp_id = $resolved_cp;
            }
        }
        if ($merchant_ref !== '' && $merchant_ref !== 'banktupt') {
            $resolved_mt = lc_landing_resolve_id_by_code(lc_table('merchants'), 'mt_code', 'mt_id', $merchant_ref);
            if ($resolved_mt > 0) {
                $mt_id = $resolved_mt;
            }
        }

        if ($pt_id > 0 && function_exists('lc_get_partner_by_id')) {
            $partner = lc_get_partner_by_id($pt_id);
            if (is_array($partner)) {
                $pt_code = (string) $partner['pt_code'];
            }
        }
        if ($cp_id > 0 && lc_db_installed()) {
            $campaign = lc_sql_fetch(" SELECT cp_code, mt_id FROM `" . lc_table('campaigns') . "` WHERE cp_id = '{$cp_id}' LIMIT 1 ");
            if (is_array($campaign)) {
                $cp_code = (string) $campaign['cp_code'];
                if ($mt_id <= 0) {
                    $mt_id = (int) $campaign['mt_id'];
                }
            }
        }
        if ($mt_id > 0 && function_exists('lc_get_merchant_by_id')) {
            $merchant = lc_get_merchant_by_id($mt_id);
            if (is_array($merchant)) {
                $mt_code = (string) $merchant['mt_code'];
            }
        }

        $partner_phone = lc_call_partner_phone_for_assignment($pt_id, $cp_id);
        $partner_phone_display = $partner_phone !== '' ? lc_landing_format_phone_display($partner_phone) : '';

        return array(
            'lkCode'               => $lk_code,
            'partnerId'            => $pt_id,
            'campaignId'           => $cp_id,
            'merchantId'           => $mt_id,
            'partnerCode'          => $pt_code !== '' ? $pt_code : $partner_ref,
            'campaignCode'         => $cp_code !== '' ? $cp_code : $campaign_ref,
            'merchantCode'         => $mt_code,
            'partnerPhone'         => $partner_phone,
            'partnerPhoneDisplay'  => $partner_phone_display,
            'hasPartnerPhone'      => $partner_phone !== '',
            'utmSource'            => $utm_source,
            'utmMedium'            => $utm_medium,
            'utmCampaign'          => $utm_campaign,
        );
    }
}

if (!function_exists('lc_landing_context_for_api')) {
    function lc_landing_context_for_api(array $params = array())
    {
        $ctx = lc_landing_context_resolve($params);

        return array(
            'lkCode'              => $ctx['lkCode'],
            'partner_id'          => $ctx['partnerCode'],
            'campaign_id'         => $ctx['campaignCode'],
            'merchant_id'         => $ctx['merchantCode'],
            'partner_phone'       => $ctx['partnerPhone'],
            'partner_phone_display' => $ctx['partnerPhoneDisplay'],
            'has_partner_phone'   => $ctx['hasPartnerPhone'],
            'utm_source'          => $ctx['utmSource'],
            'utm_medium'          => $ctx['utmMedium'],
            'utm_campaign'        => $ctx['utmCampaign'],
        );
    }
}
