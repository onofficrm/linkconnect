import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  ExternalLink,
  Link2,
  Sparkles,
} from 'lucide-react';
import {
  PartnerLpMerchant,
  PublicCampaign,
  buildPartnerLpDeeplink,
  fetchPartnerLpMerchant,
  fetchPublicCpsMerchant,
} from '../../lib/api';
import { getLcAuth, isLcActivePartner, isLcLoggedIn } from '../../lib/auth';
import { g5LoginUrl, spaReturnUrl } from '../../lib/urls';
import { openLandingPage } from '../../lib/utils';
import { CpsChannelGuide } from '../../components/cps/CpsChannelGuide';
import {
  CpsDeeplinkGuide,
  formatCpsCommissionRate,
  sanitizeCpsPublicCopy,
} from '../../components/cps/CpsShared';

export function CpsMerchantDetail() {
  const { code = '' } = useParams<{ code: string }>();
  const [merchant, setMerchant] = useState<PublicCampaign | null>(null);
  const [partnerItem, setPartnerItem] = useState<PartnerLpMerchant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [deeplinkResult, setDeeplinkResult] = useState('');
  const [deeplinkError, setDeeplinkError] = useState('');
  const [busy, setBusy] = useState(false);

  const auth = getLcAuth();
  const loggedIn = isLcLoggedIn();
  const isActivePartner = isLcActivePartner();
  const detailPath = `/cps/${encodeURIComponent(code)}`;

  const notify = (msg: string) => {
    setMessage(msg);
    window.setTimeout(() => setMessage(''), 2500);
  };

  const loadPublic = useCallback(() => {
    if (!code.trim()) {
      setError('광고주 코드가 없습니다.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    fetchPublicCpsMerchant(code)
      .then((item) => setMerchant(item))
      .catch((e) => {
        setMerchant(null);
        setError(e instanceof Error ? e.message : '광고주를 불러오지 못했습니다.');
      })
      .finally(() => setLoading(false));
  }, [code]);

  useEffect(() => {
    loadPublic();
  }, [loadPublic]);

  useEffect(() => {
    if (!merchant || !isActivePartner) {
      setPartnerItem(null);
      return;
    }
    const merchantCode = (merchant.merchantCode || merchant.code || '').trim();
    fetchPartnerLpMerchant({ code: merchantCode, lpmId: merchant.lpmId || merchant.id })
      .then((d) => setPartnerItem(d.item))
      .catch(() => setPartnerItem(null));
  }, [merchant, isActivePartner]);

  const promoUrl = partnerItem?.promoUrl || '';
  const deeplinkYn = partnerItem?.deeplinkYn || merchant?.deeplinkYn || 'N';
  const commission = formatCpsCommissionRate(
    partnerItem?.partnerCommission ||
      partnerItem?.commissionMobile ||
      partnerItem?.commissionPc ||
      merchant?.approvalRate ||
      merchant?.priceFormatted ||
      '-',
  );
  const cookie = merchant?.avgTime || (partnerItem?.returnDay ? `${partnerItem.returnDay}일` : '-');
  const notice = sanitizeCpsPublicCopy(partnerItem?.notice || merchant?.description || '');
  const settlement = sanitizeCpsPublicCopy(partnerItem?.settlement || merchant?.settlement || '');
  const whenTrans = sanitizeCpsPublicCopy(partnerItem?.whenTrans || merchant?.whenTrans || '');
  const landingUrl = partnerItem?.merchantUrl || merchant?.landingUrl || '';
  const logo = partnerItem?.merchantLogo || merchant?.thumbnailUrl || '';
  const title = partnerItem?.merchantName || merchant?.title || '';
  const merchantCode = partnerItem?.merchantCode || merchant?.merchantCode || merchant?.code || code;
  const category = partnerItem?.categoryName || merchant?.category || '';
  const forbidden = sanitizeCpsPublicCopy(
    merchant?.forbiddenChannels ||
      [partnerItem?.denyAd, partnerItem?.denyProduct].filter(Boolean).join(', '),
  );
  const allowed = merchant?.allowedChannels || '블로그, SNS, 유튜브, 커뮤니티';
  const denyAd = sanitizeCpsPublicCopy(partnerItem?.denyAd || '');
  const denyProduct = sanitizeCpsPublicCopy(partnerItem?.denyProduct || '');

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      notify('링크가 복사되었습니다.');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      notify('복사에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <main className="min-h-[50vh] flex items-center justify-center bg-slate-50">
        <p className="text-slate-400">불러오는 중…</p>
      </main>
    );
  }

  if (error || !merchant) {
    return (
      <main className="min-h-[50vh] flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 text-center">
          <h1 className="text-xl font-bold text-slate-900 mb-2">광고주를 찾을 수 없습니다</h1>
          <p className="text-sm text-slate-500 mb-6">{error || '비공개 또는 종료된 캠페인일 수 있습니다.'}</p>
          <Link to="/cps" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">
            <ArrowLeft size={16} />
            CPS 목록으로
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-slate-50 min-h-screen pb-16">
      <section className="bg-slate-950 text-white pt-24 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Link to="/cps" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-6 transition-colors">
            <ArrowLeft size={16} />
            CPS 광고주 목록
          </Link>
          <div className="flex flex-col md:flex-row gap-6 md:items-center">
            <div className="w-24 h-16 rounded-2xl bg-white border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
              {logo ? (
                <img src={logo} alt="" className="w-full h-full object-contain p-2" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-xs text-slate-400 font-bold">LOGO</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {category ? (
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-xs font-semibold text-slate-200">{category}</span>
                ) : null}
                <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-xs font-bold text-cyan-300">CPS</span>
                {merchant.recommended || merchant.badge ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400/20 text-xs font-bold text-amber-200">
                    <Sparkles size={12} />
                    {merchant.badge || '추천'}
                  </span>
                ) : null}
                {deeplinkYn === 'Y' ? (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-xs font-bold text-emerald-300">딥링크 지원</span>
                ) : null}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold truncate">{title}</h1>
              <p className="text-sm text-slate-400 mt-1 font-mono">{merchantCode}</p>
            </div>
            <div className="flex gap-3 shrink-0">
              <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-center min-w-[100px]">
                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">수수료</div>
                <div className="text-xl font-bold text-cyan-300 mt-1 tabular-nums">{commission}</div>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-center min-w-[100px]">
                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">쿠키</div>
                <div className="text-xl font-bold text-white mt-1 tabular-nums">{cookie}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        {message ? (
          <div className="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2">{message}</div>
        ) : null}

        <div className="grid lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)] gap-6 items-start">
          <div className="space-y-5">
            <article className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-3">광고주 안내</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                {notice || '상세 안내가 등록되지 않았습니다.'}
              </p>
              {(settlement || whenTrans) ? (
                <dl className="mt-5 grid sm:grid-cols-2 gap-3 text-sm">
                  {settlement ? (
                    <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
                      <dt className="text-xs font-bold text-slate-400 mb-0.5">정산 기준</dt>
                      <dd className="text-slate-700">{settlement}</dd>
                    </div>
                  ) : null}
                  {whenTrans ? (
                    <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
                      <dt className="text-xs font-bold text-slate-400 mb-0.5">실적 반영</dt>
                      <dd className="text-slate-700">{whenTrans}</dd>
                    </div>
                  ) : null}
                </dl>
              ) : null}
            </article>

            <article className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-3">홍보 채널 안내</h2>
              <CpsChannelGuide
                allowedChannels={allowed}
                forbiddenChannels={forbidden}
                merchantName={title}
              />
              {(denyAd || denyProduct) ? (
                <div className="mt-4 space-y-2 text-sm">
                  {denyAd ? (
                    <div className="rounded-xl bg-amber-50 border border-amber-100 px-3 py-2 text-amber-900">
                      <span className="font-bold">광고 제한: </span>
                      {denyAd}
                    </div>
                  ) : null}
                  {denyProduct ? (
                    <div className="rounded-xl bg-rose-50 border border-rose-100 px-3 py-2 text-rose-900">
                      <span className="font-bold">상품 제한: </span>
                      {denyProduct}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </article>

            {landingUrl ? (
              <button
                type="button"
                onClick={() => openLandingPage(landingUrl)}
                className="inline-flex items-center gap-2 text-sm font-bold text-cyan-700 hover:text-cyan-800"
              >
                <ExternalLink size={16} />
                쇼핑몰 사이트 미리보기
              </button>
            ) : null}
          </div>

          <aside className="lg:sticky lg:top-24 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-1">내 홍보 링크</h2>
              <p className="text-xs text-slate-500 mb-4">
                파트너별 개별 추적 링크입니다. 이 링크로 유입·구매가 기록됩니다.
              </p>

              {!loggedIn ? (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    로그인 후 파트너 계정으로 개별 홍보 링크를 발급받을 수 있습니다.
                  </p>
                  <a
                    href={g5LoginUrl(spaReturnUrl(detailPath))}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-colors"
                  >
                    <Link2 size={16} />
                    로그인하고 링크 받기
                  </a>
                  <Link
                    to="/partner"
                    className="block text-center text-xs text-slate-500 hover:text-slate-700"
                  >
                    파트너 센터 알아보기
                  </Link>
                </div>
              ) : !isActivePartner ? (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {auth.isPartner
                      ? '파트너 계정 활성화 후 홍보 링크를 발급받을 수 있습니다.'
                      : '파트너 등록 후 이 광고주의 개별 홍보 링크를 발급받을 수 있습니다.'}
                  </p>
                  <Link
                    to="/partner"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition-colors"
                  >
                    파트너센터 이동
                  </Link>
                </div>
              ) : !promoUrl ? (
                <p className="text-sm text-slate-500">홍보 링크를 불러오는 중이거나 발급할 수 없습니다.</p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-bold text-slate-500 mb-1.5">메인 홍보 링크</div>
                    <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs font-mono break-all text-slate-700">
                      {promoUrl}
                    </div>
                    <button
                      type="button"
                      onClick={() => copyText(promoUrl)}
                      className="mt-2 w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold"
                    >
                      {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                      링크 복사
                    </button>
                  </div>

                  {deeplinkYn === 'Y' ? (
                    <div className="border-t border-slate-100 pt-4 space-y-3">
                      <div>
                        <div className="text-sm font-bold text-slate-900">상품 딥링크</div>
                        <div className="mt-2">
                          <CpsDeeplinkGuide compact />
                        </div>
                      </div>
                      <label className="block text-sm">
                        <span className="font-medium text-slate-700">상품 페이지 URL</span>
                        <input
                          value={productUrl}
                          onChange={(e) => setProductUrl(e.target.value)}
                          placeholder="https://..."
                          className="mt-1.5 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-mono"
                        />
                      </label>
                      {deeplinkError ? (
                        <div className="text-sm text-rose-700 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
                          {deeplinkError}
                        </div>
                      ) : null}
                      {deeplinkResult ? (
                        <div className="text-xs break-all bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                          <div className="font-bold text-emerald-800 mb-1">생성된 딥링크</div>
                          <div className="text-slate-700">{deeplinkResult}</div>
                          <button
                            type="button"
                            className="mt-2 text-emerald-700 font-bold"
                            onClick={() => copyText(deeplinkResult)}
                          >
                            복사
                          </button>
                        </div>
                      ) : null}
                      <button
                        type="button"
                        disabled={busy || !productUrl.trim()}
                        className="w-full px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold disabled:opacity-50"
                        onClick={async () => {
                          setBusy(true);
                          setDeeplinkError('');
                          try {
                            const res = await buildPartnerLpDeeplink({
                              merchantCode,
                              productUrl,
                            });
                            setDeeplinkResult(res.promoUrl);
                            notify('딥링크가 생성되었습니다.');
                          } catch (e) {
                            setDeeplinkError(e instanceof Error ? e.message : '딥링크 생성에 실패했습니다.');
                          } finally {
                            setBusy(false);
                          }
                        }}
                      >
                        {busy ? '생성 중…' : '딥링크 생성'}
                      </button>
                    </div>
                  ) : null}

                  <Link
                    to="/partner/cps/links"
                    className="block text-center text-xs text-slate-500 hover:text-emerald-700"
                  >
                    내 홍보링크 목록 보기
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
