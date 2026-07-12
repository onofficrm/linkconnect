<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

if (!function_exists('lc_merchant_contract_render_html')) {
    /**
     * @param array<string,string> $party_a
     */
    function lc_merchant_contract_render_html(array $party_a)
    {
        $party_b = lc_merchant_contract_party_b();
        $version = lc_merchant_contract_current_version();

        $esc = static function ($value) {
            return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
        };

        $a_name = $esc($party_a['company_name'] ?? '');
        $a_rep = $esc($party_a['representative_name'] ?? '');
        $a_biz = $esc($party_a['business_number'] ?? '');
        $a_addr = $esc($party_a['company_address'] ?? '');
        $a_phone = $esc($party_a['company_phone'] ?? '');

        $b_name = $esc($party_b['company_name'] ?? '');
        $b_rep = $esc($party_b['representative_name'] ?? '');
        $b_biz = $esc($party_b['business_number'] ?? '');
        $b_addr = $esc($party_b['company_address'] ?? '');
        $b_phone = $esc($party_b['company_phone'] ?? '');

        return <<<HTML
<div class="lc-contract-document">
  <header class="lc-contract-header">
    <p class="lc-contract-version">계약서 버전: {$esc($version)}</p>
    <h1>CPA 광고주 이용 계약서</h1>
    <p class="lc-contract-lead">본 계약은 링크커넥트 CPA 광고 플랫폼 이용에 관한 광고주(갑)와 운영사(을) 간의 권리·의무를 정합니다.</p>
  </header>

  <section class="lc-contract-parties">
    <div class="lc-contract-party">
      <h2>갑 (광고주)</h2>
      <dl>
        <dt>회사명</dt><dd>{$a_name}</dd>
        <dt>대표자</dt><dd>{$a_rep}</dd>
        <dt>사업자등록번호</dt><dd>{$a_biz}</dd>
        <dt>주소</dt><dd>{$a_addr}</dd>
        <dt>연락처</dt><dd>{$a_phone}</dd>
      </dl>
    </div>
    <div class="lc-contract-party">
      <h2>을 (운영사)</h2>
      <dl>
        <dt>회사명</dt><dd>{$b_name}</dd>
        <dt>대표자</dt><dd>{$b_rep}</dd>
        <dt>사업자등록번호</dt><dd>{$b_biz}</dd>
        <dt>주소</dt><dd>{$b_addr}</dd>
        <dt>연락처</dt><dd>{$b_phone}</dd>
      </dl>
    </div>
  </section>

  <section class="lc-contract-article">
    <h2>제1조 (목적)</h2>
    <p>본 계약은 갑이 을이 운영하는 링크커넥트 CPA 광고 플랫폼(이하 "플랫폼")을 통해 광고 캠페인을 등록·운영하고, 을이 제공하는 매체 연동·성과 집계·정산 지원 서비스를 이용함에 있어 양 당사자의 권리와 의무를 규정함을 목적으로 합니다.</p>
  </section>

  <section class="lc-contract-article">
    <h2>제2조 (정의)</h2>
    <ol>
      <li>"CPA"란 Cost Per Action의 약자로, 갑이 정한 전환(상담 신청, 예약, 구매 등)이 발생한 경우에 광고비가 정산되는 방식을 말합니다.</li>
      <li>"전환"이란 플랫폼을 통해 추적 가능한 방식으로 발생한 갑이 사전에 승인한 성과 지표를 말합니다.</li>
      <li>"광고비"란 갑이 플랫폼에 충전하거나 정산되는 금액으로, 캠페인 단가 및 승인된 전환 건수에 따라 차감되는 금액을 말합니다.</li>
      <li>"파트너"란 을의 플랫폼을 통해 갑의 광고를 홍보하는 제3자 매체 운영자를 말합니다.</li>
    </ol>
  </section>

  <section class="lc-contract-article">
    <h2>제3조 (계약의 체결 및 효력)</h2>
    <ol>
      <li>본 계약은 갑이 플랫폼에서 제공하는 전자 계약 절차를 완료하고 을이 이를 수락함으로써 성립합니다.</li>
      <li>전자적 방식으로 체결된 본 계약은 서면 계약과 동일한 효력을 가집니다.</li>
      <li>계약 체결 후 계약서 내용은 갑과 을의 합의 또는 관련 법령에 따른 경우를 제외하고 변경할 수 없습니다.</li>
    </ol>
  </section>

  <section class="lc-contract-article">
    <h2>제4조 (서비스 내용)</h2>
    <ol>
      <li>을은 갑에게 CPA 캠페인 등록, 랜딩 연동, 전환 추적, 성과 리포트, 광고비 충전·차감, 고객센터 지원 등 플랫폼 기능을 제공합니다.</li>
      <li>서비스의 세부 범위·이용 방법은 플랫폼 내 공지, 운영 정책 및 별도 안내에 따릅니다.</li>
      <li>을은 서비스 품질 향상을 위해 기능을 추가·변경·중단할 수 있으며, 중대한 변경 시 사전 고지합니다.</li>
    </ol>
  </section>

  <section class="lc-contract-article">
    <h2>제5조 (갑의 의무)</h2>
    <ol>
      <li>갑은 사업자 정보, 캠페인 내용, 랜딩 페이지, 개인정보 처리 등 관련 법령을 준수해야 합니다.</li>
      <li>갑은 허위·과장 광고, 불법 상품·서비스 홍보, 제3자 권리 침해를 해서는 안 됩니다.</li>
      <li>갑은 접수된 리드(디비)에 대해 정해진 기간 내 검수·처리하며, 부당한 일괄 거절·지연으로 파트너 및 을에 손해를 주어서는 안 됩니다.</li>
      <li>갑은 계약 체결 권한이 있는 자가 전자 서명 및 동의 절차를 수행함을 보증합니다.</li>
    </ol>
  </section>

  <section class="lc-contract-article">
    <h2>제6조 (을의 의무)</h2>
    <ol>
      <li>을은 선량한 관리자의 주의로 플랫폼을 운영하고, 갑의 광고 집행 및 성과 확인이 가능하도록 기술적·관리적 조치를 취합니다.</li>
      <li>을은 갑의 영업 비밀 및 개인정보를 관련 법령과 개인정보 처리방침에 따라 보호합니다.</li>
      <li>을은 갑의 정당한 문의·장애 신고에 성실히 응대합니다.</li>
    </ol>
  </section>

  <section class="lc-contract-article">
    <h2>제7조 (광고비 및 정산)</h2>
    <ol>
      <li>갑은 캠페인 운영 전 플랫폼에 광고비를 충전하거나 을이 정한 결제 수단을 이용합니다.</li>
      <li>승인된 전환 건수에 따라 캠페인에 설정된 단가가 차감되며, 잔액 부족 시 캠페인 노출이 제한될 수 있습니다.</li>
      <li>정산 기준, 승인·거절 규칙, 환불 정책은 플랫폼 정책 및 캠페인별 설정에 따릅니다.</li>
    </ol>
  </section>

  <section class="lc-contract-article">
    <h2>제8조 (개인정보 보호)</h2>
    <p>양 당사자는 본 계약 이행 과정에서 취득하는 개인정보를 개인정보 보호법 등 관련 법령 및 각자의 개인정보 처리방침에 따라 처리합니다. 갑은 전환 과정에서 수집되는 이용자 개인정보의 수집·이용·보관·파기에 대한 책임을 부담합니다.</p>
  </section>

  <section class="lc-contract-article">
    <h2>제9조 (계약 기간 및 해지)</h2>
    <ol>
      <li>본 계약은 체결일로부터 1년간 유효하며, 기간 만료 30일 전까지 당사자 일방의 서면 또는 전자 통지가 없으면 동일 조건으로 1년씩 자동 연장됩니다.</li>
      <li>당사자는 30일 전 사전 통지로 본 계약을 해지할 수 있습니다.</li>
      <li>갑이 본 계약 또는 운영 정책을 중대하게 위반한 경우 을은 사전 통지 후 계약을 해지하거나 서비스 이용을 제한할 수 있습니다.</li>
    </ol>
  </section>

  <section class="lc-contract-article">
    <h2>제10조 (손해배상 및 면책)</h2>
    <ol>
      <li>당사자가 본 계약을 위반하여 상대방에게 손해를 입힌 경우 그 손해를 배상합니다.</li>
      <li>을은 천재지변, 통신 장애, 제3자 서비스 장애 등 불가항력으로 인한 손해에 대하여 책임을 지지 않습니다.</li>
      <li>을의 손해배상 책임은 해당 사건 발생 직전 3개월간 갑이 을에게 지급한 수수료 또는 광고비 운영 대행 금액의 범위 내로 제한될 수 있습니다. 다만 고의 또는 중대한 과실이 있는 경우는 제외합니다.</li>
    </ol>
  </section>

  <section class="lc-contract-article">
    <h2>제11조 (분쟁 해결)</h2>
    <p>본 계약과 관련한 분쟁은 양 당사자가 협의하여 해결하며, 협의가 이루어지지 않을 경우 을의 본사 소재지를 관할하는 법원을 제1심 관할 법원으로 합니다.</p>
  </section>

  <section class="lc-contract-article">
    <h2>부칙</h2>
    <p>본 계약은 전자적 방식으로 체결되며, 갑은 본 계약서 전문을 확인하고 각 조항의 내용을 충분히 이해하였음을 확인합니다.</p>
  </section>
</div>
HTML;
    }
}

if (!function_exists('lc_merchant_contract_document_styles')) {
    function lc_merchant_contract_document_styles()
    {
        return <<<'CSS'
.lc-contract-document { max-width: 820px; margin: 0 auto; color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans KR", sans-serif; line-height: 1.7; font-size: 15px; }
.lc-contract-header { text-align: center; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 2px solid #e2e8f0; }
.lc-contract-version { font-size: 12px; color: #64748b; margin-bottom: 0.5rem; }
.lc-contract-header h1 { font-size: 1.75rem; font-weight: 800; margin: 0 0 0.75rem; }
.lc-contract-lead { color: #475569; margin: 0; }
.lc-contract-parties { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem; }
@media (max-width: 640px) { .lc-contract-parties { grid-template-columns: 1fr; } }
.lc-contract-party { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem 1.25rem; }
.lc-contract-party h2 { font-size: 0.875rem; font-weight: 700; color: #0891b2; margin: 0 0 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
.lc-contract-party dl { margin: 0; display: grid; gap: 0.35rem; }
.lc-contract-party dt { font-size: 0.75rem; color: #64748b; font-weight: 600; }
.lc-contract-party dd { margin: 0 0 0.5rem; font-weight: 500; }
.lc-contract-article { margin-bottom: 1.5rem; }
.lc-contract-article h2 { font-size: 1rem; font-weight: 700; margin: 0 0 0.5rem; color: #1e293b; }
.lc-contract-article p, .lc-contract-article ol { margin: 0; color: #334155; }
.lc-contract-article ol { padding-left: 1.25rem; }
.lc-contract-article li { margin-bottom: 0.35rem; }
CSS;
    }
}
