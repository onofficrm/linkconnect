import { ArrowRight, XCircle, CheckCircle2 } from 'lucide-react';
import { scrollToConsultForm } from '../lib/consultationForm';
import { trackLandingEvent } from '../lib/analytics';

const beforeItems = [
  '매달 이자만 내고 원금은 그대로',
  '독촉 전화·문자로 불안',
  '급여·통장 압류 걱정',
  '혼자 해결 방법을 모름',
];

const afterItems = [
  '월 변제액 기준으로 상환 계획 검토',
  '절차에 따른 독촉·압류 중단 가능성',
  '비밀 상담으로 조용히 시작',
  '전문가 안내로 다음 단계 확인',
];

export default function BeforeAfter() {
  return (
    <section className="bg-white px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <h2 className="text-[26px] font-bold text-main sm:text-3xl">상담 전과 후, 무엇이 달라질까요?</h2>
          <p className="mt-3 text-sm text-gray-500">제도 설명보다 생활 변화 관점에서 이해하기 쉽게 정리했습니다.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
          <div className="rounded-2xl border border-red-100 bg-red-50/40 p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-red-700">
              <XCircle className="h-5 w-5" /> Before
            </h3>
            <ul className="space-y-3">
              {beforeItems.map((item) => (
                <li key={item} className="flex items-start gap-2 text-[14px] text-gray-700">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="hidden items-center justify-center lg:flex">
            <div className="rounded-full bg-cta/10 p-3 text-cta">
              <ArrowRight className="h-6 w-6" />
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-emerald-700">
              <CheckCircle2 className="h-5 w-5" /> After
            </h3>
            <ul className="space-y-3">
              {afterItems.map((item) => (
                <li key={item} className="flex items-start gap-2 text-[14px] text-gray-700">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => {
              trackLandingEvent('hero_cta_click', { source: 'before_after' });
              scrollToConsultForm();
            }}
            className="inline-flex items-center justify-center rounded-xl bg-cta px-8 py-4 text-[15px] font-bold text-white shadow-lg transition-colors hover:bg-blue-700"
          >
            내 상황 무료 확인하기
          </button>
        </div>
      </div>
    </section>
  );
}
