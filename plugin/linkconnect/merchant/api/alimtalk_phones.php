<?php
require_once __DIR__ . '/_common.php';

$method = isset($_SERVER['REQUEST_METHOD']) ? strtoupper((string) $_SERVER['REQUEST_METHOD']) : 'GET';

if (!function_exists('lc_merchant_alimtalk_phones_payload')) {
    /**
     * @param array<string,mixed> $merchant
     * @return array<string,mixed>
     */
    function lc_merchant_alimtalk_phones_payload(array $merchant)
    {
        $stored = function_exists('lc_alimtalk_merchant_stored_phones')
            ? lc_alimtalk_merchant_stored_phones($merchant)
            : array();
        $member_phone = function_exists('lc_alimtalk_member_phone')
            ? lc_alimtalk_member_phone((string) ($merchant['mb_id'] ?? ''))
            : '';

        return array(
            'phones'      => array_values($stored),
            'memberPhone' => $member_phone,
            'limit'       => function_exists('lc_alimtalk_merchant_phone_limit') ? lc_alimtalk_merchant_phone_limit() : 3,
        );
    }
}

if ($method === 'GET') {
    $merchant = lc_api_require_active_merchant();
    lc_api_success(lc_merchant_alimtalk_phones_payload(is_array($merchant) ? $merchant : array()));
}

if ($method === 'POST') {
    $merchant = lc_api_require_active_merchant();
    $mt_id = (int) ($merchant['mt_id'] ?? 0);
    $body = lc_api_read_json_body();
    $raw = isset($body['phones']) && is_array($body['phones']) ? $body['phones'] : array();
    if (!function_exists('lc_alimtalk_save_merchant_phones')) {
        lc_api_error('알림톡 수신번호 저장을 사용할 수 없습니다.', 'NOT_READY', 500);
    }
    $result = lc_alimtalk_save_merchant_phones($mt_id, $raw);
    if (empty($result['ok'])) {
        lc_api_error((string) ($result['message'] ?? '저장에 실패했습니다.'), 'SAVE_FAILED', 400);
    }

    $fresh = function_exists('lc_get_merchant_by_id') ? lc_get_merchant_by_id($mt_id) : $merchant;
    $payload = lc_merchant_alimtalk_phones_payload(is_array($fresh) ? $fresh : array());
    $payload['message'] = (string) ($result['message'] ?? '저장했습니다.');
    lc_api_success($payload);
}

lc_api_error('허용되지 않은 HTTP 메서드입니다.', 'METHOD_NOT_ALLOWED', 405);
