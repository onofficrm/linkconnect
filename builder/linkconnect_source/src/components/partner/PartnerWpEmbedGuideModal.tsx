import { Copy, X } from 'lucide-react';
import { buildLeadEmbedSnippet } from '../../lib/partnerEmbed';

const STEPS = [
  {
    title: '홍보 링크 준비',
    body: '광고상품 찾기 또는 내 홍보 링크에서 CPA 홍보 링크를 생성합니다. 이미 만든 링크라면 목록의 WP 폼 버튼으로 바로 복사할 수 있습니다.',
  },
  {
    title: '설치 코드 복사',
    body: '「설치 코드 복사」또는「WP 폼」을 누르면 파트너코드(lkCode)가 포함된 HTML이 클립보드에 복사됩니다.',
  },
  {
    title: '워드프레스에 붙여넣기',
    body: '워드프레스 편집 화면에서 커스텀 HTML(또는 HTML) 블록을 추가한 뒤, 복사한 코드를 그대로 붙여넣고 페이지를 저장·게시합니다.',
  },
  {
    title: '동작 확인',
    body: '게시된 페이지에서 상담 폼이 보이면 테스트 접수를 해 보세요. 접수된 DB는 해당 홍보 링크 실적으로 파트너센터에 반영됩니다.',
  },
] as const;

type Props = {
  open: boolean;
  onClose: () => void;
  /** 있으면 예시 스니펫에 실제 코드 표시 */
  lkCode?: string;
  onCopySnippet?: (snippet: string) => void;
};

export function PartnerWpEmbedGuideModal({ open, onClose, lkCode, onCopySnippet }: Props) {
  if (!open) return null;

  const sampleCode = (lkCode || 'YOUR_LK_CODE').trim();
  const snippet = buildLeadEmbedSnippet(sampleCode);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wp-embed-guide-title"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 id="wp-embed-guide-title" className="text-lg font-bold text-slate-900">
              워드프레스 상담폼 사용방법
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">홈페이지에 파트너코드 연결 상담신청 폼 설치</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
            aria-label="닫기"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          <ol className="space-y-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </span>
                <div>
                  <div className="text-sm font-bold text-slate-900 mb-1">{step.title}</div>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <div className="text-xs font-bold text-slate-500">설치 코드 예시</div>
            <pre className="text-[11px] break-all whitespace-pre-wrap bg-slate-900 text-slate-100 rounded-xl p-3 font-mono max-h-36 overflow-y-auto">
              {snippet}
            </pre>
            {onCopySnippet && lkCode ? (
              <button
                type="button"
                onClick={() => onCopySnippet(snippet)}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold"
              >
                <Copy size={16} />
                내 설치 코드 복사
              </button>
            ) : null}
          </div>

          <ul className="text-xs text-slate-500 space-y-1.5 leading-relaxed list-disc pl-4">
            <li>페이지 URL에 <code className="text-slate-700">?lkCode=</code>가 있으면 그 값이 우선 적용됩니다.</li>
            <li>스크립트 주소는 링크커넥트 도메인이어야 합니다. (다른 서버에 파일을 복사하지 마세요)</li>
            <li>테마·캐시 플러그인 때문에 안 보이면 캐시를 비운 뒤 다시 확인해 주세요.</li>
          </ul>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl text-sm"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
