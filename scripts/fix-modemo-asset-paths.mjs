#!/usr/bin/env node
/**
 * Next.js unoptimized Image/img가 basePath를 /images 경로에 붙이지 않는 경우를 보정.
 * out/ 내 html·js·css에서 "/images/..." → "{BASE}/images/..."
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'merchant/modemo-onepage/out');
const BASE = '/plugin/onoff-builder-bridge/imports/modemo';

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, files);
    else if (/\.(html|js|css|txt|json)$/i.test(ent.name)) files.push(p);
  }
  return files;
}

function rewrite(content) {
  // 이미 보정된 경로는 유지
  const placeholder = '__MODEMO_BASE__';
  let s = content.split(`${BASE}/images/`).join(`${placeholder}/images/`);
  s = s
    .replaceAll('"/images/', `"${BASE}/images/`)
    .replaceAll("'/images/", `'${BASE}/images/`)
    .replaceAll('url(/images/', `url(${BASE}/images/`)
    .replaceAll("url('/images/", `url('${BASE}/images/`)
    .replaceAll('url("/images/', `url("${BASE}/images/`)
    .replaceAll(`url(/images/`, `url(${BASE}/images/`);
  s = s.split(`${placeholder}/images/`).join(`${BASE}/images/`);
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

console.log(`Fixed modemo asset paths in ${changed} files (base=${BASE})`);
