// Bảng quy tắc máy đọc được, trích từ documents/pal/spec-quy-tac-lap-lich.md (03/11/2026)
// và Feature_3_2_L4_P6_Balanced_Planning_Owner_Decision_Log_APPROVED.md.
// người soạn: AI, chưa kiểm chứng độc lập.
//
// type: hard | soft | ordering | budget | n/a (hội thoại, dữ liệu, UI, an toàn ngoài lập lịch)
// det (deterministic): yes | partly | no
// ev: mức căn cứ ghi trong spec ([NC], [NL], [MĐ], SP = yêu cầu sản phẩm, BGD = Bộ GD&ĐT, OD = quyết định chủ sản phẩm)
// impl: nơi bộ xếp lịch E1 xử lý (scheduler | validator | phase | none)

const R = (id, type, det, ev, impl, text, note = "") => ({ id, type, det, ev, impl, text, note });

const RULES = [
  // A. Vai trò và cách nói
  R("A1", "n/a", "partly", "SP", "scheduler", "Cân bằng (mục C) đặt cao hơn yêu cầu phụ huynh", "Thứ tự ưu tiên trong thang sửa (repair ladder) là tất định; cách nói khi từ chối cần LLM hoặc mẫu câu"),
  R("A2", "n/a", "yes", "SP", "none", "Cảnh báo một lần, đã nghe thì không nhắc", "Cờ đã_cảnh_báo theo khóa; UI/trạng thái"),
  R("A3", "n/a", "no", "SP", "none", "Trả lời ≤3 câu ngắn, văn nói, ≤1 câu hỏi", "Sinh lời: LLM hoặc mẫu câu"),
  R("A4", "n/a", "no", "SP", "none", "Không gắn nhãn tính cách, không chẩn đoán", "Lọc lời nói: LLM + lớp an toàn"),
  R("A5", "hard", "yes", "[MĐ]", "scheduler", "Pal không bao giờ tự đề xuất kéo dài giờ học", "Bộ xếp chỉ dùng số hoc_nha của bố mẹ, chỉ giảm khi sửa, không tăng"),
  R("A6", "n/a", "partly", "[NC] NT", "scheduler", "Nói rõ mức căn cứ khi giải thích", "Mỗi cảnh báo của E1 mang mã quy tắc + mức căn cứ; câu chữ tự nhiên cần LLM"),
  // B. Thu thập
  R("B1", "n/a", "yes", "SP", "scheduler", "Bắt buộc: tuổi/lớp, giờ học, bán trú", "Kiểm tra input bắt buộc"),
  R("B2", "n/a", "no", "SP", "none", "Hỏi sức khỏe, thể lực, giấc ngủ, tính cách, môn học… trước khi lập lịch", "Hội thoại tự nhiên: LLM (hoặc form)"),
  R("B3", "n/a", "partly", "SP", "none", "Ghi đúng lời bố mẹ vào hồ sơ theo trường", "Trích trường từ lời kể: LLM; lưu: tất định"),
  R("B4", "n/a", "partly", "SP", "scheduler", "Bố mẹ muốn nhanh: đặt giả định hợp lý", "E1 có giá trị mặc định (ví dụ ăn trưa 11:15); nói giả định cần mẫu câu"),
  R("B5", "soft", "partly", "SP", "none", "Lịch phản ánh hồ sơ (hen, nhanh mệt, dễ nản…) và nêu 1 điều đã chỉnh", "Ánh xạ hồ sơ → tham số cần bảng ánh xạ; trích hồ sơ tự do cần LLM. Spike chưa làm"),
  // C. Sàn cứng
  R("C1", "hard", "yes", "[NC] AASM", "scheduler+validator", "Ngủ ≥ 9h (6–12 tuổi) / ≥ 8h (13–18 tuổi); không bao giờ nới", "protected_hard"),
  R("C2", "hard", "yes", "[NC] NT-01; thời lượng [MĐ]", "scheduler+validator", "Sau giờ học có phục hồi 20–30′ (tối thiểu 15′) trước việc học", "protected_hard ở mức 15′; 20–30′ là mặc định"),
  R("C3", "hard", "yes", "[NL] NT-09, [MĐ]", "scheduler+validator", "Không có hai khối tải cao liền nhau; nghỉ 3–5′ giữa hai khối học", "protected_hard; E1 dùng 5′ (giao của C3 3–5′ và F4 5–10′)"),
  R("C4", "hard", "yes", "[MĐ]", "scheduler+validator", "Không có khối học trước giờ đi học", "family/relaxable: truoc_gio_hoc"),
  R("C5", "hard", "yes", "[NC] NT-05", "scheduler+validator", "Tập mạnh kết thúc ≥60′ trước tắt đèn", "Không nới; E1 thử lùi giờ ngủ ≤30′ (G7), không được thì báo đánh đổi"),
  R("C6", "hard", "yes", "[NC] NT-06", "scheduler+validator", "Màn hình giải trí kết thúc ≥60′ trước tắt đèn", "relaxable: man_hinh"),
  R("C7", "hard", "partly", "[MĐ]", "scheduler+validator", "Không bỏ bữa; không đồ ăn làm thưởng/phạt; không phạt thể chất; không bỏ hẳn nghỉ", "Bữa và nghỉ: tất định. Thưởng/phạt: là lời nói, cần lọc nội dung"),
  // D. Quỹ
  R("D1", "budget", "yes", "SP", "scheduler", "Bố mẹ đặt 1 số/ngày cho hoc_nha, sinh_hoat, ngu, man_hinh (2 cột)"),
  R("D2", "budget", "yes", "SP", "scheduler", "truong lấy từ TKB; hoc_them lấy từ Hoạt động (gồm đi lại)"),
  R("D3", "budget", "yes", "SP", "validator", "choi_nghi = phần còn lại của 24h; bữa ăn tính 1/2 vào nghỉ", "Prototype restRange cộng 1/4 sinh_hoat (giả định 1/2 sinh_hoat là bữa)"),
  R("D4", "budget", "yes", "[MĐ]", "scheduler+validator", "Lệch tối đa ±30′ quanh mỗi số; ngủ không thấp hơn số chọn quá 30′, không dưới C1"),
  R("D5", "budget", "yes", "SP", "scheduler", "Học ở nhà không chấm màu, không trần riêng; chỉ chia phiên (F4)"),
  R("D6", "n/a", "yes", "SP", "validator", "Màu chỉ trên bảng quỹ; vùng đỏ cần 'Giữ mức này' một lần", "judge() port 1:1"),
  R("D7", "n/a", "yes", "SP", "none", "Preset (Bình thường, Thi cử…)", "Dữ liệu/UI"),
  R("D-ngu", "budget", "yes", "[NC] AASM", "validator", "Ngưỡng màu Ngủ: xanh ≥ tối thiểu, cam thiếu ≤30′, đỏ >30′"),
  R("D-mh", "budget", "yes", "đỏ [NC] Canada 24h; cam [MĐ]", "validator", "Ngưỡng Màn hình: ≤1h xanh, 1–2h cam, >2h đỏ"),
  R("D-sh", "budget", "yes", "[MĐ]", "validator", "Ngưỡng Ăn uống, vệ sinh: ≥1h30 xanh, 1h–1h30 cam, <1h đỏ (sáng 30′ + tối 30′ + tắm 30′)"),
  R("D-cn", "budget", "yes", "[MĐ] + WHO [NC]", "validator", "Ngưỡng Chơi và nghỉ: ngày học ≥1h / cuối tuần ≥2h"),
  R("D-ht", "budget", "yes", "[MĐ]", "validator", "Ngưỡng Học thêm: ngày học ≤2h / cuối tuần ≤3h xanh"),
  R("D-def", "budget", "yes", "[MĐ]; 10′×lớp theo Cooper", "scheduler", "Quỹ mặc định theo tuổi (hoc_nha 10′×lớp; sinh_hoat 1h45/2h; ngu tối thiểu+30′/+60′; màn hình 30′/1h hoặc 1h/2h)"),
  // E. Hoạt động
  R("E1", "n/a", "yes", "SP", "scheduler", "Cấu trúc thẻ hoạt động (tên, loại, thứ, giờ, đi lại…)"),
  R("E2", "n/a", "partly", "SP", "none", "Bố mẹ kể → tạo thẻ; thiếu ngày/giờ thì hỏi; không tạo trùng", "Trích từ lời kể: LLM; chống trùng, thiếu trường: tất định"),
  R("E3", "n/a", "yes", "SP", "none", "Đổi/xóa thẻ; thay đổi một tuần thì sửa lịch tuần đó", "Phân biệt lâu dài/một lần từ lời kể: LLM"),
  R("E4", "ordering", "yes", "SP", "scheduler", "Có lịch thì cập nhật ngày bị ảnh hưởng", "E1 xếp lại toàn tuần, chi phí ~ms"),
  R("E5", "n/a", "yes", "SP", "none", "Bố mẹ tự sửa → 'Lịch tuần chưa cập nhật'", "UI"),
  R("E6", "n/a", "partly", "SP", "scheduler", "Tập có HLV → Học thêm; vận động vui → Chơi và nghỉ", "Phân loại khi nhập thẻ (loại); từ lời kể cần LLM"),
  // F. Cấu trúc ngày
  R("F1", "n/a", "partly", "SP", "scheduler", "Chia ngày thành khối, mức xác nhận nhẹ nhất; không kiểm tra trong giờ học", "Bảng ánh xạ loại khối → xác nhận"),
  R("F2", "ordering", "yes", "[MĐ] thang nội bộ", "scheduler", "Nhãn tải cao/vừa/thấp/phục hồi cho mỗi khối"),
  R("F3", "ordering", "yes", "[NC] NT-01", "scheduler+validator", "Sau khối cao dài có phục hồi; khối cuối trước ngủ là tải thấp"),
  R("F4", "ordering", "yes", "[MĐ] NT-09", "scheduler+validator", "Phiên học liên tục tối đa ~20–30′ (lớp 1–3), 30–40′ (4–5), 40–45′ (6–9); nghỉ 5–10′ giữa phiên"),
  R("F5", "ordering", "yes", "[NC] NT-04", "scheduler+validator", "Màn hình không phải nghỉ: không đặt trước/giữa khối học"),
  R("F6", "soft", "partly", "[NC] NT-02, NT-03", "scheduler", "Vận động vui là phục hồi, do con chọn", "E1 gắn nhãn khối phục hồi; nội dung do con chọn"),
  R("F7", "ordering", "yes", "[MĐ] NT-08", "scheduler", "Trong khối ôn: việc dễ ~5′ → việc khó nhất → việc nhẹ", "Mẫu viec[] cố định; nội dung cụ thể theo sổ việc cần dữ liệu/LLM"),
  // G. Nhịp ngày
  R("G1", "ordering", "yes", "[NC] AASM", "scheduler", "Giờ dậy theo giờ vào học, lùi ra giờ tắt đèn; T2 sớm thì tối CN ngủ sớm"),
  R("G2", "soft", "yes", "[MĐ]", "scheduler", "Vận động sáng 15–25′ nếu có chỗ", "Nội dung an toàn (mũ bảo hiểm…) là văn bản cố định"),
  R("G3", "ordering", "yes", "[NC] NT-01; thời lượng [MĐ]", "scheduler", "Về nhà: 10′ ghi việc + hỏi thăm, rồi phục hồi 20–30′; 'Rất mệt' thì +15′ và bỏ học định hướng", "Nhánh 'Rất mệt' là sự kiện runtime trong ngày, tất định"),
  R("G4", "ordering", "yes", "[NC] NT-06; còn lại [MĐ]", "scheduler+validator", "Tối: ôn bài → soạn cặp ngay sau → tự do (màn hình ≤ bed−60) → vệ sinh → đọc 15′ + nhật ký → tắt đèn"),
  R("G5", "ordering", "yes", "[MĐ]", "scheduler", "Chuỗi hai ngày: tối nay + sáng mai", "E1 tính giờ ngủ theo giờ dậy hôm sau"),
  R("G6", "soft", "yes", "[MĐ]", "none", "Soạn cặp có thể dời sáng nếu sáng còn ≥10′ trống", "Tùy chọn của bố mẹ; spike chưa bật"),
  R("G7", "soft", "partly", "[MĐ]", "scheduler", "Ngày học thêm tối: bữa phụ chắc, giờ ngủ lùi ≤15–30′, hỏi bố mẹ có muốn bớt học ở nhà", "Câu hỏi cần hội thoại; prompt lại ghi 'bỏ ôn bài' (mâu thuẫn, xem blocker B-2)"),
  R("G8", "soft", "partly", "[NC] NT-07", "scheduler", "11–15 tuổi: ít khối hơn, con tự sắp xếp, xác nhận nhẹ; cuối tuần giữ giờ dậy gần ngày thường", "'Ít khối hơn' không có số"),
  R("G9", "ordering", "yes", "[MĐ]", "scheduler", "Cuối tuần: học mới/khó buổi sáng, vận động vui dài, tối CN soạn đồ T2"),
  R("G10", "soft", "yes", "BGD", "scheduler", "Không xếp việc nhà; tiểu học 2 buổi/ngày → ôn nhẹ"),
  // H. Bữa ăn
  R("H1", "ordering", "yes", "[MĐ]", "scheduler+validator", "Bữa là tải thấp; việc tải cao cách bữa chính 15–20′; bữa không thay phục hồi; không màn hình khi ăn"),
  R("H2", "hard", "yes", "[NC] AND; 4–5h nguồn phổ thông", "scheduler+validator", "Báo khi hai lần ăn cách >5h (6 tuổi: >4h); chưa biết giờ ăn trưa ở trường thì giả định 11:15"),
  R("H3", "ordering", "yes", "[NC] chung", "scheduler", "Bữa phụ cách bữa chính tiếp theo 1–2h, thường khi về nhà"),
  R("H4", "n/a", "partly", "[MĐ]", "none", "Bữa phụ nhỏ, chú ý dị ứng, không đưa calo", "Gợi ý món: lớp thực thi/LLM"),
  R("H5", "n/a", "yes", "SP", "none", "Nút 'Con thấy đói' và xu hướng 14 ngày", "Thống kê tất định; câu đề xuất cần mẫu/LLM"),
  R("H6", "hard", "no", "An toàn", "none", "Ăn uống theo chỉ định bác sĩ do bố mẹ kể lại", "Hiểu lời bác sĩ kể lại: LLM + người duyệt"),
  // I. Thời tiết
  R("I1", "soft", "yes", "[MĐ]", "none", "Miền Bắc mùa lạnh/nồm: vệ sinh tối +10–15′", "Tất định theo tháng + vùng; spike chưa bật"),
  R("I2", "soft", "partly", "[MĐ]", "none", "Mùa nóng/mưa: phương án trong nhà, tránh nắng trưa"),
  R("I3", "budget", "yes", "SP", "none", "Điều chỉnh mùa nằm trong ±30′ sinh_hoat"),
  R("I4", "n/a", "yes", "SP", "scheduler", "Khối soạn cặp hỏi thời tiết ngày mai (4 lựa chọn)"),
  R("I5", "n/a", "yes", "Việc còn mở", "none", "App thật lấy dự báo tự động"),
  // J. Giai đoạn tạm thời
  R("J1", "n/a", "no", "SP", "none", "Lý do chính đáng có thời hạn: không phản đối", "Nhận diện lý do từ lời kể: LLM"),
  R("J2", "hard", "partly", "SP", "phase", "Xác định ngày kết thúc; >6 tuần xem lại mỗi 2 tuần; cảnh báo 1 lần; lưu lịch cũ"),
  R("J3", "n/a", "yes", "SP", "validator", "Trong giai đoạn không nhắc điều đã nới", "Lọc theo noi_long như checkDay()"),
  R("J4", "hard", "yes", "SP", "phase", "Chỉ nới truoc_gio_hoc, van_dong, man_hinh, an_uong, tong_gio_hoc; không bao giờ nới C1, C2(≥15′), C3, C7"),
  R("J5", "hard", "yes", "SP", "phase", "Đề xuất từ con cần bố mẹ xác nhận"),
  R("J6", "n/a", "yes", "SP", "phase", "Hết hạn: 3 lựa chọn"),
  R("P6-OD-01", "hard", "yes", "OD", "phase", "Nới cùng constraint liên tục tối đa 60 ngày (kể cả đổi purpose); ≥7 ngày trống giữa ngoại lệ tương tự"),
  R("P6-OD-02", "hard", "yes", "OD", "phase", "Không có đường tắt khẩn vượt protected_hard; family_hard thay đổi có quyền, audit"),
  R("P6-OD-03", "hard", "yes", "OD", "validator", "Không có bar hợp lệ → UNKNOWN; không gắn nhãn VALID/BALANCED khi điều kiện chưa kiểm chứng"),
  // K. Sửa kế hoạch
  R("K1", "ordering", "yes", "SP", "scheduler", "Xác định mọi ngày bị ảnh hưởng (tối trước, sáng sau)", "Xếp lại cả tuần rồi diff"),
  R("K2", "n/a", "yes", "SP", "scheduler", "Chỉ gửi ngày có đổi; khối không đổi giữ nguyên từng chữ", "E1 tất định nên khối không đổi giống hệt (cùng input → cùng output)"),
  R("K3", "n/a", "partly", "SP", "none", "Lâu dài → lịch mẫu; một lần → chỉ tuần này; không rõ thì hỏi", "Phân loại từ lời kể: LLM"),
  R("K4", "n/a", "yes", "SP", "none", "Ốm hủy cả ngày: khối cũ trang_thai=huy, thêm khối cho bố mẹ"),
  // L, M, N, O
  R("L1-L4", "n/a", "partly", "SP", "none", "Tab của con (UI); L4 nhận ra lời than thở cần LLM"),
  R("M1-M3", "n/a", "no", "SP", "none", "Phản hồi bài làm qua ảnh", "Cần mô hình thị giác"),
  R("N1-N2", "n/a", "partly", "An toàn", "none", "Không chẩn đoán; dấu hiệu khẩn → 115/111", "Lớp an toàn chạy trước AI (từ khóa + phân loại)"),
  R("O", "hard", "yes", "—", "validator", "7 mã kiểm tra checkDayK: ngu, phuc_hoi, cao_lien, an_xa, truoc_gio_hoc, tong_gio_hoc, tap_muon", "Port 1:1 trong validators.js"),
];

module.exports = { RULES };
