const EQUIPMENTS = [
  {
    id: 'endoscope',
    name: '배관 내시경',
    desc: '배관 안쪽의 막힘 위치와 오염 상태 확인',
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'cleaner',
    name: '배관 청소 장비',
    desc: '배관 구조와 막힘 상태에 맞춰 작업',
    imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'washer',
    name: '고압세척 장비',
    desc: '배관 내부에 축적된 오염물질 세척',
    imageUrl: 'https://images.unsplash.com/photo-1542013936693-884638332954?q=80&w=600&auto=format&fit=crop'
  }
];

export default function Equipment() {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight word-break-keep">
            배관 내부를 확인하는 <br className="sm:hidden" />
            <span className="text-blue-600">전문 장비</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {EQUIPMENTS.map((eq) => (
            <div key={eq.id} className="group rounded-[2rem] bg-slate-50 border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
              <div className="aspect-[4/3] w-full overflow-hidden bg-slate-200 relative">
                <img 
                  src={eq.imageUrl} 
                  alt={eq.name} 
                  loading="lazy"
                  width="400"
                  height="300"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 sm:p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{eq.name}</h3>
                <p className="text-slate-600 text-sm sm:text-base word-break-keep leading-relaxed">
                  {eq.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
