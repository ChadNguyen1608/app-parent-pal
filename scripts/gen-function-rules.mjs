// Ghi bộ luật cố định của Pal (SYSTEM_PROMPT của app) ra supabase/functions/pal-chat/rules.txt.
// Edge Function tải file này theo mã commit và kiểm sha256 trước khi dùng (xem README của pal-chat).
// Chạy lại sau khi đổi quy tắc: node scripts/gen-prompt.mjs && node --experimental-strip-types scripts/gen-function-rules.mjs
import { createHash } from 'node:crypto';
import fs from 'node:fs';

const { SYSTEM_PROMPT } = await import('../mobile/src/pal/prompt.ts');
fs.writeFileSync('supabase/functions/pal-chat/rules.txt', SYSTEM_PROMPT);
console.log('Đã ghi rules.txt,', SYSTEM_PROMPT.length, 'ký tự');
console.log('sha256', createHash('sha256').update(fs.readFileSync('supabase/functions/pal-chat/rules.txt')).digest('hex'));
