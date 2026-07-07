<?php
require_once __DIR__ . '/_common.php';

lc_api_require_admin();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $settings = lc_settings_get_all();
    lc_api_success(array(
        'settings' => lc_settings_to_api($settings),
        'raw'      => $settings,
        'dbReady'  => lc_db_installed(),
    ));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = lc_api_read_json_body();
    $values = isset($body['settings']) && is_array($body['settings']) ? $body['settings'] : $body;

    if (isset($body['action']) && $body['action'] === 'reset') {
        $table = lc_table('settings');
        if (lc_db_table_exists($table)) {
            lc_sql_query(" DELETE FROM `{$table}` ", false);
        }
        lc_api_success(array(
            'message'  => '기본값으로 복원되었습니다.',
            'settings' => lc_settings_to_api(lc_settings_get_all()),
            'raw'      => lc_settings_get_all(),
        ));
    }

    $flat = array();
    if (isset($values['general']) && is_array($values['general'])) {
        $flat = array_merge($flat, $values['general']);
    }
    if (isset($values['cpa']) && is_array($values['cpa'])) {
        foreach ($values['cpa'] as $key => $value) {
            if (is_bool($value)) {
                $flat[$key] = $value ? '1' : '0';
            } else {
                $flat[$key] = $value;
            }
        }
    }
    if (isset($values['billing']) && is_array($values['billing'])) {
        $flat = array_merge($flat, $values['billing']);
    }
    if (isset($values['partner']) && is_array($values['partner'])) {
        foreach ($values['partner'] as $key => $value) {
            $flat[$key] = is_bool($value) ? ($value ? '1' : '0') : $value;
        }
    }
    if (isset($values['cancel']) && is_array($values['cancel'])) {
        foreach ($values['cancel'] as $key => $value) {
            $flat[$key] = is_bool($value) ? ($value ? '1' : '0') : $value;
        }
    }
    if (isset($values['api']) && is_array($values['api'])) {
        foreach ($values['api'] as $key => $value) {
            $flat[$key] = is_bool($value) ? ($value ? '1' : '0') : $value;
        }
    }

    foreach ($body as $key => $value) {
        if (is_string($key) && array_key_exists($key, lc_settings_defaults())) {
            $flat[$key] = is_bool($value) ? ($value ? '1' : '0') : $value;
        }
    }

    $result = lc_settings_save($flat);
    if (!$result['ok']) {
        lc_api_error($result['message'], 'SETTINGS_SAVE_FAILED', 400);
    }

    lc_api_success(array(
        'message'  => $result['message'],
        'settings' => lc_settings_to_api($result['settings']),
        'raw'      => $result['settings'],
    ));
}

lc_api_error('허용되지 않은 HTTP 메서드입니다.', 'METHOD_NOT_ALLOWED', 405);
