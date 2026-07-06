<?php
if (!defined('_GNUBOARD_')) {
    exit;
}
$lc_page_title = isset($lc_page_title) ? (string) $lc_page_title : '광고주센터';
$lc_merchant_company = isset($lc_merchant_company) ? (string) $lc_merchant_company : '(주)리드앤솔루션';
$lc_merchant_balance = isset($lc_merchant_balance) ? (string) $lc_merchant_balance : '2,350,000';
$lc_toolbar_merchant = function_exists('lc_get_current_merchant') ? lc_get_current_merchant() : null;
if (is_array($lc_toolbar_merchant)) {
    $lc_merchant_company = (string) $lc_toolbar_merchant['mt_company'];
    $lc_merchant_balance = number_format((int) $lc_toolbar_merchant['mt_balance']);
}
?>
<header class="lc-partner-toolbar lc-merchant-toolbar">
  <div class="lc-partner-toolbar__left">
    <button type="button" class="lc-sidebar-toggle" data-lc-sidebar-toggle aria-expanded="false" aria-controls="lcMerchantSidebar" aria-label="사이드바 열기">
      <span class="lc-nav-toggle__icon" aria-hidden="true">
        <span class="lc-nav-toggle__bar"></span>
        <span class="lc-nav-toggle__bar"></span>
        <span class="lc-nav-toggle__bar"></span>
      </span>
    </button>
    <div>
      <h1 class="lc-partner-toolbar__title"><?php echo lc_h($lc_page_title); ?></h1>
      <p class="lc-partner-toolbar__date"><?php echo lc_h($lc_merchant_company); ?></p>
    </div>
  </div>
  <div class="lc-partner-toolbar__right">
    <div class="lc-merchant-balance">
      <span class="lc-merchant-balance__label">현재 광고비 잔액</span>
      <span class="lc-merchant-balance__value"><?php echo lc_h($lc_merchant_balance); ?> 원</span>
    </div>
    <button type="button" class="lc-partner-icon-btn" title="알림">🔔</button>
    <button type="button" class="lc-partner-icon-btn lc-merchant-icon-btn" title="광고주 정보">🏢</button>
    <?php if (lc_is_logged_in()) { ?>
    <a class="lc-btn lc-btn--ghost lc-btn--xs" href="<?php echo lc_h(defined('G5_BBS_URL') ? G5_BBS_URL . '/logout.php' : '#'); ?>">로그아웃</a>
    <?php } else { ?>
    <a class="lc-btn lc-btn--ghost lc-btn--xs" href="<?php echo lc_h(lc_login_url()); ?>">로그인</a>
    <?php } ?>
  </div>
</header>
