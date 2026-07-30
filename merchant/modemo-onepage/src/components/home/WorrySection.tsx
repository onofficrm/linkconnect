"use client";

import styles from "./WorrySection.module.css";
import common from "./home.module.css";
import FadeIn from "../animations/FadeIn";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function WorrySection() {
    const isMobile = useMediaQuery("(max-width: 768px)");
    const worries = [
        {
            title: "정보 비대칭",
            desc: "내가 철거를 잘 모르니까 만만하게 보고<br />'눈탱이' 씌우는 거 아닐까?",
        },
        {
            title: "깜깜이 견적",
            desc: "상세 내역도 없이 뭉뚱그린 견적서,<br />이걸 믿고 맡겨도 될까?",
        },
        {
            title: "업체 신뢰",
            desc: "계약금 보내고 나니까 연락이 잘 안 되네...<br />혹시 돈만 받고 안 나타나면 어쩌지?",
        },
        {
            title: "일정 지연",
            desc: "임대차 계약 만료일까지<br />공사가 안 끝날까 걱정되네..",
        },
        {
            title: "추가금 요구",
            desc: "막상 철거에 들어갔는데<br />추가금을 더 요청하면 어떡하지?<br />지금 와서 안 한다고 할 수도 없고,<br />부르는 대로 더 줘야 하나...",
        },
        {
            title: "사후 책임",
            desc: "마감이 덜 된 것 같은데...<br />건물주가 다시 해놓으라고 하면 어쩌지?<br />A/S는 확실히 되는지 모르겠네…",
        },
    ];

    const worriesMobile = [
        {
            title: "정보 비대칭",
            desc: "내가 철거를 잘 모르니까<br />만만하게 보고<br />'눈탱이' 씌우는 거 아닐까?",
        },
        {
            title: "깜깜이 견적",
            desc: "상세 내역도 없이 뭉뚱그린 견적서,<br />이걸 믿고 맡겨도 될까?",
        },
        {
            title: "업체 신뢰",
            desc: "계약금 보내고 나니까<br />연락이 잘 안 되네...<br />혹시 돈만 받고<br />안 나타나면 어쩌지?",
        },
        {
            title: "일정 지연",
            desc: "임대차 계약 만료일까지<br />공사가 안 끝날까 걱정되네..",
        },
        {
            title: "추가금 요구",
            desc: "막상 철거에 들어갔는데<br />추가금을 더 요청하면 어떡하지?<br />지금 와서 안 한다고 할 수도 없고,<br />부르는 대로 더 줘야 하나...",
        },
        {
            title: "사후 책임",
            desc: "마감이 덜 된 것 같은데...<br />건물주가 다시 해놓으라고 하면 어쩌지?<br />A/S는 확실히 되는지 모르겠네…",
        },
    ];

    return (
        <section className={`${styles.worrySection}`}>
            <div className={styles.worrySectionInner}>
                <FadeIn direction="up">
                    <div className={`${common.sectionInner} ${styles.worryHeader}`}>
                        <h2 className={styles.worryHeaderTitle}>
                            철거 전, <br className={common.mobileBreak} /> 이런 걱정 때문에 <br className={common.mobileBreak} />밤잠 설치고 계신가요?
                        </h2>
                        <p className={styles.worryHeaderSubtitle}>
                            사장님의 불안은 단순한 기우가 아닙니다.<br />
                            부르는 게 값인 시장에서 <br className={common.mobileBreak} />&apos;기준&apos;이 없으면 당할 수밖에 없습니다.
                        </p>
                    </div>
                </FadeIn>

                <div className={`${common.sectionInner} ${styles.worryGrid}`}>
                    {(isMobile ? worriesMobile : worries).map((item, i) => (
                        <FadeIn
                            className={styles.worryRow}
                            key={i}
                            direction="up"
                            duration={1.2}
                            delay={0.2}
                            viewport={{ once: true, margin: "-15% 0px" }}
                        >
                            <>
                                <div className={styles.empty}>

                                </div>
                                <div className={styles.worryCardContent}>
                                    <h3 className={styles.worryCardTitle}>{item.title}</h3>
                                    <p className={styles.worryCardDesc} dangerouslySetInnerHTML={{ __html: item.desc }}></p>
                                </div>
                            </>
                        </FadeIn>
                    ))}
                </div>

                <div data-header-color="black" className={styles.worryBottom}>
                    <FadeIn delay={0} duration={5.0} direction="none">
                        <h3 className={styles.worryBottomTitle}>믿을만한 업체일까..?</h3>
                    </FadeIn>
                    <FadeIn delay={0.2} duration={5.0} direction="none">
                        <p className={styles.worryBottomDesc}>
                            평생 한두 번 하는 철거, <br className={common.mobileBreak} />업체 말만 믿고 맡기기엔 <br className={common.mobileBreak} />리스크가 너무 큽니다.
                        </p>
                    </FadeIn>
                </div>
            </div>
        </section>
    );
}
