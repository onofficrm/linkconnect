import { useState, useEffect, lazy, Suspense, type ComponentType } from 'react';
import { ChevronRight, Phone, ArrowRight } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { getNavSection } from '../lib/siteNav';

interface InfoPageProps {
  type: 'rehabilitation' | 'bankruptcy' | 'debt-collection';
}

type TabLoader = () => Promise<{ default: ComponentType }>;

const rehabTabs: TabLoader[] = [
  () => import('./info-tabs/RehabilitationTab1'),
  () => import('./info-tabs/RehabilitationTab2'),
  () => import('./info-tabs/RehabilitationTab3'),
  () => import('./info-tabs/RehabilitationTab4'),
  () => import('./info-tabs/RehabilitationTab6'),
  () => import('./info-tabs/RehabilitationTab7'),
];

const bankruptcyTabs: TabLoader[] = [
  () => import('./info-tabs/BankruptcyTab1'),
  () => import('./info-tabs/BankruptcyTab2'),
  () => import('./info-tabs/BankruptcyTab3'),
  () => import('./info-tabs/BankruptcyTab4'),
  () => import('./info-tabs/BankruptcyTab6'),
  () => import('./info-tabs/BankruptcyTab7'),
];

const debtTabs: TabLoader[] = [
  () => import('./info-tabs/DebtCollectionTab1'),
  () => import('./info-tabs/DebtCollectionTab2'),
  () => import('./info-tabs/DebtCollectionTab3'),
  () => import('./info-tabs/DebtCollectionTab4'),
  () => import('./info-tabs/DebtCollectionTab5'),
  () => import('./info-tabs/DebtCollectionTab6'),
  () => import('./info-tabs/DebtCollectionTab7'),
];

function TabFallback() {
  return (
    <div className="flex min-h-[240px] items-center justify-center rounded-xl bg-white">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-cta border-t-transparent" aria-label="내용 불러오는 중" />
    </div>
  );
}

function LazyTab({ loader }: { loader: TabLoader }) {
  const Comp = lazy(loader);
  return (
    <Suspense fallback={<TabFallback />}>
      <Comp />
    </Suspense>
  );
}

export default function InfoPage({ type }: InfoPageProps) {
  const [activeTab, setActiveTab] = useState(0);
  const currentData = getNavSection(type);
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');

    if (tabParam) {
      const tabIndex = parseInt(tabParam, 10);
      if (!isNaN(tabIndex) && tabIndex >= 0 && tabIndex < currentData.items.length) {
        setActiveTab(tabIndex);
      }
    } else {
      setActiveTab(0);
    }
    window.scrollTo(0, 0);
  }, [type, location.search, currentData.items.length]);

  const tabLoaders =
    type === 'rehabilitation' ? rehabTabs : type === 'bankruptcy' ? bankruptcyTabs : debtTabs;
  const activeLoader = tabLoaders[activeTab];

  return (
    <div className="min-h-screen bg-bg">
      <div className="bg-main text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="flex-1 text-center md:text-left space-y-6">
            <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl leading-tight">{currentData.title}</h1>
            <p className="text-gray-300 text-lg max-w-xl mx-auto md:mx-0 break-keep">{currentData.description}</p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center md:justify-start">
              <Link
                to="/consultation"
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-cta px-6 py-4 text-[16px] font-bold text-white shadow-md transition-transform hover:bg-blue-700 active:scale-[0.98] sm:flex-none"
              >
                전문가 무료 상담신청
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="tel:"
                className="phone-only partner-phone-link flex items-center justify-center gap-2 rounded-2xl border-2 border-white/20 bg-transparent px-6 py-4 text-[16px] font-bold text-white transition-colors hover:bg-white/10"
              >
                <Phone className="h-5 w-5" />
                <span className="partner-phone-text phone-label-only" data-phone-label="전화상담">
                  전화상담
                </span>
              </a>
            </div>
          </div>

          <div className="w-full max-w-md md:w-5/12 shrink-0">
            <div className="flex flex-col gap-3">
              <img
                src="https://images.unsplash.com/photo-1573164574572-cb89e39749b4?auto=format&fit=crop&w=800&q=80"
                alt="상담 고민"
                width={800}
                height={600}
                loading="lazy"
                decoding="async"
                className="w-full aspect-[4/3] object-cover rounded-3xl shadow-xl shadow-black/20"
              />
              <p className="text-center text-sm text-gray-400 font-medium tracking-wide">
                “현재 상황에 맞는 방향을 차분히 확인해보세요.”
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12 flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 shrink-0">
          <div className="sticky top-[100px] rounded-xl bg-white shadow-sm border border-gray-100 p-2">
            {currentData.items.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setActiveTab(idx);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-full text-left px-4 py-3 rounded-lg text-[15px] font-medium transition-colors flex items-center justify-between ${
                  activeTab === idx ? 'bg-cta/10 text-cta' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.label}
                {activeTab === idx ? <ChevronRight className="h-4 w-4" /> : null}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">{activeLoader ? <LazyTab key={`${type}-${activeTab}`} loader={activeLoader} /> : null}</div>
      </div>
    </div>
  );
}
