"use client";

import { modemoAsset } from "@/lib/modemoAsset";

import styles from "./ProcessSection.module.css";
import FadeIn, { FadeInStagger } from "../animations/FadeIn";
import common from "./home.module.css";

const STEPS = [
  {
    num: "01",
    time: "신청 당일",
    title: "전담 매니저 배정 및 밀착 관리",
    photo: modemoAsset("/images/2_여의도사무실.jpg"),
    photoAlt: "사무실 철거 현장을 점검하는 모습",
    paragraphs: [
      <>
        사장님은 <span className={styles.boldText}>모두의철거 매니저</span>에게{" "}
        <span className={styles.boldText}>한 번만</span> 상황을 설명해 주세요.
      </>,
      <>현장 특이사항, 필요 장비까지 꼼꼼하게 정리해 파트너들에게 전달합니다.</>,
    ],
  },
  {
    num: "02",
    time: "일정 조율",
    title: "사장님 스케줄에 맞춘 방문 상담",
    photo: modemoAsset("/images/1_신림상가.jpg"),
    photoAlt: "상가 철거 현장 방문 상담 장면",
    paragraphs: [
      <>일일이 전화를 돌릴 필요 없습니다.</>,
      <>
        파트너 업체가 사장님이 편하신 시간에 맞춰 방문 일정을 제안하며,{" "}
        <br className={common.desktopBreak} />
        현장 확인 후 즉시 견적서를 작성하여 전달해 드립니다.
      </>,
    ],
  },
  {
    num: "03",
    time: "비교 후 확정",
    title: (
      <>
        견적 모아보기부터 결정까지 <br className={common.mobileBreak} />단번에
      </>
    ),
    photo: modemoAsset("/images/2_성북구상가.jpg"),
    photoAlt: "상가 철거가 깔끔하게 마무리된 현장",
    paragraphs: [
      <>
        견적 취합부터 보조 설명까지, <br className={common.mobileBreak} />
        전담 매니저가 함께합니다.
      </>,
    ],
  },
];

export default function ProcessSection() {
  return (
    <section className={styles.processSection} data-name="5 프로세스">
      <div className={styles.processInner}>
        <div className={styles.processHeader}>
          <FadeIn>
            <div className={common.badgeWrapper}>
              <p className={common.badge}>어떻게 진행되나요?</p>
            </div>
          </FadeIn>
          <FadeIn>
            <h2 className={styles.processTitle}>
              막막한 철거, 혼자 고민하지 마세요.
              <br className={common.desktopBreak} />
              전담 매니저가 전 과정을 함께합니다.
            </h2>
          </FadeIn>
          <FadeIn>
            <div className={styles.processSubtitle}>
              <p>반복되는 상담 스트레스, 저희가 덜어드릴게요.</p>
              <p>
                전담 매니저가 요구사항을{" "}
                <strong>꼼꼼히 정리하여 파트너 업체에 전달</strong>하고,{" "}
                <br className={common.desktopBreak} />
                확실한 견적을 받으실 수 있도록 가이드해 드립니다.
              </p>
            </div>
          </FadeIn>
        </div>

        <div className={styles.processGridContainer}>
          <div className={styles.desktopRail} aria-hidden>
            <div className={styles.desktopRailLine} />
          </div>

          <FadeInStagger className={styles.processGrid}>
            {STEPS.map((step) => (
              <FadeIn className={styles.processItem} key={step.num}>
                <div className={styles.processImageWrapper}>
                  <div className={styles.photoFrame}>
                    <img src={step.photo} alt={step.photoAlt} />
                    <span className={styles.photoScrim} />
                  </div>
                </div>
                <div className={styles.processContentWrapper}>
                  <div className={styles.processStepHeader}>
                    <div className={styles.stepNumber}>{step.num}</div>
                    <span className={styles.stepTime}>{step.time}</span>
                  </div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <div className={styles.stepDesc}>
                    {step.paragraphs.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </FadeInStagger>
        </div>
      </div>
    </section>
  );
}
