import { Link } from 'react-router-dom';
import { Building2, Mail, MessageCircle } from 'lucide-react';

const KAKAO_OPEN_CHAT = 'https://open.kakao.com/o/seLMPtMi';
const SUPPORT_EMAIL = 'support2580_@linkconnect.co.kr';

/**
 * 광고주 입점 문의 — 양식 대신 카카오톡·이메일 채널 안내
 */
export function AdvertiserApply() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-slate-950 text-white pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-cyan-400 text-sm font-semibold tracking-wide mb-3">광고주 입점 문의</p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">광고주 입점 신청 문의</h1>
          <p className="text-slate-400 text-base md:text-lg leading-relaxed">
            링크커넥트 광고주 입점 및 제휴에 대해 궁금한 사항이 있으신가요?
            <br className="hidden sm:block" />
            아래 채널을 통해 편하게 문의해 주세요.
          </p>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 -mt-6 pb-20">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 shrink-0 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-amber-600" />
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">카카오톡 문의</h2>
                  <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                    카카오톡으로 빠르고 간편하게 문의하실 수 있습니다.
                  </p>
                </div>
                <a
                  href={KAKAO_OPEN_CHAT}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#FEE500] text-slate-900 text-sm font-bold hover:brightness-95 transition-all"
                >
                  카카오톡으로 문의하기
                </a>
                <p className="text-xs text-slate-500 break-all">
                  <a
                    href={KAKAO_OPEN_CHAT}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-700 hover:underline"
                  >
                    {KAKAO_OPEN_CHAT}
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 shrink-0 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center">
                <Mail className="h-6 w-6 text-cyan-600" />
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">이메일 문의</h2>
                  <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                    광고주 입점 및 제휴 관련 문의사항을 이메일로 보내주세요.
                  </p>
                </div>
                <a
                  href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('광고주 입점·제휴 문의')}`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"
                >
                  이메일 보내기
                </a>
                <p className="text-sm font-mono font-semibold text-slate-800 break-all">{SUPPORT_EMAIL}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-100/80 p-5 sm:p-6 flex items-start gap-3">
            <Building2 className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-600 leading-relaxed">
              이미 광고주센터 계정이 있다면{' '}
              <Link to="/advertiser" className="font-semibold text-cyan-700 hover:underline">
                광고주센터
              </Link>
              에서 계약·상품·홍보 가이드를 이어서 진행할 수 있습니다.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
