"use client";

import styles from "./ProcessSection.module.css";
import FadeIn, { FadeInStagger } from "../animations/FadeIn";
import common from "./home.module.css";

export default function ProcessSection() {
    return (
        <section className={styles.processSection} data-name="5 프로세스" data-node-id="0:310">
            <div className={styles.processInner}>
                {/* Header */}
                <div className={styles.processHeader}>
                    <FadeIn>
                        <div className={common.badgeWrapper}>
                            <p className={common.badge}>어떻게 진행되나요?</p>
                        </div>
                    </FadeIn>
                    <FadeIn>
                        <h2 className={styles.processTitle}>
                            <p>막막한 철거, 혼자 고민하지 마세요. <br className={common.desktopBreak} />전담 매니저가 전 과정을 함께합니다.</p>
                        </h2>
                    </FadeIn>
                    <FadeIn>
                        <div className={styles.processSubtitle}>
                            <p>반복되는 상담 스트레스, 저희가 덜어드릴게요.</p>
                            <p>전담 매니저가 사장님의 요구사항을 <strong>꼼꼼히 정리하여 파트너 업체에 전달</strong>하고, <br className={common.desktopBreak} />확실한 견적을 받으실 수 있도록 가이드해 드립니다.</p>
                        </div>
                    </FadeIn>
                </div>

                {/* Timeline Grid */}
                <div className={styles.processGridContainer}>
                    <div className={styles.mobileTimelineContainer}>
                        <div className={styles.timelineLine} />
                    </div>

                    <FadeInStagger className={styles.processGrid}>
                        {/* Item 1 */}
                        <FadeIn className={styles.processItem} data-name="Item 1" data-node-id="0:330">
                            <div className={styles.processImageWrapper}>
                                <div className={styles.compositeImageArea}>
                                    <img src="/images/folder.png" alt="사장님의 현장 상황과 특이사항을 꼼꼼하게 정리하기 위한 서류 폴더" className={`${styles.compImg} ${styles.img1Base}`} />
                                    <img src="/images/phone_green.png" alt="전담 매니저가 전화 한 통으로 모든 철거 요구사항을 파악하는 모습" className={`${styles.compImg} ${styles.img1Overlay}`} />
                                </div>
                            </div>
                            <div className={styles.processContentWrapper}>
                                <div className={styles.processStepHeader}>
                                    <div className={styles.stepNumber}>1</div>
                                    <h3 className={styles.stepTitle}>전담 매니저 배정 및 밀착 관리</h3>
                                </div>
                                <div className={styles.stepDesc}>
                                    <p>
                                        사장님은 <span className={styles.boldText}>모두의철거 매니저</span>에게 <span className={styles.boldText}>한 번만</span> 상황을 설명해 주세요.
                                    </p>
                                    <p>현장 특이사항, 필요 서류까지 꼼꼼하게 정리해 파트너들에게 전달합니다.</p>
                                </div>
                            </div>
                        </FadeIn>

                        {/* Item 2 */}
                        <FadeIn className={styles.processItem} data-name="Item 2" data-node-id="0:344">
                            <div className={styles.processImageWrapper}>
                                <div className={styles.compositeImageArea}>
                                    <img src="/images/calendar.png" alt="사장님이 편한 시간대에 맞춰 여러 방문 일정을 조율하는 달력 이미지" className={`${styles.compImg} ${styles.img2Base}`} />
                                    <img src="/images/pin_on_map.png" alt="지도 위의 핀 아이콘으로 정확한 현장 방문 위치와 일정을 나타내는 이미지" className={`${styles.compImg} ${styles.img2Overlay}`} />
                                </div>
                            </div>
                            <div className={styles.processContentWrapper}>
                                <div className={styles.processStepHeader}>
                                    <div className={styles.stepNumber}>2</div>
                                    <h3 className={styles.stepTitle}>사장님 스케줄에 맞춘 방문 상담</h3>
                                </div>
                                <div className={styles.stepDesc}>
                                    <p>일일이 전화를 돌릴 필요 없습니다.</p>
                                    <p>
                                        파트너 업체가 사장님이 편하신 시간에 맞춰 방문 일정을 제안하며, <br className={common.desktopBreak} />현장 확인 후 즉시 견적서를 작성하여 전달해 드립니다.
                                    </p>
                                </div>
                            </div>
                        </FadeIn>

                        {/* Item 3 */}
                        <FadeIn className={styles.processItem} data-name="Item 3" data-node-id="0:360">
                            <div className={styles.processImageWrapper}>
                                <div className={styles.compositeImageArea}>
                                    <img src="/images/document.png" alt="3곳 이상의 철거 업체에서 제출한 다양한 견적서 문서 이미지" className={`${styles.compImg} ${styles.img3Base}`} />
                                    <img src="/images/hand_pencil_notebook.png" alt="여러 견적서를 한눈에 비교하고 분석하며 노트에 체크하는 모습" className={`${styles.compImg} ${styles.img3Overlay}`} />
                                </div>
                            </div>
                            <div className={styles.processContentWrapper}>
                                <div className={styles.processStepHeader}>
                                    <div className={styles.stepNumber}>3</div>
                                    <h3 className={styles.stepTitle}>견적 모아보기부터 결정까지 <br className={common.mobileBreak} />단번에</h3>
                                </div>
                                <div className={styles.stepDesc}>
                                    <p>견적 취합부터 보조 설명까지, <br className={common.mobileBreak} />전담 매니저가 함께합니다.
                                    </p>
                                </div>
                            </div>
                        </FadeIn>
                    </FadeInStagger>
                </div>
            </div>
        </section>
    );
}
