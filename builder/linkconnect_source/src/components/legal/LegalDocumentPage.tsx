import { FileText, Shield } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { LegalBlock, LegalDocument } from '../../content/legal/types';

type LegalDocumentPageProps = {
  doc: LegalDocument;
  variant?: 'terms' | 'privacy';
};

function renderBlock(block: LegalBlock, index: number) {
  if (block.type === 'p') {
    return (
      <p key={index} className="text-slate-600 leading-relaxed text-sm md:text-base">
        {block.text}
      </p>
    );
  }
  if (block.type === 'ul') {
    return (
      <ul key={index} className="list-disc pl-5 space-y-2 text-slate-600 text-sm md:text-base leading-relaxed">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }
  return (
    <ol key={index} className="list-decimal pl-5 space-y-2 text-slate-600 text-sm md:text-base leading-relaxed">
      {block.items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ol>
  );
}

export function LegalDocumentPage({ doc, variant = 'terms' }: LegalDocumentPageProps) {
  const Icon = variant === 'privacy' ? Shield : FileText;

  useEffect(() => {
    document.title = `${doc.title} | LinkConnect`;
  }, [doc.title]);

  return (
    <main>
      <section className="pt-28 pb-14 md:pt-32 md:pb-20 px-4 sm:px-6 lg:px-8 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950 to-slate-950" />
        <div className={`absolute top-1/3 -right-24 w-80 h-80 rounded-full blur-3xl ${variant === 'privacy' ? 'bg-cyan-500/10' : 'bg-emerald-500/10'}`} />

        <div className="max-w-4xl mx-auto relative text-center">
          <p className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium mb-6 ${variant === 'privacy' ? 'text-cyan-400' : 'text-emerald-400'}`}>
            <Icon className="w-4 h-4" />
            {doc.eyebrow}
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5">{doc.title}</h1>
          <p className="text-slate-400 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">{doc.summary}</p>
          <p className="mt-6 text-xs text-slate-500">시행일: {doc.effectiveDate}</p>
        </div>
      </section>

      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[240px_1fr] gap-10 lg:gap-14 items-start">
          <aside className="lg:sticky lg:top-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">목차</p>
            <nav className="space-y-2" aria-label="문서 목차">
              {doc.sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block text-sm text-slate-600 hover:text-emerald-600 transition-colors leading-snug"
                >
                  {section.title}
                </a>
              ))}
            </nav>
            <div className="mt-6 pt-5 border-t border-slate-100 space-y-2 text-sm">
              <Link to="/" className="block text-slate-500 hover:text-slate-800">
                홈으로
              </Link>
              {variant === 'terms' ? (
                <Link to="/privacy" className="block text-cyan-600 hover:text-cyan-700 font-medium">
                  개인정보처리방침 보기
                </Link>
              ) : (
                <Link to="/terms" className="block text-emerald-600 hover:text-emerald-700 font-medium">
                  이용약관 보기
                </Link>
              )}
            </div>
          </aside>

          <article className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-6 md:px-10 py-8 md:py-10 space-y-10">
              {doc.sections.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-28">
                  <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
                    {section.title}
                  </h2>
                  <div className="space-y-4">{section.blocks.map((block, i) => renderBlock(block, i))}</div>
                </section>
              ))}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
