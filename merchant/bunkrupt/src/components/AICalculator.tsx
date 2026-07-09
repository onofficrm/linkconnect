import { useState } from 'react';
import { Calculator, ChevronRight, Loader2 } from 'lucide-react';

export default function AICalculator() {
  const [debt, setDebt] = useState('');
  const [income, setIncome] = useState('');
  const [dependents, setDependents] = useState('1');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    estimatedRate: string;
    monthlyPayment: string;
    message: string;
  } | null>(null);
  const [error, setError] = useState('');

  const scrollToForm = () => {
    document.getElementById("consult-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!debt || !income) {
      setError('채무액과 월 소득을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    const debtNum = parseInt(debt, 10);
    const incomeNum = parseInt(income, 10);
    const dep = parseInt(dependents, 10) || 1;

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          debt: debt + '만원',
          income: income + '만원',
          dependents: dependents
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        setResult(data);
        setLoading(false);
        return;
      }
    } catch {
      /* 정적 배포 환경 — 로컬 추정 fallback */
    }

    const minLiving = 120 + dep * 40;
    const available = Math.max(0, incomeNum - minLiving);
    const months = 36;
    const totalPay = available * months;
    const rateLow = debtNum > 0 ? Math.max(20, Math.min(85, Math.round((1 - totalPay / debtNum) * 100))) : 30;
    const rateHigh = Math.min(90, rateLow + 15);
    const monthlyPay = available > 0 ? Math.round(available) : Math.max(10, Math.round(debtNum * 0.015));

    setResult({
      estimatedRate: `${rateLow}% ~ ${rateHigh}%`,
      monthlyPayment: monthlyPay > 0 ? `약 ${monthlyPay}만원` : '상담 후 확인',
      message:
        debtNum > 0 && incomeNum > 0
          ? `입력하신 채무와 소득 기준으로 개인회생 검토가 가능할 수 있습니다. 최저생계비와 변제 기간을 고려한 참고치이며, 정확한 판단은 전문가 상담을 통해 확인하시는 것이 좋습니다.`
          : `현재 상황에 맞는 제도를 안내드릴 수 있습니다. 아래 상담 신청을 남겨주시면 순차적으로 연락드리겠습니다.`,
    });
    setLoading(false);
  };

  return (
    <section className="bg-white px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center sm:mb-14">
          <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-cta/10">
            <Calculator className="h-6 w-6 text-cta" />
          </div>
          <h2 className="mb-4 text-[26px] font-bold leading-tight text-main sm:text-3xl">
            AI 예상 탕감액 1분 계산기
          </h2>
          <p className="text-sm text-gray-500 sm:text-base">
            대략적인 채무액과 소득을 입력하시면,<br className="sm:hidden" /> AI가 일반적인 기준에 따른 예상 결과를 분석해드립니다.
          </p>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-bg/50 p-6 shadow-sm sm:p-10">
          {!result ? (
            <form onSubmit={handleCalculate} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="debt_calc" className="mb-2 block text-sm font-bold text-gray-800">
                    대략적인 총 채무액 (만원)
                  </label>
                  <input 
                    type="number" 
                    id="debt_calc"
                    value={debt}
                    onChange={(e) => setDebt(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white p-4 text-[15px] text-gray-900 focus:border-cta focus:outline-none focus:ring-1 focus:ring-cta"
                    placeholder="예: 5000"
                  />
                </div>
                <div>
                  <label htmlFor="income_calc" className="mb-2 block text-sm font-bold text-gray-800">
                    본인의 세후 월 소득 (만원)
                  </label>
                  <input 
                    type="number" 
                    id="income_calc"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white p-4 text-[15px] text-gray-900 focus:border-cta focus:outline-none focus:ring-1 focus:ring-cta"
                    placeholder="예: 250"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="dependents" className="mb-2 block text-sm font-bold text-gray-800">
                  부양가족 수 (본인 포함)
                </label>
                <select 
                  id="dependents"
                  value={dependents}
                  onChange={(e) => setDependents(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white p-4 text-[15px] text-gray-900 focus:border-cta focus:outline-none focus:ring-1 focus:ring-cta"
                >
                  <option value="1">1명 (본인 1인 가구)</option>
                  <option value="2">2명</option>
                  <option value="3">3명</option>
                  <option value="4">4명</option>
                  <option value="5">5명 이상</option>
                </select>
              </div>

              {error && (
                <p className="text-sm font-medium text-warning">{error}</p>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-main py-4.5 text-[17px] font-bold text-white shadow-lg transition-transform hover:bg-gray-800 active:scale-[0.98] disabled:bg-gray-400"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    AI가 분석 중입니다...
                  </>
                ) : (
                  '예상 탕감률 확인하기'
                )}
              </button>
            </form>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                <h3 className="mb-6 text-center text-lg font-bold text-gray-900">
                  AI 예상 분석 결과
                </h3>
                
                <div className="mb-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-bg p-5 text-center">
                    <p className="mb-1 text-sm font-medium text-gray-500">예상 탕감률</p>
                    <p className="text-2xl font-black text-cta">{result.estimatedRate}</p>
                  </div>
                  <div className="rounded-xl bg-bg p-5 text-center">
                    <p className="mb-1 text-sm font-medium text-gray-500">예상 월 변제금</p>
                    <p className="text-2xl font-black text-main">{result.monthlyPayment}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-point/30 bg-[#fbf9f4] p-5">
                  <p className="text-[14.5px] leading-relaxed text-gray-800">
                    {result.message}
                  </p>
                </div>
              </div>

              <div className="text-center">
                <p className="mb-4 text-xs text-gray-400">
                  * 본 결과는 AI가 추정한 참고용이며, 실제 법원의 결정과 다를 수 있습니다.<br />
                  정확한 진단은 아래 양식을 통해 무료로 상담받아보세요.
                </p>
                <div className="flex gap-3 justify-center">
                  <button 
                    onClick={() => setResult(null)}
                    className="rounded-xl border border-gray-300 bg-white px-6 py-3.5 text-[15px] font-bold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    다시 계산하기
                  </button>
                  <button 
                    onClick={scrollToForm}
                    className="flex items-center gap-1 rounded-xl bg-cta px-6 py-3.5 text-[15px] font-bold text-white shadow-md transition-colors hover:bg-blue-700"
                  >
                    정확한 자격진단 신청
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
