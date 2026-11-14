# Parent-Pal — P6 Pilot 1: Access Policy — Owner Decision Log

**Ghi nhận:** 2026-11-12  
**Module:** `F01-G04-M01` — Access Policy  
**Trạng thái quyết định:** `OWNER_DECISIONS_CONFIRMED` (OQ-1 đến OQ-5)  
**Trạng thái pilot:** `PILOT_REVIEW_COMPLETED_CONDITIONAL / FINAL_REGRESSION_PENDING`  
**Phạm vi phê duyệt:** Chính sách nghiệp vụ cho thiết kế L4; **không** phê duyệt stable L4 IDs, toàn bộ đề xuất 4 L4, test chạy trên ứng dụng, việc triển khai sản phẩm hay phương pháp P6 trên ba L3.

## A. Xuất xứ và bằng chứng

- **Nguồn phản biện:** Hồ sơ Claude Code do Product Owner cung cấp qua `P6_F01-G04-M01.zip`, có `09_Owner_Review_Package.md`, `10_Execution_Evidence.md`, QA, kiến trúc, findings, validator và các snapshot. Đây là **bằng chứng do bên chạy pilot tự cung cấp**, không phải audit độc lập; bản ZIP không được commit vào repository trong thay đổi này.
- **Bản nguồn mà Claude báo cáo đã dùng:** PR #17, commit ngắn `ea76c06`; cần kiểm tra lại khi so sánh với phiên bản mới nhất trên PR #17.
- **Kết quả Claude tự báo cáo:** 4 L4 ứng viên, 67 test thiết kế, 43 findings; 25 `FIXED`, 12 `OWNER_DECISION_REQUIRED`, 4 `RESEARCH_REQUIRED`, 2 `DEFERRED`; đối chiếu 19/19 Access baseline P5 theo phân loại tương đương về thiết kế, **không** phải 19 app tests đã pass. Một warning validator và các test còn `UNKNOWN` cần kiểm tra cuối.
- **Nguồn quyết định Owner:** Product Owner trả lời “OQ1 ... 1 gia đình chỉ có 1 caregiver, những người còn lại hỗ trợ. Các phần còn lại làm theo đề xuất/đánh giá của bạn.” Nội dung chốt dưới đây dựa trên hướng giải thích do ChatGPT trình bày và Owner chấp thuận.
- **Nguồn chuẩn:** P5 Owner Decision Log R1=A/R2=A/R3=A; Blueprint 3.2/3.3/3.4 canonical và các tài liệu P5 trên PR #17.

## B. Năm quyết định nghiệp vụ đã được chốt

| ID | Quyết định được chấp thuận | Giới hạn và hệ quả | Finding/test liên quan từ hồ sơ Claude |
|---|---|---|---|
| **P6-AP-OD-01 (OQ-1)** | Trong **mỗi gia đình chỉ có một Primary Caregiver đang hiệu lực**; những người trưởng thành khác là **Supporter/Observer** với quyền được cấp, không đồng thời làm Primary Caregiver. | `family_primary_caregiver` là vai trò điều phối cấp gia đình. Caregiver được đề cử qua onboarding và phải đáp ứng xác minh/quyền cần thiết; không tự giành quyền ở gia đình hay với trẻ đã tồn tại. Một caregiver mặc định quản lý các kế hoạch của trẻ chưa tự quản **theo từng child/plan scope được xác lập**; một primary cho từng scope vẫn có hiệu lực. Không đồng nhất caregiver của ứng dụng với người giám hộ hợp pháp; không áp dụng quyền mặc định với người trưởng thành tự quản. Chi tiết kiểm tra thẩm quyền trong tranh chấp/pháp luật vẫn cần nghiên cứu. | F-001, F-026, F-031; QT-040/041; AC-01/11/12/21 |
| **P6-AP-OD-02 (OQ-2)** | Primary Caregiver được quản lý cấp quyền xem **dữ liệu học tập/phát triển được phép** của trẻ trong scope, gồm tiến độ, đánh giá và báo cáo; không tự được đọc Journal, nội dung riêng tư hoặc thông tin an toàn chỉ vì role. | Grant giới hạn `resource/action/purpose/scope/consent`, không cấp vượt quyền; log và audit. Grant cũ sau handover không mặc nhiên bị mở rộng, phải đánh dấu `REVIEW_REQUIRED` và đánh giá lại theo chính sách hiện hành. Quyền tham gia/đồng ý của trẻ theo độ tuổi và pháp luật vẫn `RESEARCH_REQUIRED`. | F-027/F-008; QT-006/023/059; AC-22 |
| **P6-AP-OD-03 (OQ-3)** | **F01-G04 sở hữu quy tắc, trạng thái và quy trình authorization/handover Primary Manager/Caregiver.** F01-G05 chỉ tham gia khi bàn giao liên quan tới thay đổi chế độ tự chủ. | Làm rõ phân công ghi trong P5-OD-03: tên F01-G05 tại tiêu chí handover là **bên tham gia**, không phải chủ sở hữu luồng. Không sửa hồi tố tài liệu P5; đây là clarification có trace. Bắt buộc versioning, audit, revoke, re-check quyền trước mutation. | F-012, B-008; AI-03/20/23 |
| **P6-AP-OD-04 (OQ-4)** | Người từ **18 tuổi đã được xác minh** tự quản tài khoản, dữ liệu và kế hoạch; chia sẻ cho gia đình là tự nguyện. | Quyền chính của Primary Caregiver trong gia đình **không** vượt quyền của chủ thể trưởng thành. Chuyển giao có kiểm tra tuổi/quyền, giữ an toàn khi trạng thái chưa xác minh; nghiên cứu chi tiết pháp lý và recovery vẫn mở. | F-013; QT-032/035; MR-017 |
| **P6-AP-OD-05 (OQ-5)** | Trong `Child-directed`, trẻ có thể tạo đề xuất và **chỉnh sửa trong phạm vi đã được Primary ủy quyền**; thay đổi quan trọng hoặc vượt scope cần được phê duyệt đúng quyền. | Tách `proposal`, `draft edit`, `delegated mutation`, `approval`, `commit`; audit/thu hồi quyền ủy quyền/giới hạn theo loại hành động và tuổi. Primary duy nhất không loại trừ `delegated mutation` hợp lệ. Không cho vượt protected hard-cap. | QU-010, AI-05; QT-028 |

## C. Kiểm tra tính nhất quán với P5

- **P5 R1=A:** Baseline 64 test thiết kế trên ba pilot vẫn giữ nguyên; Access có 19 test baseline. 67 test Claude tạo thuộc **kết quả đề xuất của Pilot 1**, không tự thay thế hoặc nâng baseline P5.
- **P5 R2=A:** 60 ngày/kỳ, 7 ngày trống hoàn chỉnh cho ngoại lệ tương tự; không làm thay đổi trong Access. Chuyển kiểm tra tác động sang Balanced Planning Pilot 3.
- **P5 R3=A:** “Một Primary Manager trên mỗi plan scope” được giữ; quy tắc mới “một Primary Caregiver cấp gia đình” là **ràng buộc bổ sung ở tầng gia đình**, không phải xóa scope per child hoặc cho quyền quản lý mọi đối tượng. Khác biệt này phải thể hiện ở domain model, contract và negative tests.
- **Journal:** Chỉ chia sẻ theo policy riêng; vai trò Caregiver/Observer không có quyền Journal mặc định.
- **Canonical:** Blueprint 3.2/3.3/3.4 chưa thay đổi. Chưa cấp stable L4 IDs.

## D. Vấn đề chưa được phê duyệt hoặc chưa kiểm chứng

1. **Cấu trúc bốn L4 ứng viên:** P5 chỉ chọn một Access outcome trọng tâm. Pilot 1 đề xuất bốn L4; cần trace outcome/ownership độc lập và qua bước phê duyệt thiết kế sau, **không coi OQ-1..5 là phê duyệt đủ bốn L4**.
2. **Findings:** 12 finding chờ Owner không tự động đồng nghĩa 12 finding được đóng bằng năm quyết định; cần map từng finding đến quyết định, sửa/re-review và giữ các finding ngoài phạm vi ở trạng thái mở.
3. **Validator:** Báo cáo pilot có warning enum `OWNERSHIP_UNKNOWN`; chưa có bằng chứng re-run sau quyết định Owner. Trạng thái `FINAL_REGRESSION_PENDING`.
4. **Độ bất định:** 29/67 test Claude báo có kỳ vọng `UNKNOWN` ít nhất một phần; phải phân loại theo Owner/Research/module, không tự đổi `PASS`.
5. **Nghiên cứu:** MR-016/017 (đồng ý, tuổi, guardianship), MR-021/022 (audit, safety), xác minh primary/dispute và quyền chia sẻ theo pháp luật giữ `UNKNOWN / RESEARCH_REQUIRED`.
6. **Bằng chứng tác vụ:** Chưa có app integration test hay kiểm định chuyên gia. Kết quả live Claude Code pilot được báo cáo trong ZIP, chưa phải kết quả nghiệm thu phương pháp toàn hệ thống.

## E. Kế hoạch tiếp nối và phân vai

- **Claude Code:** Chỉ thực hiện **pilot/review** cho `F06-G07-M01` Academic Assessment và `F04-G02-M03` Balanced Planning theo tài liệu đã được cập nhật; tối đa **3 sub-agent**, dùng **Sonnet 5.5 nếu có sẵn và đúng model ID**; không tự đổi model; giới hạn lượt/chia nhỏ context để tiết kiệm token. Chỉ lưu output vào thư mục cục bộ để đóng gói cho Owner/ChatGPT; **không commit/push/PR, không chỉnh Decision Log hoặc canonical.**
- **ChatGPT:** Nhận ZIP báo cáo, đánh giá phản biện, ghi Decision Log và quản lý tài liệu/phiên bản trên GitHub sau Owner confirmation.
- **Product Owner:** Chốt câu hỏi nghiệp vụ và quyết định `P6_METHOD_APPROVED` sau khi đủ kết quả ba pilot.
- **Access follow-up:** Chưa yêu cầu Claude chạy lại toàn bộ Pilot 1. Những thay đổi OQ-1..5 được quản lý tại đây và đưa vào kiểm tra cross-module/regression khi tổng hợp P6; nếu phát hiện blocker mức cao sẽ yêu cầu review mục tiêu, không giả định đã tự đóng vòng.

## F. Trạng thái

`P6_ACCESS_OWNER_DECISIONS_RECORDED`  
`P6_ACCESS_FINAL_REGRESSION_PENDING`  
`P6_METHOD_APPROVAL_NOT_GRANTED`

PR #17 tiếp tục ở trạng thái **Open/Draft**. PR #18 **Closed/không dùng**. Không merge hai PR, không sửa Blueprint canonical.

## G. Change Log

- `P6-AP-OD-01..05`: ghi năm quyết định Owner.
- `P6-AP-TRACE-01`: nêu rõ family-level caregiver vs per-child plan manager và quyền người 18+.
- `P6-AP-EVID-01`: ghi kết quả pilot là self-reported, các issue chưa giải quyết và chưa có application tests.
- `P6-AP-NEXT-01`: phân công Claude chỉ làm pilot, ChatGPT quản lý tài liệu.
