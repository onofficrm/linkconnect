import { Coins, CreditCard, BellRing, ShieldAlert, EyeOff, ChevronRight } from "lucide-react";

export default function Empathy() {
  const scrollToForm = () => {
    document.getElementById("consult-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const situations = [
    {
      icon: <Coins className="h-6 w-6 text-main" />,
      title: "이자만 갚고 있는 상황",
      desc: "매달 납부는 하고 있지만 원금이 줄지 않아 부담이 계속되는 경우",
    },
    {
      icon: <CreditCard className="h-6 w-6 text-main" />,
      title: "카드값과 대출금 부담",
      desc: "카드론, 현금서비스, 대출 상환이 겹쳐 생활비까지 부족한 경우",
    },
    {
      icon: <BellRing className="h-6 w-6 text-main" />,
      title: "연체 독촉이 시작된 상황",
      desc: "문자, 전화, 우편 등으로 독촉을 받고 있어 심리적으로 힘든 경우",
    },
    {
      icon: <ShieldAlert className="h-6 w-6 text-main" />,
      title: "압류가 걱정되는 상황",
      desc: "급여 압류, 통장 압류, 재산 압류가 걱정되는 경우",
    },
    {
      icon: <EyeOff className="h-6 w-6 text-main" />,
      title: "가족에게 알리고 싶지 않은 상황",
      desc: "조용히 상담받고 현재 가능한 방법을 먼저 확인하고 싶은 경우",
    },
  ];

  return (
    <section className="bg-bg px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center sm:mb-14">
          <h2 className="mb-4 text-[26px] font-bold leading-tight text-main sm:text-3xl">
            이런 상황이라면<br className="sm:hidden" /> 먼저 상담이 필요합니다
          </h2>
          <p className="text-sm text-gray-500 sm:text-base">
            채무 문제는 혼자 고민할수록 더 커질 수 있습니다.<br className="hidden sm:block" />
            현재 상황을 확인하고 가능한 방법부터 알아보세요.
          </p>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {situations.map((situation, index) => (
            <div
              key={index}
              className={`group flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${
                index === 4 ? "sm:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <div>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
                  {situation.icon}
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">
                  {situation.title}
                </h3>
                <p className="text-[14px] leading-relaxed text-gray-600">
                  {situation.desc}
                </p>
              </div>
              <button 
                onClick={scrollToForm}
                className="mt-6 flex w-fit items-center gap-1 rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 transition-colors group-hover:border-cta group-hover:bg-cta group-hover:text-white"
              >
                내 상황 상담받기
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
