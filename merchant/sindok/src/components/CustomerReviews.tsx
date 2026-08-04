import React, { useState, useEffect, useRef } from "react";
import { REVIEW_IMAGES } from "../data/initialData";
import { ReviewImageItem } from "../types";
import { getCustomImages } from "../utils/storage";
import {
  Upload,
  MessageSquare,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  X,
  CheckCircle2,
  Headphones,
  FileText,
  UserCheck,
  ClipboardCheck,
} from "lucide-react";

interface CustomerReviewsProps {
  onOpenImageUpload?: (targetKey: string, title: string) => void;
}

export const CustomerReviews: React.FC<CustomerReviewsProps> = ({ onOpenImageUpload }) => {
  const openUpload = onOpenImageUpload || (() => undefined);
  const [customImages, setCustomImages] = useState<{ [key: string]: string }>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<ReviewImageItem | null>(null);

  // Touch Swipe State
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const refreshImages = () => {
    setCustomImages(getCustomImages());
  };

  useEffect(() => {
    refreshImages();
    window.addEventListener("custom-images-updated", refreshImages);
    return () => window.removeEventListener("custom-images-updated", refreshImages);
  }, []);

  const totalItems = REVIEW_IMAGES.length;

  // Auto slide timer (every 4 seconds when not hovered)
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalItems);
    }, 4000);
    return () => clearInterval(interval);
  }, [isHovered, totalItems]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalItems);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 40;

    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Helper to get visible review items for responsive view
  // We compute 3 items for Desktop, 2 for Tablet, 1 for Mobile starting from currentIndex
  const getVisibleItems = () => {
    const items = [];
    for (let i = 0; i < 3; i++) {
      items.push(REVIEW_IMAGES[(currentIndex + i) % totalItems]);
    }
    return items;
  };

  const visibleItems = getVisibleItems();

  // Trust elements list
  const trustElements = [
    {
      icon: <Headphones className="w-5 h-5 text-blue-600" />,
      title: "고객 상황에 맞춘 상담",
      desc: "현장 상태와 요구사항을 정밀하게 파악하여 최적의 방안을 안내해 드립니다.",
    },
    {
      icon: <FileText className="w-5 h-5 text-indigo-600" />,
      title: "작업 전 진행 내용 안내",
      desc: "작업 범위, 투입 인력, 소요 시간을 사전에 명확하게 공유해 드립니다.",
    },
    {
      icon: <UserCheck className="w-5 h-5 text-amber-600" />,
      title: "전문 작업팀 방문",
      desc: "경험이 풍부한 전문 작업 인력이 현장에 직접 방문하여 체계적으로 전담합니다.",
    },
    {
      icon: <ClipboardCheck className="w-5 h-5 text-emerald-600" />,
      title: "작업 완료 후 현장 확인",
      desc: "작업 종료 후 고객님과 함께 최종 결과를 점검하고 깔끔하게 정돈 마감합니다.",
    },
  ];

  return (
    <section id="section-reviews" className="py-16 lg:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-bold text-xs">
            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
            <span>실제 이용 후기</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
            서비스를 이용한 고객님들의 <br />
            <span className="text-blue-600">실제 후기입니다</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            직접 서비스를 이용하신 고객님들이 남겨주신 후기입니다.
          </p>
        </div>

        {/* Carousel Container */}
        <div
          className="relative max-w-6xl mx-auto mb-12"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Navigation Arrows (Desktop / Tablet) */}
          <button
            onClick={handlePrev}
            className="absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white border border-slate-300 text-slate-800 rounded-full flex items-center justify-center shadow-md hover:bg-blue-50 hover:text-blue-600 hover:border-blue-400 transition-all active:scale-95"
            aria-label="이전 후기"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={handleNext}
            className="absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white border border-slate-300 text-slate-800 rounded-full flex items-center justify-center shadow-md hover:bg-blue-50 hover:text-blue-600 hover:border-blue-400 transition-all active:scale-95"
            aria-label="다음 후기"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Review Cards Grid */}
          {/* PC: 3 cards, Tablet: 2 cards, Mobile: 1 card */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2 sm:px-4">
            {visibleItems.map((rev, idx) => {
              const uploadedImg = customImages[rev.placeholderText];
              // On mobile show only 1st item (idx === 0), on tablet show 1st & 2nd (idx < 2)
              const hiddenClass =
                idx === 1
                  ? "hidden md:flex"
                  : idx === 2
                  ? "hidden lg:flex"
                  : "flex";

              return (
                <div
                  key={`${rev.id}-${idx}`}
                  className={`${hiddenClass} bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-lg transition-all duration-300 flex-col justify-between max-w-sm mx-auto w-full group`}
                >
                  <div className="space-y-3 w-full">
                    {/* Header Label */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                        {rev.placeholderText}
                      </span>
                      <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                        실제 고객 작성
                      </span>
                    </div>

                    {/* Review Image Container - Contain object fit for vertical long review images */}
                    <div
                      onClick={() => setLightboxPhoto(rev)}
                      className="relative w-full h-72 sm:h-80 bg-slate-900 rounded-xl overflow-hidden cursor-pointer flex items-center justify-center p-2 group/img"
                    >
                      {uploadedImg ? (
                        <img
                          src={uploadedImg}
                          alt={`고객 후기 ${rev.placeholderText}`}
                          loading="lazy"
                          width="400"
                          height="600"
                          className="w-full h-full object-contain group-hover/img:scale-102 transition-transform duration-300"
                        />
                      ) : (
                        <div className="text-center text-white space-y-2 p-4 bg-slate-900 w-full h-full flex flex-col items-center justify-center">
                          <ImageIcon className="w-10 h-10 text-amber-400" />
                          <span className="font-mono text-sm font-extrabold text-amber-300 bg-slate-800 border border-amber-400/40 px-2.5 py-1 rounded shadow-inner">
                            {rev.placeholderText}
                          </span>
                          <p className="text-xs text-slate-300">
                            실제 후기 캡처/사진 등록 영역
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openUpload(
                                rev.placeholderText,
                                `${rev.placeholderText} 사진 등록`
                              );
                            }}
                            className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold rounded border border-amber-400/40 transition-colors"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>사진 업로드</span>
                          </button>
                        </div>
                      )}

                      {/* Zoom Overlay */}
                      {uploadedImg && (
                        <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/95 text-slate-900 text-xs font-extrabold rounded-xl shadow-md">
                            <ZoomIn className="w-3.5 h-3.5 text-blue-600" />
                            원본 크게보기
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Edit Trigger */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="text-[11px] text-slate-500">
                      터치/클릭 시 이미지 확대
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openUpload(
                          rev.placeholderText,
                          `${rev.placeholderText} 사진 수정`
                        );
                      }}
                      className="text-blue-600 hover:underline font-bold text-[11px]"
                    >
                      [사진 변경]
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dot Indicators */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {REVIEW_IMAGES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx
                    ? "w-8 bg-blue-600"
                    : "w-2.5 bg-slate-300 hover:bg-slate-400"
                }`}
                aria-label={`${idx + 1}번째 후기로 이동`}
              />
            ))}
          </div>
        </div>

        {/* Trust Elements Section */}
        <div className="mt-12 bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
              믿을 수 있는 현장 중심 안내
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              투명한 절차와 약속된 작업으로 고객님의 만족을 약속합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trustElements.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-start gap-3"
              >
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 shrink-0 mt-0.5">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lightbox Modal */}
        {lightboxPhoto && (
          <div
            onClick={() => setLightboxPhoto(null)}
            className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-3xl w-full p-5 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                    {lightboxPhoto.placeholderText}
                  </span>
                  <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    고객 후기 원본 확대
                  </h4>
                </div>
                <button
                  onClick={() => setLightboxPhoto(null)}
                  className="p-1 text-slate-400 hover:text-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Contain Image Frame */}
              <div className="aspect-4/3 sm:aspect-16/10 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center p-2 relative shadow-inner">
                {customImages[lightboxPhoto.placeholderText] ? (
                  <img
                    src={customImages[lightboxPhoto.placeholderText]}
                    alt={`고객 후기 원본 ${lightboxPhoto.placeholderText}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center text-white space-y-3 p-8">
                    <ImageIcon className="w-12 h-12 text-amber-400 mx-auto" />
                    <div className="font-mono text-xl font-extrabold text-amber-300">
                      {lightboxPhoto.placeholderText}
                    </div>
                    <p className="text-xs text-slate-300">
                      등록된 후기 사진이 없습니다. 등록 후 확대보기가 가능합니다.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    const target = lightboxPhoto.placeholderText;
                    setLightboxPhoto(null);
                    openUpload(target, `${target} 사진 업로드`);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  <span>사진 업로드 / 교체</span>
                </button>
                <button
                  onClick={() => setLightboxPhoto(null)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

