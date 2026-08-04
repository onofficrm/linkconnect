import { Phone, CheckCircle2, ArrowRight, AlertCircle, Check, MessageSquare, Scale, BadgeCheck } from 'lucide-react';
import { lazy, Suspense, useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import DeferredMount from './components/DeferredMount';

const DeferredLawyerRehab = lazy(() => import('./sections/DeferredLawyerRehab'));
const DeferredProcessMid = lazy(() => import('./sections/DeferredProcessMid'));
const DeferredFaqCta = lazy(() => import('./sections/DeferredFaqCta'));
import { usePartnerContext } from './context/PartnerContext';
import { buildInquiryText, submitConsultation } from './lib/linkconnect';
import { formatPhoneDisplay, getTrackingForSubmit, phoneTelHref } from './lib/partnerData';
import { scrollToId } from '../../_landing-perf/scrollToId';
import lawyerPortrait from './assets/lawyer-lee-jeongyong-hero.jpg';

const CONTACT_INFO = {
  companyName: '다시봄 개인회생센터',
  ceo: '',
  bizNumber: '',
  address: '',
};

const LAWYER_PROFILE = {
  name: '이정용',
  title: '검사출신 변호사',
  career: [
    '서울대 법대 졸업 / 서울대 대학원 법학과 수료',
    '사법시험(38회) / 사법연수원(28기)',
    '서울중앙지검(특수3부) 검사',
    '서울중앙지검 부부장 검사',
    '인천지검 부천지청 부장검사',
  ],
  strengths: [
    {
      title: '수사·기소 실무를 아는 진단',
      desc: '검사 시절 사건 구조를 파악하던 시각으로, 채무·재산·위험을 빠르게 정리합니다.',
    },
    {
      title: '채권자·법원 대응의 전문성',
      desc: '특수부·부장검사 경력으로 복잡한 법적 쟁점과 대응 순서를 차분히 안내합니다.',
    },
    {
      title: '개인회생·파산의 현실적 해법',
      desc: '가능성만 이야기하지 않고, 현재 상황에서 기준으로 실행 가능한 방향을 제시합니다.',
    },
  ],
};

function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export default function App() {
  const { data: partner, hasPhone } = usePartnerContext();
  const partnerPhoneDisplay = partner.partner_phone_display || formatPhoneDisplay(partner.partner_phone);
  const partnerTel = phoneTelHref(partner.partner_phone);

  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    time: '',
    type: '',
    situation: '',
    memo: '',
    agree: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    document.title = '개인회생무료상담 | 다시봄 개인회생센터 검사출신 변호사';
  }, []);

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (name === 'phone') {
      setFormData((prev) => ({ ...prev, phone: formatPhoneInput(value) }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const scrollToForm = (type?: string) => {
    if (type) {
      setFormData((prev) => ({ ...prev, type }));
    }
    scrollToId('consultation-form', { block: 'start' });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.time || !formData.type) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      alert('올바른 연락처 형식을 입력해주세요. (예: 010-1234-5678)');
      return;
    }
    if (!formData.agree) {
      alert('개인정보 수집 및 이용에 동의해주세요.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');

    const inquiry = buildInquiryText({
      type: formData.type,
      time: formData.time,
      status: formData.situation,
      message: formData.memo,
    });

    const result = await submitConsultation(
      { name: formData.name, phone: formData.phone, inquiry },
      getTrackingForSubmit(),
    );

    setIsSubmitting(false);
    if (result.ok) {
      setSubmitStatus('success');
      setSubmitMessage(result.message);
      setFormData({
        name: '',
        phone: '',
        time: '',
        type: '',
        situation: '',
        memo: '',
        agree: false,
      });
    } else {
      setSubmitStatus('error');
      setSubmitMessage(result.message);
      alert(result.message);
    }
  };

  const toggleCheck = (index: number) => {
    if (checkedItems.includes(index)) {
      setCheckedItems(checkedItems.filter(i => i !== index));
    } else {
      setCheckedItems([...checkedItems, index]);
    }
  };

  const diagnosisItems = [
    "매달 소득은 있지만 원금상환이 어렵습니다.",
    "돌려막기로 채무를 갚고 있습니다.",
    "급여 또는 통장이 압류될까 걱정됩니다.",
    "사업 실패로 많은 채무가 발생했습니다.",
    "연체가 시작됐거나 독촉 연락을 받고 있습니다.",
    "개인회생과 개인파산 중 무엇이 맞는지 모르겠습니다.",
  ];

  return (
    <div
      id="dasibom-merchant-page"
      className={`min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-teal-100 selection:text-teal-600 flex flex-col merchant-dasibom-page ${hasPhone ? 'has-partner-phone' : 'no-partner-phone'}`}
    >
      {/* Header */}
      <header className="bg-white sticky top-0 z-50 border-b border-slate-200 shrink-0">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">봄</div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">다시봄 <span className="text-teal-600">개인회생센터</span></span>
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#rehab" className="hover:text-teal-600 transition-colors">개인회생</a>
            <a href="#bankruptcy" className="hover:text-teal-600 transition-colors">개인파산</a>
            <a href="#lawyer" className="hover:text-teal-600 transition-colors">검사출신 변호사</a>
            <a href="#process" className="hover:text-teal-600 transition-colors">진행절차</a>
            <a href="#faq" className="hover:text-teal-600 transition-colors">자주 묻는 질문</a>
            <a href="#consultation-form" className="hover:text-teal-600 transition-colors font-bold text-slate-900">상담신청</a>
          </nav>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block phone-only partner-phone-section">
              <p className="text-xs text-slate-400 leading-none mb-1">상담 전화번호</p>
              <p className="text-lg font-bold text-slate-900 partner-phone-text">{partnerPhoneDisplay || '전화상담'}</p>
            </div>
            <a
              href={partnerTel || undefined}
              className="hidden md:flex items-center gap-2 bg-orange-500 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-orange-600 transition-colors shadow-sm phone-only partner-phone-link"
            >
              <Phone className="w-4 h-4" />
              지금 전화상담
            </a>
            <a
              href={partnerTel || undefined}
              className="md:hidden flex items-center justify-center w-10 h-10 bg-teal-50 text-teal-600 rounded-full active:bg-teal-100 transition-colors phone-only partner-phone-link"
            >
               <Phone className="w-5 h-5 fill-current" />
            </a>
            <a
              href="#consultation-form"
              className="md:hidden flex items-center justify-center w-10 h-10 bg-slate-100 text-slate-700 rounded-full active:bg-slate-200 transition-colors"
              aria-label="상담신청"
            >
              <MessageSquare className="w-5 h-5" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 auto-rows-min gap-4 md:gap-6">
        {/* Hero Section */}
        <section className="lg:col-span-8 bg-slate-900 rounded-3xl p-8 md:p-10 flex flex-col justify-center text-white relative overflow-hidden shadow-xl shadow-slate-900/10 min-h-0 lg:min-h-full">
          <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-center relative z-10 w-full my-auto">
            <div className="space-y-5 md:space-y-6 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-400 text-xs font-semibold">
                <Scale className="w-4 h-4" />
                검사출신 변호사 · 1:1 무료상담
              </div>
              
              <h1 className="text-[1.625rem] sm:text-[1.75rem] md:text-[1.9rem] font-bold text-white leading-[1.55] break-keep tracking-tight">
                <span className="block">감당하기 어려운 채무,</span>
                <span className="block mt-1.5">
                  <span className="text-teal-400">검사출신의 시선</span>으로
                </span>
                <span className="block mt-1.5">해결부터 확인하세요</span>
              </h1>
              
              <p className="text-sm md:text-[15px] text-slate-300 leading-[1.7] font-medium break-keep">
                서울중앙지검·부장검사 출신 변호사가 소득·채무 상황을 파악하고
                개인회생·개인파산 방향을 무료로 안내합니다.
              </p>

              <div className="flex flex-wrap gap-2 pt-0.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> 검사출신 상담
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> 상담 비공개
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> 맞춤 안내
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <a href="#consultation-form" className="bg-teal-500 hover:bg-teal-400 text-slate-900 px-6 py-3.5 rounded-xl text-[15px] font-bold transition-all flex justify-center items-center gap-2">
                  무료 상담 신청하기
                </a>
                <a
                  href={partnerTel || undefined}
                  className="bg-transparent border border-slate-700 hover:bg-slate-800 text-white px-6 py-3.5 rounded-xl text-[15px] font-bold flex items-center justify-center gap-2 transition-all phone-only partner-phone-link"
                >
                  <Phone className="w-5 h-5" />
                  전화 상담
                </a>
              </div>
              
              <p className="text-xs text-slate-400 leading-relaxed">상담 신청만으로 비용이 발생하지 않습니다.</p>
            </div>
            
            <div className="relative flex justify-center md:justify-end items-center">
              <div className="relative w-full max-w-[260px] sm:max-w-[280px] md:max-w-[300px]">
                <div
                  className="absolute -inset-1 rounded-[1.75rem] bg-gradient-to-br from-teal-500/20 via-slate-700/40 to-transparent -z-10 rotate-2"
                  aria-hidden
                />
                <div
                  role="img"
                  aria-label={`${LAWYER_PROFILE.name} ${LAWYER_PROFILE.title}`}
                  className="aspect-[3/4] w-full rounded-[1.75rem] overflow-hidden relative border border-slate-600/80 bg-slate-800 bg-cover bg-no-repeat bg-[center_12%] shadow-xl shadow-black/40"
                  style={{ backgroundImage: `url(${lawyerPortrait})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" aria-hidden />
                  
                  <div className="absolute bottom-3 left-3 right-3 bg-slate-950/90 backdrop-blur-sm rounded-xl px-3.5 py-3 shadow-lg border border-slate-700/80">
                     <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-teal-500/20 rounded-full flex items-center justify-center text-teal-400 shrink-0">
                           <BadgeCheck className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                           <p className="text-[10px] font-bold text-teal-400 mb-0.5">{LAWYER_PROFILE.title}</p>
                           <p className="font-bold text-sm text-white leading-snug">
                             {LAWYER_PROFILE.name} 변호사
                           </p>
                           <p className="text-slate-400 font-medium text-[11px] leading-snug mt-0.5">
                             서울중앙지검·부장검사 출신
                           </p>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Self Diagnosis Card */}
        <section className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 flex flex-col shadow-xl shadow-slate-200/50">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
              <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </span>
              혹시 이런 상황인가요?
            </h2>
            <p className="text-sm text-slate-500 font-medium">현재 상황과 비슷한 항목을 확인해 보세요.</p>
          </div>
          
          <ul className="space-y-2.5 mb-6 flex-1">
            {diagnosisItems.map((item, index) => {
              const isChecked = checkedItems.includes(index);
              return (
                <li key={index} 
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      isChecked ? 'bg-teal-50 border-teal-200' : 'bg-slate-50 border-slate-100 hover:border-slate-300'
                    }`}
                    onClick={() => toggleCheck(index)}>
                  <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 border ${
                    isChecked ? 'bg-teal-500 border-teal-500 text-white' : 'bg-white border-slate-300'
                  }`}>
                    {isChecked && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <span className={`text-sm ${isChecked ? 'text-teal-900 font-bold' : 'text-slate-600 font-medium'}`}>
                    {item}
                  </span>
                </li>
              );
            })}
          </ul>
          
          <div className="mt-auto space-y-4">
            <div className={`p-4 rounded-xl transition-all duration-300 ${
              checkedItems.length >= 2 ? 'bg-orange-50 border border-orange-100' : 'bg-slate-50 border border-slate-100 opacity-50'
            }`}>
              <p className={`text-sm text-center font-bold ${
                checkedItems.length >= 2 ? 'text-orange-700' : 'text-slate-400'
              }`}>
                2개 이상 해당된다면 상담을 통해<br/>해결 방향을 확인해 보세요.
              </p>
            </div>
            
            <a href="#consultation-form" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg text-base">
              내 상황 상담받기
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>

        <DeferredMount minHeight={280} className="lg:col-span-12 space-y-4 md:space-y-6">
          <Suspense fallback={null}>
            <DeferredLawyerRehab onScrollToForm={scrollToForm} />
          </Suspense>
        </DeferredMount>

        <DeferredMount minHeight={240} className="lg:col-span-12 space-y-4 md:space-y-6">
          <Suspense fallback={null}>
            <DeferredProcessMid />
          </Suspense>
        </DeferredMount>

        <DeferredMount minHeight={320} idleFallbackMs={400} className="lg:col-span-12">
        {/* Consultation Form Section */}
        <section id="consultation-form" className="bg-slate-900 rounded-3xl p-6 md:p-12 shadow-xl mt-4 md:mt-8 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 relative z-10">
            {/* Form Intro */}
            <div className="lg:col-span-2 text-white flex flex-col justify-center">
              <div className="w-12 h-12 bg-teal-500/20 text-teal-400 rounded-2xl flex items-center justify-center mb-6">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-4">
                현재 상황을 남겨주시면<br/>상담을 도와드립니다
              </h2>
              <p className="text-slate-300 font-medium leading-relaxed mb-8">
                정확한 내용을 모두 작성하지 않아도 됩니다.<br/>
                확인 가능한 범위까지만 입력해 주세요.
              </p>
              
              <div className="hidden lg:flex flex-col gap-4">
                <div className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
                  접수된 정보는 철저히 비공개로 유지됩니다.
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
                  상담 신청만으로 어떠한 비용도 발생하지 않습니다.
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
                  확인 후 담당자가 순차적으로 연락드립니다.
                </div>
              </div>
            </div>

            {/* Form Container */}
            <div className="lg:col-span-3 bg-white rounded-2xl p-6 md:p-8 shadow-2xl">
              {submitStatus === 'success' ? (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center py-12">
                  <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-6">
                    <Check className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-900 mb-2">상담 신청이 완료되었습니다</h3>
                  <p className="text-slate-600 font-medium">
                    {submitMessage || '상담 신청이 정상적으로 접수되었습니다. 확인 후 연락드리겠습니다.'}
                  </p>
                  <button 
                    onClick={() => {
                      setSubmitStatus('idle');
                      setSubmitMessage('');
                    }}
                    className="mt-8 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-3 rounded-xl transition-colors"
                  >
                    새로운 상담 신청하기
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {submitStatus === 'error' && submitMessage ? (
                    <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-medium text-orange-700">
                      {submitMessage}
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Required Fields */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                        이름 <span className="text-orange-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        placeholder="홍길동"
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                        연락처 <span className="text-orange-500">*</span>
                      </label>
                      <input 
                        type="tel" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleFormChange}
                        placeholder="010-0000-0000"
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                      희망 상담시간 <span className="text-orange-500">*</span>
                    </label>
                    <select 
                      name="time"
                      value={formData.time}
                      onChange={handleFormChange}
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all appearance-none"
                    >
                      <option value="">선택해주세요</option>
                      <option value="언제나 가능">언제나 가능</option>
                      <option value="오전 (09:00~12:00)">오전 (09:00~12:00)</option>
                      <option value="오후 (12:00~18:00)">오후 (12:00~18:00)</option>
                      <option value="저녁 (18:00 이후)">저녁 (18:00 이후)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                      상담 구분 <span className="text-orange-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['개인회생', '개인파산', '아직 잘 모르겠음'].map((type) => (
                        <label key={type} className={`cursor-pointer border rounded-xl py-3 px-2 text-center text-sm font-medium transition-all ${
                          formData.type === type ? 'bg-teal-50 border-teal-500 text-teal-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}>
                          <input 
                            type="radio" 
                            name="type" 
                            value={type} 
                            checked={formData.type === type}
                            onChange={handleFormChange}
                            className="hidden" 
                          />
                          {type}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Optional Fields */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <label className="text-sm font-bold text-slate-700">현재 상황 (선택)</label>
                    <div className="flex flex-wrap gap-2">
                      {['연체 전', '연체 중', '독촉 중', '압류 진행', '기타'].map((sit) => (
                        <label key={sit} className={`cursor-pointer border rounded-full py-2 px-4 text-xs font-medium transition-all ${
                          formData.situation === sit ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}>
                          <input 
                            type="radio" 
                            name="situation" 
                            value={sit} 
                            checked={formData.situation === sit}
                            onChange={handleFormChange}
                            className="hidden" 
                          />
                          {sit}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">간단한 상담내용 (선택)</label>
                    <textarea 
                      name="memo"
                      value={formData.memo}
                      onChange={handleFormChange}
                      placeholder="궁금하신 점이나 현재 상황을 편하게 남겨주세요."
                      className="w-full h-24 resize-none bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    ></textarea>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <div className="mt-0.5">
                        <input 
                          type="checkbox" 
                          name="agree"
                          checked={formData.agree}
                          onChange={handleFormChange}
                          className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500" 
                        />
                      </div>
                      <div className="flex-1 text-sm text-slate-600">
                        <span className="font-medium text-slate-800">[필수]</span> 개인정보 수집 및 이용에 동의합니다. 
                        <button type="button" onClick={() => setShowPrivacy(!showPrivacy)} className="text-slate-400 hover:text-slate-600 underline ml-1">
                          자세히 보기
                        </button>
                        {showPrivacy && (
                          <div className="mt-2 p-3 bg-slate-50 rounded-lg text-xs text-slate-500 border border-slate-200">
                            수집 항목: 이름, 연락처, 희망 상담시간, 상담 구분, 현재 상황 등<br/>
                            수집 목적: 개인회생·개인파산 상담 및 관련 안내<br/>
                            보유 기간: 상담 완료 후 6개월 보관 후 파기
                          </div>
                        )}
                      </div>
                    </label>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className={`w-full text-white font-bold py-4 rounded-xl text-base transition-all shadow-lg flex justify-center items-center gap-2 ${
                      isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-teal-500 hover:bg-teal-600'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        처리 중...
                      </>
                    ) : (
                      '비공개 상담 신청하기'
                    )}
                  </button>
                  <p className="text-center text-xs text-slate-400">
                    접수된 정보는 상담 목적 외에는 사용하지 않습니다.
                  </p>
                </form>
              )}
            </div>
          </div>
        </section>
        </DeferredMount>

        <DeferredMount minHeight={240} className="lg:col-span-12 space-y-4 md:space-y-6">
          <Suspense fallback={null}>
            <DeferredFaqCta
              partnerPhoneDisplay={partnerPhoneDisplay}
              partnerTel={partnerTel}
              openFaqIndex={openFaqIndex}
              setOpenFaqIndex={setOpenFaqIndex}
            />
          </Suspense>
        </DeferredMount>
      </main>

      {/* Footer */}
      <footer className="bg-slate-100 border-t border-slate-200 mt-12 pb-24 md:pb-12 pt-12 px-6 lg:px-8 shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-slate-400 rounded-md flex items-center justify-center text-white font-bold text-xs">봄</div>
                <span className="font-bold text-slate-700">{CONTACT_INFO.companyName}</span>
              </div>
              <div className="text-xs text-slate-500 space-y-2 font-medium">
                {CONTACT_INFO.ceo ? <p>대표자: {CONTACT_INFO.ceo}{CONTACT_INFO.bizNumber ? ` | 사업자등록번호: ${CONTACT_INFO.bizNumber}` : ''}</p> : null}
                {CONTACT_INFO.address ? <p>주소: {CONTACT_INFO.address}</p> : null}
                {hasPhone ? <p>상담 전화: <span className="partner-phone-text">{partnerPhoneDisplay}</span></p> : null}
              </div>
            </div>
            <div className="flex flex-wrap md:justify-end gap-4 text-xs font-bold text-slate-600">
              <a href="#consultation-form" className="hover:text-slate-900">상담신청</a>
              <span className="text-slate-300">|</span>
              <a href="#faq" className="hover:text-slate-900">자주 묻는 질문</a>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-6">
            <p className="text-[11px] text-slate-400 leading-relaxed text-center md:text-left">
              * 본 페이지의 내용은 일반적인 제도 안내이며, 실제 신청 가능 여부와 결과는 개인별 상황 및 관련 기관의 판단에 따라 달라질 수 있습니다.<br />
              © {new Date().getFullYear()} 다시봄 개인회생센터. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Fixed CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 flex gap-3 z-50 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)]">
        <a href={partnerTel || undefined} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors bottom-phone-btn phone-only partner-phone-link">
          <Phone className="w-4 h-4" />
          전화상담
        </a>
        <a href="#consultation-form" className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors bottom-form-btn">
          <MessageSquare className="w-4 h-4" />
          상담신청
        </a>
      </div>
    </div>
  );
}
