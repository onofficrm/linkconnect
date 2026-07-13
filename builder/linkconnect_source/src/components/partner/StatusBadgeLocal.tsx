import React from 'react';

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    '접수완료': 'bg-slate-100 text-slate-600 border-slate-200',
    '검수중': 'bg-blue-50 text-blue-600 border-blue-200',
    '승인완료': 'bg-emerald-50 text-emerald-600 border-emerald-200',
    '취소/무효': 'bg-red-50 text-red-600 border-red-200',
    '확정완료': 'bg-purple-50 text-purple-600 border-purple-200',
    '정산완료': 'bg-slate-900 text-white border-slate-900',
    '보류': 'bg-yellow-50 text-yellow-600 border-yellow-200',
    '중복의심': 'bg-orange-50 text-orange-600 border-orange-200',
    '지급완료': 'bg-slate-900 text-white border-slate-900',
    '승인대기': 'bg-blue-50 text-blue-600 border-blue-200',
    '신청완료': 'bg-slate-100 text-slate-600 border-slate-200',
    '반려': 'bg-red-50 text-red-600 border-red-200',
    '답변대기': 'bg-yellow-50 text-yellow-600 border-yellow-200',
    '답변완료': 'bg-emerald-50 text-emerald-600 border-emerald-200',
  };

  const defaultStyle = 'bg-slate-100 text-slate-600 border-slate-200';
  const currentStyle = styles[status] || defaultStyle;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-md border ${currentStyle} whitespace-nowrap`}>
      {status}
    </span>
  );
}
