<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

if (!function_exists('lc_wallet_get_balance')) {
    function lc_wallet_get_balance($mt_id)
    {
        $merchant = lc_get_merchant_by_id($mt_id);

        return is_array($merchant) ? (int) $merchant['mt_balance'] : 0;
    }
}

if (!function_exists('lc_wallet_record')) {
    /**
     * @return array{ok:bool,message:string,balance?:int}
     */
    function lc_wallet_record($mt_id, $type, $amount, $memo = '', $ref_type = '', $ref_id = 0, $status = 'completed')
    {
        if (!lc_db_installed()) {
            return array('ok' => false, 'message' => 'DB가 설치되지 않았습니다.');
        }

        $mt_id = (int) $mt_id;
        $amount = (int) $amount;
        $merchant = lc_get_merchant_by_id($mt_id);
        if (!$merchant) {
            return array('ok' => false, 'message' => '광고주를 찾을 수 없습니다.');
        }

        $balance = (int) $merchant['mt_balance'];
        $new_balance = $balance + $amount;
        if ($status === 'completed' && $new_balance < 0) {
            return array('ok' => false, 'message' => '광고비 잔액이 부족합니다.');
        }

        $merchant_table = lc_table('merchants');
        $wallet_table = lc_table('wallet_transactions');

        if ($status === 'completed') {
            lc_sql_query(" UPDATE `{$merchant_table}` SET mt_balance = '{$new_balance}', mt_updated_at = NOW() WHERE mt_id = '{$mt_id}' ", false);
        }

        lc_sql_query(" INSERT INTO `{$wallet_table}` SET
            mt_id = '{$mt_id}',
            wt_type = '" . lc_sql_escape($type) . "',
            wt_amount = '{$amount}',
            wt_balance_after = '" . ($status === 'completed' ? $new_balance : $balance) . "',
            wt_status = '" . lc_sql_escape($status) . "',
            wt_memo = '" . lc_sql_escape($memo) . "',
            wt_ref_type = '" . lc_sql_escape($ref_type) . "',
            wt_ref_id = '" . (int) $ref_id . "',
            wt_created_at = NOW() ", false);

        return array('ok' => true, 'message' => '거래가 기록되었습니다.', 'balance' => $status === 'completed' ? $new_balance : $balance);
    }
}

if (!function_exists('lc_wallet_deduct_for_conversion')) {
    function lc_wallet_deduct_for_conversion($mt_id, $cv_id, $amount, $memo = '')
    {
        return lc_wallet_record($mt_id, 'deduct', -1 * abs((int) $amount), $memo, 'conversion', (int) $cv_id);
    }
}

if (!function_exists('lc_wallet_list_for_merchant')) {
    function lc_wallet_list_for_merchant($mt_id, $limit = 20)
    {
        if (!lc_db_installed()) {
            return array();
        }

        $mt_id = (int) $mt_id;
        $limit = max(1, min(100, (int) $limit));
        $table = lc_table('wallet_transactions');
        $rows = array();
        $result = lc_sql_query(" SELECT * FROM `{$table}` WHERE mt_id = '{$mt_id}' ORDER BY wt_id DESC LIMIT {$limit} ", false);

        if ($result) {
            while ($row = sql_fetch_array($result)) {
                $rows[] = $row;
            }
        }

        return $rows;
    }
}

if (!function_exists('lc_wallet_transaction_to_api')) {
    function lc_wallet_transaction_to_api(array $row)
    {
        $type_labels = array(
            'charge' => '충전',
            'deduct' => '차감',
            'refund' => '환급',
        );

        return array(
            'id'        => (int) $row['wt_id'],
            'date'      => (string) $row['wt_created_at'],
            'type'      => isset($type_labels[$row['wt_type']]) ? $type_labels[$row['wt_type']] : (string) $row['wt_type'],
            'typeCode'  => (string) $row['wt_type'],
            'amount'    => (int) $row['wt_amount'],
            'balance'   => (int) $row['wt_balance_after'],
            'status'    => (string) $row['wt_status'],
            'memo'      => (string) $row['wt_memo'],
        );
    }
}

if (!function_exists('lc_wallet_request_charge')) {
    /**
     * @return array{ok:bool,message:string}
     */
    function lc_wallet_request_charge($mt_id, $amount, $memo = '')
    {
        if ($amount <= 0) {
            return array('ok' => false, 'message' => '충전 금액이 올바르지 않습니다.');
        }

        $result = lc_wallet_record($mt_id, 'charge', (int) $amount, $memo !== '' ? $memo : '광고비 충전 신청', 'charge_request', 0, 'pending');

        return array(
            'ok'      => $result['ok'],
            'message' => $result['ok'] ? '충전 신청이 접수되었습니다.' : $result['message'],
        );
    }
}

if (!function_exists('lc_wallet_list_for_api')) {
    function lc_wallet_list_for_api($mt_id)
    {
        if (lc_db_installed()) {
            return array_map('lc_wallet_transaction_to_api', lc_wallet_list_for_merchant($mt_id));
        }

        if (!function_exists('lc_sample_merchant_wallet_history')) {
            return array();
        }

        $items = array();
        foreach (lc_sample_merchant_wallet_history() as $row) {
            $items[] = array(
                'id'       => 0,
                'date'     => (string) $row['date'],
                'type'     => (string) $row['type'],
                'typeCode' => (string) $row['type'],
                'amount'   => (int) $row['amount'],
                'balance'  => (int) $row['balance'],
                'status'   => 'completed',
                'memo'     => (string) $row['memo'],
            );
        }

        return $items;
    }
}

if (!function_exists('lc_wallet_count_pending')) {
    function lc_wallet_count_pending()
    {
        if (!lc_db_installed()) {
            return 0;
        }

        $table = lc_table('wallet_transactions');
        $row = lc_sql_fetch(" SELECT COUNT(*) AS cnt FROM `{$table}` WHERE wt_status = 'pending' AND wt_type = 'charge' ");

        return (int) ($row['cnt'] ?? 0);
    }
}

if (!function_exists('lc_wallet_list_pending_charges')) {
    function lc_wallet_list_pending_charges($limit = 50)
    {
        if (!lc_db_installed()) {
            return array();
        }

        $wt_table = lc_table('wallet_transactions');
        $mt_table = lc_table('merchants');
        $limit = max(1, min(100, (int) $limit));

        $rows = array();
        $sql = " SELECT wt.*, m.mt_company, m.mt_code
            FROM `{$wt_table}` wt
            INNER JOIN `{$mt_table}` m ON m.mt_id = wt.mt_id
            WHERE wt.wt_status = 'pending' AND wt.wt_type = 'charge'
            ORDER BY wt.wt_id DESC
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

if (!function_exists('lc_wallet_pending_to_api')) {
    function lc_wallet_pending_to_api(array $row)
    {
        return array(
            'id'         => (int) $row['wt_id'],
            'date'       => (string) $row['wt_created_at'],
            'merchant'   => (string) ($row['mt_company'] ?? ''),
            'merchantCode'=> (string) ($row['mt_code'] ?? ''),
            'mtId'       => (int) $row['mt_id'],
            'amount'     => (int) $row['wt_amount'],
            'memo'       => (string) $row['wt_memo'],
            'status'     => '충전대기',
        );
    }
}

if (!function_exists('lc_wallet_approve_transaction')) {
    /**
     * @return array{ok:bool,message:string}
     */
    function lc_wallet_approve_transaction($wt_id)
    {
        if (!lc_db_installed()) {
            return array('ok' => false, 'message' => 'DB가 설치되지 않았습니다.');
        }

        $wt_id = (int) $wt_id;
        $wt_table = lc_table('wallet_transactions');
        $row = lc_sql_fetch(" SELECT * FROM `{$wt_table}` WHERE wt_id = '{$wt_id}' AND wt_status = 'pending' LIMIT 1 ");
        if (!$row) {
            return array('ok' => false, 'message' => '대기 중인 거래를 찾을 수 없습니다.');
        }

        $mt_id = (int) $row['mt_id'];
        $amount = (int) $row['wt_amount'];
        $merchant = lc_get_merchant_by_id($mt_id);
        if (!$merchant) {
            return array('ok' => false, 'message' => '광고주를 찾을 수 없습니다.');
        }

        $new_balance = (int) $merchant['mt_balance'] + $amount;
        $merchant_table = lc_table('merchants');

        lc_sql_query(" UPDATE `{$merchant_table}` SET mt_balance = '{$new_balance}', mt_updated_at = NOW() WHERE mt_id = '{$mt_id}' ", false);
        lc_sql_query(" UPDATE `{$wt_table}` SET wt_status = 'completed', wt_balance_after = '{$new_balance}' WHERE wt_id = '{$wt_id}' ", false);

        return array('ok' => true, 'message' => '충전이 승인되었습니다.');
    }
}

if (!function_exists('lc_wallet_reject_transaction')) {
    function lc_wallet_reject_transaction($wt_id, $memo = '')
    {
        if (!lc_db_installed()) {
            return array('ok' => false, 'message' => 'DB가 설치되지 않았습니다.');
        }

        $wt_id = (int) $wt_id;
        $wt_table = lc_table('wallet_transactions');
        $row = lc_sql_fetch(" SELECT * FROM `{$wt_table}` WHERE wt_id = '{$wt_id}' AND wt_status = 'pending' LIMIT 1 ");
        if (!$row) {
            return array('ok' => false, 'message' => '대기 중인 거래를 찾을 수 없습니다.');
        }

        $memo_esc = lc_sql_escape($memo !== '' ? $memo : '충전 신청 반려');
        lc_sql_query(" UPDATE `{$wt_table}` SET wt_status = 'rejected', wt_memo = CONCAT(wt_memo, ' / ', '{$memo_esc}') WHERE wt_id = '{$wt_id}' ", false);

        return array('ok' => true, 'message' => '충전 신청이 반려되었습니다.');
    }
}
