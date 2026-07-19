<?php
require_once __DIR__ . '/_common.php';

lc_api_require_method('POST');
$merchant = lc_api_require_active_merchant();
$mt_id = (int) $merchant['mt_id'];

$body = lc_api_read_json_body();
$action = isset($body['action']) ? (string) $body['action'] : 'summary';

if ($action === 'summary') {
    lc_ai_require_ready('summary');

    $report = lc_ai_merchant_summary_data($mt_id);
    $result = lc_ai_report_summary($report, 'merchant');
    if (!$result['ok']) {
        lc_api_error($result['message'], 'AI_SUMMARY_FAILED', 400);
    }

    lc_api_success(array(
        'summary'  => $result['summary'],
        'fallback' => !empty($result['fallback']),
        'report'   => array(
            'summary' => $report['summary'] ?? array(),
        ),
    ));
}

if ($action === 'promo') {
    lc_ai_require_ready('promo');

    $cp_id = isset($body['cpId']) ? (int) $body['cpId'] : 0;
    if ($cp_id <= 0) {
        lc_api_error('cpId가 필요합니다.', 'INVALID_ID', 400);
    }

    $cp_table = lc_table('campaigns');
    $campaign = lc_sql_fetch(" SELECT cp_id, cp_name, cp_category, cp_price FROM `{$cp_table}` WHERE cp_id = '{$cp_id}' AND mt_id = '{$mt_id}' LIMIT 1 ");
    if (!$campaign) {
        lc_api_error('해당 광고상품에 접근할 수 없습니다.', 'FORBIDDEN', 403);
    }

    $target = trim((string) ($body['targetAudience'] ?? ''));
    if ($target === '') {
        lc_api_error('타겟 고객을 입력해 주세요.', 'INVALID_TARGET', 400);
    }

    $payload = array(
        'title'           => trim((string) ($body['title'] ?? '')),
        'targetAudience'  => $target,
        'category'        => (string) ($body['category'] ?? ''),
    );

    if ($payload['title'] === '') {
        $payload['title'] = (string) ($campaign['cp_name'] ?? '');
    }
    if ($payload['category'] === '') {
        $payload['category'] = (string) ($campaign['cp_category'] ?? '');
    }
    if (empty($body['price']) && isset($campaign['cp_price'])) {
        $payload['price'] = number_format((int) $campaign['cp_price']) . '원';
    }

    $result = lc_ai_promo_generate($payload);
    if (!$result['ok']) {
        lc_api_error($result['message'], 'AI_PROMO_FAILED', 400);
    }

    lc_api_success(array(
        'copies'   => $result['copies'],
        'fallback' => !empty($result['fallback']),
        'message'  => isset($result['message']) ? (string) $result['message'] : '',
    ));
}

if ($action === 'generate_promo_image') {
    lc_ai_require_ready('image');

    $cp_id = isset($body['cpId']) ? (int) $body['cpId'] : 0;
    $width = isset($body['width']) ? (int) $body['width'] : 0;
    $height = isset($body['height']) ? (int) $body['height'] : 0;
    $image_title = trim((string) ($body['imageTitle'] ?? ''));
    $extra = trim((string) ($body['extra'] ?? ''));

    if ($cp_id <= 0) {
        lc_api_error('cpId가 필요합니다.', 'INVALID_ID', 400);
    }

    $cp_table = lc_table('campaigns');
    $campaign = lc_sql_fetch(" SELECT cp_id, cp_name, cp_category, mt_id FROM `{$cp_table}` WHERE cp_id = '{$cp_id}' AND mt_id = '{$mt_id}' LIMIT 1 ");
    if (!$campaign) {
        lc_api_error('해당 광고상품에 접근할 수 없습니다.', 'FORBIDDEN', 403);
    }

    $generated = lc_ai_generate_campaign_image(array(
        'kind'     => 'promo',
        'title'    => (string) ($campaign['cp_name'] ?? ''),
        'category' => (string) ($campaign['cp_category'] ?? ''),
        'width'    => $width,
        'height'   => $height,
        'extra'    => $extra,
    ));
    if (empty($generated['ok'])) {
        lc_api_error(isset($generated['message']) ? (string) $generated['message'] : 'AI 이미지 생성 실패', 'AI_IMAGE_FAILED', 400);
    }

    if ($image_title === '') {
        $image_title = $width > 0 && $height > 0
            ? 'AI 생성 이미지 (' . $width . ' × ' . $height . ' px)'
            : 'AI 생성 이미지';
    }

    $saved = lc_campaign_promo_guide_save_binary(
        $mt_id,
        $cp_id,
        $generated['binary'],
        isset($generated['mime']) ? (string) $generated['mime'] : 'image/jpeg',
        $image_title,
        'ai-promo.' . (isset($generated['ext']) ? (string) $generated['ext'] : 'jpg'),
        false
    );
    if (empty($saved['ok'])) {
        lc_api_error($saved['message'], 'PROMO_SAVE_FAILED', 400);
    }

    $asset_api = null;
    if (!empty($saved['asset']) && function_exists('lc_campaign_promo_guide_asset_to_api')) {
        $asset_api = lc_campaign_promo_guide_asset_to_api($saved['asset']);
    }

    lc_api_success(array(
        'message' => 'AI 이미지가 생성되어 등록되었습니다.',
        'asset'   => $asset_api,
        'prompt'  => isset($generated['prompt']) ? (string) $generated['prompt'] : '',
    ));
}

lc_api_error('유효하지 않은 action입니다.', 'INVALID_ACTION', 400);
