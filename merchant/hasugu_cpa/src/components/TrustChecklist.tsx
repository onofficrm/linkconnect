import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

const PRINCIPLES = [
  '상담을 통해 증상과 현장 상황을 먼저 확인합니다',
  '영업시간 기준 평균 10분 이내 연락을 목표로 합니다',
  '현장 확인 후 필요한 작업과 예상 비용을 안내합니다',
  '고객과 협의된 작업만 진행합니다',
  '동일 구간 7일 이내 재발 시 재점검 여부를 안내합니다',
  '아파트 공용배관은 관리실 협의 절차를 함께 안내합니다',
];

export default function TrustChecklist() {
  return (
    <section className="py-16 sm:py-24 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] bg-blue-100/50 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-12 shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex flex-col items-center text-center mb-8 sm:mb-10">
            <div className="bg-blue-50 p-3 rounded-full text-blue-600 mb-4 sm:mb-5">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight word-break-keep">
              부담을 줄이는 안심 상담 원칙
            </h2>
          </div>

          <ul className="space-y-3 sm:space-y-4">
            {PRINCIPLES.map((item, idx) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl hover:bg-slate-50 transition-colors"
              >
                <CheckCircle2 size={24} className="text-blue-500 shrink-0 mt-0.5 sm:mt-0" />
                <span className="text-base sm:text-lg text-slate-700 font-medium word-break-keep leading-snug">
                  {item}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
