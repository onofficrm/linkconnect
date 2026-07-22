import { Building2, AlertTriangle, ChevronRight } from 'lucide-react';

export default function CommonPipeGuide() {
  const scrollToForm = () => {
    document.getElementById('consultation-form')?.scrollIntoView({ behavior: 'smooth' });
    window.dispatchEvent(
      new CustomEvent('hasugu:prefill-symptom', {
        detail: {
          serviceType: '공용배관막힘',
          message: '아파트/빌라 공용배관 관련 상담 희망',
        },
      }),
    );
  };

  return (
    <section className="py-12 sm:py-16 bg-indigo-50 border-y border-indigo-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-[2rem] border border-indigo-100 p-6 sm:p-10 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <Building2 size={28} />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight word-break-keep mb-3">
                아파트·빌라 <span className="text-indigo-600">공용배관</span> 안내
              </h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed word-break-keep mb-5">
                세대 내부 막힘은 바로 상담·점검이 가능합니다. 공용 오수관·배수관 문제는 관리사무소 또는
                입주자대표 협의가 필요할 수 있습니다.
              </p>
              <ul className="space-y-2.5 mb-6">
                {[
                  '세대 내부(싱크대·욕실·변기) → 즉시 상담 가능',
                  '공용배관·역류 → 관리실 협의 여부 확인 후 안내',
                  '접수 시 ‘아파트/빌라’와 증상을 남겨주시면 절차를 안내합니다',
                ].map((text) => (
                  <li key={text} className="flex items-start gap-2.5 text-sm sm:text-[15px] text-slate-700 font-medium">
                    <AlertTriangle size={18} className="text-indigo-500 shrink-0 mt-0.5" />
                    <span className="word-break-keep">{text}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={scrollToForm}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3.5 rounded-xl transition-colors"
              >
                공용배관 상담 남기기
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
