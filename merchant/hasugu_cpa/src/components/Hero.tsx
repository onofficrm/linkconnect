import { Phone, CheckCircle, Clock, ShieldCheck, Wrench, Calendar, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import CallButton from './CallButton';

export default function Hero() {
  const scrollToForm = () => {
    const formSection = document.getElementById('consultation-form');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative bg-white pt-8 pb-16 sm:pt-16 sm:pb-24 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-blue-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-bold border border-blue-100 shadow-sm">
                <ShieldCheck size={16} />
                <span>믿을 수 있는 하수구 전문 업체</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-slate-900 leading-[1.2] tracking-tight word-break-keep">
                악취·역류·막힘, <br />
                <span className="text-blue-600">원인부터 꼼꼼하게</span> <br className="hidden sm:block" />확인합니다
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-lg word-break-keep">
                하수구막힘, 싱크대막힘, 변기막힘, 공용배관 문제까지 전문 장비로 확인하고 필요한 작업만 안내해드립니다.
              </p>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-6">
              {[
                { text: '빠른 상담 접수', icon: Clock },
                { text: '전문 장비 점검', icon: Wrench },
                { text: '협의 후 작업 진행', icon: CheckCircle },
              ].map((badge, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-700 font-bold bg-slate-50 px-4 py-2.5 rounded-xl sm:bg-transparent sm:p-0 sm:rounded-none">
                  <badge.icon size={20} className="text-blue-500" />
                  <span>{badge.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <CallButton
                id="hero_call_btn"
                placement="hero"
                className="flex-1 flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[17px] font-bold py-4 px-8 rounded-2xl shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-1 active:translate-y-0 active:scale-[0.98]"
                aria-label="지금 전화상담"
              >
                <Phone size={22} aria-hidden="true" />
                지금 전화상담
              </CallButton>
              <button
                onClick={scrollToForm}
                id="hero_form_btn"
                data-event-name="hero_form_click"
                data-placement="hero"
                className="flex-1 flex justify-center items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[17px] font-bold py-4 px-8 rounded-2xl transition-all active:scale-[0.98]"
                aria-label="빠른 상담신청"
              >
                빠른 상담신청
                <ChevronRight size={22} aria-hidden="true" />
              </button>
            </div>
          </motion.div>

          {/* Image & Floating Cards */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mx-auto w-full max-w-md lg:max-w-none mt-10 lg:mt-0"
          >
            <div className="relative aspect-[4/5] lg:aspect-[3/4] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
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

            {/* Floating Info Cards */}
            <div className="absolute top-8 -left-2 sm:-left-8 bg-white p-3 sm:p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="bg-blue-100 p-2.5 rounded-full text-blue-600">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold mb-0.5">안심 서비스</p>
                <p className="text-sm sm:text-base font-bold text-slate-900">하수구막힘 전문 상담</p>
              </div>
            </div>

            <div className="absolute bottom-28 -right-2 sm:-right-8 bg-white p-3 sm:p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
              <div className="bg-orange-100 p-2.5 rounded-full text-orange-500">
                <CheckCircle size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold mb-0.5">신속 출동</p>
                <p className="text-sm sm:text-base font-bold text-slate-900">서울·인천·경기 가능</p>
              </div>
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-lg flex items-center justify-center gap-3">
              <div className="bg-green-100 p-2 rounded-full text-green-600">
                <Calendar size={20} />
              </div>
              <p className="font-bold text-slate-800 text-sm sm:text-base">상담 후 현장 일정 안내</p>
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}
