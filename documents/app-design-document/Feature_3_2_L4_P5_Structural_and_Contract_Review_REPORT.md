# PARENT-PAL — P5 Review Report: Rà soát cấu trúc và hợp đồng L4

**Phiên bản:** P5-DRAFT-01 · **Ngày:** 2026-11-10  
**Trạng thái:** `P5.1_DESK_REVIEW_COMPLETED / P5.2_CONDITIONAL / P6_NOT_STARTED`  
**Hình thức:** Rà soát tài liệu đối chiếu chéo do AI thực hiện; **không phải** review độc lập của chuyên gia pháp lý, giáo dục, phát triển trẻ, an toàn hoặc kỹ thuật.  
**Phạm vi:** 10 L4 ứng viên của `F01-G04-M01`, `F06-G07-M01`, `F04-G02-M03`; 43 test case thiết kế; 60 bản ghi A0–A5.  
**Nguồn kiểm tra:** 3.2-R1 trên `main`, 3.3 Feature Prioritization and Dependency Mapping, 3.4 Feature Interaction and Use Case Mapping, Master Research Backlog v1.2, L3 Resolution Decision Log, và 5 tài liệu Pilot trong PR #17.  
**Không sửa:** canonical 3.2/3.3/3.4, Master Research Backlog, các L4 ứng viên ban đầu, code hoặc trạng thái MVP. **Không merge PR.**

## 1. Tóm tắt kết luận

**P5.1 (cấu trúc):** Đã rà soát đủ 10/10 ứng viên. Có **6 KEEP có điều kiện**, **2 MERGE đề xuất**, **1 DEFER**, **1 MOVE/DEFER chờ xác nhận owner**. Đây là **khuyến nghị review**, chưa phải quyết định phê duyệt và chưa cấp ID chính thức. Nếu mọi đề xuất được chấp thuận, còn **6 L4 trọng tâm** trong phạm vi pilot, cộng các hành vi tích hợp và các mục hoãn/chuyển owner. Không đồng nghĩa module nào cũng nên có số L4 tương tự.

**P5.2 (hợp đồng/test):** Đã rà soát mức tài liệu và chỉ ra lỗ hổng. **43/43 test case có ID duy nhất; 60/60 dòng cohort hiện diện**. Tuy nhiên, có test chỉ kiểm workflow/L3 khác, thiếu test negative/role cho vài ứng viên; nhiều trường hợp quyền và độ tuổi mới là mẫu giả định. **Chưa đủ điều kiện kết luận P5 đã được xác minh đầy đủ**.

**Cổng:** `G-Legal=UNKNOWN`, `G-Privacy=UNKNOWN`, `G-Safety=UNKNOWN`, `G-Feasibility=UNKNOWN`; `mvp_decision=NOT_DECIDED`. Không có test thực thi, nghiên cứu người dùng hay chuyên gia ngoài xác nhận.

## 2. P5.1 — Ma trận quyết định cho từng L4

| ID ứng viên | Quyết định đề xuất | Lý do và ranh giới | Tác động đến test | Mức chắc chắn |
|---|---|---|---|---|
| `F01-G04-M01-001` | **KEEP** | Quyết định quyền theo actor/action/resource/purpose/scope là kết quả độc lập. Giữ nguyên ID minh họa, không mặc nhiên nâng lên APPROVED. | A01–A08 là lõi; cần bổ sung case purpose mismatch, scope escalation, race, policy/consent version | CAO về ranh giới; THẤP về quyền pháp lý |
| `CAND-F01-G04-M01-effective-access-preview` | **DEFER** (ưu tiên gộp khi chưa có bằng chứng giá trị riêng) | Có thể chỉ là màn hình/tổng hợp kết quả policy; khác biệt UX hoặc metadata-view permission **chưa đủ** chứng minh L4 độc lập. Nếu user research xác nhận người dùng cần kết quả quản trị quyền độc lập, giữ thành L4 sau. | A09–A10 giữ như kiểm thử chức năng hiển thị/metadata của Access Policy; nếu tách phải có outcome/UC riêng | TRUNG BÌNH |
| `CAND-F01-G04-M01-policy-conflict-review` | **MOVE/DEFER** | F01 sở hữu quyết định quyền và trạng thái chính sách; vòng đời hồ sơ tranh chấp của operator có thể thuộc F07-G07 Operational Controls. **Không được tự kết luận F07-G07-M01 là owner canonical của case**: module hiện là Operational Console, chưa mô tả đầy đủ case management. Đề nghị workflow F01 quyết định `INDETERMINATE` → operator có quyền xử lý; owner case `OWNERSHIP_UNKNOWN`. | A11–A12 chuyển thành workflow/security tests chờ chốt owner; không cấp ID L4 mới | TRUNG BÌNH về trùng ranh giới; THẤP về owner đích |
| `CAND-F06-G07-M01-rubric-eligibility` | **MERGE** vào `assess-submission` dưới dạng tiền điều kiện/kiểm tra đầu vào | Kết quả `ELIGIBLE` chủ yếu là điều kiện chấm, chưa có actor/workflow/giá trị độc lập. **Không gộp rubric source/provenance của F07 vào F06**; F06 vẫn sở hữu áp dụng rubric vào bài, F07 xác minh nguồn tri thức. Nếu rubric eligibility cần publish/review riêng thì mở lại quyết định. | B01–B04 giữ như test tiền điều kiện, version pinning; không xóa test | CAO về hành vi kiểm đầu vào; TRUNG BÌNH về ranh giới nguồn rubric |
| `CAND-F06-G07-M01-assess-submission` | **KEEP** | Trả kết quả đánh giá tạm hoặc không thể đánh giá có provenance, không đồng nhất với bài nộp hay giáo viên xác nhận (L3C-02). | B01–B11 là các nhánh; B05/B06 chỉ là test logic giả lập, **không chứng minh AI/vision đủ chất lượng** | CAO về owner; THẤP về feasibility AI |
| `CAND-F06-G07-M01-review-uncertainty` | **KEEP có điều kiện** | Kết quả độc lập là **hồ sơ review với trạng thái và người được ủy quyền**, không chỉ một nhánh `if confidence low`. Nếu sản phẩm không có vòng đời review riêng thì gộp vào đánh giá. | B12–B13 chưa đủ: thêm reviewer handoff, hết hạn, hủy, retry, tránh lộ bằng chứng | TRUNG BÌNH |
| `CAND-F06-G07-M01-correct-assessment` | **KEEP** | Thay đổi kết quả có quyền ghi, audit/version và người chịu trách nhiệm riêng; F06-G05 vẫn sở hữu phát hành báo cáo. | B14–B15 là lõi; B16 là test workflow report, **không phải acceptance riêng của chức năng sửa** | CAO về ranh giới; THẤP về policy reviewer |
| `CAND-F04-G02-M03-validate-balance` | **KEEP** | Đánh giá tải hoạt động và hard/soft/leisure theo Standard Bar có kết quả độc lập, không sửa lịch; phải phân biệt với F04-G02-M02 phát hiện trùng slot. | C01–C08 cần phân loại lại: C02/C05 có phần thuộc Conflict L3; định nghĩa lại thước đo occupied-time vs effort-load | CAO về ranh giới; THẤP về ngưỡng |
| `CAND-F04-G02-M03-evaluate-exception` | **KEEP** (mở rộng thành vòng đời **xác thực ngoại lệ**) | Đánh giá đề xuất ngoại lệ có thời hạn và kiểm lại hiệu lực khi hết hạn; **phê duyệt và commit vẫn thuộc F04-G06/F04-G02-M01**. Không đổi mục tiêu F03. | C09–C15 dùng làm hai trigger: tạo đề xuất và hết hạn; cần bổ sung sửa/hủy ngoại lệ và timezone | TRUNG BÌNH–CAO |
| `CAND-F04-G02-M03-expiry-recheck` | **MERGE** vào `evaluate-exception` như trigger theo thời gian và nhánh kiểm lại | Khác thời điểm kích hoạt chưa đủ thành một L4 độc lập; kết quả cùng thuộc trạng thái/hiệu lực ngoại lệ. Worker chạy lịch là implementation/workflow, không mặc nhiên là feature riêng. Nếu có vòng đời sản phẩm và owner riêng, review lại. | C13–C15 giữ như test nhánh expiry, idempotency và concurrent update | TRUNG BÌNH |

**Kết quả cấu trúc có điều kiện:** 6 KEEP = `F01-G04-M01-001`, `assess-submission`, `review-uncertainty`, `correct-assessment`, `validate-balance`, `evaluate-exception`. Các ID `CAND-` vẫn tạm thời. **Không được tự đổi tên/ID baseline, gán ID chính thức hoặc xóa các test của L4 bị gộp.**

## 3. Phản biện ba câu hỏi ban đầu

### P5-QA — Tranh chấp quyền F01 hay F07?

**Khuyến nghị:** F01-G04-M01 trả quyết định quyền, bao gồm `INDETERMINATE` khi chính sách xung đột. Workflow xử lý tranh chấp của operator là ứng viên ngoài ranh giới lõi Access Policy. F07-G07 có Operational Console/Audit, nhưng **chưa có bằng chứng đủ để xác nhận owner của toàn bộ hồ sơ tranh chấp**. Giữ `OWNERSHIP_UNKNOWN`, không tạo L4 F07 tùy tiện. F07-G06 kiểm soát purpose-bound data access, không thay F01 quyết định quan hệ gia đình/consent.

### P5-QB — Rubric eligibility có phải L4 riêng?

**Khuyến nghị:** Gộp vào đầu vào/validation của `assess-submission` trong pilot. Rubric cần đúng lớp, phiên bản, nguồn và phạm vi trước khi chấm. `F06-G07-M01` sở hữu kết quả đánh giá; `F07-G02` sở hữu xác minh nguồn/bằng chứng tri thức theo chức năng của mình. **Không** gộp hai domain chỉ vì chung chữ “rubric”. Mở lại nếu có quy trình xuất bản/đánh giá rubric như sản phẩm độc lập.

### P5-QC — Kiểm tra ngoại lệ và hết hạn có cần hai L4?

**Khuyến nghị:** Gộp thành **một L4 quản lý tính hợp lệ ngoại lệ theo vòng đời**, có ít nhất hai trigger: yêu cầu mới và sự kiện hết hạn. Một trigger định kỳ không tự động tạo feature mới. L4 này chỉ xác thực/trả findings và tạo yêu cầu; F04-G06 phê duyệt, F04-G02-M01 hoặc owner kế hoạch thực hiện commit được phép. Cần xác nhận canonical owner của ngoại lệ đã duyệt và dữ liệu Standard Bar trước P6.

## 4. P5.2 — Rà soát hợp đồng, dữ liệu, phân quyền, cohort và test

### 4.1 Những gì đã kiểm tra được từ tài liệu

- **ID:** 10 ứng viên khác nhau; `F01-G04-M01-001` giữ nguyên ID minh họa có trong 3.2; 9 ID `CAND-` không giả danh ID chính thức.
- **Test:** 43 ID duy nhất (A01–A12, B01–B16, C01–C15); kết quả thực thi đều `NOT_RUN`. Các test thuộc L4 gộp **được giữ** và gán lại cho outcome/luồng tương ứng.
- **Tuổi:** 60 dòng = 10 ứng viên × A0–A5. Đây là **ma trận phủ trường**, chưa phải sáu hợp đồng quyền pháp lý hoặc sáu bộ nghiệm thu đã xác minh. A0/A1 không chấm điểm trường học theo rubric; A5 không tự cấp quyền cho phụ huynh.
- **Workflow:** `UC-007/010` hỗ trợ kế hoạch/xung đột, `UC-002/013/015` hỗ trợ quyền và dữ liệu; **3.4 chưa có UC học tập đánh giá chi tiết** cho F06-G07, nên không được gán UC hiện hữu làm đặc tả hoàn chỉnh.
- **AI:** E0/E1 cho policy/constraint; chấm ảnh/đánh giá AI chưa có benchmark tiếng Việt và không thể đánh dấu PASS.
- **Quyền:** `DENY` khi chưa rõ quyền; phải kiểm quyền trước protected retrieval/cache/model và **kiểm lại trước mutation**. Người trả phí không mặc nhiên đọc Journal.

### 4.2 Các lỗi và khoảng trống phát hiện

| Mã | Mức | Vấn đề | Đề nghị sửa ở vòng tiếp |
|---|---|---|---|
| P5-F01 | HIGH | Pilot viện dẫn `L3C-03` như hợp đồng owner Access Policy; thực tế 3.2 ghi **F05 ↔ F07 Journal/insight riêng tư** | Dùng 3.2 §5 (F01 Identity/Consent) và `L3C-03` **chỉ cho ranh giới Journal**; không sửa canonical |
| P5-F02 | HIGH | Đường phụ thuộc `F04-G02-M03 → F04-G02-M01` bị mô tả như owner của **toàn bộ plan state**; 3.4 xác định `F04-G01` là owner plan baseline, G02 xử lý lịch/constraint | Tách plan baseline F04-G01, schedule F04-G02, approval F04-G06; chưa xác minh physical data model |
| P5-F03 | HIGH | Pilot gán `F03-G04` là owner của **mọi Standard Bar**; 3.2 chỉ xác nhận F03 sở hữu mục tiêu/taxonomy và F04 sở hữu cân bằng lịch/ngoại lệ | Tách goal constraints vs family-configured planning bar; owner bản ghi Standard Bar **cần xác nhận**, không tự gán F03 |
| P5-F04 | HIGH | 3.4 ghi chỉ coi dependency là HARD khi xác nhận theo `MR-040`, nhưng Master Backlog v1.2 **không tìm thấy MR-040**; 3.3 vẫn dùng baseline 49 groups/98 L3 trước revision 3.2-R1 | Ghi `TRACE_UNRESOLVED` cho MR-040; đồng bộ phiên bản 3.3 ở workstream riêng, không sửa lén |
| P5-F05 | HIGH | 60 dòng cohort phần lớn kế thừa template, chưa có đủ actor/action/resource/purpose/approval, alternate flow riêng cho từng L4; `CONDITIONAL` không đồng nghĩa hợp pháp | Tạo bảng quyết định quyền theo từng L4 × cohort × actor/mode/purpose khi có bằng chứng MR-016/017 |
| P5-F06 | HIGH | 43 test không đồng nghĩa test đủ: preview 2, policy-conflict 2, uncertainty 2; thiếu state transition và quyền trong các nhánh này | Bổ sung test ở `P5_Test_Gap_Register`, không tự đánh dấu PASS |
| P5-F07 | HIGH | C02 trộn `occupied wall-clock time` với `effort load`; C05 có thể kiểm trùng slot vốn thuộc F04-G02-M02 | Định nghĩa metric và ownership trước khi dùng kết quả test làm acceptance |
| P5-F08 | HIGH | B05/B06 chỉ kiểm phép tính giả lập, không kiểm chất lượng AI chấm chữ viết tay tiếng Việt; B11 không bảo đảm provider hỗ trợ idempotency/billing | Đặt `AI_EVAL_REQUIRED`; cần benchmark, lỗi, cost cap và provider policy |
| P5-F09 | HIGH | Chưa có state machine cho policy conflict, assessment review/correction, ngoại lệ; thiếu ownership của bản ghi đã duyệt và quy tắc concurrent edits | Bổ sung state/actor/transition/rollback trước P6 |
| P5-F10 | MEDIUM | Truy vết các MR của assessment còn thiếu mục nghiên cứu **rubric/đánh giá học thuật chuyên biệt**; không thể dùng MR-023 về safety AI chung làm bằng chứng đủ | Đề xuất bổ sung câu hỏi vào Master Backlog qua quy trình riêng; không tự tạo MR-ID |
| P5-F11 | MEDIUM | `F01-G04-M01-effective-access-preview` có thể là UI của Access Policy, không có UC riêng chứng minh nhu cầu | DEFER tách; bổ sung user story, outcome, frequency và permission before promotion |
| P5-F12 | HIGH | 3.2 yêu cầu L4 override đánh giá L3 khi có AI/dữ liệu nhạy cảm/permission/cohort; pilot còn dùng nhận định E0/E1 và cost Low quá rộng | Mỗi L4 cần `execution_type`, `ai_cost_risk`, `data_classification`, `gate` theo mục đích, có `UNKNOWN` rõ |

### 4.3 Đánh giá chất lượng test hiện có

| Module | Số test hiện có | Mức bao phủ ở thiết kế | Chưa chứng minh |
|---|---:|---|---|
| F01-G04-M01 | 12 | Quyền hợp lệ/không hợp lệ, thu hồi, A5, preview, xung đột | Matrix legal, cross-purpose authorization, no-enumeration property, nhiều policy version và race |
| F06-G07-M01 | 16 | Rubric giả lập, đúng/sai, unreadable, provider timeout, reviewer, concurrent edit | Rubric thực, đánh giá tiếng Việt, calibration, ngưỡng human review, teacher provenance, privacy/provider retention |
| F04-G02-M03 | 15 | Standard Bar giả lập, hard/soft, thời gian chơi, ngoại lệ, hết hạn | Thước đo tải hoạt động, timezone/DST/recurrence, xung đột với L3 khác, tác động thực tế lên trẻ, owner ngoại lệ |

**Điểm kiểm soát:** 43/43 test có *kết quả kỳ vọng được viết*, không phải kết quả được đo; không được suy ra tỷ lệ pass, độ bao phủ code, chất lượng AI hay tính hợp pháp.

## 5. Đánh giá P5 và đường sang P6

| Hạng mục | Trạng thái | Ý nghĩa |
|---|---|---|
| P5.1 Structural desk review | `COMPLETED_WITH_PROPOSALS` | Đã có disposition 10/10 L4; cần Product Owner quyết định |
| P5.2 Contract/test desk review | `COMPLETED_WITH_OPEN_GAPS` | Có danh sách thiếu và cách kiểm chứng; **không phải** chuyên gia đã xác nhận |
| Legal/privacy/safety/education/engineering sign-off | `NOT_PERFORMED` | Không được ghi PASS |
| P6 stable IDs/canonical diff | `NOT_STARTED` | Chỉ sau chốt ranh giới; không sửa canonical trong PR này |
| PR #17 | `DRAFT / OPEN` | Tài liệu review, không merge tự động |

**Điều kiện tối thiểu để đề xuất P6:** (a) chủ sản phẩm duyệt hoặc chỉnh sửa disposition 10 L4; (b) chốt owner các case tranh chấp, bản ghi ngoại lệ, Standard Bar; (c) làm rõ lỗ hổng acceptance, quyền và cohort ở mức *thiết kế*; (d) ghi research/legal/AI gates còn UNKNOWN, không tự biến chúng thành PASS. Chỉ khi người dùng phê duyệt riêng mới lập diff 3.2/3.3/3.4.

## 6. Quyết định cần chủ sản phẩm phản hồi

| ID | Câu hỏi | Đề xuất |
|---|---|---|
| `P5-Q1` | Chấp nhận **6 KEEP, 2 MERGE, 1 DEFER, 1 MOVE/DEFER** làm định hướng phân rã? | **A — Chấp nhận có điều kiện**, chưa cấp ID |
| `P5-Q2` | Với `effective-access-preview`, chưa có bằng chứng user value độc lập: giữ thành L4 riêng hay hoãn tách? | **A — Hoãn tách**, giữ hành vi hiển thị như một phần Access Policy; có thể mở lại |
| `P5-Q3` | Hồ sơ tranh chấp quyền: tự chọn F07 owner hay để `OWNERSHIP_UNKNOWN` đến khi kiểm ranh giới F01/F07? | **A — Để UNKNOWN**, không tự tạo L4 mới |
| `P5-Q4` | Gộp rubric eligibility vào assessment, giữ human-review/correction riêng nếu có lifecycle? | **A — Đồng ý có điều kiện** |
| `P5-Q5` | Gộp expiry-recheck vào vòng đời validation ngoại lệ; approval/commit do owner khác thực hiện? | **A — Đồng ý** |
| `P5-Q6` | Có cho phép bước tiếp theo **chỉnh bản nháp hợp đồng/test** theo issue, vẫn không sửa canonical hoặc cấp ID chính thức? | **A — Có**, làm P5 remediation trước P6 |

**Khuyến nghị:** Chốt P5-Q1..Q6 trước khi chuyển P6. Nếu chọn A cho cả sáu, P5 tiếp tục vòng remediation với test gap và quyền/cohort còn UNKNOWN; không coi các blocker pháp lý, giáo dục, an toàn đã được giải quyết.
