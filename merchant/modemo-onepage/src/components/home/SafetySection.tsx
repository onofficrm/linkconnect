"use client";

import styles from "./SafetySection.module.css";
import common from "./home.module.css";
import FadeIn, { FadeInStagger } from "../animations/FadeIn";
import { useMediaQuery } from "../../hooks/useMediaQuery";

export default function SafetySection() {
    const isMobile = useMediaQuery("(max-width: 768px)");

    const items = [
        {
            icon: "/images/lock_closed.png",
            title: "추가금 방지 특약",
            alt: "부당한 추가금을 확실하게 막아주는 자물쇠 형태의 모듈 아이콘",
            desc: <>확정 견적 외 부당한 요구를 방지하는<br className={common.mobileBreak} /> 추가금 방지 특약 견적서 및 계약서 명시</>
        },
        {
            icon: "/images/pen.png",
            title: "표준 계약서 의무화",
            alt: "구두 계약 대신 법적 효력이 있는 표준 계약서 작성을 의미하는 펜 아이콘",
            desc: <>구두 계약 금지, 법적 효력이 있는<br className={common.mobileBreak} /> 계약서 작성 지원</>
        },
        {
            icon: "/images/wrench.png",
            title: "AS 끝까지 책임",
            alt: "시공 후에도 고객이 만족할 때까지 꼼꼼하게 AS를 책임지는 렌치 아이콘",
            desc: <>검증된 파트너와 책임 시공으로<br className={common.mobileBreak} /> 고객님이 'OK' 할 때까지 지원</>
        }
    ];

    return (
        <section className={`${common.section} ${styles.safetySection}`}>
            <div className={common.sectionInner}>
                <FadeIn>
                    <span className={common.badgeWrapper}><span className={common.badge}>안전장치</span></span>
                    <h2 className={styles.safetyTitle}>
                        추가금, 먹튀, 하자 분쟁<br />
                        <b>모두의철거</b>에서는<br className={common.mobileBreak} /> 걱정 안 하셔도 됩니다
                    </h2>
                </FadeIn>

                <FadeInStagger className={styles.safetyList}>
                    {items.map((item, i) => (
                        <FadeIn key={i} viewport={{ amount: isMobile ? 0.5 : 0.8 }}>
                            <div className={styles.safetyCard}>
                                <div className={styles.safetyCardIcon}>
                                    <img src={item.icon} alt={item.alt} />
                                </div>
                                <div className={styles.safetyCardText}>
                                    <h3 className={styles.safetyCardTitle}>{item.title}</h3>
                                    <p className={styles.safetyCardDesc}>{item.desc}</p>
                                </div>
                            </div>
                            {i < items.length - 1 && <div className={styles.safetyDivider}></div>}
                        </FadeIn>
                    ))}
                </FadeInStagger>
            </div>
        </section>
    );
}
