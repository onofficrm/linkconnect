import { Phone, ChevronRight } from 'lucide-react';
import CallButton from './CallButton';

export default function FinalCTA() {
  const scrollToForm = () => {
    const formSection = document.getElementById('consultation-form');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-slate-50 border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight word-break-keep mb-6">
          막힘과 역류는<br />
          <span className="text-blue-600">시간이 지나면 불편이 더 커질 수 있습니다</span>
        </h2>
        <p className="text-slate-600 text-[17px] sm:text-xl max-w-2xl mx-auto word-break-keep mb-10">
          현재 증상과 지역을 알려주시면 가능한 상담 방법과 방문 일정을 안내해드립니다.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-5">
          <CallButton
            id="footer_call_btn"
            placement="footer"
            className="flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[17px] font-bold min-h-[56px] px-8 rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98]"
            aria-label="지금 전화하기"
          >
            <Phone size={24} />
            지금 전화하기
          </CallButton>
          <button
            onClick={scrollToForm}
            id="footer_form_btn"
            data-event-name="footer_form_click"
            data-placement="footer"
            className="flex justify-center items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-[17px] font-bold min-h-[56px] px-8 rounded-2xl transition-all shadow-sm active:scale-[0.98]"
            aria-label="상담신청 폼으로 이동"
          >
            상담신청 작성하기
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </section>
  );
}
