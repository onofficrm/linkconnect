import { Info, ArrowRight } from 'lucide-react';
import PublicPicture from './PublicPicture';

export default function BeforeAfter() {
  return (
    <section className="py-16 sm:py-24 bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight word-break-keep mb-5">
            막힌 곳만 뚫는 것이 아니라<br className="sm:hidden" />
            <span className="text-blue-600"> 재발 원인까지 확인합니다</span>
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto word-break-keep">
            배관 내부사진 원본을 전달드리겠습니다. 기름때·이물질·오염 상태를 확인하고 현장 상황에 맞는 방법을 안내합니다.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 items-center mb-10">
          <div className="relative rounded-[2rem] overflow-hidden group shadow-sm border border-slate-200 w-full md:flex-1">
            <div className="aspect-[4/3] bg-slate-200 relative">
              <PublicPicture
                name="pipe-before"
                alt="배관 내시경으로 확인한 작업 전 내부 원본"
                loading="lazy"
                width={800}
                height={600}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-900/10" />
            </div>
            <div className="absolute top-4 left-4 bg-slate-800 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              작업 전 · 내부 원본
            </div>
          </div>

          <div className="flex-shrink-0 bg-white p-4 rounded-full shadow-lg border border-slate-100 z-10 md:-mx-10 my-2 md:my-0 transform rotate-90 md:rotate-0">
            <ArrowRight size={28} className="text-blue-500" />
          </div>

          <div className="relative rounded-[2rem] overflow-hidden group shadow-md border border-slate-200 w-full md:flex-1">
            <div className="aspect-[4/3] bg-slate-200 relative">
              <PublicPicture
                name="pipe-inspect"
                alt="배관 내시경 점검·작업 과정 내부 원본"
                loading="lazy"
                width={800}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute top-4 right-4 bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              내시경 점검 원본
            </div>
            <div className="absolute inset-0 border-4 border-blue-500/30 rounded-[2rem] pointer-events-none" />
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm max-w-3xl mx-auto">
          <ul className="space-y-4">
            {[
              '일시적으로 물길만 확보하는 방식과 배관 내부를 점검하는 방식은 결과가 다를 수 있습니다',
              '내시경 점검 시 배관 내부사진 원본을 전달드립니다',
              '현장 구조와 배관 상태에 따라 작업 방법이 달라질 수 있습니다',
            ].map((text) => (
              <li key={text} className="flex items-start gap-3">
                <Info size={20} className="text-blue-500 shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm sm:text-base font-medium word-break-keep leading-relaxed">
                  {text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
