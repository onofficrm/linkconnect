import { CheckCircle2 } from 'lucide-react';
import { scrollToConsultForm } from '../lib/consultationForm';

const situations = [
  '매달 이자만 내고 원금이 줄지 않는다',
  '독촉 전화·문자 때문에 불안하다',
  '급여·통장 압류가 걱정된다',
  '가족에게 알리지 않고 조용히 상담받고 싶다',
];

export default function Empathy() {
  return (
    <section className="bg-bg px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h2 className="mb-3 text-[26px] font-bold leading-tight text-main sm:text-3xl">
            이런 분들이 많이 신청합니다
          </h2>
          <p className="text-sm text-gray-500 sm:text-base">아래 중 하나라도 해당되면 무료 진단부터 받아보세요.</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <ul className="space-y-4">
            {situations.map((text) => (
              <li key={text} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cta" />
                <span className="text-[15px] font-medium leading-relaxed text-gray-800">{text}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => scrollToConsultForm()}
            className="mt-8 w-full rounded-xl bg-main py-4 text-[15px] font-bold text-white transition-colors hover:bg-gray-800"
          >
            내 상황 무료 확인하기
          </button>
        </div>
      </div>
    </section>
  );
}
