import fs from 'fs';

const files = [
  {
    file: 'src/pages/info-tabs/RehabilitationTab1.tsx',
    image: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=800&q=80',
    alt: '개인회생 상담'
  },
  {
    file: 'src/pages/info-tabs/RehabilitationTab6.tsx',
    image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80',
    alt: '고민하는 직장인'
  },
  {
    file: 'src/pages/info-tabs/BankruptcyTab1.tsx',
    image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=800&q=80',
    alt: '개인파산 서류 준비'
  },
  {
    file: 'src/pages/info-tabs/BankruptcyTab6.tsx',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80',
    alt: '중년 남성의 고민'
  },
  {
    file: 'src/pages/info-tabs/DebtCollectionTab1.tsx',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80',
    alt: '채권추심 대응 상담'
  },
  {
    file: 'src/pages/info-tabs/DebtCollectionTab6.tsx',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    alt: '진지한 법률 상담'
  }
];

for (const item of files) {
  try {
    let content = fs.readFileSync(item.file, 'utf8');
    content = content.replace(/<PageHeader\s+title="([^"]+)"\s+description="([^"]+)"\s*\/>/s, 
      '<PageHeaderWithImage \n          title="$1" \n          description="$2" \n          imageUrl="' + item.image + '"\n          imageAlt="' + item.alt + '"\n        />');
    fs.writeFileSync(item.file, content, 'utf8');
    console.log(`Updated header in ${item.file}`);
  } catch (e) {
    console.error(`Error updating ${item.file}:`, e);
  }
}
