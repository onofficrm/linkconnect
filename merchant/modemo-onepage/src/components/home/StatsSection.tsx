"use client";

import styles from "./StatsSection.module.css";
import common from "./home.module.css";
import FadeIn, { FadeInStagger } from "../animations/FadeIn";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import regionStyles from "./RegionPartnerSection.module.css";
import statsReviews from "@/data/statsReviews.json";

const STATS = [
  {
    value: "13",
    unit: "%",
    label: "평균 비용 절감",
    desc: (
      <>
        3사 비교 리포트를 통해 줄어든
        <br />
        평균 견적 차액
      </>
    ),
  },
  {
    value: "4,130",
    unit: "건+",
    label: "누적 비교 견적",
    desc: (
      <>
        현장 방문을 진행한
        <br />
        실제 견적 요청건 수
      </>
    ),
  },
  {
    value: "4.9",
    unit: "/5.0",
    label: "서비스 만족도",
    desc: (
      <>
        시공 완료 후 설문조사를 통한
        <br />
        실제 고객 평가 점수 (140건+)
      </>
    ),
  },
];

export default function StatsSection() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <section className={`${common.section} ${styles.statsSection}`}>
      <div
        className={styles.reviewsWrap}
        style={{ padding: isMobile ? "0 20px" : "0" }}
      >
        <div className={regionStyles.gallery} style={{ alignItems: "center" }}>
          {(isMobile ? statsReviews.slice(0, 3) : statsReviews).map(
            (review, index) => (
              <FadeInStagger
                key={index}
                className={regionStyles.column}
                staggerDelay={0.2}
              >
                <FadeIn className={regionStyles.card}>
                  <p className={regionStyles.cardText}>{review.text}</p>
                  <div className={regionStyles.author}>
                    <div
                      className={regionStyles.avatar}
                      style={{ backgroundColor: review.avatarBg }}
                    >
                      <svg
                        className={regionStyles.avatarIcon}
                        fill={review.iconFill}
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                      </svg>
                    </div>
                    <div className={regionStyles.authorInfo}>
                      <span className={regionStyles.authorName}>
                        {review.authorName}
                      </span>
                      <div className={regionStyles.rating}>
                        {"★".repeat(5)}
                      </div>
                    </div>
                  </div>
                </FadeIn>
              </FadeInStagger>
            )
          )}
        </div>
      </div>

      <div className={`${common.sectionInner} ${styles.statsInner}`}>
        <FadeIn direction="up">
          <h2 className={styles.statsSectionTitle}>
            이미 <span className={styles.statsTitleBold}>수많은 사장님들</span>이
            <br />
            <span className={styles.statsTitleBold}>직접 경험</span>하셨습니다
          </h2>
          <p className={styles.statsSectionSubtitle}>
            경쟁사의 <strong>규모</strong> 대신,
            <br className={common.mobileBreak} /> 고객의 <strong>이득</strong>을
            숫자로 살펴보세요.
          </p>
        </FadeIn>

        <FadeInStagger className={styles.statsGrid}>
          {STATS.map((stat, i) => (
            <FadeIn
              key={stat.label}
              direction="up"
              delay={isMobile ? 0 : i * 0.08}
              className={styles.statCard}
              viewport={{ amount: isMobile ? 0.4 : 0.6, once: true }}
            >
              <div className={styles.statValue}>
                <span className={styles.statValueBig}>{stat.value}</span>
                <span className={styles.statValueUnit}>{stat.unit}</span>
              </div>
              <div className={styles.statLabel}>{stat.label}</div>
              <p className={styles.statDesc}>{stat.desc}</p>
            </FadeIn>
          ))}
        </FadeInStagger>
      </div>
    </section>
  );
}
