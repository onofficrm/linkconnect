import { CheckCircle2, Phone } from "lucide-react";

export default function Hero() {
  const scrollToForm = () => {
    document.getElementById("consult-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section className="relative overflow-hidden bg-main px-4 py-12 text-white sm:py-16 lg:py-20">
      {/* Background decoration */}
      <div className="pointer-events-none absolute left-0 top-0 z-0 h-full w-full overflow-hidden opacity-10">
        <div className="absolute -right-[10%] -top-[20%] h-[70%] w-[70%] rounded-full bg-point blur-[120px]"></div>
        <div className="absolute -bottom-[20%] -left-[10%] h-[60%] w-[60%] rounded-full bg-cta blur-[120px]"></div>
      </div>
      
      <div className="relative z-10 mx-auto grid max-w-5xl gap-12 lg:grid-cols-2 lg:items-center">
        
        {/* Left: Text & CTAs */}
        <div className="text-center lg:text-left">
          <div className="mb-5 inline-block rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-point">
            개인회생 비공개 무료 자격진단
          </div>
          <h1 className="mb-5 text-[28px] font-bold leading-[1.3] sm:text-4xl lg:text-[42px] lg:leading-[1.25]">
            빚 독촉과 카드값,<br />
            혼자 버티지 마세요.
          </h1>
          <p className="mb-6 text-[15px] leading-relaxed text-gray-200 sm:text-lg">
            소득은 있지만 채무 상환이 어려운 분들을 위해<br className="hidden sm:block" />
            <span className="font-semibold text-white">개인회생 가능 여부</span>를 빠르게 확인해드립니다.
          </p>
          <p className="mb-10 text-sm leading-relaxed text-gray-400 sm:text-[15px]">
            상담 전, 현재 채무와 소득 상황을 기준으로<br className="hidden sm:block" />
            진행 가능성을 먼저 확인해보세요.
          </p>
          
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <a 
              href="tel:" 
              className="phone-only partner-phone-link flex w-full items-center justify-center gap-2 rounded-xl bg-point px-6 py-4 text-base font-bold text-main shadow-lg transition-transform active:scale-95 sm:w-auto"
            >
              <Phone className="h-5 w-5" />
              <span className="partner-phone-text phone-label-only" data-phone-label="지금 전화상담하기">지금 전화상담하기</span>
            </a>
            <button 
              onClick={scrollToForm}
              className="flex w-full items-center justify-center rounded-xl bg-cta px-6 py-4 text-base font-bold text-white shadow-lg transition-transform active:scale-95 sm:w-auto"
            >
              무료 자격진단 신청
            </button>
          </div>
        </div>

        {/* Right: Image & Consultation Card UI */}
        <div className="mx-auto mt-8 w-full max-w-md lg:mt-0 lg:max-w-none lg:h-[500px]">
          <div className="relative h-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1595152772835-219674b2a8a6?q=80&w=800&auto=format&fit=crop" 
              alt="전문 상담사" 
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-main via-main/40 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8">
              <div className="mb-5 rounded-2xl border border-white/20 bg-main/60 p-5 backdrop-blur-md">
                <div className="mb-4 text-center">
                  <h3 className="text-lg font-bold text-white">개인회생 무료 진단</h3>
                  <p className="text-[13px] text-gray-300">편안하게 상담받아보세요</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "채무금액",
                    "월 소득",
                    "연체 여부",
                    "가족 비밀보장"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-point" />
                      <span className="text-[13px] font-medium text-gray-100">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={scrollToForm}
                className="w-full rounded-xl bg-white py-4 text-center text-[15px] font-bold text-main shadow-lg transition-colors hover:bg-gray-50 active:scale-[0.98]"
              >
                내 상황 무료 진단받기
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
