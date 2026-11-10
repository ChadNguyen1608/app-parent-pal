# Parent-Pal — Nhật ký quyết định P5: Owner Review

**Ngày ghi nhận:** 2026-11-11  
**Trạng thái:** `P5_OWNER_APPROVED_AT_SPEC_LEVEL` — phê duyệt về mặt đặc tả, **không** phải kết quả kiểm thử AI thật, kiểm thử ứng dụng, pháp lý, an toàn hoặc phê duyệt triển khai.
**Phạm vi:** Ba L3 thử nghiệm `F01-G04-M01`, `F06-G07-M01`, `F04-G02-M03`. **Không** phê duyệt tự động 103 L3 còn lại.
**Nguồn quyết định:** Chủ sản phẩm xác nhận trực tiếp `R1=A, R2=A, R3=A` trong cuộc hội thoại.

## 1. Quyết định đã chốt

| ID | Quyết định được Chủ sản phẩm chọn | Phạm vi hiệu lực | Tiêu chí xác minh |
|---|---|---|---|
| `P5-OD-01 / R1=A` | Chấp nhận **64 test case thiết kế ứng viên** làm baseline pilot và phương pháp đối chiếu cho batch tiếp theo | 58 test trong ba Review Package và 6 test mới trong P5 Final Consolidation; 43 test cũ và 24 gap đề xuất giữ mapping, không cộng cơ học | Có đủ 64 ID duy nhất, mapping 43+24, truy vết requirements/outcome; phân biệt `DESIGN_REVIEWED` với `EXECUTED` |
| `P5-OD-02 / R2=A` | Ngoại lệ soft-cap **tương tự** khi cùng `plan_scope`, cùng `constraint` được nới và cùng `purpose`; không được né quy tắc bằng cách đổi nhãn | Giới hạn tối đa **60 ngày lịch mỗi kỳ**; **ít nhất 7 ngày lịch trống hoàn chỉnh** giữa hai ngoại lệ tương tự. Áp dụng cho ngoại lệ soft/normal cap cùng phạm vi, không chỉ ôn thi; **không bao giờ vượt protected hard-cap** | Biên 60/61 ngày, 6/7 ngày trống, timezone tại lịch, sửa ngày hoặc mục đích, đổi nhãn, kế hoạch khác scope; không tự commit |
| `P5-OD-03 / R3=A` | Khi không có Primary Manager hợp lệ hoặc cấu hình có xung đột, **chặn các thao tác thay đổi kế hoạch**, đưa đến quy trình xác minh/bàn giao; Observer không tự nâng quyền | Một `primary_plan_manager` tại mỗi `plan_scope`; observer có thể xem/trợ giúp/đề xuất **theo quyền cụ thể**, nhưng không sửa/duyệt/commit | F01-G04 fail-closed; F01-G05 chuyển quyền có xác minh/audit; F04-G06 phê duyệt; kiểm lại authorization trước mutation |

### Diễn giải ranh giới

- R1 là quyết định **dùng làm baseline đặc tả**, không chứng minh 64 test đã chạy hoặc 6 L4 ứng viên đã đạt chất lượng thực nghiệm.
- R2: `similarity_key` đề xuất = `(plan_scope_id, normalized_constraint_id, normalized_purpose_id)`; chống đổi tên bằng taxonomy/semantic equivalence được quản trị. Không dùng một phép so khớp chuỗi tự do của LLM để phê duyệt ngoại lệ. Ngày cần tính theo múi giờ lịch với ngày bắt đầu/kết thúc inclusive; **7 ngày trống hoàn chỉnh** giữa hai kỳ.
- R3: Quyền quản lý kế hoạch trong ứng dụng **khác** quyền giám hộ theo pháp luật; trường hợp người quản lý có quyền nhưng chỉ tạm thời ngoại tuyến không có nghĩa role đã mất hiệu lực. Khi *không có người quản lý hợp lệ* hoặc có >1 người cùng quyền trên scope, mới chặn mutation. Chi tiết recovery/handover cần xác minh luật và quyền riêng tư.

## 2. Kết quả phản biện sau Owner Review

| Kiểm tra | Kết luận | Theo dõi |
|---|---|---|
| Có thể phê duyệt thiết kế mà không có API call thật? | **Có**, nhưng nhãn `SPEC_APPROVED` không được biến thành `TEST_PASSED` | P6 yêu cầu live pilot trước khi duyệt phương pháp cho full rollout |
| Cùng mục đích nhưng khác tên có thể lách 60/7? | **Có** nếu chỉ so tên | Cần chuẩn hóa constraint/purpose và test đối kháng |
| Hai ngoại lệ khác mục đích nhưng cùng tạo tải có thể cộng dồn rủi ro? | **Có** | Balanced Planning phải đánh giá tổng tải/hard-cap của toàn lịch; thêm acceptance test về các ngoại lệ khác loại cùng gây tác động |
| Fail-closed có ngăn trẻ gửi đề xuất? | **Không nên** | Chặn `update/approve/commit`; cho phép ghi đề xuất có scope và không ghi plan baseline |
| Observer có mặc định đọc Journal? | **Không** | Mọi read phải có purpose/scope; role observer không tự sinh quyền Journal |
| Đã có reviewer sub-agent thực sự trong P5? | **Chưa** | PR #18 đã **Closed / chưa merge / không còn là giải pháp P6**. Kết quả mock cũ chỉ là bằng chứng lịch sử, không chứng minh có hệ thống phản biện độc lập đang vận hành. |

## 3. Phụ thuộc và việc cần tiếp tục

1. **P6-A (BLOCKER):** Chọn và xác minh **môi trường agent thay thế**, không dùng PR #18. Yêu cầu thực thi tách ngữ cảnh ít nhất Architect/QA/Reviewer; có access được kiểm soát, nguồn đầu vào phiên bản cố định, nhật ký và đầu ra riêng. Khi đạt gate mới cho phép chạy agent thật với cấu hình/chi phí được duyệt, lưu trace và bất đồng.
2. **P6-B:** Đối chiếu đầu ra agent thật với nguồn gốc và 64 baseline test; không coi 64 baseline là ground truth tuyệt đối.
3. **P6-C:** Kiểm tra test bổ sung cho (a) ngoại lệ khác mục đích nhưng tổng tải vượt cap, (b) no-primary vẫn nhận proposal, (c) policy/handover version race; ghi regression.
4. **P6-D:** Xử lý `UNKNOWN` về jurisdiction/guardian, reference standards, AI đánh giá học tập, feasibility và chi phí; các phần cần chứng cứ nghiên cứu chuyển backlog thay vì giả tạo PASS.
5. **P6-E:** Khi phương pháp qua gate mới lập batch plan cho **103 L3 còn lại**; sau mỗi batch có kiểm tra liên module và regression.

## 4. Cổng phê duyệt

- **P5 Owner Review:** `APPROVED_AT_SPEC_LEVEL` cho R1/R2/R3.
- **P6 Method Readiness:** `BLOCKED_NO_INDEPENDENT_AGENT_RUNTIME`. Chưa chọn/xác minh môi trường thay thế; việc chuẩn bị tài liệu và test vẫn có thể tiếp tục, nhưng **chưa được báo cáo một lượt phản biện P6 là đã chạy**.
- **L4 production/canonical:** `NOT_APPROVED`.
- **GitHub:** PR #17 vẫn **Open / Draft / chưa merge**; PR #18 **Closed / chưa merge**, chỉ là lịch sử thử nghiệm, không còn phụ thuộc triển khai.

## 5. Cập nhật phụ thuộc P6 sau khi đóng PR #18

**2026-11-11 — `P5-OD-07`:** Chủ sản phẩm không tiếp tục dùng Codex Agent/PR #18 cho P6, sẽ sử dụng agent phản biện khác. Trạng thái thực thi P6 chuyển thành `BLOCKED_NO_INDEPENDENT_AGENT_RUNTIME` cho đến khi lựa chọn, cấu hình và kiểm chứng môi trường thay thế. Quyết định R1–R3 **không thay đổi**. Không dùng việc PR #18 từng chạy mock làm bằng chứng live-agent review.

**Điều kiện gỡ chặn:** xác minh agent nhận đúng Blueprint + Owner Decision Log P5, có ngữ cảnh QA/Architect tách biệt, reviewer thực sự chạy, lưu kết quả/trace và có validator kiểm bằng code hoặc ghi rõ giới hạn. Trước đó chỉ có thể chạy thử đánh giá phương pháp thủ công, không gọi là P6 hoàn thành.

## 6. Nhật ký thay đổi

- `P5-OD-01..03`: ghi ba quyết định R1–R3 vào Decision Log.
- `P5-OD-04`: làm rõ quy tắc ngày trống và chuẩn hóa mục đích/constraint.
- `P5-OD-05`: tách `P5_SPEC_APPROVED` khỏi `P6_LIVE_VALIDATED`.
- `P5-OD-06`: ghi rủi ro ngoại lệ khác loại cộng dồn và quyền đề xuất khi primary vắng.

**Không thay đổi Blueprint canonical, không cấp ID L4 chính thức, không merge PR.**
