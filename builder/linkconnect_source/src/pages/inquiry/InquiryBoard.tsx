import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ClipboardList, HelpCircle, MessageSquare, Search, Send } from 'lucide-react';
import {
  createPublicInquiry,
  fetchMyPublicInquiryDetail,
  fetchMyPublicInquiries,
  InquiryItem,
  InquirySummary,
  lookupPublicInquiry,
} from '../../lib/api';
import { getLcAuth } from '../../lib/auth';

const emptySummary: InquirySummary = { total: 0, waiting: 0, processing: 0, closed: 0, today: 0 };

const categories = ['서비스 이용', '파트너 가입', '광고주 가입', 'CPA/CPS 문의', '정산/결제', '기술 오류', '기타'];

type Tab = 'write' | 'lookup' | 'mine';

function statusClass(statusCode: string) {
  if (statusCode === 'closed') return 'bg-emerald-100 text-emerald-700';
  if (statusCode === 'processing') return 'bg-blue-100 text-blue-700';
  if (statusCode === 'hold') return 'bg-amber-100 text-amber-700';
  return 'bg-yellow-100 text-yellow-800';
}

function InquiryResultCard({ item }: { item: InquiryItem }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="text-sm font-mono font-bold text-cyan-700">{item.id}</div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusClass(item.statusCode)}`}>{item.status}</span>
      </div>
      <div>
        <div className="text-xs text-slate-500 mb-1">{item.category} · {item.date}</div>
        <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
      </div>
      {item.content ? (
        <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-sm text-slate-700 whitespace-pre-line">{item.content}</div>
      ) : null}
      {item.reply ? (
        <div className="rounded-xl bg-cyan-50 border border-cyan-100 p-4">
          <div className="text-xs font-bold text-cyan-700 mb-2">관리자 답변 {item.replyDate !== '-' ? `· ${item.replyDate}` : ''}</div>
          <p className="text-sm text-slate-800 whitespace-pre-line">{item.reply}</p>
        </div>
      ) : (
        <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-800">
          아직 답변이 등록되지 않았습니다. 조금만 기다려 주세요.
        </div>
      )}
    </div>
  );
}

export function InquiryBoard() {
  const auth = getLcAuth();
  const [tab, setTab] = useState<Tab>('write');
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [contactName, setContactName] = useState(auth.memberName || auth.memberNick || '');
  const [contactEmail, setContactEmail] = useState(auth.memberEmail || '');
  const [contactPhone, setContactPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [lookupCode, setLookupCode] = useState('');
  const [lookupEmail, setLookupEmail] = useState(auth.memberEmail || '');
  const [result, setResult] = useState<InquiryItem | null>(null);
  const [submittedCode, setSubmittedCode] = useState('');
  const [mineItems, setMineItems] = useState<InquiryItem[]>([]);
  const [mineSummary, setMineSummary] = useState<InquirySummary>(emptySummary);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadMine = async () => {
    if (!auth.loggedIn) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchMyPublicInquiries();
      setMineItems(data.items);
      setMineSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : '내 문의 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'mine') {
      loadMine();
    }
  }, [tab]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!category || !subject.trim() || !body.trim() || !contactName.trim() || !contactEmail.trim()) {
      setError('필수 항목을 모두 입력해주세요.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    setResult(null);
    try {
      const data = await createPublicInquiry({
        category,
        subject,
        body,
        contactName,
        contactEmail,
        contactPhone,
        website,
      });
      setMessage(data.message);
      setSubmittedCode(data.item.id);
      setResult(data.item);
      setCategory('');
      setSubject('');
      setBody('');
      setContactPhone('');
      setTab('lookup');
      setLookupCode(data.item.id);
      setLookupEmail(contactEmail);
    } catch (err) {
      setError(err instanceof Error ? err.message : '문의 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleLookup = async (e: FormEvent) => {
    e.preventDefault();
    if (!lookupCode.trim() || !lookupEmail.trim()) {
      setError('문의번호와 이메일을 입력해주세요.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const data = await lookupPublicInquiry(lookupCode.trim(), lookupEmail.trim());
      setResult(data.item);
      setSubmittedCode(data.item.id);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : '문의를 찾을 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: typeof MessageSquare }[] = [
    { id: 'write', label: '문의 작성', icon: MessageSquare },
    { id: 'lookup', label: '문의 조회', icon: Search },
    ...(auth.loggedIn ? [{ id: 'mine' as Tab, label: '내 문의', icon: ClipboardList }] : []),
  ];

  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-700">
            <HelpCircle size={14} /> LinkConnect Support
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">문의하기</h1>
          <p className="mt-3 text-base text-slate-600 md:text-lg">
            서비스 이용, 가입, 정산 등 궁금한 점을 남겨주시면 관리자가 확인 후 답변드립니다.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTab(item.id);
                  setError('');
                  setMessage('');
                }}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${
                  active ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </div>

        {(error || message) && (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
              error ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'
            }`}
          >
            {error || message}
            {submittedCode && !error ? (
              <div className="mt-1 font-bold">문의번호: {submittedCode} (조회 시 이메일과 함께 사용해 주세요)</div>
            ) : null}
          </div>
        )}

        {tab === 'write' && (
          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">이름 *</label>
                <input
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-cyan-500"
                  placeholder="홍길동"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">이메일 *</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-cyan-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">연락처 (선택)</label>
                <input
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-cyan-500"
                  placeholder="010-0000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">문의 유형 *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-cyan-500"
                >
                  <option value="">유형을 선택하세요</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">제목 *</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-cyan-500"
                placeholder="문의 제목을 입력하세요"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">내용 *</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={7}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-cyan-500 resize-y"
                placeholder="문의 내용을 자세히 적어주세요."
              />
            </div>
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="hidden"
              aria-hidden="true"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              <Send size={16} />
              {loading ? '접수 중...' : '문의 접수하기'}
            </button>
            <p className="text-xs text-slate-500">
              접수 후 발급되는 문의번호와 이메일을 보관해 두면 답변을 쉽게 확인할 수 있습니다.
              {auth.isActivePartner ? (
                <>
                  {' '}
                  파트너센터 이용 중이면 <Link to="/partner/support" className="font-bold text-cyan-700">파트너 문의</Link>를 권장합니다.
                </>
              ) : null}
              {auth.isActiveMerchant ? (
                <>
                  {' '}
                  광고주센터 이용 중이면 <Link to="/advertiser/support" className="font-bold text-cyan-700">광고주 문의</Link>를 권장합니다.
                </>
              ) : null}
            </p>
          </form>
        )}

        {tab === 'lookup' && (
          <div className="space-y-6">
            <form onSubmit={handleLookup} className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">문의번호 *</label>
                  <input
                    value={lookupCode}
                    onChange={(e) => setLookupCode(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-cyan-500 font-mono"
                    placeholder="IQ-250717-1234"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">접수 이메일 *</label>
                  <input
                    type="email"
                    value={lookupEmail}
                    onChange={(e) => setLookupEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-cyan-500"
                    placeholder="접수 시 입력한 이메일"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                <Search size={16} />
                {loading ? '조회 중...' : '답변 확인하기'}
              </button>
            </form>
            {result ? <InquiryResultCard item={result} /> : null}
          </div>
        )}

        {tab === 'mine' && auth.loggedIn && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-xl bg-white border border-slate-200 p-4">
                <div className="text-xs text-slate-500">전체</div>
                <div className="text-xl font-bold text-slate-900">{mineSummary.total}</div>
              </div>
              <div className="rounded-xl bg-white border border-slate-200 p-4">
                <div className="text-xs text-slate-500">답변대기</div>
                <div className="text-xl font-bold text-amber-600">{mineSummary.waiting}</div>
              </div>
              <div className="rounded-xl bg-white border border-slate-200 p-4">
                <div className="text-xs text-slate-500">처리중</div>
                <div className="text-xl font-bold text-blue-600">{mineSummary.processing}</div>
              </div>
              <div className="rounded-xl bg-white border border-slate-200 p-4">
                <div className="text-xs text-slate-500">답변완료</div>
                <div className="text-xl font-bold text-emerald-600">{mineSummary.closed}</div>
              </div>
            </div>
            {loading ? (
              <div className="text-center text-slate-500 py-10">불러오는 중...</div>
            ) : mineItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
                <CheckCircle2 className="mx-auto mb-3 text-slate-300" size={28} />
                아직 작성한 문의가 없습니다.
              </div>
            ) : (
              <div className="space-y-3">
                {mineItems.map((item) => (
                  <button
                    key={item.iqId}
                    type="button"
                    onClick={async () => {
                      setLoading(true);
                      setError('');
                      try {
                        const data = await fetchMyPublicInquiryDetail(item.iqId);
                        setResult(data.item);
                        setLookupCode(data.item.id);
                        setLookupEmail(data.item.contactEmail || contactEmail || auth.memberEmail || '');
                        setTab('lookup');
                      } catch (err) {
                        setError(err instanceof Error ? err.message : '상세 조회에 실패했습니다.');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="w-full text-left rounded-xl border border-slate-200 bg-white px-4 py-4 hover:bg-cyan-50/40 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-mono text-cyan-700 mb-1">{item.id}</div>
                        <div className="font-bold text-slate-900">{item.title}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          {item.category} · {item.date}
                        </div>
                      </div>
                      <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${statusClass(item.statusCode)}`}>
                        {item.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
