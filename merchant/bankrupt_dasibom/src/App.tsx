import { Phone, CheckCircle2, ArrowRight, AlertCircle, Check, Briefcase, FileText, Calculator, Wallet, Compass, Building2, Sprout, ShieldCheck, User, MessageSquare, Smartphone, Info, ThumbsUp, AlertTriangle, ChevronDown, Scale, BadgeCheck } from 'lucide-react';
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { usePartnerContext } from './context/PartnerContext';
import { buildInquiryText, submitConsultation } from './lib/linkconnect';
import { formatPhoneDisplay, getTrackingForSubmit, phoneTelHref } from './lib/partnerData';
import lawyerPortrait from './assets/lawyer-lee-jeongyong.jpg';

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
    document.getElementById('consultation-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        <section className="lg:col-span-8 bg-slate-900 rounded-3xl p-8 md:p-10 flex flex-col justify-center text-white relative overflow-hidden shadow-xl shadow-slate-900/10">
          <div className="grid md:grid-cols-2 gap-8 items-center h-full relative z-10">
            <div className="space-y-5 md:space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-400 text-xs font-semibold">
                <Scale className="w-4 h-4" />
                검사출신 변호사 · 1:1 무료상담
              </div>
              
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-snug break-keep">
                감당하기 어려운 채무,<br />
                <span className="text-teal-400">검사출신의 시선</span>으로<br />
                해결부터 확인하세요
              </h1>
              
              <p className="text-sm md:text-base text-slate-300 leading-relaxed font-medium break-keep">
                서울중앙지검·부장검사 출신 변호사가 소득·채무 상황을 파악하고,
                개인회생·개인파산 방향을 무료로 안내합니다.
              </p>

              <div className="flex flex-wrap gap-2">
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
                <a href="#consultation-form" className="bg-teal-500 hover:bg-teal-400 text-slate-900 px-6 py-3.5 rounded-xl text-base font-bold transition-all flex justify-center items-center gap-2">
                  무료 상담 신청하기
                </a>
                <a
                  href={partnerTel || undefined}
                  className="bg-transparent border border-slate-700 hover:bg-slate-800 text-white px-6 py-3.5 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-all phone-only partner-phone-link"
                >
                  <Phone className="w-5 h-5" />
                  전화 상담
                </a>
              </div>
              
              <p className="text-xs text-slate-400">상담 신청만으로 비용이 발생하지 않습니다.</p>
            </div>
            
            <div className="relative mt-6 md:mt-0 flex items-center justify-center self-stretch">
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-800 to-transparent rounded-[2.5rem] transform rotate-3 scale-105 -z-10"></div>
              
              <div className="aspect-[4/5] w-full h-full min-h-[360px] md:min-h-[420px] bg-slate-800 rounded-[2.5rem] overflow-hidden relative border border-slate-700">
                <img 
                  src={lawyerPortrait}
                  alt={`${LAWYER_PROFILE.name} ${LAWYER_PROFILE.title}`}
                  width={900}
                  height={1100}
                  decoding="async"
                  className="w-full h-full object-cover object-[center_18%] opacity-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/10 to-transparent" />
                
                <div className="absolute bottom-4 left-4 right-4 bg-slate-900/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-slate-700">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-500/20 rounded-full flex items-center justify-center text-teal-400 shrink-0">
                         <BadgeCheck className="w-5 h-5" />
                      </div>
                      <div>
                         <p className="text-[11px] font-bold text-teal-400 mb-0.5">{LAWYER_PROFILE.title}</p>
                         <p className="font-bold text-sm text-white leading-tight">
                           {LAWYER_PROFILE.name} 변호사<br/>
                           <span className="text-slate-300 font-medium text-xs">서울중앙지검·부장검사 출신</span>
                         </p>
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

        {/* Lawyer Profile — 검사출신 약력 */}
        <section id="lawyer" className="lg:col-span-12 bg-white border border-slate-200 rounded-3xl p-8 lg:p-12 shadow-xl shadow-slate-200/50 mt-4 md:mt-8 scroll-mt-24">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 text-xs font-bold border border-teal-100">
                <Scale className="w-4 h-4" />
                검사출신 변호사 약력
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {LAWYER_PROFILE.name} {LAWYER_PROFILE.title}<br />
                <span className="text-teal-600">실무를 아는 상담</span>이 다릅니다
              </h2>
              <p className="text-slate-600 font-medium leading-relaxed">
                검사로 사건 구조를 파악하고, 부장검사로 복잡한 쟁점을 조율해 온 경험을
                개인회생·개인파산 상담에 그대로 적용합니다.
              </p>
              <ol className="space-y-3">
                {LAWYER_PROFILE.career.map((item, idx) => (
                  <li key={item} className="flex items-start gap-3 text-slate-800 font-medium">
                    <span className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-snug pt-1">{item}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-teal-600" />
                검사출신 변호사의 장점
              </h3>
              <div className="grid sm:grid-cols-1 gap-4">
                {LAWYER_PROFILE.strengths.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5 hover:border-teal-200 hover:bg-teal-50/40 transition-colors"
                  >
                    <p className="font-bold text-slate-900 mb-1.5">{item.title}</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
              <a
                href="#consultation-form"
                className="mt-2 inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-bold px-6 py-3.5 rounded-xl transition-colors"
              >
                검사출신 변호사에게 상담 신청
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section id="rehab" className="lg:col-span-12 mt-4 md:mt-8">
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            
            {/* Individual Rehabilitation Card */}
            <div id="bankruptcy-anchor-skip" className="bg-white border border-slate-200 rounded-3xl p-8 shadow-lg shadow-slate-200/50 flex flex-col h-full hover:border-teal-300 transition-colors">
              <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mb-6">
                <Briefcase className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-4 tracking-tight">소득은 있지만 채무상환이 어려운 경우</h3>
              <p className="text-slate-600 font-medium mb-6 leading-relaxed">
                개인회생은 일정한 소득이 있는 채무자가 법원이 정한 기간 동안 일부 채무를 변제하고 남은 채무의 조정을 받을 수 있는 제도입니다.
              </p>
              
              <div className="bg-slate-50 rounded-2xl p-5 mb-8 flex-1 border border-slate-100">
                <p className="text-sm font-bold text-slate-900 mb-3">추천 대상</p>
                <ul className="space-y-2.5">
                  {[
                    "급여소득자",
                    "자영업자",
                    "프리랜서",
                    "일정한 수입이 있는 사람",
                    "정상적인 채무상환이 어려운 사람"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-teal-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              <button
                type="button"
                onClick={() => scrollToForm('개인회생')}
                className="w-full bg-teal-50 text-teal-700 hover:bg-teal-500 hover:text-white border border-teal-100 px-6 py-4 rounded-xl text-base font-bold transition-all flex items-center justify-center gap-2"
              >
                개인회생 상담받기
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Individual Bankruptcy Card */}
            <div id="bankruptcy" className="bg-white border border-slate-200 rounded-3xl p-8 shadow-lg shadow-slate-200/50 flex flex-col h-full hover:border-orange-300 transition-colors">
              <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-4 tracking-tight">소득과 재산으로 채무상환이 어려운 경우</h3>
              <p className="text-slate-600 font-medium mb-6 leading-relaxed">
                개인파산은 현재의 소득과 재산으로 채무를 감당하기 어려운 경우 법원의 심사를 통해 채무 문제를 정리하는 제도입니다.
              </p>
              
              <div className="bg-slate-50 rounded-2xl p-5 mb-8 flex-1 border border-slate-100">
                <p className="text-sm font-bold text-slate-900 mb-3">추천 대상</p>
                <ul className="space-y-2.5">
                  {[
                    "현재 소득이 거의 없는 사람",
                    "고령 또는 건강상의 사유로 소득활동이 어려운 사람",
                    "재산보다 채무가 많은 사람",
                    "장기간 채무상환이 어려운 사람"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-orange-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              <button
                type="button"
                onClick={() => scrollToForm('개인파산')}
                className="w-full bg-orange-50 text-orange-700 hover:bg-orange-500 hover:text-white border border-orange-100 px-6 py-4 rounded-xl text-base font-bold transition-all flex items-center justify-center gap-2"
              >
                개인파산 상담받기
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm font-medium text-slate-500 bg-slate-100 inline-block px-4 py-2 rounded-lg">
              * 개인별 소득, 재산, 채무 발생 원인에 따라 신청 가능 여부가 달라질 수 있습니다.
            </p>
          </div>
        </section>

        {/* Roadmap Section */}
        <section id="process" className="lg:col-span-12 bg-white border border-slate-200 rounded-3xl p-8 lg:p-12 shadow-xl shadow-slate-200/50 mt-4 md:mt-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">상담부터 재정회복까지, 이렇게 진행됩니다</h2>
          </div>
          
          <div className="relative">
            {/* Desktop Line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
            {/* Mobile Line */}
            <div className="md:hidden absolute top-0 left-6 h-full w-0.5 bg-slate-100 z-0"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6 relative z-10">
              {[
                { title: '현재 채무상황 확인', icon: Calculator },
                { title: '소득·재산·부양가족 확인', icon: Wallet },
                { title: '개인회생 또는 개인파산 방향 안내', icon: Compass },
                { title: '필요서류 준비', icon: FileText },
                { title: '신청 및 관련 절차 진행', icon: Building2 },
                { title: '채무조정 후 새로운 생활 준비', icon: Sprout },
              ].map((step, idx) => (
                <div key={idx} className="flex md:flex-col items-center gap-4 md:gap-3 text-left md:text-center relative">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0 relative">
                    <step.icon className="w-6 h-6" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[11px] font-bold">
                      {idx + 1}
                    </div>
                  </div>
                  <p className="text-sm font-bold text-slate-800 leading-snug">{step.title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-8">
          {/* Pre-consultation Checklist */}
          <section className="bg-slate-900 rounded-3xl p-8 lg:p-10 shadow-xl text-white flex flex-col">
            <h3 className="text-2xl font-extrabold mb-6 tracking-tight">상담 전에 확인하면 좋은 내용</h3>
            <div className="flex flex-wrap gap-3 mb-8">
              {[
                "월평균 소득", "전체 채무금액", "보유 재산", "부양가족 수", 
                "채무 발생 원인", "현재 연체 여부", "압류 또는 독촉 여부"
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-800 border border-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-200">
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-auto bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <p className="text-sm font-bold text-teal-400 flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" />
                정확한 금액을 모르더라도 대략적인 내용만으로 상담을 시작할 수 있습니다.
              </p>
            </div>
          </section>

          {/* Trust Elements */}
          <section className="bg-white border border-slate-200 rounded-3xl p-8 lg:p-10 shadow-xl shadow-slate-200/50">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full content-center">
              {[
                { title: '상담내용 비공개', icon: ShieldCheck, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' },
                { title: '개인별 상황에 맞춘 상담', icon: User, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
                { title: '복잡한 절차를 쉽게 설명', icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                { title: '전화 및 온라인 상담 가능', icon: Smartphone, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
                { title: '진행 전 충분한 안내', icon: Info, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                { title: '무리한 신청 권유 없음', icon: ThumbsUp, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
              ].map((trust, idx) => (
                <div key={idx} className="flex flex-row items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left hover:border-slate-300 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${trust.bg} ${trust.color} border ${trust.border}`}>
                    <trust.icon className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">{trust.title}</p>
                </div>
              ))}
             </div>
          </section>
        </div>

        {/* Delay Risks */}
        <section className="lg:col-span-12 bg-white border border-slate-200 rounded-3xl p-8 lg:p-12 shadow-xl shadow-slate-200/50 mt-4 md:mt-8 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50 text-orange-600 text-xs font-bold border border-orange-100">
              <AlertTriangle className="w-4 h-4" />
              주의사항
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              채무 문제는 시간이 지나면<br/>더 복잡해질 수 있습니다
            </h2>
            <ul className="space-y-3">
              {[
                "연체이자와 지연손해금이 늘어날 수 있습니다.",
                "독촉 연락이 계속될 수 있습니다.",
                "급여, 통장 또는 재산에 대한 절차가 진행될 수 있습니다.",
                "돌려막기로 전체 채무가 증가할 수 있습니다.",
                "가족과 일상생활에 부담이 커질 수 있습니다."
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-slate-700 font-medium">
                  <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 text-slate-400 text-xs font-bold">{idx + 1}</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex-1 bg-slate-50 rounded-3xl p-8 border border-slate-100 text-center w-full">
            <p className="text-lg font-extrabold text-slate-900 leading-relaxed mb-6">
              지금 당장 결정하지 않아도 됩니다.<br/>
              <span className="text-teal-600">먼저 현재 상황에서 가능한 방법이 있는지 확인해 보세요.</span>
            </p>
            <a href="#consultation-form" className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-4 rounded-xl text-base transition-all shadow-lg inline-flex items-center gap-2 w-full justify-center">
              해결 방법 확인하기
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </section>

        {/* Consultation Form Section */}
        <section id="consultation-form" className="lg:col-span-12 bg-slate-900 rounded-3xl p-6 md:p-12 shadow-xl mt-4 md:mt-8 relative overflow-hidden">
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

        {/* Phone Consultation CTA */}
        <section className="lg:col-span-12 bg-white border border-slate-200 rounded-3xl p-8 lg:p-12 shadow-xl shadow-slate-200/50 mt-4 md:mt-8 flex flex-col md:flex-row items-center gap-8 lg:gap-12 text-center md:text-left phone-only partner-phone-section">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center shrink-0">
            <Phone className="w-8 h-8 md:w-10 md:h-10" />
          </div>
          <div className="flex-1 space-y-3">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              글 작성이 어렵다면 전화로 상담하세요
            </h2>
            <p className="text-base text-slate-600 font-medium">
              현재 상황을 간단히 말씀해 주시면 필요한 내용을 순서대로 안내해 드립니다.
            </p>
            <div className="flex flex-col md:flex-row gap-4 md:gap-8 pt-2 text-sm text-slate-500 font-medium justify-center md:justify-start">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                평일 오전 9시부터 오후 6시
              </div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                토요일 상담 가능
              </div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                일요일 및 공휴일 휴무
              </div>
            </div>
          </div>
          <div className="w-full md:w-auto flex flex-col items-center md:items-end gap-2">
            <p className="text-sm font-bold text-orange-600">상담 전화번호</p>
            <p className="text-3xl font-black text-slate-900 partner-phone-text">{partnerPhoneDisplay}</p>
            <a href={partnerTel || undefined} className="mt-2 w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-xl text-base transition-all shadow-lg shadow-orange-500/20 inline-flex justify-center items-center gap-2 partner-phone-link">
              <Phone className="w-5 h-5" />
              지금 전화하기
            </a>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="lg:col-span-12 bg-white border border-slate-200 rounded-3xl p-6 md:p-12 shadow-xl shadow-slate-200/50 mt-4 md:mt-8">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">자주 묻는 질문</h2>
          </div>
          <div className="max-w-4xl mx-auto space-y-3">
            {[
              { q: '개인회생과 개인파산은 어떻게 다른가요?', a: '개인회생은 일정한 소득이 있을 때 일부 채무를 갚고 나머지를 조정받는 제도이며, 개인파산은 소득과 재산으로 채무를 감당하기 어려울 때 법원 심사를 통해 채무를 정리하는 제도입니다. 개인별 상황에 따라 적합한 제도가 다를 수 있습니다.' },
              { q: '연체 전에도 상담할 수 있나요?', a: '네, 가능합니다. 연체가 시작되기 전이라도 채무 상환이 어렵다고 판단된다면 미리 상담을 통해 해결 방향을 확인하는 것이 좋습니다.' },
              { q: '직장에 알려질 수 있나요?', a: '상담 내용과 신청 사실은 원칙적으로 비공개로 진행되며, 신청 절차 중 직장에 직접 통보되는 일은 없습니다. 단, 개인별 특수한 상황에 따라 차이가 있을 수 있으므로 자세한 내용은 상담 시 확인해 드립니다.' },
              { q: '배우자나 가족의 재산도 확인하나요?', a: '신청자의 상황과 관할 법원의 기준에 따라 배우자의 재산이 일부 반영될 수 있습니다. 정확한 내용은 상담을 통해 상황별 맞춤 안내를 받으시는 것이 정확합니다.' },
              { q: '개인회생을 신청하면 모든 채무가 없어지나요?', a: '개인회생은 신청자의 소득과 재산을 바탕으로 법원이 정한 기간 동안 일부 채무를 변제한 후 남은 채무를 조정받는 제도입니다. 조건에 따라 변제율이 다르며, 모든 채무가 일괄 소멸되는 것은 아닙니다.' },
              { q: '채무금액을 정확하게 몰라도 상담할 수 있나요?', a: '네, 대략적인 금액과 상황만으로도 1차적인 상담이 가능합니다. 이후 정식 절차 진행 시 정확한 채무 현황을 파악하도록 도와드립니다.' },
              { q: '자영업자나 프리랜서도 개인회생이 가능한가요?', a: '네, 가능합니다. 급여소득자뿐만 아니라 자영업자, 프리랜서, 일용직 등 일정한 수입을 증명할 수 있다면 신청이 가능합니다.' },
              { q: '상담신청을 하면 바로 신청해야 하나요?', a: '아닙니다. 상담은 현재 상황을 진단하고 가능한 방법을 확인하는 과정입니다. 충분한 안내를 받으신 후 신청 여부를 천천히 결정하셔도 됩니다.' },
              { q: '전화상담과 온라인 상담 중 어떤 것이 좋나요?', a: '빠른 답변을 원하시면 전화상담을, 글로 편하게 상황을 정리해 남기고 싶으시다면 온라인 상담 접수를 권장해 드립니다. 원하시는 방법으로 편하게 이용해 주세요.' },
              { q: '신청 절차는 얼마나 걸리나요?', a: '개인별 상황과 관할 법원의 일정에 따라 다소 차이가 있습니다. 상담을 통해 신청자의 상황에 맞는 대략적인 소요 기간을 안내해 드립니다.' }
            ].map((faq, idx) => (
              <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 transition-all">
                <button
                  className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors text-left"
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                >
                  <span className="font-bold text-slate-800 pr-4">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${openFaqIndex === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaqIndex === idx && (
                  <div className="px-6 py-4 border-t border-slate-100 text-sm text-slate-600 leading-relaxed bg-slate-50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="lg:col-span-12 bg-slate-900 rounded-3xl p-8 md:p-16 text-center shadow-2xl mt-4 md:mt-8 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-2xl bg-teal-500/10 blur-[100px] rounded-full"></div>
          
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              채무 문제로 멈춰 있기보다<br />
              <span className="text-teal-400">가능한 해결 방법부터 확인해 보세요</span>
            </h2>
            <p className="text-lg text-slate-300 font-medium max-w-xl mx-auto">
              현재 상황을 정확하게 파악하는 것이 재정회복의 첫 단계입니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <a href="#consultation-form" className="bg-teal-500 hover:bg-teal-400 text-slate-900 px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-lg flex justify-center items-center gap-2">
                무료 상담 신청하기
                <ArrowRight className="w-5 h-5" />
              </a>
              <a href={partnerTel || undefined} className="bg-transparent border border-slate-700 hover:bg-slate-800 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all flex items-center justify-center gap-2 phone-only partner-phone-link">
                <Phone className="w-5 h-5" />
                전화로 바로 상담하기
              </a>
            </div>
          </div>
        </section>
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
