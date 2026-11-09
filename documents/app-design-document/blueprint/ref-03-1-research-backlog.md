# PRODUCT BLUEPRINT — PART 03: FEATURE PLANNING
## 3.1 — Feature Domains

| Thuộc tính | Giá trị |
|---|---|
| Trạng thái | **APPROVED — Chốt cấu trúc domain, chưa chốt chi tiết feature / MVP** |
| Ngày chốt | 2026-11-06 |
| Phạm vi dài hạn | 0–23 tuổi |
| CORE | Học sinh lớp 1–9 tại Việt Nam |
| Tài liệu phụ thuộc | Part 01 — Product Vision; Part 02.1–02.6 — User Research & User Types |
| Bước tiếp theo | 3.2 (chưa triển khai, phải có yêu cầu riêng) |

> **Quy ước:** Những nội dung ghi **ĐÃ CHỐT** là quyết định sản phẩm. Những nội dung ghi **ĐỀ XUẤT / CẦN KIỂM CHỨNG** là quy tắc thiết kế hoặc giả thuyết chưa được phê duyệt như yêu cầu cuối cùng. Không coi các chỉ tiêu minh họa về chi phí là báo giá vận hành.

## 1. Mục tiêu và nguyên tắc

Feature Domain là ranh giới **trách nhiệm sản phẩm**, không mặc định tương đương một microservice, một database, một màn hình hay một AI agent. Phân chia domain nhằm bảo đảm tính bao phủ, rõ quyền sở hữu dữ liệu, giảm trùng lặp và có thể theo dõi từ nhu cầu người dùng đến kết quả phát triển.

Các quyết định kế thừa:

- **ĐÃ CHỐT:** Hai trải nghiệm Parent App và Child App liên kết, có quyền truy cập khác nhau.
- **ĐÃ CHỐT:** Ba chế độ tự chủ: **Parent-led**, **Child-executed**, **Child-directed**.
- **ĐÃ CHỐT:** AI hỗ trợ quyết định; không tự thay thế quyền quyết định của phụ huynh/người có thẩm quyền.
- **ĐÃ CHỐT:** Child Journal có quyền riêng tư và cơ chế xóa dữ liệu riêng.
- **ĐÃ CHỐT:** Vòng lặp trọng tâm: **Hiểu trẻ → Định hướng → Kế hoạch → Thực thi → Phản hồi → Đánh giá → cập nhật việc hiểu trẻ**.
- **ĐÃ CHỐT:** Nghiên cứu rộng, sau đó mới quyết định phạm vi MVP từ bằng chứng, không tự động gắn “cốt lõi” với “phải làm trong MVP”.

## 2. Decision Log — Sáu quyết định của 3.1

| ID | Quyết định đã chốt | Hệ quả thiết kế |
|---|---|---|
| Q1 | **A** — Giữ 8 domain | Không thêm domain chỉ vì một tính năng hoặc tầng kỹ thuật mới. |
| Q2 | **A** — Một giao diện AI thống nhất | Một lớp trải nghiệm AI chung, có thể sử dụng logic và dữ liệu có phân quyền từ nhiều domain; **không có nghĩa mỗi yêu cầu phải kích hoạt nhiều agent**. |
| Q3 | **A** — F05 giữ chung Companion và Journal, nhưng là hai subdomain tách biệt | Dữ liệu gốc, quyền truy cập, lưu giữ, xóa và khả năng sử dụng cho mô hình hiểu trẻ phải được kiểm soát độc lập. |
| Q4 | **A** — F07 là domain xuyên suốt | Tách trách nhiệm Knowledge & Evidence, AI Governance, Child Safety, Data Governance ở cấp subdomain; không mặc định triển khai thành bốn dịch vụ. |
| Q5 | **A** — F08 gồm Education/Device Integrations và Commerce | Tích hợp hỗ trợ phát triển trẻ phải phân biệt với bán hàng/marketplace và quyền sử dụng dữ liệu. |
| Q6 | **A** — Child Agency & Age Adaptation là quy tắc xuyên domain | F01 quản lý trạng thái, vai trò và quyền; mọi domain áp dụng quyền tương ứng theo độ tuổi, năng lực và tình huống. |

## 3. Phản biện các quyết định đã chốt

### 3.1. Giữ tám domain — phù hợp, nhưng không nên biến thành tám backend services

**Ưu điểm:** Khung trách nhiệm ổn định, phù hợp roadmap dài hạn, cho phép độc lập thay đổi tính năng. **Rủi ro:** over-engineering nếu mỗi domain có service, queue, database, vector index, LLM workflow riêng. **Định hướng triển khai đề xuất:** bắt đầu bằng **modular monolith** hoặc số lượng backend services tối thiểu; mỗi domain là module logic và quyền sở hữu dữ liệu ở cấp ứng dụng. Chỉ tách thành dịch vụ khi có nhu cầu độc lập vận hành, khả năng mở rộng, bảo mật hay tải thực tế chứng minh được.

### 3.2. Một giao diện AI thống nhất — cần phân biệt UI và execution

**Một AI UI** không đồng nghĩa **một prompt khổng lồ** và càng không đồng nghĩa **mạng lưới sub-agent**. Giao diện thống nhất là điểm truy cập; phía sau phải ưu tiên thao tác deterministic (rules, queries, templates) và gọi LLM khi thực sự cần suy luận/ngôn ngữ tự nhiên. Luồng thực thi ngắn nhất có thể là `UI → Auth/Policy → Intent routing → Rules/DB/Template → Response`; nhánh LLM chỉ được kích hoạt khi phù hợp. Việc AI tạo đề xuất không tự cấp quyền cập nhật mục tiêu hoặc chia sẻ dữ liệu riêng tư.

### 3.3. Companion và Journal trong F05 — cùng trải nghiệm nhưng tách lifecycle dữ liệu

Kết hợp thành một domain giúp đơn giản hóa hành trình trẻ, nhưng có nguy cơ **function creep**: thông tin nhật ký riêng tư bị sử dụng để suy luận hồ sơ hoặc gửi sang Parent App. **Quy tắc đề xuất:** Journal là vùng dữ liệu có chính sách riêng; không tự động xuất bản nội dung gốc, embedding, tóm tắt hoặc nhận định cho F02/F06/Parent AI. Chỉ chia sẻ theo quyền và mục đích rõ ràng, có cơ chế xử lý tình huống an toàn trẻ em và yêu cầu pháp lý áp dụng. Cần xem xét hành vi xóa đối với bản sao, cache, tổng hợp, logs và backups, đồng thời quy định trường hợp giữ dữ liệu theo nghĩa vụ pháp lý/an toàn nếu có.

### 3.4. F07 xuyên suốt — tối ưu ownership, tránh chi phí kiểm tra lặp

Knowledge, Safety và Governance cần quy tắc chung, nhưng **không nên chạy nhiều LLM 'đánh giá an toàn' nối tiếp cho mọi thao tác**. Ưu tiên policy engine bằng quy tắc, lớp kiểm soát quyền trước khi truy vấn, moderation theo rủi ro, và kiểm tra nâng cao chỉ ở các tình huống cần thiết. Các sự kiện nhạy cảm phải có đường escalations rõ ràng; tối ưu chi phí không được làm mất những kiểm soát an toàn bắt buộc.

### 3.5. F08 gồm tích hợp và thương mại — giữ ranh giới thương mại rõ ràng

Education/Device Integrations có thể làm giàu tín hiệu phát triển; Commerce có thể tạo doanh thu. **Rủi ro:** động lực bán hàng lẫn với khuyến nghị giáo dục. Khuyến nghị về trẻ phải độc lập với quyền lợi thương mại, quảng cáo hay nhà cung cấp; không tự động chia sẻ dữ liệu trẻ cho đối tác. F08 chưa mặc định là thành phần MVP.

### 3.6. Agency xuyên domain — phải được thực thi bằng quyền, không chỉ lời nhắc AI

F01 là **nguồn chân lý** cho cấu hình quyền, nhưng từng domain vẫn phải kiểm tra quyền lúc đọc/ghi dữ liệu và thực thi hành động. Đặc biệt đối với phạm vi đến 23 tuổi, quyền riêng tư và năng lực pháp lý thay đổi theo tuổi và quy định địa phương; không thể cố định mọi quyền của phụ huynh đến hết tuổi 23. Cần một mô hình quyền có phiên bản, có lịch sử thay đổi và xử lý mốc chuyển tuổi. Việc phân quyền cần được kiểm chứng pháp lý tại thị trường triển khai, không suy diễn một quy tắc chung cho tất cả nhóm tuổi.

## 4. Cấu trúc tám Feature Domains — phiên bản đã chốt

### F01 — Family & Identity

- **Purpose:** Quản lý định danh, cấu trúc gia đình, người giám hộ, liên kết tài khoản Parent–Child, vai trò, quyền và chế độ tự chủ.
- **Owns:** Family relationship, account-child linking, role/permission configuration, age/autonomy policy state, consent status và audit trail quyền liên quan.
- **Does not own:** Journal gốc; hồ sơ quan sát phát triển; kết quả đánh giá.
- **Điểm đặc biệt:** F01 đưa ra quyền được thực hiện; backend của domain đích bắt buộc thực thi quyền thực tế, không chỉ tin vào UI hay kết quả LLM.

### F02 — Child Understanding

- **Purpose:** Hình thành bức tranh hiểu trẻ liên tục, có nguồn gốc và độ chắc chắn rõ ràng.
- **Owns:** Child Understanding Profile; dữ kiện quan sát đã cho phép dùng; nguồn và thời điểm thu thập; phân biệt fact / self-report / caregiver report / hypothesis / AI inference.
- **Does not own:** Nội dung riêng tư Journal gốc; quyền giám hộ; lịch hoạt động.
- **Điểm đặc biệt:** Phải có khả năng hiệu chỉnh/xóa suy luận, tránh gán nhãn trẻ cố định. Không tự động lấy dữ liệu F05 vào F02.

### F03 — Development Guidance

- **Purpose:** Hỗ trợ phụ huynh/trẻ xác định ưu tiên, mục tiêu và định hướng phát triển theo giai đoạn.
- **Owns:** Development domains, growth directions, goal rationale, guidance options, phiên bản định hướng.
- **Does not own:** Lịch thực thi chi tiết, kết quả đo lường hoặc dữ liệu tri thức gốc.
- **Điểm đặc biệt:** Phân biệt rõ mức độ tin cậy của khuyến nghị và phương pháp giáo dục; mục tiêu không phải chỉ tối ưu thành tích học thuật.

### F04 — Planning & Execution

- **Purpose:** Chuyển định hướng thành hoạt động khả thi và phản hồi về thực thi.
- **Owns:** Plans, tasks, scheduling, approvals, assignment, completion records, plan adjustment requests.
- **Does not own:** Kết luận về phát triển của trẻ hoặc quyền tự quyết định ngoài cấu hình F01.
- **Điểm đặc biệt:** Cần cho phép nghỉ, từ chối và thay đổi kế hoạch theo quyền tương ứng; completion không phải outcome.

### F05 — Child Companion & Journal

- **Subdomain A — Companion:** Trải nghiệm tương tác AI với trẻ, hỗ trợ diễn đạt, suy ngẫm và điều hướng hoạt động theo ngữ cảnh và độ tuổi.
- **Subdomain B — Journal:** Nội dung nhật ký, quyền riêng tư, lưu giữ, truy cập và xóa theo lifecycle tách biệt.
- **Owns:** Companion interaction state (trong phạm vi được phép), Journal content & privacy controls.
- **Does not own:** Quyền chia sẻ mặc định sang phụ huynh hoặc hồ sơ suy luận F02/F06.
- **Điểm đặc biệt:** Không thiết kế AI nhằm thay thế quan hệ thật, không hứa bảo mật tuyệt đối, không tự động biến mọi nhật ký thành training data hoặc dữ liệu hồ sơ phát triển.

### F06 — Tracking & Insights

- **Purpose:** Theo dõi hoạt động, ghi nhận bằng chứng tiến bộ, phát hiện xu hướng và hỗ trợ điều chỉnh định hướng.
- **Owns:** Measurements, historical trends, dashboards, evidence-backed insights, progress review outputs.
- **Does not own:** Thay đổi mục tiêu/plan không qua quyền phê duyệt; khai thác Journal ngoài mục đích đã cho phép.
- **Điểm đặc biệt:** Phân biệt activity metrics, developmental outcomes và model inference; không tạo một điểm số giá trị con người hoặc tiềm năng cố định.

### F07 — Knowledge, Safety & Governance (Cross-cutting)

- **Subdomain A — Knowledge & Evidence:** Knowledge base, nguồn dẫn, độ cập nhật, cấp độ bằng chứng, review nội dung.
- **Subdomain B — AI Governance:** Model/prompt policy, allowed tools, explainability, traceability, fallback và giới hạn tự động hóa.
- **Subdomain C — Child Safety:** Chính sách an toàn phù hợp tuổi, nhận diện tình huống cần can thiệp và luồng xử lý/escalation phù hợp.
- **Subdomain D — Data Governance:** Phân loại dữ liệu, purpose limitation, consent, retention, deletion, audit, dữ liệu nhà cung cấp.
- **Owns:** Common policies/standards và hệ thống kiểm soát liên domain.
- **Does not own:** Mọi bản ghi nghiệp vụ của các domain khác.
- **Điểm đặc biệt:** Cross-cutting là quyền quản trị chính sách, không phải yêu cầu mọi request đi qua bốn AI agent.

### F08 — Extended Ecosystem

- **Subdomain A — Education & Device Integrations:** Trường học, giáo viên, hoạt động ngoại khóa, tích hợp thiết bị và dữ liệu được cho phép.
- **Subdomain B — Commerce & Partner Ecosystem:** Dịch vụ, đối tác, sản phẩm, marketplace và các cấu phần doanh thu trong tương lai.
- **Owns:** Integration contracts, partner access boundaries, các tương tác hệ sinh thái.
- **Does not own:** Dữ liệu hồ sơ trẻ ngoài quyền được cấp; việc đưa lợi ích thương mại thành tiêu chí ngầm cho guidance.
- **Điểm đặc biệt:** Mỗi nguồn tích hợp phải có phạm vi dữ liệu và quyền rút lại/thu hồi rõ ràng.

## 5. Domain Interactions và luồng dữ liệu

**Product loop chuẩn:**

`F02 (Understanding) → F03 (Guidance) → F04 (Planning/Execution) → F05 (Feedback khi trẻ tự nguyện tương tác) + F04 activity → F06 (Tracking/Insights) → đề xuất cập nhật F02/F03/F04`

- **F01** cung cấp identity, age/autonomy state và authorization cho mọi bước.
- **F07** cung cấp evidence/policy/safety/data governance cho mọi bước.
- **F08** có thể cung cấp input/output tích hợp có phân quyền; không mặc nhiên được truy cập mọi domain.
- **F05 không phải cổng bắt buộc:** Trẻ có thể phản hồi bằng các UI dạng biểu mẫu/nút, không nhất thiết phải dùng AI chat.
- **Data provenance:** Mỗi nhận định quan trọng cần phân biệt nguồn do trẻ cung cấp, phụ huynh cung cấp, quan sát hệ thống hoặc AI suy luận; lưu mức độ tin cậy thích hợp.
- **Write-back:** AI có thể soạn đề xuất. Hành động thay đổi quyền, chia sẻ, mục tiêu quan trọng, hoặc cập nhật dữ liệu nhạy cảm phải qua policy và approval tương ứng.

Ví dụ: Trẻ nói “hôm nay con mệt, không muốn học tiếng Anh”. Hệ thống có thể phản hồi hỗ trợ ngay ở F05; **không** mặc định gửi lời nói nguyên văn tới phụ huynh, cập nhật hồ sơ tính cách hoặc gọi một chuỗi agent. Nếu trẻ muốn xin đổi lịch, F04 xử lý bằng luồng cấp quyền phù hợp; F06 có thể theo dõi dữ liệu hoạt động được phép.

## 6. Cost-aware Architecture Principles — BỔ SUNG THEO YÊU CẦU

### 6.1. Kết luận kiến trúc

**ĐÃ CHỐT ở mức nguyên tắc thiết kế:** Mục tiêu là kiến trúc **AI-optional, rules-first, cost-observable**. Không mặc định “AI-first” tức là gọi LLM cho mọi tương tác. Một giao diện AI thống nhất chỉ là UX; phía backend ưu tiên **một bước suy luận có điều kiện** thay vì multi-agent orchestration.

**ĐỀ XUẤT:** Một AI Gateway/Orchestrator **mỏng** (một module backend) quản lý định tuyến, policy, ngân sách, telemetry và tool access. Đây không phải một agent bắt buộc phải suy luận ở mọi request.

### 6.2. Thứ tự xử lý ưu tiên

1. **No AI:** CRUD, login, phân quyền, lịch, checklist, reminders, completion, progress calculations, filtering, basic safety policy.
2. **Rules/Templates:** Lịch mẫu theo độ tuổi, hướng dẫn có cấu trúc, gợi ý dựa trên điều kiện đã kiểm chứng, FAQ/knowledge cards biên tập sẵn.
3. **Retrieval/Search:** Tìm thông tin từ knowledge base đã phân loại; truy xuất tài liệu và trích nguồn mà không nhất thiết sinh văn bản bằng LLM.
4. **Single LLM Call:** Khi cần diễn giải linh hoạt, tổng hợp nhiều tín hiệu hoặc hội thoại thực sự có giá trị.
5. **Escalated AI:** Model mạnh hơn, additional evaluation hoặc review chuyên gia ở yêu cầu phức tạp/rủi ro; không được tự động kích hoạt vô hạn.

### 6.3. Không triển khai sub-agent theo mặc định

- Không tạo một agent cho mỗi F01–F08.
- Không triển khai agent-to-agent conversation cho các thao tác CRUD hoặc rules đơn giản.
- Không bắt buộc reasoning chain dài; ưu tiên function/tool calls giới hạn, schema đầu ra cố định và **số vòng gọi tối đa**.
- Dùng workflow deterministic cho approval, notifications, scheduling, permission, audit và structured calculations.
- Nếu cần tách một workflow AI phức tạp, phải có benchmark: chất lượng, cost, latency, failure rate so với single-call baseline.

### 6.4. Kiểm soát token, storage và request

- **Context minimization:** Chỉ đưa vào model phần dữ liệu đã được phân quyền và liên quan đến yêu cầu, không gửi toàn bộ profile, lịch sử chat hoặc Journal.
- **Structured state:** Lưu trạng thái/thuộc tính có cấu trúc; không cần model đọc toàn bộ hội thoại để hiểu mỗi task.
- **Caching có phạm vi:** Cache nội dung tri thức không nhạy cảm, template, kết quả xử lý dùng chung; bảo đảm không cache xuyên người dùng đối với dữ liệu cá nhân.
- **Avoid redundant embeddings:** Không embedding mọi tin nhắn/Journal mặc định; chỉ lập index cho nội dung cần tìm kiếm và có quyền phù hợp.
- **Batching:** Gộp tác vụ tổng hợp không khẩn cấp, nhưng không trì hoãn cảnh báo an toàn quan trọng.
- **Rate limits & budgets:** Hạn mức theo user/family/plan và tổ chức, có fair-use, cảnh báo, fallback.
- **Conversation management:** Giới hạn lịch sử gửi vào model, tóm tắt có kiểm soát và thời hạn lưu rõ; không sử dụng tóm tắt như sự thật đã được xác minh.
- **Model routing:** Chỉ gọi model lớn cho bài toán có bằng chứng cần thiết; routing có thể theo quy tắc, không đòi một LLM classifier riêng.
- **Cost observability:** Theo dõi số call, input/output tokens, cost, cache hit, latency, feature, domain, model, user cohort và conversion/retention; dashboard phải có cảnh báo chi phí bất thường.
- **Non-token costs:** Tính cả speech, vector DB, storage, backups, notifications, analytic jobs, safety processing và cloud egress.

### 6.5. Cost model tham số — tránh ảo tưởng chi phí khi scale

Định nghĩa:

- `MAU`: số người dùng hoạt động theo tháng.
- `DAU`: số người dùng hoạt động mỗi ngày (cần định nghĩa theo user hay family).
- `R`: AI requests thực sự trên mỗi DAU mỗi ngày (không phải toàn bộ UI actions).
- `C`: chi phí trung bình **all-in** cho mỗi AI request, gồm model + retry + công cụ cần thiết.
- `F`: chi phí cố định / tháng; `V`: các chi phí biến đổi khác.

**Ước tính:** `Monthly AI inference cost ≈ DAU × R × 30 × C`; `Total monthly operating cost ≈ AI inference + F + V`.

Đây là mô hình kịch bản, **không phải dự báo thực tế**. Ví dụ minh họa (giả định 30.000 MAU và 20% DAU/MAU):

| Kịch bản | DAU | AI req/DAU/ngày | AI requests/tháng | Nếu all-in/request = $0.001 | Nếu = $0.01 |
|---|---:|---:|---:|---:|---:|
| Tiết chế | 6.000 | 1 | 180.000 | $180 | $1.800 |
| Trung bình | 6.000 | 5 | 900.000 | $900 | $9.000 |
| Nặng | 6.000 | 15 | 2.700.000 | $2.700 | $27.000 |

**Lưu ý:** Giá `$0.001` và `$0.01` chỉ là biến giả định minh họa để thấy độ nhạy; không phải mức giá model hoặc chi phí sản phẩm đã được xác minh. Phải đo `R` và `C` theo tính năng khi có prototype. Dùng MAU để tính trực tiếp chi phí mà không xét DAU, số thành viên/gia đình, phân phối người dùng nặng và hành vi chat sẽ làm dự báo sai đáng kể. Một request cũng có thể gồm nhiều model/tool calls nếu thiết kế không kiểm soát.

### 6.6. Guardrails khi đi vào feature planning và kỹ thuật

Mọi AI-enabled feature về sau nên có một dòng đánh giá tối thiểu:

| Trường | Câu hỏi cần trả lời |
|---|---|
| User value | Nếu không dùng AI, tính năng còn giá trị không? |
| AI necessity | Vì sao rules/search/template không đủ? |
| Trigger | Người dùng chủ động, event, hay tác vụ định kỳ? |
| Call budget | Số lần gọi model tối đa trên một hành động là bao nhiêu? |
| Context | Dữ liệu nào thực sự phải gửi và có được phép gửi không? |
| Fallback | Nếu AI lỗi/hết quota, người dùng có thể làm gì? |
| Safety | Có những tình huống nào không được giảm kiểm tra? |
| Measurement | Chi phí trên mỗi kết quả hữu ích và tỷ lệ thành công? |

**Đề xuất KPI:** AI cost per DAU, AI cost per active family, AI calls per completed plan, share of user interactions requiring LLM, p95 latency, cost by feature, safety escalation success, approval/error rate. **Chưa chốt ngưỡng KPI** cho đến khi có nghiên cứu hành vi và chi phí thực tế.

## 7. Ranh giới với các giai đoạn tiếp theo

**3.1 đã chốt:**

1. Bộ 8 domain và các mục đích/ràng buộc chính.
2. UX AI thống nhất nhưng AI execution tối giản, có thể không dùng LLM.
3. Companion và Journal cùng domain, tách quyền và vòng đời dữ liệu.
4. F07 cross-cutting với các subdomain độc lập về trách nhiệm.
5. F08 phân tách giáo dục/thiết bị và commerce.
6. Agency + Age Adaptation xuyên domain; F01 quản lý quyền/trạng thái.
7. **Cost-aware design** là constraint áp dụng cho toàn bộ feature planning.

**Chưa chốt / cần nghiên cứu sau, không tự coi là yêu cầu của 3.1:**

- Danh sách feature chi tiết và thứ tự ưu tiên; scope MVP.
- Cơ chế phân quyền tuổi cụ thể, quy trình chuyển quyền khi trưởng thành và kết quả rà soát pháp lý Việt Nam.
- Policy chi tiết cho Journal: đồng ý chia sẻ, xóa, backup retention, ngoại lệ an toàn và xử lý dữ liệu dẫn xuất.
- Taxonomy dữ liệu trẻ, bộ đo kết quả phát triển và chuẩn evidence.
- Mức SLO, mức ngân sách tháng, quota theo plan, pricing và các ngưỡng escalation AI.
- Công nghệ cụ thể (model/provider, database, vector store, message queues, microservices) và benchmark tải thực tế.
- Kịch bản safety risk, human intervention và quy trình kiểm chứng với chuyên gia trẻ em.

## 8. Quyết định kết thúc

**Section 3.1 — Feature Domains: APPROVED** theo Q1–Q6 và bổ sung ràng buộc kiểm soát chi phí. Không mở rộng domain, không triển khai 3.2, không đưa ra quyết định MVP trong tài liệu này.

**Điểm cần giữ xuyên suốt:** *Sự phát triển của trẻ và quyền kiểm soát của gia đình là mục tiêu sản phẩm; AI chỉ là một phương tiện, phải chứng minh giá trị so với chi phí và rủi ro.*

---

## PHỤ LỤC A — Research Backlog (nghiên cứu tập trung sau)

**Mục đích:** Ghi nhận toàn bộ câu hỏi chưa đủ bằng chứng để chốt trong quá trình viết Blueprint. **Không dừng tiến độ thiết kế vì một câu hỏi nghiên cứu**, trừ khi câu hỏi đó làm thay đổi quyết định nền tảng hoặc gây rủi ro nghiêm trọng. Các mục bên dưới **chưa được nghiên cứu, kiểm chứng hay phê duyệt** chỉ vì đã được ghi vào bảng.

**Quy ước bắt buộc cho các phần tiếp theo:**

- `DECIDED`: Đã được người dùng chốt, ghi rõ mã quyết định.
- `PROPOSED`: Đề xuất của nhóm thiết kế, chưa chốt.
- `RESEARCH_REQUIRED`: Cần tìm chứng cứ/kiểm chứng trước khi chốt.
- `VALIDATION_REQUIRED`: Cần đo đạc, thử nghiệm hoặc trao đổi với người dùng/chuyên gia.
- `BLOCKER`: Không được triển khai chức năng liên quan trước khi giải quyết.
- Mỗi mục tồn đọng phải có **ID, câu hỏi, lý do, cách kiểm chứng, đầu ra mong đợi, thời điểm cần kết luận, trạng thái**.
- Không điền kết luận thay cho bằng chứng. Khi thực hiện đợt nghiên cứu tổng hợp, mỗi mục cần có nguồn, ngày cập nhật, mức độ tin cậy và quyết định sau nghiên cứu.

### A.1. Danh mục nghiên cứu mở từ 3.1

| ID | Chủ đề & câu hỏi cần giải quyết | Vì sao cần | Phương pháp / nguồn cần kiểm tra | Đầu ra để chốt | Chốt trước giai đoạn | Trạng thái |
|---|---|---|---|---|---|---|
| R-3.1-01 | **Pháp lý dữ liệu trẻ tại Việt Nam:** giới hạn tuổi, căn cứ xử lý, yêu cầu đồng ý, quyền của trẻ và người giám hộ; thay đổi khi đủ tuổi thành niên? | Có thể thay đổi thiết kế consent và phân quyền | Rà soát văn bản quy phạm hiện hành, đối chiếu chuyên gia pháp lý trong nước | Ma trận quyền theo độ tuổi + checklist pháp lý | Trước triển khai dữ liệu thật | RESEARCH_REQUIRED · BLOCKER |
| R-3.1-02 | **Journal và dữ liệu dẫn xuất:** xóa, thu hồi chia sẻ, backup, AI summaries, sự kiện an toàn; đâu là các ngoại lệ bắt buộc? | Nguy cơ rò rỉ thông tin riêng tư và xóa không triệt để | Threat modeling + rà soát pháp lý + nghiên cứu UX trẻ/phụ huynh | Data lifecycle & deletion policy, access matrix | Trước triển khai Journal | RESEARCH_REQUIRED · BLOCKER |
| R-3.1-03 | **Safety escalation:** phát hiện dấu hiệu nguy cơ ra sao, khi nào cảnh báo, ai nhận thông báo, xử lý sai lệch? | Nhạy cảm, có thể gây hại khi phát hiện sai hoặc bỏ sót | Khuyến nghị tổ chức chuyên môn + chuyên gia tâm lý/trẻ em + thử nghiệm có giám sát | Safety protocol, escalation matrix, test cases | Trước thử nghiệm AI với trẻ thật | RESEARCH_REQUIRED · BLOCKER |
| R-3.1-04 | **Development framework và measurement:** cấu trúc năng lực theo từng độ tuổi, chỉ báo phát triển hợp lệ, những gì không được quy thành điểm số? | Tránh kết luận phát triển thiếu cơ sở | Tổng quan có hệ thống khung CDC/WHO/UNICEF/UNESCO, nguồn học thuật phù hợp và chuyên gia | Taxonomy phát triển + evidence map + giới hạn suy luận | Trước chốt guidance và tracking | RESEARCH_REQUIRED |
| R-3.1-05 | **Consent, child agency & age adaptation:** ba chế độ tự chủ hoạt động thế nào theo tuổi/năng lực/trường hợp; ai được thay đổi? | Phân quyền cần phù hợp tuổi và năng lực, không chỉ theo lớp học | Nghiên cứu UX, thử nghiệm phân quyền, pháp lý liên quan | Policy matrix và user flows | Trước thiết kế luồng phê duyệt | RESEARCH_REQUIRED |
| R-3.1-06 | **Hiệu quả AI so với rules/templates/search:** tính năng nào thực sự cần LLM và mức chất lượng tối thiểu? | Tránh phí inference không tạo thêm giá trị | Prototype A/B, đánh giá chất lượng nhiệm vụ và chi phí theo feature | AI necessity matrix và quality threshold | Trước khóa feature architecture | VALIDATION_REQUIRED |
| R-3.1-07 | **Cost & usage model ở quy mô lớn:** DAU/MAU thực, lượt tương tác AI/người/ngày, token/request, heavy-user, cache hit, retry? | Chi phí tăng phi tuyến do hành vi và agent fan-out | Model giá theo provider cập nhật + load test + telemetry prototype | Cost model theo cohort, p50/p95, kịch bản 10k/30k/100k MAU | Trước pricing/capacity planning | RESEARCH_REQUIRED · VALIDATION_REQUIRED |
| R-3.1-08 | **Model/provider benchmark:** lựa chọn model nào theo yêu cầu tiếng Việt, độ tuổi, an toàn, latency, giá? | Không thể chọn vendor chỉ bằng bảng giá/token | Benchmark tập tác vụ tiếng Việt và tình huống safety; khảo sát điều khoản xử lý dữ liệu | Model routing policy + benchmark scorecard | Trước production AI | RESEARCH_REQUIRED |
| R-3.1-09 | **Privacy/security architecture:** data minimization, phân tách parent/child, audit, encryption, retention, access controls? | Tránh thiếu kiểm soát khi mở rộng | Data-flow mapping, security/privacy threat model, đối chiếu chuẩn phù hợp | Data classification, threat model, security requirements | Trước triển khai backend production | RESEARCH_REQUIRED |
| R-3.1-10 | **Người dùng có thực sự sử dụng Companion/Journal?** Mức tự nguyện và giá trị đối với học sinh lớp 1–9? | Quyết định mức ưu tiên và cách thiết kế không gây phụ thuộc | Phỏng vấn phụ huynh/trẻ phù hợp đạo đức nghiên cứu, prototype testing | Adoption hypotheses, UX findings và consent patterns | Trước quyết định MVP | VALIDATION_REQUIRED |
| R-3.1-11 | **School/device integration:** dữ liệu nào thực sự hữu ích, có thể truy cập hợp pháp, đáng tin và chi phí tích hợp hợp lý? | F08 dễ mở rộng phạm vi mà ít giá trị | Discovery đối tác, API availability, user research | Integration opportunity matrix | Trước triển khai từng integration | RESEARCH_REQUIRED |
| R-3.1-12 | **Business model & AI quotas:** giá trả phí, quota hợp lý, xử lý người dùng nặng, free-tier, cơ chế ngắt AI mà không ảnh hưởng safety? | Khả năng duy trì tài chính và công bằng sử dụng | Willingness-to-pay, unit economics, stress scenarios | Packaging/pricing hypotheses và quota policy | Trước thương mại hóa | RESEARCH_REQUIRED · VALIDATION_REQUIRED |

### A.2. Cách thực hiện một đợt nghiên cứu tổng hợp

Khi các phần Blueprint cần thiết đã được phác thảo, gom các mục `R-*` từ **mọi phần** vào một **Master Research Backlog**, gộp câu hỏi trùng, phân theo nhóm: **Legal/Privacy**, **Child Development & Safety**, **Product/User Research**, **AI/Technology**, **Economics/Operations**.

Quy trình mỗi chủ đề: **(1) xác nhận câu hỏi và giả thuyết → (2) tìm nguồn, lưu bằng chứng → (3) đối chiếu mâu thuẫn/giới hạn → (4) đề xuất phương án và rủi ro → (5) người dùng chốt → (6) cập nhật lại các section chịu ảnh hưởng**.

**Không mặc nhiên trì hoãn các blocker an toàn/pháp lý đến sau khi ra mắt:** Có thể gom việc nghiên cứu thành một đợt, nhưng phải đóng các blocker trước khi triển khai hoặc thử nghiệm chức năng có rủi ro tương ứng.

### A.3. Quy tắc chuyển tiếp

Từ section 3.2 trở đi, cuối mỗi section ghi cả hai danh sách riêng:
1. **Decision Questions** — các câu hỏi người dùng phải chốt ngay để hoàn tất section.
2. **Research Backlog Additions** — các câu hỏi chưa thể chốt vì thiếu bằng chứng, được gắn ID và chuyển vào danh sách nghiên cứu tập trung.

**Tình trạng tại cuối 3.1:** Q1–Q6 đã chốt. R-3.1-01 đến R-3.1-12 vẫn mở. Chưa chuyển sang 3.2.