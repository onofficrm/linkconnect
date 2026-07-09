import { Link } from 'react-router-dom';
import { Phone, ArrowRight, ShieldCheck, Scale, AlertOctagon, ChevronRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-main text-white py-20 sm:py-32 px-4">
        <div className="absolute top-0 right-0 w-96 h-96 bg-point/10 rounded-full mix-blend-screen filter blur-3xl transform translate-x-1/3 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cta/20 rounded-full mix-blend-screen filter blur-3xl transform -translate-x-1/3 translate-y-1/2"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight tracking-tight">
            개인회생·개인파산,<br className="sm:hidden" /> 내 상황에 맞는 제도부터 확인하세요
          </h1>
          <p className="text-gray-300 text-[16px] sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            채무 상황은 사람마다 다릅니다. 개인회생, 개인파산, 채권추심 대처방법을 확인하고 현재 상황에 맞는 상담을 받아보세요.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-3xl mx-auto mb-8">
            <Link to="/rehabilitation" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl py-4 px-6 text-[15px] sm:text-base font-bold transition-colors flex items-center justify-center gap-2 backdrop-blur-sm">
              개인회생 가능성 확인
            </Link>
            <Link to="/bankruptcy" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl py-4 px-6 text-[15px] sm:text-base font-bold transition-colors flex items-center justify-center gap-2 backdrop-blur-sm">
              개인파산 상담 알아보기
            </Link>
            <Link to="/debt-collection" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl py-4 px-6 text-[15px] sm:text-base font-bold transition-colors flex items-center justify-center gap-2 backdrop-blur-sm">
              채권추심 대처방법 보기
            </Link>
          </div>

          <div className="phone-only partner-phone-section">
            <a href="tel:" className="partner-phone-link inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-point text-main rounded-xl py-4 sm:py-5 px-8 font-bold text-[17px] sm:text-lg hover:bg-[#b59556] transition-colors shadow-lg">
              <Phone className="w-5 h-5" />
              지금 전화상담하기{' '}
              <span className="partner-phone-text ml-1 opacity-80 text-[14px] sm:text-[15px] font-normal" />
            </a>
          </div>
        </div>
      </section>

      {/* 3 Category Cards */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="group rounded-2xl bg-white p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-cta">
                <Scale className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-main mb-3">개인회생</h3>
              <p className="text-gray-600 text-[15px] leading-relaxed mb-8">
                일정한 소득이 있지만 채무 상환이 어려운 경우 검토할 수 있는 제도입니다.
              </p>
              <Link to="/rehabilitation" className="inline-flex items-center text-[15px] font-bold text-cta hover:text-blue-700 transition-colors">
                개인회생 알아보기
                <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Card 2 */}
            <div className="group rounded-2xl bg-white p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-main mb-3">개인파산</h3>
              <p className="text-gray-600 text-[15px] leading-relaxed mb-8">
                모든 채무를 변제하기 어려운 재정상태에서 파산 및 면책을 검토할 수 있습니다.
              </p>
              <Link to="/bankruptcy" className="inline-flex items-center text-[15px] font-bold text-orange-600 hover:text-orange-700 transition-colors">
                개인파산 알아보기
                <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Card 3 */}
            <div className="group rounded-2xl bg-white p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <AlertOctagon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-main mb-3">채권추심정보</h3>
              <p className="text-gray-600 text-[15px] leading-relaxed mb-8">
                독촉전화, 지급명령, 압류 등 채권추심 상황별 대처방법을 확인할 수 있습니다.
              </p>
              <Link to="/debt-collection" className="inline-flex items-center text-[15px] font-bold text-red-600 hover:text-red-700 transition-colors">
                채권추심 대처방법 보기
                <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-20 px-4 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-main">많이 찾는 정보</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/rehabilitation/info?tab=1" className="flex items-center justify-between p-5 rounded-xl border border-gray-100 bg-bg hover:border-cta/30 hover:bg-blue-50/50 transition-colors group">
              <span className="font-medium text-[15px] text-gray-800 group-hover:text-cta">개인회생 신청자격</span>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-cta" />
            </Link>
            <Link to="/rehabilitation/info?tab=2" className="flex items-center justify-between p-5 rounded-xl border border-gray-100 bg-bg hover:border-cta/30 hover:bg-blue-50/50 transition-colors group">
              <span className="font-medium text-[15px] text-gray-800 group-hover:text-cta">개인회생 준비서류</span>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-cta" />
            </Link>
            <Link to="/rehabilitation/info?tab=3" className="flex items-center justify-between p-5 rounded-xl border border-gray-100 bg-bg hover:border-cta/30 hover:bg-blue-50/50 transition-colors group">
              <span className="font-medium text-[15px] text-gray-800 group-hover:text-cta">개인회생 절차</span>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-cta" />
            </Link>
            
            <Link to="/bankruptcy?tab=1" className="flex items-center justify-between p-5 rounded-xl border border-gray-100 bg-bg hover:border-orange-500/30 hover:bg-orange-50/50 transition-colors group">
              <span className="font-medium text-[15px] text-gray-800 group-hover:text-orange-600">개인파산 신청자격</span>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-orange-600" />
            </Link>
            <Link to="/bankruptcy?tab=2" className="flex items-center justify-between p-5 rounded-xl border border-gray-100 bg-bg hover:border-orange-500/30 hover:bg-orange-50/50 transition-colors group">
              <span className="font-medium text-[15px] text-gray-800 group-hover:text-orange-600">개인파산 준비서류</span>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-orange-600" />
            </Link>
            <Link to="/bankruptcy?tab=3" className="flex items-center justify-between p-5 rounded-xl border border-gray-100 bg-bg hover:border-orange-500/30 hover:bg-orange-50/50 transition-colors group">
              <span className="font-medium text-[15px] text-gray-800 group-hover:text-orange-600">개인파산 절차</span>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-orange-600" />
            </Link>

            <Link to="/debt-collection?tab=1" className="flex items-center justify-between p-5 rounded-xl border border-gray-100 bg-bg hover:border-red-500/30 hover:bg-red-50/50 transition-colors group">
              <span className="font-medium text-[15px] text-gray-800 group-hover:text-red-600">불법 채권추심 대처</span>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
            </Link>
            <Link to="/debt-collection?tab=4" className="flex items-center justify-between p-5 rounded-xl border border-gray-100 bg-bg hover:border-red-500/30 hover:bg-red-50/50 transition-colors group">
              <span className="font-medium text-[15px] text-gray-800 group-hover:text-red-600">급여압류·통장압류 대처</span>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="py-24 px-4 bg-main relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-point rounded-full mix-blend-multiply filter blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cta rounded-full mix-blend-multiply filter blur-3xl opacity-20 transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10 max-w-3xl mx-auto text-center text-white">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">
            내 상황이 개인회생 또는 개인파산에<br className="hidden sm:block" /> 해당하는지 궁금하다면?
          </h2>
          <p className="text-gray-300 text-[15px] sm:text-lg mb-10 leading-relaxed max-w-2xl mx-auto">
            채무금액, 소득, 재산, 연체 여부에 따라 가능한 방향이 달라질 수 있습니다.<br className="hidden sm:block" /> 상담신청을 남겨주시면 순차적으로 확인 후 안내드립니다.
          </p>
          <Link 
            to="/consultation"
            className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-cta px-10 py-5 text-[17px] font-bold text-white shadow-xl shadow-cta/20 transition-transform hover:bg-blue-700 active:scale-[0.98]"
          >
            무료 상담신청하기
          </Link>
        </div>
      </section>
    </div>
  );
}
