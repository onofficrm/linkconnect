import { MapPin, Navigation, Clock, CheckCircle, Phone, ChevronRight, AlertTriangle } from 'lucide-react';
import CallButton from './CallButton';

export default function ServiceAreas() {
  const scrollToForm = () => {
    const formSection = document.getElementById('consultation-form');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const serviceAreas = '서울 · 인천 · 경기도';
  const arrivalTime: string | null = null;

  return (
    <section className="py-16 sm:py-24 bg-white relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight word-break-keep leading-tight mb-4">
            지역과 기사 일정을 확인해<br />
            <span className="text-blue-600">방문 가능 시간을 안내합니다</span>
          </h2>
        </div>

        {/* Service Area Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-20">
          {/* Areas Display */}
          <div className="bg-slate-50 rounded-[2rem] p-6 sm:p-8 border border-slate-100 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                <MapPin size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">출동 가능 지역</h3>
            </div>
            <div className="flex flex-wrap gap-2.5 mb-8">
              {serviceAreas?.split(/[,·]/).map((area, idx) => (
                <span key={idx} className="bg-white border border-slate-200 text-slate-800 px-5 py-2.5 rounded-xl font-bold shadow-sm">
                  {area.trim()}
                </span>
              ))}
            </div>
            <div className="flex items-start gap-3 p-4 sm:p-5 bg-orange-50 rounded-2xl border border-orange-100 mt-auto">
              <AlertTriangle size={24} className="text-orange-500 shrink-0" />
              <p className="text-sm sm:text-base font-bold text-orange-800 word-break-keep leading-tight">
                접수 지역과 현장 기사 일정에 따라 방문 가능 시간이 달라질 수 있습니다.
              </p>
            </div>
          </div>

          {/* Details List */}
          <div className="bg-slate-50 rounded-[2rem] p-6 sm:p-8 border border-slate-100 h-full flex flex-col justify-center">
            <ul className="space-y-6">
              {[
                { icon: Navigation, text: '지역별 담당 기사 확인' },
                { icon: Clock, text: '상담 접수 후 방문 가능 시간 안내' },
                { icon: CheckCircle, text: '주택, 빌라, 아파트, 상가 현장 상담 가능' },
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-4">
                  <div className="bg-white p-3 rounded-full text-blue-500 shadow-sm border border-slate-100 shrink-0">
                    <item.icon size={24} />
                  </div>
                  <span className="text-slate-800 font-bold sm:text-lg break-keep leading-tight">{item.text}</span>
                </li>
              ))}
              {arrivalTime && (
                <li className="flex items-center gap-4 pt-4 mt-4 border-t border-slate-200">
                   <div className="bg-blue-600 p-3 rounded-full text-white shadow-sm shrink-0">
                    <Clock size={24} />
                  </div>
                  <span className="text-blue-700 font-black sm:text-lg break-keep">{arrivalTime}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Middle CTA */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 sm:p-14 text-center shadow-2xl relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-8 sm:mb-10 word-break-keep">
              현재 지역의 방문 가능 시간을 확인해보세요
            </h3>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-5">
              <CallButton
                id="area_call_btn"
                placement="service_area"
                className="flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-lg font-bold py-4 sm:py-5 px-8 rounded-2xl transition-all shadow-lg shadow-blue-900/50 active:scale-[0.98]"
              >
                <Phone size={24} />
                전화로 확인하기
              </CallButton>
              <button
                onClick={scrollToForm}
                className="flex justify-center items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-lg font-bold py-4 sm:py-5 px-8 rounded-2xl transition-all active:scale-[0.98]"
              >
                상담신청 남기기
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
