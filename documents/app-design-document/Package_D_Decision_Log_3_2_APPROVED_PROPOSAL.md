# PRODUCT BLUEPRINT — 3.2 PACKAGE D DECISION LOG

**Tên:** Accounts, Commerce & Finance  
**Ngày ghi:** 2026-11-09  
**Trạng thái:** `USER_APPROVED_L3_PROPOSAL` + `PRICING_HYPOTHESIS_REVIEW`  
**Nguyên tắc quản lý thay đổi:** Đây là **Decision Log riêng**. Không chỉnh sửa Feature Inventory 3.2, Product Blueprint, 3.3/3.4, các log của Package khác, hoặc Master Research Backlog khi chưa được người dùng phê duyệt cập nhật chính thức.

## I. Các quyết định đã chốt

| ID | Mã CP | Quyết định | Hành động L3 đề xuất |
|---|---|---|---|
| D-D01 — Q1=A | CP-11 | Phân tách quyền lợi subscription khỏi vòng đời thanh toán | `EXTEND/SPLIT F01-G06-M02` Entitlements & Subscription; `ADD F01-G06-M03` Subscription Billing Lifecycle; `EXTEND F07-G07-M02` giám sát billing/AI cost |
| D-D02 — Q2=A | CP-12 | Tạo Feature Group riêng cho Education Finance | `ADD F08-G06` Education Finance; `ADD F08-G06-M01` Education Budget Planning; `ADD F08-G06-M02` Expense & Approval Management |
| D-D03 — Q3=A | CP-15, CP-21 | Dùng F01/F07 hiện tại, không thêm L3 Guardian/Adult Transition; tách family membership, data access, billing administration | `EXTEND F01-G02-M01/M02`, `F01-G04-M01/M02`, `F01-G06-M01`, `F07-G06-M01/M02` |
| D-D04 — Q4=A | CP-23 | Dùng F08-G02/G05 cho Marketplace/Partner Governance; recommendation độc lập với quảng cáo/tài trợ | `EXTEND F08-G02-M01/M02`, `F08-G05-M01/M02` |
| D-D05 — Đã chốt trước | CP-12 | **Education Finance = B**, đủ budget, dự toán/thực chi, khoản định kỳ, giới hạn, dự báo, yêu cầu/phê duyệt chi, liên kết kế hoạch | Giữ phạm vi D-D02 |
| D-D06 — Đã chốt trước | CP-13 | **Wallet = D**: chưa định nghĩa hoặc tạo module Wallet; Subscription, Payment và AI Quota vẫn độc lập | `DEFER CP-13` |

### Kết quả cấu trúc tạm tính

- Baseline 3.2: 8 Domains / 49 Groups / 98 L3 modules.
- Package A đã chốt đề xuất: +2 L3; B: +1 L3; C: +1 L3.
- Package D đề xuất: **+1 Feature Group (`F08-G06`) và +3 L3** (`F01-G06-M03`, `F08-G06-M01/M02`).
- **Nếu áp dụng nguyên các đề xuất A–D:** 8 Domains, **50 Groups, 105 L3**. Đây là số tạm tính **trước** Package E và Consolidation; ID và ownership có thể còn cần tái kiểm tra.

## II. Góp ý bổ sung từ người dùng: Mô hình tính phí Family / Child / Parent AI

**Phát biểu của chủ sản phẩm:** Với một gia đình 3 con + 1 người quản lý, phí Premium nên dựa chủ yếu trên số trẻ được hỗ trợ/thực thi; phụ huynh cũng dùng AI, đặc biệt nhiều hơn trong giai đoạn Parent-led. Không mong muốn phụ huynh và trẻ bị thu hai subscription độc lập cho cùng quá trình phát triển.

**Trạng thái:** `USER_CONFIRMED_PRICING_REQUIREMENT` về **tránh thu hai đầu**, nhưng **chưa chốt công thức giá, giới hạn quyền lợi, seat policy hay tier**. Những đề xuất dưới đây là `RECOMMENDED_NOT_YET_APPROVED`.

### 1. Đề xuất sản phẩm: Family Subscription + Child Slots + Included Caregiver AI

- **Billing unit (đơn vị thanh toán):** một `Family Subscription` có người/trách nhiệm thanh toán chính (payer) và số **Child Slots được cấp quyền**; có thể hỗ trợ mua thêm slot hoặc tier nhiều trẻ trong tương lai.
- **Service beneficiary (người hưởng dịch vụ):** hồ sơ trẻ được hỗ trợ; **không phải** mỗi lượt đăng nhập hoặc số tài khoản phụ huynh. Hai phụ huynh cùng phối hợp vì một trẻ không mặc nhiên tạo hai subscription.
- **Caregiver Access:** các tính năng cần thiết để phụ huynh hỗ trợ trẻ và **một mức AI usage đi kèm gói**; không yêu cầu subscription thứ hai chỉ vì phụ huynh sử dụng AI trong Parent-led mode.
- **Usage actor:** ai tạo request AI (`parent/child/guardian`) khác với **usage scope** (`child-specific` hoặc `household/general`). Hai khái niệm bắt buộc tách để đo cost đúng.
- **Child-related parent AI:** ví dụ phụ huynh hỏi cách lập kế hoạch IELTS cho Child A, gắn `child_id=A` về attribution; việc quy chi phí vào quyền lợi/usage pool nào tùy chính sách tier đã duyệt.
- **Household/general parent AI:** ví dụ phụ huynh hỏi phương pháp quản lý lịch chung của cả ba trẻ, không ép gán request vào một trẻ; theo dõi ở `household_pool`.
- **Parent-led:** quyền lợi AI phụ huynh vẫn phải đủ để tạo/điều chỉnh kế hoạch khi trẻ chưa dùng Child App; billing không dựa số lượt trẻ thực tế đăng nhập hoặc hoàn thành nhiệm vụ.
- **Free / trial trước khi tạo child:** nên có cách trải nghiệm onboarding hạn chế, nhưng số request/giá/quyền cụ thể là giả thuyết chưa chốt.
- **AI quota không phải Wallet:** quota/credits theo quyền sử dụng nội bộ không đồng nghĩa số dư tiền, không mặc định có cơ chế nạp/rút/chuyển.

### 2. Minh họa — Gia đình có 3 trẻ + 1 phụ huynh

| Vai trò / ngữ cảnh | Đối tượng trả tiền đề xuất | Attribution chi phí AI nội bộ (chưa chốt quota) |
|---|---|---|
| Child A, B, C dùng Kid AI theo mức quyền | 1 Family Subscription bao gồm 3 child slots; không mở ba subscription rời | Usage theo từng child + household summary |
| Phụ huynh lập kế hoạch cho Child A | Cùng Family Subscription | `actor=parent`, `scope=child:A` |
| Phụ huynh tổng hợp kế hoạch chung gia đình | Cùng Family Subscription | `actor=parent`, `scope=household` |
| Giai đoạn phụ huynh tự thực thi vì trẻ còn nhỏ | Cùng Family Subscription | `actor=parent`, `scope=child:<id>`; quyền lợi cần phản ánh Parent-led usage |
| Phụ huynh thứ hai cùng chăm sóc trẻ | Không tự động tạo subscription mới | Phân quyền F01, usage theo actor và scope, có chính sách chống lạm dụng |

### 3. Ba mô hình pricing để nghiên cứu (CHƯA chốt)

| Mô hình | Ưu | Rủi ro |
|---|---|---|
| (M1) Phí per child slot, caregiver AI đi kèm | Dễ hiểu, không thu hai đầu, mở rộng theo số trẻ | Khó xử lý chi phí AI dùng chung hoặc số trẻ không hoạt động |
| (M2) Family base fee + phụ phí child slots | Bao phủ chi phí cố định của parent/household AI | Có thể làm khách hàng cảm giác phí hai lớp nếu mô tả không rõ |
| (M3) Tier family theo số child slots (1/2/3+) với parent AI gồm trong tier | Đơn giản hóa giá bán, dự báo ARPU | Chênh lệch tải thực tế giữa các gia đình; kiểm soát heavy usage |

**Khuyến nghị nghiên cứu:** (M3) gói gia đình theo số trẻ (hoặc M1 theo slot) **bao gồm caregiver AI**; không bán bắt buộc gói Parent AI thứ hai. **Đây không phải quyết định được duyệt về giá**, chỉ là hướng thử nghiệm giá và usage.

### 4. Các cạnh cần kiểm chứng

1. **Usage cost != subscription unit:** giá tính trên child slots nhưng cost phải đo cả parent AI, voice, vision và tác vụ backoffice.
2. **Parent-led:** chi phí phụ huynh có thể là chủ yếu ở trẻ nhỏ; không giả định luôn ít hơn Kid App. Cần cohort-specific cost model.
3. **Sharing & transfer:** phụ huynh khác đăng nhập không mặc nhiên trả tiền; dữ liệu riêng tư của trẻ không phụ thuộc ai là payer; trẻ đủ 18 tuổi phải có quy tắc chuyển sang adult account/paid individual tier hoặc chia sẻ theo consent, **chưa chốt chuyển đổi thương mại**.
4. **Inactive children:** cần phân biệt số child slot đang cấp, số hồ sơ được hưởng quyền và hoạt động AI thực tế; không tự ý xóa tiến độ nếu family downgrade.
5. **Safety exception:** rate limit/quota không được ngăn chức năng bảo vệ an toàn thiết yếu; cần quota abuse controls và kiểm soát chi phí.
6. **Expensive AI:** real-time Voice và vision assessment có thể cần fair use, quota hoặc add-on sau này; không mặc định không giới hạn.
7. **Store/payment policy:** kiểm tra điều kiện từng nền tảng app và khu vực khi chọn mô hình thanh toán, chưa xác nhận triển khai.
8. **Data/privacy:** không lấy quyền thanh toán làm cơ sở cho phép truy cập Child Journal, learning records người trưởng thành hay dữ liệu nhạy cảm.

### 5. Metadata tối thiểu để lập Cost Model (đề xuất, không phải schema DB đã chốt)

`family_subscription_id`, `payer_account_id`, `child_slot_id`, `beneficiary_child_id?`, `actor_account_id`, `actor_role`, `usage_scope` (`CHILD`/`HOUSEHOLD`), `usage_type` (`TEXT`/`VOICE`/`VISION`/`BATCH`), `model_or_execution_type`, `unit_cost_estimate`, `period`, `entitlement_policy_version`.

Tránh nhân đôi: một request dùng chung cho nhiều trẻ không tự động tính chi phí ba lần; có thể phân bổ analytics sau, nhưng billing và cost attribution phải độc lập.

### 6. Research / Test Delta — không ghi vào Master Backlog khi chưa duyệt

- Chi phí AI theo actor, child/household scope, cohort (0–5 chủ yếu parent-led; 6–17 hỗn hợp; 18–23 adult).
- Gói 1/2/3+ trẻ, add/remove child slot, trial, downgrade, parent-led usage, quyền lợi AI voice/vision, heavy usage, abuse, refund.
- Độ nhạy contribution margin với `3 child + 1 parent` và `3 child + 2 parents`, ít/đều/nhiều AI.
- Test case: parent mua Premium cho 3 child; parent lập kế hoạch 1 child; shared family request; đổi người trả tiền; child đủ 18; gỡ 1 child; quota depleted; external marketplace purchase.
- Khảo sát willingness-to-pay và user understanding; hiện **không có bằng chứng** về mức giá/discount tối ưu.

## III. Ranh giới ownership và liên kết module (đề xuất)

| Module | Boundary |
|---|---|
| `F01-G06-M02` Entitlements & Subscription | Gia đình/child slots, quyền lợi parent-child, kiểm tra quyền sử dụng |
| `F01-G06-M03` Subscription Billing Lifecycle | Vòng đời mua, gia hạn, hoàn tiền, thay đổi gói; không đồng nhất actor với payer |
| `F07-G07-M02` Billing & Cost Operations | Theo dõi usage/cost, quota, cảnh báo bất thường, đối soát lỗi |
| `F01-G04-M01/M02` Roles/Consent | Gia đình nhiều phụ huynh, quyền dữ liệu và tham gia kế hoạch |
| `F08-G06-M01/M02` Education Finance | Ngân sách chi tiêu giáo dục; **không** phải hệ thống thanh toán Premium hoặc Wallet |
| `F08-G05-M01/M02` Commerce | Dịch vụ đối tác/marketplace và giao dịch liên quan; quảng cáo phải minh bạch |

## IV. Trạng thái và bước tiếp theo

- **Package D:** đã chốt các quyết định L3 Q1–Q4; pricing có nguyên tắc đã được người dùng nêu, mô hình chi tiết ở trạng thái đề xuất, **không coi là đã chốt**.
- **Package A/B/C:** quyết định riêng đã được lưu trước đó; bản này không thay thế.
- **Package E:** chưa review, cần đối chiếu AI usage/quota/real-time voice với pricing của Package D.
- **Feature Inventory chính thức:** **KHÔNG THAY ĐỔI**. Consolidation sau Package E và phê duyệt của chủ sản phẩm.