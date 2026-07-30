"use client";

import { FiPhone, FiEdit3 } from 'react-icons/fi';
import CallButton from './CallButton';
import { usePartnerContext } from '../context/PartnerContext';
import styles from './StickyCallBar.module.css';

export default function StickyCallBar() {
  const { hasPhone } = usePartnerContext();

  const scrollToForm = () => {
    document.getElementById('quote-request')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <div className={styles.mobileBar}>
        {hasPhone ? (
          <CallButton placement="sticky" className={styles.callBtn} aria-label="전화상담 연결">
            <FiPhone size={20} />
            전화상담
          </CallButton>
        ) : null}
        <button
          type="button"
          onClick={scrollToForm}
          className={hasPhone ? styles.formBtn : styles.formBtnFull}
          aria-label="견적 신청 폼으로 이동"
        >
          <FiEdit3 size={20} />
          견적신청
        </button>
      </div>

      {hasPhone ? (
        <div className={`${styles.desktopFloat} phone-only`}>
          <CallButton placement="sticky" className={styles.desktopCall} aria-label="전화상담 연결">
            <FiPhone size={22} />
            전화상담 연결
          </CallButton>
        </div>
      ) : null}
    </>
  );
}
