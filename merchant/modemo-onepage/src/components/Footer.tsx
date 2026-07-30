"use client";

import styles from "./Footer.module.css";
import { usePartnerContext } from "@/context/PartnerContext";
import CallButton from "./CallButton";

export default function Footer() {
  const { data, hasPhone } = usePartnerContext();
  const bizName = data.merchant_name || "모두의철거";
  const bizNo = data.business_number || "206-47-92777";
  const rep = data.representative_name || "김장수";
  const addr = data.business_address || "경기도 과천시 과천대로7나길 37, 디엠 303호";

  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerLeft}>
          <p className={styles.footerLogo}>{bizName}</p>
          <p className={styles.footerSlogan}>철거의 새로운 기준, 철거의 모든 것</p>
          <div className={styles.footerInfo}>
            <p>
              상호명 : 파밍시티
              <span className={styles.divider}>|</span>
              대표자 : {rep}
              <span className={styles.divider}>|</span>
              사업자등록번호 : {bizNo}
            </p>
            <p>
              {hasPhone ? (
                <>
                  상담전화 :{" "}
                  <CallButton placement="footer" className={styles.phoneLink}>
                    <span className="partner-phone-text">{data.partner_phone_display}</span>
                  </CallButton>
                  <span className={styles.divider}>|</span>
                </>
              ) : null}
              소재지 : {addr}
            </p>
            <p className={styles.footerDisclaimer}>
              모두의철거는 중개 플랫폼으로 철거, 원상복구 공사의 주 거래 당사자가 아닙니다. 시공,
              거래에 관한 의무와 책임은 철거 파트너에게 있습니다.
            </p>
            <p className={styles.footerCopyright}>2026 Farmingcity inc. All Rights Reserved.</p>
          </div>
        </div>
        <nav className={styles.footerNav} />
      </div>
    </footer>
  );
}
