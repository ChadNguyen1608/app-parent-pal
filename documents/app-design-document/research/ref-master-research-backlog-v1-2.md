# PRODUCT BLUEPRINT — MASTER RESEARCH BACKLOG

> **Tài liệu duy nhất** để theo dõi các vấn đề cần nghiên cứu/kiểm chứng xuyên suốt Product Blueprint. Các section chỉ tham chiếu mã `MR-###`; không tạo backlog riêng. Chưa phải kết quả nghiên cứu.

- **Phiên bản:** 1.1 — 2026-11-07
- **Phạm vi đã rà soát:** 01 Product Vision; 02.2 Parent Segmentation; 02.3 Child Segmentation; 02.4 User Needs; 02.5 User Scenarios; 03.1 Feature Domains; 03.2 Feature Inventory & Scope; các quyết định 02.6 do người dùng cung cấp.
- **Giới hạn:** Chưa truy xuất được bản đầy đủ 02.1 và 02.6; cần đối chiếu khi có tài liệu. Không tự khẳng định backlog đã bao phủ tuyệt đối hai section này.
- **Quy ước:** `P0` = phải giải quyết trước khi triển khai/thử nghiệm tính năng có rủi ro; `P1` = cần để ra quyết định sản phẩm/kiến trúc; `P2` = kiểm chứng trong thiết kế; `P3` = trước mở rộng. `BLOCKER` không có nghĩa phải dừng viết Blueprint.
- **Trạng thái:** `RESEARCH_REQUIRED`, `VALIDATION_REQUIRED`, `BLOCKER`, về sau có thể chuyển `IN_PROGRESS`, `EVIDENCE_COLLECTED`, `DECISION_PENDING`, `CLOSED`.

## Danh mục tổng hợp

| ID | Nhóm | Tham chiếu section | Vấn đề cần nghiên cứu / xác minh | Phương pháp đề xuất | Đầu ra kỳ vọng | Ưu tiên | Trạng thái |
|---|---|---|---|---|---|---|---|
| MR-001 | Market | 01;02.2 | Giá trị cốt lõi hiểu con/định hướng có được phụ huynh sử dụng lặp lại và thấy hữu ích? | Phỏng vấn B/C, diary study, task-based prototype | Retention/qualitative value drivers | P1 | VALIDATION_REQUIRED |
| MR-002 | Market | 01;02.2 | Giảm khối lượng công việc phụ huynh được đo như thế nào; mức tiết kiệm thực tế? | Baseline thời gian/công sức, A/B workflow | Value metric và target thực chứng | P1 | VALIDATION_REQUIRED |
| MR-003 | Market | 01;02.2;03.1 | Sẵn sàng chi trả, mô hình giá, free/paid, quota và unit economics theo hộ gia đình? | WTP interviews, pricing experiments, scenario model | Pricing/packaging hypotheses | P2 | RESEARCH_REQUIRED |
| MR-004 | Market | 01;02.2 | Lợi thế cạnh tranh và giải pháp thay thế hiện tại là gì? | Competitor landscape, interviews, comparative task test | Positioning/evidence map | P2 | RESEARCH_REQUIRED |
| MR-005 | User Research | 02.2 | Phân khúc B/C/D có thật sự khác biệt; nhu cầu nào thúc đẩy quay lại và phân khúc nào sử dụng dài hạn? | Recruitment đa dạng, segmentation & longitudinal research | Validated segments | P1 | VALIDATION_REQUIRED |
| MR-006 | User Research | 02.2;02.3;02.6 | Đâu là nhóm tuổi phù hợp nhất để kiểm chứng đầu tiên dù nghiên cứu rộng lớp 1–12? | User research 3 cấp, pilot theo cohort | Pilot cohort recommendation | P1 | VALIDATION_REQUIRED |
| MR-007 | User Research | 02.3;02.4;02.6 | Trẻ có tự nguyện dùng Child App, báo cáo thật, phản tư và đề xuất điều chỉnh không? | Usability + longitudinal child study; đo tính tự nguyện | Child adoption/agency measures | P1 | VALIDATION_REQUIRED |
| MR-008 | User Research | 02.2;02.4 | Phụ huynh chịu dành bao lâu cho onboarding và duy trì dữ liệu, có khác nhau khi nhiều phụ huynh/trẻ? | Usability testing household tasks | Onboarding friction thresholds | P2 | VALIDATION_REQUIRED |
| MR-009 | User Research | 02.4;02.5 | Emotional Check-in/Kid Journey khi nào hữu ích và không tạo áp lực, quấy rầy hoặc ảnh hưởng giấc ngủ? | Child-friendly study, timing/frequency tests | Opt-in UX policy | P1 | VALIDATION_REQUIRED |
| MR-010 | User Research | 02.5 | Onboarding 3–4 câu hỏi + voice/ảnh có đủ thông tin và trích xuất chính xác không? | Prototype, accuracy/confirmation tests | Onboarding and error correction rules | P2 | VALIDATION_REQUIRED |
| MR-011 | Child Development | 01;02.3;03.1 | Khung phát triển và bằng chứng nền tảng nào phù hợp Việt Nam theo từng lứa tuổi 0–23? | Systematic evidence mapping, expert review | Versioned development taxonomy + evidence grades | P1 | RESEARCH_REQUIRED |
| MR-012 | Child Development | 01;02.3 | Mục tiêu, hoạt động, thời lượng và cách diễn đạt cần thích ứng ra sao theo lớp/tuổi/năng lực? | Framework review + UX studies | Age adaptation matrices | P2 | RESEARCH_REQUIRED |
| MR-013 | Child Development | 01;02.3;03.1 | Khám phá thế mạnh/tiềm năng mà không gán nhãn cố định hoặc dự đoán quá mức như thế nào? | Assessment validation, bias evaluation | Potential-insight guardrails | P1 | RESEARCH_REQUIRED |
| MR-014 | Child Development | 01;02.4;03.1 | Phân biệt hoàn thành hoạt động, tự báo cáo, năng lực thực sự và kết quả phát triển như thế nào? | Outcome framework + pilot measurement | Measurement framework & uncertainty labels | P1 | RESEARCH_REQUIRED |
| MR-015 | Child Development | 02.3 | Mức tự chủ theo nhiệm vụ và năng lực thực tế thay vì suy từ lớp/tuổi được xác định thế nào? | Child UX observation; ethics review | Capability & autonomy criteria | P1 | VALIDATION_REQUIRED |
| MR-016 | Legal & Privacy | 01;02.3;02.4;03.1 | Pháp luật Việt Nam về dữ liệu trẻ, đồng ý, phụ huynh/người giám hộ, xử lý, lưu và xóa áp dụng cụ thể ra sao? | Rà soát văn bản hiện hành + chuyên gia luật | Legal compliance matrix | P0 | BLOCKER |
| MR-017 | Legal & Privacy | 01;02.3;03.1 | Phân quyền nhiều người giám hộ và chuyển giao quyền khi người dùng trưởng thành như thế nào? | Legal review + guardian conflict scenarios | Consent/permission age matrix | P0 | BLOCKER |
| MR-018 | Legal & Privacy | 02.4;02.5;03.1 | Journal xóa, chờ xóa 60 ngày, bản sao lưu, log, chia sẻ và xóa insight dẫn xuất thực hiện hợp pháp/đúng kỹ thuật ra sao? | Legal + data-flow review, deletion tests | Deletion lifecycle & exception policy | P0 | BLOCKER |
| MR-019 | Legal & Privacy | 02.4;02.5 | Loại structured insight nào được phép trích từ Journal; trẻ xem/sửa/phản đối được đến đâu? | Privacy impact assessment, child UX | Insight allowlist and review UX | P0 | BLOCKER |
| MR-020 | Legal & Privacy | 02.4;02.5 | Nếu mở tính năng gợi nhắc theo loại nội dung Journal, cần đồng ý nào và tránh tiết lộ gián tiếp ra sao? | Privacy/threat review + child study | Opt-in selective reminder policy | P2 | RESEARCH_REQUIRED |
| MR-021 | Legal & Privacy | 02.4;02.5;03.1 | Data classification, mã hóa, retention, audit, phân tách parent/child và quyền truy cập được thiết kế thế nào? | Threat modeling, privacy/security review | Security & privacy requirements | P0 | BLOCKER |
| MR-022 | Safety | 01;02.3;02.4;03.1 | Quy trình phát hiện nguy cơ cấp tính và escalation: ngưỡng, người được thông báo, khả năng phụ huynh là nguồn nguy hại? | Clinical/child-safety experts, adversarial tests | Escalation matrix & human oversight | P0 | BLOCKER |
| MR-023 | Safety | 02.4;03.1 | Chất lượng AI tiếng Việt trong tư vấn phát triển L1/L2/L3, rủi ro hallucination và phạm vi hành động an toàn? | Domain evals; professional review | Safety/quality benchmark, L3 release gate | P0 | BLOCKER |
| MR-024 | Safety | 02.3;02.5 | Làm thế nào để Companion không gây lệ thuộc cảm xúc và không khuyến khích chia sẻ quá mức? | Child development experts + UX research | Companion interaction guardrails | P0 | BLOCKER |
| MR-025 | AI & Engineering | 01;02.4;03.1 | Năng lực nào chỉ cần deterministic rules/templates/search thay vì LLM? | Task-by-task experiments | AI necessity matrix | P1 | VALIDATION_REQUIRED |
| MR-026 | AI & Engineering | 03.1 | Model/provider nào đủ chất lượng tiếng Việt, latency, dữ liệu và chi phí ở các tác vụ chính? | Representative model benchmark incl. safety | Model routing decision | P1 | RESEARCH_REQUIRED |
| MR-027 | AI & Engineering | 03.1 | AI cost ở 10k/30k/100k MAU theo DAU, request depth, token, cache, retries, p95 là bao nhiêu? | Traffic simulation, pilot telemetry, live pricing | Unit-economics and capacity model | P1 | VALIDATION_REQUIRED |
| MR-028 | AI & Engineering | 03.1 | Một AI interface điều phối nhiều domain mà không tạo sub-agent fan-out, latency và cost quá đà như thế nào? | Single-call baseline vs orchestrated benchmark | Execution budget + orchestration policy | P1 | VALIDATION_REQUIRED |
| MR-029 | AI & Engineering | 03.1 | Cache, budget caps, rate limits, feature quotas và fallback ảnh hưởng chất lượng/an toàn ra sao? | Load test + failure modes | Degradation/safety-preserving policy | P1 | VALIDATION_REQUIRED |
| MR-030 | AI & Engineering | 02.5 | Voice/ảnh được xử lý không lưu media gốc theo chính sách ra sao; độ chính xác và chi phí? | Data flow mapping + multimodal eval | Media processing & retention design | P1 | RESEARCH_REQUIRED |
| MR-031 | Product Design | 02.5 | Tiêu chí yêu cầu trẻ báo cáo nhiệm vụ là gì để tránh tạo gánh nặng không cần thiết? | Task analysis + child testing | Reporting criteria | P2 | VALIDATION_REQUIRED |
| MR-032 | Product Design | 02.4;02.5 | Quy tắc chọn thời điểm check-in dựa lịch học, cách tắt/bỏ qua và ai xem dữ liệu cảm xúc? | Child UX and privacy review | Check-in policy | P1 | VALIDATION_REQUIRED |
| MR-033 | Ecosystem | 01;03.1 | Tích hợp trường học/thiết bị nào có ích và khả thi; chi phí API, dữ liệu, sự đồng ý? | Partner discovery, API/legal review | Integration priority matrix | P3 | RESEARCH_REQUIRED |
| MR-034 | Ecosystem | 01;03.1 | Marketplace/commerce có tạo giá trị thật hay gây xung đột lợi ích khi khuyến nghị cho trẻ? | Business model research, conflict-of-interest review | Commerce principles and go/no-go | P3 | RESEARCH_REQUIRED |
| MR-035 | Product Design | 02.4;02.5 | Quy tắc nào cho phép AI chủ động hỗ trợ và thực hiện trong phạm vi ủy quyền, không thay quyết định của phụ huynh? | Task policy design + user tests | Action authority matrix | P0 | BLOCKER |
| MR-036 | Research Ops | 02.3;02.6 | Tuyển mẫu học sinh lớp 1–12 và phụ huynh thế nào để tránh thiên lệch và đảm bảo đạo đức nghiên cứu? | Study protocol, expert/ethics review | Research plan, sampling/consent | P1 | RESEARCH_REQUIRED |

| MR-037 | Inclusive Design | 03.2 | Accessibility, sự khác biệt về năng lực, ngôn ngữ, khuyết tật và hỗ trợ của người chăm sóc ảnh hưởng thiết kế năng lực 0–23 thế nào? | Inclusive design audit, UX đa cohort, tham vấn accessibility | Accessibility & alternate interaction matrix | P1 | RESEARCH_REQUIRED |
| MR-038 | Product & Engineering | 03.2 | Chi phí/bảo trì/kiểm thử 6 age variants theo 49 Groups là bao nhiêu; khi nào reuse thay vì tách module riêng? | Prototype 2–3 capabilities đại diện, test matrix, effort estimation | Age-variant reuse strategy and maintenance envelope | P1 | VALIDATION_REQUIRED |

## Các quyết định đã chốt — không nghiên cứu lại như thể chưa có quyết định

- Phạm vi dài hạn 0–23, CORE lớp 1–9 Việt Nam; nghiên cứu ba cấp phổ thông.
- Parent App và Child App; nhiều phụ huynh/nhiều trẻ; ba chế độ tự chủ.
- AI không thay phụ huynh/người có thẩm quyền quyết định; L3 bị hạn chế đến khi có kiểm chứng.
- Journal có vùng dữ liệu riêng; structured insight có thể lưu ở hồ sơ **riêng của trẻ**, không mặc định chia sẻ cho phụ huynh; không lưu bản tóm tắt tường thuật AI lâu dài; không tự nhắc sự kiện từ Journal ở phiên khác.
- F01–F08 đã chốt; AI interface thống nhất nhưng không mặc định multi-agent; ưu tiên rules-first và kiểm soát cost.
- 3.2 đã chốt: 4 cấp Domain→Group→Module→Feature, phân rã đồng mức 0–23 (không đồng nhất hành vi), baseline 49 Groups, E0–E3, vận hành trong các domain liên quan.

## Quy trình cập nhật

1. Trong mỗi section, chỉ ghi `Research refs: MR-###` đối với vấn đề đã có; vấn đề mới phải được thêm **vào file này** với ID tiếp theo, không tạo ID khác cho câu hỏi trùng.
2. Khi bắt đầu đợt nghiên cứu: chuẩn hóa câu hỏi, thống nhất phương pháp, thu thập nguồn, ghi bằng chứng, đánh giá mâu thuẫn, gửi quyết định cho người dùng chốt.
3. Khi một mục đóng: điền ngày, nguồn, kết luận/giới hạn, mã quyết định và section chịu ảnh hưởng; không xóa lịch sử.
4. Với `BLOCKER`: không triển khai/thử nghiệm tính năng liên quan với người thật trước khi có đủ đánh giá pháp lý/an toàn cần thiết.

## Mẫu record chi tiết cho các cập nhật sau

```yaml
id: MR-039
title: ...
origin_sections: ["03.2"]
status: RESEARCH_REQUIRED
priority: P2
research_question: ...
method: ...
expected_decision: ...
evidence_links: []
owner: unassigned
decision_id: null
last_updated: 2026-11-07
```

## Thống kê

- Tổng: **38** vấn đề đã hợp nhất từ các phần truy xuất được.
- Blocker: **9**.
- Đây là danh mục công việc nghiên cứu, không phải kết quả hoặc cam kết phải triển khai mọi tính năng.