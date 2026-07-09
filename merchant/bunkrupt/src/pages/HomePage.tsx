import { Link, useNavigate } from 'react-router-dom';
import { Phone, ArrowRight, TrendingUp } from 'lucide-react';
import { scrollToConsultForm } from '../lib/consultationForm';

export default function HomePage() {
  const navigate = useNavigate();

  const goConsultation = () => {
    navigate('/consultation');
    scrollToConsultForm();
  };

  return (
    <div className="min-h-screen bg-bg">
      <section className="relative overflow-hidden bg-main text-white py-20 sm:py-28 px-4">
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-point">
            <TrendingUp className="w-4 h-4" /> 개인회생 무료 자격진단
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold mb-6 leading-tight">
            3분 만에 내 개인회생
            <br className="sm:hidden" /> 가능성 무료 확인
          </h1>
          <p className="text-gray-300 text-[16px] sm:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            채무·소득·연체 상황을 남기면 담당자가 가능 여부를 순차적으로 안내해드립니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-xl mx-auto">
            <button
              type="button"
              onClick={goConsultation}
              className="inline-flex items-center justify-center rounded-xl bg-cta px-8 py-5 text-[17px] font-bold text-white shadow-xl transition-transform hover:bg-blue-700 active:scale-[0.98]"
            >
              30초 무료 확인
            </button>
            <a
              href="tel:"
              className="phone-only partner-phone-link inline-flex items-center justify-center gap-2 rounded-xl bg-point px-8 py-5 text-[17px] font-bold text-main hover:bg-[#b59556] transition-colors"
            >
              <Phone className="w-5 h-5" />
              <span className="partner-phone-text phone-label-only" data-phone-label="전화상담">
                전화상담
              </span>
            </a>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-main mb-4">개인회생 상담이 필요하신가요?</h2>
          <p className="text-gray-600 mb-8">
            상세 정보는 상담 페이지에서 확인하고, 바로 무료 자격진단을 신청할 수 있습니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/consultation"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-main px-6 py-4 text-[15px] font-bold text-white"
            >
              무료 상담 페이지로
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/rehabilitation/info"
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-4 text-[15px] font-bold text-gray-700"
            >
              개인회생 정보
            </Link>
            <Link
              to="/bankruptcy"
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-4 text-[15px] font-bold text-gray-700"
            >
              개인파산 정보
            </Link>
            <Link
              to="/debt-collection"
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-4 text-[15px] font-bold text-gray-700"
            >
              채권추심정보
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
