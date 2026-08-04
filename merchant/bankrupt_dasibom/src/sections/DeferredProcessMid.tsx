import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Calculator,
  Compass,
  FileText,
  Info,
  MessageSquare,
  ShieldCheck,
  Smartphone,
  Sprout,
  ThumbsUp,
  User,
  Wallet,
} from 'lucide-react';

export default function DeferredProcessMid() {
  return (
    <>
        {/* Roadmap Section */}
        <section id="process" className="bg-white border border-slate-200 rounded-3xl p-8 lg:p-12 shadow-xl shadow-slate-200/50 mt-4 md:mt-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">상담부터 재정회복까지, 이렇게 진행됩니다</h2>
          </div>
          
          <div className="relative">
            {/* Desktop Line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
            {/* Mobile Line */}
            <div className="md:hidden absolute top-0 left-6 h-full w-0.5 bg-slate-100 z-0"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6 relative z-10">
              {[
                { title: '현재 채무상황 확인', icon: Calculator },
                { title: '소득·재산·부양가족 확인', icon: Wallet },
                { title: '개인회생 또는 개인파산 방향 안내', icon: Compass },
                { title: '필요서류 준비', icon: FileText },
                { title: '신청 및 관련 절차 진행', icon: Building2 },
                { title: '채무조정 후 새로운 생활 준비', icon: Sprout },
              ].map((step, idx) => (
                <div key={idx} className="flex md:flex-col items-center gap-4 md:gap-3 text-left md:text-center relative">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0 relative">
                    <step.icon className="w-6 h-6" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[11px] font-bold">
                      {idx + 1}
                    </div>
                  </div>
                  <p className="text-sm font-bold text-slate-800 leading-snug">{step.title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-8">
          {/* Pre-consultation Checklist */}
          <section className="bg-slate-900 rounded-3xl p-8 lg:p-10 shadow-xl text-white flex flex-col">
            <h3 className="text-2xl font-extrabold mb-6 tracking-tight">상담 전에 확인하면 좋은 내용</h3>
            <div className="flex flex-wrap gap-3 mb-8">
              {[
                "월평균 소득", "전체 채무금액", "보유 재산", "부양가족 수", 
                "채무 발생 원인", "현재 연체 여부", "압류 또는 독촉 여부"
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-800 border border-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-200">
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-auto bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <p className="text-sm font-bold text-teal-400 flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" />
                정확한 금액을 모르더라도 대략적인 내용만으로 상담을 시작할 수 있습니다.
              </p>
            </div>
          </section>

          {/* Trust Elements */}
          <section className="bg-white border border-slate-200 rounded-3xl p-8 lg:p-10 shadow-xl shadow-slate-200/50">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full content-center">
              {[
                { title: '상담내용 비공개', icon: ShieldCheck, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' },
                { title: '개인별 상황에 맞춘 상담', icon: User, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
                { title: '복잡한 절차를 쉽게 설명', icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                { title: '전화 및 온라인 상담 가능', icon: Smartphone, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
                { title: '진행 전 충분한 안내', icon: Info, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                { title: '무리한 신청 권유 없음', icon: ThumbsUp, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
              ].map((trust, idx) => (
                <div key={idx} className="flex flex-row items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left hover:border-slate-300 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${trust.bg} ${trust.color} border ${trust.border}`}>
                    <trust.icon className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">{trust.title}</p>
                </div>
              ))}
             </div>
          </section>
        </div>

        {/* Delay Risks */}
        <section className="bg-white border border-slate-200 rounded-3xl p-8 lg:p-12 shadow-xl shadow-slate-200/50 mt-4 md:mt-8 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50 text-orange-600 text-xs font-bold border border-orange-100">
              <AlertTriangle className="w-4 h-4" />
              주의사항
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              채무 문제는 시간이 지나면<br/>더 복잡해질 수 있습니다
            </h2>
            <ul className="space-y-3">
              {[
                "연체이자와 지연손해금이 늘어날 수 있습니다.",
                "독촉 연락이 계속될 수 있습니다.",
                "급여, 통장 또는 재산에 대한 절차가 진행될 수 있습니다.",
                "돌려막기로 전체 채무가 증가할 수 있습니다.",
                "가족과 일상생활에 부담이 커질 수 있습니다."
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-slate-700 font-medium">
                  <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 text-slate-400 text-xs font-bold">{idx + 1}</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex-1 bg-slate-50 rounded-3xl p-8 border border-slate-100 text-center w-full">
            <p className="text-lg font-extrabold text-slate-900 leading-relaxed mb-6">
              지금 당장 결정하지 않아도 됩니다.<br/>
              <span className="text-teal-600">먼저 현재 상황에서 가능한 방법이 있는지 확인해 보세요.</span>
            </p>
            <a href="#consultation-form" className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-4 rounded-xl text-base transition-all shadow-lg inline-flex items-center gap-2 w-full justify-center">
              해결 방법 확인하기
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </section>

    </>
  );
}
