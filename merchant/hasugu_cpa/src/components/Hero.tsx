import { Phone, CheckCircle, Clock, ShieldCheck, Wrench, ChevronRight, BadgeCheck } from 'lucide-react';
import { motion } from 'motion/react';
import CallButton from './CallButton';

export default function Hero() {
  const scrollToForm = () => {
    document.getElementById('consultation-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative bg-white pt-6 pb-12 sm:pt-16 sm:pb-24 overflow-hidden">
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-blue-50 rounded-full blur-3xl opacity-60 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-6 sm:space-y-8"
          >
            <div className="space-y-4 sm:space-y-5">
              <div className="flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs sm:text-sm font-bold border border-blue-100">
                  <ShieldCheck size={15} />
                  <span>하수구·배관 전문 상담</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs sm:text-sm font-bold border border-emerald-100">
                  <Clock size={15} />
                  <span>평균 10분 이내 연락</span>
                </div>
              </div>
              <h1 className="text-[1.85rem] sm:text-5xl lg:text-[54px] font-extrabold text-slate-900 leading-[1.25] tracking-tight word-break-keep">
                악취·역류·막힘,
                <br />
                <span className="text-blue-600">원인부터</span> 확인합니다
              </h1>
              <p className="text-[15px] sm:text-lg text-slate-600 leading-relaxed max-w-lg word-break-keep">
                하수구·싱크대·변기·공용배관까지 전문 장비로 점검하고, 협의된 작업만 진행합니다.
              </p>
            </div>

            {/* Mobile: 1 primary CTA. Desktop: call + form */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-1">
              <button
                type="button"
                onClick={scrollToForm}
                id="hero_form_btn"
                data-event-name="hero_form_click"
                data-placement="hero"
                className="flex-1 flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[16px] sm:text-[17px] font-bold py-4 px-6 rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98]"
              >
                빠른 상담신청
                <ChevronRight size={20} />
              </button>
              <CallButton
                id="hero_call_btn"
                placement="hero"
                className="flex-1 flex justify-center items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[16px] sm:text-[17px] font-bold py-4 px-6 rounded-2xl transition-all active:scale-[0.98]"
              >
                <Phone size={20} />
                전화상담
              </CallButton>
            </div>

            <div className="hidden sm:flex flex-wrap gap-4 sm:gap-6">
              {[
                { text: '협의 후 작업', icon: CheckCircle },
                { text: '전문 장비 점검', icon: Wrench },
                { text: '7일 재점검 안내', icon: BadgeCheck },
              ].map((badge) => (
                <div key={badge.text} className="flex items-center gap-2 text-slate-700 font-bold">
                  <badge.icon size={18} className="text-blue-500" />
                  <span className="text-sm">{badge.text}</span>
                </div>
              ))}
            </div>

            {/* Mobile compact trust row */}
            <div className="flex sm:hidden gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {['협의 후 작업', '장비 점검', '재점검 안내'].map((t) => (
                <span
                  key={t}
                  className="shrink-0 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-2 rounded-full"
                >
                  {t}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative mx-auto w-full max-w-md lg:max-w-none hidden sm:block"
          >
            <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1621905251918-48416bd8575a?q=80&w=800&auto=format&fit=crop"
                alt="전문 설비 기사가 배관을 점검하는 모습"
                className="w-full h-full object-cover object-center"
                loading="eager"
                fetchPriority="high"
                width="600"
                height="800"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
            </div>

            <div className="absolute top-8 -left-2 sm:-left-8 bg-white p-3 sm:p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
              <div className="bg-blue-100 p-2.5 rounded-full text-blue-600">
                <ShieldCheck size={22} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold mb-0.5">안심 서비스</p>
                <p className="text-sm font-bold text-slate-900">동의 후 작업만 진행</p>
              </div>
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[90%] bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-lg flex items-center justify-center gap-3">
              <div className="bg-green-100 p-2 rounded-full text-green-600">
                <Clock size={18} />
              </div>
              <p className="font-bold text-slate-800 text-sm">서울·인천·경기 · 일정 안내</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
