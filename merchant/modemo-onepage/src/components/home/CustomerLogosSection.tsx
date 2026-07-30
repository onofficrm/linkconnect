"use client";

import Image from "next/image";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import styles from "./CustomerLogosSection.module.css";

const BUSINESS_LOGOS = [
    "현대백화점.png", "롯데백화점.png", "현대아이파크.png", "스타벅스.png", "이마트.png",
    "에쓰오일1.png", "GS칼텍스.png", "투썸플레이스.png", "이디야커피.png", "더벤티.png",
    "서울라이티움.png", "노브랜드피자.png", "아주대학교.png", "아모레퍼시픽.png", "홈플러스.png",
    "한양대학교.png", "앰배서더서울.png", "세브란스병원.png", "예술의전당.png", "아시아나컨트리클럽.png",
    "에쓰오일2.png", "HD현대오일뱅크.png", "하이트진로.png", "IFCMall.png", "한국기계연구원.png"
];

const LOGOS_ROW_1 = BUSINESS_LOGOS.slice(0, 13);
const LOGOS_ROW_2 = BUSINESS_LOGOS.slice(13, 25);

const LOGOS_ROW_1_MOBILE = BUSINESS_LOGOS.slice(0, 9);
const LOGOS_ROW_2_MOBILE = BUSINESS_LOGOS.slice(9, 17);
const LOGOS_ROW_3_MOBILE = BUSINESS_LOGOS.slice(17, 25);

const LogoTrack = ({ logos, reverse = false, prefix = '' }: { logos: string[]; reverse?: boolean; prefix?: string }) => (
    <div className={reverse ? styles.logosRowTrackReverse : styles.logosRowTrack}>
        {[1, 2, 3].map((setIndex) => (
            <div key={`${prefix}-track-${setIndex}`} className={styles.logosGroup}>
                {logos.map((logo, i) => (
                    <div key={`${prefix}-row-${setIndex}-${i}`} className={styles.logoCard}>
                        <div className={styles.logoImageWrapper}>
                            <Image
                                src={`/images/business_logos/${logo}`}
                                alt={logo.replace('.png', '')}
                                width={200}
                                height={50}
                                style={{ width: 'auto', height: '100%' }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        ))}
    </div>
);

export default function CustomerLogosSection() {
    const isMobile = useMediaQuery("(max-width: 768px)");

    return (
        <section className={styles.reviewsSection}>
            <h3 className={styles.reviewsTitle}>
                <span className={styles.reviewsTitleAccent}>700여곳</span>이 넘는 고객사가
                <span className={styles.reviewsTitleLogoLine}>
                    <span>
                        <Image src="/images/logo_black.png" alt="700여 곳 이상의 고객사가 선택한 투명한 철거 플랫폼 모두의철거 브랜드 로고" width={188} height={43} className={styles.reviewsTitleLogo} />
                    </span>
                </span>
                를 선택했습니다.
            </h3>

            <div className={styles.logosScrollWrapper}>
                {!isMobile ? (
                    <>
                        <LogoTrack logos={LOGOS_ROW_1} prefix="pc-1" />
                        <LogoTrack logos={LOGOS_ROW_2} reverse prefix="pc-2" />
                    </>
                ) : (
                    <>
                        <LogoTrack logos={LOGOS_ROW_1_MOBILE} prefix="mo-1" />
                        <LogoTrack logos={LOGOS_ROW_2_MOBILE} reverse prefix="mo-2" />
                        <LogoTrack logos={LOGOS_ROW_3_MOBILE} prefix="mo-3" />
                    </>
                )}
            </div>
        </section>
    );
}
