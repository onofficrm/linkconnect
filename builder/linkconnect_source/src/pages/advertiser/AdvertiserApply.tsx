import { FormEvent, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, CheckCircle2, FileUp, Paperclip, Send } from 'lucide-react';
import { createAdvertiserApplyInquiry, PartnerApiError } from '../../lib/api';
import { getLcAuth } from '../../lib/auth';

const STEPS = [
  { n: 1, label: '입점 양식 제출' },
  { n: 2, label: '광고주센터 승인' },
  { n: 3, label: '계약 진행' },
];

const AD_METHODS = ['CPA', 'CPS', 'CPA/CPS'] as const;

export function AdvertiserApply() {
  const auth = getLcAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState(auth.memberName || auth.memberNick || '');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState(auth.memberEmail || '');
  const [homepage, setHomepage] = useState('');
  const [industry, setIndustry] = useState('');
  const [adMethod, setAdMethod] = useState<(typeof AD_METHODS)[number] | ''>('');
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [website, setWebsite] = useState(''); // honeypot

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submittedCode, setSubmittedCode] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (
      !companyName.trim() ||
      !contactName.trim() ||
      !contactPhone.trim() ||
      !contactEmail.trim() ||
      !homepage.trim() ||
      !industry.trim() ||
      !adMethod ||
      !message.trim()
    ) {
      setError('필수 항목을 모두 입력해주세요.');
      return;
    }
    if (!file) {
      setError('사업자등록증을 첨부해주세요.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const data = await createAdvertiserApplyInquiry({
        companyName,
        contactName,
        contactPhone,
        contactEmail,
        homepage,
        industry,
        adMethod,
        message,
        attachment: file,
        website,
      });
      setSubmittedCode(data.item.id);
      setSuccessMsg(data.message);
      setCompanyName('');
      setContactPhone('');
      setHomepage('');
      setIndustry('');
      setAdMethod('');
      setMessage('');
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      setError(err instanceof PartnerApiError || err instanceof Error ? err.message : '신청 접수에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-slate-950 text-white pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-cyan-400 text-sm font-semibold tracking-wide mb-3">광고주 입점 문의</p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">링크커넥트 광고주 입점 신청</h1>
          <p className="text-slate-400 text-base md:text-lg">
            입점 양식을 제출하시면 검토 후 광고주센터 승인 · 계약 안내를 드립니다.
          </p>
          <ol className="mt-10 flex flex-col sm:flex-row items-stretch justify-center gap-3 sm:gap-2">
            {STEPS.map((step, i) => (
              <li key={step.n} className="flex-1 flex items-center gap-3 sm:flex-col sm:gap-2">
                <div className="flex items-center gap-3 w-full sm:flex-col sm:w-auto">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-slate-950 text-sm font-bold">
                    {step.n}
                  </span>
                  <span className="text-sm font-medium text-white text-left sm:text-center">{step.label}</span>
                </div>
                {i < STEPS.length - 1 ? (
                  <span className="hidden sm:block text-slate-600 text-lg leading-none" aria-hidden>
                    →
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 -mt-6 pb-20">
        <div className="max-w-2xl mx-auto">
          {successMsg ? (
            <div className="rounded-2xl border border-emerald-200 bg-white p-8 shadow-sm text-center space-y-4">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
              <h2 className="text-xl font-bold text-slate-900">입점 신청이 접수되었습니다</h2>
              <p className="text-sm text-slate-600">{successMsg}</p>
              {submittedCode ? (
                <p className="text-sm font-mono font-bold text-cyan-700 bg-cyan-50 inline-block px-3 py-1.5 rounded-lg">
                  접수번호 {submittedCode}
                </p>
              ) : null}
              <p className="text-sm text-slate-500">
                승인 후 광고주센터에서 계약을 진행해 주세요.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <Link
                  to="/advertiser"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800"
                >
                  광고주센터로 이동
                </Link>
                <Link
                  to="/inquiry"
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50"
                >
                  접수 내역 조회
                </Link>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5"
              encType="multipart/form-data"
            >
              <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                <div className="h-10 w-10 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-cyan-600" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">입점 신청 양식</h2>
                  <p className="text-xs text-slate-500">아래 항목을 입력하고 사업자등록증을 첨부해 주세요.</p>
                </div>
              </div>

              {/* honeypot */}
              <input
                type="text"
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
              />

              <label className="block space-y-1.5">
                <span className="text-sm font-semibold text-slate-800">업체명 *</span>
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                  placeholder="회사·상호명"
                  required
                />
              </label>

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block space-y-1.5">
                  <span className="text-sm font-semibold text-slate-800">담당자명 *</span>
                  <input
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                    required
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-semibold text-slate-800">연락처 *</span>
                  <input
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                    placeholder="010-0000-0000"
                    required
                  />
                </label>
              </div>

              <label className="block space-y-1.5">
                <span className="text-sm font-semibold text-slate-800">이메일 *</span>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                  required
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-semibold text-slate-800">홈페이지 또는 랜딩페이지 *</span>
                <input
                  value={homepage}
                  onChange={(e) => setHomepage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                  placeholder="https://"
                  required
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-semibold text-slate-800">광고 업종 *</span>
                <input
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                  placeholder="예: 법률·금융, 교육, 커머스 등"
                  required
                />
              </label>

              <fieldset className="space-y-2">
                <legend className="text-sm font-semibold text-slate-800">희망 광고 방식 (CPA / CPS) *</legend>
                <div className="flex flex-wrap gap-2">
                  {AD_METHODS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setAdMethod(m)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                        adMethod === m
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="block space-y-1.5">
                <span className="text-sm font-semibold text-slate-800">간단한 소개 및 문의 내용 *</span>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                  placeholder="서비스 소개, 희망 규모, 문의 사항을 적어 주세요."
                  required
                />
              </label>

              <div className="space-y-2">
                <span className="text-sm font-semibold text-slate-800 block">첨부 — 사업자등록증 *</span>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,application/pdf,image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setFile(f);
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 text-sm font-medium text-slate-700 transition-colors"
                >
                  {file ? <Paperclip className="h-4 w-4 text-cyan-600" /> : <FileUp className="h-4 w-4" />}
                  {file ? file.name : '사업자등록증 파일 선택 (PDF·이미지, 최대 10MB)'}
                </button>
              </div>

              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm disabled:opacity-60 transition-colors"
              >
                <Send className="h-4 w-4" />
                {loading ? '접수 중...' : '입점 신청 제출'}
              </button>

              <p className="text-xs text-slate-500 text-center leading-relaxed">
                제출 후 관리자 검토 → 광고주센터 승인 → 전자계약 순으로 진행됩니다.
                <br />
                일반 문의는 <Link to="/inquiry" className="text-cyan-700 underline">고객문의</Link>를 이용해 주세요.
              </p>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
