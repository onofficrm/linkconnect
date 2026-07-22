import { MapPin, Navigation, Clock, CheckCircle, Phone, ChevronRight, AlertTriangle } from 'lucide-react';
import CallButton from './CallButton';

const AREA_GROUPS = [
  {
    region: '서울',
    districts: ['강남·서초', '송파·강동', '마포·용산', '영등포·구로', '노원·도봉', '그 외 자치구'],
  },
  {
    region: '인천',
    districts: ['연수·송도', '남동·논현', '부평·계양', '서구·검단', '중·동·미추홀'],
  },
  {
    region: '경기',
    districts: ['수원·용인', '성남·분당', '부천·광명', '고양·파주', '안양·군포', '김포·하남'],
  },
];

export default function ServiceAreas() {
  const scrollToForm = () => {
    document.getElementById('consultation-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-16 sm:py-24 bg-white relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight word-break-keep leading-tight mb-4">
            지역과 기사 일정을 확인해<br />
            <span className="text-blue-600">방문 가능 시간을 안내합니다</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg word-break-keep">
            서울·인천·경기 주요 권역 출동 가능 · 접수 후 담당 기사 일정 확인
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 mb-8">
          {AREA_GROUPS.map((group) => (
            <div
              key={group.region}
              className="bg-slate-50 rounded-[1.75rem] p-5 sm:p-6 border border-slate-100"
            >
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={18} className="text-blue-600" />
                <h3 className="text-lg font-extrabold text-slate-900">{group.region}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {group.districts.map((d) => (
                  <span
                    key={d}
                    className="bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-lg"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-20">
          <div className="bg-slate-50 rounded-[2rem] p-6 sm:p-8 border border-slate-100 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                <Clock size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">연락·방문 안내</h3>
            </div>
            <ul className="space-y-4 mb-6">
              {[
                { icon: Navigation, text: '지역별 담당 기사 확인' },
                { icon: Clock, text: '영업시간 기준 평균 10분 이내 연락 목표' },
                { icon: CheckCircle, text: '주택·빌라·아파트·상가 현장 상담 가능' },
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-4">
                  <div className="bg-white p-3 rounded-full text-blue-500 shadow-sm border border-slate-100 shrink-0">
                    <item.icon size={22} />
                  </div>
                  <span className="text-slate-800 font-bold sm:text-lg break-keep leading-tight">
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex items-start gap-3 p-4 sm:p-5 bg-orange-50 rounded-2xl border border-orange-100 mt-auto">
              <AlertTriangle size={22} className="text-orange-500 shrink-0" />
              <p className="text-sm sm:text-base font-bold text-orange-800 word-break-keep leading-tight">
                접수 지역과 현장 기사 일정에 따라 방문 가능 시간이 달라질 수 있습니다.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 sm:p-10 text-center shadow-2xl relative overflow-hidden flex flex-col justify-center">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-6 sm:mb-8 word-break-keep">
                현재 지역의 방문 가능 시간을 확인해보세요
              </h3>
              <div className="flex flex-col gap-3 sm:gap-4">
                <CallButton
                  id="area_call_btn"
                  placement="service_area"
                  className="flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-lg font-bold py-4 px-8 rounded-2xl transition-all shadow-lg shadow-blue-900/50 active:scale-[0.98]"
                >
                  <Phone size={22} />
                  전화로 확인하기
                </CallButton>
                <button
                  type="button"
                  onClick={scrollToForm}
                  className="flex justify-center items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-lg font-bold py-4 px-8 rounded-2xl transition-all active:scale-[0.98]"
                >
                  상담신청 남기기
                  <ChevronRight size={22} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
