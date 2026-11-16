// Tên tab trên web có thêm ký tự giữ chỗ "⏷" (biểu tượng chưa đặt), nên so khớp phần cuối tên.
// Luồng phụ huynh (EXPO_PUBLIC_API_MOCK=1: OTP và mã ghép đều 123456).
import { expect, test, type Page } from '@playwright/test';

const shot = (page: Page, name: string) => expect(page).toHaveScreenshot(`${name}.png`);

async function dangNhap(page: Page) {
  await page.goto('/');
  await page.getByRole('textbox', { name: 'Email của bạn' }).fill('test.gia@example.com');
  await page.getByRole('button', { name: 'Gửi mã cho mình' }).click();
  await page.getByRole('textbox', { name: 'Mã 6 số' }).fill('123456');
  await page.getByRole('button', { name: 'Xác nhận' }).click();
}

async function themCon(page: Page) {
  await page.getByRole('textbox', { name: 'Cách gọi bạn' }).fill('chị Lan');
  await page.getByRole('button', { name: 'Tiếp tục' }).click();
  await page.getByRole('textbox', { name: 'Tên gọi của con' }).fill('Bin');
  await page.getByRole('textbox', { name: 'Lớp', exact: true }).fill('3');
  await page.getByRole('radio', { name: 'Có' }).click();
}

async function vaoGhepMay(page: Page) {
  await dangNhap(page);
  await themCon(page);
  await page.getByRole('button', { name: 'Lưu' }).click();
  await page.getByRole('tab', { name: /Gia đình$/ }).click();
  await page.getByRole('button', { name: 'Ghép máy của con' }).click();
  await expect(page.getByRole('textbox', { name: /Mã trên máy con/ })).toBeVisible();
}

test('đăng nhập, làm quen, thêm con, ghép máy lần đầu với PIN', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Chào bạn' })).toBeVisible();
  await shot(page, 'pa01-dang-nhap-email');

  await page.getByRole('textbox', { name: 'Email của bạn' }).fill('test.gia@example.com');
  await page.getByRole('button', { name: 'Gửi mã cho mình' }).click();
  await expect(page.getByRole('textbox', { name: 'Mã 6 số' })).toBeVisible();
  await shot(page, 'pa01-dang-nhap-ma');

  await page.getByRole('textbox', { name: 'Mã 6 số' }).fill('123456');
  await page.getByRole('button', { name: 'Xác nhận' }).click();
  await expect(page.getByRole('heading', { name: 'Mình gọi bạn là gì?' })).toBeVisible();

  await page.getByRole('textbox', { name: 'Cách gọi bạn' }).fill('chị Lan');
  await page.getByRole('button', { name: 'Tiếp tục' }).click();
  await expect(page.getByRole('heading', { name: 'Thêm con' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Tên gọi của con' }).fill('Bin');
  await page.getByRole('textbox', { name: 'Lớp', exact: true }).fill('3');
  await page.getByRole('radio', { name: 'Có' }).click();
  await shot(page, 'pa04-them-con');

  await page.getByRole('button', { name: 'Lưu' }).click();
  await page.getByRole('tab', { name: /Gia đình$/ }).click();
  await expect(page.getByText('Bin', { exact: true })).toBeVisible();
  await expect(page.getByText(/Chưa ghép máy/)).toBeVisible();
  await shot(page, 'pa03-gia-dinh');

  await page.getByRole('button', { name: 'Ghép máy của con' }).click();
  await page.getByRole('textbox', { name: /Mã trên máy con/ }).fill('123456');
  await page.getByRole('button', { name: 'Ghép máy' }).click();
  // PA-13: lần đầu máy chủ đòi PIN, mới hiện ô đặt PIN.
  await expect(page.getByRole('textbox', { name: /Đặt PIN/ })).toBeVisible();
  await shot(page, 'pa13-ghep-may-can-pin');

  // PIN dễ đoán bị từ chối.
  await page.getByRole('textbox', { name: /Đặt PIN/ }).fill('123456');
  await page.getByRole('textbox', { name: 'Nhập lại PIN' }).fill('123456');
  await page.getByRole('button', { name: 'Ghép máy' }).click();
  await expect(page.getByRole('textbox', { name: 'Nhập lại PIN' })).toBeVisible();
  await expect(page.getByText('Đã nhập mã đúng')).toHaveCount(0);

  await page.getByRole('textbox', { name: /Đặt PIN/ }).fill('482915');
  await page.getByRole('textbox', { name: 'Nhập lại PIN' }).fill('482915');
  await page.getByRole('button', { name: 'Ghép máy' }).click();
  await expect(page.getByRole('heading', { name: 'Đã nhập mã đúng' })).toBeVisible();
  await shot(page, 'pa13-da-nhap-ma-dung');
});

test('nhánh lỗi: email sai, mã đăng nhập sai', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('textbox', { name: 'Email của bạn' }).fill('khong-phai-email');
  await page.getByRole('button', { name: 'Gửi mã cho mình' }).click();
  await expect(page.getByText(/email/i).first()).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Mã 6 số' })).toHaveCount(0);

  await page.getByRole('textbox', { name: 'Email của bạn' }).fill('test.gia@example.com');
  await page.getByRole('button', { name: 'Gửi mã cho mình' }).click();
  await page.getByRole('textbox', { name: 'Mã 6 số' }).fill('000000');
  await page.getByRole('button', { name: 'Xác nhận' }).click();
  await expect(page.getByRole('alert')).toContainText('Mã không đúng hoặc đã hết hạn');
  await expect(page.getByRole('heading', { name: 'Chào bạn' })).toBeVisible();
});

test('nhánh lỗi: thiếu tên gọi, thiếu lớp hoặc tuổi, chưa chọn máy riêng', async ({ page }) => {
  await dangNhap(page);
  await page.getByRole('button', { name: 'Tiếp tục' }).click();
  await expect(page.getByRole('heading', { name: 'Mình gọi bạn là gì?' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Cách gọi bạn' }).fill('chị Lan');
  await page.getByRole('button', { name: 'Tiếp tục' }).click();
  await page.getByRole('button', { name: 'Lưu' }).click();
  await expect(page.getByRole('heading', { name: 'Thêm con' })).toBeVisible();
  await expect(page.getByText('Bạn chọn một đáp án nhé.')).toBeVisible();
});

test('nhánh lỗi: mã ghép sai báo một câu chung (sau khi đặt PIN lần đầu)', async ({ page }) => {
  await vaoGhepMay(page);
  await page.getByRole('textbox', { name: /Mã trên máy con/ }).fill('999999');
  await page.getByRole('button', { name: 'Ghép máy' }).click();
  // Lần đầu máy chủ kiểm PIN trước mã: hiện ô đặt PIN, chưa tính là sai mã.
  await expect(page.getByRole('textbox', { name: /Đặt PIN/ })).toBeVisible();
  await page.getByRole('textbox', { name: /Đặt PIN/ }).fill('482915');
  await page.getByRole('textbox', { name: 'Nhập lại PIN' }).fill('482915');
  await page.getByRole('button', { name: 'Ghép máy' }).click();
  await expect(page.getByText('Mã không đúng hoặc đã hết hạn.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Đã nhập mã đúng' })).toHaveCount(0);
});
