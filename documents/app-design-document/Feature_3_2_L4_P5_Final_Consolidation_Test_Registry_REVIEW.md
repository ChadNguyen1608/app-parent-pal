# PARENT-PAL — P5: Danh mục kiểm thử hợp nhất và ma trận truy vết

**Ngày:** 2026-11-10 · **Trạng thái:** `P5_CONSOLIDATED_CANDIDATE / OWNER_REVIEW / NOT_EXECUTED`  
**Phạm vi:** Ba L3 pilot: `F01-G04-M01`, `F06-G07-M01`, `F04-G02-M03`. **Không** áp dụng cho 103 L3 khác.  
**Nguồn:** Ba gói kiểm tra đã được Chủ sản phẩm phản hồi (Phân quyền 17, Đánh giá học tập 17, Cân bằng kế hoạch 24), 43 test case cũ, 24 đề xuất bổ sung từ P5, Blueprint 3.2-R1/3.3/3.4 và nhật ký thay đổi của Chủ sản phẩm.
**Tính độc lập của người phản biện:** Chỉ có nhiều lượt phân tích tách vai do cùng trợ lý thực hiện trong lượt này; **không** có runtime chạy sub-agent độc lập. Reviewer adversarial riêng là **role-pass**, không được báo cáo là một agent/model độc lập đã xác minh.

## 1. Tổng hợp kết quả

| Chỉ số | Kết quả |
|---|---:|
| Test case thiết kế từ yêu cầu gốc trong ba gói rà soát, giữ nguyên ID | **58** = 17 + 17 + 24 |
| Test còn thiếu thực chất sau khi đối chiếu 24 đề xuất bổ sung | **6**, được bổ sung `MP-A18/A19/B18/B19/C25/C26` |
| **Bộ kiểm thử hợp nhất đề xuất** | **64 test thiết kế** = 19 Access + 19 Assessment + 26 Balance |
| 43 test case cũ | **43/43** mapped sang MP case; **không** phải 43 test bổ sung |
| 24 đề xuất test bổ sung P5 | **24/24** đã được phân loại; **6** trở thành test mới, **18** đối chiếu với test MP hiện có hoặc các vấn đề nghiên cứu |
| Test chức năng/AI được thực thi | **0** |
| Trạng thái | `DESIGN_CHECKED` (chỉ consistency), `NOT_EXECUTED` (mọi test); legal/AI/safety/feasibility UNKNOWN |

**Quan trọng:** Tương đương test chỉ dựa trên mục đích coverage, chưa phải chứng minh implementation chạy giống nhau. Bất kỳ thay đổi expected output do Owner phải giữ mapping và re-run document checks. Không cộng 58+43+24 thành số test duy nhất.

## 2. Sáu test mới — điều kiện, hành động và kết quả mong đợi

| Test | Điều kiện / Hành động | Kết quả mong đợi | Kết quả chức năng | Nguồn vấn đề |
|---|---|---|---|---|
| `MP-A18` | Quyền truy cập hoặc đồng ý từng có hiệu lực, nhưng bị thu hồi trước khi tác vụ AI đọc dữ liệu được bảo vệ hoặc gọi mô hình. | Tác vụ phải kiểm tra lại quyền trước khi đọc dữ liệu, truy cập cache hoặc gọi mô hình; chặn yêu cầu nếu đã thu hồi, ghi lý do tối thiểu để kiểm toán và không gửi dữ liệu ra ngoài. | `ACCESS-DECIDE` | TC-P5-A03; MR-016/021 |
| `MP-A19` | Người dùng tự quản lý chia sẻ một phần dữ liệu cụ thể cho observer, sau đó thu hồi quyền chia sẻ. | Trước khi thu hồi chỉ hiển thị dữ liệu trong phạm vi đã chia sẻ; sau thu hồi, cả yêu cầu dùng lại hoặc kết quả cache đều bị từ chối; không phát sinh quyền xem Journal riêng tư ngoài phạm vi. | `ACCESS-DECIDE` | TC-P5-A08; MR-016/017/021 |
| `MP-B18` | Hai bộ tiêu chí chấm (rubric) đã duyệt có cùng tên hiển thị và lớp học, nhưng khác chương trình hoặc phiên bản. | Chỉ chọn rubric khớp chính xác chương trình, môn, phạm vi và phiên bản; nếu không khớp thì trả `UNABLE_TO_ASSESS/NEEDS_RUBRIC`, không tự chọn phương án gần đúng. | `ASSESS` | TC-P5-B01; F07-G02; MR-023 |
| `MP-B19` | Người có thẩm quyền sửa kết quả từ V1 thành V2, nhưng cache báo cáo vẫn chứa V1. | F06-G05 kiểm tra quyền, nguồn gốc và phiên bản; làm mất hiệu lực hoặc đánh dấu cache cũ, không trình bày V1 như kết quả hiện hành đã xác minh. | `CORRECT` | TC-P5-B07; L3C-02; MR-021 |
| `MP-C25` | Kế hoạch đã được đánh giá theo Standard Bar V1 (gia đình hoặc mặc định), nhưng V2 có hiệu lực trước khi thay đổi được lưu chính thức. | Đánh giá lại theo V2 đang có hiệu lực trước khi phê duyệt/lưu; nếu vi phạm hard-cap mới thì chặn lưu và yêu cầu phương án khác; giữ lịch sử V1. | `BALANCE` | TC-P5-C03; F04-G02/M03; MR-035 |
| `MP-C26` | Một ngoại lệ soft-cap đang có hiệu lực được chỉnh ngày kết thúc, loại ngoại lệ hoặc lý do. | Coi thay đổi là phiên bản mới cần thẩm định và người có thẩm quyền phê duyệt; áp dụng quy tắc 60 ngày/7 ngày và kiểm tra ngoại lệ tương tự; không âm thầm kéo dài hoặc vượt hard-cap. | `EXCEPTION` | TC-P5-C05; F04-G06; MR-035 |

**Phân loại:** `A18,A19` revocation/privacy; `B18,B19` rubric provenance/version-cache; `C25,C26` Standard Bar version race/exception editing. Mọi expected output mới là `PROPOSED`, chưa được Owner review riêng.

## 3. Ma trận truy vết 43 test cũ và 24 đề xuất bổ sung (67 nguồn)

| Test nguồn | Test hợp nhất tương ứng | Trạng thái |
|---|---|---|
| `TC-L4-A01` | `MP-A01` | Đã đối chiếu test cũ |
| `TC-L4-A02` | `MP-A02` | Đã đối chiếu test cũ |
| `TC-L4-A03` | `MP-A03` | Đã đối chiếu test cũ |
| `TC-L4-A04` | `MP-A04` | Đã đối chiếu test cũ |
| `TC-L4-A05` | `MP-A05` | Đã đối chiếu test cũ |
| `TC-L4-A06` | `MP-A17` | Đã đối chiếu test cũ |
| `TC-L4-A07` | `MP-A07` | Đã đối chiếu test cũ |
| `TC-L4-A08` | `MP-A14` | Đã đối chiếu test cũ |
| `TC-L4-A09` | `MP-A09` | Đã đối chiếu test cũ |
| `TC-L4-A10` | `MP-A10` | Đã đối chiếu test cũ |
| `TC-L4-A11` | `MP-A12` | Đã đối chiếu test cũ |
| `TC-L4-A12` | `MP-A13` | Đã đối chiếu test cũ |
| `TC-P5-A01` | `MP-A06` | Đã đối chiếu đề xuất; cần kiểm độ phủ chi tiết |
| `TC-P5-A02` | `MP-A02` | Đã đối chiếu đề xuất; cần kiểm độ phủ chi tiết |
| `TC-P5-A03` | `MP-A18` | Đã đối chiếu đề xuất; cần kiểm độ phủ chi tiết |
| `TC-P5-A04` | `MP-A05` | Đã đối chiếu đề xuất; cần kiểm độ phủ chi tiết |
| `TC-P5-A05` | `MP-A09` | Đã đối chiếu đề xuất; cần kiểm độ phủ chi tiết |
| `TC-P5-A06` | `MP-A12` + `MP-A17` | Đã đối chiếu đề xuất; cần kiểm độ phủ chi tiết |
| `TC-P5-A07` | `MP-A14` | Đã đối chiếu đề xuất; cần kiểm độ phủ chi tiết |
| `TC-P5-A08` | `MP-A19` | Đã đối chiếu đề xuất; cần kiểm độ phủ chi tiết |
| `TC-L4-B01` | `MP-B01` | Đã đối chiếu test cũ |
| `TC-L4-B02` | `MP-B02` | Đã đối chiếu test cũ |
| `TC-L4-B03` | `MP-B03` | Đã đối chiếu test cũ |
| `TC-L4-B04` | `MP-B01` | Đã đối chiếu test cũ |
| `TC-L4-B05` | `MP-B04` | Đã đối chiếu test cũ |
| `TC-L4-B06` | `MP-B04` | Đã đối chiếu test cũ |
| `TC-L4-B07` | `MP-B05` | Đã đối chiếu test cũ |
| `TC-L4-B08` | `MP-B06` | Đã đối chiếu test cũ |
| `TC-L4-B09` | `MP-B07` | Đã đối chiếu test cũ |
| `TC-L4-B10` | `MP-B08` | Đã đối chiếu test cũ |
| `TC-L4-B11` | `MP-B09` | Đã đối chiếu test cũ |
| `TC-L4-B12` | `MP-B10` | Đã đối chiếu test cũ |
| `TC-L4-B13` | `MP-B11` | Đã đối chiếu test cũ |
| `TC-L4-B14` | `MP-B12` | Đã đối chiếu test cũ |
| `TC-L4-B15` | `MP-B13` | Đã đối chiếu test cũ |
| `TC-L4-B16` | `MP-B14` | Đã đối chiếu test cũ |
| `TC-P5-B01` | `MP-B18` | Đã đối chiếu đề xuất; cần kiểm độ phủ chi tiết |
| `TC-P5-B02` | `MP-B06` | Đã đối chiếu đề xuất; cần kiểm độ phủ chi tiết |
| `TC-P5-B03` | `MP-B16` + RESEARCH | Đã đối chiếu đề xuất; cần kiểm độ phủ chi tiết |
| `TC-P5-B04` | `MP-B11` | Đã đối chiếu đề xuất; cần kiểm độ phủ chi tiết |
| `TC-P5-B05` | `MP-B10` | Đã đối chiếu đề xuất; cần kiểm độ phủ chi tiết |
| `TC-P5-B06` | `MP-B17` | Đã đối chiếu đề xuất; cần kiểm độ phủ chi tiết |
| `TC-P5-B07` | `MP-B19` | Đã đối chiếu đề xuất; cần kiểm độ phủ chi tiết |
| `TC-P5-B08` | `MP-B09` | Đã đối chiếu đề xuất; cần kiểm độ phủ chi tiết |
| `TC-L4-C01` | `MP-C01` | Đã đối chiếu test cũ |
| `TC-L4-C02` | `MP-C02` | Đã đối chiếu test cũ |
| `TC-L4-C03` | `MP-C01` | Đã đối chiếu test cũ |
| `TC-L4-C04` | `MP-C01` | Đã đối chiếu test cũ |
| `TC-L4-C05` | `MP-C07` | Đã đối chiếu test cũ |
| `TC-L4-C06` | `MP-C04` | Đã đối chiếu test cũ |
| `TC-L4-C07` | `MP-C08` | Đã đối chiếu test cũ |
| `TC-L4-C08` | `MP-C03` | Đã đối chiếu test cũ |
| `TC-L4-C09` | `MP-C09` | Đã đối chiếu test cũ |
| `TC-L4-C10` | `MP-C10` | Đã đối chiếu test cũ |
| `TC-L4-C11` | `MP-C08` | Đã đối chiếu test cũ |
| `TC-L4-C12` | `MP-C11` | Đã đối chiếu test cũ |
| `TC-L4-C13` | `MP-C12` | Đã đối chiếu test cũ |
| `TC-L4-C14` | `MP-C12` | Đã đối chiếu test cũ |
| `TC-L4-C15` | `MP-C13` | Đã đối chiếu test cũ |
| `TC-P5-C01` | `MP-C02` | Đã đối chiếu đề xuất; cần kiểm độ phủ chi tiết |
| `TC-P5-C02` | `MP-C17` | Đã đối chiếu đề xuất; cần kiểm độ phủ chi tiết |
| `TC-P5-C03` | `MP-C25` | Đã đối chiếu đề xuất; cần kiểm độ phủ chi tiết |
| `TC-P5-C04` | `MP-C07` | Đã đối chiếu đề xuất; cần kiểm độ phủ chi tiết |
| `TC-P5-C05` | `MP-C26` | Đã đối chiếu đề xuất; cần kiểm độ phủ chi tiết |
| `TC-P5-C06` | `MP-C14` | Đã đối chiếu đề xuất; cần kiểm độ phủ chi tiết |
| `TC-P5-C07` | `MP-C15` | Đã đối chiếu đề xuất; cần kiểm độ phủ chi tiết |
| `TC-P5-C08` | `MP-C16` | Đã đối chiếu đề xuất; cần kiểm độ phủ chi tiết |

**Lưu ý từ adversarial review:** Một legacy case có thể được gộp với case MP có input gần tương đương nhưng expected output mới **nghiêm ngặt hơn**. Đó là **superseded by newer specification**, không phải xóa chứng cứ hoặc xác nhận test giống nhau từng chữ. Nếu lập trình cần từng assertion cũ, chuyển thành parameter/variant của case MP đích.

## 4. Quy tắc phiên bản dữ liệu và tình huống biên

- **Role:** một `primary_plan_manager` trong mỗi scope kế hoạch; `observer/supporter` được đọc trong scope, comment/propose nhưng không create/update/delete/approve/commit. Ghi consent/policy version; fail-closed nếu scope có nhiều primary hoặc chưa có; handover kiểm quyền.
- **Permission:** `DENY` trên thực thi khi auth engine trả `INDETERMINATE`; không dùng role quản lý để mở Journal hoặc metadata riêng tư. Country-based policy source/version/effective dates cần legal review.
- **Academic:** ưu tiên lớp 1–9; rubric validation nằm trong assess; AI temporary result ≠ teacher verification; `UNABLE_TO_ASSESS` không được biến thành điểm 0; versioned correction, report cache invalidation; provider retry có thể double charge.
- **Balanced:** tìm phương án lịch **cả tuần** ở F04-G02-M02 trước khi báo no-feasible; F04-G02-M03 kiểm hard-cap/balance; Standard Bar family-config hợp lệ → default research-based đã duyệt → UNKNOWN khi thiếu cả hai. Hard-cap protected không có ngoại lệ.
- **Exceptions:** P1 primary có thể quyết định ngoại lệ soft-cap trong phạm vi quyền, nhưng mọi mutation được kiểm version/audit; tối đa **60 ngày**, giữa hai kỳ **tương tự** phải có ít nhất **7 ngày**, không nối kỳ để né giới hạn; expiry là trigger, không tự chỉnh plan.
- **Self-managed:** được tự quản thì chia sẻ/trao đổi là tự nguyện, không có approval gate mặc định từ cha mẹ.

## 5. Những vấn đề chưa đủ bằng chứng (`UNKNOWN`)

1. **Legal/jurisdiction** (`MR-016/017/021`): chuyển quyền theo tuổi, role của người giám hộ hợp pháp, dữ liệu riêng tư, chính sách theo quốc gia. Policy registry chỉ là giải pháp lưu trữ; không chứng thực luật.
2. **Default standards** (`MR-012/025`): chưa chứng minh reference levels theo tuổi/bối cảnh; family BAR-1 là fixture, không dùng làm default y khoa. Phân loại protected hard-cap cần nguồn/authority.
3. **60/7 semantics:** `similarity` giữa các ngoại lệ, đếm ngày (inclusive/exclusive), timezone, loại ngoại lệ áp dụng và nhu cầu exception khẩn cấp. **Working default để viết test:** áp dụng cho ngoại lệ nhằm vượt soft/normal cap của cùng đối tượng kế hoạch; ngăn đổi tên để nối kỳ; ngày xử lý theo timezone lịch; 7 ngày trống hoàn chỉnh. Đây là **đề xuất**, không phải quyết định Owner đã xác nhận.
4. **LLM pilot** (`MR-023/025/030`): chưa có dữ liệu benchmark tiếng Việt theo lớp/môn, reviewer model, cost/retention, latency, ngưỡng chất lượng.
5. **Operations:** Ai có quyền handover manager khi primary vắng mặt; ownership dispute case, báo cáo teacher verified, và mức độ vận hành human review. Không tự tạo một team operator.
6. **Reference hygiene:** 3.3 sử dụng baseline lịch sử 49 groups/98 L3 trong khi 3.2-R1 có 51/106; `MR-040` được viện dẫn trong 3.3 nhưng chưa có trong Master v1.2. Giữ `TRACE_UNRESOLVED`, không gán mã MR giả.
7. **QA evidence:** 64 test ở mức spec; không có runnable implementation, provider benchmark, integration tests, kiểm tra pháp lý hoặc test cohort A0–A5 được chạy.

## 6. Kiểm tra cấu trúc tài liệu khi cập nhật

- Đếm 58 case MP nguồn, kiểm unique ID và trace vào một trong các outcome hiện có.
- Kiểm 6 test mới không đè ID cũ; mọi case legacy/gap phải mapped.
- Đối chiếu công thức giả lập: English 17:00–18:00, Piano 17:30–18:30 → overlap=30; occupied=90; duration sum=120 phút; không đồng nhất effort load.
- Tất cả future model/system benchmark phải có `environment`, `build_sha`, `run_at`, `actual`, `pass_fail` và evidence; không được tự điền PASS.
- Khi chuyển về canonical, phải tách role/permission đã được Product Owner chốt khỏi nghiên cứu pháp lý vẫn UNKNOWN.

## 7. Kết quả phản biện và điều kiện nghiệm thu

**Pass tĩnh có phạm vi:** Không thiếu ID, không thiếu mapping 67 nguồn, không missing outcome trong các test MP gốc, đủ các nhánh owner feedback chính.

**Không thể tự tuyên bố PASS:** Chất lượng đề xuất lịch tuần, tính đúng chính sách theo quốc gia, phù hợp học–chơi, hiệu năng chấm bài bằng LLM và chi phí.

**Không mở rộng tự động lên 103 L3 còn lại:** Trước khi mở batch tiếp theo cần Owner chốt phương pháp Review Package + cross-module regression; các mẫu policy chưa kiểm chứng giữ `UNKNOWN`.

## 8. Chủ sản phẩm rà soát — chỉ các câu hỏi ảnh hưởng nghiệp vụ

- **R1 — Review Package:** Có chấp nhận dùng **64 test ứng viên** (58 đã review + 6 bổ sung cần xem) làm bộ test thiết kế pilot và dùng phương pháp này làm baseline cho các batch tiếp? **Đề xuất A:** đồng ý ở mức spec, chưa phải technical test pass.
- **R2 — Rule ngoại lệ 60/7:** Có áp dụng quy tắc 60/7 cho **mọi ngoại lệ soft-cap có cùng mục đích/tác động** trong một plan scope, theo lịch địa phương (7 ngày không có ngoại lệ tương tự), thay vì chỉ cho ôn thi? **Đề xuất A:** có, nhưng cho phép phân loại cấp độ và điều chỉnh sau nghiên cứu.
- **R3 — Trường hợp primary manager không sẵn sàng:** Có để app `DENY` mutation + cung cấp kênh yêu cầu xác minh/bàn giao, không cho observer tự nâng quyền? **Đề xuất A:** có; cách xác minh người có thẩm quyền là `RESEARCH_REQUIRED`.

Các câu hỏi có quyết định đã nêu rõ ở Owner Feedback (MP-A11, C02/C04/C08/C09/C10/C15) **không hỏi lại**. Không yêu cầu bạn duyệt 64 test bằng mắt trong một lượt; chỉ cần xem 6 test mới và ba điểm R1–R3 nếu muốn chốt phương pháp.

## 9. Nhật ký thay đổi

- `P5-FC-01`: hợp nhất coverage 43 legacy → 58 QA-first, không xóa dữ liệu test gốc.
- `P5-FC-02`: đối chiếu 24 P5-gap; giữ 18 case mapping (gồm research-only), bổ sung 6 case `MP-A18/A19/B18/B19/C25/C26`.
- `P5-FC-03`: cập nhật contract theo Owner feedback Access/Balance; 6 outcome trọng tâm, giữ `CAND-`/ID minh họa, chưa stable ID.
- `P5-FC-04`: tách `DESIGN_CHECKED` khỏi `NOT_EXECUTED` và `RESEARCH_REQUIRED`; không sửa canonical, không merge PR.

**Trạng thái:** `P5_FINAL_CONSOLIDATION_CANDIDATE_READY_FOR_OWNER_REVIEW`, chưa phải release/signoff.
