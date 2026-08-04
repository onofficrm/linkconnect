"use client";

import { modemoAsset } from "@/lib/modemoAsset";

import styles from "./HeroSection.module.css";
import common from "./home.module.css";
import FadeIn from "../animations/FadeIn";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import Image from "next/image";
import HeroLeadForm from "./HeroLeadForm";

export default function HeroSection() {
    const isMobile = useMediaQuery("(max-width: 768px)");

    return (
        <section className={styles.hero} data-header-color="black">
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 0
                }}
            />
            <div className={styles.heroGradient} />
            <div className={styles.heroInner} style={{ zIndex: 1, position: 'relative' }}>
                <FadeIn className={styles.heroImages} direction="none" duration={1.2} fullWidth viewport={{ amount: "some" }}>

                    <div className={styles.heroImageCol}>
                        <div className={styles.heroImageCard}>
                            <Image width={397} height={500} src={modemoAsset("/images/1_천안상가.jpg")} alt="천안 지역 상가의 철거 공사를 투명한 견적으로 깔끔하게 완료한 현장 사진" priority />
                            <div className={styles.heroImageOverlay} />
                            <div className={styles.heroImageLabel}>천안 상가</div>
                        </div>

                        <div className={styles.heroImageCard}>
                            <Image width={667} height={500} src={modemoAsset("/images/1_용인주택.jpg")} alt="용인 주택의 철거 공사가 깔끔하게 완료된 현장 사진" priority />
                            <div className={styles.heroImageOverlay} />
                            <div className={styles.heroImageLabel}>용인 주택</div>
                        </div>

                        <div className={styles.heroImageCard}>
                            <Image width={667} height={500} src={modemoAsset("/images/2_수원상가.jpg")} alt="수원 지역 대형 상가 공간을 신속하고 정확하게 철거한 현장 사진" />
                            <div className={styles.heroImageOverlay} />
                            <div className={styles.heroImageLabel}>수원 상가</div>
                        </div>
                    </div>
                    <div className={styles.heroImageCol}>
                        <div className={styles.heroImageCard}>
                            <Image width={331} height={500} src={modemoAsset("/images/2_성북구상가.jpg")} alt="성북구 지역 상가의 복잡한 내부 철거를 성공적으로 마친 현장 사진" />
                            <div className={styles.heroImageOverlay} />
                            <div className={styles.heroImageLabel}>성북구 상가</div>
                        </div>
                        <div className={styles.heroImageCard}>
                            <Image width={667} height={500} src={modemoAsset("/images/2_여의도사무실.jpg")} alt="여의도 지역 사무실의 철거 공사가 안전하게 진행되고 있는 현장 사진" />
                            <div className={styles.heroImageOverlay} />
                            <div className={styles.heroImageLabel}>여의도 사무실</div>
                        </div>
                        <div className={styles.heroImageCard}>
                            <Image width={844} height={500} src={modemoAsset("/images/1_신림상가.jpg")} alt="신림 지역 상가를 안전하고 깔끔하게 완료한 원상복구 현장 사진" />
                            <div className={styles.heroImageOverlay} />
                            <div className={styles.heroImageLabel}>신림 상가</div>
                        </div>
                    </div>
                </FadeIn>

                <div className={styles.heroContent}>
                    <FadeIn delay={0.2} direction="left">
                        <div className={styles.heroTextBlock}>
                            <h1 className={styles.heroTitle}>
                                거품은 빼고, <br />안전은 더했습니다<br />
                            </h1>
                            <p className={styles.heroDesc}>
                                {isMobile ? (
                                    <>
                                        간편 신청 한 번으로 <br />
                                        3곳 비교부터 추가금 없는 책임 시공까지. <br />
                                        더 이상 발품 팔며 시간 낭비하지 마세요.
                                    </>
                                ) : (
                                    <>
                                        더 이상 발품 팔며 시간 낭비하지 마세요. <br />간편 신청 한 번으로 <br className={common.mobileBreak} />3곳 비교부터 추가금 없는 책임 시공까지.
                                    </>
                                )}
                            </p>
                        </div>
                    </FadeIn>

                    <FadeIn delay={0.4} direction="left" className={styles.zeroSection}>

                        <p className={styles.zeroLabel}>모두의철거 3無 원칙으로 <br className={common.mobileXBreak} />부담없이 견적부터 받아보세요.</p>
                        <div className={styles.zeroCostRow}>
                            <div className={styles.zeroCostItem}>
                                <span className={styles.zeroCostLabel}>출장비</span>
                                <span className={styles.zeroCostValue}><strong>0</strong>원</span>
                            </div>
                            <div className={styles.zeroCostItem}>
                                <span className={styles.zeroCostLabel}>견적비</span>
                                <span className={styles.zeroCostValue}><strong>0</strong>원</span>
                            </div>
                            <div className={styles.zeroCostItem}>
                                <span className={styles.zeroCostLabel}>추가금</span>
                                <span className={styles.zeroCostValue}><strong>0</strong>원</span>
                            </div>
                        </div>

                    </FadeIn>
                    <FadeIn delay={isMobile ? 0 : 0.6} direction="left">
                        <HeroLeadForm />
                    </FadeIn>
                </div>

                <FadeIn className={styles.heroImagesMobile} direction="none" duration={1.5} viewport={{ amount: 'some' }}>
                    <div className={styles.heroImagesMarquee}>
                        {/* First set of images */}
                        <div className={styles.heroImageCard}>
                            <Image width={123} height={188} src={modemoAsset("/images/1_용인주택.jpg")} alt="용인 주택의 철거 공사가 깔끔하게 완료된 현장 사진" priority />
                            <div className={styles.heroImageOverlay} />
                            <div className={styles.heroImageLabel}>용인 주택</div>
                        </div>

                        <div className={styles.heroImageCard}>
                            <Image width={123} height={188} src={modemoAsset("/images/1_천안상가.jpg")} alt="천안 지역 상가의 철거 공사를 투명한 견적으로 깔끔하게 완료한 현장 사진" />
                            <div className={styles.heroImageOverlay} />
                            <div className={styles.heroImageLabel}>천안 상가</div>
                        </div>

                        <div className={styles.heroImageCard}>
                            <Image width={123} height={188} src={modemoAsset("/images/2_수원상가.jpg")} alt="수원 지역 대형 상가 공간을 신속하고 정확하게 철거한 현장 사진" />
                            <div className={styles.heroImageOverlay} />
                            <div className={styles.heroImageLabel}>수원 상가</div>
                        </div>

                        <div className={styles.heroImageCard}>
                            <Image width={123} height={188} src={modemoAsset("/images/2_성북구상가.jpg")} alt="성북구 지역 상가의 복잡한 내부 철거를 성공적으로 마친 현장 사진" />
                            <div className={styles.heroImageOverlay} />
                            <div className={styles.heroImageLabel}>성북구 상가</div>
                        </div>
                        <div className={styles.heroImageCard}>
                            <Image width={123} height={188} src={modemoAsset("/images/2_여의도사무실.jpg")} alt="여의도 지역 사무실의 철거 공사가 안전하게 진행되고 있는 현장 사진" />
                            <div className={styles.heroImageOverlay} />
                            <div className={styles.heroImageLabel}>여의도 사무실</div>
                        </div>
                        <div className={styles.heroImageCard}>
                            <Image width={123} height={188} src={modemoAsset("/images/1_신림상가.jpg")} alt="신림 지역 상가를 안전하고 깔끔하게 완료한 원상복구 현장 사진" />
                            <div className={styles.heroImageOverlay} />
                            <div className={styles.heroImageLabel}>신림 상가</div>
                        </div>

                        {/* Duplicated set for seamless loop */}
                        <div className={styles.heroImageCard}>
                            <Image width={123} height={188} src={modemoAsset("/images/1_용인주택.jpg")} alt="용인 주택의 철거 공사가 깔끔하게 완료된 현장 사진" />
                            <div className={styles.heroImageOverlay} />
                            <div className={styles.heroImageLabel}>용인 주택</div>
                        </div>

                        <div className={styles.heroImageCard}>
                            <Image width={123} height={188} src={modemoAsset("/images/1_천안상가.jpg")} alt="천안 지역 상가의 철거 공사를 투명한 견적으로 깔끔하게 완료한 현장 사진" />
                            <div className={styles.heroImageOverlay} />
                            <div className={styles.heroImageLabel}>천안 상가</div>
                        </div>

                        <div className={styles.heroImageCard}>
                            <Image width={123} height={188} src={modemoAsset("/images/2_수원상가.jpg")} alt="수원 지역 대형 상가 공간을 신속하고 정확하게 철거한 현장 사진" />
                            <div className={styles.heroImageOverlay} />
                            <div className={styles.heroImageLabel}>수원 상가</div>
                        </div>

                        <div className={styles.heroImageCard}>
                            <Image width={123} height={188} src={modemoAsset("/images/2_성북구상가.jpg")} alt="성북구 지역 상가의 복잡한 내부 철거를 성공적으로 마친 현장 사진" />
                            <div className={styles.heroImageOverlay} />
                            <div className={styles.heroImageLabel}>성북구 상가</div>
                        </div>
                        <div className={styles.heroImageCard}>
                            <Image width={123} height={188} src={modemoAsset("/images/2_여의도사무실.jpg")} alt="여의도 지역 사무실의 철거 공사가 안전하게 진행되고 있는 현장 사진" />
                            <div className={styles.heroImageOverlay} />
                            <div className={styles.heroImageLabel}>여의도 사무실</div>
                        </div>
                        <div className={styles.heroImageCard}>
                            <Image width={123} height={188} src={modemoAsset("/images/1_신림상가.jpg")} alt="신림 지역 상가를 안전하고 깔끔하게 완료한 원상복구 현장 사진" />
                            <div className={styles.heroImageOverlay} />
                            <div className={styles.heroImageLabel}>신림 상가</div>
                        </div>
                    </div>

                </FadeIn>
            </div>
        </section >
    );
}
