# 05 — Phân tích độ nhạy và độ bền (Phase E)

**Loại:** `SELF_AUDIT / PROPOSAL` · **Người soạn:** AI (Claude, Opus 5.5), tự rà soát lượt chấm của chính mình, chưa kiểm chứng độc lập · **Nguồn:** HEAD `9043c88`; baseline đóng băng `baseline_v1/` (SHA256SUMS) · **Cần Owner duyệt:** mọi thay đổi đề xuất

**Dữ liệu:** `data/phase_de.json`.
**Phương pháp:** phương pháp 3.3 **không có trọng số và không có điểm tổng** (Q3). Vì vậy dùng **quy tắc sắp xếp theo thứ tự ưu tiên** cho từng kịch bản, chỉ để phân tích, không tạo điểm chính thức. Hard Gate giữ nguyên trong mọi kịch bản; UNKNOWN là chưa giải quyết.
- **Tập được xếp hạng:** 39 module FULL không thuộc nền tảng.
- **Giữ ngoài xếp hạng vì G-Legal BLOCKED:** F05-G01-M01, F05-G04-M01.
- **Module nền tảng (MIN_FOUNDATION):** luôn bắt buộc theo workflow, không xếp hạng, để không bị thiệt vì chỉ có giá trị gián tiếp.

## 1. Kịch bản

| Kịch bản | Quy tắc sắp xếp |
|---|---|
| Value-oriented | Giá trị cao nhất ở A2/A3 (phụ huynh hoặc trẻ) ↓, core_loop ↓, adoption ↓ |
| Cost-constrained | Build ↑, Run ↑, Change ↑ (mức L/M/H), rồi giá trị ↓ |
| Dependency-constrained | Số module phải thêm ngoài nền tảng chung (bao đóng HARD, trừ lõi định danh/phân quyền/lifecycle) ↑, rồi giá trị ↓ |

Độ ổn định: nằm trong top-15 ở cả 3 kịch bản = STABLE_HIGH; ở 2 = MODERATE; ở 1 = VOLATILE; ở 0 = STABLE_LOW.

## 2. Ma trận ổn định ưu tiên

| Phân bố | Baseline v1 | Sau sửa của Phase A (đề xuất) |
|---|---|---|
| STABLE_HIGH | 1 | 2 |
| MODERATE | 11 | 11 |
| VOLATILE | 20 | 17 |
| STABLE_LOW | 7 | 9 |

| L3 | Baseline v1 | Sau sửa | Value | Cost | Dependency |
|---|---|---|---|---|---|
| `F02-G01-M01` | MODERATE | STABLE_HIGH | 12 | 5 | 2 |
| `F02-G05-M02` | STABLE_HIGH | STABLE_HIGH | 10 | 1 | 1 |
| `F02-G02-M01` | MODERATE | MODERATE | 22 | 6 | 3 |
| `F03-G04-M01` | MODERATE | MODERATE | 15 | 27 | 4 |
| `F04-G01-M02` | MODERATE | MODERATE | 7 | 24 | 14 |
| `F04-G02-M02` | MODERATE | MODERATE | 20 | 9 | 5 |
| `F04-G03-M01` | MODERATE | MODERATE | 11 | 10 | 18 |
| `F04-G03-M02` | VOLATILE | MODERATE | 25 | 11 | 6 |
| `F04-G04-M01` | MODERATE | MODERATE | 2 | 2 | 22 |
| `F04-G05-M01` | MODERATE | MODERATE | 3 | 3 | 24 |
| `F04-G07-M02` | MODERATE | MODERATE | 27 | 13 | 7 |
| `F05-G02-M01` | MODERATE | MODERATE | 14 | 33 | 8 |
| `F06-G05-M02` | MODERATE | MODERATE | 5 | 4 | 35 |
| `F02-G01-M02` | VOLATILE | VOLATILE | 21 | 26 | 15 |
| `F02-G03-M02` | VOLATILE | VOLATILE | 39 | 37 | 9 |
| `F02-G05-M01` | STABLE_LOW | VOLATILE | 19 | 7 | 17 |
| `F03-G03-M01` | VOLATILE | VOLATILE | 36 | 30 | 10 |
| `F03-G05-M01` | VOLATILE | VOLATILE | 8 | 39 | 37 |
| `F03-G05-M02` | VOLATILE | VOLATILE | 24 | 8 | 38 |
| `F04-G01-M01` | VOLATILE | VOLATILE | 32 | 31 | 11 |
| `F04-G02-M01` | VOLATILE | VOLATILE | 1 | 38 | 29 |
| `F04-G02-M03` | VOLATILE | VOLATILE | 6 | 25 | 21 |
| `F04-G04-M02` | VOLATILE | VOLATILE | 13 | 28 | 26 |
| `F04-G05-M02` | VOLATILE | VOLATILE | 26 | 12 | 27 |
| `F04-G06-M01` | VOLATILE | VOLATILE | 9 | 35 | 30 |
| `F04-G07-M01` | VOLATILE | VOLATILE | 4 | 32 | 25 |
| `F05-G02-M02` | VOLATILE | VOLATILE | 28 | 14 | 19 |
| `F05-G03-M02` | VOLATILE | VOLATILE | 29 | 15 | 28 |
| `F06-G01-M02` | VOLATILE | VOLATILE | 37 | 20 | 12 |
| `F06-G05-M01` | VOLATILE | VOLATILE | 38 | 23 | 13 |
| `F02-G03-M01` | STABLE_LOW | STABLE_LOW | 23 | 36 | 16 |
| `F04-G06-M02` | VOLATILE | STABLE_LOW | 31 | 18 | 20 |
| `F05-G03-M01` | STABLE_LOW | STABLE_LOW | 16 | 29 | 23 |
| `F06-G01-M01` | STABLE_LOW | STABLE_LOW | 33 | 19 | 31 |
| `F06-G02-M01` | STABLE_LOW | STABLE_LOW | 34 | 21 | 32 |
| `F06-G02-M02` | VOLATILE | STABLE_LOW | 30 | 16 | 33 |
| `F06-G04-M01` | STABLE_LOW | STABLE_LOW | 35 | 22 | 34 |
| `F06-G06-M01` | VOLATILE | STABLE_LOW | 17 | 17 | 36 |
| `F06-G06-M02` | STABLE_LOW | STABLE_LOW | 18 | 34 | 39 |

## 3. Phát hiện

1. **Ưu tiên ở mức module rất không ổn định.** Chỉ 2 module STABLE_HIGH (F02-G01-M01, F02-G05-M02), còn 17 module VOLATILE. Điều này củng cố nguyên tắc: **chọn MVP theo workflow, không theo điểm từng module.**
2. **`F04-G02-M01` đứng đầu kịch bản Value nhưng tụt ở Cost và Dependency** (Build H). Đây là module "đắt mà đáng" điển hình. Quyết định nên dựa trên spike kỹ thuật (CU-01), không dựa trên điểm.
3. **Các sửa đổi của Phase A làm 6 module đổi nhóm ổn định**, trong đó Intake (`F02-G01-M01`) lên STABLE_HIGH. Kết quả nhạy với chính những sửa đổi cần Owner duyệt.
4. **`F02-G05-M02` STABLE_HIGH phần lớn là ảo.** Baseline chấm module này theo phạm vi sai (phản hồi về việc, trong khi phạm vi thật là trẻ xem và đề nghị sửa hiểu biết về mình). Nó đứng cao vì rẻ và ít phụ thuộc, không phải vì đã chứng minh được giá trị.
5. **Độ khả thi của workflow qua các kịch bản:**

| Workflow | Value | Cost | Dependency | Blocker |
|---|---|---|---|---|
| A-lite v2 (corrected) | FEASIBLE | FEASIBLE (0 AI run cost) | FEASIBLE (29 modules, 12 minimal, no AI gate) | H4/lawful basis before real data |
| W1 (E2 schedule) | FEASIBLE | FEASIBLE with Haiku; sensitive to model choice | CONDITIONAL (+AI gate, static catalog, eval) | H4; OD-05; MR-023/026 |
| W2 (parent Pal) | CONDITIONAL (approved KB needed) | FEASIBLE with Haiku; H if Sonnet | NOT_FEASIBLE now (0 approved knowledge items) | KB review, GAP-16 ownership, H4 |
| W3 (child voice) | CONDITIONAL | MODERATE | NOT_FEASIBLE (9 legally blocked modules) | FR-03, H4, PIA |

**A-lite v2 là workflow duy nhất khả thi ở cả 3 kịch bản.** Đây là độ bền về **cấu trúc**, không chứng minh product-market fit.

## 4. Sổ giả định then chốt

| # | Giả định | Nếu sai thì | Nghiên cứu |
|---|---|---|---|
| CA-01 | Trẻ A2–A3 tự mở app và đánh dấu xong | Giá trị phía trẻ của A-lite sụp; còn lại planner cho phụ huynh | MR-007 |
| CA-02 | Phụ huynh thấy lịch cân bằng có ích và bớt phải nhắc | Toàn bộ đề xuất giá trị lõi | MR-001, MR-002 |
| CA-03 | Viết được thuật toán xếp lịch E1 đạt chất lượng gần prototype LLM | Phải giữ E2 → kéo theo gói AI | MR-025 |
| CA-04 | 3 lựa chọn mệt là đủ, không gây áp lực | Kênh phản hồi bị bỏ, hoặc gây hại | MR-009, MR-031 |
| CA-05 | Pilot chỉ gồm gia đình một hộ | Cần ghép khác hộ (FR-01) | MR-017 |
| CA-06 | Dữ liệu giả lập đủ để học trước khi H4 đóng | Không học được hành vi thật | MR-016, MR-018 |
| CA-07 | Ngưỡng quỹ thời gian có nguồn được chuyên gia chấp nhận | Phải sửa sàn và ngưỡng | MR-012 |

## 5. Ưu tiên nghiên cứu

1. Spike kỹ thuật thuật toán xếp lịch E1 (CA-03).
2. Thử với người dùng hành vi của trẻ và phụ huynh (CA-01, CA-02), dùng dữ liệu giả lập hoặc thử nghiệm không định danh.
3. Pháp lý H4 và MR-016 (CA-06).
4. Chuyên gia duyệt ngưỡng (CA-07).

## 6. Mức sẵn sàng cho quyết định MVP

**`READY_WITH_CONDITIONS` cho Adversarial MVP Review, không phải cho quyết định phát triển.** Chi tiết ở `06_MVP_Readiness_Summary.md`.

**Độ tin cậy:** HYPOTHESIS (quy tắc sắp xếp chỉ là công cụ phân tích). **Cần Owner duyệt:** không. Đây là phân tích, không phải quyết định.
