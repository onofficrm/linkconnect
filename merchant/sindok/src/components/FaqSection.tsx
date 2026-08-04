import React, { useState } from "react";
import { FAQ_LIST } from "../data/initialData";
import { HelpCircle, ChevronDown, MessageCircle, PhoneCall } from "lucide-react";
import CallButton from "./CallButton";
import { usePartnerContext } from "../context/PartnerContext";

export const FaqSection: React.FC = () => {
  const { data, hasPhone } = usePartnerContext();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const scrollToForm = () => {
    const el = document.getElementById("section-form");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="section-faq" className="py-16 lg:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-bold text-xs">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
            <span>자주 묻는 질문</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
            자주 묻는 질문 <span className="text-indigo-600">FAQ</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            서비스 이용 및 상담 신청과 관련해 자주 묻는 질문입니다.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {FAQ_LIST.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-extrabold text-slate-900 text-sm sm:text-base hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-indigo-600 font-extrabold text-base sm:text-lg">
                      질문 {idx + 1}.
                    </span>
                    <span>{faq.question}</span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-indigo-600" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-2 text-xs sm:text-sm text-slate-600 leading-relaxed bg-indigo-50/30 border-t border-slate-100 flex items-start gap-3">
                    <span className="text-indigo-600 font-extrabold text-xs sm:text-sm shrink-0 mt-0.5">
                      답변:
                    </span>
                    <p className="pt-0.5 font-medium">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Unresolved Question Callout */}
        <div className="mt-10 bg-white rounded-2xl p-6 border border-slate-200 text-center space-y-3 shadow-2xs">
          <p className="text-sm font-bold text-slate-800">
            추가로 궁금하신 점이 있으신가요? 지금 바로 상담 받아보세요!
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            {hasPhone && (
              <CallButton
                placement="faq"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
              >
                <PhoneCall className="w-4 h-4 aspect-square" />
                <span>전화 상담 (<span className="partner-phone-text">{data.tracking_phone_display || data.partner_phone_display}</span>)</span>
              </CallButton>
            )}
            <button
              onClick={scrollToForm}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>무료 견적 신청</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
