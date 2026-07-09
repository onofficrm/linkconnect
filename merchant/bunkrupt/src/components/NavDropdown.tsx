import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navItemHref, type NavSection } from '../lib/siteNav';

function navSectionActive(pathname: string, section: NavSection): boolean {
  if (section.id === 'rehabilitation') {
    return pathname.startsWith('/rehabilitation');
  }
  if (section.id === 'bankruptcy') {
    return pathname.startsWith('/bankruptcy');
  }
  return pathname.startsWith('/debt-collection');
}

type NavDropdownProps = {
  section: NavSection;
  onNavigate?: () => void;
};

export default function NavDropdown({ section, onNavigate }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isActive = navSectionActive(location.pathname, section);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`inline-flex items-center gap-1 text-[14px] font-bold transition-colors lg:text-[15px] ${
          isActive ? 'text-cta' : 'text-main hover:text-cta'
        }`}
      >
        {section.label}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-50 mt-2 min-w-[220px] rounded-xl border border-gray-100 bg-white py-2 shadow-lg">
          {section.items.map((item) => (
            <Link
              key={item.tab}
              to={navItemHref(section, item.tab)}
              onClick={() => {
                setOpen(false);
                onNavigate?.();
              }}
              className="block px-4 py-2.5 text-[14px] font-medium text-gray-700 transition-colors hover:bg-cta/5 hover:text-cta"
            >
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
