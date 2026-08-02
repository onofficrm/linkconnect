#!/usr/bin/env node
/**
 * Next.js unoptimized Image/img 및 CSS background 이미지 경로 보정.
 * Cafe24 핫링크 회피: /images → PHP merchant-static 프록시.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'merchant/modemo-onepage/out');
const BASE = '/plugin/onoff-builder-bridge/imports/modemo';
const PROXY_PREFIX = '/plugin/linkconnect/api/merchant-static.php?m=modemo&p=';

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, files);
    else if (/\.(html|js|css|txt|json)$/i.test(ent.name)) files.push(p);
  }
  return files;
}

function toProxy(imageRel) {
  const rel = String(imageRel).replace(/^\/+/, '');
  return `${PROXY_PREFIX}${encodeURIComponent(rel)}`;
}

function rewrite(content) {
  let s = content;

  // 잘못된 레거시 도메인
  s = s.replaceAll('https://yevely.jp', 'https://yevely.kr');
  s = s.replaceAll('http://yevely.jp', 'https://yevely.kr');
  s = s.replaceAll('https://www.yevely.jp', 'https://yevely.kr');
  s = s.replaceAll('http://www.yevely.jp', 'https://yevely.kr');

  // /plugin/.../imports/modemo/images/... → proxy
  const baseEsc = BASE.replace(/\//g, '\\/');
  s = s.replace(new RegExp(`${baseEsc}\\/images\\/([^"'\\s?#)]+)`, 'g'), (_, file) =>
    toProxy(`images/${file}`),
  );

  // root-relative /images/...
  s = s.replace(/"\/images\/([^"]+)"/g, (_, file) => `"${toProxy(`images/${file}`)}"`);
  s = s.replace(/'\/images\/([^']+)'/g, (_, file) => `'${toProxy(`images/${file}`)}'`);
  s = s.replace(/url\(\/images\/([^)]+)\)/g, (_, file) => `url(${toProxy(`images/${file}`)})`);
  s = s.replace(/url\("\/images\/([^"]+)"\)/g, (_, file) => `url("${toProxy(`images/${file}`)}")`);
  s = s.replace(/url\('\/images\/([^']+)'\)/g, (_, file) => `url('${toProxy(`images/${file}`)}')`);

  return s;
}

if (!fs.existsSync(OUT)) {
  console.error('out 없음:', OUT);
  process.exit(1);
}

let changed = 0;
for (const file of walk(OUT)) {
  const before = fs.readFileSync(file, 'utf8');
  const after = rewrite(before);
  if (after !== before) {
    fs.writeFileSync(file, after);
    changed += 1;
  }
}

console.log(`Fixed modemo asset paths in ${changed} files (proxy=${PROXY_PREFIX})`);
