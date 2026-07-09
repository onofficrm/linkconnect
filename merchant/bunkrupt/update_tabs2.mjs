import fs from 'fs';

const insertAfter = (content, searchStr, insertStr) => {
  const index = content.indexOf(searchStr);
  if (index === -1) return content;
  return content.slice(0, index + searchStr.length) + '\n' + insertStr + content.slice(index + searchStr.length);
};

const tabsToUpdate = [
  {
    file: 'src/pages/info-tabs/RehabilitationTab2.tsx',
    search: `<SectionTitle>개인회생 자격 자가진단</SectionTitle>`,
    insert: `        <ImageBlock 
          imageUrl="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80" 
          imageAlt="서류를 확인하는 사람들" 
          caption="신청 자격은 꼼꼼하게 검토하는 것이 중요합니다." 
        />`,
    importsSearch: `import { PageHeader, SummaryCards, SectionTitle, Checklist, InfoTable, NoticeBox, FAQAccordion, BottomCTA } from '../../components/InfoComponents';`,
    importsReplace: `import { PageHeader, SummaryCards, SectionTitle, Checklist, InfoTable, NoticeBox, FAQAccordion, BottomCTA, ImageBlock } from '../../components/InfoComponents';`
  },
  {
    file: 'src/pages/info-tabs/RehabilitationTab3.tsx',
    search: `<SectionTitle>필수 준비 서류 목록</SectionTitle>`,
    insert: `        <ImageBlock 
          imageUrl="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=800&q=80" 
          imageAlt="서류 준비" 
          caption="법원에 제출할 서류는 꼼꼼하게 준비해야 합니다." 
        />`,
    importsSearch: `import { PageHeader, SummaryCards, SectionTitle, Checklist, InfoTable, NoticeBox, FAQAccordion, BottomCTA } from '../../components/InfoComponents';`,
    importsReplace: `import { PageHeader, SummaryCards, SectionTitle, Checklist, InfoTable, NoticeBox, FAQAccordion, BottomCTA, ImageBlock } from '../../components/InfoComponents';`
  },
  {
    file: 'src/pages/info-tabs/BankruptcyTab3.tsx',
    search: `<SectionTitle>필수 준비 서류 목록</SectionTitle>`,
    insert: `        <ImageBlock 
          imageUrl="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80" 
          imageAlt="서류 작성" 
          caption="개인파산 서류 준비는 개인회생보다 엄격합니다." 
        />`,
    importsSearch: `import { PageHeader, SummaryCards, SectionTitle, Checklist, InfoTable, NoticeBox, FAQAccordion, BottomCTA } from '../../components/InfoComponents';`,
    importsReplace: `import { PageHeader, SummaryCards, SectionTitle, Checklist, InfoTable, NoticeBox, FAQAccordion, BottomCTA, ImageBlock } from '../../components/InfoComponents';`
  },
  {
    file: 'src/pages/info-tabs/DebtCollectionTab2.tsx',
    search: `<SectionTitle>불법 채권추심이란?</SectionTitle>`,
    insert: `        <ImageBlock 
          imageUrl="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80" 
          imageAlt="상담 중인 남성" 
          caption="부당한 추심은 혼자 앓지 말고 전문가와 상의해야 합니다." 
        />`,
    importsSearch: `import { PageHeader, SummaryCards, SectionTitle, Checklist, InfoTable, NoticeBox, FAQAccordion, BottomCTA } from '../../components/InfoComponents';`,
    importsReplace: `import { PageHeader, SummaryCards, SectionTitle, Checklist, InfoTable, NoticeBox, FAQAccordion, BottomCTA, ImageBlock } from '../../components/InfoComponents';`
  }
];

for (const tab of tabsToUpdate) {
  try {
    let content = fs.readFileSync(tab.file, 'utf8');
    content = content.replace(tab.importsSearch, tab.importsReplace);
    content = insertAfter(content, tab.search, tab.insert);
    fs.writeFileSync(tab.file, content, 'utf8');
    console.log(`Updated ${tab.file}`);
  } catch(e) {
    console.error(`Error updating ${tab.file}:`, e);
  }
}
