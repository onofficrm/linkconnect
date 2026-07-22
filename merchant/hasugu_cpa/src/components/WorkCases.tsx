import { Camera } from 'lucide-react';
import { motion } from 'motion/react';

const CASES = [
  {
    id: 1,
    title: '식당 주방 하수구 역류',
    desc: '오랜 기름때로 막힌 메인 배관 고압세척',
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop',
    category: '고압세척'
  },
  {
    id: 2,
    title: '아파트 싱크대 막힘',
    desc: '음식물 찌꺼기로 막힌 하부장 배관 스케일링',
    imageUrl: 'https://images.unsplash.com/photo-1584622781864-1c107bf385b4?q=80&w=800&auto=format&fit=crop',
    category: '싱크대'
  },
  {
    id: 3,
    title: '상가 공용 화장실 역류',
    desc: '내시경 카메라 진단 후 변기 탈거 및 배관 소통',
    imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=800&auto=format&fit=crop',
    category: '변기·화장실'
  },
  {
    id: 4,
    title: '건물 외부 오수관 막힘',
    desc: '토사물 및 나무뿌리 침투로 인한 막힘 해결',
    imageUrl: 'https://images.unsplash.com/photo-1520412099551-64b6b2baeb58?q=80&w=800&auto=format&fit=crop',
    category: '외부배관'
  }
];

export default function WorkCases() {
  return (
    <section className="py-16 sm:py-24 bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 text-sm font-bold mb-4 border border-slate-700">
            <Camera size={16} />
            <span>생생한 작업 현장</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight word-break-keep">
            다양한 현장의 막힘 문제를<br className="sm:hidden" />
            <span className="text-blue-400"> 확실하게 해결합니다</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {CASES.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-[2rem] bg-slate-800 aspect-[4/5] shadow-lg"
            >
              <img 
                src={item.imageUrl} 
                alt={item.title} 
                loading="lazy"
                width="400"
                height="500"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100 mix-blend-luminosity group-hover:mix-blend-normal"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
              
              <div className="absolute bottom-0 left-0 w-full p-6 text-left">
                <span className="inline-block px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold mb-3 shadow-sm">
                  {item.category}
                </span>
                <h3 className="text-lg font-bold mb-2 word-break-keep text-white">{item.title}</h3>
                <p className="text-sm text-slate-300 line-clamp-2 word-break-keep leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
