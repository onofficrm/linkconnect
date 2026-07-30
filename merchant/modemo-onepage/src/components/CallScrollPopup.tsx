"use client";

import { useEffect, useState } from "react";
import { FiPhone, FiX } from "react-icons/fi";
import CallButton from "./CallButton";
import { usePartnerContext } from "../context/PartnerContext";
import styles from "./CallScrollPopup.module.css";

const DISMISS_KEY = "modemo_call_popup_dismissed";
const LEAD_KEY = "modemo_lead_submitted";

export default function CallScrollPopup() {
  const { hasPhone, data, ready } = usePartnerContext();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!ready || !hasPhone) return;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(DISMISS_KEY) || sessionStorage.getItem(LEAD_KEY)) {
      return;
    }

    let shown = false;
    const tryShow = () => {
      if (shown) return;
      if (sessionStorage.getItem(DISMISS_KEY) || sessionStorage.getItem(LEAD_KEY)) {
        return;
      }
      if (window.scrollY < window.innerHeight * 0.5) return;
      shown = true;
      setOpen(true);
      window.removeEventListener("scroll", onScroll);
    };

    const onScroll = () => tryShow();
    window.addEventListener("scroll", onScroll, { passive: true });
    tryShow();

    return () => window.removeEventListener("scroll", onScroll);
  }, [hasPhone, ready]);

  const dismiss = () => {
    setOpen(false);
    sessionStorage.setItem(DISMISS_KEY, "1");
  };

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !hasPhone) return null;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="call-scroll-popup-title"
      onClick={dismiss}
    >
      <div
        className={styles.sheet}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className={styles.close}
          onClick={dismiss}
          aria-label="닫기"
        >
          <FiX size={20} />
        </button>

        <p className={styles.eyebrow}>빠른 상담</p>
        <h2 id="call-scroll-popup-title" className={styles.title}>
          스크롤하시다 궁금한 점이 있으신가요?
        </h2>
        <p className={styles.desc}>
          전담 매니저가 바로 안내해 드립니다.
          <br />
          전화 한 통이면 비교 견적까지 이어집니다.
        </p>

        <CallButton
          placement="scroll_popup"
          className={styles.callBtn}
          onClick={dismiss}
        >
          <FiPhone size={20} />
          <span>
            <em className="partner-phone-text">{data.partner_phone_display}</em>
            전화상담 연결
          </span>
        </CallButton>

        <button type="button" className={styles.later} onClick={dismiss}>
          나중에 할게요
        </button>
      </div>
    </div>
  );
}
