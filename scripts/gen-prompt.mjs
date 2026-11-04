// Lấy RULES, ACT_RULES, LIFE_RULES, OUTPUT_FORMAT từ prototype/index.html, ghi ra mobile/src/pal/prompt.generated.ts.
// Nguồn chuẩn của quy tắc: documents/pal/spec-quy-tac-lap-lich.md. Đổi quy tắc thì sửa file đó, rồi prototype,
// rồi chạy lại: node scripts/gen-prompt.mjs
import fs from 'node:fs';

const lines = fs.readFileSync('prototype/index.html', 'utf8').split('\n');
const start = lines.findIndex((l) => l.startsWith('const RULES = `'));
const end = lines.findIndex((l) => l.startsWith('/* ---------- kiểm tra cân bằng'));
if (start < 0 || end < 0) throw new Error('Không tìm thấy khối prompt trong prototype');
const src = lines.slice(start, end).join('\n');
const P = new Function(`${src}\nreturn { RULES, ACT_RULES, LIFE_RULES, OUTPUT_FORMAT };`)();

const BACKSLASH = String.fromCharCode(92);
const lit = (s) => '`' + s.split(BACKSLASH).join(BACKSLASH + BACKSLASH).split('`').join(BACKSLASH + '`').split('${').join(BACKSLASH + '${') + '`';
const out =
  '// TẠO TỰ ĐỘNG bởi scripts/gen-prompt.mjs từ prototype/index.html. Không sửa tay.\n' +
  Object.entries(P).map(([k, v]) => `export const ${k} = ${lit(v)};\n`).join('\n');
fs.writeFileSync('mobile/src/pal/prompt.generated.ts', out);
console.log('Đã ghi prompt.generated.ts:', Object.entries(P).map(([k, v]) => k + ' ' + v.length).join(', '));
