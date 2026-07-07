<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

define('LC_INQUIRY_WAITING', 'waiting');
define('LC_INQUIRY_OPEN', 'open');
define('LC_INQUIRY_PROCESSING', 'processing');
define('LC_INQUIRY_HOLD', 'hold');
define('LC_INQUIRY_CLOSED', 'closed');

if (!function_exists('lc_inquiry_status_label')) {
    function lc_inquiry_status_label($status)
    {
        $labels = array(
            LC_INQUIRY_WAITING    => '답변대기',
            LC_INQUIRY_OPEN       => '접수완료',
            LC_INQUIRY_PROCESSING => '처리중',
            LC_INQUIRY_HOLD       => '보류',
            LC_INQUIRY_CLOSED     => '답변완료',
        );

        return isset($labels[$status]) ? $labels[$status] : (string) $status;
    }
}

if (!function_exists('lc_inquiry_generate_code')) {
    function lc_inquiry_generate_code()
    {
        return 'IQ-' . date('ymd') . '-' . str_pad((string) mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
    }
}

if (!function_exists('lc_inquiry_get_by_id')) {
    function lc_inquiry_get_by_id($iq_id)
    {
        if (!lc_db_installed()) {
            return null;
        }

        $iq_id = (int) $iq_id;
        $table = lc_table('inquiries');

        return lc_sql_fetch(" SELECT * FROM `{$table}` WHERE iq_id = '{$iq_id}' LIMIT 1 ");
    }
}

if (!function_exists('lc_inquiry_create')) {
    /**
     * @return array{ok:bool,message:string,inquiry:array|null}
     */
    function lc_inquiry_create(array $payload)
    {
        if (!lc_db_installed()) {
            return array('ok' => false, 'message' => 'DB가 설치되지 않았습니다.', 'inquiry' => null);
        }

        $subject = trim((string) ($payload['subject'] ?? ''));
        $body = trim((string) ($payload['body'] ?? ''));
        $category = trim((string) ($payload['category'] ?? ''));
        if ($subject === '' || $body === '' || $category === '') {
            return array('ok' => false, 'message' => '문의 유형, 제목, 내용은 필수입니다.', 'inquiry' => null);
        }

        $center = trim((string) ($payload['center'] ?? ''));
        $pt_id = (int) ($payload['pt_id'] ?? 0);
        $mt_id = (int) ($payload['mt_id'] ?? 0);
        $mb_id = trim((string) ($payload['mb_id'] ?? ''));

        $table = lc_table('inquiries');
        $code = lc_inquiry_generate_code();

        lc_sql_query(" INSERT INTO `{$table}` SET
            iq_code = '" . lc_sql_escape($code) . "',
            pt_id = '{$pt_id}',
            mt_id = '{$mt_id}',
            mb_id = '" . lc_sql_escape($mb_id) . "',
            iq_center = '" . lc_sql_escape($center) . "',
            iq_category = '" . lc_sql_escape($category) . "',
            iq_subject = '" . lc_sql_escape($subject) . "',
            iq_body = '" . lc_sql_escape($body) . "',
            iq_campaign = '" . lc_sql_escape($payload['campaign'] ?? '') . "',
            iq_cv_code = '" . lc_sql_escape($payload['cvCode'] ?? '') . "',
            iq_status = '" . lc_sql_escape(LC_INQUIRY_WAITING) . "',
            iq_created_at = NOW() ", false);

        $iq_id = (int) lc_sql_insert_id();
        if ($iq_id <= 0) {
            return array('ok' => false, 'message' => '문의 등록에 실패했습니다.', 'inquiry' => null);
        }

        return array(
            'ok'      => true,
            'message' => '문의가 등록되었습니다.',
            'inquiry' => lc_inquiry_get_by_id($iq_id),
        );
    }
}

if (!function_exists('lc_inquiry_list')) {
    function lc_inquiry_list(array $filters = array(), $limit = 100)
    {
        if (!lc_db_installed()) {
            return array();
        }

        $table = lc_table('inquiries');
        $pt_table = lc_table('partners');
        $mt_table = lc_table('merchants');
        $where = ' 1=1 ';

        if (!empty($filters['pt_id'])) {
            $where .= " AND iq.pt_id = '" . (int) $filters['pt_id'] . "' ";
        }
        if (!empty($filters['mt_id'])) {
            $where .= " AND iq.mt_id = '" . (int) $filters['mt_id'] . "' ";
        }
        if (!empty($filters['center'])) {
            $where .= " AND iq.iq_center = '" . lc_sql_escape($filters['center']) . "' ";
        }
        if (!empty($filters['status'])) {
            $where .= " AND iq.iq_status = '" . lc_sql_escape($filters['status']) . "' ";
        }
        if (!empty($filters['category'])) {
            $where .= " AND iq.iq_category = '" . lc_sql_escape($filters['category']) . "' ";
        }
        if (!empty($filters['q'])) {
            $q = lc_sql_escape($filters['q']);
            $where .= " AND (iq.iq_subject LIKE '%{$q}%' OR iq.iq_body LIKE '%{$q}%' OR iq.iq_code LIKE '%{$q}%') ";
        }

        $limit = max(1, min(200, (int) $limit));
        $rows = array();
        $sql = " SELECT iq.*, p.pt_code, p.pt_name, m.mt_code, m.mt_company
            FROM `{$table}` iq
            LEFT JOIN `{$pt_table}` p ON p.pt_id = iq.pt_id
            LEFT JOIN `{$mt_table}` m ON m.mt_id = iq.mt_id
            WHERE {$where}
            ORDER BY iq.iq_id DESC
            LIMIT {$limit} ";
        $result = lc_sql_query($sql, false);
        if ($result) {
            while ($row = sql_fetch_array($result)) {
                $rows[] = $row;
            }
        }

        return $rows;
    }
}

if (!function_exists('lc_inquiry_summary')) {
    function lc_inquiry_summary(array $filters = array())
    {
        if (!lc_db_installed()) {
            return array('total' => 0, 'waiting' => 0, 'processing' => 0, 'closed' => 0, 'today' => 0);
        }

        $table = lc_table('inquiries');
        $where = ' 1=1 ';
        if (!empty($filters['pt_id'])) {
            $where .= " AND pt_id = '" . (int) $filters['pt_id'] . "' ";
        }
        if (!empty($filters['mt_id'])) {
            $where .= " AND mt_id = '" . (int) $filters['mt_id'] . "' ";
        }
        if (!empty($filters['center'])) {
            $where .= " AND iq_center = '" . lc_sql_escape($filters['center']) . "' ";
        }

        $today = date('Y-m-d');
        $row = lc_sql_fetch(" SELECT
            COUNT(*) AS total_cnt,
            SUM(CASE WHEN iq_status = '" . lc_sql_escape(LC_INQUIRY_WAITING) . "' THEN 1 ELSE 0 END) AS waiting_cnt,
            SUM(CASE WHEN iq_status = '" . lc_sql_escape(LC_INQUIRY_PROCESSING) . "' THEN 1 ELSE 0 END) AS processing_cnt,
            SUM(CASE WHEN iq_status = '" . lc_sql_escape(LC_INQUIRY_CLOSED) . "' THEN 1 ELSE 0 END) AS closed_cnt,
            SUM(CASE WHEN DATE(iq_created_at) = '{$today}' THEN 1 ELSE 0 END) AS today_cnt
            FROM `{$table}` WHERE {$where} ");

        return array(
            'total'      => (int) ($row['total_cnt'] ?? 0),
            'waiting'    => (int) ($row['waiting_cnt'] ?? 0),
            'processing' => (int) ($row['processing_cnt'] ?? 0),
            'closed'     => (int) ($row['closed_cnt'] ?? 0),
            'today'      => (int) ($row['today_cnt'] ?? 0),
        );
    }
}

if (!function_exists('lc_inquiry_to_api')) {
    function lc_inquiry_to_api(array $row, $detail = false)
    {
        $center = (string) ($row['iq_center'] ?? '');
        $author = '';
        if ($center === 'partner') {
            $author = trim((string) ($row['pt_name'] ?? '') . ' (' . (string) ($row['pt_code'] ?? '') . ')');
        } elseif ($center === 'merchant') {
            $author = (string) ($row['mt_company'] ?? $row['mt_code'] ?? '');
        }

        $item = array(
            'id'        => (string) ($row['iq_code'] ?? ''),
            'iqId'      => (int) ($row['iq_id'] ?? 0),
            'date'      => date('Y.m.d H:i', strtotime($row['iq_created_at'] ?? 'now')),
            'center'    => $center === 'partner' ? '파트너' : ($center === 'merchant' ? '광고주' : $center),
            'centerCode'=> $center,
            'author'    => $author,
            'category'  => (string) ($row['iq_category'] ?? ''),
            'title'     => (string) ($row['iq_subject'] ?? ''),
            'campaign'  => (string) ($row['iq_campaign'] ?? ''),
            'cvCode'    => (string) ($row['iq_cv_code'] ?? ''),
            'status'    => lc_inquiry_status_label($row['iq_status'] ?? ''),
            'statusCode'=> (string) ($row['iq_status'] ?? ''),
            'replyDate' => !empty($row['iq_replied_at']) ? date('Y.m.d H:i', strtotime($row['iq_replied_at'])) : '-',
        );

        if ($detail) {
            $item['content'] = (string) ($row['iq_body'] ?? '');
            $item['reply'] = (string) ($row['iq_reply'] ?? '');
            $item['adminMemo'] = (string) ($row['iq_admin_memo'] ?? '');
        }

        return $item;
    }
}

if (!function_exists('lc_inquiry_admin_reply')) {
    /**
     * @return array{ok:bool,message:string,inquiry:array|null}
     */
    function lc_inquiry_admin_reply($iq_id, array $payload)
    {
        if (!lc_db_installed()) {
            return array('ok' => false, 'message' => 'DB가 설치되지 않았습니다.', 'inquiry' => null);
        }

        $inquiry = lc_inquiry_get_by_id($iq_id);
        if (!$inquiry) {
            return array('ok' => false, 'message' => '문의를 찾을 수 없습니다.', 'inquiry' => null);
        }

        $action = isset($payload['action']) ? (string) $payload['action'] : 'reply';
        $table = lc_table('inquiries');
        $sets = array();

        if ($action === 'reply' || $action === 'close') {
            $reply = trim((string) ($payload['reply'] ?? ''));
            if ($reply === '') {
                return array('ok' => false, 'message' => '답변 내용을 입력해주세요.', 'inquiry' => null);
            }
            $sets[] = "iq_reply = '" . lc_sql_escape($reply) . "'";
            $sets[] = "iq_status = '" . lc_sql_escape(LC_INQUIRY_CLOSED) . "'";
            $sets[] = "iq_replied_at = NOW()";
        } elseif ($action === 'status') {
            $status = trim((string) ($payload['status'] ?? ''));
            $allowed = array(LC_INQUIRY_WAITING, LC_INQUIRY_OPEN, LC_INQUIRY_PROCESSING, LC_INQUIRY_HOLD, LC_INQUIRY_CLOSED);
            if (!in_array($status, $allowed, true)) {
                return array('ok' => false, 'message' => '유효하지 않은 상태입니다.', 'inquiry' => null);
            }
            $sets[] = "iq_status = '" . lc_sql_escape($status) . "'";
            $reply = trim((string) ($payload['reply'] ?? ''));
            if ($reply !== '') {
                $sets[] = "iq_reply = '" . lc_sql_escape($reply) . "'";
                if ($status === LC_INQUIRY_CLOSED) {
                    $sets[] = "iq_replied_at = NOW()";
                }
            }
        } else {
            return array('ok' => false, 'message' => '유효하지 않은 액션입니다.', 'inquiry' => null);
        }

        if (isset($payload['adminMemo'])) {
            $sets[] = "iq_admin_memo = '" . lc_sql_escape((string) $payload['adminMemo']) . "'";
        }

        if (!$sets) {
            return array('ok' => false, 'message' => '변경할 내용이 없습니다.', 'inquiry' => null);
        }

        lc_sql_query(" UPDATE `{$table}` SET " . implode(', ', $sets) . " WHERE iq_id = '" . (int) $iq_id . "' LIMIT 1 ", false);

        return array(
            'ok'      => true,
            'message' => '문의가 처리되었습니다.',
            'inquiry' => lc_inquiry_get_by_id($iq_id),
        );
    }
}
