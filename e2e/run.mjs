// Chạy toàn bộ kịch bản e2e trên bản web đã build (dist/).
import path from 'node:path';
import fs from 'node:fs';
import { serve, launch } from './harness.mjs';

const dist = path.resolve('dist');
const shots = path.resolve('e2e/screens');
fs.mkdirSync(shots, { recursive: true });
const only = process.argv[2];
const files = fs.readdirSync(path.resolve('e2e/scenarios')).filter((f) => f.endsWith('.mjs') && (!only || f.includes(only))).sort();

const server = await serve(dist);
const browser = await launch();
let failed = 0;
for (const f of files) {
  const mod = await import(path.resolve('e2e/scenarios', f));
  const t0 = Date.now();
  try {
    await mod.default({ browser, base: 'http://localhost:4173', shots });
    console.log(`PASS ${f} (${Date.now() - t0}ms)`);
  } catch (e) {
    failed++;
    console.log(`FAIL ${f}: ${e.stack || e}`);
  }
}
await browser.close();
server.close();
console.log(failed ? `${failed} scenario(s) failed` : `All ${files.length} scenario(s) passed`);
process.exit(failed ? 1 : 0);
