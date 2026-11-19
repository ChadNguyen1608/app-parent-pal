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

/** D-73: sau khi thêm con là vào app ngay (không còn màn đồng ý PA-02). */
async function vaoAppNgay(page: Page) {
  await expect(page.getByRole('heading', { name: 'Đồng ý sử dụng' })).toHaveCount(0);
  await expect(page.getByRole('tab', { name: /Gia đình$/ })).toBeVisible();
}

async function vaoGhepMay(page: Page) {
  await dangNhap(page);
  await themCon(page);
  await page.getByRole('button', { name: 'Lưu' }).click();
  await vaoAppNgay(page);
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
  await vaoAppNgay(page);
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

test('đồng ý mặc định (D-73): thêm con là vào app ngay; Cài đặt dữ liệu tắt/bật từng mục; PA-32 tuyên bố và điều khoản', async ({ page }) => {
  await dangNhap(page);
  await themCon(page);
  await page.getByRole('button', { name: 'Lưu' }).click();
  // Không có màn đồng ý: thẳng vào khung chính.
  await vaoAppNgay(page);
  await page.getByRole('tab', { name: /Gia đình$/ }).click();
  await page.getByRole('button', { name: 'Cài đặt dữ liệu' }).click();
  await expect(page.getByRole('switch', { name: 'Lưu thông tin sức khỏe của con' })).toBeChecked();
  await expect(page.getByRole('switch', { name: 'Cho con báo bố mẹ ngay' })).toBeChecked();
  await expect(page.getByRole('switch', { name: 'Trò chuyện AI trên máy con' })).not.toBeChecked();
  await shot(page, 'cai-dat-du-lieu');

  // Tắt một mục: hỏi trước, rồi rút; mục kia không đổi. Bật lại là đồng ý lại.
  await page.getByRole('switch', { name: 'Cho con báo bố mẹ ngay' }).click();
  await expect(page.getByText(/dữ liệu cũ của mục này được ẩn ngay/)).toBeVisible();
  await page.getByRole('button', { name: 'Tắt', exact: true }).click();
  await expect(page.getByRole('switch', { name: 'Cho con báo bố mẹ ngay' })).not.toBeChecked();
  await expect(page.getByRole('switch', { name: 'Lưu thông tin sức khỏe của con' })).toBeChecked();
  await page.getByRole('switch', { name: 'Cho con báo bố mẹ ngay' }).click();
  await expect(page.getByRole('switch', { name: 'Cho con báo bố mẹ ngay' })).toBeChecked();
  await page.getByRole('switch', { name: 'Trò chuyện AI trên máy con' }).click();
  await expect(page.getByRole('switch', { name: 'Trò chuyện AI trên máy con' })).toBeChecked();

  // PA-32: tuyên bố nguyên văn, ghi chú chờ duyệt, nút Đồng ý, khung cuộn điều khoản nháp.
  await page.goBack();
  await page.getByRole('button', { name: 'Quyền riêng tư và điều khoản' }).click();
  await expect(page.getByText(/Trong quá trình sử dụng dịch vụ, chúng tôi ghi lại thông tin liên quan đến trẻ/)).toBeVisible();
  await expect(page.getByText('Câu chữ chờ duyệt.')).toBeVisible();
  await expect(page.getByText('BẢN NHÁP, người soạn: AI, chờ luật sư duyệt')).toBeVisible();
  await expect(page.getByRole('switch')).toHaveCount(0);
  await shot(page, 'pa32-quyen-rieng-tu');
  await page.getByRole('button', { name: 'Đồng ý', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Cài đặt dữ liệu' })).toBeVisible();
});

test('sức khỏe của con (D-66, D-73): vào là thấy danh sách, thêm ghi chú có nguồn, sửa, tắt, xóa; tắt lưu ở Cài đặt dữ liệu thì chỉ đường tới đó', async ({ page }) => {
  await dangNhap(page);
  await themCon(page);
  await page.getByRole('button', { name: 'Lưu' }).click();
  await vaoAppNgay(page); // MD-SUCKHOE đã ghi mặc định, không hỏi đồng ý
  await page.getByRole('tab', { name: /Gia đình$/ }).click();
  await page.getByRole('button', { name: 'Sức khỏe của Bin' }).click();
  await expect(page.getByRole('button', { name: 'Đồng ý lưu thông tin sức khỏe' })).toHaveCount(0);
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

  // Tắt lưu sức khỏe ở Cài đặt dữ liệu thì vào lại màn này chỉ thấy đường tới Cài đặt (không có nút đồng ý).
  await page.goBack();
  await page.getByRole('button', { name: 'Cài đặt dữ liệu' }).click();
  await page.getByRole('switch', { name: 'Lưu thông tin sức khỏe của con' }).click();
  await page.getByRole('button', { name: 'Tắt', exact: true }).click();
  await expect(page.getByRole('switch', { name: 'Lưu thông tin sức khỏe của con' })).not.toBeChecked();
  await page.goBack();
  await page.getByRole('button', { name: 'Sức khỏe của Bin' }).click();
  await expect(page.getByRole('button', { name: 'Mở cài đặt dữ liệu' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Thêm ghi chú' })).toHaveCount(0);
});

test('báo của con (D-67, D-73): MD-CONBAO bật mặc định nên thấy danh sách báo và đánh dấu đã xem', async ({ page }) => {
  await dangNhap(page);
  await themCon(page);
  await page.getByRole('button', { name: 'Lưu' }).click();
  await vaoAppNgay(page);
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

test('tắt MD-CONBAO ở Cài đặt dữ liệu: tab Gia đình không còn lối vào Thông báo của con', async ({ page }) => {
  await dangNhap(page);
  await themCon(page);
  await page.getByRole('button', { name: 'Lưu' }).click();
  await vaoAppNgay(page);
  await page.getByRole('tab', { name: /Gia đình$/ }).click();
  await expect(page.getByRole('button', { name: /Thông báo của con/ })).toBeVisible();
  await page.getByRole('button', { name: 'Cài đặt dữ liệu' }).click();
  await page.getByRole('switch', { name: 'Cho con báo bố mẹ ngay' }).click();
  await page.getByRole('button', { name: 'Tắt', exact: true }).click();
  await expect(page.getByRole('switch', { name: 'Cho con báo bố mẹ ngay' })).not.toBeChecked();
  await page.goBack();
  await expect(page.getByRole('button', { name: 'Sức khỏe của Bin' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Thông báo của con/ })).toHaveCount(0);
});

test('xóa dữ liệu một con (từ Cài đặt dữ liệu): gõ XÓA, hai lần xác nhận theo máy chủ, hồ sơ bị ẩn', async ({ page }) => {
  await dangNhap(page);
  await themCon(page);
  await page.getByRole('button', { name: 'Lưu' }).click();
  await vaoAppNgay(page);
  await page.getByRole('tab', { name: /Gia đình$/ }).click();
  await page.getByRole('button', { name: 'Cài đặt dữ liệu' }).click();
  await page.getByRole('button', { name: 'Xóa dữ liệu của Bin' }).click();
  await expect(page.getByRole('heading', { name: 'Xóa tài khoản' }).last()).toBeVisible();
  await shot(page, 'pa35-xoa');

  // Chưa gõ XÓA thì chưa qua lần 1.
  await page.getByRole('button', { name: 'Xác nhận lần 1' }).click();
  await expect(page.getByText(/Bạn gõ XÓA/)).toBeVisible();
  await page.getByRole('textbox', { name: 'Gõ XÓA để xác nhận' }).fill('XÓA');
  await page.getByRole('button', { name: 'Xác nhận lần 1' }).click();
  await expect(page.getByRole('heading', { name: 'Xác nhận lần hai' })).toBeVisible();
  await expect(page.getByText(/Rút đồng ý: .*Phần cốt lõi/)).toBeVisible();
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

test('xóa dữ liệu cả gia đình (từ Cài đặt dữ liệu): chọn sẵn "Xóa gia đình", hai bước, rồi đăng xuất', async ({ page }) => {
  await dangNhap(page);
  await themCon(page);
  await page.getByRole('button', { name: 'Lưu' }).click();
  await vaoAppNgay(page);
  await page.getByRole('tab', { name: /Gia đình$/ }).click();
  await page.getByRole('button', { name: 'Cài đặt dữ liệu' }).click();
  await page.getByRole('button', { name: 'Xóa dữ liệu của cả gia đình' }).click();
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
  await vaoAppNgay(page);
  await page.getByRole('tab', { name: /Gia đình$/ }).click();
  await page.getByRole('button', { name: 'Dữ liệu của gia đình' }).click();
  await page.getByRole('button', { name: 'Yêu cầu xuất dữ liệu' }).click();
  await page.getByRole('button', { name: 'Gửi yêu cầu xuất' }).click();
  await expect(page.getByRole('alert')).toContainText('Xuất dữ liệu chưa mở ở bản thử.');
});
