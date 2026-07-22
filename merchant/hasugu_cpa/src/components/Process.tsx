import { PhoneCall, CalendarClock, Search, CheckSquare, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

const STEPS = [
  { step: '01', title: '증상 상담', desc: '전화 또는 상담신청으로 현재 증상과 지역을 확인', icon: PhoneCall },
  { step: '02', title: '방문 일정 안내', desc: '지역과 기사 일정을 확인한 후 방문 가능 시간 안내', icon: CalendarClock },
  { step: '03', title: '현장 점검 및 설명', desc: '배관 상태를 점검하고 필요한 작업과 비용을 설명', icon: Search },
  { step: '04', title: '협의 후 작업', desc: '고객이 작업 내용에 동의한 경우에만 작업 진행', icon: CheckSquare },
];

export default function Process() {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-20">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight word-break-keep">
            상담부터 작업 완료까지<br className="sm:hidden" />
            <span className="text-blue-600"> 진행 과정을 확인하세요</span>
          </h2>
        </div>

        <div className="relative">
          {/* Timeline Line (Desktop) */}
          <div className="hidden md:block absolute top-10 left-0 w-full h-1 bg-slate-100"></div>
          
          <div className="flex flex-col md:flex-row gap-8 md:gap-4 justify-between relative z-10">
            {STEPS.map((step, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="flex flex-row md:flex-col items-center md:items-start gap-6 md:gap-0 md:flex-1"
              >
                {/* Icon Circle */}
                <div className="flex-shrink-0 w-20 h-20 md:mx-auto bg-white border-4 border-blue-50 rounded-2xl md:rounded-full flex items-center justify-center text-blue-600 shadow-sm relative md:mb-6 z-10">
                  <step.icon size={32} />
                  {/* Step badge */}
                  <div className="absolute -top-3 -right-3 md:-top-2 md:-right-2 bg-slate-800 text-white text-xs font-black px-2 py-1 rounded-lg md:rounded-full shadow-md">
                    {step.step}
                  </div>
                </div>
                
                {/* Content */}
                <div className="md:text-center flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-slate-600 text-sm sm:text-base word-break-keep leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-12 sm:mt-20 bg-blue-50/50 border border-blue-100 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 max-w-4xl mx-auto"
        >
          <div className="bg-blue-100 p-3 sm:p-4 rounded-full text-blue-600 shrink-0">
            <AlertTriangle size={32} />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-base sm:text-lg font-bold text-slate-800 word-break-keep leading-relaxed mb-1">
              현장 상황에 따라 필요한 작업과 비용이 달라질 수 있습니다.
            </p>
            <p className="text-slate-600 text-sm sm:text-base word-break-keep">
              작업 전 안내를 확인한 후 진행 여부를 결정하세요.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
