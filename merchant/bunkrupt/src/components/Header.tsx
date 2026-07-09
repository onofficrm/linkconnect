import { Scale, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { usePartnerContext } from '../context/PartnerContext';
import { formatPhoneDisplay, phoneTelHref } from '../lib/partnerData';
import { scrollToCalculator, scrollToConsultForm } from '../lib/consultationForm';
import { isCampaignTraffic } from '../lib/heroCopy';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPhone, data } = usePartnerContext();
  const campaignFocus = isCampaignTraffic() || location.pathname.includes('/consultation') || location.pathname.includes('/rehabilitation');

  const goForm = () => {
    setIsOpen(false);
    if (location.pathname.includes('/consultation')) {
      scrollToConsultForm();
      return;
    }
    navigate('/consultation');
    scrollToConsultForm();
  };

  const goCalculator = () => {
    setIsOpen(false);
    if (location.pathname.includes('/consultation')) {
      scrollToCalculator();
      return;
    }
    navigate('/consultation');
    scrollToCalculator();
  };

  const navLinks = campaignFocus
    ? [
        { name: '자격 확인', action: goCalculator },
        { name: '상담신청', action: goForm },
        { name: '자세히 알아보기', path: '/rehabilitation/info?tab=1' },
      ]
    : [
        { name: '개인회생', path: '/rehabilitation' },
        { name: '상담신청', action: goForm },
      ];

  const tel = hasPhone ? phoneTelHref(data.partner_phone) : '';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to={campaignFocus ? '/consultation' : '/'} className="flex items-center gap-2">
          <Scale className="h-6 w-6 text-main sm:h-7 sm:w-7" />
          <span className="text-[16px] font-bold tracking-tight text-main sm:text-xl">개인회생 자격진단 센터</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) =>
            link.path ? (
              <Link key={link.name} to={link.path} className="text-[15px] font-bold text-main transition-colors hover:text-cta">
                {link.name}
              </Link>
            ) : (
              <button
                key={link.name}
                type="button"
                onClick={link.action}
                className="text-[15px] font-bold text-main transition-colors hover:text-cta"
              >
                {link.name}
              </button>
            ),
          )}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {hasPhone && tel ? (
            <a
              href={tel}
              className="phone-only partner-phone-link flex items-center justify-center rounded-lg border border-main bg-white px-4 py-2 text-[14px] font-bold text-main transition-colors hover:bg-gray-50"
            >
              <span className="partner-phone-text">
                {formatPhoneDisplay(data.partner_phone_display || data.partner_phone) || '전화상담'}
              </span>
            </a>
          ) : null}
          <button
            type="button"
            onClick={goForm}
            className="rounded-lg bg-cta px-5 py-2 text-[14px] font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            30초 무료 확인
          </button>
        </div>

        <button
          type="button"
          className="md:hidden p-2 text-main"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="메뉴"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isOpen ? (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 shadow-lg">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) =>
              link.path ? (
                <Link key={link.name} to={link.path} onClick={() => setIsOpen(false)} className="text-[15px] font-bold text-main">
                  {link.name}
                </Link>
              ) : (
                <button key={link.name} type="button" onClick={link.action} className="text-left text-[15px] font-bold text-main">
                  {link.name}
                </button>
              ),
            )}
          </nav>
          <div className="mt-6 flex flex-col gap-2">
            {hasPhone && tel ? (
              <a
                href={tel}
                className="phone-only partner-phone-link flex items-center justify-center rounded-lg border border-main bg-white py-3 text-[14px] font-bold text-main"
              >
                <span className="partner-phone-text">
                  {formatPhoneDisplay(data.partner_phone_display || data.partner_phone) || '전화상담'}
                </span>
              </a>
            ) : null}
            <button type="button" onClick={goForm} className="rounded-lg bg-cta py-3 text-[14px] font-bold text-white shadow-sm">
              30초 무료 확인
            </button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
