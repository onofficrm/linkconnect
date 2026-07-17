import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

export function InquiryFloatingButton() {
  return (
    <Link
      to="/inquiry"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/30 border border-slate-700 transition-all hover:scale-105"
      aria-label="문의하기"
    >
      <MessageCircle size={18} className="text-cyan-400" />
      <span className="text-sm font-bold hidden sm:inline">문의하기</span>
    </Link>
  );
}
