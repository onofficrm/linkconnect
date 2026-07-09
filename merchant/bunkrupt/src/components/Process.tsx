export default function Process() {
  const steps = [
    {
      title: "상담신청",
      desc: "간단한 정보를 남겨주시면 담당자가 순차적으로 확인합니다.",
    },
    {
      title: "채무·소득 상황 확인",
      desc: "현재 채무금액, 소득, 재산, 부양가족 여부를 확인합니다.",
    },
    {
      title: "개인회생 가능성 검토",
      desc: "입력된 정보를 기준으로 개인회생 검토 가능성을 안내합니다.",
    },
    {
      title: "예상 변제금 안내",
      desc: "상황에 따라 예상 변제금과 진행 방향을 안내합니다.",
    },
    {
      title: "진행 여부 결정",
      desc: "상담 내용을 확인한 뒤 진행 여부를 결정할 수 있습니다.",
    },
  ];

  return (
    <section className="bg-bg px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center sm:mb-16">
          <h2 className="mb-4 text-[26px] font-bold leading-tight text-main sm:text-3xl">
            상담은 이렇게 진행됩니다
          </h2>
          <p className="text-sm text-gray-500 sm:text-base">
            상담 신청 후 현재 상황을 확인하고,<br className="sm:hidden" /> 개인회생 검토 가능 여부를 순차적으로 안내합니다.
          </p>
        </div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-gray-200/60 sm:left-[35px]"></div>
          
          <div className="space-y-6 sm:space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="relative flex items-start gap-4 sm:gap-6">
                
                {/* Number Indicator */}
                <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm sm:h-[72px] sm:w-[72px] sm:rounded-3xl">
                  <span className="text-lg font-black text-cta sm:text-2xl">0{index + 1}</span>
                </div>
                
                {/* Content Card */}
                <div className="flex-1 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-7">
                  <h3 className="mb-2 text-[17px] font-bold text-gray-900 sm:text-lg">
                    {step.title}
                  </h3>
                  <p className="text-[14px] leading-relaxed text-gray-600 sm:text-[15px]">
                    {step.desc}
                  </p>
                </div>

              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
