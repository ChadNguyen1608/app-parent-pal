# Parent-Pal — P6: Tổng hợp ba pilot và phương án mở rộng L4

**Ngày lập:** 2026-11-12  
**Trạng thái:** `P6_THREE_PILOTS_EXECUTED / CONDITIONAL_METHOD_ROLLOUT_OWNER_ACCEPTED / FOLLOWUP_GATES_PENDING`  
**Phạm vi:** Thẩm định **phương pháp phân rã + phản biện L4**, không chứng nhận chất lượng sản phẩm, app integration, quy chuẩn giáo dục/y tế, hay phê duyệt chi tiết mọi L4 ứng viên.

## 1. Kết quả ba pilot (theo hồ sơ Claude Code do Product Owner cung cấp)

| Pilot / L3 | L4 ứng viên | Test thiết kế mới | Baseline P5 fully equivalent | Partial equivalent | Owner decisions |
|---|---:|---:|---:|---:|---|
| Access Policy / `F01-G04-M01` | 4 | 67 | 19/19 | 0/19 | OQ-1..5 chốt |
| Academic Assessment / `F06-G07-M01` | 4 | 55 | 16/19 | 3/19 | OQ-2A..D chốt |
| Balanced Planning / `F04-G02-M03` | 3 | 59 | 20/26 | 6/26 | OQ-3A..C chốt |
| **Tổng (không thay P5 baseline)** | **11** | **181** | **55/64** | **9/64** | **12 quyết định** |

**Lưu ý về mẫu:** 64 test P5 = 19 Access, 19 Academic, 26 Balanced, và vẫn là baseline được Owner chấp thuận. 181 test pilot là đề xuất bổ sung/phân rã, **chưa được Owner chuẩn hóa từng test**. Tỷ lệ full/partial là **đánh giá tương đương về đặc tả bởi agent**, không phải số test app đã chạy.

### Bằng chứng và hạn chế

- Pilot 1 ZIP: `P6_F01-G04-M01.zip`; Pilot 2+3 ZIP: `P6_Pilot_2_3_All.zip`. Bản báo cáo/trace do Claude Code xuất và Product Owner cung cấp; **chưa có kiểm toán độc lập của provider**, ZIP chưa được đưa vào GitHub trong thay đổi này.
- Pilot 1: 43 findings (25 fixed, 12 owner, 4 research, 2 deferred), có cảnh báo validator về enum `OWNERSHIP_UNKNOWN` được báo cáo ở vòng cuối.
- Pilot 2: 9 fixed, 9 owner, 4 research, 1 open; Validator cuối tự báo 0 lỗi/0 cảnh báo; F-023 trace incomplete.
- Pilot 3: 11 fixed, 5 owner, 4 research, 1 open; Validator cuối tự báo 0 lỗi/0 cảnh báo; F-021 duplicate proposal/idempotency.
- Chưa có kiểm thử ứng dụng, benchmark AI chấm bài theo chuyên gia hoặc xác minh khoa học của Default Standard Bar. Không tự coi `CONDITIONAL_GO` của Claude là Owner method signoff.

## 2. Đã quyết định ở mức Owner

- **Access:** `P6-AP-OD-01..05` — một Primary Caregiver/family với plan scope controls, quyền chia sẻ, handover, người trưởng thành tự quản, Child-directed delegation.
- **Academic:** `P6-AA-OD-01..04` — parent confirmation tại nhà, AI hints thay lời giải trực tiếp, AI recheck rồi parent nếu còn tranh chấp, cần mô hình chi phí.
- **Balanced:** `P6-BP-OD-01..03` — anti-purpose switching same-constraint 60-day continuity, không vượt protected hard-cap, App Default Standard Bar có nguồn/phiên bản.

Không hỏi lại 12 quyết định; chỉ xin Owner lựa chọn có mở batch design review cho 103 L3 còn lại hay không.

## 3. Các gate cần khắc phục và phân nhóm

| Gate | Điều kiện | Hiện trạng |
|---|---|---|
| `G-01` — Baseline | Mapping 64 P5 test rõ, partial phải gắn reason | 55 full + 9 partial — **còn cần giải thích và tiêu chí xử lý 9 partial** |
| `G-02` — Critical design | Không còn vấn đề Critical/High chưa xử lý khi tạo output accepted | Cần xác minh từ bản final và Owner Decisions đã ghi |
| `G-03` — Deterministic checks | Validator pass và issue identifier đúng schema | Access warning `OWNERSHIP_UNKNOWN` chưa đóng; Academic F-023 và Balanced F-021 còn mở |
| `G-04` — Agent independence | QA-first, Architect tách lượt, Reviewer có output riêng, log/disagreement | Theo ZIP có bằng chứng báo cáo; vẫn chỉ là self-reported trace |
| `G-05` — Evidence/UNKNOWN | Các chuẩn giáo dục, an toàn, consent, chi phí chưa nghiên cứu giữ UNKNOWN | **Chưa chốt**, không cản phê duyệt *phương pháp có điều kiện* nhưng chặn production |
| `G-06` — Source version | Mỗi batch ghim version Blueprint/Owner Decisions và mapping | Khả thi bằng đọc PR #17; phải lưu commit SHA cho mỗi lần chạy |

**Owner đã đồng ý tiếp tục chuẩn bị các lần pilot còn lại sau khi được tư vấn hướng CONDITIONAL_GO. Diễn giải hẹp: cho phép xây dựng kế hoạch và thực hiện batch nhỏ có kiểm soát, KHÔNG phải nghiệm thu/đóng toàn bộ findings.**

**Không đóng findings chỉ vì Owner trả lời OQ.** Cần trace owner decision → finding → test/contract → re-review. Không dùng 181 test mới để thay baseline P5 khi chưa duyệt.

## 4. Đề xuất rollout sau P6

**Đề xuất: `CONDITIONAL_GO` cho batch nhỏ**, không `GO` vô điều kiện.

- Bắt đầu batch **3–5 L3**, dựa trên dependency graph và rủi ro; không tự triển khai cả 103 L3.
- Claude Code: tối đa **3 sub-agent** (QA, Architect, Reviewer), **Sonnet 5.5** nếu model khả dụng/đúng model ID, Coordinator ở phiên chính, Validator bằng code. Giới hạn context, vòng sửa, token/cost, báo thiếu model thay vì đổi sang model đắt hơn.
- Claude Code **chỉ đọc nguồn và chạy pilot/review**, xuất ZIP cục bộ ngoài repo; không commit/push/PR/sửa Decision Log, không merge.
- ChatGPT nhận ZIP, đối chiếu quyết định, phân loại issues, trình Owner và **chỉ ChatGPT quản lý tài liệu/Git** sau Owner confirmation.
- Với batch đầu, đưa vào regression các vấn đề Access/Academic/Balance liên quan, có audit trail và cross-module checks. Sau mỗi batch review Gate G-01..06, tăng quy mô nếu đạt.
- Dùng lựa chọn `GO` / `CONDITIONAL_GO` / `NO_GO` ở từng batch; dừng và xin Owner khi phát sinh quyết định nghiệp vụ mới hoặc critical finding.

## 5. Quyết định P6 còn lại

| ID | Câu hỏi | Khuyến nghị |
|---|---|---|
| `P6-METHOD-01` | Cho phép áp dụng phương pháp Claude Code QA-first → Architect → Reviewer → Validator → Owner Review để **thiết kế theo batch có điều kiện** cho 103 L3 còn lại? | **CONDITIONAL_GO**: bắt đầu 3–5 L3, kiểm tra gate mỗi batch, không tự chốt canonical/production |

**Trạng thái (2026-11-12):** Owner trả lời **“Được đồng ý”** và yêu cầu ghi dữ liệu, chuẩn bị các pilot còn lại sau đề xuất CONDITIONAL_GO. Ghi nhận **`P6_METHOD_APPROVED_CONDITIONAL` cho công tác chuẩn bị và batch nhỏ 3–5 L3**, với G-01..G-06 bắt buộc trước khi chấp nhận output. Không chấp thuận mở rộng toàn bộ 103 L3 trong một lượt, không chấp thuận canonical hay production. Nếu một blocker chưa xử lý gây nguy cơ sai hệ thống, dừng batch liên quan.

## 6. Các phần chưa làm

- Chưa lập danh sách chính thức L3 cụ thể của batch đầu vì cần đánh giá dependency và freshness của Inventory 106 L3/51 L2 group.
- Chưa chạy replay/test thực thi sau OQ; không tuyên bố ba pilot đã pass cuối.
- Chưa merge PR #17, chưa sửa Blueprint canonical, chưa cấp stable L4 IDs.
- PR #18 đóng và không dùng.

## 7. Change Log

- `P6-SUM-01`: tổng hợp 3 pilot và 12 Owner Decisions.
- `P6-SUM-02`: nêu 55/64 full, 9/64 partial, unresolved technical and evidence gates.
- `P6-SUM-03`: đề xuất pilot/batch nhỏ với Claude chỉ thực thi, ChatGPT quản lý tài liệu.
- `P6-SUM-04`: ghi Owner đồng ý CONDITIONAL_GO có giới hạn cho giai đoạn batch nhỏ, không coi là full signoff.
