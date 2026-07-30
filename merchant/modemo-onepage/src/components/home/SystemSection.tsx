"use client";

import { modemoAsset } from "@/lib/modemoAsset";

import styles from "./SystemSection.module.css";
import common from "./home.module.css";
import FadeIn from "../animations/FadeIn";
import Image from "next/image";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function SystemSection() {
    const isMobile = useMediaQuery("(max-width: 768px)");

    return (
        <section className={`${common.section} ${styles.systemSection}`}>
            <div className={`${common.sectionInner} ${styles.systemInner}`}>
                {/* Header */}
                <div className={styles.systemHeader}>
                    <FadeIn>
                        <div className={common.badgeWrapper}>
                            <p className={common.badge}>3단계 안심 시스템</p>
                        </div>
                    </FadeIn>
                    <FadeIn>
                        <h2 className={`${common.sectionTitle} ${styles.sectionTitle}`}>
                            부르는 게 값인 불투명한 시장,<br />
                            <strong>모두의철거</strong>가 선명한 기준이 됩니다.
                        </h2>
                    </FadeIn>
                    <FadeIn>
                        <div className={common.sectionSubtitle} style={{ marginBottom: 0 }}>
                            예고 없이 터지는 추가 비용과 리스크, <br className={common.mobileBreak} />이제 걱정하지 마세요.<br />
                            <strong>3단계 안심 필터</strong>와 <strong>전담 매니저</strong>가 <br className={common.mobileBreak} />안전한 공사를 지원합니다.
                        </div>
                    </FadeIn>
                </div>

                <div className={styles.systemGrid}>
                    {/* Item 1 */}
                    <FadeIn className={styles.systemCard} viewport={{ amount: isMobile ? 0.5 : 0.8, once: true }}>
                        <div className={styles.systemCardImage}>
                            <img src={modemoAsset("/images/2_여의도사무실.jpg")} alt="전담 매니저가 현장 상황을 파악하며 상담하는 사무실·상가 현장" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div className={styles.systemCardContent}>
                            <div style={{ width: '100%' }}>
                                <div className={styles.systemProgressBar} />
                                <h3 className={styles.systemCardTitle}>
                                    정보 비대칭을 깨는<br className={styles.mobileBreak} /> <span>전담 매니저의 전문가 진단</span>
                                </h3>
                            </div>
                            <div className={styles.systemCardDesc}>
                                <div className={styles.systemCardDescHighlight}>
                                    <p>신청 즉시 배정된 전담 매니저가 유선 연락하여 사장님의 현장을 정밀 진단합니다.</p>
                                </div>
                                <div>
                                    <p>부르는 게 값인 시장에서 사장님이 꼭 알아야 할 <strong>주의사항</strong>과 <strong>서비스 이용 절차</strong>를 먼저 설명해 드립니다.</p>
                                </div>
                            </div>
                        </div>
                    </FadeIn>

                    {/* Item 2 */}
                    <FadeIn className={styles.systemCard} viewport={{ amount: isMobile ? 0.5 : 0.8, once: true }}>
                        <div className={styles.systemCardImage}>
                            <img src={modemoAsset("/images/1_천안상가.jpg")} alt="검증된 업체가 상가 현장을 직접 방문해 비교 견적을 산출하는 모습" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div className={styles.systemCardContent}>
                            <div style={{ width: '100%' }}>
                                <div className={styles.systemProgressBar} />
                                <h3 className={styles.systemCardTitle}>
                                    시장가격을 확인하는<br className={styles.mobileBreak} /> <span>3곳 무료 방문 비교 견적</span>
                                </h3>
                            </div>
                            <div className={styles.systemCardDesc}>
                                <div className={styles.systemCardDescHighlight}>
                                    <p>사진만 보고 대충 던지는 견적이 아닙니다.</p>
                                    <p>검증된 업체 3곳이 직접 현장을 방문하여 정확한 견적을 산출합니다.</p>
                                </div>
                                <div>
                                    <p>파트너 3사 비교 견적은 진짜 시세를 아는 지표이자, <br className={common.desktopBreak} />부당한 추가금과 불량 업체를 피하는 가장 확실한 방법입니다.</p>
                                </div>
                            </div>
                        </div>
                    </FadeIn>

                    {/* Item 3 */}
                    <FadeIn className={styles.systemCard} viewport={{ amount: isMobile ? 0.5 : 0.8, once: true }}>
                        <div className={styles.systemCardImage}>
                            <img src={modemoAsset("/images/3_동탄상가.jpg")} alt="시공 완료까지 책임 관리되는 상가 철거 현장" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div className={styles.systemCardContent}>
                            <div style={{ width: '100%' }}>
                                <div className={styles.systemProgressBar} />
                                <h3 className={styles.systemCardTitle}>
                                    시공 완료까지 책임지는<br className={styles.mobileBreak} /> <span>전담 매니저 밀착 케어</span>
                                </h3>
                            </div>
                            <div className={styles.systemCardDesc}>
                                <div className={styles.systemCardDescHighlight}>
                                    <p>현장에서의 기 싸움은 저희에게 맡기세요.</p>
                                    <p>부당한 추가금이나 미비한 마감 처리는 모두의철거가 직접 개입하여 사장님의 권리를 끝까지 지킵니다.</p>
                                </div>
                                <div>
                                    <p>공사가 끝났다고 끝이 아닙니다. <br className={common.desktopBreak} />시공이 완벽하게 완료되기까지 모두의철거가 끝까지 책임을 묻고 관리합니다.</p>
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                </div>


            </div>
            {/* Bottom Section */}
            <div className={styles.systemBottom}>
                <div className={styles.systemBottomText}>
                    <h3 className={styles.systemBottomTitle}>
                        단순한 연결에서 <br className={styles.mobileBreak} />끝내지 않습니다
                    </h3>
                    <p className={styles.systemBottomDesc}>
                        계약부터 시공 마감까지, <br className={styles.mobileBreak} />
                        모두의철거가 <br className={styles.mobileBreak} />
                        공사의 모든 과정을 함께 책임집니다.
                    </p>
                </div>
                <div className={styles.systemBottomImageWrapper}>
                    <Image src={modemoAsset("/images/1_용인주택.jpg")} alt="안전하고 투명한 시공을 마친 주택 철거 현장" width={474} height={282} />
                </div>
            </div>
        </section>
    );
}
