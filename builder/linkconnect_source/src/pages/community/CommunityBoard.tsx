import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  MessageCircle,
  PenLine,
  Save,
  Search,
  Trash2,
  User,
  Users,
} from 'lucide-react';
import {
  deleteCommunityPost,
  fetchCommunityDetail,
  fetchCommunityList,
  saveCommunityPost,
  type CommunityDetail,
  type CommunityListItem,
} from '../../lib/api';
import { getLcAuth } from '../../lib/auth';
import { g5LoginUrl } from '../../lib/urls';

const pageShell = 'bg-slate-50 min-h-screen pt-32 pb-16';
const primaryButton =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-cyan-500 disabled:opacity-60';

function CommunityHero({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? 'mb-7' : 'mb-10'}>
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-700">
        <Users size={14} /> LinkConnect Community
      </div>
      <h1 className={`${compact ? 'text-2xl md:text-3xl' : 'text-3xl md:text-4xl'} font-bold tracking-tight text-slate-900`}>
        자유게시판
      </h1>
      {!compact ? (
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
          제휴마케팅 정보와 운영 경험을 자유롭게 나누는 링크커넥트 커뮤니티입니다.
        </p>
      ) : null}
    </div>
  );
}

export function CommunityList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
  const q = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(q);
  const [items, setItems] = useState<CommunityListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [canWrite, setCanWrite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const auth = getLcAuth();

  useEffect(() => setQuery(q), [q]);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchCommunityList({ page, q })
      .then((data) => {
        if (cancelled) return;
        setItems(data.items);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setCanWrite(data.permissions.canWrite);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : '게시글을 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, q]);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    const next = new URLSearchParams();
    if (query.trim()) next.set('q', query.trim());
    next.set('page', '1');
    setSearchParams(next);
  };

  const goPage = (nextPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(nextPage));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={pageShell}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <CommunityHero />

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/80 p-4 md:flex-row md:items-center md:justify-between md:p-5">
            <form onSubmit={handleSearch} className="relative w-full max-w-md">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="제목 · 내용 · 작성자 검색"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
              />
            </form>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-slate-500">
                총 <strong className="text-slate-900">{total}</strong>건
              </span>
              {canWrite ? (
                <Link to="/community/write" className={primaryButton}>
                  <PenLine size={16} /> 글쓰기
                </Link>
              ) : (
                <a href={g5LoginUrl('/community/write')} className={primaryButton}>
                  로그인 후 글쓰기
                </a>
              )}
            </div>
          </div>

          {loading ? (
            <div className="p-16 text-center text-slate-400">게시글을 불러오는 중입니다…</div>
          ) : error ? (
            <div className="p-12 text-center text-rose-600">{error}</div>
          ) : items.length === 0 ? (
            <div className="p-16 text-center">
              <MessageCircle size={42} className="mx-auto mb-4 text-slate-300" />
              <p className="font-semibold text-slate-700">{q ? '검색 결과가 없습니다.' : '첫 번째 이야기를 남겨보세요.'}</p>
              <p className="mt-1 text-sm text-slate-400">정보와 경험을 자유롭게 공유할 수 있습니다.</p>
            </div>
          ) : (
            <>
              <div className="hidden grid-cols-[80px_1fr_130px_110px_90px] gap-3 border-b border-slate-100 px-5 py-3 text-xs font-bold text-slate-400 md:grid">
                <span className="text-center">번호</span><span>제목</span><span className="text-center">작성자</span>
                <span className="text-center">작성일</span><span className="text-center">조회</span>
              </div>
              <ul className="divide-y divide-slate-100">
                {items.map((item) => (
                  <li key={item.id}>
                    <Link to={`/community/${item.id}`} className="group block px-4 py-4 transition-colors hover:bg-cyan-50/40 md:px-5">
                      <div className="md:grid md:grid-cols-[80px_1fr_130px_110px_90px] md:items-center md:gap-3">
                        <span className="hidden text-center text-sm tabular-nums text-slate-400 md:block">{item.id}</span>
                        <span className="block truncate font-semibold text-slate-900 transition-colors group-hover:text-cyan-700">{item.subject}</span>
                        <div className="mt-2 flex items-center gap-3 text-xs text-slate-400 md:mt-0 md:contents">
                          <span className="md:text-center">{item.author}</span>
                          <span className="md:text-center">{item.date}</span>
                          <span className="inline-flex items-center gap-1 md:justify-center"><Eye size={13} /> {item.hit}</span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          {totalPages > 1 ? (
            <div className="flex items-center justify-center gap-2 border-t border-slate-100 bg-slate-50/50 p-5">
              <button type="button" disabled={page <= 1} onClick={() => goPage(page - 1)} className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:opacity-40">
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                const number = totalPages > 5 ? start + index : index + 1;
                return (
                  <button
                    key={number}
                    type="button"
                    onClick={() => goPage(number)}
                    className={`h-9 min-w-9 rounded-lg text-sm font-bold ${number === page ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-600 hover:bg-white'}`}
                  >
                    {number}
                  </button>
                );
              })}
              <button type="button" disabled={page >= totalPages} onClick={() => goPage(page + 1)} className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:opacity-40">
                <ChevronRight size={18} />
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

export function CommunityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const postId = Number(id ?? 0);
  const [item, setItem] = useState<CommunityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!postId) {
      setError('잘못된 접근입니다.');
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetchCommunityDetail(postId)
      .then((data) => {
        if (!cancelled) setItem(data.item);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : '게시글을 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [postId]);

  const handleDelete = async () => {
    if (!item || !window.confirm('이 게시글을 삭제하시겠습니까?')) return;
    setDeleting(true);
    try {
      await deleteCommunityPost(item.id);
      navigate('/community');
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading || error || !item) {
    return (
      <div className={`${pageShell} flex items-center justify-center`}>
        <div className="text-center text-slate-500">
          <p>{loading ? '게시글을 불러오는 중입니다…' : error || '게시글을 찾을 수 없습니다.'}</p>
          {!loading ? <Link to="/community" className="mt-4 inline-block font-bold text-cyan-600">목록으로</Link> : null}
        </div>
      </div>
    );
  }

  return (
    <div className={pageShell}>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link to="/community" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-cyan-600">
          <ArrowLeft size={16} /> 자유게시판 목록
        </Link>
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <header className="border-b border-slate-100 p-6 md:p-8">
            <h1 className="mb-5 text-2xl font-bold leading-snug text-slate-900 md:text-3xl">{item.subject}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5"><User size={15} /> {item.author}</span>
              <span className="inline-flex items-center gap-1.5"><Calendar size={15} /> {item.date}</span>
              <span className="inline-flex items-center gap-1.5"><Eye size={15} /> {item.hit}</span>
            </div>
          </header>
          <div className="min-h-64 whitespace-pre-wrap p-6 text-[15px] leading-8 text-slate-700 md:p-8">{item.contentPlain}</div>
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-5 md:px-8">
            <div className="flex gap-2">
              {item.prevId > 0 ? <Link to={`/community/${item.prevId}`} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">이전글</Link> : null}
              {item.nextId > 0 ? <Link to={`/community/${item.nextId}`} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">다음글</Link> : null}
            </div>
            <div className="flex gap-2">
              {item.canEdit ? <Link to={`/community/${item.id}/edit`} className={primaryButton}><Edit3 size={15} /> 수정</Link> : null}
              {item.canDelete ? (
                <button type="button" disabled={deleting} onClick={handleDelete} className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-60">
                  <Trash2 size={15} /> {deleting ? '삭제 중…' : '삭제'}
                </button>
              ) : null}
            </div>
          </footer>
        </article>
      </div>
    </div>
  );
}

export function CommunityForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const postId = id ? Number(id) : 0;
  const isEdit = postId > 0;
  const auth = getLcAuth();
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth.loggedIn || !isEdit) return;
    let cancelled = false;
    fetchCommunityDetail(postId)
      .then((data) => {
        if (cancelled) return;
        if (!data.item.canEdit) {
          setForbidden(true);
          return;
        }
        setSubject(data.item.subject);
        setContent(data.item.contentPlain);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : '게시글을 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [auth.loggedIn, isEdit, postId]);

  if (!auth.loggedIn) {
    window.location.replace(g5LoginUrl(isEdit ? `/community/${postId}/edit` : '/community/write'));
    return <div className={`${pageShell} text-center text-slate-500`}>로그인 페이지로 이동 중입니다…</div>;
  }
  if (loading) return <div className={`${pageShell} text-center text-slate-500`}>게시글을 불러오는 중입니다…</div>;
  if (forbidden) return <div className={`${pageShell} text-center text-slate-500`}>수정 권한이 없습니다.</div>;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!subject.trim() || !content.trim()) {
      setError('제목과 내용을 모두 입력해 주세요.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const result = await saveCommunityPost({
        action: isEdit ? 'update' : 'save',
        id: isEdit ? postId : undefined,
        subject: subject.trim(),
        content: content.trim(),
      });
      navigate(`/community/${result.item.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={pageShell}>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <CommunityHero compact />
        <form onSubmit={handleSubmit} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="space-y-6 p-6 md:p-8">
            <div>
              <label htmlFor="community-subject" className="mb-2 block text-sm font-bold text-slate-700">제목</label>
              <input
                id="community-subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                maxLength={255}
                placeholder="함께 나누고 싶은 이야기의 제목을 입력해 주세요."
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
              />
              <p className="mt-1 text-right text-xs text-slate-400">{subject.length} / 255</p>
            </div>
            <div>
              <label htmlFor="community-content" className="mb-2 block text-sm font-bold text-slate-700">내용</label>
              <textarea
                id="community-content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={16}
                placeholder="서로에게 도움이 되는 정보와 경험을 자유롭게 작성해 주세요."
                className="min-h-80 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 leading-7 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
            <div className="rounded-xl border border-cyan-100 bg-cyan-50/60 px-4 py-3 text-xs leading-relaxed text-cyan-900">
              개인정보, 연락처, 비방·광고성 내용은 노출되지 않도록 주의해 주세요.
            </div>
            {error ? <p className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p> : null}
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-5 md:px-8">
            <Link to={isEdit ? `/community/${postId}` : '/community'} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600">취소</Link>
            <button type="submit" disabled={submitting} className={primaryButton}>
              <Save size={16} /> {submitting ? '저장 중…' : isEdit ? '수정 완료' : '게시글 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
