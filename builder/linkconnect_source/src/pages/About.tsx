import { ArrowUpRight, BadgeDollarSign, Link2, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const coreValues = [
  {
    icon: <Sparkles className="w-7 h-7 text-emerald-400" />,
    title: '누구나 쉽고 빠르게, 더 많은 수익 창출',
    desc: '제휴 마케팅은 어려워서는 안 됩니다. 복잡한 과정 없이 누구나 트렌디한 캠페인을 선택하고 홍보할 수 있는 최적의 환경을 제공합니다. 검증된 노하우와 압도적인 수익 시스템으로 마케터분들이 들인 노력 그 이상의 가치와 높은 수익을 빠르게 가져가실 수 있도록 전폭적으로 지원합니다.',
  },
  {
    icon: <ShieldCheck className="w-7 h-7 text-cyan-400" />,
    title: '투명하고 정교한 실시간 트래킹 & 어뷰징 관리',
    desc: '단 한 건의 전환도 놓치지 않는 고도화된 성과 추적 시스템을 제공합니다. 링크 클릭부터 최종 구매 및 행동 전환(CPA/CPS)까지 모든 데이터를 실시간 대시보드로 직관적이고 투명하게 공개합니다. 24시간 철저한 모니터링으로 허위 실적(어뷰징)을 원천 차단하여, 광고주가 안심하고 마케팅 예산을 집행할 수 있는 깨끗한 생태계를 만듭니다.',
  },
  {
    icon: <BadgeDollarSign className="w-7 h-7 text-amber-400" />,
    title: '지연 없는 정산과 신뢰 기반의 상생 파트너십',
    desc: '제휴 마케팅의 생명은 상호 간의 신뢰입니다. 마케터들의 땀방울이 지연 없이 보상받을 수 있도록 국내 최고 수준의 신속하고 확실한 정산 시스템을 약속합니다. 광고주에게는 마케팅 ROI를 극대화할 수 있는 양질의 진성 트래픽을, 마케터에게는 업계 최고 수준의 커미션을 보장하며 동반 성장의 가치를 실현합니다.',
  },
];

const highlights = [
  { value: '300억+', label: '연간 견인 매출', sub: '자체 운영 노하우' },
  { value: 'CPA/CPS', label: '성과형 네트워크', sub: 'CPS · CPA 전문' },
  { value: '실시간', label: '성과 추적', sub: '투명한 데이터' },
  { value: 'Win-Win', label: '상생 파트너십', sub: '광고주 · 파트너' },
];

export function About() {
  return (
    <main>
      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950 to-slate-950" />
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="max-w-4xl mx-auto relative text-center">
          <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-cyan-400 text-sm font-medium mb-8">
            <Link2 className="w-4 h-4" />
            About LinkConnect
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            가치를 연결하고,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              성과로 증명
            </span>
            하다.
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            대한민국 성과 중심 제휴 마케팅 플랫폼, 링크커넥트(LinkConnect)입니다.
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto space-y-6 text-slate-600 leading-relaxed text-base md:text-lg">
          <p>
            해외에서는 이미 수십 조원 규모로 거대하게 성장한 <strong className="text-slate-900 font-semibold">어필리에이트(Affiliate) 마케팅</strong> 시장.
            반면, 국내 성과형 마케팅 시장은 여전히 무궁무진한 잠재력을 품고 있습니다.
            이 블루오션 속에서 링크커넥트는 자체적으로 <strong className="text-emerald-600 font-semibold">연간 300억 원 이상</strong>의 견인 매출을 달성하며 쌓아온
            독보적인 노하우를 바탕으로, 국내 제휴 마케팅 시장의 새로운 기준을 제시하고자 합니다.
          </p>
          <p>
            링크커넥트는 비즈니스의 폭발적인 성장을 원하는 <strong className="text-slate-900 font-semibold">광고주</strong>와,
            자신의 영향력을 실질적인 수익으로 전환하여 쉽고 빠르게 더 많은 수익을 올리고 싶은{' '}
            <strong className="text-slate-900 font-semibold">파트너</strong>(마케터, 인플루언서, 블로거, N잡러)를
            가장 효율적으로 연결하는 <strong className="text-slate-900 font-semibold">CPS/CPA 전문 네트워크</strong>입니다.
          </p>
          <p>
            광고주와 마케터 모두가 확실하게 <strong className="text-cyan-600 font-semibold">윈-윈(Win-Win)</strong>할 수 있도록,
            링크커넥트가 가장 앞장서서 함께하겠습니다.
          </p>
        </div>
      </section>

      {/* Stats strip */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {highlights.map((item) => (
            <div key={item.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">{item.value}</div>
              <div className="text-sm font-semibold text-emerald-600">{item.label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{item.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 3 core values */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              링크커넥트가 약속하는 <span className="text-emerald-500">3가지 핵심 가치</span>
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              연결부터 정산까지, 성과 중심 제휴 마케팅의 새로운 기준
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {coreValues.map((item, i) => (
              <article
                key={item.title}
                className="relative bg-slate-50 border border-slate-100 rounded-2xl p-8 hover:border-emerald-200 hover:shadow-lg transition-all"
              >
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-emerald-500 text-white text-sm font-bold flex items-center justify-center shadow-md">
                  {i + 1}
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center mb-6">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 leading-snug">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/30 via-slate-950 to-cyan-950/20" />
        <div className="max-w-4xl mx-auto relative text-center">
          <TrendingUp className="w-12 h-12 text-emerald-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
            연결이 곧 수익이 되는 곳,
            <br />
            <span className="text-emerald-400">링크커넥트</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto mb-10">
            연간 300억 매출 견인의 저력, 그리고 투명한 데이터와 강력한 네트워크를 자랑하는 링크커넥트가
            여러분의 비즈니스와 파이프라인을 다음 단계로 도약시켜 드립니다.
            성공으로 가는 길, 링크커넥트가 여러분의 가장 든든한 파트너가 되겠습니다.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/partner"
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl flex items-center gap-2 transition-colors"
            >
              파트너로 시작하기
              <ArrowUpRight className="w-5 h-5" />
            </Link>
            <Link
              to="/advertiser"
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl border border-white/10 transition-colors"
            >
              광고주 입점 문의
            </Link>
            <Link
              to="/cpa-list"
              className="px-8 py-4 text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              CPA 캠페인 보기
            </Link>
            <Link
              to="/affiliate"
              className="px-8 py-4 text-slate-400 hover:text-white font-medium transition-colors"
            >
              제휴 마케팅이란?
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
