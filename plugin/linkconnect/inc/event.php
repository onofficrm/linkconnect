<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

define('LC_EVENT_ACTIVE', 'active');
define('LC_EVENT_CLOSING', 'closing');
define('LC_EVENT_ENDED', 'ended');
define('LC_EVENT_SCHEDULED', 'scheduled');

if (!function_exists('lc_event_table')) {
    function lc_event_table()
    {
        return lc_table('events');
    }
}

if (!function_exists('lc_event_status_ui')) {
    function lc_event_status_ui($status)
    {
        $labels = array(
            LC_EVENT_ACTIVE    => '진행중',
            LC_EVENT_CLOSING   => '마감임박',
            LC_EVENT_ENDED     => '종료',
            LC_EVENT_SCHEDULED => '예정',
        );

        return isset($labels[$status]) ? $labels[$status] : (string) $status;
    }
}

if (!function_exists('lc_event_generate_code')) {
    function lc_event_generate_code()
    {
        if (!lc_db_installed()) {
            return 'EVT-' . date('ymd') . '-' . strtoupper(substr(bin2hex(random_bytes(2)), 0, 4));
        }

        $table = lc_event_table();
        for ($i = 0; $i < 20; $i++) {
            $code = 'EVT-' . str_pad((string) random_int(100, 999), 3, '0', STR_PAD_LEFT);
            $row = lc_sql_fetch(" SELECT ev_id FROM `{$table}` WHERE ev_code = '" . lc_sql_escape($code) . "' LIMIT 1 ", false);
            if (!is_array($row) || empty($row['ev_id'])) {
                return $code;
            }
        }

        return 'EVT-' . date('His');
    }
}

if (!function_exists('lc_event_decode_badges')) {
    function lc_event_decode_badges($raw)
    {
        $raw = trim((string) $raw);
        if ($raw === '') {
            return array();
        }

        $decoded = json_decode($raw, true);
        if (is_array($decoded)) {
            return array_values(array_filter(array_map('strval', $decoded)));
        }

        return array_values(array_filter(array_map('trim', explode(',', $raw))));
    }
}

if (!function_exists('lc_event_encode_badges')) {
    function lc_event_encode_badges($badges)
    {
        if (!is_array($badges)) {
            return '';
        }

        $items = array_values(array_filter(array_map('trim', array_map('strval', $badges))));

        return json_encode($items, JSON_UNESCAPED_UNICODE);
    }
}

if (!function_exists('lc_event_row_to_public_card')) {
    function lc_event_row_to_public_card(array $row)
    {
        return array(
            'id'      => (string) ($row['ev_code'] ?? ''),
            'badges'  => lc_event_decode_badges($row['ev_badges'] ?? ''),
            'title'   => (string) ($row['ev_title'] ?? ''),
            'desc'    => (string) ($row['ev_desc'] ?? ''),
            'period'  => (string) ($row['ev_period'] ?? ''),
            'product' => (string) ($row['ev_product'] ?? ''),
            'benefit' => (string) ($row['ev_benefit'] ?? ''),
            'ribbon'  => (string) ($row['ev_ribbon'] ?? ''),
        );
    }
}

if (!function_exists('lc_event_row_to_admin')) {
    function lc_event_row_to_admin(array $row)
    {
        return array(
            'id'            => (int) ($row['ev_id'] ?? 0),
            'code'          => (string) ($row['ev_code'] ?? ''),
            'title'         => (string) ($row['ev_title'] ?? ''),
            'type'          => (string) ($row['ev_type'] ?? ''),
            'desc'          => (string) ($row['ev_desc'] ?? ''),
            'period'        => (string) ($row['ev_period'] ?? ''),
            'product'       => (string) ($row['ev_product'] ?? ''),
            'benefit'       => (string) ($row['ev_benefit'] ?? ''),
            'badges'        => lc_event_decode_badges($row['ev_badges'] ?? ''),
            'ribbon'        => (string) ($row['ev_ribbon'] ?? ''),
            'status'        => lc_event_status_ui($row['ev_status'] ?? ''),
            'statusCode'    => (string) ($row['ev_status'] ?? ''),
            'target'        => (string) ($row['ev_target'] ?? 'partner'),
            'campaigns'     => (string) ($row['ev_campaign_labels'] ?? ''),
            'campaignIds'   => (string) ($row['ev_campaign_ids'] ?? ''),
            'partners'      => 0,
            'received'      => 0,
            'approved'      => 0,
            'rewardPending' => '—',
            'featured'      => !empty($row['ev_featured']),
            'sort'          => (int) ($row['ev_sort'] ?? 0),
        );
    }
}

if (!function_exists('lc_event_admin_summary')) {
    function lc_event_admin_summary()
    {
        if (!lc_db_table_exists(lc_event_table())) {
            return array(
                'total'     => 0,
                'active'    => 0,
                'closing'   => 0,
                'scheduled' => 0,
                'ended'     => 0,
            );
        }

        $table = lc_event_table();
        $row = lc_sql_fetch("
            SELECT
                COUNT(*) AS total,
                SUM(CASE WHEN ev_status = '" . LC_EVENT_ACTIVE . "' THEN 1 ELSE 0 END) AS active_cnt,
                SUM(CASE WHEN ev_status = '" . LC_EVENT_CLOSING . "' THEN 1 ELSE 0 END) AS closing_cnt,
                SUM(CASE WHEN ev_status = '" . LC_EVENT_SCHEDULED . "' THEN 1 ELSE 0 END) AS scheduled_cnt,
                SUM(CASE WHEN ev_status = '" . LC_EVENT_ENDED . "' THEN 1 ELSE 0 END) AS ended_cnt
            FROM `{$table}`
        ", false);

        return array(
            'total'     => (int) ($row['total'] ?? 0),
            'active'    => (int) ($row['active_cnt'] ?? 0),
            'closing'   => (int) ($row['closing_cnt'] ?? 0),
            'scheduled' => (int) ($row['scheduled_cnt'] ?? 0),
            'ended'     => (int) ($row['ended_cnt'] ?? 0),
        );
    }
}

if (!function_exists('lc_event_public_summary')) {
    function lc_event_public_summary()
    {
        if (!lc_db_table_exists(lc_event_table())) {
            return function_exists('lc_sample_event_summary') ? lc_sample_event_summary() : array();
        }

        $summary = lc_event_admin_summary();
        $bonus = 0;
        $priceUp = 0;
        $table = lc_event_table();
        $result = lc_sql_query("
            SELECT ev_type, COUNT(*) AS cnt
            FROM `{$table}`
            WHERE ev_status IN ('" . LC_EVENT_ACTIVE . "', '" . LC_EVENT_CLOSING . "')
            GROUP BY ev_type
        ", false);

        if ($result) {
            while ($row = sql_fetch_array($result)) {
                $type = (string) ($row['ev_type'] ?? '');
                $cnt = (int) ($row['cnt'] ?? 0);
                if (strpos($type, '보너스') !== false) {
                    $bonus += $cnt;
                }
                if (strpos($type, '단가') !== false) {
                    $priceUp += $cnt;
                }
            }
        }

        return array(
            array('label' => '진행 중 이벤트', 'value' => (string) ($summary['active'] + $summary['closing']), 'suffix' => '개', 'icon' => 'megaphone'),
            array('label' => '보너스 지급 캠페인', 'value' => (string) $bonus, 'suffix' => '개', 'icon' => 'gift'),
            array('label' => '단가 상승 상품', 'value' => (string) $priceUp, 'suffix' => '개', 'icon' => 'trending'),
            array('label' => '마감 임박 이벤트', 'value' => (string) $summary['closing'], 'suffix' => '개', 'icon' => 'clock'),
        );
    }
}

if (!function_exists('lc_event_admin_for_api')) {
    function lc_event_admin_for_api(array $filters = array())
    {
        if (!lc_db_table_exists(lc_event_table())) {
            return array();
        }

        lc_event_ensure_seed();

        $table = lc_event_table();
        $where = array('1=1');
        $q = trim((string) ($filters['q'] ?? ''));
        $status = trim((string) ($filters['status'] ?? ''));

        if ($q !== '') {
            $esc = lc_sql_escape($q);
            $where[] = "(ev_title LIKE '%{$esc}%' OR ev_code LIKE '%{$esc}%' OR ev_product LIKE '%{$esc}%' OR ev_campaign_labels LIKE '%{$esc}%')";
        }

        if ($status !== '') {
            $where[] = "ev_status = '" . lc_sql_escape($status) . "'";
        }

        $sql = "
            SELECT *
            FROM `{$table}`
            WHERE " . implode(' AND ', $where) . "
            ORDER BY ev_sort DESC, ev_id DESC
            LIMIT 200
        ";

        $items = array();
        $result = lc_sql_query($sql, false);
        if ($result) {
            while ($row = sql_fetch_array($result)) {
                $items[] = lc_event_row_to_admin($row);
            }
        }

        return $items;
    }
}

if (!function_exists('lc_event_public_items')) {
    function lc_event_public_items(array $filters = array())
    {
        if (!lc_db_table_exists(lc_event_table())) {
            $cards = function_exists('lc_sample_event_cards') ? lc_sample_event_cards() : array();
            $items = array();
            foreach ($cards as $i => $card) {
                $items[] = array(
                    'id'      => 'EVT-' . str_pad((string) ($i + 1), 3, '0', STR_PAD_LEFT),
                    'badges'  => $card['badges'] ?? array(),
                    'title'   => (string) ($card['title'] ?? ''),
                    'desc'    => (string) ($card['desc'] ?? ''),
                    'period'  => (string) ($card['period'] ?? ''),
                    'product' => (string) ($card['product'] ?? ''),
                    'benefit' => (string) ($card['benefit'] ?? ''),
                    'ribbon'  => (string) ($card['ribbon'] ?? ''),
                );
            }

            return $items;
        }

        lc_event_ensure_seed();

        $table = lc_event_table();
        $where = array("ev_status IN ('" . LC_EVENT_ACTIVE . "', '" . LC_EVENT_CLOSING . "', '" . LC_EVENT_SCHEDULED . "')");
        $q = trim((string) ($filters['q'] ?? ''));

        if ($q !== '') {
            $esc = lc_sql_escape($q);
            $where[] = "(ev_title LIKE '%{$esc}%' OR ev_product LIKE '%{$esc}%')";
        }

        $sql = "
            SELECT *
            FROM `{$table}`
            WHERE " . implode(' AND ', $where) . "
            ORDER BY ev_featured DESC, ev_sort DESC, ev_id DESC
            LIMIT 100
        ";

        $items = array();
        $result = lc_sql_query($sql, false);
        if ($result) {
            while ($row = sql_fetch_array($result)) {
                $items[] = lc_event_row_to_public_card($row);
            }
        }

        return $items;
    }
}

if (!function_exists('lc_event_get_by_code')) {
    function lc_event_get_by_code($code)
    {
        $code = trim((string) $code);
        if ($code === '' || !lc_db_table_exists(lc_event_table())) {
            return null;
        }

        $table = lc_event_table();
        $row = lc_sql_fetch(" SELECT * FROM `{$table}` WHERE ev_code = '" . lc_sql_escape($code) . "' LIMIT 1 ", false);

        return is_array($row) && !empty($row['ev_id']) ? $row : null;
    }
}

if (!function_exists('lc_events_public_payload')) {
    function lc_events_public_payload(array $filters = array())
    {
        $recommendations = function_exists('lc_sample_event_recommendations') ? lc_sample_event_recommendations() : array();
        $promo = function_exists('lc_sample_promo_cpa') ? lc_sample_promo_cpa() : array();
        $rankingTop = function_exists('lc_sample_ranking_top') ? lc_sample_ranking_top() : array();
        $rankingList = function_exists('lc_sample_ranking_list') ? lc_sample_ranking_list() : array();

        return array(
            'summary'         => lc_event_public_summary(),
            'items'           => lc_event_public_items($filters),
            'recommendations' => $recommendations,
            'promoCpa'        => $promo,
            'rankingTop'      => $rankingTop,
            'rankingList'     => $rankingList,
            'dbReady'         => lc_db_installed(),
        );
    }
}

if (!function_exists('lc_event_save')) {
    function lc_event_save(array $payload, $ev_id = 0)
    {
        if (!lc_db_table_exists(lc_event_table())) {
            return array('ok' => false, 'message' => '이벤트 테이블이 없습니다.');
        }

        $ev_id = (int) $ev_id;
        $title = trim((string) ($payload['title'] ?? ''));
        if ($title === '') {
            return array('ok' => false, 'message' => '이벤트명을 입력해주세요.');
        }

        $table = lc_event_table();
        $badges = isset($payload['badges']) && is_array($payload['badges']) ? $payload['badges'] : array();
        $status = trim((string) ($payload['statusCode'] ?? LC_EVENT_ACTIVE));
        $allowed = array(LC_EVENT_ACTIVE, LC_EVENT_CLOSING, LC_EVENT_ENDED, LC_EVENT_SCHEDULED);
        if (!in_array($status, $allowed, true)) {
            $status = LC_EVENT_ACTIVE;
        }

        $fields = array(
            'ev_title'           => $title,
            'ev_type'            => trim((string) ($payload['type'] ?? '')),
            'ev_desc'            => trim((string) ($payload['desc'] ?? '')),
            'ev_period'          => trim((string) ($payload['period'] ?? '')),
            'ev_product'         => trim((string) ($payload['product'] ?? '')),
            'ev_benefit'         => trim((string) ($payload['benefit'] ?? '')),
            'ev_badges'          => lc_event_encode_badges($badges),
            'ev_ribbon'          => trim((string) ($payload['ribbon'] ?? '')),
            'ev_status'          => $status,
            'ev_target'          => trim((string) ($payload['target'] ?? 'partner')),
            'ev_campaign_ids'    => trim((string) ($payload['campaignIds'] ?? '')),
            'ev_campaign_labels' => trim((string) ($payload['campaigns'] ?? '')),
            'ev_featured'        => !empty($payload['featured']) ? 1 : 0,
            'ev_sort'            => (int) ($payload['sort'] ?? 0),
        );

        if ($ev_id > 0) {
            $exists = lc_sql_fetch(" SELECT ev_id FROM `{$table}` WHERE ev_id = {$ev_id} LIMIT 1 ", false);
            if (!is_array($exists) || empty($exists['ev_id'])) {
                return array('ok' => false, 'message' => '이벤트를 찾을 수 없습니다.');
            }

            $sets = array();
            foreach ($fields as $col => $value) {
                $sets[] = "`{$col}` = '" . lc_sql_escape($value) . "'";
            }
            lc_sql_query(" UPDATE `{$table}` SET " . implode(', ', $sets) . " WHERE ev_id = {$ev_id} ", false);
            $message = '이벤트가 저장되었습니다.';
        } else {
            $code = trim((string) ($payload['code'] ?? ''));
            if ($code === '') {
                $code = lc_event_generate_code();
            }

            $cols = array('ev_code');
            $vals = array("'" . lc_sql_escape($code) . "'");
            foreach ($fields as $col => $value) {
                $cols[] = $col;
                $vals[] = "'" . lc_sql_escape($value) . "'";
            }

            lc_sql_query(' INSERT INTO `' . $table . '` (`' . implode('`, `', $cols) . '`) VALUES (' . implode(', ', $vals) . ') ', false);
            $ev_id = (int) lc_sql_insert_id();
            $message = '이벤트가 등록되었습니다.';
        }

        $row = lc_sql_fetch(" SELECT * FROM `{$table}` WHERE ev_id = {$ev_id} LIMIT 1 ", false);

        return array(
            'ok'      => true,
            'message' => $message,
            'event'   => is_array($row) ? lc_event_row_to_admin($row) : null,
        );
    }
}

if (!function_exists('lc_event_update_status')) {
    function lc_event_update_status($ev_id, $status)
    {
        $ev_id = (int) $ev_id;
        $status = trim((string) $status);
        $allowed = array(LC_EVENT_ACTIVE, LC_EVENT_CLOSING, LC_EVENT_ENDED, LC_EVENT_SCHEDULED);

        if ($ev_id <= 0 || !in_array($status, $allowed, true) || !lc_db_table_exists(lc_event_table())) {
            return array('ok' => false, 'message' => '상태 변경에 실패했습니다.');
        }

        $table = lc_event_table();
        lc_sql_query(" UPDATE `{$table}` SET ev_status = '" . lc_sql_escape($status) . "' WHERE ev_id = {$ev_id} LIMIT 1 ", false);
        $row = lc_sql_fetch(" SELECT * FROM `{$table}` WHERE ev_id = {$ev_id} LIMIT 1 ", false);

        return array(
            'ok'      => true,
            'message' => '상태가 변경되었습니다.',
            'event'   => is_array($row) ? lc_event_row_to_admin($row) : null,
        );
    }
}

if (!function_exists('lc_event_ensure_seed')) {
    function lc_event_ensure_seed()
    {
        static $done = false;
        if ($done || !lc_db_table_exists(lc_event_table())) {
            return;
        }
        $done = true;

        $table = lc_event_table();
        $row = lc_sql_fetch(" SELECT COUNT(*) AS cnt FROM `{$table}` ", false);
        if ((int) ($row['cnt'] ?? 0) > 0) {
            return;
        }

        $cards = function_exists('lc_sample_event_cards') ? lc_sample_event_cards() : array();
        $admin = function_exists('lc_sample_admin_events_list') ? lc_sample_admin_events_list() : array();
        $status_map = array(
            '진행중'   => LC_EVENT_ACTIVE,
            '마감임박' => LC_EVENT_CLOSING,
            '종료'     => LC_EVENT_ENDED,
            '예정'     => LC_EVENT_SCHEDULED,
        );

        foreach ($admin as $i => $item) {
            $card = $cards[$i] ?? array();
            $badges = $card['badges'] ?? array($item['type'] ?? '');
            lc_event_save(array(
                'code'       => $item['code'] ?? lc_event_generate_code(),
                'title'      => $item['title'] ?? '',
                'type'       => $item['type'] ?? '',
                'desc'       => $card['desc'] ?? '',
                'period'     => $item['period'] ?? ($card['period'] ?? ''),
                'product'    => $card['product'] ?? ($item['campaigns'] ?? ''),
                'benefit'    => $card['benefit'] ?? '',
                'badges'     => $badges,
                'ribbon'     => $card['ribbon'] ?? '',
                'statusCode' => $status_map[$item['status'] ?? ''] ?? LC_EVENT_ACTIVE,
                'campaigns'  => $item['campaigns'] ?? '',
                'featured'   => $i < 3,
                'sort'       => 100 - $i,
            ), 0);
        }
    }
}
