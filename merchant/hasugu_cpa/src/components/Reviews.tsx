import { Star, MessageSquareHeart, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

const REVIEWS = [
  {
    id: 1,
    name: '김**',
    service: '싱크대막힘 해결',
    text: '물이 전혀 안 내려가서 당황했는데, 원인을 꼼꼼하게 설명해주시고 어떻게 작업할지 미리 알려주셔서 안심하고 맡길 수 있었습니다.',
    tags: ['상담이 자세해요', '진행과정을 잘 설명해요'],
    hasPhoto: true,
  },
  {
    id: 2,
    name: '이**',
    service: '욕실 하수구막힘',
    text: '여러 번 막혀서 고생하던 하수구였는데, 내시경으로 원인을 확인시켜주시고 근본적인 해결 방법을 제안해주셔서 좋았습니다.',
    tags: ['필요한 작업만 안내해요', '응대가 친절해요'],
    hasPhoto: true,
  },
  {
    id: 3,
    name: '박**',
    service: '변기막힘 해결',
    text: '작업 후에도 앞으로 어떻게 관리해야 하는지 친절하게 설명해주셨습니다. 현장에서 추가 비용 강요 없이 협의한 내용만 진행했습니다.',
    tags: ['작업 후 관리법을 알려줘요', '상담이 자세해요'],
    hasPhoto: false,
  }
];

export default function Reviews() {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-bold mb-4 border border-blue-100">
            <MessageSquareHeart size={18} />
            <span>서비스 이용 후기 예시</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight word-break-keep">
            실제 상담과 작업 경험을<br className="sm:hidden" />
            <span className="text-blue-600"> 확인해보세요</span>
          </h2>
          <p className="mt-4 text-slate-500 text-sm max-w-2xl mx-auto word-break-keep">
            * 본 영역은 서비스 이해를 돕기 위한 후기 예시 화면이며, 추후 실제 고객 후기로 교체될 예정입니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {REVIEWS.map((review, index) => (
            <motion.div 
              key={review.id} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-slate-50 rounded-[2rem] p-6 sm:p-8 border border-slate-100 hover:shadow-xl hover:border-blue-100 transition-all flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="text-sm text-blue-600 font-bold mb-1">{review.service}</div>
                  <div className="text-lg font-extrabold text-slate-900">{review.name} 고객님</div>
                </div>
                <div className="flex gap-0.5 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
              </div>

              {review.hasPhoto && (
                <div className="flex gap-2 mb-6">
                  <div className="h-24 flex-1 bg-slate-200 rounded-2xl overflow-hidden relative border border-slate-300/50">
                     <span className="absolute inset-0 flex items-center justify-center text-xs text-slate-500 font-bold">작업 전 사진</span>
                  </div>
                  <div className="h-24 flex-1 bg-slate-200 rounded-2xl overflow-hidden relative border border-slate-300/50">
                     <span className="absolute inset-0 flex items-center justify-center text-xs text-slate-500 font-bold">작업 후 사진</span>
                  </div>
                </div>
              )}

              <p className="text-slate-700 text-sm sm:text-base leading-relaxed word-break-keep mb-8 flex-grow">
                "{review.text}"
              </p>

              <div className="flex flex-wrap gap-2 mt-auto">
                {review.tags.map((tag, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 bg-white text-slate-600 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
                    <CheckCircle2 size={14} className="text-blue-500" />
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
