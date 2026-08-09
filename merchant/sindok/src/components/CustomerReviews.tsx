import React, { useState, useEffect, useRef } from 'react';
import { REVIEW_IMAGES } from '../data/initialData';
import { ReviewImageItem } from '../types';
import { publicAsset } from '../lib/assets';
import {
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  X,
  Star,
  Headphones,
  FileText,
  UserCheck,
  ClipboardCheck,
} from 'lucide-react';

function reviewUrl(rev: ReviewImageItem): string {
  return publicAsset(rev.imageSrc);
}

export const CustomerReviews: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<ReviewImageItem | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const totalItems = REVIEW_IMAGES.length;

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalItems);
    }, 4500);
    return () => clearInterval(interval);
  }, [isHovered, totalItems]);

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % totalItems);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 40) handleNext();
    else if (distance < -40) handlePrev();
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const visibleItems = [0, 1, 2].map((i) => REVIEW_IMAGES[(currentIndex + i) % totalItems]);

  const trustElements = [
    {
      icon: <Headphones className="w-5 h-5 text-blue-600 aspect-square" />,
      title: '고객 상황에 맞춘 상담',
      desc: '현장 상태와 요구사항을 정밀하게 파악하여 최적의 방안을 안내해 드립니다.',
    },
    {
      icon: <FileText className="w-5 h-5 text-indigo-600 aspect-square" />,
      title: '작업 전 진행 내용 안내',
      desc: '작업 범위, 투입 인력, 소요 시간을 사전에 명확하게 공유해 드립니다.',
    },
    {
      icon: <UserCheck className="w-5 h-5 text-amber-600 aspect-square" />,
      title: '전문 작업팀 방문',
      desc: '경험이 풍부한 전문 작업 인력이 현장에 직접 방문하여 체계적으로 전담합니다.',
    },
    {
      icon: <ClipboardCheck className="w-5 h-5 text-emerald-600 aspect-square" />,
      title: '작업 완료 후 현장 확인',
      desc: '반출 결과를 함께 점검하고, 필요 시 퇴거 간단 마감(빗자루 청소)으로 마무리합니다.',
    },
  ];

  return (
    <section id="section-reviews" className="py-16 lg:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-bold text-xs">
            <MessageSquare className="w-3.5 h-3.5 text-blue-600 aspect-square" />
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

        <div
          className="relative max-w-6xl mx-auto mb-12"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <button
            type="button"
            onClick={handlePrev}
            className="absolute -left-2 sm:-left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white border border-slate-300 text-slate-800 rounded-full flex items-center justify-center shadow-md hover:bg-blue-50 hover:text-blue-600 hover:border-blue-400 transition-all active:scale-95"
            aria-label="이전 후기"
          >
            <ChevronLeft className="w-6 h-6 aspect-square" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute -right-2 sm:-right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white border border-slate-300 text-slate-800 rounded-full flex items-center justify-center shadow-md hover:bg-blue-50 hover:text-blue-600 hover:border-blue-400 transition-all active:scale-95"
            aria-label="다음 후기"
          >
            <ChevronRight className="w-6 h-6 aspect-square" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2 sm:px-4">
            {visibleItems.map((rev, idx) => {
              const hiddenClass =
                idx === 1 ? 'hidden md:flex' : idx === 2 ? 'hidden lg:flex' : 'flex';
              const src = reviewUrl(rev);

              return (
                <article
                  key={`${rev.id}-${currentIndex}-${idx}`}
                  className={`${hiddenClass} bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-lg transition-all duration-300 flex-col justify-between max-w-sm mx-auto w-full group`}
                >
                  <div className="space-y-3 w-full">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-slate-900 truncate">{rev.serviceUsed}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 aspect-square" />
                          <span className="font-bold text-slate-800">{rev.rating.toFixed(1)}</span>
                        </p>
                      </div>
                      <span className="shrink-0 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                        실제 고객 작성
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setLightboxPhoto(rev)}
                      className="relative w-full aspect-[4/5] sm:aspect-[3/4] bg-slate-50 rounded-xl overflow-hidden cursor-pointer group/img border border-slate-100"
                    >
                      <img
                        src={src}
                        alt={`${rev.serviceUsed} 고객 후기 — ${rev.content.slice(0, 40)}`}
                        loading="lazy"
                        width={400}
                        height={520}
                        className="w-full h-full object-contain object-top bg-white group-hover/img:scale-[1.02] transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-slate-950/25 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/95 text-slate-900 text-xs font-extrabold rounded-xl shadow-md">
                          <ZoomIn className="w-3.5 h-3.5 text-blue-600 aspect-square" />
                          원본 크게보기
                        </span>
                      </div>
                    </button>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{rev.content}</p>
                    {rev.tags && rev.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {rev.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-2 mt-8">
            {REVIEW_IMAGES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? 'w-8 bg-blue-600' : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`${idx + 1}번째 후기로 이동`}
              />
            ))}
          </div>
        </div>

        <div className="mt-12 bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">믿을 수 있는 현장 중심 안내</h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              투명한 절차와 약속된 작업으로 고객님의 만족을 약속합니다.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trustElements.map((item) => (
              <div
                key={item.title}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-start gap-3"
              >
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 shrink-0 mt-0.5">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">{item.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {lightboxPhoto && (
          <div
            onClick={() => setLightboxPhoto(null)}
            className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={lightboxPhoto.serviceUsed}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b pb-3 gap-3">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    {lightboxPhoto.serviceUsed}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 aspect-square" />
                    {lightboxPhoto.rating.toFixed(1)} · 실제 고객 후기
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setLightboxPhoto(null)}
                  className="p-1 text-slate-400 hover:text-slate-800 rounded-lg"
                  aria-label="닫기"
                >
                  <X className="w-6 h-6 aspect-square" />
                </button>
              </div>
              <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
                <img
                  src={reviewUrl(lightboxPhoto)}
                  alt={lightboxPhoto.serviceUsed}
                  className="w-full h-auto object-contain"
                />
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{lightboxPhoto.content}</p>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setLightboxPhoto(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl"
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
