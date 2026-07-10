import { Scale, Menu, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { usePartnerContext } from '../context/PartnerContext';
import { formatPhoneDisplay, phoneTelHref } from '../lib/partnerData';
import { scrollToCalculator, scrollToConsultForm } from '../lib/consultationForm';
import { isCampaignTraffic } from '../lib/heroCopy';
import { SITE_NAV_SECTIONS, navItemHref } from '../lib/siteNav';
import NavDropdown from './NavDropdown';

const HOME_PATH = '/consultation';

function showQualificationNav(pathname: string): boolean {
  return (
    pathname.includes('/consultation') ||
    pathname.includes('/rehabilitation') ||
    pathname.includes('/bankruptcy') ||
    pathname.includes('/debt-collection') ||
    isCampaignTraffic()
  );
}

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPhone, data } = usePartnerContext();
  const showQualification = showQualificationNav(location.pathname);

  const closeMobile = () => {
    setIsOpen(false);
    setMobileSection(null);
  };

  const goForm = () => {
    closeMobile();
    if (location.pathname.includes('/consultation')) {
      scrollToConsultForm();
      return;
    }
    navigate('/consultation');
    scrollToConsultForm();
  };

  const goCalculator = () => {
    closeMobile();
    if (location.pathname.includes('/consultation')) {
      scrollToCalculator();
      return;
    }
    navigate('/consultation');
    scrollToCalculator();
  };

  const tel = hasPhone ? phoneTelHref(data.partner_phone) : '';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to={HOME_PATH} onClick={closeMobile} className="flex shrink-0 items-center gap-2">
          <Scale className="h-6 w-6 text-main sm:h-7 sm:w-7" />
          <span className="text-[15px] font-bold tracking-tight text-main sm:text-[17px] lg:text-xl">
            개인회생 자격진단 센터
          </span>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex xl:gap-7">
          {SITE_NAV_SECTIONS.map((section) => (
            <NavDropdown key={section.id} section={section} />
          ))}
          {showQualification ? (
            <button
              type="button"
              onClick={goCalculator}
              className="text-[14px] font-bold text-main transition-colors hover:text-cta lg:text-[15px]"
            >
              자격 확인
            </button>
          ) : null}
          <button
            type="button"
            onClick={goForm}
            className="text-[14px] font-bold text-main transition-colors hover:text-cta lg:text-[15px]"
          >
            상담신청
          </button>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
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
          className="p-2 text-main lg:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="메뉴"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isOpen ? (
        <div className="max-h-[calc(100vh-72px)] overflow-y-auto border-t border-gray-100 bg-white px-4 py-4 shadow-lg lg:hidden">
          <nav className="flex flex-col gap-1">
            {SITE_NAV_SECTIONS.map((section) => {
              const expanded = mobileSection === section.id;
              return (
                <div key={section.id} className="rounded-lg border border-gray-100">
                  <button
                    type="button"
                    onClick={() => setMobileSection(expanded ? null : section.id)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left text-[15px] font-bold text-main"
                  >
                    {section.label}
                    <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                  </button>
                  {expanded ? (
                    <div className="border-t border-gray-100 bg-gray-50/80 px-2 py-2">
                      {section.items.map((item) => (
                        <Link
                          key={item.tab}
                          to={navItemHref(section, item.tab)}
                          onClick={closeMobile}
                          className="block rounded-md px-3 py-2.5 text-[14px] font-medium text-gray-700 hover:bg-white hover:text-cta"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}

            {showQualification ? (
              <button
                type="button"
                onClick={goCalculator}
                className="mt-2 rounded-lg px-4 py-3 text-left text-[15px] font-bold text-main"
              >
                자격 확인
              </button>
            ) : null}
            <button
              type="button"
              onClick={goForm}
              className="rounded-lg px-4 py-3 text-left text-[15px] font-bold text-main"
            >
              상담신청
            </button>
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
