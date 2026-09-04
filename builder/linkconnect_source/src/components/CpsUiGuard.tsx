import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { isCpsUiVisible, isLcLoggedIn } from '../lib/auth';

/**
 * CPS 관련 라우트 가드 — CPS_UI_ENABLED=false 이면 차단.
 * 복원: auth.ts 의 CPS_UI_ENABLED = true
 * 비공개 시 기능(API·숏링크)은 유지되며 UI 경로만 숨긴다.
 */
export function CpsUiGuard({
  fallback = '/',
}: {
  fallback?: string;
}) {
  const location = useLocation();

  if (isCpsUiVisible()) {
    return <Outlet />;
  }

  if (isLcLoggedIn() && location.pathname.startsWith('/admin')) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-3">CPS 메뉴는 일시 비공개입니다</h1>
          <p className="text-slate-600 mb-4">CPS 관련 화면은 현재 숨김 처리되어 있습니다. 기능은 백그라운드에서 유지됩니다.</p>
          <div className="mt-6 flex gap-3">
            <Link to="/admin" className="text-sm text-cyan-600 hover:underline">
              관리자 홈
            </Link>
            <Link to="/" className="text-sm text-slate-500 hover:text-cyan-600">
              홈으로
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <Navigate to={fallback} replace />;
}
