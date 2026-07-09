import { useState, useEffect } from 'react';
import { ChevronRight, Phone, ArrowRight } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

import RehabilitationTab1 from './info-tabs/RehabilitationTab1';
import RehabilitationTab2 from './info-tabs/RehabilitationTab2';
import RehabilitationTab3 from './info-tabs/RehabilitationTab3';
import RehabilitationTab4 from './info-tabs/RehabilitationTab4';
import RehabilitationTab6 from './info-tabs/RehabilitationTab6';
import RehabilitationTab7 from './info-tabs/RehabilitationTab7';

import BankruptcyTab1 from './info-tabs/BankruptcyTab1';
import BankruptcyTab2 from './info-tabs/BankruptcyTab2';
import BankruptcyTab3 from './info-tabs/BankruptcyTab3';
import BankruptcyTab4 from './info-tabs/BankruptcyTab4';
import BankruptcyTab6 from './info-tabs/BankruptcyTab6';
import BankruptcyTab7 from './info-tabs/BankruptcyTab7';

import DebtCollectionTab1 from './info-tabs/DebtCollectionTab1';
import DebtCollectionTab2 from './info-tabs/DebtCollectionTab2';
import DebtCollectionTab3 from './info-tabs/DebtCollectionTab3';
import DebtCollectionTab4 from './info-tabs/DebtCollectionTab4';
import DebtCollectionTab5 from './info-tabs/DebtCollectionTab5';
import DebtCollectionTab6 from './info-tabs/DebtCollectionTab6';
import DebtCollectionTab7 from './info-tabs/DebtCollectionTab7';

import { getNavSection } from '../lib/siteNav';

interface InfoPageProps {
  type: 'rehabilitation' | 'bankruptcy' | 'debt-collection';
}

export default function InfoPage({ type }: InfoPageProps) {
  const [activeTab, setActiveTab] = useState(0);
  const currentData = getNavSection(type);
  const location = useLocation();

  // Scroll to top and handle tab query parameter
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

  return (
    <div className="min-h-screen bg-bg">
      {/* Header section for the page */}
      <div className="bg-main text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Left: Text & CTA */}
          <div className="flex-1 text-center md:text-left space-y-6">
            <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl leading-tight">{currentData.title}</h1>
            <p className="text-gray-300 text-lg max-w-xl mx-auto md:mx-0 break-keep">
              {currentData.description}
            </p>
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
                <span className="partner-phone-text phone-label-only" data-phone-label="전화상담">전화상담</span>
              </a>
            </div>
          </div>
          
          {/* Right: Image */}
          <div className="w-full max-w-md md:w-5/12 shrink-0">
            <div className="flex flex-col gap-3">
              <img 
                src="https://images.unsplash.com/photo-1573164574572-cb89e39749b4?auto=format&fit=crop&w=800&q=80" 
                alt="상담 고민" 
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
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 shrink-0">
          <div className="sticky top-[100px] rounded-xl bg-white shadow-sm border border-gray-100 p-2">
            {currentData.items.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveTab(idx);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-full text-left px-4 py-3 rounded-lg text-[15px] font-medium transition-colors flex items-center justify-between ${
                  activeTab === idx 
                    ? 'bg-cta/10 text-cta' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.label}
                {activeTab === idx && <ChevronRight className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {type === 'rehabilitation' ? (
            <>
              {activeTab === 0 && <RehabilitationTab1 />}
              {activeTab === 1 && <RehabilitationTab2 />}
              {activeTab === 2 && <RehabilitationTab3 />}
              {activeTab === 3 && <RehabilitationTab4 />}
              {activeTab === 4 && <RehabilitationTab6 />}
              {activeTab === 5 && <RehabilitationTab7 />}
            </>
          ) : type === 'bankruptcy' ? (
            <>
              {activeTab === 0 && <BankruptcyTab1 />}
              {activeTab === 1 && <BankruptcyTab2 />}
              {activeTab === 2 && <BankruptcyTab3 />}
              {activeTab === 3 && <BankruptcyTab4 />}
              {activeTab === 4 && <BankruptcyTab6 />}
              {activeTab === 5 && <BankruptcyTab7 />}
            </>
          ) : type === 'debt-collection' ? (
            <>
              {activeTab === 0 && <DebtCollectionTab1 />}
              {activeTab === 1 && <DebtCollectionTab2 />}
              {activeTab === 2 && <DebtCollectionTab3 />}
              {activeTab === 3 && <DebtCollectionTab4 />}
              {activeTab === 4 && <DebtCollectionTab5 />}
              {activeTab === 5 && <DebtCollectionTab6 />}
              {activeTab === 6 && <DebtCollectionTab7 />}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
