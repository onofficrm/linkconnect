import React, { useState, useRef, useCallback } from "react";
import { Sparkles, ArrowLeftRight, CheckCircle2, Clock } from "lucide-react";
import { publicAsset } from "../lib/assets";

interface ComparisonCase {
  id: string;
  category: string;
  title: string;
  beforeImg: string;
  afterImg: string;
  duration: string;
  location: string;
  highlight: string;
}

const COMPARISON_CASES: ComparisonCase[] = [
  {
    id: "case-1",
    category: "유품·짐 반출",
    title: "침실 유품·생활용품 분류 및 반출",
    beforeImg: publicAsset("work-photo-01.jpg"),
    afterImg: publicAsset("work-photo-02.jpg"),
    duration: "당일 작업",
    location: "주거 현장",
    highlight: "분류·반출 후 동선 확보",
  },
  {
    id: "case-2",
    category: "가구·짐 반출",
    title: "거실 적체 가구·짐 반출 및 공간 확보",
    beforeImg: publicAsset("work-photo-03.jpg"),
    afterImg: publicAsset("work-photo-04.jpg"),
    duration: "당일 작업",
    location: "아파트 현장",
    highlight: "가구·가전 반출 · 공간 개방",
  },
  {
    id: "case-3",
    category: "폐기물·퇴거 마감",
    title: "폐기물 분류·반출 후 퇴거 간단 마감",
    beforeImg: publicAsset("work-photo-05.jpg"),
    afterImg: publicAsset("work-photo-06.jpg"),
    duration: "당일 작업",
    location: "주거 현장",
    highlight: "폐기물 처리 · 빗자루 마감",
  },
];

export const BeforeAfterSlider: React.FC = () => {
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeCase = COMPARISON_CASES[activeCaseIndex];

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

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
    <section id="section-before-after" className="py-16 lg:py-24 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-bold text-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>유품정리 전후 실제 비교 (Before & After)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
            반출 전후 변화를 <span className="text-blue-600">직접 슬라이드</span>하여 확인해보세요
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            손가락이나 마우스로 중앙 슬라이더를 좌우로 움직여 물품 반출 전후 모습을 비교해 보세요.
          </p>
        </div>

        {/* Case Selection Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {COMPARISON_CASES.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveCaseIndex(idx);
                setSliderPosition(50);
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeCaseIndex === idx
                  ? "bg-slate-900 text-white shadow-md scale-102"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {item.category}
            </button>
          ))}
        </div>

        {/* Active Case Info */}
        <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 mb-6 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm">
          <div>
            <span className="font-extrabold text-blue-600 text-xs px-2.5 py-0.5 bg-blue-50 rounded-md border border-blue-100 mr-2">
              {activeCase.category}
            </span>
            <span className="font-extrabold text-slate-900 text-sm sm:text-base">
              {activeCase.title}
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-600 font-medium shrink-0">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-emerald-600" /> {activeCase.duration}
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-blue-600" /> {activeCase.highlight}
            </span>
          </div>
        </div>

        {/* Interactive Comparison Slider Frame */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchMove={handleTouchMove}
          className="relative w-full aspect-[4/3] sm:aspect-[16/9] max-h-[500px] rounded-2xl overflow-hidden border border-slate-300 shadow-xl select-none cursor-ew-resize bg-slate-900"
        >
          {/* After Image (Background / Full Width) */}
          <img
            src={activeCase.afterImg}
            alt={`${activeCase.title} 반출 후`}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4 bg-emerald-600/90 text-white font-extrabold text-xs sm:text-sm px-3.5 py-1.5 rounded-lg shadow-md backdrop-blur-xs flex items-center gap-1.5 z-10">
            <CheckCircle2 className="w-4 h-4" />
            <span>반출 후 (AFTER)</span>
          </div>

          {/* Before Image (Clipped overlay based on sliderPosition) */}
          <div
            className="absolute inset-y-0 left-0 overflow-hidden"
            style={{ width: `${sliderPosition}%` }}
          >
            <img
              src={activeCase.beforeImg}
              alt={`${activeCase.title} 반출 전`}
              className="absolute top-0 left-0 h-full max-w-none object-cover"
              style={{ width: containerRef.current?.getBoundingClientRect().width || "100%" }}
            />
            <div className="absolute top-4 left-4 bg-slate-900/90 text-amber-300 font-extrabold text-xs sm:text-sm px-3.5 py-1.5 rounded-lg shadow-md backdrop-blur-xs z-10">
              <span>반출 전 (BEFORE)</span>
            </div>
          </div>

          {/* Slider Dividing Line & Knob */}
          <div
            className="absolute inset-y-0 z-20 flex items-center justify-center pointer-events-none"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="w-1 h-full bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)]" />
            <div className="absolute w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl border-2 border-white pointer-events-auto transform -translate-x-1/2 hover:scale-110 active:scale-95 transition-transform">
              <ArrowLeftRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>

        {/* Quick Tips & Action */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            💡 현장 물품량에 따라 최적의 분류·반출 방법을 맞춤 안내해 드립니다.
          </p>
          <button
            onClick={scrollToForm}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-xs transition-all shrink-0"
          >
            우리 집/공간 견적 문의하기 →
          </button>
        </div>
      </div>
    </section>
  );
};
