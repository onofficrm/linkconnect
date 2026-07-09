import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: '상담 비용이 발생하나요?',
    a: '무료 자격진단과 1차 상담은 비용이 발생하지 않습니다. 이후 진행 여부는 상담 후 결정하시면 됩니다.',
  },
  {
    q: '가족이나 직장에 알려지나요?',
    a: '상담 내용은 비밀로 진행됩니다. 진행 절차상 필요한 안내는 사전에 설명드립니다.',
  },
  {
    q: '연체 중이거나 독촉을 받고 있어도 되나요?',
    a: '연체·독촉·압류 진행 중인 경우에도 먼저 가능 여부를 확인할 수 있습니다.',
  },
  {
    q: '상담 후 바로 신청해야 하나요?',
    a: '아닙니다. 가능 여부와 진행 방향을 충분히 설명드린 뒤 본인이 결정하시면 됩니다.',
  },
  {
    q: '전화만 해도 상담받을 수 있나요?',
    a: '가능합니다. 폼 신청 또는 전화 상담 중 편한 방법을 선택하시면 됩니다.',
  },
];

export default function ConsultationFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-bg px-4 py-16 sm:py-20" id="consult-faq">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h2 className="text-[26px] font-bold text-main sm:text-3xl">상담 전 자주 묻는 질문</h2>
          <p className="mt-3 text-sm text-gray-500">신청 전 불안을 줄이기 위한 안내입니다.</p>
        </div>
        <div className="space-y-3">
          {faqs.map((item, index) => {
            const open = openIndex === index;
            return (
              <div key={item.q} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-[15px] font-bold text-gray-900">{item.q}</span>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
                {open ? (
                  <div className="border-t border-gray-100 px-5 py-4 text-[14px] leading-relaxed text-gray-600">
                    {item.a}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
