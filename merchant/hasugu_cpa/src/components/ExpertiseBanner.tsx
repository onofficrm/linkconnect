import { Phone, ChevronRight } from 'lucide-react';
import CallButton from './CallButton';

export default function ExpertiseBanner() {
  const scrollToForm = () => {
    const formSection = document.getElementById('consultation-form');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-blue-600 relative overflow-hidden">
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[600px] h-[600px] bg-blue-500/50 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-[600px] h-[600px] bg-indigo-500/50 rounded-full blur-3xl opacity-60 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight word-break-keep leading-[1.3] mb-6">
          눈에 보이는 막힘보다<br />
          <span className="text-blue-200">보이지 않는 원인을 확인하는 것이 중요합니다.</span>
        </h2>
        <p className="text-blue-100 text-base sm:text-lg md:text-xl max-w-2xl mx-auto word-break-keep mb-10 font-medium">
          반복되는 막힘과 악취가 있다면 배관 내부 상태를 먼저 점검해보세요.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <CallButton
            id="process_call_btn"
            placement="process"
            className="flex justify-center items-center gap-2 bg-white hover:bg-slate-50 text-blue-700 text-lg font-bold py-4 px-8 rounded-2xl shadow-xl shadow-slate-900/10 transition-all active:scale-[0.98]"
          >
            <Phone size={22} />
            전화로 증상 상담하기
          </CallButton>
          <button
            onClick={scrollToForm}
            className="flex justify-center items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white border border-blue-500 text-lg font-bold py-4 px-8 rounded-2xl transition-all active:scale-[0.98]"
          >
            온라인 상담 접수하기
            <ChevronRight size={22} />
          </button>
        </div>
      </div>
    </section>
  );
}
