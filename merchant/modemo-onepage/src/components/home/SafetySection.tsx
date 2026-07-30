"use client";

import styles from "./SafetySection.module.css";
import common from "./home.module.css";
import FadeIn, { FadeInStagger } from "../animations/FadeIn";
import { useMediaQuery } from "../../hooks/useMediaQuery";

const ITEMS = [
  {
    num: "01",
    photo: "/images/3_목동상가2.jpg",
    photoAlt: "추가금 없이 계약대로 마무리된 철거 현장",
    title: "추가금 방지 특약",
    desc: (
      <>
        확정 견적 외 부당한 요구를 막는{" "}
        <br className={common.mobileBreak} />
        추가금 방지 특약을 견적서·계약서에 명시합니다.
      </>
    ),
  },
  {
    num: "02",
    photo: "/images/1_일산카페.jpg",
    photoAlt: "표준 계약서로 진행된 카페 철거 현장",
    title: "표준 계약서 의무화",
    desc: (
      <>
        구두 계약 금지. 법적 효력이 있는{" "}
        <br className={common.mobileBreak} />
        표준 계약서 작성을 지원합니다.
      </>
    ),
  },
  {
    num: "03",
    photo: "/images/2_성북구상가.jpg",
    photoAlt: "AS까지 책임지고 마무리한 상가 현장",
    title: "AS 끝까지 책임",
    desc: (
      <>
        검증된 파트너와 책임 시공으로{" "}
        <br className={common.mobileBreak} />
        고객님이 OK 할 때까지 지원합니다.
      </>
    ),
  },
];

export default function SafetySection() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <section className={styles.safetySection}>
      <div className={common.sectionInner}>
        <FadeIn>
          <div className={styles.header}>
            <span className={common.badgeWrapper}>
              <span className={common.badge}>안전장치</span>
            </span>
            <h2 className={styles.safetyTitle}>
              추가금, 먹튀, 하자 분쟁
              <br />
              <b>모두의철거</b>에서는 걱정 안 하셔도 됩니다
            </h2>
          </div>
        </FadeIn>

        <FadeInStagger className={styles.safetyList}>
          {ITEMS.map((item, i) => (
            <FadeIn
              key={item.num}
              viewport={{ amount: isMobile ? 0.35 : 0.55 }}
              className={styles.safetyRow}
            >
              <article className={styles.safetyCard}>
                <div className={styles.safetyMedia}>
                  <img src={item.photo} alt={item.photoAlt} />
                  <span className={styles.safetyNum}>{item.num}</span>
                </div>
                <div className={styles.safetyCardText}>
                  <h3 className={styles.safetyCardTitle}>{item.title}</h3>
                  <p className={styles.safetyCardDesc}>{item.desc}</p>
                </div>
              </article>
              {i < ITEMS.length - 1 && (
                <div className={styles.safetyDivider} aria-hidden />
              )}
            </FadeIn>
          ))}
        </FadeInStagger>
      </div>
    </section>
  );
}
