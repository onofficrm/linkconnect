import { useEffect } from 'react';

export type PolicyKind = 'privacy' | 'thirdparty' | 'marketing';

const POLICIES: Record<PolicyKind, { title: string; rows: [string, string][]; note: string }> = {
  privacy: {
    title: '개인정보 수집 및 이용 동의 (필수)',
    rows: [
      ['수집 항목', '이름, 휴대폰 번호, 거주 지역, 방문 희망 지점, 고민 부위'],
      ['이용 목적', '두피문신(SMP) 상담 접수, 가격·견적 안내, 방문 예약 연락'],
      ['보유 기간', '상담 목적 달성 후 지체 없이 파기 (관계 법령에 따라 보존이 필요한 경우 해당 기간)'],
    ],
    note: '동의를 거부할 수 있으나, 거부 시 상담 신청이 제한됩니다.',
  },
  thirdparty: {
    title: '개인정보 제3자 제공 동의 (필수)',
    rows: [
      ['제공받는 자', '도트락SMP (강남 본점·수원점)'],
      ['제공 항목', '이름, 휴대폰 번호, 거주 지역, 방문 희망 지점, 고민 부위'],
      ['제공 목적', '두피문신 상담 및 가격·견적 안내, 방문 예약'],
      ['보유 기간', '상담 목적 달성 후 지체 없이 파기'],
    ],
    note: '동의를 거부할 수 있으나, 거부 시 상담 신청이 제한됩니다.',
  },
  marketing: {
    title: '마케팅 활용 동의 (선택)',
    rows: [
      ['이용 항목', '이름, 휴대폰 번호'],
      ['이용 목적', '이벤트·프로모션 및 시술 혜택 안내 (문자·전화)'],
      ['보유 기간', '동의 철회 시 또는 수집일로부터 1년'],
    ],
    note: '동의하지 않아도 상담 신청은 가능합니다.',
  },
};

export default function PolicyModal({ kind, onClose }: { kind: PolicyKind; onClose: () => void }) {
  const policy = POLICIES[kind];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="policy-backdrop" role="presentation" onClick={onClose}>
      <div
        className="policy-modal"
        role="dialog"
        aria-modal="true"
        aria-label={policy.title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="policy-title">{policy.title}</div>
        <dl className="policy-rows">
          {policy.rows.map(([k, v]) => (
            <div className="policy-row" key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <p className="policy-note">{policy.note}</p>
        <button type="button" className="policy-close" onClick={onClose}>
          확인
        </button>
      </div>
    </div>
  );
}
