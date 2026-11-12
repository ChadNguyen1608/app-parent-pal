# Parent-Pal — P6 Pilot 3: Balanced Planning Validation — Owner Decision Log

**Ghi nhận:** 2026-11-12  
**L3:** `F04-G02-M03`  
**Owner Review:** `OQ-3A/B/C = CONFIRMED`  
**Trạng thái pilot:** `REVIEW_EXECUTED_CONDITIONAL / FINAL_REGRESSION_PENDING`  
**Phạm vi:** Chính sách nghiệp vụ được chốt, không phải bằng chứng lịch/chuẩn an toàn đã kiểm chứng hoặc phê duyệt triển khai.

## 1. Quyết định

| ID | Quyết định | Hợp đồng và test cần bảo vệ |
|---|---|---|
| **P6-BP-OD-01 / OQ-3A** | **Chống nối ngoại lệ bằng cách đổi mục đích**: giới hạn nới **cùng constraint liên tục tối đa 60 ngày**, kể cả khi `purpose` thay đổi. Giữ P5-R2 về **≥7 ngày trống hoàn chỉnh** giữa các ngoại lệ **tương tự** (cùng scope+constraint+purpose). | Đánh giá cả `similarity_key` theo purpose và **continuous_relaxation_window** theo constraint trên cùng plan scope; không tự coi hai mục đích khác nhau là “tương tự” để đổi nghĩa R2. Test đổi mục đích/label, sửa ngày, hủy sớm, nối kỳ, nhiều proposal đồng thời. Quy ước ngày bắt đầu/kết thúc và timezone versioned. |
| **P6-BP-OD-02 / OQ-3B** | Không xây **đường tắt ngoại lệ khẩn cấp** để vượt `protected_hard_cap`. `family_hard` do gia đình tự thiết lập được thay đổi có quyền, audit, versioning và thời hạn/nhắc đánh giá lại khi phù hợp. | Phân biệt `protected_hard` với `family_hard`; điều chỉnh cấu hình family không được làm vượt giới hạn bảo vệ; không dùng approval để bypass protected hard-cap. |
| **P6-BP-OD-03 / OQ-3C** | Nếu gia đình chưa có Standard Bar hợp lệ thì dùng **App Default Standard Bar theo độ tuổi và bối cảnh**; gia đình có thể tùy chỉnh phần được phép. | Thứ tự: family bar được phê duyệt và còn hiệu lực → app default được nghiên cứu/thẩm định, phù hợp age/cohort/context và còn hiệu lực → `UNKNOWN/UNVERIFIABLE` nếu thiếu cả hai. Không tự dùng số ví dụ (ví dụ lịch ngủ/trường của trẻ 3 tuổi) như chuẩn khoa học. Không gắn nhãn `VALID/BALANCED` khi điều kiện bắt buộc chưa được kiểm chứng; phân biệt lưu draft và commit theo gate an toàn. |

## 2. Kết quả pilot Claude được báo cáo

- Hồ sơ Owner cung cấp: `P6_Pilot_2_3_All.zip`. Bản ZIP chưa được commit trong nhánh.
- Agent tự báo cáo: **3 L4 ứng viên**, **59 test thiết kế**, **20/26** test P5 được đánh giá tương đương đầy đủ, **6/26** tương đương một phần; **11** findings đã sửa, **5** đưa Owner, **4** cần nghiên cứu, **1** còn mở; Validator cuối: **0 lỗi/0 cảnh báo**.
- Đây là mức **design review**, không phải kiểm thử app hay bằng chứng lịch thực tế cân bằng.
- **F-021:** Proposal ngoại lệ gửi lặp có thể bị hiểu là xung đột với chính nó; cần sửa **idempotency** theo `proposal_id` và version, thêm deterministic regression.
- Những findings gắn OQ-3A/B/C cần mapping từng trường hợp; không tự đóng toàn bộ 5 findings chỉ từ Owner reply.

## 3. Những điều còn UNKNOWN

- App Default Standard Bar theo tuổi/bối cảnh, nguồn khoa học/phiên bản, cơ chế cập nhật và kiểm định chuyên gia.
- Protected hard-cap theo miền (nếu có) và ranh giới giữa hard-cap chuyên môn với family preference.
- Tương tác ngoại lệ khác loại, tổng tải học/chơi/nghỉ, chất lượng thuật toán tối ưu tuần.
- Cách kiểm tra continuous relaxation với chỉnh sửa hồi tố, múi giờ, đổi scope; legal/health/safety review.

## 4. Kết quả và việc tiếp tục

`P6_BP_OWNER_DECISIONS_RECORDED`  
`P6_BP_SPEC_REVIEW_CONDITIONAL`  
`P6_BP_FINAL_REGRESSION_PENDING`

ChatGPT chịu trách nhiệm Decision Log và GitHub; Claude chỉ chạy pilot và xuất ZIP; không sửa Blueprint canonical, không cấp stable L4 ID, không merge PR #17 hoặc PR #18.
