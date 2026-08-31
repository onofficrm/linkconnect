<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

if (!function_exists('lc_conversion_attachment_ensure_schema')) {
    function lc_conversion_attachment_ensure_schema()
    {
        if (!function_exists('lc_db_installed') || !lc_db_installed()) {
            return;
        }
        $table = lc_table('conversions');
        if (!function_exists('lc_db_table_exists') || !lc_db_table_exists($table)) {
            return;
        }
        foreach (array(
            'cv_attachment_path' => "varchar(500) NOT NULL DEFAULT '' AFTER `cv_inquiry`",
            'cv_attachment_name' => "varchar(255) NOT NULL DEFAULT '' AFTER `cv_attachment_path`",
            'cv_attachment_mime'   => "varchar(120) NOT NULL DEFAULT '' AFTER `cv_attachment_name`",
        ) as $col => $definition) {
            if (!lc_db_column_exists($table, $col)) {
                lc_sql_query("ALTER TABLE `{$table}` ADD COLUMN `{$col}` {$definition}", false);
            }
        }
    }
}

if (!function_exists('lc_conversion_attachment_dir')) {
    function lc_conversion_attachment_dir()
    {
        if (defined('G5_DATA_PATH')) {
            return rtrim((string) G5_DATA_PATH, '/') . '/linkconnect/conversion_attachments';
        }

        return dirname(__DIR__) . '/data/conversion_attachments';
    }
}

if (!function_exists('lc_conversion_attachment_ensure_dir')) {
    function lc_conversion_attachment_ensure_dir()
    {
        $dir = lc_conversion_attachment_dir();
        if (is_dir($dir)) {
            return true;
        }

        return @mkdir($dir, 0755, true);
    }
}

if (!function_exists('lc_conversion_attachment_full_path')) {
    function lc_conversion_attachment_full_path($relative)
    {
        $relative = ltrim(str_replace('\\', '/', (string) $relative), '/');
        if ($relative === '' || strpos($relative, '..') !== false) {
            return '';
        }
        if (defined('G5_DATA_PATH')) {
            return rtrim((string) G5_DATA_PATH, '/') . '/' . $relative;
        }

        return dirname(__DIR__) . '/data/' . $relative;
    }
}

if (!function_exists('lc_conversion_store_attachment')) {
    /**
     * @param array{name?:string,type?:string,tmp_name?:string,error?:int,size?:int} $file
     * @return array{ok:bool,message:string,path:string,name:string,mime:string}
     */
    function lc_conversion_store_attachment(array $file, $cv_id)
    {
        $empty = array('ok' => false, 'message' => '', 'path' => '', 'name' => '', 'mime' => '');
        $cv_id = (int) $cv_id;
        if ($cv_id <= 0) {
            $empty['message'] = '디비 ID가 올바르지 않습니다.';

            return $empty;
        }
        if (empty($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
            $empty['message'] = '첨부파일을 업로드하지 못했습니다.';

            return $empty;
        }
        if (!empty($file['error']) && (int) $file['error'] !== UPLOAD_ERR_OK) {
            $empty['message'] = '첨부파일 업로드 오류가 발생했습니다.';

            return $empty;
        }

        $max_bytes = 10 * 1024 * 1024;
        $size = isset($file['size']) ? (int) $file['size'] : 0;
        if ($size <= 0 || $size > $max_bytes) {
            $empty['message'] = '첨부파일은 10MB 이하만 가능합니다.';

            return $empty;
        }

        $original = isset($file['name']) ? (string) $file['name'] : 'attachment';
        $ext = strtolower(pathinfo($original, PATHINFO_EXTENSION));
        $allowed_ext = array('pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp');
        if (!in_array($ext, $allowed_ext, true)) {
            $empty['message'] = 'PDF 또는 이미지(jpg, png, webp 등)만 첨부할 수 있습니다.';

            return $empty;
        }

        $finfo_mime = '';
        if (function_exists('finfo_open')) {
            $fi = finfo_open(FILEINFO_MIME_TYPE);
            if ($fi) {
                $finfo_mime = (string) finfo_file($fi, $file['tmp_name']);
                finfo_close($fi);
            }
        }
        $allowed_mime = array(
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
        );
        if ($finfo_mime !== '' && !in_array($finfo_mime, $allowed_mime, true)) {
            $empty['message'] = '허용되지 않는 첨부파일 형식입니다.';

            return $empty;
        }

        if (!lc_conversion_attachment_ensure_dir()) {
            $empty['message'] = '첨부파일 저장 폴더를 준비하지 못했습니다.';

            return $empty;
        }

        $subdir = lc_conversion_attachment_dir() . '/' . $cv_id;
        if (!is_dir($subdir) && !@mkdir($subdir, 0755, true)) {
            $empty['message'] = '첨부파일 저장 폴더를 만들지 못했습니다.';

            return $empty;
        }

        $safe_base = preg_replace('/[^a-zA-Z0-9._-]+/', '_', pathinfo($original, PATHINFO_FILENAME));
        if ($safe_base === '' || $safe_base === null) {
            $safe_base = 'attachment';
        }
        $stored_name = $safe_base . '_' . date('YmdHis') . '.' . $ext;
        $full = $subdir . '/' . $stored_name;
        if (!@move_uploaded_file($file['tmp_name'], $full)) {
            $empty['message'] = '첨부파일을 저장하지 못했습니다.';

            return $empty;
        }

        $relative = 'linkconnect/conversion_attachments/' . $cv_id . '/' . $stored_name;

        return array(
            'ok'      => true,
            'message' => '',
            'path'    => $relative,
            'name'    => $original,
            'mime'    => $finfo_mime !== '' ? $finfo_mime : (string) ($file['type'] ?? ''),
        );
    }
}

if (!function_exists('lc_conversion_bind_attachment')) {
    /**
     * @param array{path:string,name:string,mime:string} $stored
     */
    function lc_conversion_bind_attachment($cv_id, array $stored)
    {
        $cv_id = (int) $cv_id;
        if ($cv_id <= 0 || trim((string) ($stored['path'] ?? '')) === '') {
            return false;
        }
        lc_conversion_attachment_ensure_schema();
        $table = lc_table('conversions');

        return lc_sql_query(" UPDATE `{$table}` SET
            cv_attachment_path = '" . lc_sql_escape((string) $stored['path']) . "',
            cv_attachment_name = '" . lc_sql_escape((string) ($stored['name'] ?? '')) . "',
            cv_attachment_mime = '" . lc_sql_escape((string) ($stored['mime'] ?? '')) . "',
            cv_updated_at = NOW()
            WHERE cv_id = '{$cv_id}' LIMIT 1 ", false) !== false;
    }
}

if (!function_exists('lc_conversion_save_attachment')) {
    /**
     * @param array{name?:string,type?:string,tmp_name?:string,error?:int,size?:int} $file
     * @return array{ok:bool,message:string}
     */
    function lc_conversion_save_attachment($cv_id, array $file)
    {
        $stored = lc_conversion_store_attachment($file, $cv_id);
        if (empty($stored['ok'])) {
            return array('ok' => false, 'message' => (string) ($stored['message'] ?? '첨부 저장 실패'));
        }
        if (!lc_conversion_bind_attachment($cv_id, $stored)) {
            return array('ok' => false, 'message' => '첨부 정보를 저장하지 못했습니다.');
        }

        return array('ok' => true, 'message' => '');
    }
}

if (!function_exists('lc_conversion_merchant_owns_cv')) {
    function lc_conversion_merchant_owns_cv($cv_id, $mt_id)
    {
        $cv_id = (int) $cv_id;
        $mt_id = (int) $mt_id;
        if ($cv_id <= 0 || $mt_id <= 0 || !lc_db_installed()) {
            return false;
        }
        $cv_table = lc_table('conversions');
        $cp_table = lc_table('campaigns');
        $row = lc_sql_fetch(" SELECT cp.mt_id
            FROM `{$cv_table}` cv
            INNER JOIN `{$cp_table}` cp ON cp.cp_id = cv.cp_id
            WHERE cv.cv_id = '{$cv_id}'
            LIMIT 1 ");
        if (!is_array($row)) {
            return false;
        }

        return (int) ($row['mt_id'] ?? 0) === $mt_id;
    }
}

if (!function_exists('lc_conversion_inquiry_attachment_name')) {
    function lc_conversion_inquiry_attachment_name($inquiry)
    {
        $inquiry = (string) $inquiry;
        if ($inquiry === '') {
            return '';
        }
        if (preg_match('/견적서첨부:\s*([^|]+)/u', $inquiry, $matches)) {
            return trim((string) ($matches[1] ?? ''));
        }

        return '';
    }
}

if (!function_exists('lc_conversion_attachment_api_meta')) {
    function lc_conversion_attachment_api_meta(array $row)
    {
        $cv_id = (int) ($row['cv_id'] ?? 0);
        $path = trim((string) ($row['cv_attachment_path'] ?? ''));
        $name = trim((string) ($row['cv_attachment_name'] ?? ''));
        $mime = trim((string) ($row['cv_attachment_mime'] ?? ''));
        $inquiry_name = lc_conversion_inquiry_attachment_name((string) ($row['cv_inquiry'] ?? ''));
        if ($name === '' && $inquiry_name !== '') {
            $name = $inquiry_name;
        }
        if ($path === '' || $cv_id <= 0) {
            return array(
                'attachmentName'        => $name,
                'attachmentMime'        => $mime,
                'attachmentUrl'         => '',
                'attachmentDownloadUrl' => '',
                'attachmentPreviewable' => false,
                'attachmentStored'      => false,
            );
        }

        $base = (defined('LC_PLUGIN_URL') ? LC_PLUGIN_URL : '') . '/merchant/api/conversion-attachment.php';
        $preview = strpos($mime, 'image/') === 0 || $mime === 'application/pdf';

        return array(
            'attachmentName'        => $name,
            'attachmentMime'        => $mime,
            'attachmentUrl'         => $base . '?cvId=' . $cv_id . '&inline=1',
            'attachmentDownloadUrl' => $base . '?cvId=' . $cv_id,
            'attachmentPreviewable' => $preview,
            'attachmentStored'      => true,
        );
    }
}

if (!function_exists('lc_conversion_serve_attachment_for_merchant')) {
    function lc_conversion_serve_attachment_for_merchant($cv_id, $mt_id, $inline = true)
    {
        $cv_id = (int) $cv_id;
        $mt_id = (int) $mt_id;
        if ($cv_id <= 0 || $mt_id <= 0) {
            return array('ok' => false, 'message' => '잘못된 요청입니다.');
        }
        if (!lc_conversion_merchant_owns_cv($cv_id, $mt_id)) {
            return array('ok' => false, 'message' => '접근 권한이 없습니다.', 'status' => 403);
        }

        $row = function_exists('lc_conversion_get_by_id') ? lc_conversion_get_by_id($cv_id) : null;
        if (!is_array($row)) {
            return array('ok' => false, 'message' => '디비를 찾을 수 없습니다.', 'status' => 404);
        }

        $rel = trim((string) ($row['cv_attachment_path'] ?? ''));
        $name = trim((string) ($row['cv_attachment_name'] ?? 'attachment'));
        $mime = trim((string) ($row['cv_attachment_mime'] ?? 'application/octet-stream'));
        $full = lc_conversion_attachment_full_path($rel);
        if ($rel === '' || $full === '' || !is_file($full)) {
            return array('ok' => false, 'message' => '첨부파일이 없습니다.', 'status' => 404);
        }

        return array(
            'ok'       => true,
            'path'     => $full,
            'name'     => $name,
            'mime'     => $mime !== '' ? $mime : 'application/octet-stream',
            'inline'   => (bool) $inline,
        );
    }
}

if (!function_exists('lc_conversion_phone_digits')) {
    function lc_conversion_phone_digits($phone)
    {
        return preg_replace('/\D+/', '', (string) $phone);
    }
}

if (!function_exists('lc_conversion_delete_attachment_files')) {
    function lc_conversion_delete_attachment_files($cv_id, $relative = '')
    {
        $cv_id = (int) $cv_id;
        if ($cv_id <= 0) {
            return;
        }
        $dir = lc_conversion_attachment_dir() . '/' . $cv_id;
        if (is_dir($dir)) {
            $dh = opendir($dir);
            if ($dh !== false) {
                while (($entry = readdir($dh)) !== false) {
                    if ($entry === '.' || $entry === '..') {
                        continue;
                    }
                    $path = $dir . '/' . $entry;
                    if (is_file($path)) {
                        @unlink($path);
                    }
                }
                closedir($dh);
            }
            @rmdir($dir);
        }
        if ($relative !== '') {
            $full = lc_conversion_attachment_full_path($relative);
            if ($full !== '' && is_file($full)) {
                @unlink($full);
            }
        }
    }
}

if (!function_exists('lc_conversion_delete_by_ids')) {
    /**
     * @param int[] $cv_ids
     * @return array{ok:bool,message:string,deleted:int,kept:int[]}
     */
    function lc_conversion_delete_by_ids(array $cv_ids)
    {
        if (!lc_db_installed()) {
            return array('ok' => false, 'message' => 'DB가 설치되지 않았습니다.', 'deleted' => 0, 'kept' => array());
        }
        $cv_ids = array_values(array_unique(array_filter(array_map('intval', $cv_ids), function ($id) {
            return $id > 0;
        })));
        if (!$cv_ids) {
            return array('ok' => false, 'message' => '삭제할 디비 ID가 없습니다.', 'deleted' => 0, 'kept' => array());
        }

        $table = lc_table('conversions');
        $deleted = 0;
        foreach ($cv_ids as $cv_id) {
            $row = function_exists('lc_conversion_get_by_id') ? lc_conversion_get_by_id($cv_id) : null;
            if (!is_array($row)) {
                continue;
            }
            lc_conversion_delete_attachment_files($cv_id, (string) ($row['cv_attachment_path'] ?? ''));
            if (lc_sql_query(" DELETE FROM `{$table}` WHERE cv_id = '{$cv_id}' LIMIT 1 ", false) !== false) {
                $deleted++;
            }
        }

        return array(
            'ok'      => true,
            'message' => $deleted . '건 삭제했습니다.',
            'deleted' => $deleted,
            'kept'    => array(),
        );
    }
}

if (!function_exists('lc_conversion_prune_modemo_except')) {
    /**
     * @return array{ok:bool,message:string,deleted:int,kept:array|null}
     */
    function lc_conversion_prune_modemo_except($keep_name, $keep_phone)
    {
        if (!lc_db_installed()) {
            return array('ok' => false, 'message' => 'DB가 설치되지 않았습니다.', 'deleted' => 0, 'kept' => null);
        }

        $keep_name = trim((string) $keep_name);
        $keep_phone_digits = lc_conversion_phone_digits($keep_phone);
        if ($keep_name === '' || $keep_phone_digits === '') {
            return array('ok' => false, 'message' => '유지할 고객명·연락처가 필요합니다.', 'deleted' => 0, 'kept' => null);
        }

        $cp_table = lc_table('campaigns');
        $cv_table = lc_table('conversions');
        $campaign = lc_sql_fetch(" SELECT cp_id FROM `{$cp_table}` WHERE cp_code = 'CPA-MODEMO' LIMIT 1 ");
        if (!is_array($campaign)) {
            return array('ok' => false, 'message' => '모두의철거(CPA-MODEMO) 캠페인을 찾을 수 없습니다.', 'deleted' => 0, 'kept' => null);
        }
        $cp_id = (int) ($campaign['cp_id'] ?? 0);

        $keep_row = null;
        $delete_ids = array();
        $result = lc_sql_query(" SELECT cv_id, cv_name, cv_phone, cv_attachment_path FROM `{$cv_table}`
            WHERE cp_id = '{$cp_id}'
            ORDER BY cv_id ASC ", false);
        if ($result) {
            while ($row = sql_fetch_array($result)) {
                $digits = lc_conversion_phone_digits($row['cv_phone'] ?? '');
                $name = trim((string) ($row['cv_name'] ?? ''));
                if ($name === $keep_name && $digits === $keep_phone_digits) {
                    $keep_row = $row;
                    continue;
                }
                $delete_ids[] = (int) ($row['cv_id'] ?? 0);
            }
        }

        if (!$keep_row) {
            return array('ok' => false, 'message' => '유지할 디비(' . $keep_name . ' / ' . $keep_phone . ')를 찾지 못했습니다.', 'deleted' => 0, 'kept' => null);
        }

        $delete_result = lc_conversion_delete_by_ids($delete_ids);

        return array(
            'ok'      => true,
            'message' => '모두의철거 디비 ' . (int) $delete_result['deleted'] . '건 삭제, ' . $keep_name . ' 1건 유지',
            'deleted' => (int) $delete_result['deleted'],
            'kept'    => $keep_row,
        );
    }
}
