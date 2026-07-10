import { useCallback, useEffect, useState } from 'react';
import { Copy, CheckCircle2 } from 'lucide-react';
import { PartnerLayout } from '../../../layouts/PartnerLayout';
import { CpsPartnerNotice, PartnerCpsSubnav } from '../../../components/cps/CpsShared';
import { PartnerLpMerchant, fetchPartnerLpMerchants } from '../../../lib/api';

export function PartnerCpsLinks() {
  const [items, setItems] = useState<PartnerLpMerchant[]>([]);
  const [copied, setCopied] = useState<number | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    fetchPartnerLpMerchants()
      .then((d) => setItems(d.items))
      .catch((e) => setError(e instanceof Error ? e.message : '조회 실패'));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <PartnerLayout activeMenu="cps" title="내 홍보링크">
      <PartnerCpsSubnav active="links" />
      <CpsPartnerNotice />
      {error ? <div className="mt-4 text-sm text-rose-600">{error}</div> : null}
      <div className="mt-6 space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-16 text-slate-400 bg-white border rounded-2xl">홍보링크가 없습니다.</div>
        ) : items.map((m) => (
          <div key={m.lpmId} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="font-bold truncate">{m.merchantName}</div>
              <div className="text-xs text-slate-500 font-mono break-all mt-1">{m.promoUrl}</div>
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-1 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold shrink-0"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(m.promoUrl);
                  setCopied(m.lpmId);
                  setTimeout(() => setCopied(null), 2000);
                } catch {
                  /* ignore */
                }
              }}
            >
              {copied === m.lpmId ? <CheckCircle2 size={16} /> : <Copy size={16} />} 복사
            </button>
          </div>
        ))}
      </div>
    </PartnerLayout>
  );
}
