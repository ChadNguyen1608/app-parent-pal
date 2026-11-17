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

/** PA-02 sau khi thêm con (D-64): chỉ đồng ý cốt lõi, không chọn mục riêng nào. */
async function dongYToiThieu(page: Page) {
  await expect(page.getByRole('heading', { name: 'Đồng ý sử dụng' }).last()).toBeVisible();
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

test('đồng ý (PA-02, D-64): một đồng ý cốt lõi và hai mục riêng không chọn sẵn; PA-32 xem và rút từng mục riêng', async ({ page }) => {
  await dangNhap(page);
  await themCon(page);
  await page.getByRole('button', { name: 'Lưu' }).click();
  await expect(page.getByRole('heading', { name: 'Đồng ý sử dụng' }).last()).toBeVisible();
  // Không còn danh sách từng tính năng: chỉ hai hộp tích, không chọn sẵn.
  await expect(page.getByRole('checkbox')).toHaveCount(2);
  await expect(page.getByRole('checkbox', { name: 'Lưu thông tin sức khỏe của con' })).not.toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Cho con báo bố mẹ ngay' })).not.toBeChecked();
  await expect(page.getByText(/Lịch của con, đồng bộ sang máy con và nhắc giờ/)).toBeVisible();
  await shot(page, 'pa02-dong-y');
  await page.getByRole('checkbox', { name: 'Lưu thông tin sức khỏe của con' }).click();
  await page.getByRole('checkbox', { name: 'Cho con báo bố mẹ ngay' }).click();
  await page.getByRole('button', { name: 'Đồng ý và tiếp tục' }).click();

  await page.getByRole('tab', { name: /Gia đình$/ }).click();
  await page.getByRole('button', { name: 'Quyền riêng tư và đồng ý' }).click();
  await expect(page.getByRole('switch', { name: 'Thông tin sức khỏe của con' })).toBeChecked();
  await expect(page.getByRole('switch', { name: 'Con báo bố mẹ ngay' })).toBeChecked();
  await expect(page.getByRole('switch', { name: 'Phần cốt lõi' })).toBeDisabled();
  await shot(page, 'pa32-quyen-rieng-tu');

  // Tắt một mục riêng: hỏi trước, rồi rút; mục lõi và mục riêng kia không đổi.
  await page.getByRole('switch', { name: 'Con báo bố mẹ ngay' }).click();
  await expect(page.getByText(/dữ liệu cũ của mục này được ẩn ngay/)).toBeVisible();
  await page.getByRole('button', { name: 'Tắt', exact: true }).click();
  await expect(page.getByRole('switch', { name: 'Con báo bố mẹ ngay' })).not.toBeChecked();
  await expect(page.getByRole('switch', { name: 'Thông tin sức khỏe của con' })).toBeChecked();
  // Bật lại là đồng ý lại.
  await page.getByRole('switch', { name: 'Con báo bố mẹ ngay' }).click();
  await expect(page.getByRole('switch', { name: 'Con báo bố mẹ ngay' })).toBeChecked();
});

test('sức khỏe của con (D-66): hỏi đồng ý riêng ngay tại chỗ, thêm ghi chú có nguồn, sửa, tắt, xóa', async ({ page }) => {
  await dangNhap(page);
  await themCon(page);
  await page.getByRole('button', { name: 'Lưu' }).click();
  await dongYToiThieu(page); // không chọn MD-SUCKHOE ở PA-02
  await page.getByRole('tab', { name: /Gia đình$/ }).click();
  await page.getByRole('button', { name: 'Sức khỏe của Bin' }).click();
  await expect(page.getByRole('button', { name: 'Đồng ý lưu thông tin sức khỏe' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Thêm ghi chú' })).toHaveCount(0);
  await shot(page, 'pa06-suc-khoe-hoi-dong-y');
  await page.getByRole('button', { name: 'Đồng ý lưu thông tin sức khỏe' }).click();
  await expect(page.getByText('Chưa có ghi chú nào.')).toBeVisible();

  await page.getByRole('button', { name: 'Thêm ghi chú' }).click();
  await page.getByRole('radio', { name: 'Dị ứng' }).click();
  await page.getByRole('button', { name: 'Lưu' }).click(); // nội dung trống
  await expect(page.getByText(/Bạn nhập nội dung ghi chú nhé/)).toBeVisible();
  await page.getByRole('textbox', { name: 'Nội dung' }).fill('Dị ứng tôm');
  await page.getByRole('textbox', { name: 'Nguồn (không bắt buộc)' }).fill('theo giấy khám');
  await page.getByRole('button', { name: 'Lưu' }).click();
  await expect(page.getByText('Dị ứng tôm', { exact: true })).toBeVisible();
  await expect(page.getByText(/chị Lan \(người quản lý chính\) khai, \d{2}\/\d{2}\/\d{4}/)).toBeVisible();
  await expect(page.getByText('Nguồn: theo giấy khám')).toBeVisible();
  await shot(page, 'pa06-suc-khoe-danh-sach');

  await page.getByRole('button', { name: 'Sửa' }).click();
  await page.getByRole('textbox', { name: 'Nội dung' }).fill('Dị ứng tôm và cua');
  await page.getByRole('button', { name: 'Lưu' }).click();
  await expect(page.getByText('Dị ứng tôm và cua', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Tắt', exact: true }).click();
  await expect(page.getByText('Dị ứng · đang tắt')).toBeVisible();
  await page.getByRole('button', { name: 'Xóa', exact: true }).click();
  await expect(page.getByText(/Xóa ghi chú này\? Không khôi phục được/)).toBeVisible();
  await page.getByRole('button', { name: 'Xóa', exact: true }).last().click();
  await expect(page.getByText('Chưa có ghi chú nào.')).toBeVisible();

  // Rút đồng ý sức khỏe ở PA-32 thì lần sau vào lại phải hỏi đồng ý.
  await page.goBack();
  await page.getByRole('button', { name: 'Quyền riêng tư và đồng ý' }).click();
  await page.getByRole('switch', { name: 'Thông tin sức khỏe của con' }).click();
  await page.getByRole('button', { name: 'Tắt', exact: true }).click();
  await expect(page.getByRole('switch', { name: 'Thông tin sức khỏe của con' })).not.toBeChecked();
  await page.goBack();
  await page.getByRole('button', { name: 'Sức khỏe của Bin' }).click();
  await expect(page.getByRole('button', { name: 'Đồng ý lưu thông tin sức khỏe' })).toBeVisible();
});

test('báo của con (D-67): bố mẹ bật MD-CONBAO thì thấy danh sách báo và đánh dấu đã xem', async ({ page }) => {
  await dangNhap(page);
  await themCon(page);
  await page.getByRole('button', { name: 'Lưu' }).click();
  await expect(page.getByRole('heading', { name: 'Đồng ý sử dụng' }).last()).toBeVisible();
  await page.getByRole('checkbox', { name: 'Cho con báo bố mẹ ngay' }).click();
  await page.getByRole('button', { name: 'Đồng ý và tiếp tục' }).click();
  await page.getByRole('tab', { name: /Gia đình$/ }).click();
  // Mock tạo sẵn một báo mẫu khi bật MD-CONBAO (hai app giả lập không thấy nhau).
  await page.getByRole('button', { name: 'Thông báo của con (1 chưa xem)' }).click();
  await expect(page.getByText('Bin: Con thấy không khỏe')).toBeVisible();
  await expect(page.getByText(/Chưa xem/)).toBeVisible();
  await shot(page, 'pa15-thong-bao-con');
  await page.getByRole('button', { name: 'Đánh dấu đã xem' }).click();
  await expect(page.getByText(/· Đã xem/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Đánh dấu đã xem' })).toHaveCount(0);
});

test('chưa bật MD-CONBAO: tab Gia đình không có lối vào Thông báo của con', async ({ page }) => {
  await dangNhap(page);
  await themCon(page);
  await page.getByRole('button', { name: 'Lưu' }).click();
  await dongYToiThieu(page);
  await page.getByRole('tab', { name: /Gia đình$/ }).click();
  await expect(page.getByRole('button', { name: 'Sức khỏe của Bin' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Thông báo của con/ })).toHaveCount(0);
});

test('rút toàn bộ đồng ý cho một con: gõ XÓA, hai lần xác nhận theo máy chủ, hồ sơ bị ẩn', async ({ page }) => {
  await dangNhap(page);
  await themCon(page);
  await page.getByRole('button', { name: 'Lưu' }).click();
  await dongYToiThieu(page);
  await page.getByRole('tab', { name: /Gia đình$/ }).click();
  await page.getByRole('button', { name: 'Quyền riêng tư và đồng ý' }).click();
  await page.getByRole('button', { name: 'Rút toàn bộ đồng ý cho Bin' }).click();
  await expect(page.getByRole('heading', { name: 'Xóa tài khoản' }).last()).toBeVisible();
  await shot(page, 'pa35-xoa');

  // Chưa gõ XÓA thì chưa qua lần 1.
  await page.getByRole('button', { name: 'Xác nhận lần 1' }).click();
  await expect(page.getByText(/Bạn gõ XÓA/)).toBeVisible();
  await page.getByRole('textbox', { name: 'Gõ XÓA để xác nhận' }).fill('XÓA');
  await page.getByRole('button', { name: 'Xác nhận lần 1' }).click();
  await expect(page.getByRole('heading', { name: 'Xác nhận lần hai' })).toBeVisible();
  await expect(page.getByText(/Rút đồng ý: Phần cốt lõi/)).toBeVisible();
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

test('rút toàn bộ đồng ý cho cả gia đình: chọn sẵn "Xóa gia đình", hai bước, rồi đăng xuất', async ({ page }) => {
  await dangNhap(page);
  await themCon(page);
  await page.getByRole('button', { name: 'Lưu' }).click();
  await dongYToiThieu(page);
  await page.getByRole('tab', { name: /Gia đình$/ }).click();
  await page.getByRole('button', { name: 'Quyền riêng tư và đồng ý' }).click();
  await page.getByRole('button', { name: 'Rút toàn bộ đồng ý cho cả gia đình' }).click();
  await page.getByRole('textbox', { name: 'Gõ XÓA để xác nhận' }).fill('XÓA');
  await page.getByRole('button', { name: 'Xác nhận lần 1' }).click();
  await expect(page.getByRole('heading', { name: 'Xác nhận lần hai' })).toBeVisible();
  await expect(page.getByText('• Ngắt kết nối máy của con')).toBeVisible(); // nhánh gia đình (không phải nhánh một con tên Bin)
  await page.getByRole('button', { name: 'Xác nhận lần 2' }).click();
  await expect(page.getByRole('heading', { name: 'Đã nhận yêu cầu' })).toBeVisible();
  await expect(page.getByText(/đã xóa hết/i)).toHaveCount(0);
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
