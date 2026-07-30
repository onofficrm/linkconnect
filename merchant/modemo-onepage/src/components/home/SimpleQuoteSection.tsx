"use client";

import { useEffect, useState } from "react";
import styles from "./SimpleQuoteSection.module.css";
import FadeIn from "../animations/FadeIn";
import CallButton from "../CallButton";
import { usePartnerContext } from "../../context/PartnerContext";
import { buildInquiryText, resolveLkCode, submitConsultation } from "../../lib/linkconnect";
import { FiPhone } from "react-icons/fi";

const SERVICE_TYPES = [
  "상가 철거",
  "주택 철거",
  "사무실 원상복구",
  "학원·교육시설",
  "폐기물 처리",
  "기타",
];

export default function SimpleQuoteSection() {
  const { data, hasPhone } = usePartnerContext();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [region, setRegion] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");
  const [utm, setUtm] = useState({ source: "", medium: "", campaign: "" });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUtm({
      source: params.get("utm_source") || data.utm_source || "",
      medium: params.get("utm_medium") || data.utm_medium || "",
      campaign: params.get("utm_campaign") || data.utm_campaign || "",
    });
  }, [data.utm_source, data.utm_medium, data.utm_campaign]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setStatus("error");
      setFeedback("이름과 연락처를 입력해주세요.");
      return;
    }

    setStatus("loading");
    setFeedback("");

    const inquiry = buildInquiryText({
      serviceType,
      region,
      message,
      fileName: file?.name,
    });

    const result = await submitConsultation(
      { name, phone, inquiry },
      {
        lkCode: resolveLkCode() || data.lkCode,
        channel: utm.source || utm.medium || "",
        sub_id: data.sub_id || utm.campaign,
        utm_source: utm.source,
        utm_medium: utm.medium,
        utm_campaign: utm.campaign,
        partner_id: data.partner_id,
        campaign_id: data.campaign_id,
        merchant_id: data.merchant_id,
      },
    );

    if (result.ok) {
      setStatus("success");
      setFeedback(result.message);
      setName("");
      setPhone("");
      setServiceType("");
      setRegion("");
      setMessage("");
      setFile(null);
    } else {
      setStatus("error");
      setFeedback(result.message);
    }
  };

  return (
    <section id="quote-request" className={styles.quoteSection}>
      <div className={styles.container}>
        <FadeIn>
          <div className={styles.header}>
            <h2 className={styles.title}>간편 견적 신청</h2>
            <p className={styles.desc}>
              이름과 연락처만 남겨주시면 빠르게 안내해 드립니다.
              <br />
              타업체 견적서가 있다면 첨부해 주세요. 비교 분석해 드립니다.
            </p>
            {hasPhone ? (
              <div className={styles.callRow}>
                <CallButton placement="form" className={styles.callLink}>
                  <FiPhone size={18} />
                  <span className="partner-phone-text">{data.partner_phone_display}</span>
                  <span>전화 상담</span>
                </CallButton>
                <span className={styles.callHint}>안심번호로 연결됩니다</span>
              </div>
            ) : null}
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          {status === "success" ? (
            <div className={styles.successBox} role="status">
              <p className={styles.successTitle}>신청이 완료되었습니다</p>
              <p className={styles.successDesc}>{feedback}</p>
              <button
                type="button"
                className={styles.submitBtn}
                onClick={() => {
                  setStatus("idle");
                  setFeedback("");
                }}
              >
                추가 신청하기
              </button>
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.row}>
                <div className={styles.inputGroup}>
                  <label htmlFor="name" className={styles.label}>
                    이름 <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    className={styles.input}
                    placeholder="이름을 입력해주세요"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="phone" className={styles.label}>
                    연락처 <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    className={styles.input}
                    placeholder="010-0000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.inputGroup}>
                  <label htmlFor="serviceType" className={styles.label}>
                    철거 유형
                  </label>
                  <select
                    id="serviceType"
                    className={styles.input}
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                  >
                    <option value="">선택해주세요</option>
                    {SERVICE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="region" className={styles.label}>
                    지역
                  </label>
                  <input
                    id="region"
                    type="text"
                    className={styles.input}
                    placeholder="예: 서울 강남구"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="message" className={styles.label}>
                  요청사항
                </label>
                <textarea
                  id="message"
                  className={`${styles.input} ${styles.textarea}`}
                  placeholder="현장 규모, 희망 일정 등 자유롭게 적어주세요"
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="file" className={styles.label}>
                  타업체 견적서 첨부 (선택)
                </label>
                <input
                  id="file"
                  type="file"
                  className={styles.fileInput}
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  accept="image/*,.pdf"
                />
                {file ? <p className={styles.fileName}>{file.name}</p> : null}
                <p className={styles.fileHint}>파일은 상담 시 전달용으로 기록됩니다.</p>
              </div>

              {status === "error" && feedback ? (
                <p className={styles.errorMsg} role="alert">
                  {feedback}
                </p>
              ) : null}

              <button type="submit" className={styles.submitBtn} disabled={status === "loading"}>
                {status === "loading" ? "접수 중…" : "무료 견적 신청하기"}
              </button>
            </form>
          )}
        </FadeIn>
      </div>
    </section>
  );
}
