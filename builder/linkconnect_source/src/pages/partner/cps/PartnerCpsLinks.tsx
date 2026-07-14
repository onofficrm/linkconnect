import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, CheckCircle2, Link2 } from 'lucide-react';
import { PartnerLayout } from '../../../layouts/PartnerLayout';
import { CpsPartnerNotice, PartnerCpsSubnav } from '../../../components/cps/CpsShared';
import {
  PartnerLpMerchant,
  buildPartnerLpShortlink,
  fetchPartnerLpMerchants,
} from '../../../lib/api';

export function PartnerCpsLinks() {
  const [items, setItems] = useState<PartnerLpMerchant[]>([]);
  const [shortUrls, setShortUrls] = useState<Record<number, string>>({});
  const [copied, setCopied] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const notify = (msg: string) => {
    setMessage(msg);
    window.setTimeout(() => setMessage(''), 2500);
  };

  const load = useCallback(() => {
    fetchPartnerLpMerchants()
      .then((d) => setItems(d.items))
      .catch((e) => setError(e instanceof Error ? e.message : '조회 실패'));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const copyText = async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      notify('링크가 복사되었습니다.');
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      notify('복사에 실패했습니다.');
    }
  };

  return (
    <PartnerLayout activeMenu="cps" title="내 홍보링크">
      <PartnerCpsSubnav active="links" />
      <CpsPartnerNotice />
      {message ? (
        <div className="mt-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2">
          {message}
        </div>
      ) : null}
      {error ? <div className="mt-4 text-sm text-rose-600">{error}</div> : null}
      <div className="mt-6 space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-16 text-slate-400 bg-white border rounded-2xl">홍보링크가 없습니다.</div>
        ) : (
          items.map((m) => {
            const displayUrl = shortUrls[m.lpmId] || m.promoUrl;
            return (
              <div
                key={m.lpmId}
                className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/cps/${encodeURIComponent(m.merchantCode)}`}
                    className="font-bold truncate hover:text-emerald-700 block"
                  >
                    {m.merchantName}
                  </Link>
                  <div className="text-xs text-slate-500 font-mono break-all mt-1">{displayUrl}</div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={busyId === m.lpmId}
                    className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl border border-cyan-200 bg-cyan-50 text-cyan-800 text-sm font-bold disabled:opacity-50"
                    onClick={async () => {
                      setBusyId(m.lpmId);
                      try {
                        const res = await buildPartnerLpShortlink({ merchantCode: m.merchantCode });
                        setShortUrls((prev) => ({ ...prev, [m.lpmId]: res.shortUrl }));
                        notify('숏링크로 변환되었습니다.');
                      } catch (e) {
                        notify(e instanceof Error ? e.message : '숏링크 변환에 실패했습니다.');
                      } finally {
                        setBusyId(null);
                      }
                    }}
                  >
                    <Link2 size={16} />
                    {busyId === m.lpmId ? '변환 중…' : '숏링크 변환'}
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-1 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold"
                    onClick={() => copyText(displayUrl, m.lpmId)}
                  >
                    {copied === m.lpmId ? <CheckCircle2 size={16} /> : <Copy size={16} />} 복사
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </PartnerLayout>
  );
}
