"use client";

import { modemoAsset } from "@/lib/modemoAsset";

import styles from "./PricingSection.module.css";
import common from "./home.module.css";
import FadeIn, { FadeInStagger } from "../animations/FadeIn";
import { FiArrowRight } from "react-icons/fi";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { scrollToId } from "@/lib/scrollToId";

const CARDS = [
  {
    num: "01",
    photo: modemoAsset("/images/2_일산상가.jpg"),
    photoAlt: "수수료 거품 없이 진행된 상가 철거 현장",
    title: "업계 최저 수수료",
    lines: [
      "수수료 부담을 낮춰,",
      <>파트너가 오직 <strong>시공 품질</strong>에만</>,
      "집중하게 만들었습니다.",
    ],
  },
  {
    num: "02",
    photo: modemoAsset("/images/1_용인주택.jpg"),
    photoAlt: "실속 있는 견적으로 마무리된 주택 철거 현장",
    title: "마케팅 비용 최소화",
    lines: [
      "비싼 광고비 대신 시스템에 투자합니다.",
      <>거품을 뺀 <strong>실속 있는 견적</strong>을 드립니다.</>,
    ],
  },
  {
    num: "03",
    photo: modemoAsset("/images/3_동탄상가.jpg"),
    photoAlt: "비교 경쟁으로 최적가를 찾은 상가 철거 현장",
    title: "투명한 비교 경쟁",
    lines: [
      "지역 파트너 3곳의 선의의 경쟁이 만들어낸",
      <><strong>시장 최적가</strong>를 확인하세요.</>,
    ],
  },
];

export default function PricingSection() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <section className={styles.container}>
      <div className={styles.sectionInner}>
        <div className={styles.titleWrapper}>
          <FadeIn viewport={{ amount: 0.5, once: true }}>
            <div className={common.badgeWrapper}>
              <span className={common.badge}>가격 거품 제거</span>
            </div>
          </FadeIn>
          <FadeIn>
            <h2 className={styles.title}>
              모두만의 노하우로 <strong>가격</strong>은 낮추고
              <br />
              <strong>투명성</strong>은 높였습니다
            </h2>
          </FadeIn>
          <div className={styles.description}>
            <FadeIn>
              <p>
                화려한 마케팅 비용은 결국 견적에 포함됩니다.
                <br className={common.mobileBreak} />
                모두의철거는 <strong>3가지 거품</strong>을 과감히 없앴습니다.
              </p>
            </FadeIn>
          </div>
        </div>

        <FadeInStagger className={styles.cardGrid}>
          {CARDS.map((card, i) => (
            <FadeIn
              key={card.num}
              delay={isMobile ? 0 : 0.08 * (i + 1)}
              viewport={{ amount: isMobile ? 0.4 : 0.6, once: true }}
              className={styles.cardWrapper}
            >
              <article className={styles.card}>
                <div className={styles.cardMedia}>
                  <img src={card.photo} alt={card.photoAlt} />
                  <span className={styles.cardNum}>{card.num}</span>
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{card.title}</h3>
                  <div className={styles.cardText}>
                    {card.lines.map((line, li) => (
                      <p key={li}>{line}</p>
                    ))}
                  </div>
                </div>
              </article>
            </FadeIn>
          ))}
        </FadeInStagger>

        <div className={styles.ctaWrapper}>
          <FadeIn>
            <button
              className={styles.ctaButton}
              onClick={() => {
                scrollToId("quote-request", { behavior: "smooth" });
              }}
            >
              <span className={styles.ctaText}>3초만에 견적 신청하기</span>
              <span className={styles.ctaIcon}>
                <FiArrowRight size={isMobile ? 22 : 28} color="#3a3a3a" />
              </span>
            </button>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
