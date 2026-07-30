"use client";

import styles from "./EvidenceStrip.module.css";

const ITEMS = [
  { value: "4,130+", label: "누적 비교 견적" },
  { value: "13%", label: "평균 비용 절감" },
  { value: "4.9/5", label: "서비스 만족도" },
  { value: "상위 10%", label: "검증 파트너만 연결" },
];

/** Hero 직후 한 줄 증거 — 카드 없이 밀도만 높임 */
export default function EvidenceStrip() {
  return (
    <section className={styles.strip} aria-label="서비스 실적 요약">
      <div className={styles.inner}>
        {ITEMS.map((item, i) => (
          <div key={item.label} className={styles.item}>
            {i > 0 ? <span className={styles.divider} aria-hidden /> : null}
            <div className={styles.copy}>
              <strong className={styles.value}>{item.value}</strong>
              <span className={styles.label}>{item.label}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
