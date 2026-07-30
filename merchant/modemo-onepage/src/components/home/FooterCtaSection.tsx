"use client";

import { modemoAsset } from "@/lib/modemoAsset";

import styles from "./FooterCtaSection.module.css";
import common from "./home.module.css";
import FadeIn from "../animations/FadeIn";
import Link from "next/link";
import Image from "next/image";
import { FiArrowRight } from "react-icons/fi";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const images = [
    modemoAsset("/images/3_동탄상가.jpg"),
    modemoAsset("/images/3_동탄상가2.jpg"),
    modemoAsset("/images/3_목동상가.jpg"),
    modemoAsset("/images/3_목동상가2.jpg"),
    modemoAsset("/images/3_사당상가.jpg")
];

export default function FooterCtaSection() {
    const isMobile = useMediaQuery("(max-width: 768px)");

    return (
        <section className={styles.finalCta} data-header-color="black">
            <div className={styles.finalCtaContainer}>
                <div className={styles.contentWrapper}>
                    <FadeIn>
                        <div className={styles.textGroup}>
                            <h2 className={styles.title}>
                                현장 견적,<br />
                                고민만 한다고 <br className={styles.mobileBreak} />나오지 않습니다
                            </h2>
                            <p className={styles.desc}>
                                전문가가 직접 방문하여 정확하게 진단합니다. <br className={styles.mobileBreak} />
                                비용은 100% 무료입니다.
                            </p>
                        </div>
                    </FadeIn>


                    <div className={styles.buttonGroup}>
                        <FadeIn>
                            <button 
                                onClick={() => document.getElementById('quote-request')?.scrollIntoView({ behavior: 'smooth' })} 
                                className={styles.primaryButton}
                                style={{ border: 'none', cursor: 'pointer' }}
                            >
                                무료 방문 견적 신청하기
                                <FiArrowRight size={isMobile ? 24 : 32} color="#fff" />
                            </button>
                        </FadeIn>
                    </div>
                    <FadeIn>
                        <div className={styles.logoWrapper}>
                            <Image src={modemoAsset("/images/logo_white.png")} alt="모두의철거 브랜드 로고" width={isMobile ? 161 : 253} height={isMobile ? 37 : 58} className={styles.logo} />
                        </div>
                    </FadeIn>

                </div>

                <div className={styles.imageGrid}>
                    <div className={styles.imageTrack}>
                        {[...images, ...images].map((src, i) => (
                            <div key={i} className={styles.imageItem}>
                                <img src={src} alt="전문가의 세심한 손길로 철거와 원상복구가 완벽하게 마무리된 현장 포트폴리오 성과 사진" />
                                <div className={styles.imageOverlay} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
