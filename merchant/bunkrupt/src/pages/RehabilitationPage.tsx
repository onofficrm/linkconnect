import { Link } from 'react-router-dom';
import { Phone, ArrowRight, CheckCircle2, AlertCircle, FileText, HelpCircle, UserCheck, MessageSquare, Scale } from 'lucide-react';

export default function RehabilitationPage() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Top Header & CTA */}
      <section className="bg-main text-white py-16 sm:py-24 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-point/10 rounded-full mix-blend-screen filter blur-3xl transform translate-x-1/3 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cta/20 rounded-full mix-blend-screen filter blur-3xl transform -translate-x-1/3 translate-y-1/2"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl font-bold mb-6">개인회생</h1>
          <p className="text-gray-300 text-[15px] sm:text-lg mb-10 leading-relaxed">
            개인회생은 일정한 소득이 있지만 채무를 감당하기 어려운 분들이 법원을 통해 채무를 조정받는 절차입니다.<br className="hidden sm:block" /> 현재 소득, 채무금액, 재산, 부양가족, 최근 대출 여부 등에 따라 가능 여부가 달라질 수 있습니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-3xl mx-auto">
            <Link to="/rehabilitation/info?tab=1" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl py-4 px-6 text-[15px] font-bold transition-colors flex items-center justify-center">
              개인회생 신청자격 확인
            </Link>
            <Link to="/consultation" className="bg-cta hover:bg-blue-700 text-white rounded-xl py-4 px-6 text-[15px] font-bold transition-colors shadow-lg flex items-center justify-center">
              무료 상담신청
            </Link>
            <a href="tel:" className="phone-only partner-phone-link bg-point text-main rounded-xl py-4 px-6 text-[15px] font-bold hover:bg-[#b59556] transition-colors flex items-center justify-center gap-2 shadow-lg">
              <Phone className="w-4 h-4" />
              <span className="partner-phone-text phone-label-only" data-phone-label="지금 전화상담하기">지금 전화상담하기</span>
            </a>
          </div>
        </div>
      </section>

      {/* 본문 섹션 1: 개인회생이 필요한 상황 */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-main mb-10 text-center">개인회생이 필요한 상황</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              "매달 이자만 갚고 원금이 줄지 않는 경우",
              "카드값과 대출금 상환이 어려운 경우",
              "연체가 시작되었거나 예상되는 경우",
              "급여압류나 통장압류가 걱정되는 경우",
              "소득은 있지만 채무를 감당하기 어려운 경우"
            ].map((text, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                <div className="bg-red-50 text-red-500 rounded-full p-2 shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <p className="text-[15px] text-gray-700 font-medium leading-relaxed mt-1">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 본문 섹션 2: 개인회생 핵심 정보 */}
      <section className="py-20 px-4 bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-main mb-10 text-center">개인회생 핵심 정보</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { title: "개인회생이란?", icon: Scale, tab: 0 },
              { title: "개인회생 신청자격", icon: UserCheck, tab: 1 },
              { title: "개인회생 준비서류", icon: FileText, tab: 2 },
              { title: "개인회생 절차", icon: ArrowRight, tab: 3 },
              { title: "개인회생 경험담", icon: MessageSquare, tab: 4 },
              { title: "개인회생 FAQ", icon: HelpCircle, tab: 5 }
            ].map((item, i) => (
              <Link 
                key={i} 
                to={`/rehabilitation/info?tab=${item.tab}`}
                className="group flex flex-col items-center justify-center p-8 rounded-2xl border border-gray-100 bg-bg hover:border-cta/30 hover:bg-blue-50/50 transition-colors text-center"
              >
                <item.icon className="w-8 h-8 text-gray-400 group-hover:text-cta mb-3 transition-colors" />
                <span className="font-bold text-[15px] text-gray-800 group-hover:text-cta transition-colors">{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 본문 섹션 3: 개인회생 상담 전 확인할 내용 */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-main mb-10 text-center">개인회생 상담 전 확인할 내용</h2>
          <div className="bg-white rounded-2xl p-8 sm:p-10 border border-gray-100 shadow-sm">
            <div className="space-y-5">
              {[
                "현재 월 소득이 있는지",
                "전체 채무금액은 어느 정도인지",
                "재산보다 채무가 많은지",
                "최근 대출이 있는지",
                "부양가족이 있는지",
                "연체 또는 압류가 진행 중인지"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-4 pb-5 border-b border-gray-50 last:border-0 last:pb-0">
                  <CheckCircle2 className="w-6 h-6 text-point shrink-0" />
                  <span className="text-[16px] font-medium text-gray-800">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 하단 CTA */}
      <section className="py-24 px-4 bg-main relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-point rounded-full mix-blend-multiply filter blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cta rounded-full mix-blend-multiply filter blur-3xl opacity-20 transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10 max-w-3xl mx-auto text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">
            개인회생 가능성, 혼자 판단하지 마세요
          </h2>
          <p className="text-gray-300 text-[15px] sm:text-lg mb-10 leading-relaxed max-w-2xl mx-auto">
            개인회생 가능 여부는 개인 상황에 따라 달라질 수 있습니다.<br className="hidden sm:block" /> 
            현재 상황을 남겨주시면 상담 가능 여부를 안내드립니다.
          </p>
          <div className="flex justify-center">
            <Link 
              to="/consultation"
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-cta px-10 py-5 text-[17px] font-bold text-white shadow-xl shadow-cta/20 transition-transform hover:bg-blue-700 active:scale-[0.98]"
            >
              무료 자격진단 신청하기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
