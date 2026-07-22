import { Phone, ChevronRight, MessageCircle, Clock } from 'lucide-react';
import CallButton from './CallButton';
import { usePartnerContext } from '../context/PartnerContext';

export default function FinalCTA() {
  const { data, hasPhone } = usePartnerContext();

  const scrollToForm = () => {
    document.getElementById('consultation-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKakao = () => {
    if (data.kakao_chat_url) {
      window.open(data.kakao_chat_url, '_blank', 'noopener,noreferrer');
      return;
    }
    window.dispatchEvent(
      new CustomEvent('hasugu:prefill-symptom', {
        detail: { message: '카카오톡으로 상담 희망' },
      }),
    );
    scrollToForm();
  };

  return (
    <section className="py-16 sm:py-24 bg-slate-50 border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight word-break-keep mb-6">
          막힘과 역류는<br />
          <span className="text-blue-600">시간이 지나면 불편이 더 커질 수 있습니다</span>
        </h2>
        <p className="text-slate-600 text-[17px] sm:text-xl max-w-2xl mx-auto word-break-keep mb-4">
          현재 증상과 지역을 알려주시면 가능한 상담 방법과 방문 일정을 안내해드립니다.
        </p>
        <p className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 bg-blue-50 border border-blue-100 px-4 py-2 rounded-full mb-10">
          <Clock size={16} />
          영업시간 기준 평균 10분 이내 연락 목표
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={scrollToForm}
            id="footer_form_btn"
            data-event-name="footer_form_click"
            data-placement="footer"
            className="flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[17px] font-bold min-h-[56px] px-8 rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98]"
          >
            상담신청 작성하기
            <ChevronRight size={22} />
          </button>
          {hasPhone ? (
            <CallButton
              id="footer_call_btn"
              placement="footer"
              className="flex justify-center items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-[17px] font-bold min-h-[56px] px-8 rounded-2xl transition-all shadow-sm active:scale-[0.98]"
            >
              <Phone size={22} />
              지금 전화하기
            </CallButton>
          ) : null}
          <button
            type="button"
            onClick={handleKakao}
            className="flex justify-center items-center gap-2 bg-[#FEE500] hover:bg-[#f5dc00] text-[#191919] text-[17px] font-bold min-h-[56px] px-8 rounded-2xl transition-all active:scale-[0.98]"
          >
            <MessageCircle size={22} />
            카카오 상담
          </button>
        </div>
      </div>
    </section>
  );
}
