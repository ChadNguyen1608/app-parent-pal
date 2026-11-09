# PRODUCT BLUEPRINT — BÁO CÁO RÀ SOÁT 3.2 & ĐỀ XUẤT THAY ĐỔI

**Phiên bản:** Dự thảo để duyệt 1.0 — 09/11/2026  
**Phạm vi:** Sản phẩm dài hạn 0–23 tuổi, toàn bộ 6 nhóm tuổi, **không giới hạn MVP**.  
**Trạng thái:** `REVIEW_ONLY / CHUA_CAP_NHAT_BLUEPRINT`

**Tài liệu đối chiếu:** Feature Inventory 3.2 (8 Domain, 49 Group, 98 Module L3 đại diện); Use Case Mapping 3.4 (24 Use Case mẫu); Change Log SC-001, SC-002; các quyết định SC-003 trong cuộc trao đổi; Scenario Management Rules.

> **Đây là BẢN ĐỀ XUẤT THAY ĐỔI, không phải Feature Inventory mới.** Tất cả CP-01 đến CP-24 đều chờ xem xét/phê duyệt. Không có thay đổi nào được áp dụng vào 3.2, 3.3, 3.4, các Change Log hay Master Research Backlog. SC-003 chưa có log lưu riêng khi thực hiện audit.

## 1. Mục đích và phương pháp

Kiểm tra: (1) 49 nhóm L2 và 98 module L3 được đặt tên; (2) độ bao phủ toàn bộ tầm nhìn và 6 nhóm tuổi; (3) các khoảng trống SC-001–003; (4) đầy đủ vòng đời tính năng và vận hành; (5) trùng lặp, ranh giới trách nhiệm; (6) phụ thuộc dữ liệu, quyền, nghiên cứu.

**Giới hạn:** Đây là kiểm tra cấu trúc **trên tài liệu**, không phải khảo sát người dùng, kiểm tra phần mềm chạy thật, đánh giá pháp lý, y khoa hay nghiên cứu thị trường độc lập. **Chưa chấm User Value, chưa xếp hạng MVP.**

**Các trạng thái bao phủ:**
- `COVERED`: Đã có capability có tên và phạm vi tương đối rõ.
- `PARTIAL`: Có module liên quan nhưng thiếu trách nhiệm/luồng đầu-cuối.
- `MISSING`: Chưa thấy capability L3 cụ thể.
- `UNCERTAIN`: Cần quyết định sản phẩm hoặc dữ liệu bổ sung.

Các trạng thái trên **không chứng minh tính năng đã được lập trình hoặc đủ điều kiện phát hành**.

**Loại hành động đề xuất:** `KEEP` (giữ), `CLARIFY` (làm rõ), `EXTEND` (mở rộng), `REUSE` (dùng chung), `SPLIT` (tách), `ADD` (đề xuất bổ sung), `DEFER_DECISION` (hoãn quyết định), `DATA_ONLY` (chỉ bổ sung dữ liệu), `POLICY_ONLY` (chỉ hoàn thiện quy tắc). `ADD` **không** đồng nghĩa đã duyệt tạo Module L3. Nhãn H/M/L là mức khẩn cấp **cần làm rõ cấu trúc**, **không phải ưu tiên MVP**.

## 2. Kết luận tổng quan

- **Nền tảng tốt:** 8 Domain hiện tại có phạm vi đủ rộng; chưa có căn cứ bắt buộc tạo Domain thứ chín. Account, Family, Consent, Child Profile, Goal, Plan, Schedule, Kid Companion, Journal riêng tư, Progress, Knowledge Governance, Safety, Integrations và Commerce đã có vị trí trong baseline.
- **Giới hạn lớn nhất:** 98 module hiện nay được tạo theo mẫu **2 module cho mỗi trong 49 group**, không phải kết quả phân rã toàn bộ nghiệp vụ. `49 × 2 = 98` là quy tắc lập baseline, **không chứng minh inventory đầy đủ**.
- **Các khoảng trống chính:** Roadmap dài hạn, Balanced/Adaptive Planning, chấm bài và báo cáo học tập, dữ liệu nghề nghiệp và dự án thử nghề, vòng đời Premium/Billing, ngân sách giáo dục và định nghĩa Wallet, AI Voice, chuyển quyền khi trẻ đủ 18 tuổi, kiểm soát luồng insight riêng tư và chức năng hỗ trợ/vận hành.
- **Hướng xử lý:** Ưu tiên `EXTEND` module đang có, chỉ đề xuất thêm L3 nếu có trách nhiệm nghiệp vụ riêng; không tạo 24 module mới một cách cơ học từ 24 đề xuất dưới đây.

## 3. Rà soát theo 8 Domain

| Domain | Số Group | Mức bao phủ | Nền tảng đã có | Điểm cần bổ sung/làm rõ |
|---|---:|---|---|---|
| **F01 — Family & Identity** | 6 | PARTIAL | Xác thực, gia đình, vai trò, consent, autonomy, tài khoản, entitlement | Vòng đời đăng ký Premium; nhiều người giám hộ và tranh chấp; chuyển quyền khi trưởng thành; yêu cầu dữ liệu và khiếu nại thanh toán |
| **F02 — Child Understanding** | 6 | PARTIAL | Khởi tạo hồ sơ, sở thích, điểm mạnh, bối cảnh, hồ sơ theo phiên bản, nguồn dữ liệu | Tín hiệu sức khỏe/cảm xúc, thời gian quan sát, phạm vi sử dụng dữ liệu theo mục đích |
| **F03 — Development Guidance** | 6 | PARTIAL | Framework, hướng dẫn theo tuổi, goal, recommendation, goal review | Cấu trúc nghề/kỹ năng/thị trường, roadmap dài hạn, khám phá và định hướng linh hoạt |
| **F04 — Planning & Execution** | 7 | PARTIAL | Kế hoạch, lịch, nhiệm vụ, thực thi, báo cáo, phê duyệt, nhắc việc | Ràng buộc tải học, Standard Bar, ngoại lệ có hạn, thích nghi theo nguyên nhân, milestone |
| **F05 — Child Companion & Journal** | 6 | PARTIAL | AI cho trẻ, check-in tùy chọn, phản hồi, nhật ký riêng tư, insight riêng tư, xóa dữ liệu | AI Voice, ranh giới Journal/Check-in/Planning, hướng dẫn trẻ tìm trợ giúp khi có nguy cơ |
| **F06 — Tracking & Insights** | 6 | PARTIAL | Nhật ký sự kiện, tiến độ, chỉ số, xu hướng, báo cáo, review | Chấm bài thật, cấu trúc kỹ năng/dạng lỗi, mức tin cậy, so sánh bài khác độ khó, báo cáo theo nguồn |
| **F07 — Knowledge, Safety & Governance** | 7 | PARTIAL | CMS, nguồn, AI routing, model evaluation, safety, permission, operations | Lịch tái xác minh kiến thức, quy tắc multimodal, phân quyền billing/ops, xử lý sự cố và hỗ trợ |
| **F08 — Extended Ecosystem** | 5 | PARTIAL | Trường học, chuyên gia, tài nguyên, thiết bị, thương mại | Ngân sách giáo dục, định nghĩa Wallet, dữ liệu lớp phụ đạo, vòng đời giao dịch marketplace, đối tác/giáo viên |

**Lưu ý 6 nhóm tuổi:** Ma trận 49 Group × 6 cohort trong 3.2 mô tả *ai tương tác*, chưa chứng minh từng capability an toàn và sử dụng được ở tất cả độ tuổi. Cần đặc biệt kiểm tra 0–5 tuổi (phụ huynh là tác nhân chính), 15–17 (quyền tự chủ phù hợp) và 18–23 (người trưởng thành tự quản lý tài khoản/dữ liệu).

## 4. Danh mục 24 đề xuất thay đổi (CHƯA PHÊ DUYỆT)

| Mã | Hành động đề xuất | Vị trí dự kiến | Nội dung cần làm rõ hoặc bổ sung | Mức rà soát | Nguồn |
|---|---|---|---|---|---|
| **CP-01** | EXTEND | F03-G04/G06; F04-G01/G02/G06 | Roadmap từ mục tiêu dài hạn → giai đoạn/năm/học kỳ → milestone → kế hoạch/nhiệm vụ; phiên bản và review. Dùng chung giữa lộ trình thi và khám phá nghề. | H | SC-001/003 |
| **CP-02** | EXTEND | F04-G01/G02; F03-G01/G03; F07-G02 | Balance Validation: tải lượng và hồi phục dựa trên bằng chứng; Family Standard Bar; mức cảnh báo và quyền thay đổi ràng buộc mềm; tách quy tắc an toàn khỏi sở thích. | H | SC-001 |
| **CP-03** | EXTEND | F04-G06/G07 | Ngoại lệ cân bằng khi ôn thi: ngày hiệu lực, quyền duyệt, hết hạn, nhắc cân bằng lại, dừng sớm khi có rủi ro. Phân biệt Standard Bar dài hạn. | H | SC-001 |
| **CP-04** | EXTEND + REUSE | F02-G04/G06; F05-G02; F06-G04/G06; F04-G06 | Adaptive Planning theo nguyên nhân: chỉ dùng feedback/quan sát hợp lệ; phân biệt giả thuyết và dữ kiện đã kiểm chứng; đánh giá hiệu quả sau thay đổi; không tự ý đổi kế hoạch quan trọng. | H | SC-001/002 |
| **CP-05** | DATA_ONLY + EXTEND | F07-G01/G02; F03-G05 | Admissions Intelligence: trường/năm/khu vực/điều kiện/nguồn/ngày xác minh/người duyệt; kết quả web để trạng thái provisional, bản chính cần human xác nhận. | H | SC-001 |
| **CP-06** | EXTEND / cân nhắc ADD L3 | F04-G05; F06-G01/G03/G04/G05 | Chấm bài và kiểm tra: tách giao bài, bài làm, kết quả, người/nguồn chấm; phân tích lỗi, chấm trình bày chữ cơ bản, dữ liệu phụ đạo, báo cáo tháng có căn cứ. | H | SC-002 |
| **CP-07** | CLARIFY | F05-G04/G05/G06; F07-G05/G06; F01-G04 | Phân tách Journal, check-in tự nguyện và feedback planning theo mục đích; không tiết lộ insight gián tiếp; hỗ trợ trẻ chủ động chia sẻ và escalation an toàn qua chính sách chung. | H | SC-001/002 |
| **CP-08** | EXTEND | F03-G03/G04/G05; F07-G01/G02 | Career Intelligence: taxonomy, nghề liên ngành, kỹ năng có ích, ưu thế hiện tại nếu có dữ liệu, thị trường có nguồn, lộ trình khám phá; không kết luận trẻ “phù hợp/không phù hợp nghề”. | H | SC-003 |
| **CP-09** | EXTEND + REUSE | F04-G03/G04/G05; F06-G06 | Dự án thử nghề do trẻ chủ động: nhiệm vụ, sản phẩm riêng tư/an toàn, tiến bộ kỹ năng, tự đánh giá; dùng chung Task/Milestone, không tạo Career Planner riêng. | M | SC-003 |
| **CP-10** | EXTEND | F07-G01/G02 | Knowledge Governance: nguồn, provenance, lịch cập nhật, web cache tạm, human review, phiên bản, hết hạn, đính chính; cache không tự nâng thành approved. | H | SC-001/003 |
| **CP-11** | EXTEND | F01-G06-M02; F07-G07-M02; F08-G05 | Vòng đời Premium và Payment: dùng thử, mua, xác nhận giao dịch, gia hạn, hạ gói, hủy, hoàn tiền, thanh toán thất bại, quyền lợi/quota, tranh chấp. Phân rõ payment state owner. | H | Audit vận hành |
| **CP-12** | DEFER_DECISION / có thể ADD L3 | F08-G05 hoặc F04/F06 | Tài chính giáo dục: ngân sách từng trẻ, dự toán/thực chi, khoản định kỳ, duyệt chi, dự báo. Tách khỏi billing Premium. | M | Nhu cầu mở rộng |
| **CP-13** | DEFER_DECISION | F08-G05; F01-G06 | Cần định nghĩa Wallet: credits/quota AI, số dư trả trước, ví tiền thật hay kết hợp? Khác nhau về ledger, hoàn tiền, đối tác thanh toán, pháp lý và bảo vệ người dùng. | H | Quyết định sản phẩm |
| **CP-14** | EXTEND / cân nhắc ADD L3 | F05-G01/G04; F07-G03/G04; F01-G04 | AI Voice: nhận giọng nói STT, phát giọng nói TTS, đối thoại thời gian thực (nếu có), consent, retention, safety, accessibility, transcript, chi phí, fallback. Journal mặc định không lưu voice. | H | Audit AI |
| **CP-15** | EXTEND | F01-G02/G04/G05/G06 | Nhiều phụ huynh/người giám hộ, thay đổi thành viên gia đình, tranh chấp consent, trẻ đủ 18 tuổi, bàn giao/thu hồi truy cập, lịch sử dữ liệu và khôi phục tài khoản. | H | Audit nhóm tuổi |
| **CP-16** | EXTEND | F08-G01/G04; F02-G06; F06-G01 | Nhập dữ liệu giáo dục từ nguồn đáng tin: lớp phụ đạo, báo cáo giáo viên trong tương lai, nhập tay có nguồn, chống trùng, thu hồi quyền, dữ liệu cũ hoặc mâu thuẫn. | M | SC-002 |
| **CP-17** | CLARIFY / EXTEND | F07-G04/G05/G07 | Vận hành xử lý an toàn trẻ em: phân loại nguy cơ khác với kết luận cáo buộc, người lớn đáng tin, phê duyệt hỗ trợ của người có thẩm quyền, log tối thiểu, khiếu nại/sai cảnh báo; không tự cáo buộc. | H | SC-002 |
| **CP-18** | EXTEND | F07-G07; F01-G06; F08-G05 | Hỗ trợ khách hàng, hoàn tiền/tranh chấp, kiểm duyệt nội dung, xử lý lỗi, sự cố, audit access, backup/recovery; dữ liệu hỗ trợ thông thường tách Journal riêng tư. | M | Audit vận hành |
| **CP-19** | CLARIFY | F01/F05/F07/F08 | Hoạt động sáng tạo nội dung của trẻ: độ tuổi đăng tải, quyền công khai, moderation, privacy, consent, giám sát và yêu cầu từng nền tảng; không bắt buộc đăng video công khai. | H | SC-003 |
| **CP-20** | EXTEND | F07-G03/G04/G07; F06-G05 | Unit economics AI: quota, fallback, benchmark, cache/batch, chi phí theo capability; chấm bài AI giữ ở pilot đến khi xác minh chất lượng và chi phí. | M | SC-002 |
| **CP-21** | CLARIFY / cân nhắc ADD L3 | F01-G06; F07-G06 | Vòng đời tài khoản/dữ liệu: 18+ tự quản, export, xóa theo chính sách 60 ngày và ngoại lệ hợp lệ, thu hồi quyền, giới hạn truy cập admin, dữ liệu chia sẻ lịch sử. | H | Privacy & tuổi |
| **CP-22** | CLARIFY / EXTEND | F03-G03; F04-G04; F05-G01; F07-G04 | Khả năng tiếp cận theo tuổi, ngôn ngữ, khuyết tật, thiết bị; phân biệt hoạt động do phụ huynh điều khiển với trẻ trực tiếp sử dụng theo 6 cohort. | M | Audit nhóm tuổi |
| **CP-23** | CLARIFY / EXTEND | F08-G05; F07-G02/G07 | Marketplace: onboarding đối tác, phân biệt nội dung tài trợ, xác minh năng lực, khiếu nại, cung cấp dịch vụ, phân bổ trách nhiệm; không trộn với Premium nội bộ. | M | Audit hệ sinh thái |
| **CP-24** | CLARIFY / EXTEND | F04-G07; F07-G07 | Notification: kênh gửi, retry, múi giờ, quiet hours, opt-out, cảnh báo quan trọng, chuyển quyền tài khoản; không gửi Journal riêng tư cho phụ huynh ngoài quy trình được phép. | M | Audit xuyên Domain |

**H:** Cần làm rõ cấu trúc sớm · **M:** Có thể làm rõ ở vòng phân rã tiếp theo. Không có mã CP nào tự động tạo thêm L3.

## 5. Các điểm chồng lấn — Ranh giới khuyến nghị

| Nhóm dễ trùng | Phân định trách nhiệm | Cần tránh |
|---|---|---|
| F03 Goals vs F04 Planning | F03 quyết định **mục tiêu và lý do**; F04 quản lý **thực hiện, lịch, phê duyệt phiên bản**. | Hai goal/planning engine độc lập |
| F04 Execution vs F06 Reports | F04 ghi nhận hoàn thành/bằng chứng; F06 phân tích và tổng hợp. | Hai nguồn sự thật tiến độ xung đột |
| F01 Subscription vs F07 Billing Ops vs F08 Commerce | F01 quyền lợi gói gia đình; F07 giám sát/vận hành; F08 marketplace. Cần chỉ định chủ sở hữu trạng thái thanh toán chuẩn khi thiết kế kỹ thuật. | Biến mọi thanh toán thành một “Wallet” |
| F03 Guidance vs F07 Knowledge | F03 áp dụng kiến thức vào định hướng; F07 quản trị nguồn, xác minh, phiên bản. | Tạo human-review riêng lặp lại cho mỗi dataset |
| F02 Wellbeing vs F05 Journal | F02 chỉ sử dụng observation có quyền; F05 giữ Journal và insight riêng tư; F06 chỉ nhận dữ liệu được phép. | Tự đưa cảm xúc từ nhật ký lên báo cáo phụ huynh |
| F06 Insights vs F04 Adaptive Planning | F06 đánh giá tiến độ/xu hướng; F04 đề xuất thay đổi kế hoạch có phê duyệt; F03 quản trị thay đổi mục tiêu. | Dashboard tự sửa kế hoạch đã phê duyệt |
| F03 Career Pathway vs F04 Career Tasks | F03 nội dung nghề, kỹ năng, lộ trình; F04 nền tảng thực thi dự án. | Xây Career Task Engine riêng |
| F07 AI Router vs F05 Child AI | F07 AI orchestration và chính sách chung; F05 trải nghiệm hội thoại theo ngữ cảnh trẻ và quyền riêng tư. | Một agent có quyền truy cập mọi dữ liệu |

### Các xung đột cần kiểm soát

1. **Family Standard Bar ↔ Safety:** Gia đình điều chỉnh ưu tiên nhưng không tự vô hiệu hóa ranh giới an toàn được thẩm định.
2. **Child Journal ↔ Planning/Reports:** Không đưa nhật ký riêng tư hoặc insight suy ra vào kế hoạch/báo cáo phụ huynh ngoài phạm vi được phép; Safety Escalation là luồng riêng.
3. **Child-led Exploration ↔ Parent Approval:** Trẻ chủ động đề xuất và thực hành; việc công khai nội dung, chi tiền... cần quyền phù hợp; người dùng 18+ tự quyết định.
4. **Long-term Coverage ↔ MVP:** Có trong Inventory không đồng nghĩa phải triển khai trong MVP, nhất là AI vision, Wallet hoặc tính năng tốn chi phí/nhạy cảm.

## 6. Kiểm tra xuyên suốt các nhóm tuổi và vận hành

| Phạm vi | Đã có nền tảng | Cần kiểm chứng |
|---|---|---|
| **0–2 tuổi** | Hồ sơ trẻ, hướng dẫn theo tuổi, lập kế hoạch do phụ huynh quản lý | Hoạt động phụ huynh quan sát, không bắt trẻ sơ sinh trực tiếp dùng chatbot |
| **3–5 tuổi** | Biến thể theo tuổi, check-in, nhiệm vụ hướng dẫn | UX trước tuổi đọc tốt, tương tác cùng phụ huynh, an toàn screen-time và giọng nói |
| **6–10 tuổi** | Nhiệm vụ, Kid AI, phản hồi có giám sát | Pilot chấm bài, ảnh chữ viết, giải thích quyền riêng tư |
| **11–14 tuổi** | Nhật ký, phản tư, mục tiêu | Khám phá chủ động, điều kiện đăng nội dung, đồng thuận và wellbeing |
| **15–17 tuổi** | Chủ động định hướng nhiều hơn | Chuyển cấp/nghề, giảm giám sát quá mức, phân quyền nội dung công khai |
| **18–23 tuổi** | Mô hình tài khoản tự quản | Không mặc định chia sẻ cho phụ huynh; độc lập billing, chuyển quyền dữ liệu |
| **Admin & Operations** | F07-G05/G07 | Support, refund, human review, sự cố an toàn, audit, khiếu nại |
| **Commerce** | F01-G06, F08-G05 | Premium vs marketplace vs stored credits/tiền |
| **AI Quality & Cost** | F07-G03/G04/G07 | Voice, Vision, chấm bài thử nghiệm, benchmark, quota, fallback |
| **Integrations** | F08-G01/G04 | Nguồn giáo dục, thu hồi quyền, đồng bộ lỗi, độ tin cậy nguồn |
| **Accessibility** | F03-G03-M02 | Biến thể theo cohort, hỗ trợ người khó đọc/không nói/khuyết tật |

## 7. Chia thành 5 gói để duyệt

| Gói | Các CP | Nội dung chính |
|---|---|---|
| **A — CORE Guidance & Planning** | CP-01 đến CP-05 | Roadmap, cân bằng, Standard Bar, ngoại lệ, thích nghi, Admissions Intelligence |
| **B — Child Learning & Safety** | CP-06, 07, 16, 17 | Chấm bài, báo cáo nhiều nguồn, quyền Journal, xử lý an toàn |
| **C — Career Exploration & Knowledge** | CP-08, 09, 10, 19 | Dữ liệu nghề, dự án thử nghề, điều kiện công khai nội dung, quản trị tri thức |
| **D — Accounts, Commerce & Finance** | CP-11, 12, 13, 15, 21, 23 | Subscription, ngân sách học tập, định nghĩa Wallet, 18+, Marketplace |
| **E — AI Modalities & Operations** | CP-14, 18, 20, 22, 24 | AI Voice, vận hành, chi phí AI, accessibility, notification |

**Khuyến nghị:** Bắt đầu gói A và B vì có quan hệ trực tiếp với các quyết định Scenario đã chốt. Không cần duyệt toàn bộ 24 CP trong một lần.

## 8. Những quyết định còn cần người dùng xác nhận

1. **Nguyên tắc hợp nhất:** Ưu tiên mở rộng L3 hiện tại và tái sử dụng capability; chỉ tạo mới khi trách nhiệm và workflow thực sự khác. Đây là phương án kết hợp đã đồng thuận trong trao đổi.
2. **Education Finance:** Chỉ theo dõi ngân sách/dự toán, hay bao gồm nhập thực chi, phân quyền duyệt chi, hóa đơn và liên kết giao dịch?
3. **Wallet:** Credits/quota nội bộ, số dư lưu trữ/trả trước, phương tiện thanh toán thực, cả hai, hay chưa thuộc phạm vi?
4. **AI Voice:** Chỉ đọc văn bản, nhận lời nói, hội thoại thời gian thực, hay bao phủ cả ba trong tầm nhìn dài hạn?
5. **Homework Assessment:** Giữ ở Prototype/Pilot, chỉ mở rộng khi benchmark chất lượng và chi phí đạt yêu cầu (đã đồng thuận ở SC-002).
6. **SC-003:** Nên lưu Change Log riêng để có nguồn truy vết trước khi hợp nhất (đề xuất).

## 9. Workflow tiếp theo — Trước khi cập nhật 3.2

1. **Bạn duyệt/phản biện** phạm vi, phân loại gap và 24 đề xuất trong báo cáo này.
2. Tôi trình tiếp **L3 Change Mapping** theo từng gói: ghi chính xác Module ID `KEEP / EXTEND / SPLIT / MERGE / ADD` và ảnh hưởng lên sáu cohort.
3. Bạn chốt từng gói, kể cả các quyết định sản phẩm còn bỏ ngỏ.
4. **Chỉ sau khi chốt** mới sửa 3.2 và những tham chiếu thực sự cần thiết của 3.3/3.4.
5. Câu hỏi nghiên cứu mới được đưa vào bản **Research Delta dự kiến**, chưa đưa vào Master Research Backlog chính thức trước khi bạn duyệt.
6. Sau khi Inventory ổn định, thực hiện **3.3 Scoring Rubric, pilot scoring**, rồi chuẩn bị lựa chọn MVP trong Stage 03.

## 10. Giới hạn của báo cáo

- Chỉ rà soát cấu trúc tài liệu; không chứng minh code đã chạy, tính năng hiệu quả, hợp pháp hoặc có chi phí hợp lý.
- Chưa khảo sát giá trị với người dùng thực tế.
- Chưa xây ngưỡng an toàn y khoa/pháp lý; cần thẩm định từ chuyên gia.
- Chưa liệt kê mọi hành động L4, UI state, API hay exception flow; các phần này được làm rõ trong các stage tiếp theo.
- Mọi CP đều ở trạng thái **PROPOSED / CHƯA PHÊ DUYỆT**; tài liệu chính thức 3.2 giữ nguyên.