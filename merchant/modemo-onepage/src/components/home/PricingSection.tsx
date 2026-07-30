"use client";

import styles from "./PricingSection.module.css";
import common from "./home.module.css";
import FadeIn, { FadeInStagger } from "../animations/FadeIn";
import Image from "next/image";
import { FiArrowRight } from "react-icons/fi";
import Link from "next/link";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function PricingSection() {
    const isMobile = useMediaQuery("(max-width: 768px)");
    return (
        <section className={styles.container}>
            <div className={styles.sectionInner}>
                <div className={styles.titleWrapper}>
                    <FadeIn viewport={{ amount: 0.5, once: true }}>
                        <div className={common.badgeWrapper}>
                            <span className={common.badge}>
                                가격 거품 제거
                            </span>
                        </div>
                    </FadeIn>
                    <FadeIn>
                        <h2 className={styles.title}>
                            <span>모두만의 노하우로 </span><br className={common.mobileBreak} />
                            <strong>가격</strong>
                            <span>은 낮추고 </span>
                            <br />
                            <strong>투명성</strong>
                            <span>은 높였습니다</span>
                        </h2>
                    </FadeIn>
                    <div className={styles.description}>
                        <FadeIn>
                            <p>유명한 광고, 화려한 마케팅... <br className={common.mobileBreak} />결국 다 고객님 견적에 포함되는 비용입니다.</p>
                        </FadeIn>
                        <FadeIn>
                            <p>모두의철거는 <strong>3가지 거품</strong>을 과감히 없앴습니다.</p>
                        </FadeIn>
                    </div>
                </div>

                <FadeInStagger className={styles.cardGrid}>
                    <FadeIn delay={isMobile ? 0 : 0.1} viewport={{ amount: isMobile ? 0.5 : 0.8, once: true }} className={styles.cardWrapper}>
                        <article className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.imageContainer}>
                                    <div className={styles.calculatorImage}>
                                        <Image src="/images/calculator.png" alt="거품 없는 업계 최저 수수료를 상징하는 계산기 이미지" fill sizes="(max-width: 768px) 100vw, 300px" style={{ objectFit: "contain" }} />
                                    </div>
                                </div>
                            </div>
                            <div className={styles.divider} />
                            <div className={styles.cardBody}>
                                <h3 className={styles.cardTitle}>업계 최저 수수료</h3>
                                <div className={styles.cardText}>
                                    <p>수수료 부담을 낮춰,</p>
                                    <p>파트너가 오직 <strong>시공 품질</strong>에만</p>
                                    <p>집중하게 만들었습니다.</p>
                                </div>
                            </div>
                        </article>
                    </FadeIn>

                    <FadeIn delay={isMobile ? 0 : 0.2} viewport={{ amount: isMobile ? 0.5 : 0.8, once: true }} className={styles.cardWrapper}>
                        <article className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.imageContainer}>
                                    <div className={styles.megaphoneImage}>
                                        <Image src="/images/magaphone_hand.png" alt="비싼 광고비를 상징하는 손에 든 확성기 이미지" fill sizes="(max-width: 768px) 100vw, 300px" style={{ objectFit: "contain" }} />
                                    </div>
                                </div>
                            </div>
                            <div className={styles.divider} />
                            <div className={styles.cardBody}>
                                <h3 className={styles.cardTitle}>마케팅 비용 최소화</h3>
                                <div className={styles.cardText}>
                                    <p>비싼 광고비 대신</p>
                                    <p>시스템에 투자합니다.</p>
                                    <p>거품을 뺀 <strong>실속 있는 견적</strong>을 드립니다.</p>
                                </div>
                            </div>
                        </article>
                    </FadeIn>

                    <FadeIn delay={isMobile ? 0 : 0.3} viewport={{ amount: isMobile ? 0.5 : 0.8, once: true }} className={styles.cardWrapper}>
                        <article className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.imageContainer}>
                                    <div className={styles.helmetContainer}>
                                        <div className={styles.helmet1}>
                                            <Image src="/images/safehat.png" alt="지역 파트너 3곳의 선의의 경쟁을 의미하는 첫 번째 안전모 이미지" fill sizes="(max-width: 768px) 100vw, 300px" style={{ objectFit: "contain" }} />
                                        </div>
                                        <div className={styles.helmet2}>
                                            <Image src="/images/safehat.png" alt="지역 파트너 3곳의 선의의 경쟁을 의미하는 두 번째 안전모 이미지" fill sizes="(max-width: 768px) 100vw, 300px" style={{ objectFit: "contain" }} />
                                        </div>
                                        <div className={styles.helmet3}>
                                            <Image src="/images/safehat.png" alt="지역 파트너 3곳의 선의의 경쟁을 의미하는 세 번째 안전모 이미지" fill sizes="(max-width: 768px) 100vw, 300px" style={{ objectFit: "contain" }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.divider} />
                            <div className={styles.cardBody}>
                                <h3 className={styles.cardTitle}>투명한 비교 경쟁</h3>
                                <div className={styles.cardText}>
                                    <p>지역 파트너 3곳의</p>
                                    <p>선의의 경쟁이 만들어낸</p>
                                    <p><strong>시장 최적가</strong>를 확인하세요.</p>
                                </div>
                            </div>
                        </article>
                    </FadeIn>
                </FadeInStagger>

                <div className={styles.ctaWrapper}>
                    <FadeIn>
                        <button 
                            className={styles.ctaButton}
                            onClick={() => {
                                const element = document.getElementById('quote-request');
                                element?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            <span className={styles.ctaText}>3초만에 견적 신청하기</span>
                            <div className={styles.ctaIcon}>
                                <FiArrowRight size={isMobile ? 24 : 32} color="#676767" />
                            </div>
                        </button>
                    </FadeIn>
                </div>
            </div>
        </section >
    );
}
