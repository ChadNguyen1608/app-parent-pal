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

/** PA-02 sau khi thêm con: chỉ mục lõi (lịch), không chọn mục tùy chọn nào. */
async function dongYToiThieu(page: Page) {
  await expect(page.getByRole('heading', { name: 'Đồng ý theo từng tính năng' }).last()).toBeVisible();
  await page.getByRole('button', { name: 'Đồng ý và tiếp tục' }).click();
}

async function vaoGhepMay(page: Page) {
  await dangNhap(page);
  await themCon(page);
  await page.getByRole('button', { name: 'Lưu' }).click();
  await dongYToiThieu(page);
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
  await dongYToiThieu(page);
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

test('đồng ý theo tính năng (PA-02), bật tắt ở PA-32, mục thứ 8 chưa bật được', async ({ page }) => {
  await dangNhap(page);
  await themCon(page);
  await page.getByRole('button', { name: 'Lưu' }).click();
  await expect(page.getByRole('heading', { name: 'Đồng ý theo từng tính năng' }).last()).toBeVisible();
  // Mục tùy chọn không chọn sẵn; mục con khóa tới khi chọn mục cha; mục thứ 8 chờ duyệt.
  await expect(page.getByRole('checkbox', { name: 'Hỏi thăm sau giờ học' })).not.toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Đánh dấu "Xong" trên máy con' })).toBeDisabled();
  await expect(page.getByRole('checkbox', { name: 'Con báo không khỏe (tùy chọn)' })).toBeDisabled();
  await expect(page.getByText('Đang chờ duyệt')).toBeVisible();
  await shot(page, 'pa02-dong-y');
  await page.getByRole('checkbox', { name: 'Nhắc giờ trên máy con' }).click();
  await page.getByRole('checkbox', { name: 'Đánh dấu "Xong" trên máy con' }).click();
  await page.getByRole('button', { name: 'Đồng ý và tiếp tục' }).click();

  await page.getByRole('tab', { name: /Gia đình$/ }).click();
  await page.getByRole('button', { name: 'Quyền riêng tư và đồng ý' }).click();
  await expect(page.getByRole('switch', { name: 'Đánh dấu "Xong"' })).toBeChecked();
  await expect(page.getByRole('switch', { name: 'Hỏi thăm sau giờ học' })).not.toBeChecked();
  await expect(page.getByRole('switch', { name: 'Con báo không khỏe (tùy chọn)' })).toBeDisabled();
  await shot(page, 'pa32-quyen-rieng-tu');

  // Tắt mục cha: hỏi trước vì kéo theo mục con.
  await page.getByRole('switch', { name: 'Nhắc giờ trên máy con' }).click();
  await expect(page.getByText(/cũng tắt: Đánh dấu "Xong"/)).toBeVisible();
  await page.getByRole('button', { name: 'Tắt', exact: true }).click();
  await expect(page.getByRole('switch', { name: 'Nhắc giờ trên máy con' })).not.toBeChecked();
  await expect(page.getByRole('switch', { name: 'Đánh dấu "Xong"' })).not.toBeChecked();
});

test('rút toàn bộ đồng ý: gõ XÓA, hai lần xác nhận theo máy chủ, hồ sơ bị ẩn', async ({ page }) => {
  await dangNhap(page);
  await themCon(page);
  await page.getByRole('button', { name: 'Lưu' }).click();
  await dongYToiThieu(page);
  await page.getByRole('tab', { name: /Gia đình$/ }).click();
  await page.getByRole('button', { name: 'Quyền riêng tư và đồng ý' }).click();
  await page.getByRole('button', { name: 'Rút toàn bộ đồng ý' }).click();
  await expect(page.getByRole('heading', { name: 'Xóa tài khoản' }).last()).toBeVisible();
  await shot(page, 'pa35-xoa');

  // Chưa gõ XÓA thì chưa qua lần 1.
  await page.getByRole('button', { name: 'Xác nhận lần 1' }).click();
  await expect(page.getByText(/Bạn gõ XÓA/)).toBeVisible();
  await page.getByRole('textbox', { name: 'Gõ XÓA để xác nhận' }).fill('XÓA');
  await page.getByRole('button', { name: 'Xác nhận lần 1' }).click();
  await expect(page.getByRole('heading', { name: 'Xác nhận lần hai' })).toBeVisible();
  await expect(page.getByText(/Rút đồng ý: Lịch và thời khóa biểu/)).toBeVisible();
  await expect(page.getByText(/chưa bị xóa hẳn ngay/)).toBeVisible();
  await shot(page, 'pa36-xac-nhan-lan-hai');

  await page.getByRole('button', { name: 'Xác nhận lần 2' }).click();
  await expect(page.getByRole('heading', { name: 'Đã nhận yêu cầu' })).toBeVisible();
  await expect(page.getByText(/đã xóa hết/i)).toHaveCount(0);
  await page.getByRole('button', { name: 'Xong' }).click();

  // Hồ sơ đã ẩn: không còn con nào, app báo đã nhận yêu cầu xóa.
  await expect(page.getByText(/Đã nhận yêu cầu xóa hồ sơ của con/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Thêm con' })).toBeVisible();
});

test('xuất dữ liệu: máy chủ báo chưa mở ở bản thử', async ({ page }) => {
  await dangNhap(page);
  await themCon(page);
  await page.getByRole('button', { name: 'Lưu' }).click();
  await dongYToiThieu(page);
  await page.getByRole('tab', { name: /Gia đình$/ }).click();
  await page.getByRole('button', { name: 'Dữ liệu của gia đình' }).click();
  await page.getByRole('button', { name: 'Yêu cầu xuất dữ liệu' }).click();
  await page.getByRole('button', { name: 'Gửi yêu cầu xuất' }).click();
  await expect(page.getByRole('alert')).toContainText('Xuất dữ liệu chưa mở ở bản thử.');
});
