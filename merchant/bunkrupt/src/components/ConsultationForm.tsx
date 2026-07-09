import { useState, type FormEvent } from 'react';
import { buildInquiryText, submitConsultation } from '../lib/linkconnect';
import { getTrackingForSubmit } from '../lib/partnerData';
import { usePartnerContext } from '../context/PartnerContext';

const DEBT_LABELS: Record<string, string> = {
  under_10m: '1천만원 이하',
  '10m_to_30m': '1천만원~3천만원',
  '30m_to_50m': '3천만원~5천만원',
  '50m_to_100m': '5천만원~1억원',
  over_100m: '1억원 이상',
};

const INCOME_LABELS: Record<string, string> = {
  none: '없음',
  under_1m: '100만원 이하',
  '1m_to_2m': '100만원~200만원',
  '2m_to_3m': '200만원~300만원',
  over_3m: '300만원 이상',
};

const STATUS_LABELS: Record<string, string> = {
  before: '연체 전',
  during: '연체 중',
  action: '독촉/압류 진행 중',
};

export default function ConsultationForm() {
  const { data: partnerData } = usePartnerContext();
  const tracking = getTrackingForSubmit();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [debt, setDebt] = useState('');
  const [income, setIncome] = useState('');
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');
  const [privacy, setPrivacy] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!name.trim() || !phone.trim()) {
      setFeedback({ type: 'err', text: '이름과 연락처를 입력해 주세요.' });
      return;
    }
    if (!privacy) {
      setFeedback({ type: 'err', text: '개인정보 수집 및 상담 연락에 동의해 주세요.' });
      return;
    }

    setSubmitting(true);
    const result = await submitConsultation(
      {
        name,
        phone,
        inquiry: buildInquiryText({
          debt: debt ? DEBT_LABELS[debt] || debt : '',
          income: income ? INCOME_LABELS[income] || income : '',
          status: status ? STATUS_LABELS[status] || status : '',
          message,
        }),
      },
      {
        lkCode: tracking.lkCode,
        channel: tracking.channel,
        sub_id: tracking.sub_id,
        utm_source: tracking.utm_source,
        utm_medium: tracking.utm_medium,
        utm_campaign: tracking.utm_campaign,
      },
    );
    setSubmitting(false);

    if (result.ok) {
      setFeedback({ type: 'ok', text: result.message });
      setName('');
      setPhone('');
      setDebt('');
      setIncome('');
      setStatus('');
      setMessage('');
    } else {
      setFeedback({ type: 'err', text: result.message });
    }
  };

  return (
    <section className="bg-bg px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl sm:p-12" id="consult-form">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-[26px] font-bold tracking-tight text-main sm:text-3xl">
              개인회생 자격진단 신청
            </h2>
            <p className="text-[15px] leading-relaxed text-gray-500">
              현재 상황을 남겨주시면 개인회생 검토 가능 여부를 확인 후 순차적으로 연락드립니다.
            </p>
          </div>

          {feedback && (
            <div
              className={`mb-6 rounded-xl px-4 py-3 text-[14px] font-medium ${
                feedback.type === 'ok'
                  ? 'border border-green-200 bg-green-50 text-green-800'
                  : 'border border-red-200 bg-red-50 text-red-800'
              }`}
              role="alert"
            >
              {feedback.text}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <input type="hidden" name="partner_id" value={partnerData.partner_id} />
            <input type="hidden" name="campaign_id" value={partnerData.campaign_id} />
            <input type="hidden" name="merchant_id" value={partnerData.merchant_id} />
            <input type="hidden" name="utm_source" value={partnerData.utm_source} />
            <input type="hidden" name="utm_medium" value={partnerData.utm_medium} />
            <input type="hidden" name="utm_campaign" value={partnerData.utm_campaign} />
            <input type="hidden" name="lkCode" value={tracking.lkCode} />
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-bold text-gray-800">
                  이름
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  maxLength={50}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 text-[15px] text-gray-900 transition-colors focus:border-cta focus:bg-white focus:outline-none focus:ring-1 focus:ring-cta"
                  placeholder="이름을 입력해주세요"
                />
              </div>

              <div>
                <label htmlFor="phone" className="mb-2 block text-sm font-bold text-gray-800">
                  연락처
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  maxLength={20}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 text-[15px] text-gray-900 transition-colors focus:border-cta focus:bg-white focus:outline-none focus:ring-1 focus:ring-cta"
                  placeholder="연락처를 입력해주세요"
                />
              </div>
            </div>

            <div>
              <label htmlFor="debt" className="mb-2 block text-sm font-bold text-gray-800">
                채무금액
              </label>
              <select
                id="debt"
                value={debt}
                onChange={(e) => setDebt(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 text-[15px] text-gray-900 transition-colors focus:border-cta focus:bg-white focus:outline-none focus:ring-1 focus:ring-cta"
              >
                <option value="">선택해주세요</option>
                <option value="under_10m">1천만원 이하</option>
                <option value="10m_to_30m">1천만원~3천만원</option>
                <option value="30m_to_50m">3천만원~5천만원</option>
                <option value="50m_to_100m">5천만원~1억원</option>
                <option value="over_100m">1억원 이상</option>
              </select>
            </div>

            <div>
              <label htmlFor="income" className="mb-2 block text-sm font-bold text-gray-800">
                월 소득
              </label>
              <select
                id="income"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 text-[15px] text-gray-900 transition-colors focus:border-cta focus:bg-white focus:outline-none focus:ring-1 focus:ring-cta"
              >
                <option value="">선택해주세요</option>
                <option value="none">없음</option>
                <option value="under_1m">100만원 이하</option>
                <option value="1m_to_2m">100만원~200만원</option>
                <option value="2m_to_3m">200만원~300만원</option>
                <option value="over_3m">300만원 이상</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="mb-2 block text-sm font-bold text-gray-800">
                연체 여부
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 text-[15px] text-gray-900 transition-colors focus:border-cta focus:bg-white focus:outline-none focus:ring-1 focus:ring-cta"
              >
                <option value="">선택해주세요</option>
                <option value="before">연체 전</option>
                <option value="during">연체 중</option>
                <option value="action">독촉/압류 진행 중</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="mb-2 block text-sm font-bold text-gray-800">
                문의내용
              </label>
              <textarea
                id="message"
                rows={3}
                maxLength={400}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 text-[15px] text-gray-900 transition-colors focus:border-cta focus:bg-white focus:outline-none focus:ring-1 focus:ring-cta"
                placeholder="현재 상황이나 궁금한 내용을 간단히 남겨주세요"
              />
            </div>

            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="privacy"
                checked={privacy}
                onChange={(e) => setPrivacy(e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-gray-300 text-cta focus:ring-cta"
              />
              <label htmlFor="privacy" className="text-[14px] leading-relaxed text-gray-600">
                개인정보 수집 및 상담 연락에 동의합니다.
              </label>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-cta py-4 text-[17px] font-bold text-white shadow-lg shadow-cta/30 transition-transform hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:py-5"
              >
                {submitting ? '접수 중…' : '무료 자격진단 신청하기'}
              </button>
            </div>
          </form>

          <div className="mt-8 rounded-xl bg-gray-50 p-5 text-center text-[13px] leading-relaxed text-gray-500">
            상담 신청 후 담당자가 순차적으로 연락드립니다.
            <br className="hidden sm:block" />
            상담 가능 여부는 신청자의 상황에 따라 달라질 수 있습니다.
          </div>
        </div>
      </div>
    </section>
  );
}
