// Máy tính: sổ tay cạnh cuộc trò chuyện. Chế độ tối. Mở ở đường dẫn con.
import assert from 'node:assert/strict';
import { onboard, openPage, say, waitText } from '../harness.mjs';
export default async ({ browser, base, shots }) => {
  const desk = await openPage(browser, base + '/?fast', { width: 1280, height: 820, deviceScaleFactor: 1 });
  await onboard(desk.page, 'anh Minh', 'Na 8 tuổi, Bin 5 tuổi');
  await say(desk.page, 'Bin bị sốt từ tối qua');
  assert.ok(await desk.page.$('[data-testid="notebook-panel"]'), 'có cột sổ tay');
  await waitText(desk.page, 'Bin bị ốm'); // cột sổ tay tự mở sổ của bé đầu tiên, bấm sang Bin
  await desk.page.click('[data-testid="tab-Bin"]');
  await waitText(desk.page, 'Pal sẽ hỏi lại sau 2 ngày nữa');
  await desk.page.screenshot({ path: `${shots}/50-desktop.png` });
  assert.deepEqual(desk.errors, []);
  await desk.page.close();

  const dark = await openPage(browser, base + '/?fast');
  await dark.page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
  await dark.page.reload({ waitUntil: 'networkidle0' });
  await onboard(dark.page);
  await say(dark.page, 'Na hay cáu sau giờ học');
  await dark.page.screenshot({ path: `${shots}/51-dark.png` });
  assert.deepEqual(dark.errors, []);
  await dark.page.close();

  const deep = await openPage(browser, base + '/some/nested/path?fast');
  await waitText(deep.page, 'mình là Pal');
  assert.deepEqual(deep.errors, []);
  await deep.page.close();
};
