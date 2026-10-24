// File HTML tự chứa (để đăng làm trang xem thử) chạy được, kể cả khi nằm trong khung nhúng.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { onboard, openPage, say, waitText } from '../harness.mjs';
export default async ({ browser, base, shots }) => {
  const src = 'artifact/parent-pal.html';
  if (!fs.existsSync(src)) throw new Error('Chưa build artifact: chạy node scripts/build-artifact.mjs');
  fs.writeFileSync('dist/__artifact.html', '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>' + fs.readFileSync(src, 'utf8') + '</body></html>');
  fs.writeFileSync('dist/__frame.html', '<!doctype html><html><body style="margin:0"><iframe src="/__artifact.html" style="border:0;width:100vw;height:100vh"></iframe></body></html>');

  const { page, errors } = await openPage(browser, base + '/__artifact.html');
  const fontRequests = [];
  page.on('request', (r) => r.url().includes('/assets/') && fontRequests.push(r.url()));
  await onboard(page);
  await say(page, 'Na không chịu đi học');
  await waitText(page, 'Na không muốn đi học');
  const family = await page.$eval('[data-testid="bubble-pal"] div', (e) => getComputedStyle(e).fontFamily);
  assert.match(family, /BeVietnamPro/);
  assert.deepEqual(fontRequests, [], 'không tải font từ ngoài');
  await page.screenshot({ path: `${shots}/60-artifact.png` });
  assert.deepEqual(errors, []);
  await page.close();

  const framed = await openPage(browser, base + '/__frame.html');
  const frame = await (await framed.page.waitForSelector('iframe')).contentFrame();
  await frame.waitForFunction(() => document.body.innerText.includes('mình là Pal'), { timeout: 8000 });
  assert.equal(await frame.$('[data-testid="mic"]'), null, 'ẩn micro trong khung nhúng');
  assert.deepEqual(framed.errors, []);
  await framed.page.close();
};
