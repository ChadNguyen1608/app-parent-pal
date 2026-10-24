// Làm quen bằng trò chuyện, không có form.
import assert from 'node:assert/strict';
import { bodyText, onboard, openPage } from '../harness.mjs';
export default async ({ browser, base, shots }) => {
  const { page, errors } = await openPage(browser, base + '/?fast');
  await onboard(page, 'chị Lan', 'bé Na 8 tuổi và bé Bin 5 tuổi');
  const text = await bodyText(page);
  assert.match(text, /Rất vui được làm quen với chị Lan/);
  assert.match(text, /Na \(8 tuổi\) và Bin \(5 tuổi\)/);
  assert.ok(await page.$('[data-testid="quick-replies"]'), 'có gợi ý trả lời nhanh');
  await page.screenshot({ path: `${shots}/10-onboarding.png` });
  assert.deepEqual(errors, []);
  await page.close();
};
