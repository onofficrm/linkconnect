import React, { useState, useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";

interface LeadNotice {
  id: number;
  location: string;
  name: string;
  type: string;
  timeAgo: string;
}

const SAMPLE_NOTICES: LeadNotice[] = [
  { id: 1, location: "서울 강남구", name: "홍**", type: "32평 아파트 정리 상담", timeAgo: "방금 전" },
  { id: 2, location: "경기 성남시", name: "이**", type: "원룸 정리 & 물품 수거 문의", timeAgo: "2분 전" },
  { id: 3, location: "인천 연수구", name: "최**", type: "사무실 오피스 케어 예약", timeAgo: "4분 전" },
  { id: 4, location: "서울 마포구", name: "박**", type: "주거 공간 무료 방문 견적 신청", timeAgo: "6분 전" },
  { id: 5, location: "경기 용인시", name: "정**", type: "빌라 정리 및 방역 소독 문의", timeAgo: "8분 전" },
];

export const LiveLeadNotification: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % SAMPLE_NOTICES.length);
        setIsAnimating(false);
      }, 400);
    }, 7000);

    return () => clearInterval(timer);
  }, []);

  if (!isVisible) return null;

  const currentNotice = SAMPLE_NOTICES[currentIndex];

  const scrollToForm = () => {
    const el = document.getElementById("section-form");
    if (el) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 z-40 max-w-xs sm:max-w-sm w-full transition-all duration-300">
      <div
        onClick={scrollToForm}
        className={`bg-slate-900/95 text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md cursor-pointer hover:border-emerald-500/80 transition-all ${
          isAnimating ? "opacity-0 translate-y-2 scale-95" : "opacity-100 translate-y-0 scale-100"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full" />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.2 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                  실시간 접수 완료
                </span>
                <span className="text-[10px] text-slate-400">{currentNotice.timeAgo}</span>
              </div>
              <p className="text-xs sm:text-sm font-extrabold text-white">
                {currentNotice.location} {currentNotice.name} 고객님
              </p>
              <p className="text-xs text-slate-300 font-medium truncate">
                {currentNotice.type}
              </p>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
            }}
            className="text-slate-400 hover:text-white p-1"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
