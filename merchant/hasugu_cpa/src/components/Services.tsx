import { Bath, Utensils, Droplet, Building2, Search, Wrench, Wind, Waves, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

const SERVICES = [
  { id: 'drain', name: '하수구막힘', desc: '욕실, 베란다, 세탁실 등 배수가 느리거나 막힌 경우', icon: Bath, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'sink', name: '싱크대막힘', desc: '음식물, 기름때, 이물질로 물이 내려가지 않는 경우', icon: Utensils, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 'toilet', name: '변기막힘', desc: '휴지, 생활용품, 이물질로 변기가 막히거나 넘치는 경우', icon: Droplet, color: 'text-teal-500', bg: 'bg-teal-50' },
  { id: 'public', name: '공용배관막힘', desc: '다세대, 상가, 아파트의 공용 배관에 문제가 발생한 경우', icon: Building2, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 'camera', name: '배관 내시경 점검', desc: '배관 내부의 막힘 위치와 상태를 화면으로 확인', icon: Search, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { id: 'clean', name: '고압세척', desc: '배관 내부에 쌓인 기름때와 오염물질을 세척', icon: Wrench, color: 'text-amber-500', bg: 'bg-amber-50' },
  { id: 'smell', name: '악취 해결', desc: '배수구와 배관에서 반복적으로 올라오는 악취 점검', icon: Wind, color: 'text-green-500', bg: 'bg-green-50' },
  { id: 'reverse', name: '역류 문제', desc: '하수 또는 오수가 거꾸로 올라오는 원인 확인', icon: Waves, color: 'text-red-500', bg: 'bg-red-50' },
];

export default function Services() {
  const handleConsult = (serviceName: string) => {
    // In the future, this will auto-select the symptom in the form
    const formSection = document.getElementById('consultation-form');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight word-break-keep">
            생활 속 배관 문제, <br className="sm:hidden" />
            <span className="text-blue-600">한 번에 상담하세요</span>
          </h2>
          <p className="mt-4 text-slate-600 text-lg max-w-2xl mx-auto word-break-keep">
            단순히 막힌 곳만 뚫는 것이 아니라 막힘이 발생한 위치와 원인을 확인한 후 필요한 작업을 안내합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {SERVICES.map((service, index) => (
            <motion.div 
              key={service.id} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col bg-slate-50 rounded-[2rem] p-6 sm:p-8 hover:bg-blue-50/50 transition-colors border border-slate-100 hover:border-blue-100 group"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${service.bg} group-hover:scale-110 transition-transform duration-300`}>
                <service.icon size={28} className={service.color} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{service.name}</h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8 flex-grow word-break-keep">
                {service.desc}
              </p>
              <button 
                onClick={() => handleConsult(service.name)}
                data-service={service.name}
                className="inline-flex items-center gap-1.5 text-blue-600 font-bold hover:text-blue-700 w-fit group/btn"
              >
                상담하기
                <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
