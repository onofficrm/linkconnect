import React, { useState, useEffect } from "react";
import { WORK_PHOTOS } from "../data/initialData";
import { WorkPhotoItem } from "../types";
import { getCustomImages } from "../utils/storage";
import {
  Camera,
  Upload,
  Eye,
  CheckCircle2,
  Image as ImageIcon,
  ArrowRight,
  ZoomIn,
  Sparkles,
  HelpCircle,
  X,
} from "lucide-react";

interface WorkGalleryProps {
  onOpenImageUpload?: (targetKey: string, title: string) => void;
}

export const WorkGallery: React.FC<WorkGalleryProps> = ({ onOpenImageUpload }) => {
  const openUpload = onOpenImageUpload || (() => undefined);
  const [customImages, setCustomImages] = useState<{ [key: string]: string }>({});
  const [lightboxPhoto, setLightboxPhoto] = useState<WorkPhotoItem | null>(null);

  const refreshImages = () => {
    setCustomImages(getCustomImages());
  };

  useEffect(() => {
    refreshImages();
    window.addEventListener("custom-images-updated", refreshImages);
    return () => window.removeEventListener("custom-images-updated", refreshImages);
  }, []);

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
    <section id="section-gallery" className="py-16 lg:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-bold text-xs">
            <Camera className="w-3.5 h-3.5 text-blue-600" />
            <span>실제 작업사례</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
            실제 작업 현장을 확인해보세요
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            다양한 현장에서 진행한 실제 작업사례입니다. <br className="hidden sm:inline" />
            사진을 통해 작업 과정과 결과를 확인해보세요.
          </p>
        </div>

        {/* 8 Work Photo Grid (PC: 4 cols 2 rows, Tablet: 2 cols, Mobile: 1 col) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {WORK_PHOTOS.map((photo) => {
            const uploadedImg = customImages[photo.placeholderText];

            return (
              <div
                key={photo.id}
                className="bg-slate-50 rounded-2xl border border-slate-200 hover:border-blue-400 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
              >
                {/* Photo Aspect 4:3 Area */}
                <div
                  onClick={() => setLightboxPhoto(photo)}
                  className="relative aspect-4/3 bg-slate-100 overflow-hidden cursor-pointer"
                >
                  {uploadedImg ? (
                    <img
                      src={uploadedImg}
                      alt={photo.title}
                      loading="lazy"
                      width="600"
                      height="450"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-slate-900 text-white relative">
                      <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />

                      <ImageIcon className="w-8 h-8 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />

                      <span className="font-mono text-sm font-black text-amber-300 bg-slate-800/90 border border-amber-400/40 px-2.5 py-0.5 rounded shadow-inner">
                        {photo.placeholderText}
                      </span>

                      <p className="text-[11px] text-slate-400 mt-1.5">
                        실제 작업사진 미등록
                      </p>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openUpload(
                            photo.placeholderText,
                            `${photo.placeholderText} 이미지 등록`
                          );
                        }}
                        className="mt-2.5 inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-semibold rounded border border-amber-400/30 transition-colors"
                      >
                        <Upload className="w-3 h-3" />
                        <span>사진 업로드</span>
                      </button>
                    </div>
                  )}

                  {/* Badge */}
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-400/30">
                    {photo.defaultBadge}
                  </div>

                  {/* Zoom Hover Overlay */}
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/90 text-slate-900 font-extrabold text-xs rounded-xl shadow-md">
                      <ZoomIn className="w-3.5 h-3.5 text-blue-600" />
                      원본 확대보기
                    </span>
                  </div>
                </div>

                {/* Card Info & Captions */}
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors">
                      {photo.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {photo.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 text-emerald-600 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 검증 완료 현장
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openUpload(
                          photo.placeholderText,
                          `${photo.placeholderText} 사진 수정`
                        );
                      }}
                      className="text-blue-600 hover:underline font-bold"
                    >
                      [사진 변경]
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Middle Consultation Request Banner (CTA) */}
        <div className="mt-14 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6 border border-blue-500/30">
          <div className="space-y-2 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 text-amber-300 text-xs font-bold rounded-full border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>실시간 현장 맞춤 무료 진단</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              우리 집도 작업이 가능할까요?
            </h3>
            <p className="text-slate-200 text-xs sm:text-sm max-w-xl leading-relaxed">
              현장 사진이나 기본 내용을 알려주시면 작업 가능 여부와 상담 내용을 빠르게 안내해드립니다.
            </p>
          </div>

          <button
            onClick={scrollToForm}
            className="shrink-0 px-7 py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-base rounded-2xl shadow-lg transition-all transform active:scale-95 flex items-center gap-2"
          >
            <span>우리 집 무료 상담받기</span>
            <ArrowRight className="w-5 h-5 text-slate-950" />
          </button>
        </div>

        {/* Lightbox / Full Size Modal */}
        {lightboxPhoto && (
          <div
            onClick={() => setLightboxPhoto(null)}
            className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                    {lightboxPhoto.placeholderText}
                  </span>
                  <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    {lightboxPhoto.title}
                  </h4>
                </div>
                <button
                  onClick={() => setLightboxPhoto(null)}
                  className="p-1 text-slate-400 hover:text-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="aspect-16/10 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center relative shadow-inner">
                {customImages[lightboxPhoto.placeholderText] ? (
                  <img
                    src={customImages[lightboxPhoto.placeholderText]}
                    alt={lightboxPhoto.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center text-white space-y-3 p-8">
                    <ImageIcon className="w-12 h-12 text-amber-400 mx-auto" />
                    <div className="font-mono text-xl font-extrabold text-amber-300">
                      {lightboxPhoto.placeholderText}
                    </div>
                    <p className="text-xs text-slate-300">
                      등록된 작업사진이 없습니다. 등록 후 확대보기가 가능합니다.
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                <h5 className="font-bold text-slate-900 text-sm">
                  {lightboxPhoto.title}
                </h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {lightboxPhoto.description}
                </p>
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
                  <span>사진 업로드 / 등록</span>
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

