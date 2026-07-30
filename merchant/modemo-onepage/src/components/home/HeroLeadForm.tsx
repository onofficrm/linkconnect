"use client";

import { useState, type FormEvent } from "react";
import { FiPhone, FiLoader, FiCheckCircle } from "react-icons/fi";
import CallButton from "../CallButton";
import { usePartnerContext } from "../../context/PartnerContext";
import { resolveLkCode, submitConsultation } from "../../lib/linkconnect";
import styles from "./HeroSection.module.css";

function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 11;
}

export default function HeroLeadForm() {
  const { data, hasPhone } = usePartnerContext();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [privacy, setPrivacy] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !isValidPhone(phone) || !privacy) {
      setErrorMessage(
        !privacy
          ? "개인정보 수집·이용에 동의해 주세요."
          : !isValidPhone(phone)
            ? "연락처를 정확히 입력해 주세요."
            : "이름을 입력해 주세요.",
      );
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage("");
    window.dispatchEvent(new CustomEvent("lead_submit_click"));

    const result = await submitConsultation(
      {
        name: name.trim(),
        phone: phone.trim(),
        inquiry: "히어로 빠른상담신청",
      },
      {
        lkCode: resolveLkCode() || data.lkCode,
        channel: data.utm_source || data.utm_medium || "",
        sub_id: data.sub_id || data.utm_campaign,
        utm_source: data.utm_source,
        utm_medium: data.utm_medium,
        utm_campaign: data.utm_campaign,
        partner_id: data.partner_id,
        campaign_id: data.campaign_id,
        merchant_id: data.merchant_id,
      },
    );

    if (result.ok) {
      setStatus("success");
      sessionStorage.setItem("modemo_lead_submitted", "1");
      window.dispatchEvent(new CustomEvent("lead_submit_success"));
    } else {
      setErrorMessage(result.message);
      setStatus("error");
      window.dispatchEvent(new CustomEvent("lead_submit_error"));
    }
  };

  if (status === "success") {
    return (
      <div className={styles.heroForm} id="hero-lead-form">
        <div className={styles.heroFormSuccess}>
          <FiCheckCircle size={28} />
          <p className={styles.heroFormSuccessTitle}>상담신청이 접수되었습니다</p>
          <p className={styles.heroFormSuccessDesc}>
            전담 매니저가 영업시간 기준 빠르게 연락드립니다.
          </p>
          {hasPhone ? (
            <CallButton placement="hero_success" className={styles.heroFormCall}>
              <FiPhone size={18} />
              <span className="partner-phone-text">{data.partner_phone_display}</span>
              바로 전화하기
            </CallButton>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.heroForm} id="hero-lead-form">
      <form
        id="hero_lead_form"
        className={styles.heroFormInner}
        onSubmit={handleSubmit}
        noValidate
      >
        <p className={styles.heroFormTitle}>이름·연락처만 남겨주세요</p>
        <div className={styles.heroFormFields}>
          <label className="sr-only" htmlFor="hero_customer_name">
            이름
          </label>
          <input
            id="hero_customer_name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름"
            className={styles.heroFormInput}
          />
          <label className="sr-only" htmlFor="hero_customer_phone">
            연락처
          </label>
          <input
            id="hero_customer_phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            value={phone}
            onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
            placeholder="연락처 (010-0000-0000)"
            className={styles.heroFormInput}
          />
        </div>

        <label className={styles.heroFormPrivacy}>
          <input
            type="checkbox"
            checked={privacy}
            onChange={(e) => setPrivacy(e.target.checked)}
          />
          <span>
            상담 접수를 위한 개인정보 수집·이용에 동의합니다.{" "}
            <a
              href={data.privacy_policy_url || "/privacy"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              내용 보기
            </a>
          </span>
        </label>

        {status === "error" && errorMessage ? (
          <p className={styles.heroFormError}>{errorMessage}</p>
        ) : null}

        <div className={styles.heroFormActions}>
          <button
            type="submit"
            disabled={status === "loading"}
            id="hero_form_btn"
            data-event-name="hero_form_click"
            data-placement="hero"
            className={styles.heroFormSubmit}
          >
            {status === "loading" ? (
              <>
                <FiLoader size={18} className={styles.spin} />
                접수 중...
              </>
            ) : (
              "빠른 상담신청"
            )}
          </button>
          {hasPhone ? (
            <CallButton
              id="hero_call_btn"
              placement="hero"
              className={styles.heroFormCall}
            >
              <FiPhone size={18} />
              전화상담
            </CallButton>
          ) : null}
        </div>
        <p className={styles.heroFormHint}>회원가입 없이 30초면 완료</p>
      </form>
    </div>
  );
}
