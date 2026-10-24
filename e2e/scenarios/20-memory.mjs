// Kể chuyện -> Pal ghi nhớ -> thấy trong sổ tay -> sửa, đổi phạm vi, xóa.
import assert from 'node:assert/strict';
import { bodyText, clickText, onboard, openPage, say, waitText } from '../harness.mjs';
export default async ({ browser, base, shots }) => {
  const { page, errors } = await openPage(browser, base + '/?fast');
  await onboard(page);
  await say(page, 'Hôm nay Na đi học về cứ cáu, hỏi gì cũng không nói');
  let text = await bodyText(page);
  assert.match(text, /Dòng thời gian: Na hay cáu kỉnh sau giờ học/);
  assert.match(text, /Sẽ hỏi lại: Hỏi lại xem Na còn cáu kỉnh không/);
  await page.screenshot({ path: `${shots}/20-memory-chat.png` });

  await say(page, 'Na rất thích vẽ, còn dị ứng tôm');
  await say(page, 'Dạo này mình mệt mỏi quá');
  assert.ok(await page.$('[data-testid="fresh-dot"]'), 'nút sổ tay báo có dòng mới');

  await page.click('[data-testid="toggle-notebook"]');
  await waitText(page, 'Sổ tay về con');
  text = await bodyText(page);
  for (const s of ['Đang theo dõi', 'Hồ sơ', 'Na thích vẽ', 'Na dị ứng tôm', 'Dòng thời gian', 'Pal sẽ hỏi lại sau 5 ngày nữa']) assert.ok(text.includes(s), `sổ tay có "${s}"`);
  assert.ok(!text.includes('mệt và áp lực'), 'cảm xúc riêng không nằm ở tab của bé');
  await page.screenshot({ path: `${shots}/21-notebook.png` });

  await page.click('[data-testid="tab-private"]');
  await waitText(page, 'đang thấy mệt và áp lực');
  await page.screenshot({ path: `${shots}/22-notebook-private.png` });

  // Sửa một dòng hồ sơ.
  await page.click('[data-testid="tab-Na"]');
  await clickText(page, 'Na thích vẽ. Chạm để sửa');
  await page.waitForSelector('[data-testid="memory-editor"]');
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: `${shots}/23-editor.png` });
  await page.click('[data-testid="memory-editor-input"]', { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.type('[data-testid="memory-editor-input"]', 'Na thích vẽ mèo');
  await page.click('[data-testid="save-memory"]');
  await waitText(page, 'Na thích vẽ mèo');

  // Chuyển sang riêng tư rồi xóa.
  await clickText(page, 'Na dị ứng tôm. Chạm để sửa');
  await page.click('[data-testid="scope-toggle"]');
  await waitText(page, 'Người lớn khác trong nhà không xem được dòng này.');
  await page.click('[data-testid="delete-memory"]');
  await waitText(page, 'Bấm lần nữa để xóa');
  await page.click('[data-testid="delete-memory"]');
  await page.waitForFunction(() => !document.querySelector('[data-testid="memory-editor"]'));
  text = await bodyText(page);
  assert.ok(!text.includes('dị ứng tôm'), 'đã xóa');

  // Tải lại trang: mọi thứ còn nguyên.
  await page.reload({ waitUntil: 'networkidle0' });
  await waitText(page, 'Na hay cáu kỉnh sau giờ học');
  assert.deepEqual(errors, []);
  await page.close();
};
