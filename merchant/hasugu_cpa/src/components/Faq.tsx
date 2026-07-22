import { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const FAQS = [
  {
    q: '상담만 받아도 비용이 발생하나요?',
    a: '전화·온라인 상담 접수만으로 비용이 발생하지 않습니다. 현장 확인 후 필요한 작업과 예상 비용을 안내하고, 동의하신 작업만 진행합니다.',
  },
  {
    q: '현장에서 추가 비용을 요구하지 않나요?',
    a: '작업 전 안내한 범위 안에서 진행합니다. 예상과 다른 구조·추가 구간이 발견되면 먼저 설명하고, 동의 후에만 진행합니다.',
  },
  {
    q: '아파트·빌라 공용배관도 가능한가요?',
    a: '세대 내부 배관은 바로 상담 가능합니다. 공용배관은 관리사무소·입주자대표 협의가 필요할 수 있어, 접수 시 현장 유형을 알려주시면 절차를 안내합니다.',
  },
  {
    q: '야간·주말에도 출동하나요?',
    a: '긴급 증상은 접수 가능합니다. 지역·기사 일정에 따라 방문 가능 시간이 달라지며, 확인 후 가능한 일정을 안내합니다.',
  },
  {
    q: '직접 뚫어보다가 안 되면 어떻게 하나요?',
    a: '무리한 약품·철사 사용은 배관을 손상시킬 수 있습니다. 증상과 사진을 남겨주시면 점검 방법을 먼저 안내해 드립니다.',
  },
  {
    q: '접수 후 얼마나 빨리 연락받나요?',
    a: '영업시간 기준 평균 10분 이내 연락을 목표로 합니다. 야간·주말·통화 폭주 시에는 순차적으로 안내됩니다.',
  },
];

export default function Faq() {
  const [openId, setOpenId] = useState<number | null>(0);

  return (
    <section id="faq" className="py-16 sm:py-24 bg-white scroll-mt-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
            <HelpCircle size={18} />
            <span>자주 묻는 질문</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight word-break-keep">
            상담 전에<br className="sm:hidden" />
            <span className="text-blue-600"> 궁금한 점</span>을 확인하세요
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((item, idx) => {
            const open = openId === idx;
            return (
              <div
                key={item.q}
                className={`rounded-2xl border transition-colors ${
                  open ? 'border-blue-200 bg-blue-50/40' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5 text-left"
                >
                  <span className="font-bold text-slate-900 text-[15px] sm:text-base word-break-keep">
                    {item.q}
                  </span>
                  <ChevronDown
                    size={20}
                    className={`shrink-0 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {open ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 sm:px-6 sm:pb-6 text-slate-600 text-sm sm:text-[15px] leading-relaxed word-break-keep">
                        {item.a}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
