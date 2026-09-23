<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

if (!function_exists('lc_dotrak_campaign_code')) {
    /**
     * 도트락 두피문신(SMP) CPA 광고상품 코드. 관리자에서 먼저 등록된 상품이다.
     */
    function lc_dotrak_campaign_code()
    {
        return 'CPA-00015';
    }
}

if (!function_exists('lc_dotrak_landing_path')) {
    function lc_dotrak_landing_path()
    {
        return '/merchant/dotrak/';
    }
}

if (!function_exists('lc_dotrak_landing_url')) {
    function lc_dotrak_landing_url()
    {
        $path = lc_dotrak_landing_path();
        if (defined('G5_URL') && G5_URL !== '') {
            return rtrim(G5_URL, '/') . $path;
        }

        return $path;
    }
}

if (!function_exists('lc_campaign_ensure_dotrak')) {
    /**
     * 기존 CPA-00015 상품에 도트락 랜딩 URL을 연결한다.
     * 광고주·단가·상태·문구는 관리자 입력값을 유지하고, 상품이 없으면 새로 만들지 않는다.
     *
     * @param array{force?:bool} $options force=true 이면 이미 다른 랜딩 URL이 있어도 덮어쓴다.
     * @return array{ok:bool,message:string,cpId?:int,updated?:bool}
     */
    function lc_campaign_ensure_dotrak(array $options = array())
    {
        if (!lc_db_installed()) {
            return array('ok' => false, 'message' => 'DB가 설치되지 않았습니다.');
        }

        $table = lc_table('campaigns');
        $code_esc = lc_sql_escape(lc_dotrak_campaign_code());
        $row = lc_sql_fetch(" SELECT cp_id, cp_landing_url FROM `{$table}` WHERE cp_code = '{$code_esc}' LIMIT 1 ", false);
        if (!$row) {
            return array('ok' => false, 'message' => '도트락 광고상품(CPA-00015)을 찾을 수 없습니다.');
        }

        $cp_id = (int) $row['cp_id'];
        $current = trim((string) ($row['cp_landing_url'] ?? ''));
        if ($current !== '' && empty($options['force'])) {
            return array('ok' => true, 'message' => '랜딩 URL이 이미 설정되어 있습니다.', 'cpId' => $cp_id, 'updated' => false);
        }

        lc_sql_query(" UPDATE `{$table}` SET
            cp_landing_url = '" . lc_sql_escape(lc_dotrak_landing_url()) . "',
            cp_tracking_base_url = '',
            cp_updated_at = NOW()
            WHERE cp_id = '{$cp_id}' ", false);

        return array('ok' => true, 'message' => '도트락 랜딩을 CPA-00015에 연결했습니다.', 'cpId' => $cp_id, 'updated' => true);
    }
}
