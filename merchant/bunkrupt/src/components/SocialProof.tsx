import { MessageSquareQuote, Users, Timer } from 'lucide-react';

const stats = [
  { icon: Users, value: '1,200+', label: '누적 상담 접수' },
  { icon: Timer, value: '평균 2시간', label: '첫 연락 안내' },
  { icon: MessageSquareQuote, value: '92%', label: '상담 만족 응답' },
];

const reviews = [
  {
    age: '40대 · 직장인',
    debt: '채무 4천만원대',
    text: '독촉 때문에 잠을 못 잤는데, 가능 여부부터 차분히 설명받고 마음이 많이 놓였습니다.',
  },
  {
    age: '30대 · 자영업',
    debt: '채무 7천만원대',
    text: '혼자 검색만 하다가 30초 진단 후 상담 연결됐고, 다음 단계가 명확해졌습니다.',
  },
  {
    age: '50대 · 프리랜서',
    debt: '채무 2천만원대',
    text: '가족에게 알리기 어려웠는데 비밀 상담으로 먼저 방향을 잡을 수 있었습니다.',
  },
];

export default function SocialProof() {
  return (
    <section className="bg-bg px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <h2 className="text-[26px] font-bold text-main sm:text-3xl">많은 분들이 먼저 무료 진단을 받고 있습니다</h2>
        </div>
        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm">
              <stat.icon className="mx-auto mb-2 h-6 w-6 text-cta" />
              <p className="text-xl font-black text-main">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {reviews.map((review) => (
            <blockquote key={review.text} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="mb-4 text-[14px] leading-relaxed text-gray-700">“{review.text}”</p>
              <footer className="text-xs font-bold text-gray-500">
                {review.age} · {review.debt}
              </footer>
            </blockquote>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-gray-400">
          * 익명 후기 예시이며, 실제 상담 결과는 개인 상황에 따라 달라질 수 있습니다.
        </p>
      </div>
    </section>
  );
}
