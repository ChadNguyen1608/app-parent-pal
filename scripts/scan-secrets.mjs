#!/usr/bin/env node
// Quét bí mật trong các file được git theo dõi (Tech Spec 13.1 §6.4, task T0.7).
// Repo công khai: không commit khóa, .env, google-services.json, khóa ký (CLAUDE.md).
// Chạy: node scripts/scan-secrets.mjs   → mã thoát 1 nếu tìm thấy.
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const FORBIDDEN_FILES = [
  /(^|\/)\.env(\.|$)/,
  /(^|\/)google-services\.json$/,
  /(^|\/)GoogleService-Info\.plist$/,
  /-adminsdk-.*\.json$/,
  /\.(keystore|jks|p12|pem|apk|aab)$/,
];

const PATTERNS = [
  { name: 'Khóa Google API', re: /AIza[0-9A-Za-z_\-]{35}/ },
  { name: 'Khóa Anthropic', re: /sk-ant-[A-Za-z0-9_\-]{20,}/ },
  { name: 'Khóa riêng PEM', re: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { name: 'JWT (có thể là khóa Supabase)', re: /eyJ[A-Za-z0-9_\-]{10,}\.eyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}/ },
  { name: 'Gán service_role key', re: /service_role[_ ]?key\s*[:=]\s*['"][^'"]{20,}/i },
  { name: 'Khóa AWS', re: /AKIA[0-9A-Z]{16}/ },
];

// File được phép nhắc tên mẫu (chính script này và tài liệu mô tả quy tắc).
const ALLOW = [/^scripts\/scan-secrets\.mjs$/, /\.md$/];

const files = execSync('git ls-files -z', { encoding: 'utf8' }).split('\0').filter(Boolean);
const problems = [];

for (const f of files) {
  if (FORBIDDEN_FILES.some((re) => re.test(f))) {
    problems.push(`${f}: loại file không được commit`);
    continue;
  }
  if (ALLOW.some((re) => re.test(f))) continue;
  let text;
  try {
    const buf = readFileSync(f);
    if (buf.includes(0)) continue; // bỏ qua file nhị phân
    text = buf.toString('utf8');
  } catch {
    continue;
  }
  for (const { name, re } of PATTERNS) {
    if (re.test(text)) problems.push(`${f}: nghi có ${name}`);
  }
}

if (problems.length) {
  console.error('Quét bí mật: THẤT BẠI');
  for (const p of problems) console.error('  - ' + p);
  process.exit(1);
}
console.log(`Quét bí mật: đạt (${files.length} file).`);
