# Parent-Pal — Batch 01 / Module 03: Purpose-bound Access — Owner Decision Log

**Ngày ghi:** 2026-11-12  
**Module:** `F07-G06-M01` — Purpose-bound Access  
**Trạng thái:** `OWNER_DECISIONS_CONFIRMED / CONDITIONAL_DESIGN_REVIEW / REGRESSION_AND_RESEARCH_OPEN`  
**Phạm vi:** Quyết định nghiệp vụ OQ-B01M3-1..4, không phê duyệt stable L4 ID, không xác nhận tính hợp pháp của một hoạt động xử lý dữ liệu thật và không đồng nghĩa test ứng dụng đã chạy.

## 1. Quyết định Owner đã chốt

| ID | Quyết định | Quy tắc triển khai và giới hạn |
|---|---|---|
| **B01-PA-OD-01 / OQ-B01M3-1** | **A — F01-G04-M01 Access Policy là điểm đưa ra quyết định ALLOW/DENY cuối cùng** cho yêu cầu truy cập. | `F07-G06-M01` đánh giá purpose, scope và những ràng buộc riêng của dữ liệu rồi trả `purpose_assessment` có provenance cho Access Policy; Consent Ledger cung cấp trạng thái/bằng chứng đồng ý; không để nhiều module tạo các quyết định `ALLOW` xung đột. Mọi thành phần bắt buộc phải fail-closed khi thiếu điều kiện, stale policy hoặc thiếu căn cứ. Cơ chế thực thi quyền theo kiến trúc thực tế không được bỏ qua gate purpose. |
| **B01-PA-OD-02 / OQ-B01M3-2** | **A — Product Owner xác định và phê duyệt danh mục mục đích dữ liệu**, có kiểm tra tuân thủ với mục đích nhạy cảm trước khi sử dụng thật. | Các purpose candidate: lập/thực hiện kế hoạch, AI đánh giá học tập, báo cáo tiến độ, AI companion, Journal riêng tư, vận hành tài khoản, thanh toán. Không phải whitelist đã tự động được duyệt; mỗi purpose cần purpose ID/version, resource category, legal basis requirements, boundaries, retention/consent rules, approver và change control. Privacy/compliance review không nhất thiết là một chức danh riêng trong ứng dụng giai đoạn đầu, nhưng trách nhiệm kiểm tra không được bỏ qua. |
| **B01-PA-OD-03 / OQ-B01M3-3** | **A — Khi trẻ ngừng chia sẻ Journal, ngay lập tức từ chối truy cập mới và cách ly summary/insight dẫn xuất chưa được phép chia sẻ**, xử lý lưu trữ/xóa theo chính sách hiện hành. | Cách ly không đồng nghĩa xóa Journal gốc. Không được tiếp tục tiết lộ thông qua cache, embedding, search, report, API và bản dẫn xuất có thể truy ngược Journal. Thu hồi quyền là tức thời đối với access decision mới; tác vụ đang chạy phải có cơ chế cancel/recheck, phần đã phát tán cần đánh giá xử lý trong giới hạn kỹ thuật/pháp lý. Yêu cầu xóa Journal riêng áp dụng chính sách đã chốt: ẩn ngay, xóa vĩnh viễn sau 60 ngày đối với dữ liệu và derived traceable (trừ ngoại lệ lưu giữ hợp pháp có công bố). Không tự đặt một retention mới cho các trường hợp chỉ rút quyền chia sẻ. |
| **B01-PA-OD-04 / OQ-B01M3-4** | **A có điều chỉnh — Phân tầng mục đích theo rủi ro; không xử lý dữ liệu cá nhân thật của trẻ khi chưa xác định được căn cứ xử lý pháp lý phù hợp.** | Thiết kế và kiểm thử bằng dữ liệu giả/đã phi định danh phù hợp có thể tiếp tục. Mỗi hoạt động xử lý dữ liệu thật phải có `lawful_basis_assessed`, quyền chủ thể, purpose và security/safeguarding controls phù hợp trước khi vận hành; `LEGAL_UNKNOWN` không phải `ALLOW`. Mục đích secondary, chia sẻ bên thứ ba, xử lý Journal và dữ liệu nhạy cảm có gate kiểm soát bổ sung. Đây là **gate trước xử lý dữ liệu thật**; không phải yêu cầu phụ huynh phải cung cấp giấy tờ ngay ở onboarding thông thường. Luật áp dụng, tuổi, thẩm quyền và căn cứ cụ thể vẫn `RESEARCH_REQUIRED`. |

## 2. Xung đột tưởng như có với Consent Ledger / Access Policy

- **B01 Consent Ledger OQ-B01-3:** khi chuyển Primary Caregiver từ mẹ sang bố thì **giữ nguyên lịch sử và trạng thái consent được ghi**; bố có thể điều chỉnh/thu hồi bằng event mới.
- **P6 Access OQ-2:** mọi **quyền truy cập hiện tại** và grants vẫn phải được đánh giá lại theo actor, scope, policy, role, purpose, consent, legal basis. **Consent history preserved != current authorization allowed.**
- **B01 Mode State:** mỗi trẻ có một mode chung cho quyền lập/sửa lịch; mode không tự mở rộng quyền dữ liệu.
- **Child Journal:** chỉ trẻ kiểm soát việc chia sẻ Journal; caregiver-managed consent không cho phép vô hiệu hóa việc trẻ thu hồi quyền Journal. Quyền dữ liệu ngoài Journal vẫn bị giới hạn theo role/purpose/scope, không public.

## 3. Kiểm tra hồi quy cần có

1. `purpose_assessment = deny/unknown` thì Access Policy không được trả final ALLOW chỉ vì role/consent hợp lệ.
2. Purpose Catalog update/version/revocation làm invalid cache/old decision; audit nguồn/version.
3. Journal share revoked -> summary/cache/embeddings/retrieval mới bị chặn ngay, task đang chạy phải recheck/cancel phù hợp; không tự xoá Journal gốc.
4. Journal deletion request -> ẩn tức thời và pipeline xóa theo chính sách 60 ngày (bao gồm derived/traceable) và ngoại lệ pháp lý minh bạch; không nhầm với revoke share.
5. Historical caregiver consent vẫn được lưu; access decision hiện tại revalidate theo current caregiver/policy/consent validity.
6. Ngăn purpose creep: dữ liệu thu thập cho học tập không tự dùng cho thương mại/marketing/recommendation mục đích mới.
7. Không thực hiện production flow với dữ liệu thật khi trạng thái `LEGAL_UNKNOWN` hoặc chưa xác định lawful basis thích hợp, bất kể mức rủi ro app tính thấp.
8. Với một user 18+ đã tự quản, family caregiver không tự cấp quyền mục đích dữ liệu; Journal/private constraints còn độc lập.
9. Dữ liệu trong audit/error trace/cache không được leak Journal hoặc PII ngoài mục đích được phép.

## 4. Kết quả Claude Code và vấn đề chưa đóng

Nguồn: ZIP `B01_F07-G06-M01.zip` do Owner cung cấp (chưa commit ZIP). Theo báo cáo pilot được trình: 4 L4 ứng viên (Purpose Decision Gate, Purpose Catalog Governance, Derived Data & Cache Restriction, Revocation Propagation); 75 test thiết kế; 23 findings gồm 16 fixed, 4 Owner, 3 research; validator final 0 errors/0 warnings, 30/30 regression design-consistent, 11/11 mutation checks. Đây là **self-reported design validation**, không phải app test, privacy audit hoặc chứng nhận pháp lý. Owner đã chốt 4 OQ, không tự động đóng 4 findings nếu chưa cập nhật contracts/tests và rerun.

**Các mục phải theo dõi:**
- Mapping 4 OQ → impacted findings → contracts → acceptance criteria → test → final re-review.
- Các nghiên cứu pháp lý về lawful basis/consent/children, data minimization, data retention và quyền chủ thể: `RESEARCH_REQUIRED`. Gate xử lý dữ liệu thật chưa mở.
- Ownership audit log chung, cách tích hợp final decision Access Policy với purpose sub-decision, revocation propagation trong cache/tasks.
- Kiểm tra các hợp đồng khi có batch consolidation, không sao chép chức năng của `F01-G04-M01`, `F01-G04-M02`, `F07-G06-M02`.
- Hiệu lực của các tình huống test liên quan trực tiếp/gián tiếp 64 baseline P5 và các Owner Decision của Batch 01.

## 5. Phân công, bước tiếp theo và trạng thái

`B01_MODULE_03_EXECUTED`  
`B01_MODULE_03_OWNER_DECISIONS_RECORDED`  
`B01_MODULE_03_FINAL_REGRESSION_PENDING`  
`B01_MODULE_04_F04-G01-M01_NEXT`

Claude Code chỉ phân rã/đánh giá, tối đa 3 sub-agent dùng Sonnet 5.5 nếu có; **Coordinator giữ nguyên model hiện tại**. Claude xuất ZIP ngoài repository, không viết GitHub. ChatGPT chịu trách nhiệm quản lý Decision Logs/Git và tập hợp findings. Không sửa canonical, không merge PR #17, không cấp stable L4 IDs.
