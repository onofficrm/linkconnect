import { ArrowRight, Headphones, PhoneCall, Route, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HomeSectionAnchor } from './HomeSectionAnchor';

const SAMPLE_NUMBER = '0503-6982-0000';

const steps = [
  {
    icon: <PhoneCall className="w-5 h-5 text-violet-600" />,
    title: '파트너별 단독 번호',
    desc: '파트너마다 고유 0503 가상번호를 발급해 홍보 채널에 노출합니다.',
  },
  {
    icon: <Route className="w-5 h-5 text-violet-600" />,
    title: '전화 문의 자동 매칭',
    desc: '고객이 전화하면 번호 기준으로 파트너·광고주 캠페인에 자동 연결됩니다.',
  },
  {
    icon: <TrendingUp className="w-5 h-5 text-violet-600" />,
    title: 'CPA 수익 극대화',
    desc: '신청폼 이탈 고객도 전화 DB로 전환해 CPA 성과를 한 단계 끌어올립니다.',
  },
];

export function CallDbIntro() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-violet-50/80 via-white to-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto">
        <HomeSectionAnchor id="call-db" />
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 border border-violet-200 text-violet-700 text-sm font-bold mb-4">
            <Headphones size={16} />
            콜디비 (Call DB)
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            전화 문의까지 <span className="text-violet-600">수익으로 연결</span>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
            링크커넥트는 파트너에게 <b>단독 0503 가상번호</b>를 발급합니다.
            관리자가 통화내역 엑셀을 업로드하면, 고객 전화 문의도 성과로 추적되어 CPA DB 전환을 극대화할 수 있습니다.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-12">
          <div className="relative rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-600 to-indigo-700 p-8 md:p-10 text-white shadow-xl overflow-hidden">
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" aria-hidden />
            <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-cyan-400/20 rounded-full blur-xl" aria-hidden />
            <p className="text-violet-200 text-sm font-semibold mb-2">파트너 전용 가상번호 예시</p>
            <p className="text-3xl md:text-4xl font-bold tracking-wide tabular-nums mb-3">{SAMPLE_NUMBER}</p>
            <p className="text-violet-100/90 text-sm leading-relaxed">
              파트너마다 고유 번호가 발급됩니다. 블로그·SNS·유튜브 등 홍보 채널에 이 번호를 노출하면,
              전화 문의도 내 성과로 집계됩니다.
            </p>
          </div>

          <div className="space-y-4">
            {steps.map((step) => (
              <article
                key={step.title}
                className="flex gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-violet-200 hover:shadow-md transition-all"
              >
                <div className="w-11 h-11 shrink-0 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center">
                  {step.icon}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{step.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/partner/call"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-violet-600 hover:bg-violet-700 text-white font-bold shadow-sm transition-colors"
          >
            파트너 콜디비 시작하기
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/about#call-db"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-violet-200 text-violet-700 hover:bg-violet-50 font-bold bg-white transition-colors"
          >
            콜디비 자세히 보기
          </Link>
        </div>
      </div>
    </section>
  );
}
