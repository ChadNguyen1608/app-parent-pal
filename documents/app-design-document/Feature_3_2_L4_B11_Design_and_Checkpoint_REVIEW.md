# Parent-Pal · Batch 11 · L4 candidate checkpoint

BASELINE_PROPOSED / PROVISIONAL / NOT_PLANNED · MVP NOT_DECIDED

Source commit `48a4b3015d4f1342ac3eb98616cb9aaa6be2004d`, inventory blob `f52be52f5ae37ddce0b6a021aec915659f357db3`. [B02 authority manifest](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md) pins all 42 decisions. [B04 queue](Feature_3_2_L4_B04_Design_and_Checkpoint_REVIEW.md) records scope.

- F02-G03-M02 · Non-labeling Review
- F02-G04-M01 · Environment Context
- F02-G04-M02 · Context Permissions
- F02-G05-M01 · Versioned Profile

## Permission and applicability

B01-PA-OD-01..04 apply to every candidate. Access Policy issues the final decision using current subject, purpose, resource, consent and policy versions. Real child data is blocked where lawful basis is UNKNOWN. Recheck at commit and release. F07 audit governance applies per B01-C-OD-07; private content stays out of shared audit. Each actor acts only in current scope. A0 conditional caregiver-mediated, A1 supervised, A2 guided, A3 assisted or subject-led, A4 subject-led when eligible, A5 verified adult self-management. These interaction profiles supply no authority. Missing mandatory evidence denies protected processing; manual path only within existing rights. E0/E1 means zero inference calls. E2/E3 remains conditional and budgeted. Costs and evidence confidence remain UNKNOWN.

## Candidate contracts and test oracles

| Temporary L4 | Actor and observable outcome | Ownership, flow and data contract | Acceptance criterion and synthetic test |
|---|---|---|---|
| CAND-F02-G03-M02-review | Reviewer có quyền kiểm tra diễn giải thiếu căn cứ hoặc gán nhãn | Review sở hữu disposition theo observation/version; giữ lý do và yêu cầu chứng cứ bổ sung. E1. | B11-T01. Quan sát mô tả một tình huống được dùng để gán nhãn ổn định. Từ chối diễn giải; giữ quan sát gốc với scope. |
| CAND-F02-G04-M01-record | Chủ thể có quyền khai bối cảnh có nguồn và thời hạn | Environment Context lưu bối cảnh, thời điểm, provenance và phiên bản; hạn chế trường học/địa chỉ theo mục đích. E1. | B11-T02. Đổi lịch trường khi proposal đang chờ. Proposal thấy version cũ cần đánh giá lại; hồ sơ không ghi đè nguồn. |
| CAND-F02-G04-M02-restrict | Dữ liệu bối cảnh chỉ được dùng cho mục đích được phê duyệt | Context Permissions giữ evidence ref, purpose và resource binding; Access Policy quyết định cuối. E1. | B11-T03. Grant cho lịch học nhưng consumer dùng marketing. Deny trước đọc và trước truy cache. |
| CAND-F02-G05-M01-assemble | Người có quyền nhận bản hồ sơ versioned với nguồn và bất đồng | Versioned Profile sở hữu projection/inputs manifest; nguồn chưa xác nhận được biểu thị UNKNOWN. Revocation chặn cache/projection cũ. E1. | B11-T04. Nguồn đã được rút khi profile snapshot dựng xong. Không trả dữ kiện rút qua cache hoặc report. |

## Trace and triage

- F02-G03-M02 → pinned inventory → candidate above → B11-T01. Provider guarantees and exact resource classification remain to verify before release.
- F02-G04-M01 → pinned inventory → candidate above → B11-T02. Provider guarantees and exact resource classification remain to verify before release.
- F02-G04-M02 → pinned inventory → candidate above → B11-T03. Provider guarantees and exact resource classification remain to verify before release.
- F02-G05-M01 → pinned inventory → candidate above → B11-T04. Provider guarantees and exact resource classification remain to verify before release.
- B11-I01 HIGH. Verify authorization and version fencing for the module-specific denial and retry cases above; inherit BI-05/10 and related provider issues. Research and implementation validation remain open.
- Structural check: 4 unique canonical parents, 4 unique candidate and test IDs. Zero runtime executions. Independent review pending consolidation. 56 untouched L3 remain, plus B02 partial slices.
