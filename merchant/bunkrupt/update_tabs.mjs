import fs from 'fs';

const tabsToUpdate = [
  {
    file: 'src/pages/info-tabs/RehabilitationTab1.tsx',
    headerSearch: `<PageHeader \n          title="개인회생이란?" \n          description="재정적 어려움으로 파탄에 직면한 개인채무자의 채무를 법원이 강제로 조정해 주는 제도입니다.\\n일정한 소득이 있는 경우, 3~5년 동안 일정한 금액을 갚으면 나머지 빚을 탕감받을 수 있습니다." \n        />`,
    headerReplace: `<PageHeaderWithImage 
          title="개인회생이란?" 
          description="재정적 어려움으로 파탄에 직면한 개인채무자의 채무를 법원이 강제로 조정해 주는 제도입니다.\n일정한 소득이 있는 경우, 3~5년 동안 일정한 금액을 갚으면 나머지 빚을 탕감받을 수 있습니다." 
          imageUrl="https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=800&q=80"
          imageAlt="개인회생 상담"
        />`,
    importsSearch: `import { PageHeader, SummaryCards, SectionTitle, Checklist, InfoTable, NoticeBox, FAQAccordion, BottomCTA } from '../../components/InfoComponents';`,
    importsReplace: `import { PageHeaderWithImage, SummaryCards, SectionTitle, Checklist, InfoTable, NoticeBox, FAQAccordion, BottomCTA } from '../../components/InfoComponents';`
  },
  {
    file: 'src/pages/info-tabs/RehabilitationTab6.tsx',
    headerSearch: `<PageHeader \n          title="상황별 상담 사례" \n          description="비슷한 채무 상황이라도 소득, 재산, 부양가족, 최근 대출 여부에 따라 진행 방향은 달라질 수 있습니다. 아래 사례는 상담을 이해하기 위한 예시입니다." \n        />`,
    headerReplace: `<PageHeaderWithImage 
          title="상황별 상담 사례" 
          description="비슷한 채무 상황이라도 소득, 재산, 부양가족, 최근 대출 여부에 따라 진행 방향은 달라질 수 있습니다. 아래 사례는 상담을 이해하기 위한 예시입니다." 
          imageUrl="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80"
          imageAlt="고민하는 직장인"
        />`,
    importsSearch: `import { PageHeader, SummaryCards, SectionTitle, Checklist, InfoTable, NoticeBox, FAQAccordion, BottomCTA } from '../../components/InfoComponents';`,
    importsReplace: `import { PageHeaderWithImage, SummaryCards, SectionTitle, Checklist, InfoTable, NoticeBox, FAQAccordion, BottomCTA } from '../../components/InfoComponents';`
  },
  {
    file: 'src/pages/info-tabs/BankruptcyTab1.tsx',
    headerSearch: `<PageHeader \n          title="개인파산이란?" \n          description="자신의 모든 재산으로도 모든 채무를 변제할 수 없는 '지급불능' 상태에 빠졌을 때, 법원의 선고를 통해 남은 채무를 탕감받는 제도입니다." \n        />`,
    headerReplace: `<PageHeaderWithImage 
          title="개인파산이란?" 
          description="자신의 모든 재산으로도 모든 채무를 변제할 수 없는 '지급불능' 상태에 빠졌을 때, 법원의 선고를 통해 남은 채무를 탕감받는 제도입니다." 
          imageUrl="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=800&q=80"
          imageAlt="개인파산 서류 준비"
        />`,
    importsSearch: `import { PageHeader, SummaryCards, SectionTitle, Checklist, InfoTable, NoticeBox, FAQAccordion, BottomCTA } from '../../components/InfoComponents';`,
    importsReplace: `import { PageHeaderWithImage, SummaryCards, SectionTitle, Checklist, InfoTable, NoticeBox, FAQAccordion, BottomCTA } from '../../components/InfoComponents';`
  },
  {
    file: 'src/pages/info-tabs/BankruptcyTab6.tsx',
    headerSearch: `<PageHeader \n          title="상황별 상담 사례" \n          description="비슷한 채무 상황이라도 소득, 재산, 부양가족, 과거 면책 여부, 건강 상태 등에 따라 진행 방향은 달라질 수 있습니다. 아래 사례는 상담을 이해하기 위한 예시입니다." \n        />`,
    headerReplace: `<PageHeaderWithImage 
          title="상황별 상담 사례" 
          description="비슷한 채무 상황이라도 소득, 재산, 부양가족, 과거 면책 여부, 건강 상태 등에 따라 진행 방향은 달라질 수 있습니다. 아래 사례는 상담을 이해하기 위한 예시입니다." 
          imageUrl="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80"
          imageAlt="중년 남성의 고민"
        />`,
    importsSearch: `import { PageHeader, SummaryCards, SectionTitle, Checklist, InfoTable, NoticeBox, FAQAccordion, BottomCTA } from '../../components/InfoComponents';`,
    importsReplace: `import { PageHeaderWithImage, SummaryCards, SectionTitle, Checklist, InfoTable, NoticeBox, FAQAccordion, BottomCTA } from '../../components/InfoComponents';`
  },
  {
    file: 'src/pages/info-tabs/DebtCollectionTab1.tsx',
    headerSearch: `<PageHeader \n          title="채권추심이란?" \n          description="채권자가 채무자에게 채무 변제를 요구하는 절차입니다.\\n합법적인 범위 안에서 이루어질 수 있지만, 협박성 발언, 반복적인 괴롭힘, 제3자에게 채무 사실을 알리는 행위 등은 문제가 될 수 있습니다." \n        />`,
    headerReplace: `<PageHeaderWithImage 
          title="채권추심이란?" 
          description="채권자가 채무자에게 채무 변제를 요구하는 절차입니다.\n합법적인 범위 안에서 이루어질 수 있지만, 협박성 발언, 반복적인 괴롭힘, 제3자에게 채무 사실을 알리는 행위 등은 문제가 될 수 있습니다." 
          imageUrl="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80"
          imageAlt="채권추심 대응 상담"
        />`,
    importsSearch: `import { PageHeader, SummaryCards, SectionTitle, Checklist, InfoTable, NoticeBox, FAQAccordion, BottomCTA } from '../../components/InfoComponents';`,
    importsReplace: `import { PageHeaderWithImage, SummaryCards, SectionTitle, Checklist, InfoTable, NoticeBox, FAQAccordion, BottomCTA } from '../../components/InfoComponents';`
  },
  {
    file: 'src/pages/info-tabs/DebtCollectionTab6.tsx',
    headerSearch: `<PageHeader \n          title="상황별 대처 사례" \n          description="채권추심은 채무자의 상황(독촉전화, 내용증명, 지급명령, 압류 등)에 따라 대응 전략이 달라져야 합니다. 아래 사례를 통해 어떻게 대처해야 하는지 확인해 보세요." \n        />`,
    headerReplace: `<PageHeaderWithImage 
          title="상황별 대처 사례" 
          description="채권추심은 채무자의 상황(독촉전화, 내용증명, 지급명령, 압류 등)에 따라 대응 전략이 달라져야 합니다. 아래 사례를 통해 어떻게 대처해야 하는지 확인해 보세요." 
          imageUrl="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
          imageAlt="진지한 법률 상담"
        />`,
    importsSearch: `import { PageHeader, SummaryCards, SectionTitle, Checklist, InfoTable, NoticeBox, FAQAccordion, BottomCTA } from '../../components/InfoComponents';`,
    importsReplace: `import { PageHeaderWithImage, SummaryCards, SectionTitle, Checklist, InfoTable, NoticeBox, FAQAccordion, BottomCTA } from '../../components/InfoComponents';`
  }
];

for (const tab of tabsToUpdate) {
  try {
    let content = fs.readFileSync(tab.file, 'utf8');
    content = content.replace(tab.importsSearch, tab.importsReplace);
    content = content.replace(tab.headerSearch, tab.headerReplace);
    fs.writeFileSync(tab.file, content, 'utf8');
    console.log(`Updated ${tab.file}`);
  } catch(e) {
    console.error(`Error updating ${tab.file}:`, e);
  }
}
