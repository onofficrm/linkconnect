import fs from 'fs';

const replaces = [
  {
    file: 'src/pages/info-tabs/RehabilitationTab2.tsx',
    search: 'photo-1552664730-d307ca884978',
    replace: 'photo-1542744173-8e7e53415bb0'
  },
  {
    file: 'src/pages/info-tabs/RehabilitationTab3.tsx',
    search: 'photo-1553877522-43269d4ea984',
    replace: 'photo-1573496799652-408c2ac9fe98'
  },
  {
    file: 'src/pages/info-tabs/DebtCollectionTab2.tsx',
    search: 'photo-1560250097-0b93528c311a',
    replace: 'photo-1522071820081-009f0129c71c'
  }
];

for (const rep of replaces) {
  try {
    let content = fs.readFileSync(rep.file, 'utf8');
    content = content.replace(rep.search, rep.replace);
    fs.writeFileSync(rep.file, content, 'utf8');
    console.log(`Updated ${rep.file}`);
  } catch (e) {
    console.error(`Error updating ${rep.file}:`, e);
  }
}
