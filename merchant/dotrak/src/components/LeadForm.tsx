import { useState, type ChangeEvent, type ReactNode } from 'react';
import PolicyModal, { type PolicyKind } from './PolicyModal';
import { usePartnerContext } from '../context/PartnerContext';
import { trackDotrak } from '../lib/analytics';
import { submitLead } from '../lib/linkconnect';
import { phoneTelHref } from '../lib/partnerData';

const BRANCHES = ['강남 본점', '수원점'];
const AREAS: { id: string; label: string; hint: string; icon: ReactNode }[] = [
  { id: 'M자·헤어라인', label: 'M자·헤어라인', hint: '이마 라인', icon: <HairlineIcon /> },
  { id: '정수리·상판', label: '정수리·상판', hint: '윗머리', icon: <CrownIcon /> },
  { id: '가르마·여성', label: '가르마·여성', hint: '가르마', icon: <PartIcon /> },
  { id: '잘 모르겠음', label: '잘 모르겠음', hint: '상담에서 확인', icon: <HelpIcon /> },
];
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

function HairlineIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M10 30c2-12 8-18 14-18s12 6 14 18" />
      <path d="M16 22c2 3 4 4 8 4s6-1 8-4" />
      <path d="M14 30h20" />
    </svg>
  );
}

function CrownIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <ellipse cx="24" cy="22" rx="14" ry="12" />
      <path d="M16 18c1 4 3 6 8 6s7-2 8-6" />
    </svg>
  );
}

function PartIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M24 8c-8 6-12 14-12 24M24 8c8 6 12 14 12 24" />
      <path d="M24 10v24" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="12" />
      <path d="M20 20c.4-2.4 2-4 4.2-4 2.4 0 4 1.5 4 3.6 0 2.4-2.2 3-3.4 4.2-.8.8-1.2 1.6-1.2 2.8" />
      <circle cx="23.6" cy="31" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function LeadForm() {
  const { data, hasPhone } = usePartnerContext();
  const phone = data.tracking_phone || data.partner_phone;
  const phoneDisplay = data.tracking_phone_display || data.partner_phone_display;

  const [step, setStep] = useState<1 | 2>(1);
  const [started, setStarted] = useState(false);
  const [branch, setBranch] = useState('');
  const [areas, setAreas] = useState<string[]>([]);
  const [region, setRegion] = useState('');
  const [name, setName] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
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
    if (!started) {
      setStarted(true);
      trackDotrak('form_step1', { area });
    }
    setAreas((prev) => (prev.includes(area) ? prev.filter((item) => item !== area) : [...prev, area]));
  };

  const goStep2 = () => {
    if (areas.length === 0) return;
    trackDotrak('form_step2', { areas: areas.join(',') });
    setStep(2);
  };

  const handleSubmit = async () => {
    if (submitting) return;
    if (!branch) return alert('방문하실 지점을 선택해주세요.');
    if (!name.trim()) {
      document.getElementById('lead-name')?.focus();
      return alert('성함을 입력해주세요.');
    }
    if (!/^010-\d{3,4}-\d{4}$/.test(phoneInput.trim())) {
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
      phone: phoneInput,
      marketingConsent: consent.marketing,
      cta: 'quote',
      website,
    });
    setSubmitting(false);

    if (!result.ok) {
      alert(result.message);
      return;
    }
    trackDotrak('generate_lead', { areas: areas.join(','), branch });
    setDone(true);
    document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (done) {
    return (
      <section id="lead-form" data-section="apply" className="form-section">
        <div className="form-card form-done">
          <div className="eyebrow-tag">신청 완료</div>
          <h2>
            견적 신청이
            <br />
            접수되었습니다.
          </h2>
          <p className="desc">영업일 24시간 이내 1:1로 연락드리겠습니다. 시술은 강요하지 않습니다.</p>
          <ul className="prep-list">
            <li>고민 부위가 보이는 사진이 있으면 상담이 빨라집니다.</li>
            <li>방문 가능한 시간대를 미리 생각해 두세요.</li>
            <li>강남 본점·수원점 중 편한 곳을 정하시면 됩니다.</li>
          </ul>
          {hasPhone && (
            <a
              href={phoneTelHref(phone)}
              className="btn-secondary linkconnect-call-button"
              data-event-name="call_click"
              data-placement="form-done"
              data-phone={phone}
              onClick={() => trackDotrak('call_click', { placement: 'form-done' })}
            >
              전화로 이어서 상담 <span className="partner-phone-text">{phoneDisplay}</span>
            </a>
          )}
        </div>
      </section>
    );
  }

  return (
    <section id="lead-form" data-section="apply" className="form-section">
      <div className="form-card">
        <div className="form-progress" aria-hidden="true">
          <span>{step}/2</span>
          <span>{step === 1 ? '10초 남음' : '거의 끝났어요'}</span>
        </div>
        <div className="form-progress-track">
          <span style={{ width: step === 1 ? '50%' : '100%' }} />
        </div>
        <div className="eyebrow-tag">{step === 1 ? '1분 무료 진단' : '연락처'}</div>
        <h2>
          {step === 1 ? (
            <>
              어디가
              <br />
              고민이세요?
            </>
          ) : (
            <>
              견적을 받을
              <br />
              연락처만 남겨 주세요.
            </>
          )}
        </h2>
        <p className="desc">
          {step === 1 ? '해당하는 부위를 고르면 다음으로 넘어갑니다.' : '이름과 번호만 있으면 맞춤 견적을 안내합니다.'}
        </p>

        {step === 1 ? (
          <>
            <div className="area-cards">
              {AREAS.map((area) => (
                <button
                  type="button"
                  key={area.id}
                  className={areas.includes(area.id) ? 'active' : ''}
                  aria-pressed={areas.includes(area.id)}
                  onClick={() => toggleArea(area.id)}
                >
                  {area.icon}
                  <span className="area-card-label">{area.label}</span>
                  <span className="area-card-hint">{area.hint}</span>
                </button>
              ))}
            </div>
            <button type="button" className="btn-primary cta-single" disabled={areas.length === 0} onClick={goStep2}>
              다음 · 연락처 입력
            </button>
            <p className="trust-line">시술 강요 없음 · 무료 견적 · 24시간 내 연락</p>
          </>
        ) : (
          <>
            <button type="button" className="form-back" onClick={() => setStep(1)}>
              ← 부위 다시 선택
            </button>
            <div className="form-field">
              <label className="form-label">
                방문 지점 <span className="req">*</span>
              </label>
              <div className="area-pick">
                {BRANCHES.map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={branch === item ? 'active' : ''}
                    aria-pressed={branch === item}
                    onClick={() => setBranch(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
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
                onChange={(event) => setName(event.target.value)}
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
                value={phoneInput}
                onChange={(event) => setPhoneInput(formatPhone(event.target.value))}
              />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="region-select">
                거주 지역 <span className="opt">선택</span>
              </label>
              <select
                id="region-select"
                name="region"
                className="region-select"
                value={region}
                onChange={(event: ChangeEvent<HTMLSelectElement>) => setRegion(event.target.value)}
              >
                <option value="">선택 안 함</option>
                {REGIONS.map((item) => (
                  <option value={item} key={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <input
              type="text"
              name="website"
              className="lead-hp"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
            />
            <div className="consent-wrap">
              <div className="consent-list">
                {CONSENTS.map((item) => (
                  <div className="consent-row" key={item.kind}>
                    <label className="consent-label">
                      <input
                        type="checkbox"
                        checked={consent[item.kind]}
                        onChange={(event) => setConsent((prev) => ({ ...prev, [item.kind]: event.target.checked }))}
                      />
                      <span>{item.label}</span>
                    </label>
                    <button type="button" className="consent-view" onClick={() => setPolicy(item.kind)}>
                      보기
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <button
              type="button"
              className="btn-primary cta-single"
              data-event-name="lead_submit"
              disabled={submitting}
              onClick={handleSubmit}
            >
              {submitting ? '접수 중…' : '내 두피 무료 견적 받기'}
            </button>
            <p className="trust-line">시술 강요 없음 · 무료 견적 · 24시간 내 연락</p>
          </>
        )}
      </div>
      {policy && <PolicyModal kind={policy} onClose={() => setPolicy(null)} />}
    </section>
  );
}
