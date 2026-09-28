<?php
/**
 * 관리자 유입 분석 — 클릭·접수 DB를 출처·채널·도메인·UTM·파트너·상품별로 집계.
 */
require_once __DIR__ . '/_common.php';

lc_api_require_admin();
lc_api_require_method('GET');

if (!lc_db_installed()) {
    lc_api_error('DB가 설치되지 않았습니다.', 'DB_NOT_READY', 400);
}

$period = isset($_GET['period']) ? (int) $_GET['period'] : 7;
if (!in_array($period, array(7, 30, 90), true)) {
    $period = 7;
}
$date_to = date('Y-m-d');
$date_from = date('Y-m-d', strtotime($date_to . ' -' . ($period - 1) . ' days'));
$from_esc = lc_sql_escape($date_from);
$to_esc = lc_sql_escape($date_to);

$pt_id = isset($_GET['ptId']) ? (int) $_GET['ptId'] : 0;
$cp_id = isset($_GET['cpId']) ? (int) $_GET['cpId'] : 0;
$source = isset($_GET['source']) ? strtolower(trim((string) $_GET['source'])) : 'all';
if (!in_array($source, array('all', 'form', 'embed', 'call'), true)) {
    $source = 'all';
}

$cv = lc_table('conversions');
$cl = lc_table('clicks');
$pt = lc_table('partners');
$cp = lc_table('campaigns');

$source_expr = "CASE
    WHEN cv.cv_source = 'call' THEN 'call'
    WHEN cv.cv_source = 'embed' OR LOWER(IFNULL(cv.cv_channel,'')) IN ('embed','wordpress','widget','external') THEN 'embed'
    ELSE 'form'
END";

$cv_where = "DATE(cv.cv_created_at) BETWEEN '{$from_esc}' AND '{$to_esc}'";
if ($pt_id > 0) {
    $cv_where .= " AND cv.pt_id = '{$pt_id}'";
}
if ($cp_id > 0) {
    $cv_where .= " AND cv.cp_id = '{$cp_id}'";
}
if ($source !== 'all') {
    $cv_where .= " AND ({$source_expr}) = '" . lc_sql_escape($source) . "'";
}

$cl_where = "DATE(cl.cl_created_at) BETWEEN '{$from_esc}' AND '{$to_esc}'";
if ($pt_id > 0) {
    $cl_where .= " AND cl.pt_id = '{$pt_id}'";
}
if ($cp_id > 0) {
    $cl_where .= " AND cl.cp_id = '{$cp_id}'";
}

$host_of = function ($column) {
    return "LOWER(SUBSTRING_INDEX(SUBSTRING_INDEX(REPLACE(REPLACE(REPLACE(TRIM({$column}),'https://',''),'http://',''),'//',''),'/',1),':',1))";
};

$fetch_all = function ($sql) {
    $rows = array();
    $result = lc_sql_query($sql, false);
    if ($result) {
        while ($row = sql_fetch_array($result)) {
            $rows[] = $row;
        }
    }
    return $rows;
};

$with_share = function (array $rows, $count_key) {
    $total = 0;
    foreach ($rows as $row) {
        $total += (int) ($row[$count_key] ?? 0);
    }
    $out = array();
    foreach ($rows as $row) {
        $count = (int) ($row[$count_key] ?? 0);
        $approved = isset($row['approved']) ? (int) $row['approved'] : 0;
        $item = array();
        foreach ($row as $key => $value) {
            if (!is_int($key)) {
                $item[$key] = $value;
            }
        }
        $item[$count_key] = $count;
        if (isset($row['approved'])) {
            $item['approved'] = $approved;
            $item['approvalRate'] = $count > 0 ? round(($approved / $count) * 100, 1) : 0;
        }
        $item['percentage'] = $total > 0 ? (int) round(($count / $total) * 100) : 0;
        $out[] = $item;
    }
    return $out;
};

$summary_row = lc_sql_fetch(" SELECT
    COUNT(*) AS total_db,
    SUM(cv.cv_status = '" . lc_sql_escape(LC_STATUS_APPROVED) . "') AS approved,
    SUM(cv.cv_status = '" . lc_sql_escape(LC_STATUS_REJECTED) . "') AS rejected,
    SUM(cv.cv_status = '" . lc_sql_escape(LC_STATUS_PENDING) . "') AS pending
    FROM `{$cv}` cv
    WHERE {$cv_where} ", false);

$click_row = lc_sql_fetch(" SELECT COUNT(*) AS clicks, COUNT(DISTINCT cl.cl_ip) AS visitors
    FROM `{$cl}` cl
    WHERE {$cl_where} ", false);

$total_db = (int) ($summary_row['total_db'] ?? 0);
$approved = (int) ($summary_row['approved'] ?? 0);
$clicks = (int) ($click_row['clicks'] ?? 0);

$chart_map = array();
$cursor = strtotime($date_from);
$end = strtotime($date_to);
while ($cursor !== false && $cursor <= $end) {
    $day = date('Y-m-d', $cursor);
    $chart_map[$day] = array('date' => $day, 'clicks' => 0, 'db' => 0, 'approved' => 0);
    $cursor = strtotime('+1 day', $cursor);
}
foreach ($fetch_all(" SELECT DATE(cv.cv_created_at) AS day, COUNT(*) AS db_cnt,
    SUM(cv.cv_status = '" . lc_sql_escape(LC_STATUS_APPROVED) . "') AS approved
    FROM `{$cv}` cv WHERE {$cv_where} GROUP BY DATE(cv.cv_created_at) ") as $row) {
    $day = substr((string) ($row['day'] ?? ''), 0, 10);
    if (isset($chart_map[$day])) {
        $chart_map[$day]['db'] = (int) $row['db_cnt'];
        $chart_map[$day]['approved'] = (int) $row['approved'];
    }
}
foreach ($fetch_all(" SELECT DATE(cl.cl_created_at) AS day, COUNT(*) AS clicks
    FROM `{$cl}` cl WHERE {$cl_where} GROUP BY DATE(cl.cl_created_at) ") as $row) {
    $day = substr((string) ($row['day'] ?? ''), 0, 10);
    if (isset($chart_map[$day])) {
        $chart_map[$day]['clicks'] = (int) $row['clicks'];
    }
}

$source_labels = array('form' => '폼/링크', 'embed' => '외부위젯', 'call' => '콜디비');
$sources = array();
foreach ($fetch_all(" SELECT ({$source_expr}) AS source_key, COUNT(*) AS total,
    SUM(cv.cv_status = '" . lc_sql_escape(LC_STATUS_APPROVED) . "') AS approved
    FROM `{$cv}` cv WHERE {$cv_where} GROUP BY ({$source_expr}) ORDER BY total DESC ") as $row) {
    $key = (string) ($row['source_key'] ?? 'form');
    $sources[] = array(
        'key'      => $key,
        'label'    => isset($source_labels[$key]) ? $source_labels[$key] : $key,
        'total'    => (int) $row['total'],
        'approved' => (int) $row['approved'],
    );
}
$sources = $with_share($sources, 'total');

$channel_expr = "IF(TRIM(cv.cv_channel) = '', '(없음)', cv.cv_channel)";
$channels = $with_share($fetch_all(" SELECT
    {$channel_expr} AS label,
    COUNT(*) AS total,
    SUM(cv.cv_status = '" . lc_sql_escape(LC_STATUS_APPROVED) . "') AS approved
    FROM `{$cv}` cv WHERE {$cv_where}
    GROUP BY {$channel_expr} ORDER BY total DESC LIMIT 12 "), 'total');

$ref_host = $host_of('cv.cv_referer');
$page_host = $host_of('cv.cv_page_url');
$click_host = $host_of('cl.cl_referer');

$ref_label = "IF(TRIM(cv.cv_referer) = '' OR ({$ref_host}) = '', '직접 유입', {$ref_host})";
$referrers = $with_share($fetch_all(" SELECT
    {$ref_label} AS label,
    COUNT(*) AS total,
    SUM(cv.cv_status = '" . lc_sql_escape(LC_STATUS_APPROVED) . "') AS approved
    FROM `{$cv}` cv WHERE {$cv_where}
    GROUP BY {$ref_label} ORDER BY total DESC LIMIT 12 "), 'total');

$page_label = "IF(TRIM(cv.cv_page_url) = '' OR ({$page_host}) = '', '(페이지 없음)', {$page_host})";
$page_hosts = $with_share($fetch_all(" SELECT
    {$page_label} AS label,
    COUNT(*) AS total,
    SUM(cv.cv_status = '" . lc_sql_escape(LC_STATUS_APPROVED) . "') AS approved
    FROM `{$cv}` cv WHERE {$cv_where}
    GROUP BY {$page_label} ORDER BY total DESC LIMIT 12 "), 'total');

$utm = function ($column) use ($fetch_all, $with_share, $cv, $cv_where) {
    $col = preg_replace('/[^a-z_]/', '', $column);
    $expr = "IF(TRIM(cv.`{$col}`) = '', '(없음)', cv.`{$col}`)";
    return $with_share($fetch_all(" SELECT
        {$expr} AS label,
        COUNT(*) AS total,
        SUM(cv.cv_status = '" . lc_sql_escape(LC_STATUS_APPROVED) . "') AS approved
        FROM `{$cv}` cv WHERE {$cv_where}
        GROUP BY {$expr} ORDER BY total DESC LIMIT 12 "), 'total');
};

$click_label = "IF(TRIM(cl.cl_referer) = '' OR ({$click_host}) = '', '직접 유입', {$click_host})";
$click_referrers = $with_share($fetch_all(" SELECT
    {$click_label} AS label,
    COUNT(*) AS total
    FROM `{$cl}` cl WHERE {$cl_where}
    GROUP BY {$click_label} ORDER BY total DESC LIMIT 12 "), 'total');

$device_expr = "CASE
        WHEN cl.cl_user_agent = '' THEN 'unknown'
        WHEN cl.cl_user_agent REGEXP 'Mobile|Android|iPhone|iPad|iPod' THEN 'mobile'
        ELSE 'desktop'
    END";
$devices_raw = $fetch_all(" SELECT
    {$device_expr} AS device_key,
    COUNT(*) AS total
    FROM `{$cl}` cl WHERE {$cl_where}
    GROUP BY {$device_expr}
    ORDER BY total DESC ");
$device_labels = array('mobile' => '모바일', 'desktop' => '데스크톱', 'unknown' => '미확인');
$devices = array();
foreach ($devices_raw as $row) {
    $key = (string) ($row['device_key'] ?? 'unknown');
    $devices[] = array(
        'key'   => $key,
        'label' => isset($device_labels[$key]) ? $device_labels[$key] : $key,
        'total' => (int) $row['total'],
    );
}
$devices = $with_share($devices, 'total');

$partners = $with_share($fetch_all(" SELECT
    cv.pt_id AS id,
    IFNULL(p.pt_code, '') AS code,
    IFNULL(NULLIF(p.pt_name, ''), IFNULL(p.pt_code, CONCAT('파트너 #', cv.pt_id))) AS label,
    COUNT(*) AS total,
    SUM(cv.cv_status = '" . lc_sql_escape(LC_STATUS_APPROVED) . "') AS approved
    FROM `{$cv}` cv
    LEFT JOIN `{$pt}` p ON p.pt_id = cv.pt_id
    WHERE {$cv_where}
    GROUP BY cv.pt_id, p.pt_code, p.pt_name
    ORDER BY total DESC LIMIT 15 "), 'total');

$campaigns = $with_share($fetch_all(" SELECT
    cv.cp_id AS id,
    IFNULL(c.cp_code, '') AS code,
    IFNULL(NULLIF(c.cp_name, ''), CONCAT('상품 #', cv.cp_id)) AS label,
    COUNT(*) AS total,
    SUM(cv.cv_status = '" . lc_sql_escape(LC_STATUS_APPROVED) . "') AS approved
    FROM `{$cv}` cv
    LEFT JOIN `{$cp}` c ON c.cp_id = cv.cp_id
    WHERE {$cv_where}
    GROUP BY cv.cp_id, c.cp_code, c.cp_name
    ORDER BY total DESC LIMIT 15 "), 'total');

$path_channel = "IF(TRIM(cv.cv_channel) = '', '(없음)', cv.cv_channel)";
$path_utm_source = "IF(TRIM(cv.cv_utm_source) = '', '(없음)', cv.cv_utm_source)";
$path_utm_medium = "IF(TRIM(cv.cv_utm_medium) = '', '(없음)', cv.cv_utm_medium)";
$path_utm_campaign = "IF(TRIM(cv.cv_utm_campaign) = '', '(없음)', cv.cv_utm_campaign)";
$paths = $with_share($fetch_all(" SELECT
    ({$source_expr}) AS source_key,
    {$path_channel} AS channel,
    {$ref_label} AS referer_host,
    {$page_label} AS page_host,
    {$path_utm_source} AS utm_source,
    {$path_utm_medium} AS utm_medium,
    {$path_utm_campaign} AS utm_campaign,
    COUNT(*) AS total,
    SUM(cv.cv_status = '" . lc_sql_escape(LC_STATUS_APPROVED) . "') AS approved
    FROM `{$cv}` cv WHERE {$cv_where}
    GROUP BY ({$source_expr}), {$path_channel}, {$ref_label}, {$page_label}, {$path_utm_source}, {$path_utm_medium}, {$path_utm_campaign}
    ORDER BY total DESC LIMIT 40 "), 'total');
$mapped_paths = array();
foreach ($paths as $path) {
    $key = (string) ($path['source_key'] ?? 'form');
    $mapped_paths[] = array(
        'sourceKey'     => $key,
        'sourceLabel'   => isset($source_labels[$key]) ? $source_labels[$key] : $key,
        'channel'       => (string) ($path['channel'] ?? ''),
        'refererHost'   => (string) ($path['referer_host'] ?? ''),
        'pageHost'      => (string) ($path['page_host'] ?? ''),
        'utmSource'     => (string) ($path['utm_source'] ?? ''),
        'utmMedium'     => (string) ($path['utm_medium'] ?? ''),
        'utmCampaign'   => (string) ($path['utm_campaign'] ?? ''),
        'total'         => (int) ($path['total'] ?? 0),
        'approved'      => (int) ($path['approved'] ?? 0),
        'approvalRate'  => (float) ($path['approvalRate'] ?? 0),
        'percentage'    => (int) ($path['percentage'] ?? 0),
    );
}
$paths = $mapped_paths;

$filter_partners = $fetch_all(" SELECT DISTINCT cv.pt_id AS id, IFNULL(p.pt_code,'') AS code,
    IFNULL(NULLIF(p.pt_name,''), IFNULL(p.pt_code, CONCAT('#', cv.pt_id))) AS label
    FROM `{$cv}` cv
    LEFT JOIN `{$pt}` p ON p.pt_id = cv.pt_id
    WHERE DATE(cv.cv_created_at) BETWEEN '{$from_esc}' AND '{$to_esc}'
    ORDER BY label ASC LIMIT 200 ");
$filter_campaigns = $fetch_all(" SELECT DISTINCT cv.cp_id AS id, IFNULL(c.cp_code,'') AS code,
    IFNULL(NULLIF(c.cp_name,''), CONCAT('#', cv.cp_id)) AS label
    FROM `{$cv}` cv
    LEFT JOIN `{$cp}` c ON c.cp_id = cv.cp_id
    WHERE DATE(cv.cv_created_at) BETWEEN '{$from_esc}' AND '{$to_esc}'
    ORDER BY label ASC LIMIT 200 ");

$normalize_options = function (array $rows) {
    $out = array();
    foreach ($rows as $row) {
        $out[] = array(
            'id'    => (int) ($row['id'] ?? 0),
            'code'  => (string) ($row['code'] ?? ''),
            'label' => (string) ($row['label'] ?? ''),
        );
    }
    return $out;
};

lc_api_success(array(
    'range' => array(
        'dateFrom' => $date_from,
        'dateTo'   => $date_to,
        'period'   => $period,
    ),
    'summary' => array(
        'clicks'         => $clicks,
        'uniqueVisitors' => (int) ($click_row['visitors'] ?? 0),
        'totalDb'        => $total_db,
        'approved'       => $approved,
        'rejected'       => (int) ($summary_row['rejected'] ?? 0),
        'pending'        => (int) ($summary_row['pending'] ?? 0),
        'approvalRate'   => $total_db > 0 ? round(($approved / $total_db) * 100, 1) : 0,
        'convRate'       => $clicks > 0 ? round(($total_db / $clicks) * 100, 1) : 0,
    ),
    'chart'           => array_values($chart_map),
    'sources'         => $sources,
    'channels'        => $channels,
    'referrers'       => $referrers,
    'pageHosts'       => $page_hosts,
    'utmSources'      => $utm('cv_utm_source'),
    'utmMediums'      => $utm('cv_utm_medium'),
    'utmCampaigns'    => $utm('cv_utm_campaign'),
    'clickReferrers'  => $click_referrers,
    'devices'         => $devices,
    'partners'        => $partners,
    'campaigns'       => $campaigns,
    'paths'           => $paths,
    'filterOptions'   => array(
        'partners'  => $normalize_options($filter_partners),
        'campaigns' => $normalize_options($filter_campaigns),
    ),
));
