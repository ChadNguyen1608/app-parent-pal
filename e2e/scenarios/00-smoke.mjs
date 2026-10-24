import assert from 'node:assert/strict';
import { openPage, waitText } from '../harness.mjs';
export default async ({ browser, base, shots }) => {
  const { page, errors } = await openPage(browser, base + '/?fast');
  await waitText(page, 'mình là Pal');
  await page.screenshot({ path: `${shots}/00-smoke.png` });
  await page.close();
  assert.deepEqual(errors, []);
};
