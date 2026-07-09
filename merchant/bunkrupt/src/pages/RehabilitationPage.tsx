import { Link } from 'react-router-dom';
import { Phone, ArrowRight, CheckCircle2 } from 'lucide-react';
import TrustBadges from '../components/TrustBadges';
import Empathy from '../components/Empathy';
import AICalculator from '../components/AICalculator';
import ConsultationFAQ from '../components/ConsultationFAQ';
import ConsultationForm from '../components/ConsultationForm';
import { scrollToConsultForm } from '../lib/consultationForm';

export default function RehabilitationPage() {
  return (
    <div className="min-h-screen bg-bg">
      <section className="bg-main text-white py-16 sm:py-20 px-4 relative overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <p className="mb-4 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-point">
            개인회생 전환 랜딩
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold mb-6 leading-tight">
            개인회생 가능성,
            <br className="sm:hidden" /> 30초 만에 무료 확인
          </h1>
          <p className="text-gray-300 text-[15px] sm:text-lg mb-10 leading-relaxed max-w-2xl mx-auto">
            소득은 있지만 채무 상환이 어려운 경우, 개인회생 검토가 가능할 수 있습니다.
            먼저 무료 자격진단부터 받아보세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-xl mx-auto">
            <button
              type="button"
              onClick={() => scrollToConsultForm()}
              className="bg-cta hover:bg-blue-700 text-white rounded-xl py-4 px-6 text-[15px] font-bold transition-colors shadow-lg"
            >
              30초 무료 확인
            </button>
            <Link
              to="/rehabilitation/info?tab=1"
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl py-4 px-6 text-[15px] font-bold transition-colors flex items-center justify-center gap-2"
            >
              자세히 알아보기
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="tel:"
              className="phone-only partner-phone-link bg-point text-main rounded-xl py-4 px-6 text-[15px] font-bold hover:bg-[#b59556] transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <Phone className="w-4 h-4" />
              <span className="partner-phone-text phone-label-only" data-phone-label="전화상담">
                전화상담
              </span>
            </a>
          </div>
        </div>
      </section>

      <TrustBadges />

      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-main mb-6 text-center">3분 자격 체크</h2>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <ul className="space-y-3 mb-8">
              {[
                '현재 월 소득이 있다',
                '채무가 감당하기 어렵다',
                '연체 중이거나 예상된다',
                '압류·독촉이 걱정된다',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-[15px] text-gray-800">
                  <CheckCircle2 className="w-5 h-5 text-cta shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => scrollToConsultForm()}
              className="w-full rounded-xl bg-main py-4 text-[15px] font-bold text-white hover:bg-gray-800"
            >
              해당됩니다 · 무료 진단 받기
            </button>
          </div>
        </div>
      </section>

      <Empathy />
      <AICalculator />
      <ConsultationFAQ />
      <ConsultationForm />
    </div>
  );
}
