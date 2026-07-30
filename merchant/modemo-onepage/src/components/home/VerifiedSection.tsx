"use client";

import { modemoAsset } from "@/lib/modemoAsset";

import styles from "./VerifiedSection.module.css";
import common from "./home.module.css";
import FadeIn, { FadeInStagger } from "../animations/FadeIn";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const items = [
  {
    photo: modemoAsset("/images/2_수원상가.jpg"),
    title: "신원 인증 업체",
    alt: "검증된 파트너가 시공한 상가 철거 현장",
    desc: (
      <>
        사업자 등록증부터 신분증, 통장사본까지.{" "}
        <br className={common.mobileBreak} />
        신뢰할 수 있는 업체만 활동합니다.
      </>
    ),
  },
  {
    photo: modemoAsset("/images/3_목동상가.jpg"),
    title: "자가 장비 보유",
    alt: "자체 장비로 진행된 상가 철거 현장",
    desc: (
      <>
        장비 빌려쓰거나 공유하는 업체는 책임감도 빌려 씁니다.{" "}
        <strong>자체 장비</strong>와 <strong>전문 팀</strong>을 보유한 탄탄한 파트너만
        선별합니다.
      </>
    ),
  },
  {
    photo: modemoAsset("/images/1_신림상가.jpg"),
    title: "무사고/AS 이행률 100%",
    alt: "마감까지 책임 시공된 상가 현장",
    desc: (
      <>
        말보다 기록을 믿습니다. 최근 시공 실적과 <strong>AS 이행 내역</strong>을 바탕으로{" "}
        <strong>파트너 업체 등급</strong>을 매겨 운영합니다.
      </>
    ),
  },
  {
    photo: modemoAsset("/images/3_사당상가.jpg"),
    title: "평점 및 고객후기",
    alt: "고객 만족으로 마무리된 철거 현장",
    desc: "모든 시공은 완료 후 고객 만족도 조사를 진행합니다. 파트너 업체의 평판도 함께 확인해보세요.",
  },
];

export default function VerifiedSection() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <section className={styles.verifiedSection}>
      <div className={common.sectionInner}>
        <div className={styles.verifiedHeader}>
          <FadeIn viewport={{ amount: 0.5, once: true }}>
            <div className={common.badgeWrapper}>
              <span className={common.badge}>검증된 실력</span>
            </div>
          </FadeIn>

          <h2 className={styles.verifiedTitle}>
            <FadeIn>진짜 믿고 맡길 수 있는 파트너만 남겼습니다.</FadeIn>
          </h2>
          <div className={styles.verifiedSubtitle}>
            <FadeIn>
              <p className="mb-0">
                먹튀 · 연락두절 제로. <br />
                검증된 상위 10% 파트너만 <br className={common.mobileBreak} />
                사장님께 연결해 드립니다.
              </p>
            </FadeIn>
          </div>
        </div>

        <FadeInStagger className={styles.verifiedGrid}>
          {items.map((item, i) => (
            <FadeIn
              delay={isMobile ? 0 : 0 + i * 0.08}
              key={item.title}
              className={styles.verifiedCard}
            >
              <div className={styles.verifiedCardMedia}>
                <img src={item.photo} alt={item.alt} />
              </div>
              <div className={styles.verifiedCardContent}>
                <h3 className={styles.verifiedCardTitle}>{item.title}</h3>
                <div className={styles.verifiedCardDesc}>{item.desc}</div>
              </div>
            </FadeIn>
          ))}
        </FadeInStagger>
      </div>
    </section>
  );
}
