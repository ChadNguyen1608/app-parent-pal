# 06 — Báo cáo thực thi và chất lượng (3.3 scoring)

**Ngày:** 14/11/2026 (UTC) · **Người chạy:** AI (Claude, model Opus 5.5), chưa kiểm chứng độc lập · **Prompt:** "MASTER EXECUTION PROMPT v2 (funnel)", được Owner duyệt trong hội thoại.

## 1. Nguồn

| Mục | Giá trị |
|---|---|
| HEAD | `9043c88ecc4c945ff23e207e0b3c4db521ef6e3b`. Kiểm lại ở CP-01, trước CP-04 và trước khi xuất bản: **không đổi** |
| Blob nguồn | 67 file, ghi ở `00_Source_Authority_Manifest.md` và `data/source_manifest.json` |
| Pin của Remediation Register | 9/9 khớp với HEAD |
| `SOURCE_STALE` / `OWNER_CONFLICT` | Không có |

## 2. Agent, model và skill thực tế

| Hạng mục | Thực tế |
|---|---|
| Điều phối và chấm điểm | Claude (Opus 5.5), một người chấm |
| Subagent | **1**, loại general-purpose, yêu cầu model "sonnet". Agent tự báo cáo là **Sonnet 5.5 (`claude-sonnet-5-5`)**. Môi trường không cho xác minh độc lập chuỗi phiên bản |
| Phạm vi subagent | QA "mù" 8 module Tier-3 bằng rubric R1.1, chỉ đọc. Không đọc dữ liệu chấm của tôi. Chỉ ghi `work/qa_agent_scores.json` |
| Skill | **Không dùng skill nào.** Không có skill sẵn có nào phù hợp với việc chấm ưu tiên hay phân tích phụ thuộc. Không cài skill ngoài |
| Tra web | 2 lần: giá Claude API, tỷ giá USD/VND (dùng cho CP-05) |

## 3. Checkpoint

| CP | Kết quả gate | Số đếm chính |
|---|---|---|
| CP-01 | PASS | 106 L3 / 51 group; domain khớp; 67 nguồn; rubric R1.0 |
| CP-02 | PASS | 106 bản ghi COARSE; hiệu chuẩn 8 module, 7 phát hiện → R1.1 |
| CP-03 | PASS | 95 cạnh (951 sau khi mở rộng gói); 0 vòng build; 1 cụm vòng lúc chạy (lõi định danh); 4 workflow; Tier-3 = 66; 1 module được đưa vào lại |
| CP-04 | PASS | 66 FULL, 40 COARSE. Trạng thái: scored 57, blocked 9, partial 40. QA độc lập: 120 phép so sánh |
| CP-05 | PASS | 5 hành động E2 × 3 kịch bản; 16 khoảng trống bằng chứng (3 MR đề xuất); 8 kịch bản độ nhạy |
| CP-06 | PASS, có điều kiện (xem §6) | 3 gói (A, có A-lite; B; C có điều kiện) |

Trạng thái từng bước: `work/state.jsonl`.

## 4. Thay đổi rubric

- **R1.0 → R1.1 (hiệu chuẩn CP-02):** 7 phát hiện CAL-01..07 (`01_Method_Rubric_and_Calibration_REVIEW.md` §8). Chính: thêm nhãn `INDIRECT`; adoption đo theo khả năng dùng đúng cách; tách `core_loop` khỏi `enablement`; module DEFERRED giữ COARSE.
- **R1.1 → R1.1a (đối chiếu QA ở CP-04):**
  - Module chỉ tính toán, không có giao diện riêng (F06-G02-M01, F06-G04-M01) ghi `INDIRECT`; giá trị của chúng thể hiện qua module báo cáo.
  - Check-in thuộc về trẻ (F05-G02-M01): giá trị cho phụ huynh ghi `INDIRECT`.
  - Nâng `implementation_complexity`: Intake 2 → 3, Check-in 2 → 3, Consent Ledger 3 → 4.

## 5. Kết quả QA độc lập (1 subagent)

| | EXACT | ADJACENT (lệch 1 mức) | LABEL_MISMATCH | DIVERGENT |
|---|---|---|---|---|
| Trước đối chiếu | 63 | 37 | 16 | 4 |
| Sau đối chiếu | 68 | 40 | 11 | 1 |

- **Lệch chủ yếu ở hai chỗ:** cách dùng nhãn `INDIRECT`, và độ phức tạp của module có dữ liệu trẻ. Subagent cũng nêu 6 chỗ rubric còn mơ hồ.
- **Giới hạn:**
  - Với 4 module, subagent chủ yếu chấm theo tên module, vì bản tóm tắt L4 tôi tạo bị trống ở các module không có mục riêng.
  - Việc đối chiếu do chính tôi làm. Số "sau đối chiếu" vì vậy **không phải** kết quả độc lập. Số "trước đối chiếu" mới là con số độc lập.

## 6. Cổng chất lượng cuối

`tools/quality_gate.py`: 25/25 PASS (`data/quality_gate_results.json`). Các mục đã kiểm gồm:
- đủ 106 module, không ID bịa hoặc thiếu, đủ 8 domain;
- 0 gate PASS; `mvp_decision` = NOT_DECIDED ở mọi bản ghi;
- đủ 6 cohort, mọi ô N/A có lý do;
- lý do cho mọi điểm FULL; không có điểm tổng;
- số liệu Markdown khớp với dữ liệu (sổ đánh giá, gói, bảng chi phí);
- 0 vòng build; cạnh HARD đều có lý do; không cạnh nào bị ghi sai là CONFIRMED;
- không có khóa hay email; không tuyên bố tuân thủ pháp lý hay đã chạy hồi quy L4.

**Lý do kết quả vẫn "có điều kiện", dù đủ 106 dòng:**
1. Mọi điểm là `EXPERT_HYPOTHESIS` của một người chấm (AI). Chưa có nghiên cứu người dùng và chưa hiệu chuẩn với chuyên gia (MR-039).
2. 40 module chỉ có mức COARSE.
3. 4 module nền chưa từng được kiểm độc lập; độ tin cậy giới hạn ở LOW.
4. Đặc tả L4 là bản do tác giả tự khắc phục, không có kiểm hồi quy độc lập (theo quyết định của Owner).
5. Gate pháp lý H4 và FR-03 còn mở; không gate nào PASS.
6. Chi phí AI chỉ là kịch bản; chi phí chuyên gia, pháp lý và nội dung là `UNKNOWN`.

## 7. Lệnh đã chạy và kết quả

| Lệnh (trong `phase-3-scoring-review/`) | Kết quả |
|---|---|
| `python3 -I tools/inventory.py` | 106 / 51; domain khớp; `pass=true` |
| `python3 -I tools/manifest.py` (từ gốc repo) | 67 nguồn; 9/9 pin khớp |
| `python3 -I tools/build_tier1.py` | 106 bản ghi, 0 lỗi |
| `python3 -I tools/graph.py` | 0 lỗi; 0 vòng build; Tier-3 66 |
| `python3 -I tools/build_registry.py` | 0 lỗi, 0 cảnh báo |
| `python3 -I tools/cost_model.py` | Bảng chi phí ở `data/cost_scenarios.json` |
| `python3 -I tools/package_stats.py` | `data/packages.json` |
| `python3 -I tools/gen_registry_md.py` | `02_...md` sinh từ dữ liệu |
| `python3 -I tools/quality_gate.py` | 25/25 PASS |

**Phần viết tay:** phần mô tả của `03_Dependency_and_Workflow_Analysis_REVIEW.md` §1–7 viết tay. Các bảng §8–10 được sinh từ dữ liệu.

## 8. Ranh giới tuân thủ

- **Không** commit, push, merge PR #17 hay sửa Blueprint canonical.
- **Không** sửa Owner Decision Log hay Research Backlog. 3 MR mới chỉ ghi là đề xuất trong file 04.
- **Không** dùng dữ liệu thật của trẻ, không chạy app, không tạo tài khoản, không phát sinh chi phí dịch vụ.
- **Không** chạy review hồi quy L4.
- **Không** chọn MVP thay Owner.
- Mọi file mới nằm trong `documents/app-design-document/phase-3-scoring-review/`, chỉ ở working tree, chưa commit.

## 9. Bất định còn lại

GAP-01..16 (file 04 §3). Quan trọng nhất:
- H4 / FR-03 (pháp lý);
- kho tri thức chưa được duyệt (ảnh hưởng gói B);
- MR-007 (trẻ có tự dùng không);
- chất lượng AI tiếng Việt;
- GAP-16: inventory chưa có L3 riêng cho hội thoại Pal với phụ huynh.
