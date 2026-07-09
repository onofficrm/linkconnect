import { CheckCircle2, FileSearch, ArrowRight } from "lucide-react";

export default function Eligibility() {
  const scrollToForm = () => {
    document.getElementById("consult-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const conditions = [
    "현재 소득이 있다",
    "채무가 감당하기 어려운 수준이다",
    "연체 중이거나 연체가 예상된다",
    "신용카드, 대출, 사채, 보증채무가 있다",
    "일정 금액을 매달 변제할 수 있다",
    "현재 생활비를 제외하면 상환 여력이 부족하다",
  ];

  return (
    <section className="bg-white px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center sm:mb-14">
          <h2 className="mb-4 text-[26px] font-bold leading-tight text-main sm:text-3xl">
            개인회생, 이런 경우 검토해볼 수 있습니다
          </h2>
          <p className="text-sm text-gray-500 sm:text-base">
            개인회생 가능 여부는 채무금액, 소득, 재산, 부양가족, 최근 대출 여부 등에 따라 달라질 수 있습니다.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-5 lg:gap-12 lg:items-center">
          {/* Left: Checklist */}
          <div className="lg:col-span-3">
            <ul className="space-y-4">
              {conditions.map((condition, index) => (
                <li key={index} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-bg/50 p-4 transition-colors hover:border-cta/30 hover:bg-bg">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-cta" />
                  <span className="text-[15px] font-medium text-gray-800">
                    {condition}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Consultation Card */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 sm:p-8 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                <FileSearch className="h-7 w-7 text-main" />
              </div>
              <h3 className="mb-3 text-lg font-bold text-gray-900">
                정확한 진단이 필요하신가요?
              </h3>
              <p className="mb-8 text-[13px] leading-relaxed text-gray-500">
                체크 항목이 많다고 해서 무조건 개인회생이 가능한 것은 아닙니다.<br className="hidden sm:block lg:hidden" />
                정확한 가능 여부는 상담을 통해 확인할 수 있습니다.
              </p>
              
              <button 
                onClick={scrollToForm}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-cta py-4 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-700 active:scale-[0.98]"
              >
                가능성 상담받기
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
