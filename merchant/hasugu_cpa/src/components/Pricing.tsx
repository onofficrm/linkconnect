import { Wallet, Info } from 'lucide-react';

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
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden mb-8 lg:mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {[
              { label: '기본 점검 안내', price: '현장 확인 후 안내' },
              { label: '단순막힘 안내', price: '현장 확인 후 안내' },
              { label: '고압세척 안내', price: '현장 확인 후 안내' },
            ].map((item, idx) => (
              <div key={idx} className="p-8 text-center flex flex-col items-center justify-center hover:bg-slate-50 transition-colors">
                <h3 className="text-slate-500 font-bold mb-3">{item.label}</h3>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 break-keep">
                  {item.price}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50/50 rounded-3xl p-6 sm:p-8 border border-blue-100 max-w-4xl mx-auto">
          <ul className="space-y-4">
            {[
              '배관 문제는 현장 구조와 막힘 원인에 따라 작업 방법이 달라집니다.',
              '전화상담만으로 정확한 작업비를 확정하기 어려울 수 있습니다.',
              '현장 확인 후 필요한 작업과 예상 비용을 안내합니다.',
              '고객이 동의한 작업만 진행합니다.'
            ].map((text, idx) => (
              <li key={idx} className="flex items-start gap-3">
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
