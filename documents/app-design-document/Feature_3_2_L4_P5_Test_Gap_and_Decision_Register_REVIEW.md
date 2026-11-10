# PARENT-PAL — P5 Test Gap & Decision Register

**Ngày:** 2026-11-10 · **Trạng thái:** `P5_REVIEW / REMEDIATION_PROPOSED`  
**Nguồn:** P5 Review Report, Pilot 10 L4, 43 test case, ma trận 60 cohort, Blueprint 3.2-R1/3.3/3.4.  
**Phạm vi:** Đánh giá thiết kế kiểm thử, truy vết owner, issue và điều kiện review. **Không sửa 43 test gốc, không chạy code, không coi test đề xuất đã pass.**

## 1. Đối chiếu 43 test gốc với disposition P5.1

| Outcome được khuyến nghị | Test gốc | Định hướng sau P5 |
|---|---|---|
| Access Policy — KEEP | A01–A08 | Giữ acceptance chính; bổ sung kiểm purpose/scope/consent và policy race |
| Effective access preview — DEFER | A09–A10 | Giữ như test chức năng xem quyền/metadata dưới Access Policy, chưa chứng minh L4 riêng |
| Policy conflict review — MOVE/DEFER | A11–A12; A06 | Giữ như workflow/security contract; owner hồ sơ `OWNERSHIP_UNKNOWN` |
| Rubric eligibility — MERGE | B01–B04 | Chuyển thành tiền điều kiện/nhánh lỗi của assess-submission |
| Assess submission — KEEP | B05–B11 | Giữ test; bổ sung đánh giá AI, nguồn và tính đúng của rubric |
| Review uncertainty — KEEP có điều kiện | B12–B13 | Cần state machine review, quyền reviewer và xử lý hàng đợi |
| Correct assessment — KEEP | B14–B15; B16 (workflow) | B14/B15 là acceptance; B16 kiểm ranh giới F06-G05, không tính là acceptance sửa |
| Validate balance — KEEP | C01–C08 | C02/C05 phải tách trách nhiệm conflict vs balance; xác định metric tải |
| Evaluate exception — KEEP | C09–C12 + C13–C15 từ expiry | Gộp trigger đề xuất và hết hạn; không chuyển approval/commit về L4 này |
| Expiry recheck — MERGE | C13–C15 | Không xóa test; đổi trace sang nhánh lifecycle của evaluate-exception |

**Không cộng 24 test dưới đây vào con số 43 hiện có.** Chúng là **ứng viên test bổ sung** để xử lý gap, chưa được duyệt hoặc thực thi.

## 2. Danh sách 24 test case đề xuất bổ sung

### 2.1 Access Policy — 8 case

| ID đề xuất | Given / When | Then kỳ vọng | Mục tiêu / gate |
|---|---|---|---|
| `TC-P5-A01` | P1 được phép xem lịch C8 cho mục đích lập kế hoạch, yêu cầu dùng cùng dữ liệu để suy luận Journal | Từ chối truy cập theo mục đích mới; không tái dùng quyết định cũ | Purpose-bound access; Privacy |
| `TC-P5-A02` | P1 được phép sửa lịch C8, cố sửa lịch CX bằng cách thay resource ID | DENY trước truy xuất; không lộ CX tồn tại | Scope escalation; Privacy |
| `TC-P5-A03` | Consent bị thu hồi trong lúc worker đã nhận yêu cầu nhưng chưa gọi model | Worker kiểm lại quyền, hủy gọi model và không lưu inference | Revocation race; Legal/Privacy |
| `TC-P5-A04` | Quyết định ALLOW ở phiên bản policy cũ bị replay với request mới | Không dùng quyết định cũ để ghi; kiểm lại policy/version | Replay/version; Security |
| `TC-P5-A05` | Actor có quyền xem nội dung C8 nhưng không có quyền xem metadata quyền của người khác | Không suy quyền preview từ quyền đọc nội dung; từ chối metadata-view | Permission separation |
| `TC-P5-A06` | Hai người giám hộ xung đột, event có version mới sau hồ sơ cũ | Không gộp sai hai tranh chấp khác version; không auto-ALLOW | Case key/idempotency; Owner UNKNOWN |
| `TC-P5-A07` | Một service bị lộ token nhưng chỉ có scope đọc submission S-101 | Không thể đọc hồ sơ khác, Journal hoặc thay đổi quyền | Service least privilege |
| `TC-P5-A08` | A19 trưởng thành tự chia sẻ một phần dữ liệu với P1 rồi thu hồi | Chỉ dữ liệu được chia sẻ được xem trước thu hồi; sau thu hồi DENY theo chính sách hiệu lực | A5 autonomy; Legal |

### 2.2 Academic Assessment — 8 case

| ID đề xuất | Given / When | Then kỳ vọng | Mục tiêu / gate |
|---|---|---|---|
| `TC-P5-B01` | Rubric đúng môn nhưng khác chương trình/phiên bản, có cùng tên | Không dùng nhầm; trả không đủ điều kiện hoặc yêu cầu chọn nguồn hợp lệ | Rubric provenance |
| `TC-P5-B02` | Submission có dữ liệu trẻ riêng tư ngoài phạm vi bài chấm | Chỉ đưa bằng chứng tối thiểu được phép cho model; không gửi metadata không cần thiết | Privacy/minimization |
| `TC-P5-B03` | Bộ đánh giá tiếng Việt có ảnh chữ viết tay đa chất lượng và đáp án chuẩn đã gán nhãn bởi chuyên gia | Báo precision/recall/error breakdown và trường hợp không thể chấm; **không đặt ngưỡng PASS trước khi chuyên gia chốt** | AI benchmark — chưa có dataset |
| `TC-P5-B04` | Reviewer đã được giao case nhưng bị thu hồi quyền trước khi mở ảnh | Không tải ảnh; case chờ chuyển người có quyền | Reviewer revocation |
| `TC-P5-B05` | Review case bị timeout/hủy, worker gửi lại cùng sự kiện | Chỉ một case hiệu lực, trạng thái rõ, không tự verified | State machine/idempotency |
| `TC-P5-B06` | Bài có hai nguồn trái ngược: trẻ self-report và giáo viên xác nhận khác kết quả | Giữ nguồn và mức xác thực riêng; không ghi đè thành “teacher verified” tự động | Source conflict |
| `TC-P5-B07` | Reviewer sửa kết quả, phụ huynh xem báo cáo từ cache trước đó | Kiểm quyền, version và invalidation trước khi hiển thị; không trả kết quả cũ như mới | Cache/provenance |
| `TC-P5-B08` | Provider tính phí hai lần khi retry cùng request nhưng không hỗ trợ idempotency | Ghi nhận double-charge risk/cost; không tuyên bố “exactly once” nếu không có biện pháp kiểm soát | AI cost/feasibility |

### 2.3 Balanced Planning — 8 case

| ID đề xuất | Given / When | Then kỳ vọng | Mục tiêu / gate |
|---|---|---|---|
| `TC-P5-C01` | Hai hoạt động 17:00–18:00 và 17:30–18:30, khác loại học và chơi | `occupied_minutes=90` theo hợp khoảng thời gian; `activity_minutes=120` theo tổng thời lượng cam kết; **không** suy “tải thực tế” bằng một chỉ số duy nhất | Định nghĩa metric; tách Conflict L3 |
| `TC-P5-C02` | Lịch lặp hằng tuần và ngày nghỉ/lễ ngoại lệ, cùng hoạt động có timezone | Chuẩn hóa recurrence/ngày cụ thể và đánh giá đúng; không tạo xung đột giả | Calendar semantics |
| `TC-P5-C03` | Standard Bar bản V1 được dùng để kiểm, V2 cập nhật trước khi duyệt lịch | Revalidate theo bản hiện hành trước commit; không dùng kết quả V1 như phê duyệt | Version race |
| `TC-P5-C04` | Gia đình đặt Standard Bar xung đột hard protected rule có căn cứ | Cảnh báo xung đột, không tự thay quy tắc; chuyển người có quyền review | Constraint precedence |
| `TC-P5-C05` | Ngoại lệ có hạn được phê duyệt, người dùng thay đổi ngày kết thúc khi ngoại lệ còn hiệu lực | Xác thực lại phạm vi và quyền; tạo yêu cầu duyệt phiên bản mới, không âm thầm kéo dài | Exception edit |
| `TC-P5-C06` | Ngoại lệ đã duyệt bị hủy trước ngày hết hạn; job hết hạn vẫn chạy | Không khôi phục/sửa lịch hai lần; trạng thái hủy được ưu tiên, audit nhất quán | Cancellation/idempotency |
| `TC-P5-C07` | A5 tự quản kế hoạch và không chia sẻ với phụ huynh | Chỉ chủ tài khoản có quyền theo policy; không gửi approval cho phụ huynh mặc định | A5 autonomy |
| `TC-P5-C08` | Lịch ôn thi tạo tải học tăng nhưng gia đình chưa cung cấp dữ liệu sức khỏe/tâm lý | Báo thiếu dữ liệu và giới hạn đánh giá; không chẩn đoán hay đặt ngưỡng sức khỏe tự suy | Safety/uncertainty |

**Lưu ý:** Ví dụ số 90/120 phút ở `TC-P5-C01` là phép tính theo hai metric giả định (hợp thời gian và tổng duration), không phải khuyến nghị giáo dục hay xác nhận trẻ có thể thực hiện đồng thời hai hoạt động.

## 3. Ma trận issue, trách nhiệm và điều kiện đóng

| Issue | Ưu tiên | Owner cần review | Điều kiện đóng (bằng chứng tối thiểu) | Trạng thái |
|---|---|---|---|---|
| P5-F01 — L3C-03 trace sai | HIGH | Product/Architecture | Trace Access Policy chuyển về 3.2 §5; L3C-03 chỉ dùng cho Journal/F07 | OPEN |
| P5-F02 — plan vs schedule owner | HIGH | Product/Architecture | Sơ đồ owner dữ liệu plan baseline F04-G01 / lịch F04-G02 / approval F04-G06 | OPEN |
| P5-F03 — Standard Bar owner | HIGH | Product/Research | Phân loại Standard Bar và quyết định bản ghi thuộc F03 hay F04; có ví dụ tình huống | OPEN |
| P5-F04 — MR-040 thiếu Master; 3.3 stale | HIGH | Research Ops/Product | Đối chiếu MR-040 với Master; quyết định tạo/đổi ref; đánh giá impact 3.3-R1 | OPEN |
| P5-F05 — quyền/cohort còn mẫu | HIGH | Legal/Privacy/UX | Ma trận actor/action/resource/purpose × A0–A5 theo luật và policy; alternative flows | OPEN |
| P5-F06 — test chưa đủ | HIGH | QA/Product | Chốt test bổ sung, sửa trace, kiểm trạng thái và quyền trước P6 | OPEN |
| P5-F07 — metrics/owner conflict | HIGH | Product/Engineering | Định nghĩa occupied/activity/effort load; F04-G02-M02 chịu conflict | OPEN |
| P5-F08 — AI benchmark/cost | HIGH | Education/AI QA/AI Ops | Rubric, dataset, ngưỡng eval, provider retention, fallback và chi phí | OPEN |
| P5-F09 — thiếu state machine | HIGH | Product/Engineering | State diagrams + authorization + concurrency cho review/correction/exception | OPEN |
| P5-F10 — research rubric chuyên biệt | MEDIUM | Research/Education | Ghi research gap vào Master theo quy trình, chưa tự cấp MR ID | OPEN |
| P5-F11 — preview thiếu user value | MEDIUM | Product/UX | User story, evidence, frequency/benefit, quyết định giữ L4 hay chỉ là UI | OPEN |
| P5-F12 — override đánh giá L4 | HIGH | Product/Safety/Engineering | Metadata theo L4: E0–E3, AI cost, privacy, cohort, gates, owner | OPEN |

## 4. Cổng review và những việc chưa thực hiện

- **Đã làm:** đọc/đối chiếu nguồn; phân loại 10 ứng viên; kiểm số lượng/trace test và cohort; đề xuất 24 test bổ sung; lập issue.
- **Chưa làm:** xác minh quyền pháp lý thực tế, thẩm định rubric bởi chuyên gia, đánh giá AI với dataset, đo hiệu năng/chi phí, kiểm thử code, nghiên cứu người dùng, chuyên gia độc lập ký duyệt, cập nhật canonical.
- **Điều kiện trước P6:** Product Owner chốt P5-Q1..Q6; làm rõ owner và các acceptance blocker; các rủi ro chưa giải quyết giữ `UNKNOWN` với người chịu trách nhiệm, không tự đánh dấu PASS.
- **Phạm vi PR #17:** Tài liệu review; **không merge tự động**.

**Trạng thái tổng:** P5 desk review đã có khuyến nghị; cần quyết định của Product Owner và remediation. **Không đồng nghĩa hoàn tất kiểm chứng liên chức năng.**
