// Tình huống nguy hiểm: thẻ liên hệ người thật, không trả lời như thường.
import assert from 'node:assert/strict';
import { onboard, openPage, say } from '../harness.mjs';
export default async ({ browser, base, shots }) => {
  const { page, errors } = await openPage(browser, base + '/?fast');
  await onboard(page);
  await say(page, 'Na nói con muốn chết');
  const card = await page.$eval('[data-testid="safety-card"]', (e) => e.innerText);
  assert.match(card, /Gọi 115/);
  assert.match(card, /Gọi 111/);
  await page.screenshot({ path: `${shots}/40-safety.png` });
  await say(page, 'Tôi định đánh cho nó nhớ');
  const last = await page.$$eval('[data-testid="bubble-pal"]', (els) => els.slice(-2).map((e) => e.innerText).join(' '));
  assert.match(last, /đòn roi thường làm con sợ/);
  await page.screenshot({ path: `${shots}/41-pushback.png` });
  assert.deepEqual(errors, []);
  await page.close();
};
