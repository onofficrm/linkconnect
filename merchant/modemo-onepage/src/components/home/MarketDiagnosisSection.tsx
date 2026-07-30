"use client";

import { modemoAsset } from "@/lib/modemoAsset";

import Image from "next/image";
import styles from "./MarketDiagnosisSection.module.css";
import common from "./home.module.css";
import FadeIn, { FadeInStagger } from "../animations/FadeIn";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const ASSETS = {
    row1: {
        icon1: modemoAsset("/images/donut.png"),
        fork: modemoAsset("/images/fork.png")
    },
    row2: {
        icon1: modemoAsset("/images/ladder.png"),
        icon2: modemoAsset("/images/trash_can.png")
    },
    row3: {
        icon1: modemoAsset("/images/chat.png")
    }
};

export default function MarketDiagnosisSection() {
    const isMobile = useMediaQuery("(max-width: 768px)");

    return (
        <section className={`${common.section} ${styles.truthSection}`} data-header-color="black">
            <div className={common.sectionInner}>
                <FadeIn direction="up">
                    <h2 className={`${common.sectionTitle} ${styles.truthTitle}`}>
                        <span style={{ fontWeight: 400 }}>철거 시장이 </span>
                        <span style={{ fontWeight: 500 }}>유독</span> <span style={{ fontWeight: 700 }}>불투명한</span><br />
                        3가지 본질적인 이유
                    </h2>
                </FadeIn>
                <FadeIn direction="up">
                    <p className={`${common.sectionSubtitle} ${styles.truthSubtitle}`}>
                        철거 비용, 왜 업체마다 천차만별일까요?<br />
                        원인을 알면 리스크를 통제할 수 있습니다.
                    </p>
                </FadeIn>

                <FadeInStagger className={styles.truthGrid} viewport={{ once: true, amount: 0.3 }}>
                    {/* Row 1 */}
                    <FadeIn direction="up" className={styles.truthCard} duration={0.8} viewport={{ amount: isMobile ? 0.5 : 0.8, once: true }}>
                        <div className={styles.truthCardImage}>
                            <div className={styles.row1IconWrapper}>
                                <Image src={ASSETS.row1.icon1} className={styles.row1Icon} alt="단골이 생기기 어려운 철거 시장의 일회성 거래와는 반대되는 음식 시장을 상징하는 도넛 이미지" width={isMobile ? 92 : 169} height={isMobile ? 98 : 169} />
                            </div>
                            <div className={styles.row1ForkWrapper}>
                                <Image src={ASSETS.row1.fork} className={styles.row1Fork} alt="음식 시장을 상징하는 포크 이미지" width={isMobile ? 101 : 231} height={isMobile ? 123 : 231} />
                            </div>
                        </div>
                        <div className={styles.truthCardContent}>
                            <div className={styles.truthNumberWrapper}>
                                <span className={styles.truthNumber}>불편한 진실 1</span>
                            </div>
                            <h3 className={styles.truthCardTitle}>
                                <strong>단 한 번</strong>뿐인 거래의 함정
                            </h3>
                            <div className={styles.truthCardDesc}>
                                <p className={styles.truthCardDescHighlight}>철거는 커피나 생필품처럼 단골이 생기기 어려운 시장입니다.</p>
                                <p>"어차피 한 번 보고 말 사이"라는 일부 업체의 안일한 생각이 먹튀, 일정 지연, 무책임한 사후 관리로 이어집니다. 그들은 브랜드 평판보다 눈앞의 '한탕'이 더 중요하기 때문입니다.</p>
                            </div>
                        </div>
                    </FadeIn>

                    {/* Row 2 */}
                    <FadeIn direction="up" className={styles.truthCard} duration={0.8} viewport={{ amount: isMobile ? 0.5 : 0.8, once: true }}>
                        <div className={styles.truthCardImage}>
                            <div className={styles.row2Icon1Wrapper}>
                                <Image src={ASSETS.row2.icon1} alt="일반인에게는 알기 어려운 철거 현장의 복잡한 장비대 등을 상징하는 사다리 이미지" width={isMobile ? 136 : 226} height={isMobile ? 128 : 243} style={{ width: '100%', height: '100%' }} />
                            </div>
                            <div className={styles.row2Icon2Wrapper}>
                                <Image src={ASSETS.row2.icon2} alt="고무줄처럼 양이 부풀려질 수 있는 폐기물 처리비용을 상징하는 쓰레기통 이미지" width={isMobile ? 110 : 206} height={isMobile ? 122 : 195} style={{ width: '100%', height: '100%' }} />
                            </div>
                        </div>
                        <div className={styles.truthCardContent}>
                            <div className={styles.truthNumberWrapper}>
                                <span className={styles.truthNumber}>불편한 진실 2</span>
                            </div>
                            <h3 className={styles.truthCardTitle}>
                                부르는 게 값인 <strong>블랙박스</strong> 견적
                            </h3>
                            <div className={styles.truthCardDesc}>
                                <p className={styles.truthCardDescHighlight}>인건비, 폐기물 처리비, 장비대...
                                    <br />일반인은 그 적정량을 알 길이 없습니다.</p>
                                <p>기준이 없는 '깜깜이 견적서'는 업체에게 유리한 무기가 됩니다. 현장에서 장비를 부풀리거나 폐기물 양을 속여도 사장님은 그저 믿을 수밖에 없는 구조, 이것이 '눈탱이'의 실체입니다.</p>
                            </div>
                        </div>
                    </FadeIn>

                    {/* Row 3 */}
                    <FadeIn direction="up" className={styles.truthCard} duration={0.8} viewport={{ amount: isMobile ? 0.5 : 0.8, once: true }}>
                        <div className={styles.truthCardImage}>
                            <div className={styles.row3IconWrapper}>
                                <Image src={ASSETS.row3.icon1} alt="어려운 협상과 소통의 장벽을 나타내는, 전문가와 소비자 사이의 정보 불균형을 의미하는 말풍선" width={isMobile ? 111 : 227} height={isMobile ? 100 : 220} style={{ width: '100%', height: '100%' }} />
                            </div>
                        </div>
                        <div className={styles.truthCardContent}>
                            <div className={styles.truthNumberWrapper}>
                                <span className={styles.truthNumber}>불편한 진실 3</span>
                            </div>
                            <h3 className={styles.truthCardTitle}>
                                심판 없는 <strong>기울어진 운동장</strong>
                            </h3>
                            <div className={styles.truthCardDesc}>
                                <p className={styles.truthCardDescHighlight}>공급자는 전문가이지만, 소비자는 무지한 상태에서 협상해야 합니다.</p>
                                <p>문제가 생겼을 때 해결할 수 있는 전문가가 없습니다. 계약서 한 장 없이 구두로 진행되는 관행 속에서, 모든 리스크와 피해는 고스란히 정보가 부족한 사장님의 몫이 됩니다.</p>
                            </div>
                        </div>
                    </FadeIn>
                </FadeInStagger>


                <div className={styles.truthBottom}>
                    <FadeIn direction="up">
                        <h3 className={styles.truthBottomTitle}>
                            언제까지 업체 사장님의 양심에만<br className={common.mobileXBreak} />{" "}큰 비용을 맡기시겠습니까?
                        </h3>
                    </FadeIn>
                    <FadeIn direction="up">
                        <p className={styles.truthBottomDesc}>
                            부르는 게 값이었던 철거 시장, <br className={common.mobileXBreak} />더 이상 정보의 불균형에 휘둘리지 마세요.<br />
                            <br className={common.mobileXBreak} />
                            모두의철거가 <strong>표준화된 시스템</strong>으로 <br className={common.mobileXBreak} />철거의 기준을 바로잡습니다.
                        </p>
                    </FadeIn>
                </div>
            </div>
        </section>
    );
}

