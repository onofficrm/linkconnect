<?php
/**
 * LinkConnect DB 설치 (최고관리자 전용)
 *
 * 브라우저: /plugin/linkconnect/install/install.php
 * CLI: php scripts/install-linkconnect.php
 */
require_once dirname(__DIR__) . '/_common.php';

$is_cli = php_sapi_name() === 'cli';

if (!$is_cli) {
    if (!lc_is_super_admin()) {
        alert('최고관리자만 DB를 설치할 수 있습니다.', G5_URL);
    }
}

$action = isset($_REQUEST['action']) ? (string) $_REQUEST['action'] : 'form';
$activate_mb_id = isset($_REQUEST['activate_mb_id']) ? trim((string) $_REQUEST['activate_mb_id']) : '';

if ($action === 'run' || $is_cli) {
    $schema = lc_db_run_schema();
    if (!$schema['ok']) {
        if ($is_cli) {
            fwrite(STDERR, $schema['message'] . PHP_EOL);
            exit(1);
        }
        alert($schema['message']);
    }

    $seed = lc_campaign_seed_defaults();
    $migrate = lc_db_run_migrations();

    $activated_partner = null;
    $activated_merchant = null;
    $activate_merchant_mb_id = isset($_REQUEST['activate_merchant_mb_id']) ? trim((string) $_REQUEST['activate_merchant_mb_id']) : '';

    if ($activate_mb_id !== '') {
        $create = lc_partner_create($activate_mb_id, $activate_mb_id, LC_PARTNER_STATUS_ACTIVE);
        if ($create['ok'] && is_array($create['partner'])) {
            $activated_partner = $create['partner'];
        } elseif (!$create['ok'] && is_array($create['partner'])) {
            lc_partner_update_status((int) $create['partner']['pt_id'], LC_PARTNER_STATUS_ACTIVE);
            $activated_partner = lc_get_partner_by_mb_id($activate_mb_id);
        }
    } elseif ($is_cli && lc_is_logged_in() && isset($member['mb_id'])) {
        $create = lc_partner_create($member['mb_id'], $member['mb_name'] ?? $member['mb_id'], LC_PARTNER_STATUS_ACTIVE);
        if ($create['ok']) {
            $activated_partner = $create['partner'];
        } elseif (is_array($create['partner'])) {
            lc_partner_update_status((int) $create['partner']['pt_id'], LC_PARTNER_STATUS_ACTIVE);
            $activated_partner = lc_get_partner_by_mb_id($member['mb_id']);
        }
    }

    $merchant_mb = $activate_merchant_mb_id !== '' ? $activate_merchant_mb_id : $activate_mb_id;
    if ($merchant_mb !== '') {
        $merchant_seed = lc_merchant_seed_defaults($merchant_mb, $merchant_mb, 2350000);
        if ($merchant_seed['ok'] && is_array($merchant_seed['merchant'])) {
            $activated_merchant = $merchant_seed['merchant'];
        }
    }

    $message = $schema['message'];
    if ($migrate['ok']) {
        $message .= "\n마이그레이션: 완료";
    }
    $message .= "\n캠페인 시드: " . (int) $seed['inserted'] . "건";
    if ($activated_partner) {
        $message .= "\n활성 파트너: " . $activated_partner['pt_code'] . ' (' . $activated_partner['mb_id'] . ')';
    }
    if ($activated_merchant) {
        $message .= "\n활성 광고주: " . $activated_merchant['mt_code'] . ' (' . $activated_merchant['mb_id'] . ')';
    }

    if ($is_cli) {
        echo $message . PHP_EOL;
        exit(0);
    }

    alert($message, lc_url('install/install.php?done=1'));
}

$done = isset($_GET['done']);
?>
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LinkConnect DB 설치</title>
  <link rel="stylesheet" href="<?php echo lc_h(lc_asset_url('css/linkconnect.css')); ?>">
</head>
<body class="lc-app lc-app--public">
<main class="lc-main" style="max-width:720px;margin:2rem auto;padding:1rem;">
  <div class="lc-panel">
    <h1 class="lc-panel__title">LinkConnect DB 설치</h1>
    <?php if ($done) { ?>
      <p class="lc-muted">설치가 완료되었습니다. 파트너센터 API를 사용할 수 있습니다.</p>
    <?php } else { ?>
      <p class="lc-muted">파트너·캠페인·링크·전환·정산 테이블을 생성하고 기본 CPA 캠페인을 시드합니다.</p>
    <?php } ?>

    <ul class="lc-muted" style="margin:1rem 0;line-height:1.8;">
      <li>테이블 접두사: <code><?php echo lc_h(lc_table_prefix()); ?>lc_*</code></li>
      <li>DB 설치 여부: <strong><?php echo lc_db_installed() ? '완료' : '미설치'; ?></strong></li>
      <li>파트너 가드: <strong><?php echo LC_PARTNER_GUARD_ENABLED ? '활성' : '비활성'; ?></strong></li>
    </ul>

    <form method="post" action="<?php echo lc_h(lc_url('install/install.php')); ?>" style="display:flex;flex-direction:column;gap:0.75rem;max-width:360px;">
      <input type="hidden" name="action" value="run">
      <label>
        <span class="lc-muted">설치 후 활성화할 회원 ID (파트너, 선택)</span>
        <input type="text" name="activate_mb_id" class="lc-input" placeholder="admin" value="<?php echo lc_h($activate_mb_id); ?>">
      </label>
      <label>
        <span class="lc-muted">설치 후 활성화할 광고주 회원 ID (선택, 비우면 파트너 ID와 동일)</span>
        <input type="text" name="activate_merchant_mb_id" class="lc-input" placeholder="admin" value="<?php echo lc_h(isset($_REQUEST['activate_merchant_mb_id']) ? (string) $_REQUEST['activate_merchant_mb_id'] : ''); ?>">
      </label>
      <button type="submit" class="lc-btn lc-btn--primary">DB 설치 실행</button>
    </form>

    <p style="margin-top:1.5rem">
      <a class="lc-btn lc-btn--ghost" href="<?php echo lc_h(lc_url('partner/dashboard.php')); ?>">파트너센터</a>
      <a class="lc-btn lc-btn--ghost" href="<?php echo lc_h(G5_URL); ?>">홈</a>
    </p>
  </div>
</main>
</body>
</html>
