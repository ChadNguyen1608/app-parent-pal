# 04 — Phân tích kinh tế triển khai (Phase D)

**Loại:** `SELF_AUDIT / PROPOSAL` · **Người soạn:** AI (Claude, Opus 5.5), tự rà soát lượt chấm của chính mình, chưa kiểm chứng độc lập · **Nguồn:** HEAD `9043c88`; baseline đóng băng `baseline_v1/` (SHA256SUMS) · **Cần Owner duyệt:** mọi thay đổi đề xuất

**Dữ liệu:** `data/phase_de.json` (script `tools/phase_de.py`); chi phí AI từ `baseline_v1/cost_scenarios.json` (giả định).
Ba chiều **Build / Run / Change được giữ riêng**. Không gộp thành một điểm, vì chưa có quy tắc gộp nào được duyệt.

## 1. Quy tắc phân mức (ánh xạ từ khóa 3.3, không phải điểm tổng)

- **Build:** H if effort>=4 or complexity>=4; M if effort=3 or complexity=3 or safety overhead H; else L; minimal-capability view lowers one level for MINIMAL targets
- **Run:** H if ai_cost_risk H; M if operating_cost H or ai M or scalability H or human ops; else L
- **Change:** H if maintenance>=4 or content/eval-bound core (F05-G01-M01, F07-G01-M01, F07-G04-M02); M if maintenance 3 or hard fan-in>=4 or content/eval/legal dependent; else L

Chi phí Build gồm: độ phức tạp kỹ thuật và tích hợp, dữ liệu, kiểm thử, an toàn, giao diện.
Chi phí Run gồm: token, tần suất gọi model, API, lưu trữ, job nền, giám sát, can thiệp của con người.
Chi phí Change gồm: sửa tính năng, cập nhật kho tri thức, prompt và bộ đánh giá, đổi model hoặc nhà cung cấp, thay đổi quyền riêng tư, nợ kỹ thuật, kiểm thử hồi quy, mức liên kết chéo giữa module.
Không có con số tiền nào ngoài kịch bản AI đã ghi giả định.

## 2. So sánh theo workflow (đếm số module theo mức, không cộng)

| Workflow | Module | Build L/M/H | Run L/M/H | Change L/M/H | AI VND/hộ/tháng (Base, giả định) | Build H | Change H |
|---|---|---|---|---|---|---|---|
| A-lite v1 (W1E1) | 24 | 12/6/6 | 22/2/0 | 11/13/0 | 0 | F01-G02-M01, F01-G04-M01, F01-G04-M02, F01-G06-M01, F07-G06-M01, F07-G06-M02 | — |
| A-lite v2 (corrected) | 29 | 20/6/3 | 27/2/0 | 14/15/0 | 0 | F01-G06-M01, F04-G02-M01, F07-G06-M02 | — |
| W1 (E2 schedule) | 32 | 14/9/9 | 24/8/0 | 11/17/4 | 3370 | F01-G02-M01, F01-G04-M01, F01-G04-M02, F01-G06-M01, F04-G02-M01, F07-G03-M01, F07-G04-M01, F07-G06-M01, F07-G06-M02 | F07-G01-M01, F07-G04-M01, F07-G04-M02, F07-G05-M01 |
| W2 (parent Pal) | 26 | 8/7/11 | 16/9/1 | 5/14/7 | 1106 | F01-G02-M01, F01-G04-M01, F01-G04-M02, F01-G06-M01, F03-G05-M01, F05-G01-M01, F05-G01-M02, F07-G03-M01, F07-G04-M01, F07-G06-M01, F07-G06-M02 | F03-G05-M01, F05-G01-M01, F05-G01-M02, F07-G01-M01, F07-G04-M01, F07-G04-M02, F07-G05-M01 |
| W3 (child voice) | 49 | 20/14/15 | 39/9/1 | 22/21/6 | 4345 | F01-G02-M01, F01-G04-M01, F01-G04-M02, F01-G06-M01, F04-G02-M01, F04-G06-M01, F05-G01-M01, F05-G01-M02, F05-G04-M01, F05-G06-M01, F05-G06-M02, F07-G03-M01, F07-G04-M01, F07-G06-M01, F07-G06-M02 | F05-G01-M01, F05-G01-M02, F07-G01-M01, F07-G04-M01, F07-G04-M02, F07-G05-M01 |

A-lite v2 tính theo góc nhìn năng lực tối thiểu (Phase B): module MINIMAL được hạ một mức Build, và F04-G02-M01 ở chế độ E1 nên AI = L. Các workflow khác tính theo baseline.

## 3. Yếu tố chi phí chính

1. **Viết lại phần xếp thứ tự trong ngày từ prompt LLM thành thuật toán E1** (`F04-G02-M01`, Build H). Đây là chi phí lớn nhất của A-lite v2, và chưa có thiết kế.
2. **Lõi định danh và phân quyền:** 4 module chưa từng được kiểm độc lập. Build giảm từ H xuống M nếu chỉ làm năng lực tối thiểu, nhưng chi phí Change ở mức M vì phụ thuộc văn bản pháp lý (MR-016).
3. **Xóa và lưu giữ** (`F01-G06-M01`, `F07-G06-M02`): Build H, phụ thuộc H4. Pilot dùng runbook thủ công.
4. **Mọi workflow có AI:** chi phí Change ở mức H nằm ở kho nội dung (F07-G01-M01), bộ đánh giá (F07-G04-M02), phạm vi OD-05 (F07-G04-M01) và quy tắc an toàn (F07-G05-M01). Với W2, 7 module có Change H, cao nhất trong các workflow.
5. **Run:** chi phí AI không quyết định việc chọn workflow nếu dùng model nhỏ (baseline CP-05). Rủi ro Run thật nằm ở công vận hành của con người: chuyên gia duyệt nội dung, runbook xóa.

## 4. Khuyến nghị LLM hay xác định (deterministic)

| Năng lực | Hiện trạng (prototype) | Khuyến nghị | Lý do |
|---|---|---|---|
| Xếp thứ tự trong ngày, xê dịch ±30 phút | LLM theo prompt `RULES` + bộ kiểm `checkDayK` | **E1** (thuật toán có ràng buộc) | Quy tắc đã viết rõ; SC-001 §5 ưu tiên E0/E1; kiểm chứng được |
| Kiểm quỹ thời gian, màu cảnh báo, tổng 24 giờ | JS (`judge`, `validBudget`) | **E0/E1** | Đã xác định sẵn |
| Tạo thẻ hoạt động từ lời kể | LLM | **E1 form** mặc định; E2 tùy chọn | Tiện, nhưng không bắt buộc |
| Giải thích trade-off | LLM | **Mẫu câu E1**; E2 tùy chọn | 3.4 UC-010 cho E2 là tùy chọn |
| Giai đoạn tạm thời, hết hạn | JS (`applyPeriod`, `checkPeriodExpiry`) | **E0** | Đã xác định sẵn |
| Tín hiệu mệt → giảm tải | Quy tắc spec §4 | **E1** | Đã xác định sẵn |
| Chấm bài qua ảnh | LLM thị giác | **E2, chỉ pilot** (SC-002-D05) | Chất lượng và chi phí cần benchmark |
| Pal hội thoại | LLM | E2 sau gói AI và OD-05 | Không thuộc A-lite |

## 5. Sổ bất định về chi phí

| # | Biến chưa biết | Ảnh hưởng | Cần gì |
|---|---|---|---|
| CU-01 | Công viết thuật toán xếp lịch E1 | Build A-lite | Spike kỹ thuật (MR-025) |
| CU-02 | Chi phí và năng lực chuyên gia duyệt nội dung | Run/Change W1-AI, W2 | Báo giá (đề xuất PMR-02) |
| CU-03 | Model tiếng Việt: Haiku có đủ không | Run W2 (khoảng 20×) | MR-026 |
| CU-04 | Độ tin cậy thông báo trên các dòng máy Android | Run/Build F04-G07-M01 | Test Plan A bước 2–5 |
| CU-05 | Công pháp lý (H4, MR-016) | Build/Change lõi | Nghiên cứu pháp lý |
| CU-06 | Giới hạn gói miễn phí Supabase ở quy mô pilot | Run | Kiểm hạn mức gói |
| CU-07 | Lưu trữ ảnh, nếu bật chụp ảnh | Run | Giả định 30 ngày (đề xuất nội bộ, Plan A) |

## 6. Ma trận kinh tế triển khai (66 module FULL)

| L3 | Tier | E | Build | Run | Change | Build (tối thiểu) | Trong A-lite v2 | Yếu tố |
|---|---|---|---|---|---|---|---|---|
| `F01-G01-M01` | MIN_FOUNDATION | E0 | L | L | M | L | ✓ | B: effort 2, complexity 2, safety M; R: ai L, op L, scale L; C: maint 2, fan-in 56 |
| `F01-G01-M02` | MIN_FOUNDATION | E0 | L | L | M | L | ✓ | B: effort 2, complexity 2, safety M; R: ai L, op L, scale L; C: maint 1, fan-in 55 |
| `F01-G02-M01` | MIN_FOUNDATION | E0 | H | L | M | M | ✓ | B: effort 3, complexity 4, safety H; R: ai L, op L, scale L; C: maint 2, fan-in 53 |
| `F01-G02-M02` | MIN_FOUNDATION | E0 | M | L | L | M |  | B: effort 2, complexity 3, safety M; R: ai L, op L, scale L; C: maint 2, fan-in 0 |
| `F01-G03-M01` | MIN_FOUNDATION | E0 | L | L | M | L | ✓ | B: effort 2, complexity 2, safety M; R: ai L, op L, scale L; C: maint 2, fan-in 54 |
| `F01-G04-M01` | MIN_FOUNDATION | E1 | H | L | M | M | ✓ | B: effort 4, complexity 5, safety H; R: ai L, op L, scale M; C: maint 3, fan-in 56; legal-text dependent |
| `F01-G04-M02` | MIN_FOUNDATION | E1 | H | L | M | M | ✓ | B: effort 3, complexity 4, safety H; R: ai L, op L, scale L; C: maint 3, fan-in 53; legal-text dependent |
| `F01-G05-M01` | MIN_FOUNDATION | E1 | M | L | M | L | ✓ | B: effort 2, complexity 3, safety M; R: ai L, op L, scale L; C: maint 2, fan-in 52 |
| `F01-G06-M01` | MIN_FOUNDATION | E0 | H | M | M | H | ✓ | B: effort 3, complexity 4, safety H; R: ai L, op L, scale L; human ops: manual deletion runbook (pilot); C: maint 2, fan-in 53; legal-text dependent |
| `F02-G01-M01` | CORE_VALUE | E1 | M | L | L | L | ✓ | B: effort 2, complexity 3, safety M; R: ai L, op L, scale L; C: maint 2, fan-in 3 |
| `F02-G01-M02` | CORE_VALUE | E1 | L | L | M | L |  | B: effort 2, complexity 2, safety M; R: ai L, op L, scale L; C: maint 3, fan-in 0 |
| `F02-G02-M01` | CORE_VALUE | E1 | L | L | L | L |  | B: effort 2, complexity 2, safety L; R: ai L, op L, scale L; C: maint 2, fan-in 0 |
| `F02-G03-M01` | DEFERRED | E1 | M | L | M | M |  | B: effort 3, complexity 3, safety H; R: ai L, op L, scale L; C: maint 3, fan-in 0 |
| `F02-G03-M02` | DEFERRED | E1 | M | L | M | M |  | B: effort 2, complexity 3, safety H; R: ai L, op L, scale L; C: maint 3, fan-in 1 |
| `F02-G05-M01` | CORE_VALUE | E1 | M | L | L | L |  | B: effort 3, complexity 3, safety M; R: ai L, op L, scale L; C: maint 2, fan-in 1 |
| `F02-G05-M02` | CORE_VALUE | E1 | L | L | L | L |  | B: effort 2, complexity 2, safety M; R: ai L, op L, scale L; C: maint 2, fan-in 0 |
| `F02-G06-M02` | MIN_FOUNDATION | E1 | L | L | L | L |  | B: effort 2, complexity 2, safety M; R: ai L, op L, scale L; C: maint 2, fan-in 0 |
| `F03-G03-M01` | CORE_VALUE | E1 | L | L | M | L |  | B: effort 2, complexity 2, safety M; R: ai L, op L, scale L; C: maint 3, fan-in 0; age tables |
| `F03-G04-M01` | CORE_VALUE | E1 | L | L | M | L |  | B: effort 2, complexity 2, safety M; R: ai L, op L, scale L; C: maint 3, fan-in 0 |
| `F03-G05-M01` | CORE_VALUE | E2 | H | M | H | H |  | B: effort 3, complexity 4, safety H; R: ai M, op L, scale M; C: maint 4, fan-in 1; retrieval/prompt/eval upkeep |
| `F03-G05-M02` | CORE_VALUE | E1 | L | L | L | L |  | B: effort 2, complexity 2, safety M; R: ai L, op L, scale L; C: maint 2, fan-in 0 |
| `F04-G01-M01` | CORE_VALUE | E1 | M | L | M | L | ✓ | B: effort 3, complexity 3, safety M; R: ai L, op L, scale L; C: maint 2, fan-in 5 |
| `F04-G01-M02` | CORE_VALUE | E1 | L | L | M | L | ✓ | B: effort 2, complexity 2, safety L; R: ai L, op L, scale L; C: maint 3, fan-in 0 |
| `F04-G02-M01` | CORE_VALUE | E2 | H | M | M | H | ✓ | B: effort 4, complexity 3, safety M; R: ai M, op L, scale M; C: maint 3, fan-in 0 |
| `F04-G02-M02` | CORE_VALUE | E1 | L | L | L | L | ✓ | B: effort 2, complexity 2, safety L; R: ai L, op L, scale L; C: maint 1, fan-in 0 |
| `F04-G02-M03` | CORE_VALUE | E1 | M | L | M | L | ✓ | B: effort 2, complexity 3, safety M; R: ai L, op L, scale L; C: maint 3, fan-in 2; sourced thresholds + Standard Bar policy |
| `F04-G03-M01` | CORE_VALUE | E1 | L | L | L | L | ✓ | B: effort 2, complexity 2, safety L; R: ai L, op L, scale L; C: maint 2, fan-in 3 |
| `F04-G03-M02` | CORE_VALUE | E1 | M | L | L | L | ✓ | B: effort 2, complexity 3, safety M; R: ai L, op L, scale L; C: maint 2, fan-in 1 |
| `F04-G04-M01` | CORE_VALUE | E1 | L | L | L | L | ✓ | B: effort 2, complexity 2, safety L; R: ai L, op L, scale L; C: maint 2, fan-in 3 |
| `F04-G04-M02` | CORE_VALUE | E1 | L | L | M | L |  | B: effort 2, complexity 2, safety M; R: ai L, op L, scale L; C: maint 3, fan-in 0 |
| `F04-G05-M01` | CORE_VALUE | E0 | L | L | L | L | ✓ | B: effort 1, complexity 1, safety L; R: ai L, op L, scale L; C: maint 1, fan-in 1 |
| `F04-G05-M02` | CORE_VALUE | E0 | L | L | L | L |  | B: effort 2, complexity 2, safety M; R: ai L, op M, scale M; C: maint 2, fan-in 0 |
| `F04-G06-M01` | CORE_VALUE | E1 | H | L | M | M | ✓ | B: effort 4, complexity 4, safety M; R: ai L, op L, scale L; C: maint 3, fan-in 1 |
| `F04-G06-M02` | CORE_VALUE | E1 | L | L | L | L |  | B: effort 2, complexity 2, safety L; R: ai L, op L, scale L; C: maint 1, fan-in 0 |
| `F04-G07-M01` | CORE_VALUE | E1 | M | L | L | M | ✓ | B: effort 3, complexity 3, safety L; R: ai L, op M, scale M; C: maint 2, fan-in 0 |
| `F04-G07-M02` | CORE_VALUE | E1 | L | L | L | L | ✓ | B: effort 1, complexity 1, safety L; R: ai L, op L, scale L; C: maint 1, fan-in 1 |
| `F05-G01-M01` | CORE_VALUE | E2 | H | H | H | H |  | B: effort 4, complexity 5, safety H; R: ai H, op L, scale H; C: maint 5, fan-in 0; prompts/evals/model migration |
| `F05-G01-M02` | MIN_FOUNDATION | E1 | H | M | H | H |  | B: effort 4, complexity 4, safety H; R: ai M, op L, scale M; C: maint 4, fan-in 1; safety rules + static content |
| `F05-G02-M01` | CORE_VALUE | E1 | M | L | L | M |  | B: effort 2, complexity 3, safety M; R: ai L, op L, scale L; C: maint 2, fan-in 1 |
| `F05-G02-M02` | CORE_VALUE | E1 | L | L | L | L |  | B: effort 1, complexity 2, safety M; R: ai L, op L, scale L; C: maint 1, fan-in 0 |
| `F05-G03-M01` | CORE_VALUE | E1 | L | L | M | L |  | B: effort 2, complexity 2, safety M; R: ai L, op L, scale L; C: maint 3, fan-in 1 |
| `F05-G03-M02` | CORE_VALUE | E1 | L | L | L | L |  | B: effort 1, complexity 2, safety M; R: ai L, op L, scale L; C: maint 1, fan-in 0 |
| `F05-G04-M01` | CORE_VALUE | E0 | H | L | L | H |  | B: effort 3, complexity 4, safety H; R: ai L, op M, scale M; C: maint 2, fan-in 2 |
| `F05-G04-M02` | MIN_FOUNDATION | E1 | M | L | L | M |  | B: effort 2, complexity 3, safety H; R: ai L, op L, scale L; C: maint 2, fan-in 0 |
| `F05-G06-M01` | MIN_FOUNDATION | E1 | H | L | L | H |  | B: effort 3, complexity 4, safety H; R: ai L, op L, scale L; C: maint 2, fan-in 0 |
| `F05-G06-M02` | MIN_FOUNDATION | E1 | H | L | M | M |  | B: effort 4, complexity 4, safety H; R: ai L, op L, scale L; C: maint 3, fan-in 1; legal-text dependent |
| `F06-G01-M01` | CORE_VALUE | E0 | L | L | L | L | ✓ | B: effort 2, complexity 2, safety M; R: ai L, op L, scale M; C: maint 1, fan-in 1 |
| `F06-G01-M02` | CORE_VALUE | E0 | L | L | L | L |  | B: effort 1, complexity 2, safety L; R: ai L, op L, scale L; C: maint 1, fan-in 0 |
| `F06-G02-M01` | CORE_VALUE | E1 | L | L | L | L | ✓ | B: effort 2, complexity 2, safety L; R: ai L, op L, scale L; C: maint 2, fan-in 3 |
| `F06-G02-M02` | CORE_VALUE | E1 | L | L | L | L | ✓ | B: effort 1, complexity 2, safety L; R: ai L, op L, scale L; C: maint 1, fan-in 0 |
| `F06-G04-M01` | CORE_VALUE | E1 | L | L | L | L | ✓ | B: effort 2, complexity 2, safety L; R: ai L, op L, scale L; C: maint 1, fan-in 0 |
| `F06-G05-M01` | CORE_VALUE | E1 | M | L | L | L | ✓ | B: effort 2, complexity 3, safety M; R: ai L, op L, scale L; C: maint 2, fan-in 1 |
| `F06-G05-M02` | CORE_VALUE | E1 | L | L | L | L | ✓ | B: effort 2, complexity 2, safety M; R: ai L, op L, scale L; C: maint 2, fan-in 1 |
| `F06-G06-M01` | CORE_VALUE | E1 | L | L | L | L |  | B: effort 2, complexity 2, safety M; R: ai L, op L, scale L; C: maint 2, fan-in 1 |
| `F06-G06-M02` | CORE_VALUE | E1 | M | L | L | M |  | B: effort 2, complexity 3, safety L; R: ai L, op L, scale L; C: maint 2, fan-in 0 |
| `F07-G01-M01` | MIN_FOUNDATION | E1 | M | M | H | L |  | B: effort 2, complexity 2, safety H; R: ai L, op L, scale L; human ops: content approval; C: maint 4, fan-in 5; approved content upkeep + expert review |
| `F07-G01-M02` | MIN_FOUNDATION | E1 | M | L | M | L |  | B: effort 3, complexity 3, safety M; R: ai L, op L, scale M; C: maint 3, fan-in 2 |
| `F07-G02-M01` | MIN_FOUNDATION | E1 | L | M | M | L |  | B: effort 2, complexity 2, safety M; R: ai L, op L, scale L; human ops: expert editorial review; C: maint 3, fan-in 1 |
| `F07-G02-M02` | MIN_FOUNDATION | E1 | L | L | L | L |  | B: effort 2, complexity 2, safety M; R: ai L, op L, scale L; C: maint 2, fan-in 2 |
| `F07-G03-M01` | MIN_FOUNDATION | E1 | H | M | M | H |  | B: effort 3, complexity 4, safety H; R: ai M, op L, scale M; C: maint 3, fan-in 3 |
| `F07-G03-M02` | MIN_FOUNDATION | E1 | L | L | M | L |  | B: effort 2, complexity 2, safety L; R: ai L, op L, scale L; C: maint 2, fan-in 4 |
| `F07-G04-M01` | MIN_FOUNDATION | E1 | H | M | H | M |  | B: effort 3, complexity 4, safety H; R: ai M, op L, scale M; C: maint 4, fan-in 4; scope allowlist/threshold upkeep |
| `F07-G04-M02` | MIN_FOUNDATION | E1 | M | M | H | M |  | B: effort 3, complexity 3, safety M; R: ai M, op L, scale L; C: maint 4, fan-in 3; Vietnamese eval suite upkeep |
| `F07-G05-M01` | MIN_FOUNDATION | E1 | M | L | H | M |  | B: effort 3, complexity 3, safety H; R: ai L, op L, scale L; C: maint 4, fan-in 4; safety rules + static content |
| `F07-G06-M01` | MIN_FOUNDATION | E1 | H | L | M | M | ✓ | B: effort 3, complexity 4, safety H; R: ai L, op L, scale M; C: maint 3, fan-in 56; legal-text dependent |
| `F07-G06-M02` | MIN_FOUNDATION | E1 | H | M | M | H | ✓ | B: effort 3, complexity 4, safety H; R: ai L, op M, scale L; human ops: manual purge runbook (pilot); C: maint 3, fan-in 55; legal-text dependent |

**Độ tin cậy:** ESTIMATE / HYPOTHESIS. **Câu hỏi còn mở:** CU-01..07. **Cần Owner duyệt:** không, vì đây chỉ là phân tích. Quy tắc phân mức là đề xuất.
