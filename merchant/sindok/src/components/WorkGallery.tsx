import React, { useState } from 'react';
import { WORK_PHOTOS } from '../data/initialData';
import { WorkPhotoItem } from '../types';
import { publicAsset } from '../lib/assets';
import {
  Camera,
  CheckCircle2,
  ArrowRight,
  ZoomIn,
  Sparkles,
  X,
} from 'lucide-react';

function photoUrl(photo: WorkPhotoItem): string {
  return publicAsset(photo.imageSrc);
}

export const WorkGallery: React.FC = () => {
  const [lightboxPhoto, setLightboxPhoto] = useState<WorkPhotoItem | null>(null);

  const scrollToForm = () => {
    const el = document.getElementById('section-form');
    if (el) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section id="section-gallery" className="py-16 lg:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-bold text-xs">
            <Camera className="w-3.5 h-3.5 text-blue-600 aspect-square" />
            <span>실제 작업사례</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
            실제 유품정리·반출 현장을 확인해보세요
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            유품·짐·가구 반출이 진행된 실제 현장입니다. <br className="hidden sm:inline" />
            사진을 통해 반출 전후 변화를 확인해보세요.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {WORK_PHOTOS.map((photo) => {
            const src = photoUrl(photo);
            return (
              <div
                key={photo.id}
                className="bg-slate-50 rounded-2xl border border-slate-200 hover:border-blue-400 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
              >
                <button
                  type="button"
                  onClick={() => setLightboxPhoto(photo)}
                  className="relative aspect-[4/3] bg-slate-100 overflow-hidden cursor-pointer text-left"
                >
                  <img
                    src={src}
                    alt={photo.title}
                    loading="lazy"
                    width={600}
                    height={450}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-400/30">
                    {photo.defaultBadge}
                  </div>
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/90 text-slate-900 font-extrabold text-xs rounded-xl shadow-md">
                      <ZoomIn className="w-3.5 h-3.5 text-blue-600 aspect-square" />
                      원본 확대보기
                    </span>
                  </div>
                </button>

                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors">
                      {photo.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{photo.description}</p>
                  </div>
                  <div className="pt-3 border-t border-slate-200/80 flex items-center text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 text-emerald-600 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 aspect-square" /> 실제 작업 현장
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-14 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6 border border-blue-500/30">
          <div className="space-y-2 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 text-amber-300 text-xs font-bold rounded-full border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 aspect-square" />
              <span>실시간 현장 맞춤 무료 진단</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">우리 집도 작업이 가능할까요?</h3>
            <p className="text-slate-200 text-xs sm:text-sm max-w-xl leading-relaxed">
              현장 사진이나 기본 내용을 알려주시면 작업 가능 여부와 상담 내용을 빠르게 안내해드립니다.
            </p>
          </div>
          <button
            type="button"
            onClick={scrollToForm}
            className="shrink-0 px-7 py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-base rounded-2xl shadow-lg transition-all transform active:scale-95 flex items-center gap-2"
          >
            <span>우리 집 무료 상담받기</span>
            <ArrowRight className="w-5 h-5 text-slate-950 aspect-square" />
          </button>
        </div>

        {lightboxPhoto && (
          <div
            onClick={() => setLightboxPhoto(null)}
            className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={lightboxPhoto.title}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">{lightboxPhoto.title}</h4>
                <button
                  type="button"
                  onClick={() => setLightboxPhoto(null)}
                  className="p-1 text-slate-400 hover:text-slate-800 rounded-lg transition-colors"
                  aria-label="닫기"
                >
                  <X className="w-6 h-6 aspect-square" />
                </button>
              </div>
              <div className="aspect-[16/10] bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center relative shadow-inner">
                <img
                  src={photoUrl(lightboxPhoto)}
                  alt={lightboxPhoto.title}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                <h5 className="font-bold text-slate-900 text-sm">{lightboxPhoto.title}</h5>
                <p className="text-xs text-slate-600 leading-relaxed">{lightboxPhoto.description}</p>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setLightboxPhoto(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-colors"
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
