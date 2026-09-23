import { useState, type ChangeEvent } from 'react';
import PolicyModal, { type PolicyKind } from './PolicyModal';
import { submitLead, type LeadCta } from '../lib/linkconnect';

const BRANCHES = ['강남 본점', '수원점'];
const AREAS = ['M자·헤어라인', '정수리·상판', '가르마·여성', '잘 모르겠음'];
const REGIONS = [
  '서울', '경기', '인천', '부산', '대구', '대전', '광주', '울산', '세종',
  '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주', '기타/해외',
];

const CONSENTS: { kind: PolicyKind; label: string }[] = [
  { kind: 'privacy', label: '[필수] 개인정보 수집 및 이용 동의' },
  { kind: 'thirdparty', label: '[필수] 개인정보 제3자 제공 동의' },
  { kind: 'marketing', label: '[선택] 마케팅 활용 동의' },
];

function formatPhone(raw: string): string {
  const v = raw.replace(/[^0-9]/g, '').slice(0, 11);
  if (v.length > 7) return `${v.slice(0, 3)}-${v.slice(3, 7)}-${v.slice(7)}`;
  if (v.length > 3) return `${v.slice(0, 3)}-${v.slice(3)}`;
  return v;
}

export default function LeadForm() {
  const [branch, setBranch] = useState('');
  const [areas, setAreas] = useState<string[]>([]);
  const [region, setRegion] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [consent, setConsent] = useState<Record<PolicyKind, boolean>>({
    privacy: false,
    thirdparty: false,
    marketing: false,
  });
  const [policy, setPolicy] = useState<PolicyKind | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const toggleArea = (area: string) => {
    setAreas((prev) => (prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]));
  };

  const handleSubmit = async (cta: LeadCta) => {
    if (submitting) return;
    if (!branch) return alert('방문하실 지점을 선택해주세요.');
    if (areas.length === 0) return alert('고민 부위를 선택해주세요.');
    if (!region) return alert('거주 지역을 선택해주세요.');
    if (!name.trim()) {
      document.getElementById('lead-name')?.focus();
      return alert('성함을 입력해주세요.');
    }
    if (!/^010-\d{3,4}-\d{4}$/.test(phone.trim())) {
      document.getElementById('lead-phone')?.focus();
      return alert('휴대폰 번호를 정확히 입력해주세요.');
    }
    if (!consent.privacy || !consent.thirdparty) return alert('필수 동의 항목에 체크해주세요.');

    setSubmitting(true);
    const result = await submitLead({
      branch,
      areas,
      region,
      name,
      phone,
      marketingConsent: consent.marketing,
      cta,
      website,
    });
    setSubmitting(false);

    if (!result.ok) {
      alert(result.message);
      return;
    }
    setDone(true);
    document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (done) {
    return (
      <section id="lead-form" data-section="apply" className="form-section">
        <div className="form-card form-done">
          <div className="eyebrow-tag">신청 완료</div>
          <h2>
            신청이
            <br />
            접수되었습니다.
          </h2>
          <p className="desc">영업일 24시간 이내 1:1로 연락드리겠습니다.</p>
          <div className="incentive-tag">🎁 시술 시 1년 A/S 무료 + 모낭재생앰플 업그레이드 무료</div>
        </div>
      </section>
    );
  }

  return (
    <section id="lead-form" data-section="apply" className="form-section">
      <div className="form-card">
        <div className="eyebrow-tag">1분 무료 진단</div>
        <h2>
          1분이면
          <br />
          가격·견적 받으실 수 있어요.
        </h2>
        <p className="desc">두피 상태를 진단하고 맞춤 시술 견적을 안내해드립니다.</p>
        <div className="incentive-tag">🎁 시술 시 1년 A/S 무료 + 모낭재생앰플 업그레이드 무료</div>

        <div className="form-field">
          <label className="form-label">
            방문 지점 <span className="req">*</span>
          </label>
          <div className="area-pick" id="branch-pick">
            {BRANCHES.map((b) => (
              <button
                type="button"
                key={b}
                className={branch === b ? 'active' : ''}
                aria-pressed={branch === b}
                onClick={() => setBranch(b)}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        <div className="form-field">
          <label className="form-label">
            고민 부위 <span className="req">*</span>
          </label>
          <div className="area-pick">
            {AREAS.map((a) => (
              <button
                type="button"
                key={a}
                className={areas.includes(a) ? 'active' : ''}
                aria-pressed={areas.includes(a)}
                onClick={() => toggleArea(a)}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="region-select">
            거주 지역 <span className="req">*</span>
          </label>
          <select
            id="region-select"
            name="region"
            className="region-select"
            value={region}
            required
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setRegion(e.target.value)}
          >
            <option value="" disabled>
              지역을 선택해주세요
            </option>
            {REGIONS.map((r) => (
              <option value={r} key={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="lead-name">
            이름 <span className="req">*</span>
          </label>
          <input
            type="text"
            id="lead-name"
            name="name"
            placeholder="성함"
            autoComplete="name"
            maxLength={30}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="lead-phone">
            휴대폰 번호 <span className="req">*</span>
          </label>
          <input
            type="tel"
            id="lead-phone"
            name="phone"
            placeholder="010-0000-0000"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={13}
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
          />
        </div>

        <input
          type="text"
          name="website"
          className="lead-hp"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />

        <div className="consent-wrap">
          <div className="consent-list">
            {CONSENTS.map((c) => (
              <div className="consent-row" key={c.kind}>
                <label className="consent-label">
                  <input
                    type="checkbox"
                    id={`consent-${c.kind}`}
                    checked={consent[c.kind]}
                    onChange={(e) => setConsent((prev) => ({ ...prev, [c.kind]: e.target.checked }))}
                  />
                  <span>{c.label}</span>
                </label>
                <button type="button" className="consent-view" onClick={() => setPolicy(c.kind)}>
                  보기
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="cta-pair">
          <button
            type="button"
            id="submit-price"
            className="btn-primary"
            disabled={submitting}
            onClick={() => handleSubmit('price')}
          >
            {submitting ? '접수 중…' : '가격 알아보기'}
          </button>
          <button
            type="button"
            id="submit-consult"
            className="btn-secondary"
            disabled={submitting}
            onClick={() => handleSubmit('consult')}
          >
            🎁 상담 신청
          </button>
        </div>
        <p className="submit-note">신청 후 영업일 24시간 이내 1:1 연락드립니다.</p>
      </div>

      {policy && <PolicyModal kind={policy} onClose={() => setPolicy(null)} />}
    </section>
  );
}
