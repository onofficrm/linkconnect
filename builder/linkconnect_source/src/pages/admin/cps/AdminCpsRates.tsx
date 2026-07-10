import { useCallback, useEffect, useState } from 'react';
import { AdminLayout } from '../../../layouts/AdminLayout';
import { AdminCpsSubnav, formatWon } from '../../../components/cps/CpsShared';
import { LpMerchant, LpNetworkConfig, fetchAdminLpConfig, fetchAdminLpMerchants, saveAdminLpConfig, updateAdminLpMerchant } from '../../../lib/api';

export function AdminCpsRates() {
  const [config, setConfig] = useState<LpNetworkConfig | null>(null);
  const [items, setItems] = useState<LpMerchant[]>([]);
  const [defaultRate, setDefaultRate] = useState('70');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    fetchAdminLpConfig().then((d) => {
      setConfig(d.config);
      setDefaultRate(String(d.config.defaultPartnerRate ?? 70));
    });
    fetchAdminLpMerchants({ approved: true, limit: 300 }).then((d) => setItems(d.items));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AdminLayout activeMenu="cps" title="파트너 수익 설정" description="기본·광고주별 지급률">
      <AdminCpsSubnav active="rates" />
      {msg ? <div className="mb-4 text-sm text-cyan-700 bg-cyan-50 rounded-xl px-4 py-2">{msg}</div> : null}
      <div className="bg-white border rounded-2xl p-5 mb-6 flex flex-wrap gap-3 items-end">
        <label className="text-sm">기본 파트너 지급률 (%)
          <input value={defaultRate} onChange={(e) => setDefaultRate(e.target.value)} className="mt-1 block w-32 border rounded-xl px-3 py-2" />
        </label>
        <button
          type="button"
          disabled={busy}
          className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-sm font-bold"
          onClick={async () => {
            setBusy(true);
            try {
              const r = await saveAdminLpConfig({ defaultPartnerRate: Number(defaultRate) });
              setConfig(r.config);
              setMsg(r.message);
            } finally {
              setBusy(false);
            }
          }}
        >
          기본값 저장
        </button>
        <span className="text-xs text-slate-500">현재 기본 {config?.defaultPartnerRate ?? '—'}%</span>
      </div>
      <div className="bg-white border rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="text-left px-4 py-3">광고주</th>
              <th className="text-left px-3 py-3">코드</th>
              <th className="text-left px-3 py-3">LP 커미션</th>
              <th className="text-right px-3 py-3">지급률</th>
              <th className="text-left px-3 py-3">노출 커미션</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr key={m.lpmId} className="border-t">
                <td className="px-4 py-2">{m.merchantName}</td>
                <td className="px-3 py-2 font-mono text-xs">{m.merchantCode}</td>
                <td className="px-3 py-2 text-xs">{m.commissionMobile || m.commissionPc || '—'}</td>
                <td className="px-3 py-2 text-right font-bold">{m.partnerRate}%</td>
                <td className="px-3 py-2 text-xs">{m.partnerDisplayCommission || '—'}</td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    className="text-xs font-bold text-cyan-700"
                    onClick={async () => {
                      const v = window.prompt('지급률 (%)', String(m.partnerRate));
                      if (v == null) return;
                      await updateAdminLpMerchant({ lpmId: m.lpmId, partnerRate: Number(v) });
                      setMsg('저장됨');
                      load();
                    }}
                  >
                    변경
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500 mt-3">파트너 확정수익 = LP 커미션 × 지급률. 수동 금액 변경은 제공하지 않습니다. (참고: 기본 {formatWon(Number(defaultRate))}%)</p>
    </AdminLayout>
  );
}
