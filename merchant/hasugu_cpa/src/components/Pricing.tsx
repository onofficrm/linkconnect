import { Wallet, Info, Shield, Clock } from 'lucide-react';

const PRICE_BANDS = [
  {
    label: '단순막힘',
    range: '5만~15만',
    hint: '싱크대·세면대·변기 등 단일 구간',
  },
  {
    label: '내시경 점검',
    range: '3만~8만',
    hint: '막힘 위치·내부 상태 확인',
  },
  {
    label: '고압세척',
    range: '15만~40만',
    hint: '기름때·스케일·장거리 배관',
  },
];

export default function Pricing() {
  return (
    <section className="py-16 sm:py-24 bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center justify-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
            <Wallet size={18} />
            <span>투명한 비용 안내</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight word-break-keep">
            작업 전 안내받고<br className="sm:hidden" />
            <span className="text-blue-600"> 결정할 수 있습니다</span>
          </h2>
          <p className="mt-4 text-slate-600 text-base sm:text-lg max-w-2xl mx-auto word-break-keep">
            아래는 이해를 돕는 <strong className="font-bold text-slate-800">예상 가이드</strong>이며,
            확정 비용은 현장 확인 후 안내합니다.
          </p>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden mb-6 lg:mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {PRICE_BANDS.map((item) => (
              <div
                key={item.label}
                className="p-7 sm:p-8 text-center flex flex-col items-center justify-center hover:bg-slate-50 transition-colors"
              >
                <h3 className="text-slate-500 font-bold mb-2">{item.label}</h3>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 break-keep">
                  {item.range}
                  <span className="text-base font-bold text-slate-500 ml-1">원대</span>
                </div>
                <p className="mt-2 text-sm text-slate-500 font-medium word-break-keep">{item.hint}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="flex items-start gap-3 bg-white border border-slate-200 rounded-2xl p-5">
            <Clock size={22} className="text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 mb-1">접수 후 빠른 연락</p>
              <p className="text-sm text-slate-600 word-break-keep leading-relaxed">
                상담 접수 시 <strong className="text-slate-800">영업시간 기준 평균 10분 이내</strong> 연락을
                목표로 안내합니다. (야간·주말은 순차 안내)
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-white border border-slate-200 rounded-2xl p-5">
            <Shield size={22} className="text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 mb-1">동일 구간 재방문 안내</p>
              <p className="text-sm text-slate-600 word-break-keep leading-relaxed">
                협의된 동일 작업 구간에서 <strong className="text-slate-800">7일 이내 동일 증상</strong>이
                재발하면 재점검 여부를 안내합니다. (현장 구조·사용 환경에 따라 달라질 수 있음)
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50/50 rounded-3xl p-6 sm:p-8 border border-blue-100 max-w-4xl mx-auto">
          <ul className="space-y-4">
            {[
              '배관 문제는 현장 구조와 막힘 원인에 따라 작업 방법이 달라집니다.',
              '전화상담만으로 정확한 작업비를 확정하기 어려울 수 있습니다.',
              '현장 확인 후 필요한 작업과 예상 비용을 안내합니다.',
              '고객이 동의한 작업만 진행합니다.',
            ].map((text) => (
              <li key={text} className="flex items-start gap-3">
                <Info size={20} className="text-blue-600 shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm sm:text-base font-medium word-break-keep leading-relaxed">
                  {text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
