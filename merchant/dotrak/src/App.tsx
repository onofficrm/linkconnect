import { useEffect, useRef, useState } from 'react';
import BeforeAfter from './components/BeforeAfter';
import LeadForm from './components/LeadForm';
import Reveal from './components/Reveal';
import { usePartnerContext } from './context/PartnerContext';
import { trackDotrak } from './lib/analytics';
import { resolveHeroVariant } from './lib/heroVariant';
import { phoneTelHref } from './lib/partnerData';

const IMG = `${import.meta.env.BASE_URL}images/`;

function AutoplayVideo({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true;
    video.setAttribute('muted', '');
    video.play().catch(() => {});
  }, []);

  return (
    <video ref={ref} autoPlay muted loop playsInline preload="metadata" poster={poster}>
      <source src={src} type="video/mp4" />
    </video>
  );
}

function scrollToForm() {
  document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / 900);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target]);
  return value;
}

function StatStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const cases = useCountUp(6000, active);
  const trainees = useCountUp(800, active);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setActive(true);
        observer.disconnect();
      }
    }, { threshold: 0.2 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="stat-strip" ref={ref}>
      <div>
        <strong>{cases.toLocaleString()}+</strong>
        <span>시술</span>
      </div>
      <div>
        <strong>{trainees.toLocaleString()}</strong>
        <span>교육생 배출</span>
      </div>
      <div>
        <strong>1년</strong>
        <span>무상 A/S</span>
      </div>
    </div>
  );
}

const TECHNIQUES = [
  {
    title: '색소 깊이 1~1.5mm 정밀 제어',
    body: '모낭(4~5mm) 손상 없이 표피층에만 색소를 안착시켜 영구 유지.',
    em: '너무 깊으면 청록·갈색 변색',
    tail: '으로 평생 흉터가 됩니다.',
  },
  {
    title: '자연 그러데이션 농도',
    body: '앞쪽은 옅게, 뒤쪽은 진하게. 머리카락의 자연스러운 밀도 분포를 그대로 재현해',
    em: '한눈에 SMP라고 보이지 않게',
    tail: ' 마무리합니다.',
  },
  {
    title: '맞춤 색소 조합',
    body: '두피 톤·모발 색·피부 타입에 따라 매번 다른 색소를 조합합니다.',
    em: '표준화된 한 가지 색소만 쓰는 곳',
    tail: '은 시술 후 색상 불일치가 생기기 쉽습니다.',
  },
  {
    title: '자연 헤어라인 디자인',
    body: '직선이 아닌 미세한 들쭉날쭉을 살린 자연 라인.',
    em: '일률적인 직선 헤어라인',
    tail: '은 SMP의 가장 흔한 실수이자 평생 부자연스러움의 원인입니다.',
  },
];

const CREDENTIALS = [
  'KART SMP 총괄회장',
  '월드마스터(World Master) 인증 보유',
  '서강대·경기대·국민대 SMP 정규 과목 교수 출강',
  '의사 대상 SMP 시술 교육 진행',
  '누적 시술자 800명 배출',
  '국제표준 두피문신 경연대회 회장 역임',
];

const COMPARE_ROWS: [string, string][] = [
  ['단일 색소', '다중 색소 블렌딩'],
  ['2D 도팅', '3D 입체 도팅'],
  ['1~2년 유지', '영구 유지'],
  ['2시간 내외 시술', '1시간 내외 시술'],
  ['기성 색소 사용', '도트락 자체 개발 색소'],
  ['사후관리 없음', '1년 무제한 리터치 보증'],
];

const STEPS = [
  { no: '01', title: '무료 상담', body: '고민 부위와 원하는 밀도를 확인합니다.' },
  { no: '02', title: '라인 디자인', body: '얼굴형에 맞춰 헤어라인을 잡습니다.' },
  { no: '03', title: '시술 약 1시간', body: '쉐도우 도팅으로 점을 안착시킵니다.' },
  { no: '04', title: '1년 무상 A/S', body: '결과에 따라 보정 일정을 안내합니다.' },
];

const FAQS = [
  {
    q: '시술할 때 아픈가요?',
    a: '통증은 개인마다 다릅니다. 상담에서 과정과 마취 여부를 먼저 안내하고, 원하지 않으시면 시술을 진행하지 않습니다.',
  },
  {
    q: '티가 나거나 부자연스럽지 않나요?',
    a: '앞쪽은 옅고 뒤쪽은 진한 농도로 점을 찍어 모발 밀도처럼 보이게 합니다. 상담 때 시술 전후 사진으로 결과를 함께 봅니다.',
  },
  {
    q: '한 번에 끝나나요?',
    a: '부위와 원하는 밀도에 따라 회차가 달라집니다. 1회 시술은 1시간 내외이며, 필요한 횟수는 상담에서 안내합니다.',
  },
  {
    q: '시술 후 바로 일상으로 돌아가나요?',
    a: '당일 주의사항은 시술 후에 안내합니다. 복귀 시점은 두피 상태에 따라 달라 상담에서 확인하실 수 있습니다.',
  },
  {
    q: '결과가 마음에 들지 않으면요?',
    a: '1년 이내 무상 A/S로 보정을 안내합니다. 유지와 제거에 대한 설명은 시술 전 상담에서 드립니다.',
  },
];

const RESULTS = [
  {
    label: 'FOR MEN',
    cases: [
      { img: 'men-hairline.webp', mode: 'stack' as const, beforeEnd: 0.53, afterStart: 0.57, no: 'MEN · CASE 01', title: '헤어라인', alt: '남성 헤어라인 시술 전후' },
      { img: 'men-crown.webp', mode: 'side' as const, no: 'MEN · CASE 02', title: '정수리 4회차', alt: '남성 정수리 시술 전후' },
      { img: 'men-wide.webp', mode: 'side' as const, no: 'MEN · CASE 03', title: '광범위 SMP 4회차', alt: '남성 광범위 SMP 시술 전후' },
    ],
  },
  {
    label: 'FOR WOMEN',
    cases: [
      { img: 'women-part.webp', mode: 'side' as const, no: 'WOMEN · CASE 01', title: '가르마 4회차', alt: '여성 가르마 시술 전후' },
      { img: 'women-hairline.webp', mode: 'stack' as const, beforeEnd: 0.5, afterStart: 0.564, no: 'WOMEN · CASE 02', title: '여성 헤어라인', alt: '여성 헤어라인 시술 전후' },
      { img: 'women-crown.webp', mode: 'stack' as const, beforeEnd: 0.52, afterStart: 0.535, no: 'WOMEN · CASE 03', title: '여성 정수리', alt: '여성 정수리 시술 전후' },
    ],
  },
];

const PRICE_INCLUDES = ['면적 무제한 (측두부 제외)', '1년 무상 A/S', '모낭재생앰플 업그레이드', '쉐도우 도팅'];

export default function App() {
  const { data, hasPhone } = usePartnerContext();
  const phone = data.tracking_phone || data.partner_phone;
  const phoneDisplay = data.tracking_phone_display || data.partner_phone_display;
  const hero = resolveHeroVariant();
  const [stickyOn, setStickyOn] = useState(true);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    const targets = [document.getElementById('lead-form'), document.querySelector('.hero-quote')].filter(
      (el): el is Element => Boolean(el),
    );
    if (targets.length === 0) return;
    const visible = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        });
        setStickyOn(visible.size === 0);
      },
      { threshold: 0.35 },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div id="dotrak-merchant-page">
      <div className="wrap">
        <div className="top-banner">
          🎁 <b>무제한 두피문신 49만원</b> + 1년 무상 A/S<span className="arrow">→</span>
        </div>
        <nav className="nav">
          <a href="#top" className="nav-brand">
            DOTRAK<span className="dot">·</span>SMP <span className="nav-branch">서울본점</span>
          </a>
          <a href="#lead-form" className="nav-cta">
            무료 견적
          </a>
        </nav>

        <section id="top" data-section="hero" data-hero={hero} className="hero">
          <div className="hero-eyebrow">CAMPAIGN · 두피문신 SMP</div>
          {hero === 'result' ? (
            <>
              <h1>
                감추던 라인을
                <br />
                끝내세요
              </h1>
              <p className="hero-sub">
                좌우로 밀어 시술 전후를 비교해 보세요. 캠페인가는 <b>49만원</b>입니다.
              </p>
              <div className="hero-ba">
                <BeforeAfter
                  src={`${IMG}men-hairline.webp`}
                  alt="헤어라인 시술 전후"
                  mode="stack"
                  beforeEnd={0.53}
                  afterStart={0.57}
                  frame="natural"
                />
                <p className="ba-hint">밀어서 전후 비교</p>
              </div>
            </>
          ) : (
            <>
              <h1>
                무제한 두피문신
                <br />
                <span className="price">49만원</span>
              </h1>
              <p className="hero-sub">
                두피문신 세계협회 회장이 개발한 <b>영구 유지 SMP</b>. 만족하실 때까지 빼곡하게 채워드리고 1년 무상 A/S까지
                보장합니다.
              </p>
            </>
          )}
          <div className="hero-features">
            <span className="hero-feature">면적 무제한</span>
            <span className="hero-feature">1년 무상 A/S</span>
            <span className="hero-feature">모낭재생앰플</span>
            <span className="hero-feature">쉐도우 도팅</span>
          </div>
          <StatStrip />
          <button type="button" className="btn-primary hero-quote" onClick={scrollToForm}>
            내 두피 무료 견적 받기
          </button>
          <p className="trust-line">시술 강요 없음 · 무료 견적 · 24시간 내 연락</p>
        </section>

        <LeadForm />

        <Reveal>
          <section data-section="dotting" className="dotting-section dotting-branded">
            <div className="block-eyebrow">PHILOSOPHY</div>
            <div className="philosophy-block">
              <p>
                도트락은 신경쓰지 않는 <b>본연의 모습이 만들어내는 행복</b>의 가치를 믿습니다.
              </p>
              <p>
                실제와 구별이 가지 않는 두피문신 디자인을 통해
                <br />
                우리의 신념을 실천합니다.
              </p>
              <p className="philosophy-result">
                그렇게 탄생한 것이
                <br />
                <span className="gold">진짜 모근처럼 보이는 쉐도우 도팅</span>입니다.
              </p>
            </div>
            <h2 className="dotting-h2">
              도트락의 차별화 기법,
              <br />
              <span className="gold">쉐도우 도팅.</span>
            </h2>
            <div className="dotting-video">
              <AutoplayVideo src={`${IMG}shadow-dotting.mp4`} poster={`${IMG}skin-cross-section.webp`} />
            </div>
            <div className="dotting-intro">
              두피에 미세한 점(도트)을 찍어 <b>모낭의 그림자처럼</b> 표현하는 기법입니다. 같은 두피문신이라도 어떤
              깊이·각도·색소로 점을 찍느냐에 따라 결과가 완전히 달라집니다.
            </div>
            <div className="skin-cross">
              <img src={`${IMG}skin-cross-section.webp`} alt="피부 단면 - 쉐도우 도팅 시술 깊이" loading="lazy" />
              <div className="skin-cross-caption">
                <div className="caption-title">정확한 깊이가 만드는 차이</div>
                <div className="caption-body">
                  너무 얕으면 금세 사라지고,
                  <br />
                  너무 깊으면 흐려져 부자연스럽습니다.
                </div>
              </div>
            </div>
            <div className="dotting-list">
              {TECHNIQUES.map((item, index) => (
                <div className="dotting-item" key={item.title}>
                  <div className="num">TECHNIQUE 0{index + 1}</div>
                  <div className="title">{item.title}</div>
                  <div className="body">
                    {item.body} <em>{item.em}</em>
                    {item.tail}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section data-section="expertise" className="block expertise-section">
            <div className="block-eyebrow">EXPERTISE</div>
            <h2>
              아무나 하는
              <br />
              두피문신이 아닙니다.
            </h2>
            <p className="sub">6,000건 이상의 시술이 검증합니다.</p>
            <div className="director-card">
              <img src={`${IMG}director-aiden.webp`} alt="대표원장 Aiden" className="director-img" loading="lazy" />
              <div className="director-info">
                <div className="director-role">대표원장</div>
                <div className="director-name">Aiden</div>
                <div className="director-titles">KART SMP 총괄회장 · 월드마스터</div>
              </div>
            </div>
            <div className="cred-list">
              {CREDENTIALS.map((item) => (
                <div className="cred-item" key={item}>
                  <span className="cred-check">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section data-section="private" className="block private-section">
            <div className="block-eyebrow">PRIVATE</div>
            <h2>
              공장형에서
              <br />
              시술받지 마세요.
            </h2>
            <p className="sub">경력이 부족한 근처 초급 시술자에게 받으면 위험합니다.</p>
            <div className="compare-images">
              <div className="compare-img">
                <img src={`${IMG}compare-2d.webp`} alt="일반 2D 도팅 결과" loading="lazy" />
                <div className="compare-img-label compare-img-label-bad">일반 2D 도팅</div>
              </div>
              <div className="compare-img">
                <img src={`${IMG}compare-3d.webp`} alt="도트락 쉐도우 도팅 결과" loading="lazy" />
                <div className="compare-img-label compare-img-label-good">도트락 쉐도우 도팅</div>
              </div>
            </div>
            <div className="compare-table">
              <div className="compare-table-head">
                <div className="ct-col ct-col-bad">일반 두피문신</div>
                <div className="ct-col ct-col-good">도트락 쉐도우 도팅</div>
              </div>
              {COMPARE_ROWS.map(([bad, good]) => (
                <div className="compare-table-row" key={bad}>
                  <div className="ct-col ct-col-bad">{bad}</div>
                  <div className="ct-col ct-col-good">{good}</div>
                </div>
              ))}
            </div>
            <div className="private-room">
              <img src={`${IMG}council-room.webp`} alt="프라이빗 1인실 상담실" className="private-img" loading="lazy" />
              <div className="private-overlay">
                <div className="private-title">프라이빗 1인실</div>
                <div className="private-desc">병원급 청결 · 멸균 시스템 보유</div>
              </div>
            </div>
            <div className="private-room private-room-sub">
              <img src={`${IMG}reception.webp`} alt="도트락 프라이빗 리셉션" className="private-img" loading="lazy" />
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section data-section="results" className="block results-section">
            <div className="block-eyebrow">RESULTS</div>
            <h2>
              감추던 시간을
              <br />
              끝낸 분들.
            </h2>
            <p className="sub">사진을 밀어 시술 전과 후를 비교해 보세요.</p>
            {RESULTS.map((group) => (
              <div className="results-group" key={group.label}>
                <div className="results-label">{group.label}</div>
                <div className="results-grid">
                  {group.cases.map((item) => (
                    <div className="result-card" key={item.no}>
                      <BeforeAfter
                        src={`${IMG}${item.img}`}
                        alt={item.alt}
                        mode={item.mode}
                        beforeEnd={item.beforeEnd}
                        afterStart={item.afterStart}
                        frame="natural"
                        showTags={item.mode === 'stack'}
                      />
                      <div className="result-caption">
                        <span className="case-no">{item.no}</span>
                        {item.title}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        </Reveal>

        <Reveal>
          <section data-section="process" className="block process-section">
            <div className="block-eyebrow">PROCESS</div>
            <h2>
              상담부터 A/S까지
              <br />
              이렇게 진행됩니다.
            </h2>
            <ol className="process-list">
              {STEPS.map((step) => (
                <li key={step.no}>
                  <span>{step.no}</span>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </Reveal>

        <Reveal>
          <section data-section="coverage" className="block">
            <div className="block-eyebrow">COVERAGE</div>
            <h2>
              49만원 캠페인,
              <br />이 3가지가 모두 포함됩니다.
            </h2>
            <div className="price-card">
              <div className="price-was">
                무제한 두피문신 1회 <s>79만원</s>
              </div>
              <div className="price-now">
                49<span>만원</span>
              </div>
              <ul>
                {PRICE_INCLUDES.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <p className="sub">감추는 데 쓰던 비용·시간·에너지를, 단 한 번의 캠페인으로 끝내세요.</p>
            <div className="coverage-list">
              <div className="coverage-card">
                <div className="icon-circle">∞</div>
                <div className="num">01</div>
                <div className="title">면적 무제한</div>
                <div className="body">
                  희망하는 모든 면적에 시술해드립니다.<span className="cov-note">*측두부 제외</span>
                </div>
              </div>
              <div className="coverage-card">
                <div className="icon-circle">✓</div>
                <div className="num">02</div>
                <div className="title">1년 무상 A/S</div>
                <div className="body">결과에 만족하지 않으시면 1년 이내 무료로 보정 시술해드립니다.</div>
              </div>
              <div className="coverage-card">
                <div className="icon-circle">🌱</div>
                <div className="num">03</div>
                <div className="title">모낭재생앰플</div>
                <div className="body">두피 환경 개선 + 실질적 탈모 개선까지 함께 갑니다.</div>
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section data-section="faq" className="block faq-section">
            <div className="block-eyebrow">FAQ</div>
            <h2>
              신청 전에
              <br />
              많이 묻는 질문.
            </h2>
            <div className="faq-list">
              {FAQS.map((item, index) => {
                const open = openFaq === index;
                return (
                  <div className={`faq-item${open ? ' open' : ''}`} key={item.q}>
                    <button
                      type="button"
                      className="faq-q"
                      aria-expanded={open}
                      onClick={() => setOpenFaq(open ? -1 : index)}
                    >
                      <span className="faq-q-mark">Q</span>
                      <span>{item.q}</span>
                      <span className="faq-chevron">{open ? '–' : '+'}</span>
                    </button>
                    {open && <div className="faq-a">{item.a}</div>}
                  </div>
                );
              })}
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section data-section="location" className="block location-section">
            <div className="block-eyebrow">LOCATION</div>
            <h2>
              도트락
              <br />
              오시는 길.
            </h2>
            <p className="sub">프라이빗 1인실.</p>
            <div className="address-list">
              <div className="address-card">
                <div className="addr-pin">📍</div>
                <div className="addr-branch">강남 본점</div>
                <div className="addr-building">라이프빌딩 4F</div>
                <div className="addr-street">서울 강남구 언주로172길 12</div>
                <div className="addr-meta">압구정역 2번출구 도보 5분</div>
              </div>
              <div className="address-card">
                <div className="addr-pin">📍</div>
                <div className="addr-branch">
                  수원점 <span className="addr-new">NEW</span>
                </div>
                <div className="addr-street">경기 수원시 팔달구 권광로188번길 44</div>
              </div>
            </div>
          </section>
        </Reveal>

        <section data-section="cta" className="cta-final">
          <h2>아직 망설이시나요?</h2>
          <p>
            1분만 투자하시면
            <br />
            <b>24시간 이내 맞춤 견적</b>을 안내해드려요.
            <br />
            시술은 강요하지 않습니다.
          </p>
          <div className="btn-stack">
            <button type="button" className="btn-primary" onClick={scrollToForm}>
              내 두피 무료 견적 받기
            </button>
            {hasPhone && (
              <a
                href={phoneTelHref(phone)}
                className="btn-secondary linkconnect-call-button"
                data-event-name="call_click"
                data-placement="cta-final"
                data-phone={phone}
                onClick={() => trackDotrak('call_click', { placement: 'cta-final' })}
              >
                전화 상담 <span className="partner-phone-text">{phoneDisplay}</span>
              </a>
            )}
          </div>
          <p className="trust-line">시술 강요 없음 · 무료 견적 · 24시간 내 연락</p>
        </section>

        <footer>
          <div className="brand">
            DOTRAK<span className="dot">·</span>SMP
          </div>
          <div className="footer-info">
            <div className="footer-price">
              무제한 두피문신 1회 <s>79만원</s> → <b>49만원</b>
            </div>
            <div className="footer-biz">상호: 도트락SMP | 대표: Aiden | 사업자등록번호: 435-06-02642</div>
            <div className="footer-biz">
              <a href={data.privacy_policy_url || '/privacy'} className="footer-link">
                개인정보처리방침
              </a>
              {' · '}본 페이지는 링크커넥트 CPA 광고용 랜딩페이지입니다.
            </div>
          </div>
          <div className="copy">© {new Date().getFullYear()} DOTRAK SMP. All rights reserved.</div>
        </footer>
      </div>

      <div className={`sticky-cta${stickyOn ? '' : ' is-hidden'}`}>
        <button type="button" className="sticky-primary" onClick={scrollToForm}>
          49만원 · 무료 견적
        </button>
      </div>
    </div>
  );
}
