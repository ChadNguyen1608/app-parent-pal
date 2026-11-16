// Luồng máy con (EXPO_PUBLIC_API_MOCK=1): lấy mã, ~8 giây sau mock báo "bố mẹ đã nhập mã", đồng ý, vào app.
// PIN hủy kết nối mặc định của mock: 482915.
import { expect, test, type Page } from '@playwright/test';

const shot = (page: Page, name: string) => expect(page).toHaveScreenshot(`${name}.png`);
const PIN_FIELD = /PIN \(6 số\)/;

/** Chào -> mã -> Đồng ý -> Tiếp tục -> Con hiểu rồi, dừng ở tab Hôm nay. */
async function ghepXong(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Lấy mã' }).click();
  await expect(page.getByRole('heading', { name: 'Mã của con' })).toBeVisible();
  await page.getByRole('button', { name: 'Đồng ý' }).click({ timeout: 20_000 });
  await page.getByRole('button', { name: 'Tiếp tục' }).click();
  await page.getByRole('button', { name: 'Con hiểu rồi' }).click();
  await expect(page.getByRole('heading', { name: 'Hôm nay' })).toBeVisible();
}

async function vaoNhapPin(page: Page) {
  await page.getByRole('tab', { name: /Của con$/ }).click();
  await page.getByRole('button', { name: 'Cài đặt' }).click();
  await page.getByRole('button', { name: 'Hủy kết nối' }).click();
  await expect(page.getByRole('heading', { name: 'Cần bố mẹ nhập PIN' }).last()).toBeVisible();
}

async function nhapPin(page: Page, pin: string) {
  await page.getByRole('textbox', { name: PIN_FIELD }).fill(pin);
  await page.getByRole('button', { name: 'Hủy kết nối' }).click();
}

test('ghép máy, xem lời chào, vào các tab, hủy kết nối bằng PIN đúng', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Chào con' })).toBeVisible();
  await shot(page, 'ca01-chao');

  await page.getByRole('button', { name: 'Lấy mã' }).click();
  await expect(page.getByRole('heading', { name: 'Mã của con' })).toBeVisible();
  await expect(page.getByLabel('Mã ghép 1 2 3 4 5 6')).toBeVisible();
  await shot(page, 'ca02-ma-ghep');

  // Mock đẩy yêu cầu ở lần hỏi thứ hai (~8 giây).
  await expect(page.getByRole('button', { name: 'Đồng ý' })).toBeVisible({ timeout: 20_000 });
  await shot(page, 'ca02-hoi-ket-noi');
  await page.getByRole('button', { name: 'Đồng ý' }).click();

  await expect(page.getByRole('heading', { name: 'Đã kết nối' })).toBeVisible();
  await page.getByRole('button', { name: 'Tiếp tục' }).click();
  await expect(page.getByRole('heading', { name: 'Những gì bố mẹ thấy' })).toBeVisible();
  await shot(page, 'ca16-bo-me-thay');

  // CA-16: "Con hiểu rồi" phải đưa sang tab Hôm nay (lỗi PR #38).
  await page.getByRole('button', { name: 'Con hiểu rồi' }).click();
  await expect(page.getByRole('heading', { name: 'Hôm nay' })).toBeVisible();
  await shot(page, 'ca04-hom-nay');

  await page.getByRole('tab', { name: /Của con$/ }).click();
  await expect(page.getByRole('heading', { name: 'Của con' })).toBeVisible();
  await page.getByRole('button', { name: 'Cài đặt' }).click();
  await page.getByRole('button', { name: 'Hủy kết nối' }).click();
  await expect(page.getByRole('heading', { name: 'Cần bố mẹ nhập PIN' }).last()).toBeVisible();

  await nhapPin(page, '111222');
  await expect(page.getByRole('alert')).toContainText('còn 4 lần');
  await shot(page, 'ca12-nhap-pin-sai');

  await nhapPin(page, '482915');
  await expect(page.getByRole('heading', { name: 'Chào con' })).toBeVisible();
});

test('nhánh "Không": con từ chối thì lấy mã mới, chưa kết nối', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Lấy mã' }).click();
  await page.getByRole('button', { name: 'Không' }).click({ timeout: 20_000 });
  await expect(page.getByText('Con đã chọn không kết nối')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Mã của con' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Đã kết nối' })).toHaveCount(0);
});

test('PIN sai 5 lần thì khóa, nhập đúng cũng chưa được', async ({ page }) => {
  await ghepXong(page);
  await vaoNhapPin(page);
  for (let i = 0; i < 5; i += 1) {
    await nhapPin(page, '111222');
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByRole('textbox', { name: PIN_FIELD })).toHaveValue('');
  }
  await expect(page.getByRole('alert')).toContainText(/khóa/i);
  await nhapPin(page, '482915');
  await expect(page.getByRole('heading', { name: 'Cần bố mẹ nhập PIN' }).last()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Chào con' })).toHaveCount(0);
});

test('nút "Con cần giúp đỡ" mở màn lời tĩnh và số 111, dùng được cả khi chưa ghép', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Con cần giúp đỡ' }).click();
  await expect(page.getByText(/nói với một người lớn con tin/)).toBeVisible();
  await expect(page.getByText('Gọi 111', { exact: true })).toBeVisible();
  await shot(page, 'ca14-con-can-giup-do');
});
