// Pal chủ động hỏi lại sau vài ngày.
import assert from 'node:assert/strict';
import { bodyText, onboard, openPage, say, waitText } from '../harness.mjs';
export default async ({ browser, base, shots }) => {
  const { page, errors } = await openPage(browser, base + '/?fast');
  await onboard(page);
  await say(page, 'Na không chịu đi học, sáng nào cũng khóc');
  await page.click('[data-testid="proto-strip"]');
  await page.waitForSelector('[data-testid="proto-tools"]');
  await page.screenshot({ path: `${shots}/30-tools.png` });
  await page.click('[data-testid="skip-3"]');
  await waitText(page, 'Mấy hôm nay Na thế nào rồi?');
  await page.screenshot({ path: `${shots}/31-checkin.png` });
  await say(page, 'Đỡ hơn rồi');
  const text = await bodyText(page);
  assert.match(text, /Mừng quá! Mình đánh dấu chuyện này là đã ổn/);
  assert.match(text, /Đã ổn: Hỏi lại xem Na còn không muốn đi học không/);
  await page.screenshot({ path: `${shots}/32-resolved.png` });
  assert.deepEqual(errors, []);
  await page.close();
};
