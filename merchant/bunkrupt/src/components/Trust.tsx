import { Search, ShieldCheck, Lock } from "lucide-react";

export default function Trust() {
  const points = [
    {
      icon: <Search className="h-6 w-6 text-point" />,
      title: "상황 확인 중심 상담",
      desc: "채무금액, 소득, 재산, 부양가족 여부를 기준으로 상담합니다.",
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-point" />,
      title: "과장 없는 안내",
      desc: "무조건 가능하다는 식의 안내가 아니라 현재 상황에 맞춰 검토합니다.",
    },
    {
      icon: <Lock className="h-6 w-6 text-point" />,
      title: "비공개 상담",
      desc: "상담 내용은 외부에 공개되지 않도록 신중하게 관리됩니다.",
    },
  ];

  return (
    <section className="bg-main px-4 py-16 text-white sm:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center sm:mb-16">
          <h2 className="mb-6 text-[26px] font-bold leading-tight sm:text-3xl">
            무조건 가능하다고 <span className="text-point">안내하지 않습니다</span>
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-[15px] leading-relaxed text-gray-300 sm:text-base">
            개인회생은 단순히 빚을 줄이는 절차가 아니라 현재 소득과 채무 상황에 맞춰 법적으로 재정비하는 제도입니다. 상담을 통해 현재 상황을 확인한 뒤 가능한 방향을 안내합니다.
          </p>
          <div className="mx-auto max-w-3xl rounded-xl border border-white/10 bg-white/10 p-5 text-left text-[14px] font-medium leading-relaxed text-gray-200 backdrop-blur-sm sm:text-center sm:text-[15px]">
            상담 내용은 비공개로 관리되며, 신청자의 상황에 따라 개인회생 가능 여부와 진행 방향은 달라질 수 있습니다.
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
          {points.map((point, index) => (
            <div key={index} className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 transition-colors hover:bg-white/10">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                {point.icon}
              </div>
              <h3 className="mb-3 text-lg font-bold text-white">
                {point.title}
              </h3>
              <p className="text-[14.5px] leading-relaxed text-gray-400">
                {point.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
