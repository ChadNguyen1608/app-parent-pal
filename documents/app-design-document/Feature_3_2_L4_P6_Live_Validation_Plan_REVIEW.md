# Parent-Pal — P6: Kế hoạch kiểm chứng Multi-Agent L4 thật và điều kiện nghiệm thu

**Ngày lập:** 2026-11-11 · **Cập nhật phụ thuộc:** 2026-11-11 · **Trạng thái:** `P6_DESIGN_READY / BLOCKED_NO_INDEPENDENT_AGENT_RUNTIME`  
**Căn cứ:** P5 Owner Review `R1=A/R2=A/R3=A`, 64 test case hợp nhất và Draft PR #17 (đặc tả). **PR #18 đã đóng, chưa merge và không phải công cụ thực thi P6.**  
**Nguyên tắc:** Kết quả 11 test tự động và ba L3 chạy mock trước đây là bằng chứng lịch sử của PR #18, **không** chứng minh agent thật hoặc công cụ thay thế đã chạy. Không cần merge PR #17 để chuẩn bị P6; không sử dụng hoặc khôi phục PR #18 mặc định.

## 1. Mục tiêu và ranh giới

- Chứng minh agent chạy bằng **lượt gọi model thật** trong ngữ cảnh riêng và có evidence từng lượt; không giả mạo tính độc lập từ nhiều role prompt trong một context.
- Đánh giá đầu ra theo Blueprint, Owner Decision Log và test case; không dùng số test "match" đơn thuần làm quality score.
- Đo token, cost, latency, tính nhất quán và khả năng phát hiện yêu cầu còn thiếu; không dùng dữ liệu thật của trẻ.
- Kết quả P6 **chỉ duyệt phương pháp và cách áp dụng rộng**, không chứng nhận luật, giáo dục, sức khỏe hoặc chất lượng ứng dụng.

## 2. Các bước chạy có điều kiện

| Bước | Thực hiện | Bằng chứng bắt buộc | Chặn nếu |
|---|---|---|---|
| P6-01 — Chọn và xác minh môi trường thực thi | Kiểm tra **agent độc lập thay thế** do Chủ sản phẩm lựa chọn (không phải PR #18): quyền đọc GitHub, nguồn/tài liệu phiên bản xác định, tách ngữ cảnh QA–Architect–Reviewer, đầu ra tiếng Việt, quyền ghi và chi phí | Tên nền tảng, phương pháp thực thi, ID các lượt gọi, model/prompt/version, commit SHA nguồn, quyền truy cập, log và mẫu báo cáo | **BLOCKED** nếu chưa có môi trường hoặc không chứng minh được lượt phản biện độc lập |
| P6-02 — Một L3 thật | Sau khi P6-01 đạt, chọn `F01-G04-M01`, chạy Architect/QA/Reviewer thực tế với ngữ cảnh tách biệt; Validator kiểm tra các điều kiện xác định bằng code nếu có; lưu đầu ra riêng | `run_id`, model ID, prompt hash, input/source hash, usage/cost nếu có, raw/review output, đánh giá validator và lỗi | Chỉ chạy mock, tự phản biện trong một context, hoặc không có trace tách vai |
| P6-03 — Phản biện và sửa | So QA-first với Architect; reviewer có nguồn gốc riêng, log phản ví dụ, retry tối đa theo cấu hình | disagreement log, issue severity, sửa và rerun assertions | Reviewer chỉ sao chép kết luận Architect hoặc tự chấm PASS |
| P6-04 — Chạy ba L3 | Chạy `F01-G04-M01`, `F06-G07-M01`, `F04-G02-M03`; so 64 baseline cases | Ma trận coverage từng requirement/outcome/test, missing/false positives, human adjudication | Thiếu nguồn, output mơ hồ, regression quyền hoặc hard-cap |
| P6-05 — Kiểm tra liên module | Kiểm owner F01/F04/F06/F07; validate R1–R3, approval/commit, rubric source, version | Cross-module issue register + negative case tests | Chồng trách nhiệm nghiêm trọng chưa được xử lý |
| P6-06 — Quyết định mở rộng | Đánh giá chất lượng/budget/latency và mức Owner review; đề xuất batch ≤10 L3, chỉnh theo phụ thuộc | Go/Conditional Go/No-Go, quality/cost report và giới hạn batch | Không đạt acceptance hoặc chưa kiểm soát chi phí |

## 3. Bộ test và nguyên tắc đo lường

**Baseline tại P5:** 64 test thiết kế (19 Access, 19 Academic, 26 Balanced); 43 legacy và 24 gap đã được đối chiếu vào bộ hợp nhất; 0 app tests chạy.

Không yêu cầu 64/64 khớp từng chữ. Đánh giá:
1. **Coverage:** Các yêu cầu cốt lõi đều có test/contract truy vết.
2. **Correctness:** Reviewer không tự áp đặt chính sách chưa được Owner phê duyệt; không làm ngược R1–R3.
3. **Independence:** QA bắt đầu từ nguồn gốc, không nhận bản thiết kế Architect ở lượt đầu.
4. **Adversarial effectiveness:** Reviewer nhận diện điểm sai và chỉ dẫn chứng/nguồn, không tạo lỗi giả.
5. **Regression:** Những thay đổi vẫn giữ quyền Journal, Standard Bar fallback, hard-cap, exception 60/7 và observer restrictions.
6. **Economics:** Chi phí thực đo theo model và module; mức 8 USD từ cấu hình thử nghiệm **không được coi là mức đã tiêu** hoặc bảo đảm ngân sách cứng trước khi kiểm tra implementation.

## 4. Test phản biện tối thiểu cần bổ sung trong P6

| Test biên | Input | Expected output |
|---|---|---|
| `P6-NEG-01` | Hai ngoại lệ khác mục đích nhưng tổng tải tuần vượt protected hard-cap | Không coi chúng là "tương tự" theo R2 chỉ vì cùng tải; vẫn **REJECT** lịch tổng nếu vượt hard-cap |
| `P6-NEG-02` | Không có primary manager hợp lệ, observer và trẻ gửi yêu cầu điều chỉnh | Nhận đề xuất hợp lệ trong phạm vi cho phép, không `approve/commit`, chỉ tạo kênh chuyển giao |
| `P6-NEG-03` | Primary manager được bàn giao trong lúc worker đang commit kế hoạch | Re-authorize theo version mới trước khi ghi, từ chối request có quyền đã bị thu hồi |
| `P6-NEG-04` | Hai ngoại lệ cùng mục đích/constraint/scope nhưng đổi tên hoạt động | Gộp vào cùng `similarity_key`, áp dụng 60/7, không lách bằng tên hiển thị |
| `P6-NEG-05` | Ngoại lệ ngày cuối 60 và đề xuất nối sau chỉ 6 ngày trống | Không tạo kỳ mới trước đủ 7 ngày trống; kỳ quá 60 ngày không duyệt |

Các case này là **test bổ sung P6**, chưa tự động đổi con số **64 baseline P5**; chỉ thêm sau review/trace vào registry vòng P6.

## 5. Phân vai và trách nhiệm

- **Người vận hành agent thay thế / kỹ thuật:** thiết lập môi trường mà Chủ sản phẩm chọn, cấu hình quyền và chi phí, lưu log từng vai, xuất kết quả để đối chiếu. **Không dùng Codex Agent hoặc PR #18 làm phụ thuộc bắt buộc.**
- **Independent Reviewer:** chạy reviewer với input rõ ràng, kiểm lại nguồn gốc và phản chứng; báo `INDEPENDENCE_LIMITED` nếu reviewer dùng cùng model/provider nhưng prompt context tách biệt.
- **Product Owner:** chỉ duyệt vấn đề nghiệp vụ có ảnh hưởng, không cần kiểm từng dòng code hay tất cả test cases.
- **Chuyên gia pháp lý/giáo dục/riêng tư:** duyệt các vấn đề theo thẩm quyền; kết quả agent không thay thế họ.

## 6. Nguyên tắc phê duyệt P6

| Mức | Điều kiện |
|---|---|
| `GO` | Có trace agent thật, coverage và security gates đạt, không còn blocker mức cao, chi phí trong giới hạn, Owner chấp nhận batch plan |
| `CONDITIONAL_GO` | Chỉ cho batch giới hạn nếu vấn đề không nghiêm trọng có owner/mitigation và chưa dùng cho production |
| `NO_GO` | Chưa có live runs, không tách được agent, quyền ghi quá rộng, rò rỉ dữ liệu, lỗi nghiêm trọng hoặc không kiểm soát chi phí |

**Tình trạng hiện nay:** `BLOCKED_NO_INDEPENDENT_AGENT_RUNTIME` — phương pháp và bộ test đã có, nhưng chưa có môi trường agent thay thế được xác minh, nên **chưa sẵn sàng chạy P6 đúng protocol**. Kết quả mock cũ và P5 sign-off không đủ để tự kết luận `GO`.

## 7. Câu hỏi chỉ khi phát sinh

- Mức ngân sách **tối đa thực tế cho lần chạy thử** và quyền model/API, nếu chưa được thiết lập qua cấu hình hoặc user approval.
- Nếu live pilot phát hiện đề xuất phải sửa quyết định R1–R3, đưa Owner xem impact và alternatives, không tự sửa.
- Khi đủ chứng cứ P6, chỉ hỏi Owner về **go/no-go và kích thước batch đầu tiên**; không lặp lại R1–R3.

## 8. Change Log

- `P6-PLAN-01`: ghi dependency P5→P6, mock≠live.
- `P6-PLAN-02`: thêm năm test biên nhằm xác minh R2/R3 và regression liên module.
- `P6-PLAN-03`: định nghĩa gate mở rộng 103 L3 còn lại; không mặc định bắt đầu ngay.
- `P6-PLAN-04`: loại phụ thuộc PR #18 (đã Closed); thêm gate kiểm tra runtime thay thế và trạng thái `BLOCKED_NO_INDEPENDENT_AGENT_RUNTIME`.

**Không sửa Blueprint canonical, không merge PR #17. PR #18 đã Closed và không được sử dụng làm hệ thống P6.**
