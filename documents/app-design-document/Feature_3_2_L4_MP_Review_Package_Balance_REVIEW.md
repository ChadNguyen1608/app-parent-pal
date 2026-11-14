# PARENT-PAL — Review Package: Balanced Planning Validation

**L3:** `F04-G02-M03` · **Ngày:** 2026-11-10 · **Trạng thái:** `MULTI_PASS_DESK_TRIAL / OWNER_REVIEW`  
**Nguồn yêu cầu gốc:** 3.2 F04-G02-M01/M02/M03, F03-G04, F04-G01/G06, L3C-06; 3.4 UC-007/008/010; SC-001; MR-012/025/035; owner input reference standards + family Standard Bar.

**Lưu ý về bằng chứng:** Các test MP- là **bộ test thiết kế mới từ yêu cầu gốc**, độc lập về *cách chọn yêu cầu* so với bộ TC-L4- trước đó; **không** do sub-agent/model độc lập chạy. Tất cả `execution_status=NOT_EXECUTED`. Đây là Given/When/Then ở mức đặc tả, không có kết quả thực nghiệm.

## 1. Owner Review — Đọc phần này trước

**Owner feedback vòng 1 (2026-11-10):** MP-C02/C04/C08/C09/C10/C15 đã được Product Owner điều chỉnh; xem Change Log ở §7. Ưu tiên đọc lại expected output các case này cùng MP-C18–C24. Những số giả lập BAR-1 không phải ngưỡng khoa học; giới hạn 60 ngày/7 ngày là **quy tắc sản phẩm do Owner đưa ra**, chưa được xác nhận là chuẩn khoa học.

**Kết luận đề xuất:** **2 L4 trọng tâm đề xuất**: validate balance và validate exception lifecycle (bao gồm expiry). Không tự thực hiện approval hoặc thay đổi plan.

## 2. QA-first: Test case và expected output

| Test | Input / Given + When | Expected output / Then | Outcome trace | Nguồn |
|---|---|---|---|---|
| `MP-C01` | Gia đình có BAR-1 giả lập 60 phút chơi, lịch chỉ có 30 phút | Cảnh báo thiếu 30 phút so với **BAR-1 do gia đình đặt**, không gọi đây là chuẩn y tế | `BALANCE` | SC-001; L3C-06 |
| `MP-C02` | English 17:00–18:00, Piano 17:30–18:30; có lịch **cả tuần** và hard-cap hợp lệ | Phát hiện overlap 30 phút; F04-G02-M02 tìm và xếp hạng các phương án thay thế **trên lịch tuần** (kiểm ràng buộc hard về giờ học, giờ ngủ, tải tối đa, bất khả dụng và các hoạt động cố định); F04-G02-M03 kiểm lại hard-cap/Standard Bar cho từng phương án. Nếu có phương án khả thi, **đề xuất phương án**, không tự ghi kế hoạch. **Chỉ khi không có phương án hợp lệ** hoặc dữ liệu/độ chắc chắn không đủ, giải thích lý do và đề nghị phụ huynh/người quản lý có quyền lựa chọn hướng giải quyết. Các mức hard-cap phải có nguồn/cấu hình hợp lệ; không được vượt hard-cap bằng cách nhét lịch. | `BALANCE` + workflow F04-G02-M02 | F04-G02-M02/M03; UC-010; owner feedback 2026-11-10 |
| `MP-C03` | Hoạt động 17:00–18:00 được gắn hai nhãn học và phát triển kỹ năng | Không nhân đôi duration khi tổng hợp theo thời gian; vẫn giữ hai nhãn | `BALANCE` | SC-001 |
| `MP-C04` | Gia đình **chưa tự cấu hình** Standard Bar; hệ thống có bộ mặc định phù hợp theo tuổi/bối cảnh và phiên bản hợp lệ | **Fallback sang Default Standard Bar**, áp dụng cấu hình phù hợp cùng phiên bản, nguồn/ghi chú giới hạn và phân loại hard/soft; không hỏi phụ huynh chỉ vì họ chưa cấu hình. Nếu default không tồn tại, lỗi thời hoặc không đủ điều kiện áp dụng thì `UNKNOWN/NEEDS_INPUT` và không tự chế ra ngưỡng. | `BALANCE` | MR-012; default bar registry; owner feedback 2026-11-10 |
| `MP-C05` | Có nghiên cứu chuẩn giấc ngủ theo nhóm tuổi với provenance, ngày cập nhật và phạm vi áp dụng | Gợi ý chuẩn tham chiếu phù hợp; nêu nguồn, phạm vi và giới hạn; không tự biến thành hard rule | `BALANCE` | Owner input: reference standards |
| `MP-C06` | Gia đình đặt Standard Bar cao hơn tham chiếu được khuyến nghị, chưa vi phạm hard rule xác minh | Cho phép cấu hình kèm cảnh báo/đánh đổi; không âm thầm đổi mục tiêu hoặc lịch | `BALANCE` | SC-001; L3C-06 |
| `MP-C07` | Gia đình đặt rule xung đột một hard constraint đã được xác minh bắt buộc | Không cho bypass bằng soft preference; trả conflict và kênh review có quyền | `BALANCE` | L3C-06; MR-035 |
| `MP-C08` | Trẻ muốn đề xuất thay đổi lịch, kể cả khi trẻ **không được quyền tự sửa hoặc tự phê duyệt** | **Luôn cho trẻ gửi ý kiến/đề xuất** qua kênh phù hợp với độ tuổi và an toàn; không chặn chỉ vì trẻ không có quyền commit. Với trẻ đang thuộc chế độ phụ huynh quản lý, người quản lý có thẩm quyền xem và duyệt đề xuất theo policy; không tự ghi plan, không tự phê duyệt và không mặc định mọi phụ huynh đều có quyền duyệt. | `BALANCE` (proposal) + F04-G06 (approval) | UC-007/008; MR-035; owner feedback 2026-11-10 |
| `MP-C09` | **P1 là người quản lý trực tiếp có quyền**, đề xuất giai đoạn ôn thi 12/11–12/12 vượt **soft/normal cap** nhưng vẫn nằm trong hard-cap | Phân biệt **quyền tạo yêu cầu**, **thẩm quyền quyết định** và **trạng thái áp dụng**. Nếu P1 là approver được policy công nhận, có thể phê duyệt trong phạm vi **soft cap** với validation, thời hạn và ghi version/audit; không bắt P1 xin phê duyệt lại chính mình. Nếu P1 thiếu thẩm quyền thì `NEEDS_APPROVAL`. Nếu đề xuất vượt **hard-cap** được bảo vệ, **REJECT**, không kể P1 là ai; không sửa lịch trước khi có commit hợp lệ. | `EXCEPTION` + F04-G06 | SC-001; UC-008; owner feedback 2026-11-10 |
| `MP-C10` | Người quản lý đề xuất ngoại lệ vượt mức bình thường kéo dài hoặc lặp lại | **Giới hạn thời lượng mỗi ngoại lệ tối đa 60 ngày**, không cho lặp liền kề một ngoại lệ **tương tự** để nối dài, và yêu cầu **ít nhất 7 ngày không có ngoại lệ cùng loại giữa hai kỳ**. Thiếu end date, >60 ngày, khoảng cách <7 ngày hoặc pattern chia nhỏ để né giới hạn → `REJECT/NEEDS_REVISION`. Hard-cap được bảo vệ không thể vượt. Quy tắc 60/7 là **product policy**, chưa được chứng minh là ngưỡng sức khỏe/giáo dục. Định nghĩa 'tương tự' và cách đếm ngày (inclusive/exclusive, local timezone) cần chuẩn hóa. | `EXCEPTION` | SC-001; MR-012/035; owner feedback 2026-11-10 |
| `MP-C11` | Ngoại lệ muốn vượt một hard rule đã được xác minh | Từ chối hoặc escalation; không dùng approval thông thường để vượt hard rule | `EXCEPTION` | MR-035 |
| `MP-C12` | Ngoại lệ đã duyệt hết hạn, job chạy 3 lần | Trạng thái hiệu lực EXPIRED được suy ra/ghi tại owner phù hợp, chỉ một yêu cầu review; không tự sửa lịch | `EXCEPTION` | L3C-06; UC-010 |
| `MP-C13` | Ngoại lệ hết hạn nhưng lịch hoặc Standard Bar đã thay đổi version | Không ghi đè lịch; re-evaluate theo version hiện hành, yêu cầu quyết định có quyền | `EXCEPTION` | UC-010; MR-035 |
| `MP-C14` | Ngoại lệ bị hủy trước ngày hết hạn nhưng job hết hạn vẫn chạy | Không phục hồi/commit trùng; kết quả lifecycle nhất quán theo version | `EXCEPTION` | L3C-06 |
| `MP-C15` | A19 (hoặc người được policy xác định đang tự quản) lập/chỉnh kế hoạch và chọn **không chia sẻ** với phụ huynh | Người dùng tự quyết theo quyền hiệu lực; việc trao đổi/chia sẻ cho phụ huynh là **tự nguyện**, không cưỡng ép hoặc biến thành approval gate mặc định. Phụ huynh chỉ truy cập khi có quyền chia sẻ cụ thể, có thể rút; kiểm jurisdiction và scope riêng. Với trẻ chưa tự quản, tách quyền gửi đề xuất khỏi quyền commit/approve. | `BALANCE` | A5; F01-G04; MR-016/017; owner feedback 2026-11-10 |
| `MP-C16` | Lịch lớp 3 07:30–16:15 và đề xuất thêm học tối nhưng thiếu thông tin giấc ngủ/sức khỏe | Nêu dữ liệu thiếu và mức không chắc chắn; không chẩn đoán hay khẳng định lịch tối ưu | `BALANCE` | SC-001; MR-012 |
| `MP-C17` | Một hoạt động lặp theo tuần qua thay đổi múi giờ/ngoại lệ ngày nghỉ | Chuẩn hóa instance/timezone trước khi tính, không tính trùng lịch sai | `BALANCE` | F04-G02-M02/M03 |
| `MP-C18` | Có một slot trống trong tuần nhưng thêm hoạt động làm **vượt hard-cap ngày** | Không chấp nhận slot chỉ vì giờ trống; tìm phương án khác trong tuần, không tự vượt cap | `BALANCE` + F04-G02-M02 | MP-C02; owner feedback |
| `MP-C19` | Mọi slot cả tuần đều không hợp lệ hoặc không đủ dữ liệu hard-cap | Trả `NO_FEASIBLE_OPTION` hoặc `INSUFFICIENT_DATA` tương ứng, nêu constraints; chuyển quyết định về người quản lý, không tự nhét hoạt động | `BALANCE` + workflow | MP-C02; owner feedback |
| `MP-C20` | Không có family bar; default bar có nhiều phiên bản/khác cohort | Chọn bản **được duyệt, có hiệu lực, phù hợp scope**; pin version; nếu không có bản hợp lệ thì `UNKNOWN` | `BALANCE` | MP-C04; owner feedback |
| `MP-C21` | Trẻ đang Parent-led gửi đề xuất vượt soft cap, nhưng chưa được phê duyệt | Hệ thống nhận đề xuất với trạng thái PENDING; phụ huynh có quyền xem và quyết định; không tự commit hoặc từ chối quyền được bày tỏ | `BALANCE` + F04-G06 | MP-C08; owner feedback |
| `MP-C22` | P1 có quyền phê duyệt nhưng xin vượt protected hard-cap | `REJECT` trước commit, không tự tạo ngoại lệ dù P1 trực tiếp quản lý | `EXCEPTION` | MP-C09; owner feedback |
| `MP-C23` | Ngoại lệ loại A ngày 01–60, đề xuất loại A nối ngay ngày 61 hoặc cách 3 ngày | `REJECT/NEEDS_REVISION` theo policy 60 ngày/7 ngày, chống chia nhỏ; ca biên 60/61 ngày và đúng 7 ngày cần kiểm theo quy tắc ngày chuẩn hóa | `EXCEPTION` | MP-C10; owner feedback |
| `MP-C24` | Người dùng tự quản không chia sẻ kế hoạch, người thân muốn xem bằng quan hệ gia đình | Không hiển thị dữ liệu/chuyển approval; chỉ hỗ trợ lời mời chia sẻ tự nguyện nếu chính chủ khởi tạo hoặc đồng ý | `BALANCE` + F01-G04 | MP-C15; owner feedback |

**Số test thiết kế sau Owner Feedback:** 24 (17 test gốc được cập nhật + 7 test bổ sung MP-C18–C24). Không cộng với 43 test gốc thành số test đã chạy. Test được xây dựng để phủ outcome, negative cases, role/permission, trạng thái và ranh giới giữa L3.

## 3. Architect: Kết quả L4 sau rà soát

| Outcome | Hợp đồng / ranh giới | Disposition đề xuất | Candidate hiện có |
|---|---|---|---|
| `BALANCE` | Kiểm tra hard-cap/soft constraints và Standard Bar theo thứ tự family override hợp lệ → default đã duyệt; kiểm **từng phương án lịch tuần** do F04-G02-M02 tạo; không tự sửa lịch. Khi tất cả phương án đều bị loại, giải thích lý do và đưa cho người có quyền quyết định | `KEEP` | `CAND-F04-G02-M03-validate-balance` |
| `EXCEPTION` | Kiểm ngoại lệ **soft/normal cap** với hard-cap bất khả vượt, thời lượng tối đa 60 ngày, tối thiểu 7 ngày giữa các kỳ tương tự và anti-stacking; xác thực actor approval (P1 có thể là approver), kiểm hết hạn; commit thuộc owner được phép | `KEEP + MERGE EXPIRY` | `CAND-F04-G02-M03-evaluate-exception` |
| `EXPIRY` | Hết hạn là trigger của vòng đời ngoại lệ, không nhất thiết là outcome L4 độc lập | `MERGE` | `CAND-F04-G02-M03-expiry-recheck` |

**Quy tắc:** Các outcome ở trên chỉ là ứng viên. Nếu outcome không có vòng đời/giá trị độc lập thì không cấp L4 ID. Giữ các test cho hành vi gộp/hoãn/chuyển owner.

## 4. Adversarial review: Vấn đề và đề xuất

| # | Nhóm | Counterexample / lỗ hổng | Đề xuất |
|---|---|---|---|
| 1 | DESIGN | C02 nay yêu cầu tìm phương án trên lịch **cả tuần**, không chỉ phân tích overlap. Thời gian trùng không đo effort load; slot trống chưa chắc thoả hard-cap. | F04-G02-M02 sinh/đánh giá candidate tuần; F04-G02-M03 kiểm hard-cap; chỉ chuyển phụ huynh khi không có phương án hợp lệ; không tự commit. |
| 2 | OWNER | Standard Bar có thể là mục tiêu phát triển F03, family preference F04 hoặc safety hard policy F07. | Đề xuất phân loại: goal F03, family planning bar F04, protected constraints theo governance; chờ owner phê duyệt phân loại. |
| 3 | RESEARCH | C04 quy định **default bar fallback**; chuẩn giấc ngủ/vui chơi/vận động phải có nguồn, cohort và hiệu lực, không thể bịa. | Reference Standards Registry/version; family preference override khi hợp lệ; chỉ dùng approved defaults, còn thiếu nguồn → UNKNOWN. |
| 4 | DESIGN | Expiry-recheck chỉ khác trigger; approval thuộc F04-G06, plan baseline F04-G01. | Gộp lifecycle exception; không cho L4 này tự commit. |
| 5 | OWNER | Trạng thái hiệu lực ngoại lệ và bản ghi đã duyệt thuộc L3 nào? | Đề xuất F04-G02-M03 sở hữu validation + hiệu lực; F04-G06 sở hữu quyết định phê duyệt; F04-G01 plan baseline. |
| 6 | RESEARCH | BAR-1 giả lập không phải nghiên cứu; hạn 60 ngày/7 ngày là **quyết định product policy** chưa được kiểm định về phát triển trẻ. | Giữ RESEARCH_REQUIRED cho default bar và safety; không coi policy thời gian ngoại lệ là mức an toàn khoa học. |
| 7 | DESIGN | C08: trẻ luôn có quyền đưa **đề xuất**, dù không được quyền commit; xác định ai là người quản lý có quyền. | Tách PROPOSE vs APPROVE vs COMMIT; không mặc định caregiver nào cũng có quyền duyệt. |
| 8 | PRODUCT | C09/C10: khác biệt soft cap và protected hard-cap; P1 có thể tự phê duyệt theo thẩm quyền; ngoại lệ tối đa 60 ngày, cách 7 ngày. | Test boundaries, phê duyệt theo policy, anti-stacking; giữ mở định nghĩa 'tương tự', local calendar/day rule và áp dụng theo loại ngoại lệ. |
| 9 | PRIVACY | C15: người tự quản không bị bắt buộc chia sẻ kế hoạch với phụ huynh. | Thiết lập self-managed privacy; khi có authorization áp dụng theo jurisdiction, không dùng quan hệ huyết thống làm quyền đọc. |

## 5. Validator: Phạm vi kiểm tra thực tế

- **Đã đối chiếu:** Các test có nguồn yêu cầu; các outcome có test; ranh giới L3 trong 3.2/3.4; tính nhất quán đầu vào/đầu ra ở mức văn bản.
- **Chưa làm:** Chạy code, gọi LLM chấm bài, chạy authorization service, kiểm thử với người dùng/trẻ, legal review, đo latency/cost, xác minh nguồn nghiên cứu.
- **Các expected output chưa có bằng chứng:** Các quy tắc theo quốc gia/tuổi, mức học–chơi phù hợp, độ chính xác LLM, UX và role được ủy quyền.
- **Trạng thái:** `SOURCE_TRACED / DESIGN_CHECKED / NOT_EXECUTED`, kèm `OWNER_REVIEW` và `RESEARCH_REQUIRED` ở các hàng tương ứng. Không có `TEST_PASSED`.

## 6. Phản hồi Product Owner

Có thể phản hồi bằng `MP-Balance: sửa test MP-... thành ...` hoặc `đồng ý expected output, nhưng đổi quyền/nguồn ...`. Không cần duyệt từng ID L4; Coordinator sẽ suy ra diff từ các test và giữ log thay đổi.

**Không tự cập nhật canonical Blueprint hoặc merge PR #17.**

## 7. Change Log — Product Owner Feedback vòng 1 (2026-11-10)

| CR | Test | Chủ sản phẩm đã nêu | Thay đổi contract/test | Ảnh hưởng owner và mức độ quyết định |
|---|---|---|---|---|
| `BAL-CR-01` | MP-C02 | Tìm phương án trong cả tuần; chỉ xin phụ huynh giải quyết khi không thể sắp xếp mà không vượt hard-cap | Chuyển expected từ chỉ tính overlap sang tìm candidate tuần → validation cap → no-feasible escalation; thêm C18/C19 | **Owner approved requirement**; F04-G02-M02 đề xuất slot; F04-G02-M03 kiểm balance; F04-G06 xử lý yêu cầu thay đổi |
| `BAL-CR-02` | MP-C04 | Standard Bar mặc định khi gia đình chưa đặt | Thêm fallback và test version/cohort C20 | **Owner approved requirement**; nguồn/ngưỡng default vẫn RESEARCH_REQUIRED |
| `BAL-CR-03` | MP-C08 | Trẻ luôn được đề xuất; bố mẹ duyệt khi đang quản lý | Tách propose/approve/commit; thêm C21 | **Owner approved principle**; phân quyền người duyệt cụ thể vẫn theo policy, không mặc định mọi parent đều có quyền |
| `BAL-CR-04` | MP-C09 | P1 quản lý trực tiếp; vượt hard-cap không được phép | Phân biệt soft cap có thể duyệt và protected hard-cap REJECT; P1 không cần xin lại quyền của chính mình; thêm C22 | **Owner approved requirement**; xác định hard-cap nào được bảo vệ vẫn RESEARCH_REQUIRED |
| `BAL-CR-05` | MP-C10 | Tối đa 60 ngày; không nối ngoại lệ tương tự; cách nhau ít nhất 7 ngày | Thêm cap duration/gap, anti-stacking và test C23 | **Owner approved policy proposal**; còn OPEN định nghĩa 'tương tự', ngày biên, scope, có áp dụng toàn bộ loại ngoại lệ hay chỉ ôn thi |
| `BAL-CR-06` | MP-C15 | Khi không bị quản lý thì việc chia sẻ chỉ là trao đổi tự nguyện | Bỏ implicit caregiver approval, coi sharing là consented exchange; thêm C24 | **Owner approved principle**; đánh giá policy theo quốc gia và cohort vẫn mở |

### Điểm cần xác minh để hoàn thiện (không tự suy diễn)

1. **Hard-cap:** phân biệt protected hard-cap do chính sách/bằng chứng quy định với hard constraint do gia đình đặt và có thể sửa bằng cơ chế quản lý riêng. Không cho `EXCEPTION` vượt protected hard-cap; một parent có thể *sửa cấu hình gia đình có thẩm quyền*, nhưng không phải bypass hard-cap được bảo vệ.
2. **Quy tắc 60/7:** định nghĩa `exception_type`, `similarity` (cùng constraint, cùng mục đích hay cùng hoạt động?), số ngày theo `Asia/Ho_Chi_Minh` hoặc jurisdiction-timezone, ngày bắt đầu/kết thúc inclusive, tính gap giữa `end` và `next_start`, chống lách bằng thay tên; cần rà soát trường hợp khẩn cấp và loại ngoại lệ.
3. **Weekly feasible search:** lịch học/giờ ngủ/lịch gia đình cố định; quy tắc phân bổ ngoài tuần, độ ưu tiên, sở thích trẻ, thời gian di chuyển và quy tắc recurrence còn là `REVIEW_REQUIRED`. Không cam kết thuật toán có thể tìm phương án tối ưu toàn cục chỉ từ dữ liệu thiếu.
4. **Proposal vs approval:** mọi trẻ có quyền gửi ý kiến/đề xuất trong app theo UX phù hợp; quyền xem nội dung riêng tư, phê duyệt và commit vẫn phải kiểm theo principal/jurisdiction.
5. **Default Standard Bar:** cần có ít nhất một nguồn standard được review, version, cohort và phạm vi trước khi triển khai; không lấy số BAR-1 fixture làm chuẩn mặc định.

**Tổng:** 24 test thiết kế (17 chỉnh/giữ + 7 mới); 0 executed. L4 vẫn là CAND; không sửa canonical.
