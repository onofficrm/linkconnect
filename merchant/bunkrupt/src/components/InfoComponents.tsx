import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, ChevronDown, Phone, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PageHeader({ title, description }: { title: string, description: string }) {
  return (
    <div className="mb-10">
      <h2 className="text-2xl sm:text-3xl font-bold text-main mb-5">{title}</h2>
      <p className="text-gray-700 text-[16px] sm:text-lg leading-relaxed whitespace-pre-line">
        {description}
      </p>
    </div>
  );
}

export function PageHeaderWithImage({ title, description, imageUrl, imageAlt, caption, children }: { title: string, description: string, imageUrl: string, imageAlt: string, caption?: string, children?: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center mb-10 bg-gray-50/50 p-6 sm:p-8 rounded-3xl border border-gray-100">
      <div className="flex-1 space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-main mb-4">{title}</h2>
          <p className="text-gray-700 text-[16px] sm:text-lg leading-relaxed whitespace-pre-line">
            {description}
          </p>
        </div>
        {children && (
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {children}
          </div>
        )}
      </div>
      <div className="w-full md:w-5/12 shrink-0">
        <div className="flex flex-col gap-3">
          <img 
            src={imageUrl} 
            alt={imageAlt} 
            className="w-full aspect-[16/10] sm:aspect-[4/3] md:aspect-[16/10] object-cover rounded-[24px] shadow-lg border border-gray-100" 
          />
          {caption && (
            <p className="text-center text-sm text-gray-500 font-medium tracking-wide">
              {caption}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function ImageBlock({ imageUrl, imageAlt, caption }: { imageUrl: string, imageAlt: string, caption?: string }) {
  return (
    <div className="my-8 rounded-2xl bg-white border border-gray-100 shadow-sm p-4 sm:p-5 max-w-3xl mx-auto">
      <img 
        src={imageUrl} 
        alt={imageAlt} 
        className="w-full h-48 sm:h-72 object-cover rounded-xl"
      />
      {caption && (
        <p className="text-center text-sm text-gray-500 mt-3">{caption}</p>
      )}
    </div>
  );
}

export function SummaryCards({ items }: { items: { title: string, desc: string }[] }) {
  return (
    <div className="grid sm:grid-cols-3 gap-5 mb-12">
      {items.map((item, i) => (
        <div key={i} className="bg-blue-50/60 p-6 rounded-2xl border border-blue-100/60 shadow-sm">
          <h4 className="font-bold text-main mb-3 text-lg">{item.title}</h4>
          <p className="text-[15px] text-gray-700 leading-relaxed">{item.desc}</p>
        </div>
      ))}
    </div>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xl sm:text-2xl font-bold text-main mb-6 flex items-center gap-3 mt-14">
      <div className="w-1.5 h-7 bg-cta rounded-full"></div>
      {children}
    </h3>
  );
}

export function Checklist({ items }: { items: string[] }) {
  return (
    <div className="grid sm:grid-cols-2 gap-4 mb-10">
      {items.map((text, i) => (
        <div key={i} className="flex items-start gap-3 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CheckCircle2 className="h-6 w-6 text-point shrink-0 mt-0.5" />
          <span className="text-[15px] sm:text-[16px] text-gray-800 font-medium leading-relaxed">{text}</span>
        </div>
      ))}
    </div>
  );
}

export function InfoTable({ headers, rows }: { headers: string[], rows: (string | React.ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 mb-10 shadow-sm">
      <table className="w-full text-left text-[15px]">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-6 py-5 font-bold text-gray-900">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50/50 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className={`px-6 py-5 text-gray-700 leading-relaxed ${j === 0 ? 'font-bold text-gray-900 bg-gray-50/30' : ''}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function NoticeBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 p-6 sm:p-8 rounded-2xl flex gap-4 border border-gray-200 mb-10">
      <AlertCircle className="w-6 h-6 text-gray-400 shrink-0 mt-0.5" />
      <div className="text-[14px] sm:text-[15px] text-gray-600 leading-relaxed">
        <p className="font-bold text-gray-700 mb-1">안내 및 주의사항</p>
        {children}
      </div>
    </div>
  );
}

export function FAQAccordion({ items }: { items: { q: string, a: string }[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  
  return (
    <div className="space-y-4 mb-10">
      {items.map((item, i) => {
        const isOpen = openIdx === i;
        return (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
            <button 
              className="w-full text-left p-6 flex justify-between items-start gap-4"
              onClick={() => setOpenIdx(isOpen ? null : i)}
            >
              <div className="flex gap-4 items-start">
                <div className="shrink-0 w-8 h-8 rounded-full bg-blue-50 text-cta flex items-center justify-center font-bold text-sm mt-0.5">
                  Q
                </div>
                <h4 className="text-[16px] sm:text-lg font-bold text-gray-900 leading-tight pt-1">{item.q}</h4>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-400 shrink-0 transition-transform mt-1 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
              <div className="px-6 pb-6 pt-2">
                <div className="ml-12 pl-4 text-[15px] text-gray-700 leading-relaxed border-l-2 border-cta/30">
                  <span className="font-bold text-main mr-2 hidden">A.</span>
                  {item.a}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function BottomCTA({ title, description, imageUrl, imageAlt }: { title?: string, description?: string, imageUrl?: string, imageAlt?: string }) {
  return (
    <div className="rounded-3xl bg-main p-8 sm:p-12 relative overflow-hidden mt-16 shadow-xl border border-blue-900/50">
      <div className="absolute top-0 right-0 w-72 h-72 bg-point rounded-full mix-blend-multiply filter blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-cta rounded-full mix-blend-multiply filter blur-3xl opacity-20 transform -translate-x-1/2 translate-y-1/2"></div>
      
      <div className={`relative z-10 flex flex-col ${imageUrl ? 'md:flex-row items-center text-left gap-10' : 'text-center'}`}>
        <div className="flex-1">
          <h3 className="mb-4 text-2xl font-bold sm:text-3xl leading-tight text-white">
            {title || "현재 상황에 맞는 정확한 진단이 필요하신가요?"}
          </h3>
          <p className={`mb-10 text-gray-300 text-[15px] sm:text-base leading-relaxed ${imageUrl ? '' : 'max-w-lg mx-auto'}`}>
            {description || (
              <>
                복잡한 법률 문제, 혼자 고민하지 마세요.<br/>
                전문가가 가장 안전하고 확실한 길을 안내해 드립니다.
              </>
            )}
          </p>
          
          <div className={`flex flex-col sm:flex-row gap-4 ${imageUrl ? 'justify-start' : 'justify-center'}`}>
            <Link 
              to="/consultation"
              className="flex items-center justify-center gap-2 rounded-2xl bg-cta px-10 py-5 text-[16px] font-bold text-white shadow-md transition-transform hover:bg-blue-700 active:scale-[0.98]"
            >
              무료 상담신청
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a 
              href="tel:" 
              className="phone-only partner-phone-link flex items-center justify-center gap-2 rounded-2xl border-2 border-point bg-transparent px-10 py-5 text-[16px] font-bold text-point transition-colors hover:bg-point/10"
            >
              <Phone className="h-5 w-5" />
              <span className="partner-phone-text phone-label-only" data-phone-label="전화 상담">전화 상담</span>
            </a>
          </div>
        </div>
        {imageUrl && (
          <div className="w-full md:w-5/12 shrink-0">
            <img 
              src={imageUrl} 
              alt={imageAlt || "상담 신청"} 
              className="w-full aspect-[16/10] sm:aspect-[4/3] object-cover rounded-[24px] shadow-lg shadow-black/30 border border-white/10" 
            />
          </div>
        )}
      </div>
    </div>
  );
}
