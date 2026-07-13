import React from 'react';

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    '신규접수': 'bg-slate-100 text-slate-600 border-slate-200',
    '확인중': 'bg-blue-50 text-blue-600 border-blue-200',
    '승인완료': 'bg-emerald-50 text-emerald-600 border-emerald-200',
    '취소요청': 'bg-orange-50 text-orange-600 border-orange-200',
    '취소/무효': 'bg-red-50 text-red-600 border-red-200',
    '보류': 'bg-yellow-50 text-yellow-600 border-yellow-200',
    '충전완료': 'bg-cyan-50 text-cyan-600 border-cyan-200',
    '차감완료': 'bg-slate-800 text-slate-100 border-slate-900',
    '환급완료': 'bg-emerald-50 text-emerald-600 border-emerald-200',
    '진행중': 'bg-cyan-50 text-cyan-600 border-cyan-200',
    '일시중지': 'bg-yellow-50 text-yellow-600 border-yellow-200',
    '종료': 'bg-slate-100 text-slate-600 border-slate-200',
    '접수완료': 'bg-slate-100 text-slate-600 border-slate-200',
    '처리중': 'bg-blue-50 text-blue-600 border-blue-200',
    '답변대기': 'bg-yellow-50 text-yellow-600 border-yellow-200',
    '답변완료': 'bg-cyan-50 text-cyan-600 border-cyan-200',
    '홍보없음': 'bg-slate-100 text-slate-500 border-slate-200',
  };

  const defaultStyle = 'bg-slate-100 text-slate-600 border-slate-200';
  const currentStyle = styles[status] || defaultStyle;

  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-bold rounded border ${currentStyle} whitespace-nowrap`}>
      {status}
    </span>
  );
}
