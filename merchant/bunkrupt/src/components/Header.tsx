import { Scale, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToForm = () => {
    setIsOpen(false);
    navigate('/consultation');
    window.setTimeout(() => {
      document.getElementById('consult-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  };

  const navLinks = [
    { name: "개인회생", path: "/rehabilitation" },
    { name: "개인파산", path: "/bankruptcy" },
    { name: "채권추심정보", path: "/debt-collection" },
    { name: "상담신청", path: "/consultation" },
  ];

  const isActive = (path: string) => {
    if (path === '/rehabilitation') {
      return location.pathname.startsWith('/rehabilitation');
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <Scale className="h-6 w-6 text-main sm:h-7 sm:w-7" />
          <span className="text-[16px] font-bold tracking-tight text-main sm:text-xl">개인회생 자격진단 센터</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-[15px] font-bold transition-colors hover:text-cta ${
                isActive(link.path) ? 'text-cta' : 'text-main'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <a
            href="tel:"
            className="phone-only partner-phone-link flex items-center justify-center rounded-lg border border-main bg-white px-4 py-2 text-[14px] font-bold text-main transition-colors hover:bg-gray-50"
          >
            <span className="partner-phone-text phone-label-only" data-phone-label="전화상담">
              전화상담
            </span>
          </a>
          <button
            type="button"
            onClick={scrollToForm}
            className="rounded-lg bg-cta px-5 py-2 text-[14px] font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            무료 진단
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

      {isOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 shadow-lg">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`text-[15px] font-bold ${
                  isActive(link.path) ? 'text-cta' : 'text-main'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="mt-6 flex flex-col gap-2">
            <a
              href="tel:"
              className="phone-only partner-phone-link flex items-center justify-center rounded-lg border border-main bg-white py-3 text-[14px] font-bold text-main"
            >
              <span className="partner-phone-text phone-label-only" data-phone-label="전화상담">
                전화상담
              </span>
            </a>
            <button
              type="button"
              onClick={scrollToForm}
              className="rounded-lg bg-cta py-3 text-[14px] font-bold text-white shadow-sm"
            >
              무료 자격진단 신청
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
