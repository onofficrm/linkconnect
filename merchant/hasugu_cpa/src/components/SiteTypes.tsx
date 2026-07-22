import { Home, Building, Coffee, Briefcase, CheckCircle2 } from 'lucide-react';

const SITE_TYPES = [
  {
    icon: Home,
    title: '일반 가정집',
    issues: ['화장실 배수 지연', '싱크대 막힘', '세면대 물빠짐 불량'],
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  {
    icon: Building,
    title: '아파트·빌라',
    issues: ['공용배관 문제', '화장실 바닥 역류', '세탁실 배수불량'],
    color: 'text-indigo-500',
    bg: 'bg-indigo-50',
  },
  {
    icon: Coffee,
    title: '음식점·카페',
    issues: ['기름때 축적', '주방 싱크대 배수불량', '바닥 배수구 역류'],
    color: 'text-orange-500',
    bg: 'bg-orange-50',
  },
  {
    icon: Briefcase,
    title: '사무실·상가',
    issues: ['화장실 변기 막힘', '소변기 막힘', '탕비실 배수 문제'],
    color: 'text-teal-500',
    bg: 'bg-teal-50',
  },
];

export default function SiteTypes() {
  return (
    <section className="py-16 sm:py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight word-break-keep">
            현장 유형별 <span className="text-blue-600">주요 발생 문제</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SITE_TYPES.map((site, idx) => (
            <div key={idx} className="bg-white rounded-[2rem] p-6 sm:p-8 hover:shadow-xl border border-slate-100 hover:border-blue-100 transition-all group">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${site.bg} group-hover:scale-110 transition-transform duration-300`}>
                <site.icon size={32} className={site.color} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-5">{site.title}</h3>
              <ul className="space-y-3.5">
                {site.issues.map((issue, iIdx) => (
                  <li key={iIdx} className="flex items-start gap-2.5">
                    <CheckCircle2 size={18} className="text-slate-400 shrink-0 mt-0.5 group-hover:text-blue-400 transition-colors" />
                    <span className="text-slate-600 font-medium word-break-keep leading-tight">{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
