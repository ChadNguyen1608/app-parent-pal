// Luồng máy con (EXPO_PUBLIC_API_MOCK=1): lấy mã, ~8 giây sau mock báo "bố mẹ đã nhập mã", đồng ý, vào app.
// PIN hủy kết nối mặc định của mock: 482915.
import { expect, test, type Page } from '@playwright/test';

const shot = (page: Page, name: string) => expect(page).toHaveScreenshot(`${name}.png`);
const PIN_FIELD = /PIN \(6 số\)/;

/** Chào -> mã -> Đồng ý -> Tiếp tục -> Con hiểu rồi, dừng ở tab Hôm nay. */
async function ghepXong(page: Page, plan: 'PREMIUM' | 'TRIAL' | 'FREE' = 'PREMIUM') {
  // D-72, D-74: máy con chỉ hoạt động khi hộ đang dùng thử hoặc Premium (có khóa ghép máy); FREE thì tạm dừng. Các luồng thường chọn PREMIUM.
  await page.goto(`/?plan=${plan}`);
  await page.getByRole('button', { name: 'Lấy mã' }).click();
  await expect(page.getByRole('heading', { name: 'Mã của con' })).toBeVisible();
  await page.getByRole('button', { name: 'Đồng ý' }).click({ timeout: 20_000 });
  await page.getByRole('button', { name: 'Tiếp tục' }).click();
  await page.getByRole('button', { name: 'Con hiểu rồi' }).click();
  if (plan !== 'FREE') await expect(page.getByRole('heading', { name: 'Hôm nay' })).toBeVisible();
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
  await expect(page.getByText(/Khi con bấm "Báo bố mẹ ngay"/)).toBeVisible(); // MD-CONBAO hiệu lực trong mock máy con
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
  // CA-17: máy từng ghép nay không còn liên kết.
  await expect(page.getByRole('heading', { name: 'Chào con' })).toBeVisible();
  await expect(page.getByText('Máy này không còn kết nối với gia đình.')).toBeVisible();
  await shot(page, 'ca17-mat-ket-noi');
  await page.getByRole('button', { name: 'Lấy mã mới' }).click();
  await expect(page.getByRole('heading', { name: 'Mã của con' })).toBeVisible();
});

test('CA-21 Báo bố mẹ ngay (D-67): ba câu hỏi có sẵn, không ô gõ chữ, "Đồng ý" mới gửi, giới hạn tần suất', async ({ page }) => {
  await ghepXong(page);
  await page.getByRole('button', { name: 'Báo bố mẹ ngay' }).click();
  await expect(page.getByRole('heading', { name: 'Báo bố mẹ ngay' }).last()).toBeVisible();
  await expect(page.getByRole('textbox')).toHaveCount(0);
  for (const q of ['Con thấy không khỏe?', 'Nhờ bố mẹ đón sớm?', 'Con cần bố mẹ gọi?']) await expect(page.getByRole('button', { name: q })).toBeVisible();
  await shot(page, 'ca21-bao-bo-me');

  // Chọn câu chưa gửi: phải qua màn xác nhận.
  await page.getByRole('button', { name: 'Nhờ bố mẹ đón sớm?' }).click();
  await expect(page.getByRole('heading', { name: 'Nhờ bố mẹ đón sớm?' })).toBeVisible();
  await expect(page.getByText('Đã gửi. Bố mẹ sẽ trả lời con.')).toHaveCount(0);
  await shot(page, 'ca21-xac-nhan');
  await page.getByRole('button', { name: 'Không' }).click();
  await expect(page.getByRole('button', { name: 'Con cần bố mẹ gọi?' })).toBeVisible();

  await page.getByRole('button', { name: 'Con thấy không khỏe?' }).click();
  await page.getByRole('button', { name: 'Đồng ý' }).click();
  await expect(page.getByText('Đã gửi. Bố mẹ sẽ trả lời con.')).toBeVisible();
  await expect(page.getByText('Lịch hôm nay không tự đổi. Bố mẹ sẽ quyết định.')).toBeVisible();
  await shot(page, 'ca21-da-gui');

  // Gửi tiếp tới khi chạm giới hạn 6 lần mỗi giờ: lần thứ 7 bị từ chối bằng lời tiếng Việt.
  for (let i = 2; i <= 6; i++) {
    await page.getByRole('button', { name: 'Xong' }).click();
    await page.getByRole('button', { name: 'Báo bố mẹ ngay' }).click();
    await page.getByRole('button', { name: 'Con cần bố mẹ gọi?' }).click();
    await page.getByRole('button', { name: 'Đồng ý' }).click();
    await expect(page.getByText('Đã gửi. Bố mẹ sẽ trả lời con.')).toBeVisible();
  }
  await page.getByRole('button', { name: 'Xong' }).click();
  await page.getByRole('button', { name: 'Báo bố mẹ ngay' }).click();
  await page.getByRole('button', { name: 'Con cần bố mẹ gọi?' }).click();
  await page.getByRole('button', { name: 'Đồng ý' }).click();
  await expect(page.getByRole('alert')).toContainText('Đã báo nhiều lần, hãy chờ một lúc.');
  await expect(page.getByText('Đã gửi. Bố mẹ sẽ trả lời con.')).toHaveCount(0);
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

test('D-75: máy con không có nút "Con cần giúp đỡ" (chưa ghép và đã ghép)', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Con cần giúp đỡ' })).toHaveCount(0);
  await expect(page.getByText('Con cần giúp đỡ')).toHaveCount(0);
});

test('hộ không còn gói (FREE): máy con ở màn Tạm dừng, không thấy lịch, không có nút Con cần giúp đỡ (D-72, D-74, D-75)', async ({ page }) => {
  await ghepXong(page, 'FREE');
  await expect(page.getByRole('heading', { name: 'Tạm dừng' }).last()).toBeVisible();
  await expect(page.getByText(/Tạm dừng, chờ bố mẹ cập nhật/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Hôm nay' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Con cần giúp đỡ' })).toHaveCount(0);
});

test('hộ đang dùng thử (mock mặc định TRIAL, 1 khóa): máy con hoạt động bình thường, thấy lịch (D-74)', async ({ page }) => {
  await ghepXong(page, 'TRIAL');
  await expect(page.getByRole('heading', { name: 'Hôm nay' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Tạm dừng' })).toHaveCount(0);
});
