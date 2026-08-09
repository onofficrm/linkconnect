import React, { useState, useEffect } from "react";
import {
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Clock,
  Star,
  AlertCircle,
  Send,
  Check,
  Sparkles,
} from "lucide-react";
import { getCustomImages } from "../utils/storage";
import { buildInquiryText, submitConsultation } from "../lib/linkconnect";
import { usePartnerContext } from "../context/PartnerContext";
import CallButton from "./CallButton";
import { trackGenerateLead } from "../lib/analytics";
import { publicAsset } from "../lib/assets";

const RECENT_REQUESTS = [
  "방금 전 [서울 강남구] 김*진 고객님 유품정리 당일 견적 신청 완료",
  "3분 전 [경기 성남시] 박*우 고객님 짐·가구 반출 전화 상담 완료",
  "8분 전 [서울 서초구] 이*영 고객님 유품정리 무료 견적 접수 완료",
  "12분 전 [인천 연수구] 강*민 고객님 퇴거 정리 견적 신청 완료",
  "15분 전 [경기 수원시] 윤*서 고객님 폐기물·잔짐 반출 상담 접수",
];

// High quality representative work photo fallback
const DEFAULT_HERO_BG = publicAsset("work-photo-07.jpg");

export const Hero: React.FC = () => {
  const { data, hasPhone } = usePartnerContext();
  const [heroBg, setHeroBg] = useState<string>(DEFAULT_HERO_BG);
  const [tickerIndex, setTickerIndex] = useState(0);

  // Quick form state inside Hero Card
  const [quickForm, setQuickForm] = useState({
    name: "",
    phone: "",
    location: "",
    serviceType: "유품정리서비스",
    agreedPrivacy: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const refreshHeroImage = () => {
    const images = getCustomImages();
    if (images["work-photo-01"]) {
      setHeroBg(images["work-photo-01"]);
    } else {
      setHeroBg(DEFAULT_HERO_BG);
    }
  };

  useEffect(() => {
    refreshHeroImage();
    const handleUpdate = () => refreshHeroImage();
    window.addEventListener("custom-images-updated", handleUpdate);

    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % RECENT_REQUESTS.length);
    }, 3800);

    return () => {
      window.removeEventListener("custom-images-updated", handleUpdate);
      clearInterval(timer);
    };
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

  // Phone input formatting
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^0-9]/g, "");
    if (raw.length > 11) raw = raw.slice(0, 11);

    let formatted = raw;
    if (raw.length >= 4 && raw.length <= 7) {
      formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`;
    } else if (raw.length >= 8) {
      formatted = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7)}`;
    }

    setQuickForm((prev) => ({ ...prev, phone: formatted }));
  };

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!quickForm.name.trim()) {
      setErrorMessage("성함을 입력해 주세요.");
      return;
    }

    if (!quickForm.phone || quickForm.phone.length < 10) {
      setErrorMessage("올바른 연락처(휴대폰 번호)를 입력해 주세요.");
      return;
    }

    if (!quickForm.agreedPrivacy) {
      setErrorMessage("개인정보 수집 및 이용 동의에 체크해 주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const inquiry = buildInquiryText({
        location: quickForm.location || "지역 미지정",
        serviceType: quickForm.serviceType,
        memo: "히어로 빠른 상담 카드 접수",
      });
      const result = await submitConsultation(
        { name: quickForm.name, phone: quickForm.phone, inquiry },
        {
          campaign_id: data.campaign_id,
          merchant_id: data.merchant_id,
          partner_id: data.partner_id,
          lkCode: data.lkCode,
          sub_id: data.sub_id,
          utm_source: data.utm_source,
          utm_medium: data.utm_medium,
          utm_campaign: data.utm_campaign,
        },
      );
      if (result.ok) {
        trackGenerateLead({ campaign_id: data.campaign_id, placement: "hero_quick" });
        setSubmitSuccess(true);
      } else {
        setErrorMessage(result.message || "상담 신청 중 오류가 발생했습니다.");
      }
    } catch {
      setErrorMessage("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="section-hero"
      className="relative bg-slate-950 text-white overflow-hidden py-10 lg:py-16 min-h-[580px] flex items-center"
    >
      {/* 1. Hero Background Image with Dark Semi-Transparent Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500 scale-105"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-900/80" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        {/* Top Ticker: Live Request Activity */}
        <div className="flex items-center justify-start mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-900/80 border border-blue-400/30 rounded-full text-xs text-blue-100 backdrop-blur-md shadow-md">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-emerald-300">실시간 접수 현황:</span>
            <span className="truncate max-w-[260px] sm:max-w-md font-medium text-slate-200">
              {RECENT_REQUESTS[tickerIndex]}
            </span>
          </div>
        </div>

        {/* Grid Container (Bento Grid split layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Main Copy Column (Left) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Trust Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-400/40 rounded-lg text-amber-300 text-xs sm:text-sm font-extrabold tracking-wide">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>유품정리서비스 전문팀</span>
              <span className="text-amber-400 font-bold">| 당일 출장 가능</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.25] tracking-tight">
              유품정리서비스,
              <br />
              혼자 빼내기 어려우시죠?
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">
                분류부터 반출까지
              </span>
              <br />
              전문팀이 책임집니다.
            </h1>

            <p className="text-slate-200 text-base sm:text-lg font-medium leading-relaxed max-w-2xl">
              초점은 청소가 아니라{" "}
              <strong className="text-white font-bold underline decoration-blue-500 underline-offset-4 decoration-2">
                물건을 안전하게 빼내는 것
              </strong>
              입니다. <br className="hidden sm:inline" />
              청소는 퇴거 후 빗자루 마감 정도만 진행합니다.
            </p>

            {/* Trust Bullet Points (4 Required Points) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-3 text-center backdrop-blur-md shadow-sm hover:border-blue-500/50 transition-all">
                <div className="w-7 h-7 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-white">빠른 상담</div>
                <div className="text-[10px] text-slate-400 mt-0.5">3분 이내 콜백</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-3 text-center backdrop-blur-md shadow-sm hover:border-blue-500/50 transition-all">
                <div className="w-7 h-7 bg-amber-500/20 text-amber-400 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-white">현장 맞춤 견적</div>
                <div className="text-[10px] text-slate-400 mt-0.5">추가금 ZERO 원칙</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-3 text-center backdrop-blur-md shadow-sm hover:border-blue-500/50 transition-all">
                <div className="w-7 h-7 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-white">전문 작업팀 방문</div>
                <div className="text-[10px] text-slate-400 mt-0.5">자격증 보유 기사</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-3 text-center backdrop-blur-md shadow-sm hover:border-blue-500/50 transition-all">
                <div className="w-7 h-7 bg-indigo-500/20 text-indigo-400 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                  <Star className="w-4 h-4 fill-indigo-400" />
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-white">퇴거 간단 마감</div>
                <div className="text-[10px] text-slate-400 mt-0.5">빗자루 청소 수준</div>
              </div>
            </div>

            {/* Main CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              {/* 무료 상담 신청 버튼 */}
              <button
                onClick={scrollToForm}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white font-extrabold text-base sm:text-lg rounded-xl shadow-xl hover:shadow-blue-500/25 transition-all group active:scale-95"
              >
                <span>무료 상담 신청</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              {hasPhone && (
                <CallButton
                  placement="hero"
                  className="flex items-center justify-center gap-2.5 px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-base sm:text-lg rounded-xl shadow-xl hover:shadow-emerald-500/25 transition-all active:scale-95 group"
                >
                  <Phone className="w-5 h-5 animate-pulse shrink-0 aspect-square" />
                  <span>전화로 바로 상담</span>
                  <span className="font-mono text-xs bg-emerald-700/60 px-2 py-0.5 rounded-md font-bold partner-phone-text">
                    {data.tracking_phone_display || data.partner_phone_display}
                  </span>
                </CallButton>
              )}
            </div>

            {/* Guarantee badges */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                상담 / 출장 견적 100% 무료
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                365일 24시간 연중무휴
              </span>
            </div>
          </div>

          {/* Quick Consultation Request Card (Right / Mobile Bottom) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-2xl text-slate-900 border-2 border-blue-500/40 relative backdrop-blur-xl">
              {/* Top Banner Tag */}
              <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black px-3.5 py-1 rounded-full shadow-md flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>실시간 빠른 3초 무료 견적</span>
              </div>

              <div className="mb-4 text-left">
                <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-blue-600 rounded-full inline-block"></span>
                  빠른 상담 신청
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  아래 간단한 정보를 입력하시면 담당 전문가가 3분 내 연락드립니다.
                </p>
              </div>

              {submitSuccess ? (
                <div className="py-8 text-center space-y-3 bg-emerald-50 rounded-xl border border-emerald-200 p-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-7 h-7" />
                  </div>
                  <h4 className="text-lg font-black text-slate-900">
                    빠른 상담 신청이 완료되었습니다!
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    접수해주신 연락처로 베테랑 상담 기사님이{" "}
                    <strong className="text-blue-600">3분 이내에 신속 전화</strong>드리겠습니다.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitSuccess(false);
                      setQuickForm({
                        name: "",
                        phone: "",
                        location: "",
                        serviceType: "유품정리서비스",
                        agreedPrivacy: true,
                      });
                    }}
                    className="mt-2 text-xs font-bold text-blue-600 underline hover:text-blue-800"
                  >
                    추가 상담 신청하기
                  </button>
                </div>
              ) : (
                <form onSubmit={handleQuickSubmit} className="space-y-3 text-left">
                  {errorMessage && (
                    <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-lg flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* 1. 이름 (Name) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      이름 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={quickForm.name}
                      onChange={(e) =>
                        setQuickForm({ ...quickForm, name: e.target.value })
                      }
                      placeholder="성함을 입력해 주세요"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
                    />
                  </div>

                  {/* 2. 연락처 (Phone) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      연락처 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={quickForm.phone}
                      onChange={handlePhoneChange}
                      placeholder="010-0000-0000"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
                    />
                  </div>

                  {/* 3. 작업 지역 (Location/Area) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      작업 지역
                    </label>
                    <input
                      type="text"
                      value={quickForm.location}
                      onChange={(e) =>
                        setQuickForm({ ...quickForm, location: e.target.value })
                      }
                      placeholder="예: 서울 강남구 / 경기 성남시"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
                    />
                  </div>

                  {/* 4. 상담 내용 또는 서비스 종류 */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      상담 내용 또는 서비스 종류
                    </label>
                    <select
                      value={quickForm.serviceType}
                      onChange={(e) =>
                        setQuickForm({ ...quickForm, serviceType: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
                    >
                      <option value="유품정리서비스">유품정리서비스</option>
                      <option value="짐·잔짐 반출">짐·잔짐 반출</option>
                      <option value="가구·가전 수거">가구·가전 수거</option>
                      <option value="퇴거 정리 (간단 마감 포함)">퇴거 정리 (간단 마감 포함)</option>
                      <option value="폐기물 처리">폐기물 처리</option>
                    </select>
                  </div>

                  {/* 5. 개인정보 수집 및 이용 동의 */}
                  <div className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      id="hero-quick-agree"
                      checked={quickForm.agreedPrivacy}
                      onChange={(e) =>
                        setQuickForm({ ...quickForm, agreedPrivacy: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <label
                      htmlFor="hero-quick-agree"
                      className="text-[11px] text-slate-600 cursor-pointer font-medium"
                    >
                      개인정보 수집 및 이용에 동의합니다.
                    </label>
                  </div>

                  {/* Submit Button with exact user label "무료 견적 상담받기" */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-base rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>신청 접수 중...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-amber-400" />
                        <span>무료 견적 상담받기</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> 100% 정보 보안
                </span>
                <span>상담 완료 후 개인정보 파기</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

