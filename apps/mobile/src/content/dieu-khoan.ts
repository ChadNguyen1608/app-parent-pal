// BẢN NHÁP, người soạn: AI, chờ luật sư duyệt (D-73, 19/11/2026).
// Không phải văn bản pháp lý đã duyệt. Câu chữ có thể đổi hoàn toàn sau khi luật sư xem.
// Hai thứ trong file này: (1) tuyên bố quyền riêng tư của PA-32 (nguyên văn theo D-73, câu chữ chờ duyệt),
// (2) bản nháp "Điều khoản sử dụng" hiển thị trong khung cuộn ở PA-32.

/** Tuyên bố quyền riêng tư của PA-32: áp chung cho mọi con (không chia theo con). Nguyên văn theo D-73. */
export const TUYEN_BO_QUYEN_RIENG_TU =
  'Trong quá trình sử dụng dịch vụ, chúng tôi ghi lại thông tin liên quan đến trẻ (tên, tuổi, sức khỏe…) để cung cấp và cải thiện dịch vụ cho bạn. Chúng tôi không bán và không chia sẻ thông tin này cho bên thứ ba vì mục đích riêng của họ. Chỉ các nhà cung cấp hạ tầng giúp vận hành app (lưu trữ dữ liệu, gửi email, trợ lý AI) được xử lý dữ liệu thay chúng tôi; tên của trẻ được ẩn trước khi gửi cho trợ lý AI. Sử dụng app đồng nghĩa với việc bạn đồng ý với điều khoản này.';

export const GHI_CHU_TUYEN_BO = 'Câu chữ chờ duyệt.';

export const DIEU_KHOAN_NHAN_DE = 'Điều khoản sử dụng (bản nháp, chờ luật sư duyệt)';

// Màn thỏa thuận lúc đăng ký (D-76). CÂU CHỮ TẠM, chờ chủ sản phẩm và luật sư duyệt.
export const THOA_THUAN_TIEU_DE = 'Thỏa thuận sử dụng';
export const THOA_THUAN_MO_DAU = 'Trước khi tạo gia đình, bạn đọc kỹ phần dưới và bấm "Đồng ý" nếu bạn đồng ý.';
export const THOA_THUAN_DOI_PHIEN_BAN = 'Điều khoản vừa được cập nhật. Bạn đọc bản mới và bấm "Đồng ý" để tiếp tục.';
export const THOA_THUAN_NUT_DONG_Y = 'Đồng ý';
export const THOA_THUAN_NUT_KHONG_DONG_Y = 'Không đồng ý, đăng xuất';
export const THOA_THUAN_GHI_CHU_KHONG_DONG_Y = 'Nếu bạn không đồng ý thì chưa dùng được app. Bạn có thể đăng xuất.';

export type DieuKhoan = { so: number; tieuDe: string; noiDung: string };

export const DIEU_KHOAN: readonly DieuKhoan[] = [
  {
    so: 1,
    tieuDe: 'Phạm vi dịch vụ',
    noiDung:
      'Parent-Pal giúp phụ huynh lập lịch sinh hoạt cho con, nhắc việc, đồng bộ lịch sang máy của con và trò chuyện với Pal để được đồng hành trong việc nuôi dạy con. Dịch vụ đang ở giai đoạn thử nghiệm: tính năng có thể thay đổi, tạm dừng hoặc ngừng mà không báo trước.',
  },
  {
    so: 2,
    tieuDe: 'Tài khoản',
    noiDung:
      'Bạn đăng nhập bằng địa chỉ email của mình. Bạn chịu trách nhiệm giữ an toàn cho email, mã đăng nhập và mã PIN của bố mẹ, và cho mọi việc làm bằng tài khoản của bạn. Mỗi gia đình có một người quản lý chính; người này quyết định ai khác được tham gia.',
  },
  {
    so: 3,
    tieuDe: 'Gói dịch vụ và dùng thử',
    noiDung:
      'Dịch vụ có các mức miễn phí, dùng thử và trả phí. Quyền lợi và giới hạn của từng mức (ví dụ số kế hoạch được tạo, số lần chỉnh sửa, ghép máy của con) được nêu trong app và có thể thay đổi. Trong giai đoạn thử nghiệm chưa có thanh toán thật.',
  },
  {
    so: 4,
    tieuDe: 'Trách nhiệm của người dùng',
    noiDung:
      'Bạn cung cấp thông tin đúng và chỉ nhập thông tin về con của mình hoặc trẻ mà bạn có quyền chăm sóc. Bạn không dùng app để làm hại người khác, không cố truy cập trái phép vào dữ liệu của gia đình khác và không gây ảnh hưởng đến hoạt động của hệ thống.',
  },
  {
    so: 5,
    tieuDe: 'Pal là người đồng hành, không thay thế chuyên gia',
    noiDung:
      'Pal là người bạn đồng hành giúp bạn sắp xếp và thực hiện việc nuôi dạy con. Pal không chẩn đoán, không kê thuốc, không thay thế khám bệnh và không phải dịch vụ tư vấn tâm lý. Khi con có dấu hiệu bất thường về sức khỏe hay tâm lý, hãy gặp bác sĩ hoặc chuyên gia. Trong tình huống khẩn cấp, gọi 115 (cấp cứu), 113 (công an) hoặc 111 (bảo vệ trẻ em).',
  },
  {
    so: 6,
    tieuDe: 'Nội dung do trợ lý AI tạo ra',
    noiDung:
      'Lời của Pal do trí tuệ nhân tạo tạo ra nên có thể chưa đầy đủ hoặc chưa chính xác. Hãy xem đó là gợi ý để bạn cân nhắc, không phải lời khuyên chuyên môn. Thông tin Pal tra thêm trên mạng, nếu có, được gắn nhãn chưa kiểm chứng.',
  },
  {
    so: 7,
    tieuDe: 'Dữ liệu và quyền riêng tư',
    noiDung:
      'Cách chúng tôi ghi lại và xử lý thông tin liên quan đến trẻ được nêu trong phần tuyên bố quyền riêng tư ở đầu màn hình này; phần đó áp dụng chung cho mọi con trong gia đình. Bạn xem và đổi các lựa chọn về dữ liệu (lưu thông tin sức khỏe, cho con báo bố mẹ ngay, trò chuyện AI trên máy con) trong mục Cài đặt dữ liệu.',
  },
  {
    so: 8,
    tieuDe: 'Quyền của bạn với dữ liệu',
    noiDung:
      'Bạn có thể tắt từng mục lưu dữ liệu, xóa dữ liệu của một con hoặc của cả gia đình trong Cài đặt dữ liệu. Khi bạn gửi yêu cầu xóa, dữ liệu được ẩn ngay; thời hạn xóa hẳn sẽ được ghi rõ sau khi chốt. Việc xuất dữ liệu chưa mở ở giai đoạn thử nghiệm.',
  },
  {
    so: 9,
    tieuDe: 'Giai đoạn thử nghiệm: dữ liệu có thể bị xóa toàn bộ',
    noiDung:
      'Mọi dữ liệu trong giai đoạn thử nghiệm là dữ liệu thử. Chúng tôi có thể xóa toàn bộ dữ liệu này trước khi phát hành chính thức, và sẽ cố báo trước khi làm. Vì vậy bạn không nên coi app là nơi lưu giữ duy nhất những thông tin quan trọng.',
  },
  {
    so: 10,
    tieuDe: 'Giới hạn trách nhiệm',
    noiDung:
      'Dịch vụ được cung cấp "như hiện có". Trong phạm vi pháp luật cho phép, chúng tôi không chịu trách nhiệm về thiệt hại phát sinh do bạn dựa vào gợi ý của app, do gián đoạn dịch vụ hoặc do mất dữ liệu trong giai đoạn thử nghiệm.',
  },
  {
    so: 11,
    tieuDe: 'Chấm dứt',
    noiDung:
      'Bạn có thể ngừng dùng app và xóa tài khoản bất cứ lúc nào trong Cài đặt dữ liệu. Chúng tôi có thể tạm khóa hoặc chấm dứt tài khoản vi phạm điều khoản này hoặc khi ngừng cung cấp dịch vụ.',
  },
  {
    so: 12,
    tieuDe: 'Thay đổi điều khoản',
    noiDung:
      'Điều khoản có thể được sửa, nhất là sau khi luật sư duyệt. Khi có thay đổi quan trọng, chúng tôi báo trong app. Bạn tiếp tục dùng app sau thay đổi nghĩa là bạn đồng ý với bản mới.',
  },
  {
    so: 13,
    tieuDe: 'Liên hệ',
    noiDung: 'Mọi thắc mắc về điều khoản và dữ liệu, bạn liên hệ nhóm Parent-Pal qua địa chỉ liên hệ ghi trong app. (Địa chỉ chính thức sẽ bổ sung khi chốt.)',
  },
];
