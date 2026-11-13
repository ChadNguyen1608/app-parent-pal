# Parent-Pal — L4 Owner Decision Register / Source Index

**Cập nhật:** 2026-11-13  
**Trạng thái:** `ACTIVE_INDEX` — chỉ số tham chiếu; bản quyết định đầy đủ nằm trong các Decision Log được liên kết.  
**Repository:** `ChadNguyen1608/app-parent-pal`  
**Branch nguồn tài liệu:** `docs/l4-pilot-three-modules-20261110` (Draft PR #17, chưa merge).  
**Nguyên tắc:** **GitHub branch là nguồn tham chiếu liên phiên**, không dùng ngữ cảnh hội thoại làm nguồn duy nhất. Mỗi lần chạy Claude ghim commit SHA và đọc các Decision Log liên quan. Không sửa Blueprint canonical hoặc stable L4 ID khi chưa có quyết định riêng.

## 1. Index: Owner decisions đã ghi vào Git

| Phase | L3 | Owner decisions | File authoritative | Trạng thái |
|---|---|---|---|---|
| P6 Pilot 1 | `F01-G04-M01` Access Policy | OQ-1..5 (5) | [Access Policy Owner Log](Feature_3_2_L4_P6_Access_Policy_Owner_Decision_Log_APPROVED.md) | Owner confirmed, final regression pending |
| P6 Pilot 2 | `F06-G07-M01` Academic Assessment | OQ-2A..D (4) | [Academic Owner Log](Feature_3_2_L4_P6_Academic_Assessment_Owner_Decision_Log_APPROVED.md) | Owner confirmed, final regression pending |
| P6 Pilot 3 | `F04-G02-M03` Balanced Planning | OQ-3A..C (3) | [Balanced Owner Log](Feature_3_2_L4_P6_Balanced_Planning_Owner_Decision_Log_APPROVED.md) | Owner confirmed, final regression pending |
| B01 Module 01 | `F01-G04-M02` Consent Ledger | OQ-B01-1..4 (4) | [Consent Owner Log](Feature_3_2_L4_B01_Consent_Ledger_Owner_Decision_Log_APPROVED.md) | Owner confirmed, design regression/research pending |
| B01 Module 02 | `F01-G05-M01` Mode State | OQ-B01M2-1..4 (4) | [Mode State Owner Log](Feature_3_2_L4_B01_Mode_State_Owner_Decision_Log_APPROVED.md) | Owner confirmed, regression pending |
| B01 Module 03 | `F07-G06-M01` Purpose-bound Access | OQ-B01M3-1..4 (4) | [Purpose Owner Log](Feature_3_2_L4_B01_Purpose_Bound_Access_Owner_Decision_Log_APPROVED.md) | Owner confirmed, legal/review gates pending |
| B01 Module 04 | `F04-G01-M01` Plan Structure | OQ-B01M4-1..5 (5) | [Plan Structure Owner Log](Feature_3_2_L4_B01_Plan_Structure_Owner_Decision_Log_APPROVED.md) | Owner confirmed, regression pending |
| B01 Module 05 | `F04-G06-M01` Change Requests | OQ-B01M5-1..5 (5) | [Change Requests Owner Log](Feature_3_2_L4_B01_Change_Requests_Owner_Decision_Log_APPROVED.md) | Owner confirmed, consolidation pending |

**Tổng:** 8 L3 đã chạy review/pilot, **42 Owner decisions** đã ghi (P6 = 12, Batch 01 module OQ = 22, Consolidation OQ = 8). Ba L3 P6 + năm L3 Batch 01. Batch 01 có 28 L4 ứng viên, 395 design tests, 114 findings (số thô chưa hợp nhất/dedupe). Trạng thái confirmed ở đây chỉ là **business decision**, không phải full L4 acceptance hoặc app-test PASS.

**Batch 01 Consolidation:** OQ-B01C-1..8 (8) — [Consolidation Owner Decision Log](Feature_3_2_L4_B01_Consolidation_Owner_Decision_Log_APPROVED.md), Owner confirmed; targeted remediation pending. Lưu ý caregiver handover **giữ quyền ủy quyền chỉnh lịch đang hợp lệ**, không auto-suspend.

## 2. Bất biến xuyên module quan trọng (đọc log gốc để có đủ điều kiện)

1. Một `Primary Caregiver` hiệu lực mỗi gia đình; quyền `Primary Manager` theo plan scope được kiểm tra riêng; Supporter/Observer không tự nâng quyền.
2. Mỗi trẻ một autonomy mode chung; ba mức **quyền lập/sửa lịch**: parent-controlled → child proposal/draft → child commit trong scope ủy quyền, caregiver overwrite/lock. Chức năng Journal/trao đổi khác không mất đi do Parent-led.
3. Parent App có thể tạo kế hoạch trước khi Child App liên kết; Child App phải liên kết hợp lệ trước khi vào chương trình, nhưng thiết bị liên kết không xác minh thẩm quyền giám hộ pháp lý.
4. Consent lịch sử không bị xóa khi thay Primary Caregiver; **current access** phải được đánh giá lại. Caregiver-managed consent và child Journal sharing/assent là hai quyền khác nhau.
5. Child Journal riêng tư; khi trẻ rút chia sẻ, access mới bị chặn và dữ liệu dẫn xuất chưa được phép bị cách ly; xóa Journal là workflow khác (ẩn ngay/xóa vĩnh viễn sau 60 ngày với ngoại lệ retention pháp lý đã công bố).
6. Access Policy đưa quyết định ALLOW/DENY cuối cùng; Purpose-bound Access đánh giá purpose constraint; Consent Ledger quản lý consent evidence. Dữ liệu ngoài Journal vẫn theo role/purpose/scope, **không public**.
7. Không xử lý dữ liệu cá nhân thật của trẻ khi chưa xác định căn cứ pháp lý phù hợp cho hoạt động đó; test bằng dữ liệu giả hoặc phi định danh phù hợp.
8. Academic: phụ huynh xác nhận chấm bài tại nhà; AI đánh dấu câu sai, đưa câu hỏi gợi mở, không trực tiếp phát đáp án trong hint flow; AI recheck rồi parent review nếu còn tranh cãi; cost quota chưa chốt.
9. Balanced: App Default Standard Bar theo tuổi/bối cảnh có kiểm chứng, family overrides có giới hạn; protected hard-cap không bypass; soft exception chống nối purpose để lách 60 ngày, giữ quy tắc 7 ngày P5.
10. Người 18+ đã được xác minh tự quản, family caregiver không tự có quyền override.
11. Plan Structure: approved Change Request qua F04-G06, baseline commit/version qua F04-G01; luôn cho lưu draft dù không đạt Standard Bar, app default bar fallback khi family chưa có custom. Caregiver lock = khóa chỉnh sửa thời khóa biểu hiện tại, parent unlock/authorized override có audit; không vượt protected hard-cap.
12. Change Requests: Child-directed within delegated scope được direct mutation có full gates, không cần CR; pending request hết hạn sau 7 ngày; approved != applied; plan-version, caregiver, mode, lock, archive thay đổi có invalidation/reassessment; parent/Primary Manager đúng scope không tự xin approval thứ hai; đề xuất vi phạm hard-cap vẫn được gửi để thảo luận nhưng tuyệt đối không approve/apply.
13. Consolidation: caregiver handover **không tự suspend child delegated schedule rights**; prior approved-but-unapplied CR vẫn phải reapprove theo CR OQ2. Journal revoke notice child opt-in, default no notification. Approved CR tối đa 7 ngày từ approve (khác pending 7 ngày từ submit). Balanced Planning sở hữu soft-cap exception expiry/reminder. Lock không auto-unlock, vẫn có offline/draft nhưng không commit. F07 audit governance/hạ tầng lưu chung. Parent-led bày tỏ nguyện vọng qua F05, không tạo official CR.

## 3. Quy trình cập nhật bắt buộc cho mỗi module tiếp theo

1. **Claude Code:** đọc branch và source ở commit xác định; chỉ chạy một L3/lượt, tối đa **3 sub-agent** (QA/Architect/Reviewer) trên **Sonnet 5.5 nếu khả dụng**, Coordinator giữ nguyên model; chỉ tạo ZIP ngoài repo. Không sửa nguồn, Decision Log hoặc Git.
2. **ChatGPT:** nhận ZIP, kiểm tra source, outputs, findings/validators; chỉ trình Owner những vấn đề nghiệp vụ chưa chốt, không hỏi lại quyết định cũ.
3. **Product Owner:** xác nhận/điều chỉnh OQ.
4. **ChatGPT:** tạo `Feature_3_2_L4_<Batch>_<Module>_Owner_Decision_Log_APPROVED.md` trên **branch PR #17** bằng commit; liên kết nguồn, quyết định, caveats, test regression và issues còn mở.
5. **ChatGPT:** cập nhật file INDEX này và Batch Plan/status bằng commit; **đọc lại GitHub sau ghi** để xác minh thành công.
6. **Next Claude prompt:** yêu cầu đọc INDEX và các Decision Logs ảnh hưởng trực tiếp; ghi source SHA ở output. Không copy-paste toàn bộ quyết định vào prompt khi không cần.
7. **Gate:** không gọi `OWNER_CONFIRMED` là `L4_ACCEPTED`; bản đặc tả đề xuất chỉ thành canonical sau consolidation và Owner approval riêng.

## 4. Các việc chưa đóng

- P6: Access final regression/warning, Academic F-023, Balanced F-021, 9 partial-equivalent P5 baseline tests, nghiên cứu Standard Bar và AI costs.
- Batch 01: Consent Ledger F-021 retired AC / validator warnings, Mode State 2 partial regressions/trace gap, Purpose-bound Access legal basis/revocation/audit ownership; Plan Structure F-023/F-027 + 1 validator warning + 3 partial regressions và evidence timestamp cần rà soát; Change Requests F-022/F-025, 4 partial + 1 cross-module conflict. [Consolidation Plan](Feature_3_2_L4_B01_Consolidation_and_Cross_Module_Review_Plan_REVIEW.md) quản lý toàn bộ cổng C0–C5.
- Quyết định chưa thay thế bằng test runtime: tất cả pilot và batch hiện là **design-level evidence**, chưa phải production or app tests.
- [P6 Method & Rollout Review](Feature_3_2_L4_P6_Method_Approval_and_Rollout_Review.md) và [Batch 01 Source & Sequence](Feature_3_2_L4_Post_P6_Batch_01_Source_and_Sequence_REVIEW.md) quản lý workplan.

## 5. Batch 01 consolidation

- [Batch 01 Consolidation & Cross-Module Review Plan](Feature_3_2_L4_B01_Consolidation_and_Cross_Module_Review_Plan_REVIEW.md) — trạng thái `PLAN_CREATED / NOT_EXECUTED`; gồm source freeze, ownership/contract, decisions propagation, test consolidation, economics và Owner gate.
- Consolidation C0–C5 đã được báo cáo; [Owner OQ-B01C-1..8 confirmed](Feature_3_2_L4_B01_Consolidation_Owner_Decision_Log_APPROVED.md). Theo báo cáo: 28→25 L4 entries, 395→392 design tests, 46 spec fixes, 9 HIGH regression gaps, 17 tests proposed. **Targeted Remediation chưa chạy**; không auto-promote.
- Không coi `B01 five modules reviewed` là `L4 final accepted`; không chạy Batch 02 trước review kết quả targeted remediation.

## 6. Chính sách thay đổi và merge

- Nếu một quyết định mới **xung đột** quyết định cũ, tạo `CONFLICT/CHANGE_PROPOSAL` có source, scope, impact; chỉ cập nhật cả hai khi Owner đã chốt.
- Không ghi đè lịch sử; thay đổi quyết định phải có changelog và supersedes/clarifies reference.
- PR #17 là Draft; **ghi file/commit trên branch không có nghĩa merge vào main**. Không merge khi chưa được Owner cho phép.
- PR #18 đóng, không sử dụng.
