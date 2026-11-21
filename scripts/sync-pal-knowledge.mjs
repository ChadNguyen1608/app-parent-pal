#!/usr/bin/env node
// D-69: chép một TẬP NHỎ từ documents/knowledge vào Edge Function pal-chat (Deno chỉ nạp mã trong supabase/functions/).
// Lấy mục "Ở tuổi này con cần gì (tóm tắt)" của từng file chặng tuổi, ghi vào backend/supabase/functions/_shared/knowledge/pal-knowledge.ts.
// Nội dung là NHÁP, người soạn AI, CHƯA DUYỆT (CLAUDE.md "Nội dung do AI soạn ... không được tự chuyển sang đã duyệt").
// Bản đầu KHÔNG tìm kiếm vector: pal-chat chọn đoạn theo tuổi của con. TODO: kho đầy đủ (cả bài từng nhóm), tìm theo chủ đề, nguồn NG-xxx.
//   node scripts/sync-pal-knowledge.mjs           ghi
//   node scripts/sync-pal-knowledge.mjs --check   không ghi; thoát 1 nếu lệch (CI)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BY_AGE = 'documents/knowledge/by-age';
// [thư mục, file, tuổi nhỏ nhất, tuổi lớn nhất (số tuổi tròn của hồ sơ con), nhãn]
const FILES = [
  ['age-00-06-early-childhood', 'content-01-so-sinh-0-1-thang.md', 0, 0, '0–1 tháng'],
  ['age-00-06-early-childhood', 'content-02-nhu-nhi-1-12-thang.md', 0, 0, '1–12 tháng'],
  ['age-00-06-early-childhood', 'content-03-tap-di-12-18-thang.md', 1, 1, '12–18 tháng'],
  ['age-00-06-early-childhood', 'content-04-tap-di-18-24-thang.md', 1, 1, '18–24 tháng'],
  ['age-00-06-early-childhood', 'content-05-nha-tre-2-3-tuoi.md', 2, 2, '2–3 tuổi'],
  ['age-00-06-early-childhood', 'content-06-mau-giao-3-4-tuoi.md', 3, 3, '3–4 tuổi'],
  ['age-00-06-early-childhood', 'content-07-mau-giao-4-5-tuoi.md', 4, 4, '4–5 tuổi'],
  ['age-00-06-early-childhood', 'content-08-mau-giao-5-6-tuoi.md', 5, 5, '5–6 tuổi'],
  ['age-06-11-primary-school', 'content-01-tieu-hoc-dau-6-8-tuoi.md', 6, 8, '6–8 tuổi'],
  ['age-06-11-primary-school', 'content-02-tieu-hoc-cuoi-9-11-tuoi.md', 9, 10, '9–11 tuổi'],
  ['age-11-15-lower-secondary', 'content-01-thcs-dau-11-13-tuoi.md', 11, 12, '11–13 tuổi'],
  ['age-11-15-lower-secondary', 'content-02-thcs-cuoi-13-15-tuoi.md', 13, 14, '13–15 tuổi'],
  ['age-15-18-upper-secondary', 'content-01-thpt-dau-15-17-tuoi.md', 15, 16, '15–17 tuổi'],
  ['age-15-18-upper-secondary', 'content-02-thpt-cuoi-17-18-tuoi.md', 17, 18, '17–18 tuổi'],
];

function section(md, file) {
  const lines = md.split('\n');
  const i = lines.findIndex((l) => /^##\s+.*con cần gì/.test(l));
  if (i < 0) throw new Error(`${file}: không thấy mục "con cần gì"`);
  let j = i + 1;
  while (j < lines.length && !/^##\s/.test(lines[j])) j++;
  return lines.slice(i + 1, j).join('\n').trim();
}

const bands = FILES.map(([dir, f, min, max, label]) => {
  const rel = `${BY_AGE}/${dir}/${f}`;
  return { file: rel, label, minAge: min, maxAge: max, text: section(readFileSync(join(ROOT, rel), 'utf8'), rel) };
});

const out = `// SINH TỰ ĐỘNG bởi scripts/sync-pal-knowledge.mjs từ documents/knowledge/by-age. KHÔNG SỬA TAY: sửa tài liệu rồi chạy lại script.
// NHÁP, người soạn: AI, CHƯA DUYỆT. Chỉ là tóm tắt "Ở tuổi này con cần gì" theo chặng tuổi; chưa phải kho đầy đủ.
export const PAL_KNOWLEDGE_LABEL = 'nháp, người soạn AI, chưa duyệt';
export interface KnowledgeBand { file: string; label: string; minAge: number; maxAge: number; text: string }
export const PAL_KNOWLEDGE: KnowledgeBand[] = ${JSON.stringify(bands, null, 2)};
`;
const dest = join(ROOT, 'backend/supabase/functions/_shared/knowledge/pal-knowledge.ts');
if (process.argv.includes('--check')) {
  if (!existsSync(dest) || readFileSync(dest, 'utf8') !== out) { console.error('pal-knowledge.ts lệch nguồn: chạy node scripts/sync-pal-knowledge.mjs'); process.exit(1); }
  console.log('pal-knowledge.ts khớp nguồn');
} else {
  import('node:fs').then(({ mkdirSync }) => { mkdirSync(dirname(dest), { recursive: true }); writeFileSync(dest, out); console.log(`ghi ${dest} (${bands.length} đoạn, ${out.length} ký tự)`); });
}
