import fs from 'fs';
import path from 'path';

const dir = 'src/pages/info-tabs';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

const heroImages = [
  "https://images.unsplash.com/photo-1573497491208-6f16f2ea3094?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1558222218-b7b54eede3f3?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=800&q=80"
];
let heroImgIdx = 0;

for (const file of files) {
  let content = fs.readFileSync(path.join(dir, file), 'utf-8');
  let changed = false;

  if (content.includes('import { PageHeader,')) {
    content = content.replace('import { PageHeader,', 'import { PageHeaderWithImage, PageHeader,');
  } else if (content.includes('import { PageHeader }')) {
    content = content.replace('import { PageHeader }', 'import { PageHeaderWithImage, PageHeader }');
  }

  const pageHeaderRegex = /<PageHeader\s+title="([^"]+)"\s+description="([^"]+)"\s*\/>/g;
  content = content.replace(pageHeaderRegex, (match, title, desc) => {
    changed = true;
    const img = heroImages[heroImgIdx % heroImages.length];
    heroImgIdx++;
    return `<PageHeaderWithImage 
          title="${title}" 
          description="${desc}" 
          imageUrl="${img}"
          imageAlt="상담 이미지"
          caption="“현재 상황을 먼저 정리해보는 것이 중요합니다.”"
        >
          <Link 
            to="/consultation"
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-cta px-6 py-4 text-[16px] font-bold text-white shadow-md transition-transform hover:bg-blue-700 active:scale-[0.98]"
          >
            무료 상담신청
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a 
            href="tel:010-0000-0000" 
            className="phone-only partner-phone-link flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 border-point bg-transparent px-6 py-4 text-[16px] font-bold text-point transition-colors hover:bg-point/10"
          >
            <Phone className="h-5 w-5" />
            <span className="partner-phone-text">전화상담</span>
          </a>
        </PageHeaderWithImage>`;
  });

  if (changed) {
    const duplicateButtonsRegex = /<\/PageHeaderWithImage>\s*<SummaryCards[^>]*\/>\s*<div className="flex flex-col sm:flex-row gap-4 mb-8">[\s\S]*?<\/div>/;
    content = content.replace(duplicateButtonsRegex, (match) => {
       return match.replace(/<div className="flex flex-col sm:flex-row gap-4 mb-8">[\s\S]*?<\/div>/, '');
    });
    const duplicateButtonsRegex2 = /<\/PageHeaderWithImage>\s*<div className="flex flex-col sm:flex-row gap-4 mb-8">[\s\S]*?<\/div>/;
    content = content.replace(duplicateButtonsRegex2, (match) => {
       return match.replace(/<div className="flex flex-col sm:flex-row gap-4 mb-8">[\s\S]*?<\/div>/, '');
    });
  }

  const bottomCtaImg = heroImages[(heroImgIdx+2) % heroImages.length];
  const bottomCtaRegex = /<BottomCTA \/>/g;
  if (content.match(bottomCtaRegex)) {
    changed = true;
    content = content.replace(bottomCtaRegex, `<BottomCTA 
        title="현재 상황에 맞는 정확한 진단이 필요하신가요?" 
        description="전문가와 함께 빠르고 안전하게 방안을 모색할 수 있습니다."
        imageUrl="${bottomCtaImg}"
        imageAlt="안전한 상담"
      />`);
  }
  
  const sectionChecklistRegex = /(<SectionTitle>[^<]+<\/SectionTitle>\s*<Checklist\s+items=\{\[[\s\S]*?\]\}\s*\/>)/;
  if (!content.includes('flex flex-col md:flex-row') && !content.includes('flex flex-col-reverse md:flex-row')) {
    const match = content.match(sectionChecklistRegex);
    if (match) {
        changed = true;
        const sideImg = heroImages[(heroImgIdx+1) % heroImages.length];
        content = content.replace(sectionChecklistRegex, `
        <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
          <div className="flex-1">
            $1
          </div>
          <div className="w-full md:w-5/12 shrink-0 md:mt-14">
            <img 
              src="${sideImg}" 
              alt="관련 상황 이미지" 
              className="w-full aspect-[4/3] object-cover rounded-[24px] shadow-sm border border-gray-100" 
            />
          </div>
        </div>
        `);
    } else {
        const sectionTableRegex = /(<SectionTitle>[^<]+<\/SectionTitle>\s*<InfoTable\s+headers=\{\[[\s\S]*?\]\}\s+rows=\{\[[\s\S]*?\]\}\s*\/>)/;
        const matchTable = content.match(sectionTableRegex);
        if (matchTable) {
            changed = true;
            const sideImg = heroImages[(heroImgIdx+3) % heroImages.length];
            content = content.replace(sectionTableRegex, `
            <div className="flex flex-col-reverse md:flex-row gap-8 items-start mb-10">
              <div className="w-full md:w-5/12 shrink-0 md:mt-14">
                <img 
                  src="${sideImg}" 
                  alt="관련 상황 이미지" 
                  className="w-full aspect-[4/3] object-cover rounded-[24px] shadow-sm border border-gray-100" 
                />
              </div>
              <div className="flex-1">
                $1
              </div>
            </div>
            `);
        }
    }
  }

  if (changed) {
    fs.writeFileSync(path.join(dir, file), content, 'utf-8');
    console.log(`Updated ${file}`);
  }
}
