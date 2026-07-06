<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

if (!function_exists('lc_table_prefix')) {
    function lc_table_prefix()
    {
        if (defined('G5_TABLE_PREFIX') && (string) G5_TABLE_PREFIX !== '') {
            return (string) G5_TABLE_PREFIX;
        }

        global $g5;

        if (isset($g5['table_prefix']) && (string) $g5['table_prefix'] !== '') {
            return (string) $g5['table_prefix'];
        }

        return 'g5_';
    }
}

if (!function_exists('lc_table')) {
    function lc_table($name)
    {
        return lc_table_prefix() . 'lc_' . ltrim((string) $name, '_');
    }
}

if (!function_exists('lc_mysql_db_name')) {
    function lc_mysql_db_name()
    {
        if (defined('LC_MYSQL_DB') && (string) LC_MYSQL_DB !== '') {
            return (string) LC_MYSQL_DB;
        }

        return 'linkconnect';
    }
}

if (!function_exists('lc_mysql_credentials')) {
    /**
     * @return array{host:string,user:string,pass:string,db:string}
     */
    function lc_mysql_credentials()
    {
        return array(
            'host' => (defined('LC_MYSQL_HOST') && (string) LC_MYSQL_HOST !== '') ? (string) LC_MYSQL_HOST : G5_MYSQL_HOST,
            'user' => (defined('LC_MYSQL_USER') && (string) LC_MYSQL_USER !== '') ? (string) LC_MYSQL_USER : G5_MYSQL_USER,
            'pass' => defined('LC_MYSQL_PASSWORD') ? (string) LC_MYSQL_PASSWORD : G5_MYSQL_PASSWORD,
            'db'   => lc_mysql_db_name(),
        );
    }
}

if (!function_exists('lc_connect_db')) {
    function lc_connect_db()
    {
        global $g5;

        if (isset($g5['lc_connect_db']) && $g5['lc_connect_db']) {
            return $g5['lc_connect_db'];
        }

        $cred = lc_mysql_credentials();
        $link = sql_connect($cred['host'], $cred['user'], $cred['pass'], $cred['db']);
        if (!$link) {
            return null;
        }

        sql_set_charset(G5_DB_CHARSET, $link);
        $g5['lc_connect_db'] = $link;

        return $link;
    }
}

if (!function_exists('lc_uses_gnuboard_db')) {
    function lc_uses_gnuboard_db()
    {
        return defined('G5_MYSQL_DB') && G5_MYSQL_DB === lc_mysql_db_name();
    }
}

if (!function_exists('lc_sql_link')) {
    function lc_sql_link()
    {
        global $g5;

        if (lc_uses_gnuboard_db()) {
            return $g5['connect_db'];
        }

        $link = lc_connect_db();
        if ($link) {
            return $link;
        }

        return $g5['connect_db'];
    }
}

if (!function_exists('lc_db_connection_ok')) {
    function lc_db_connection_ok()
    {
        if (lc_uses_gnuboard_db()) {
            return true;
        }

        return lc_connect_db() !== null;
    }
}

if (!function_exists('lc_sql_query')) {
    function lc_sql_query($sql, $error = G5_DISPLAY_SQL_ERROR)
    {
        return sql_query($sql, $error, lc_sql_link());
    }
}

if (!function_exists('lc_sql_fetch')) {
    function lc_sql_fetch($sql, $error = G5_DISPLAY_SQL_ERROR)
    {
        return sql_fetch($sql, $error, lc_sql_link());
    }
}

if (!function_exists('lc_sql_insert_id')) {
    function lc_sql_insert_id()
    {
        return sql_insert_id(lc_sql_link());
    }
}

if (!function_exists('lc_sql_error')) {
    function lc_sql_error()
    {
        return sql_error_info(lc_sql_link());
    }
}

if (!function_exists('lc_sql_escape')) {
    function lc_sql_escape($value)
    {
        return sql_real_escape_string((string) $value, lc_sql_link());
    }
}

if (!function_exists('lc_db_table_exists')) {
    function lc_db_table_exists($table_name)
    {
        $table_name = lc_sql_escape($table_name);
        $row = lc_sql_fetch(" SHOW TABLES LIKE '{$table_name}' ", false);

        return is_array($row) && count($row) > 0;
    }
}

if (!function_exists('lc_db_installed')) {
    function lc_db_installed()
    {
        static $installed = null;

        if ($installed !== null) {
            return $installed;
        }

        if (!lc_db_connection_ok()) {
            $installed = false;
            return $installed;
        }

        $installed = lc_db_table_exists(lc_table('partners'))
            && lc_db_table_exists(lc_table('campaigns'))
            && lc_db_table_exists(lc_table('merchants'));

        return $installed;
    }
}

if (!function_exists('lc_db_run_schema')) {
    /**
     * @return array{ok:bool,message:string,tables:array}
     */
    function lc_db_run_schema()
    {
        $tables = array(
            lc_table('partners'),
            lc_table('merchants'),
            lc_table('campaigns'),
            lc_table('links'),
            lc_table('clicks'),
            lc_table('conversions'),
            lc_table('wallet_transactions'),
            lc_table('settlements'),
            lc_table('inquiries'),
        );

        $queries = array(
            "CREATE TABLE IF NOT EXISTS `" . lc_table('partners') . "` (
                `pt_id` int unsigned NOT NULL AUTO_INCREMENT,
                `mb_id` varchar(20) NOT NULL,
                `pt_code` varchar(20) NOT NULL,
                `pt_name` varchar(100) NOT NULL DEFAULT '',
                `pt_status` varchar(20) NOT NULL DEFAULT 'pending',
                `pt_bank_name` varchar(50) NOT NULL DEFAULT '',
                `pt_bank_account` varchar(50) NOT NULL DEFAULT '',
                `pt_bank_holder` varchar(50) NOT NULL DEFAULT '',
                `pt_balance` int NOT NULL DEFAULT 0,
                `pt_created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                `pt_updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (`pt_id`),
                UNIQUE KEY `uk_mb_id` (`mb_id`),
                UNIQUE KEY `uk_pt_code` (`pt_code`),
                KEY `idx_pt_status` (`pt_status`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

            "CREATE TABLE IF NOT EXISTS `" . lc_table('merchants') . "` (
                `mt_id` int unsigned NOT NULL AUTO_INCREMENT,
                `mb_id` varchar(20) NOT NULL,
                `mt_code` varchar(20) NOT NULL,
                `mt_company` varchar(200) NOT NULL DEFAULT '',
                `mt_status` varchar(20) NOT NULL DEFAULT 'pending',
                `mt_balance` int NOT NULL DEFAULT 0,
                `mt_created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                `mt_updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (`mt_id`),
                UNIQUE KEY `uk_mb_id` (`mb_id`),
                UNIQUE KEY `uk_mt_code` (`mt_code`),
                KEY `idx_mt_status` (`mt_status`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

            "CREATE TABLE IF NOT EXISTS `" . lc_table('campaigns') . "` (
                `cp_id` int unsigned NOT NULL AUTO_INCREMENT,
                `mt_id` int unsigned NOT NULL DEFAULT 0,
                `cp_code` varchar(20) NOT NULL,
                `cp_name` varchar(200) NOT NULL,
                `cp_category` varchar(50) NOT NULL DEFAULT '',
                `cp_type` varchar(10) NOT NULL DEFAULT 'cpa',
                `cp_price` int unsigned NOT NULL DEFAULT 0,
                `cp_approval_rate` varchar(10) NOT NULL DEFAULT '',
                `cp_avg_time` varchar(20) NOT NULL DEFAULT '',
                `cp_allowed_channels` varchar(500) NOT NULL DEFAULT '',
                `cp_forbidden_channels` varchar(500) NOT NULL DEFAULT '',
                `cp_description` text,
                `cp_landing_url` varchar(500) NOT NULL DEFAULT '',
                `cp_status` varchar(20) NOT NULL DEFAULT 'draft',
                `cp_badge` varchar(20) NOT NULL DEFAULT '',
                `cp_recommended` tinyint(1) NOT NULL DEFAULT 0,
                `cp_sort` int NOT NULL DEFAULT 0,
                `cp_created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                `cp_updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (`cp_id`),
                UNIQUE KEY `uk_cp_code` (`cp_code`),
                KEY `idx_cp_status` (`cp_status`),
                KEY `idx_cp_category` (`cp_category`),
                KEY `idx_mt_id` (`mt_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

            "CREATE TABLE IF NOT EXISTS `" . lc_table('links') . "` (
                `lk_id` int unsigned NOT NULL AUTO_INCREMENT,
                `pt_id` int unsigned NOT NULL,
                `cp_id` int unsigned NOT NULL,
                `lk_code` varchar(32) NOT NULL,
                `lk_channel` varchar(100) NOT NULL DEFAULT '',
                `lk_sub_id` varchar(100) NOT NULL DEFAULT '',
                `lk_status` varchar(20) NOT NULL DEFAULT 'active',
                `lk_created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                `lk_updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (`lk_id`),
                UNIQUE KEY `uk_lk_code` (`lk_code`),
                KEY `idx_pt_id` (`pt_id`),
                KEY `idx_cp_id` (`cp_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

            "CREATE TABLE IF NOT EXISTS `" . lc_table('clicks') . "` (
                `cl_id` bigint unsigned NOT NULL AUTO_INCREMENT,
                `lk_id` int unsigned NOT NULL,
                `pt_id` int unsigned NOT NULL,
                `cp_id` int unsigned NOT NULL,
                `cl_ip` varchar(45) NOT NULL DEFAULT '',
                `cl_user_agent` varchar(500) NOT NULL DEFAULT '',
                `cl_referer` varchar(500) NOT NULL DEFAULT '',
                `cl_created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (`cl_id`),
                KEY `idx_lk_id` (`lk_id`),
                KEY `idx_pt_created` (`pt_id`, `cl_created_at`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

            "CREATE TABLE IF NOT EXISTS `" . lc_table('conversions') . "` (
                `cv_id` bigint unsigned NOT NULL AUTO_INCREMENT,
                `cv_code` varchar(20) NOT NULL,
                `pt_id` int unsigned NOT NULL,
                `cp_id` int unsigned NOT NULL,
                `lk_id` int unsigned NOT NULL DEFAULT 0,
                `cv_name` varchar(100) NOT NULL DEFAULT '',
                `cv_phone` varchar(20) NOT NULL DEFAULT '',
                `cv_email` varchar(100) NOT NULL DEFAULT '',
                `cv_region` varchar(50) NOT NULL DEFAULT '',
                `cv_inquiry` varchar(500) NOT NULL DEFAULT '',
                `cv_status` varchar(20) NOT NULL DEFAULT 'pending',
                `cv_price` int NOT NULL DEFAULT 0,
                `cv_channel` varchar(100) NOT NULL DEFAULT '',
                `cv_sub_id` varchar(100) NOT NULL DEFAULT '',
                `cv_comment` varchar(500) NOT NULL DEFAULT '',
                `cv_created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                `cv_updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (`cv_id`),
                UNIQUE KEY `uk_cv_code` (`cv_code`),
                KEY `idx_pt_status` (`pt_id`, `cv_status`),
                KEY `idx_cp_id` (`cp_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

            "CREATE TABLE IF NOT EXISTS `" . lc_table('wallet_transactions') . "` (
                `wt_id` bigint unsigned NOT NULL AUTO_INCREMENT,
                `mt_id` int unsigned NOT NULL,
                `wt_type` varchar(20) NOT NULL DEFAULT 'charge',
                `wt_amount` int NOT NULL DEFAULT 0,
                `wt_balance_after` int NOT NULL DEFAULT 0,
                `wt_status` varchar(20) NOT NULL DEFAULT 'completed',
                `wt_memo` varchar(500) NOT NULL DEFAULT '',
                `wt_ref_type` varchar(20) NOT NULL DEFAULT '',
                `wt_ref_id` bigint unsigned NOT NULL DEFAULT 0,
                `wt_created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (`wt_id`),
                KEY `idx_mt_created` (`mt_id`, `wt_created_at`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

            "CREATE TABLE IF NOT EXISTS `" . lc_table('settlements') . "` (
                `st_id` int unsigned NOT NULL AUTO_INCREMENT,
                `st_code` varchar(20) NOT NULL,
                `pt_id` int unsigned NOT NULL,
                `st_amount` int NOT NULL DEFAULT 0,
                `st_status` varchar(20) NOT NULL DEFAULT 'pending',
                `st_bank_name` varchar(50) NOT NULL DEFAULT '',
                `st_bank_account` varchar(50) NOT NULL DEFAULT '',
                `st_bank_holder` varchar(50) NOT NULL DEFAULT '',
                `st_requested_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                `st_processed_at` datetime DEFAULT NULL,
                PRIMARY KEY (`st_id`),
                UNIQUE KEY `uk_st_code` (`st_code`),
                KEY `idx_pt_id` (`pt_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

            "CREATE TABLE IF NOT EXISTS `" . lc_table('inquiries') . "` (
                `iq_id` int unsigned NOT NULL AUTO_INCREMENT,
                `iq_code` varchar(20) NOT NULL,
                `pt_id` int unsigned NOT NULL DEFAULT 0,
                `mt_id` int unsigned NOT NULL DEFAULT 0,
                `mb_id` varchar(20) NOT NULL DEFAULT '',
                `iq_category` varchar(50) NOT NULL DEFAULT '',
                `iq_subject` varchar(200) NOT NULL DEFAULT '',
                `iq_body` text,
                `iq_status` varchar(20) NOT NULL DEFAULT 'open',
                `iq_created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (`iq_id`),
                UNIQUE KEY `uk_iq_code` (`iq_code`),
                KEY `idx_pt_id` (`pt_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
        );

        foreach ($queries as $sql) {
            $result = lc_sql_query($sql, false);
            if ($result === false) {
                return array(
                    'ok'      => false,
                    'message' => '테이블 생성 실패: ' . lc_sql_error(),
                    'tables'  => array(),
                );
            }
        }

        $migrate = lc_db_run_migrations();
        if (!$migrate['ok']) {
            return $migrate;
        }

        return array(
            'ok'      => true,
            'message' => 'LinkConnect DB 스키마가 설치되었습니다.',
            'tables'  => $tables,
        );
    }
}

if (!function_exists('lc_db_column_exists')) {
    function lc_db_column_exists($table_name, $column_name)
    {
        $table_name = lc_sql_escape($table_name);
        $column_name = lc_sql_escape($column_name);
        $row = lc_sql_fetch(" SHOW COLUMNS FROM `{$table_name}` LIKE '{$column_name}' ", false);

        return is_array($row) && count($row) > 0;
    }
}

if (!function_exists('lc_db_run_migrations')) {
    /**
     * @return array{ok:bool,message:string,tables?:array}
     */
    function lc_db_run_migrations()
    {
        $campaigns = lc_table('campaigns');
        $conversions = lc_table('conversions');
        $inquiries = lc_table('inquiries');

        $alters = array();

        if (lc_db_table_exists($campaigns) && !lc_db_column_exists($campaigns, 'mt_id')) {
            $alters[] = "ALTER TABLE `{$campaigns}` ADD COLUMN `mt_id` int unsigned NOT NULL DEFAULT 0 AFTER `cp_id`, ADD KEY `idx_mt_id` (`mt_id`)";
        }

        foreach (array(
            'cv_email'   => "varchar(100) NOT NULL DEFAULT '' AFTER `cv_phone`",
            'cv_region'  => "varchar(50) NOT NULL DEFAULT '' AFTER `cv_email`",
            'cv_inquiry' => "varchar(500) NOT NULL DEFAULT '' AFTER `cv_region`",
        ) as $col => $definition) {
            if (lc_db_table_exists($conversions) && !lc_db_column_exists($conversions, $col)) {
                $alters[] = "ALTER TABLE `{$conversions}` ADD COLUMN `{$col}` {$definition}";
            }
        }

        if (lc_db_table_exists($inquiries) && !lc_db_column_exists($inquiries, 'mt_id')) {
            $alters[] = "ALTER TABLE `{$inquiries}` ADD COLUMN `mt_id` int unsigned NOT NULL DEFAULT 0 AFTER `pt_id`";
        }

        foreach ($alters as $sql) {
            $result = lc_sql_query($sql, false);
            if ($result === false) {
                return array(
                    'ok'      => false,
                    'message' => '마이그레이션 실패: ' . lc_sql_error(),
                );
            }
        }

        return array('ok' => true, 'message' => '마이그레이션 완료');
    }
}
