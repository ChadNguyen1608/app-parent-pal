# Parent-Pal · Batch 09 · L4 candidate checkpoint

BASELINE_PROPOSED / PROVISIONAL / NOT_PLANNED · MVP NOT_DECIDED

Source commit `d54c8dd0ca2d0a16768655f968998e06f6361f76`, inventory blob `f52be52f5ae37ddce0b6a021aec915659f357db3`. [B02 authority manifest](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md) pins all 42 decisions. [B04 queue](Feature_3_2_L4_B04_Design_and_Checkpoint_REVIEW.md) records scope.

- F05-G03-M02 · Reflection Review
- F05-G05-M01 · Structured Insight
- F05-G05-M02 · Insight Correction

## Permission and applicability

B01-PA-OD-01..04 apply to every candidate. Access Policy issues the final decision using current subject, purpose, resource, consent and policy versions. Real child data is blocked where lawful basis is UNKNOWN. Recheck at commit and release. F07 audit governance applies per B01-C-OD-07; private content stays out of shared audit. Each actor acts only in current scope. A0 conditional caregiver-mediated, A1 supervised, A2 guided, A3 assisted or subject-led, A4 subject-led when eligible, A5 verified adult self-management. These interaction profiles supply no authority. Missing mandatory evidence denies protected processing; manual path only within existing rights. E0/E1 means zero inference calls. E2/E3 remains conditional and budgeted. Costs and evidence confidence remain UNKNOWN.

## Candidate contracts and test oracles

| Temporary L4 | Actor and observable outcome | Ownership, flow and data contract | Acceptance criterion and synthetic test |
|---|---|---|---|
| CAND-F05-G03-M02-review | Trẻ xem lại bản nháp và quyết định có lưu | Reflection Review giữ bản nháp có giới hạn vòng đời. Chỉ chuyển sang Private Entries khi có save rõ ràng và hợp lệ. E1. | B09-T01. Bỏ bản nháp trong lúc sync và tải lại. Không có Journal entry hoặc dữ liệu phản tư được lưu. |
| CAND-F05-G05-M01-derive | Chủ thể đủ điều kiện nhận insight riêng có bằng chứng | Structured Insight sở hữu bản dẫn xuất versioned, provenance/confidence và graph refs cho mọi nguồn. E2 conditional; E1 gate trước suy luận và release. | B09-T02. Thiếu một root trong lineage hoặc nguồn bị suppress khi worker chạy. Không công bố insight; trạng thái quarantine có metadata tối thiểu. |
| CAND-F05-G05-M02-correct | Chủ thể sửa, phản đối hoặc yêu cầu xóa insight riêng | Insight Correction giữ yêu cầu versioned và nguyên nhân đã phân loại, chuyển đúng owner cập nhật hoặc retention. Hiển thị tranh chấp theo policy, không ghi đè Journal nguồn. E1. | B09-T03. Hai sửa đổi cùng base version và một yêu cầu xóa được tiếp nhận. Sau suppression, sửa đến muộn không làm insight xuất hiện trở lại. |

## Trace and triage

- F05-G03-M02 → pinned inventory → candidate above → B09-T01. Provider guarantees and exact resource classification remain to verify before release.
- F05-G05-M01 → pinned inventory → candidate above → B09-T02. Provider guarantees and exact resource classification remain to verify before release.
- F05-G05-M02 → pinned inventory → candidate above → B09-T03. Provider guarantees and exact resource classification remain to verify before release.
- B09-I01 HIGH. Verify authorization and version fencing for the module-specific denial and retry cases above; inherit BI-05/10 and related provider issues. Research and implementation validation remain open.
- Structural check: 3 unique canonical parents, 3 unique candidate and test IDs. Zero runtime executions. Independent review pending consolidation. 65 untouched L3 remain, plus B02 partial slices.
