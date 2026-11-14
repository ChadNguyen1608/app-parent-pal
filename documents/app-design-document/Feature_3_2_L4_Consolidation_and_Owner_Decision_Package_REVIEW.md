# Parent-Pal · L4 consolidation and Owner Decision Package

Design review only · Evidence snapshot `8e9828b974aa1ea3b68a836ce09dff5b72af8564` · 3.2-R1 inventory blob `f52be52f5ae37ddce0b6a021aec915659f357db3`

## Coverage and evidence

All 106 canonical L3 have a review disposition. Eight retain P6/B01 reference status. B02–B25 cover 98 distinct L3 with 126 temporary candidates and 144 proposed test IDs. B26 adds three candidates and four test IDs without adding L3. Combined new-design evidence: **129 candidates and 148 proposed tests**. This count excludes earlier P6/B01 registries. ID uniqueness and inventory membership were verified; this does not establish semantic equivalence or runtime coverage. All new designs remain provisional. Most B08–B25 entries contain one candidate and one oracle per L3; expand negative/retry/cohort and detailed schema coverage where required before accepting stable L4.

[Cross-module reconciliation and partial slices](Feature_3_2_L4_B26_Partial_Slices_and_Cross_Module_Review_REVIEW.md) records owner boundaries, auth/replay checks, Journal lineage, learning provenance, integrations and outstanding issues. B26 blob `7a8c6b2ae01bcac2fad14adf2fdcfc27963bb248`. [B02 authority manifest](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md) pins approved sources. BI-01..10 and BI-12 remain under their prior dispositions. BI-11 was superseded by the scope approval. No stable IDs, canonical edits, MVP commitment or merge.

## Owner questions for one review

These are scope and experience choices. Lawful eligibility and safeguards must independently clear their gates before use.

| ID | Question for Owner | Options and recommendation | Linked evidence |
|---|---|---|---|
| ODP-01 | Trong bản đầu, khi một hồ sơ trẻ đã liên kết với hộ gia đình khác hoặc đang có tranh chấp, có hỗ trợ chuyển liên kết trong app không? | **Đề xuất:** Tạm hoãn chuyển liên hộ và dùng luồng hỗ trợ xác minh. Phương án khác: đưa quy trình chuyển có phê duyệt riêng vào phạm vi sau khi có căn cứ và tiêu chí xác minh. | B02-I01, B03-I01, B04-I01, B26 family contract |
| ODP-02 | Sau khi yêu cầu xóa Journal được chấp nhận, bạn muốn có quyền rút yêu cầu trước khi xóa vĩnh viễn, hay giữ luồng một chiều? | **Đề xuất:** Luồng một chiều sau bước xác nhận rõ ràng, chờ xác minh nghĩa vụ pháp lý. Nếu muốn khôi phục, cần quyết định riêng về quyền, thời điểm và việc có cấp lại quyền chia sẻ. Chính sách ẩn ngay và mốc 60 ngày vẫn là baseline. | B02 R1–R6, B03 G3–G4, B26 export |
| ODP-03 | Khi không có người phụ trách an toàn phù hợp hoặc ngoài giờ hỗ trợ, có giới hạn bản đầu ở nội dung trợ giúp đã thẩm định, hay muốn đưa quy trình phản hồi của người thật vào phạm vi với nguồn lực riêng? | **Đề xuất:** Giới hạn ở nội dung đã thẩm định khi tuyến xử lý không khả dụng. Nếu chọn phản hồi người thật, cần chốt phạm vi, vai trò, khả năng trực và chính sách liên lạc sau thẩm định. | B07-I02/03, B02 Journal safety boundary |

## Evidence pending before further Owner decisions

| Area | Evidence required |
|---|---|
| Real child data and authority | Determine lawful basis per purpose, age and jurisdiction. Verify identity, subject rights, dispute and hold scope. G-Legal BLOCKED for real child personal data. |
| Journal and exports | Verify controlled-store/backup inventory, 60-day deadline behavior, cache and restore fencing, export artifact lifecycle, voice provider transience and scope of any exceptions. |
| Safety and models | Verify human routing, minimized disclosure, safe fallback and model/fixture comparison. Do not derive age, clinical or escalation thresholds from draft examples. |
| Economics | Measure usage, reconciliation, provider costs and real approval/capacity requirements before setting quota, price or limits. |
| Prior findings | Recover exact P5/P6 test evidence and B01 per-item trace. Provisional references do not close gaps. |

## Claude Code handoff · independent review pending

Review read-only at evidence snapshot `8e9828b974aa1ea3b68a836ce09dff5b72af8564`. Start with the B02 manifest, B01 open issues, and B26 ownership matrix. Prioritize ODP-linked surfaces plus auth/write linearization, Journal disclosure and retention, external referrals and charging/replay. For each finding return severity, source SHA/path/line, contradicting clauses, synthetic fixture and expected oracle, suggested patch, and whether it needs policy decision or technical validation. Recount 106 L3 and check candidate/test identity and coverage gaps. Treat fixture oracles as proposed. No real child data, policy approval, repository writes or merge. If evidence is unavailable, return explicit UNKNOWN. This section is the handoff package; no Claude execution recorded.

## Source manifest · checkpoint blobs at evidence snapshot

| Checkpoint | Git blob |
|---|---|
| [Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md) | `6ce6bc0e4345c40a64caece98faf077dc4139948` |
| [Feature_3_2_L4_B03_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B03_Design_and_Checkpoint_REVIEW.md) | `7bb9bc610a23cf924ba1f3e5bac557ee0c91b685` |
| [Feature_3_2_L4_B04_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B04_Design_and_Checkpoint_REVIEW.md) | `9abfbd602ec8289c2a438ce1acd28e54ddf6c6db` |
| [Feature_3_2_L4_B05_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B05_Design_and_Checkpoint_REVIEW.md) | `f8a05d541a4fc2bfd51eafb2b8cd4e8da8d99762` |
| [Feature_3_2_L4_B06_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B06_Design_and_Checkpoint_REVIEW.md) | `81d3994de6156598c96bf8dfafbb2da1ccbb5565` |
| [Feature_3_2_L4_B07_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B07_Design_and_Checkpoint_REVIEW.md) | `8f6ef4d14c3401f0ded566e82de63bc3b14eb12c` |
| [Feature_3_2_L4_B08_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B08_Design_and_Checkpoint_REVIEW.md) | `7332d8e19b37c3de7c90dd3b113557dd5d8b85d1` |
| [Feature_3_2_L4_B09_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B09_Design_and_Checkpoint_REVIEW.md) | `00b3492675a559066886cccfa119556d95478246` |
| [Feature_3_2_L4_B10_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B10_Design_and_Checkpoint_REVIEW.md) | `002f71428e3c129fc1bb7ef85a02809a1da4ec5d` |
| [Feature_3_2_L4_B11_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B11_Design_and_Checkpoint_REVIEW.md) | `3b961060b6197df80df7091cebae5c251b5fb044` |
| [Feature_3_2_L4_B12_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B12_Design_and_Checkpoint_REVIEW.md) | `7dd41474884a6a29456f0b96aa741fc5f197f687` |
| [Feature_3_2_L4_B13_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B13_Design_and_Checkpoint_REVIEW.md) | `cfe79239c2d0169c2084aae2bf903ee2e33e35bb` |
| [Feature_3_2_L4_B14_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B14_Design_and_Checkpoint_REVIEW.md) | `b9088dedfae02015a60ce746de97fd1f1aaad1e2` |
| [Feature_3_2_L4_B15_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B15_Design_and_Checkpoint_REVIEW.md) | `0367fe5eef2eaae32c8bae9f395633f12d60ac2b` |
| [Feature_3_2_L4_B16_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B16_Design_and_Checkpoint_REVIEW.md) | `29eeb89b4b1a817a4ae7fafa4ea48be93dc9e17e` |
| [Feature_3_2_L4_B17_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B17_Design_and_Checkpoint_REVIEW.md) | `4e6a2cc15fd0349a9265309abc90b553dbf7c594` |
| [Feature_3_2_L4_B18_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B18_Design_and_Checkpoint_REVIEW.md) | `7e99975edd70697e8ad642817d03671e4ec1d284` |
| [Feature_3_2_L4_B19_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B19_Design_and_Checkpoint_REVIEW.md) | `6892e4258f2d7c63b899be58a8a38decd2eb8930` |
| [Feature_3_2_L4_B20_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B20_Design_and_Checkpoint_REVIEW.md) | `44bbcfee11d68d14b2cb10b8ebd3b77b8e267ce8` |
| [Feature_3_2_L4_B21_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B21_Design_and_Checkpoint_REVIEW.md) | `0d379521b5ee8ca2cd2959e9e0b2571435b7e2a5` |
| [Feature_3_2_L4_B22_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B22_Design_and_Checkpoint_REVIEW.md) | `0fde5afe63e7264799db063095f218689dfb8f2b` |
| [Feature_3_2_L4_B23_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B23_Design_and_Checkpoint_REVIEW.md) | `407233f03b42f24723283df8d271414a460eb134` |
| [Feature_3_2_L4_B24_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B24_Design_and_Checkpoint_REVIEW.md) | `efd632daf612c4da36f65abf1d2056f5a6332acc` |
| [Feature_3_2_L4_B25_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B25_Design_and_Checkpoint_REVIEW.md) | `540b6cb3ccbf625d8dc40b37ba97b98c52d6fbaf` |

## Inventory disposition

| Canonical L3 | Name | Design or prior evidence |
|---|---|---|
| F01-G01-M01 | Account Access | [03](Feature_3_2_L4_B03_Design_and_Checkpoint_REVIEW.md) |
| F01-G01-M02 | Session Security | [03](Feature_3_2_L4_B03_Design_and_Checkpoint_REVIEW.md) |
| F01-G02-M01 | Family Structure | [02](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md), [26](Feature_3_2_L4_B26_Partial_Slices_and_Cross_Module_Review_REVIEW.md) |
| F01-G02-M02 | Member Relationships | [03](Feature_3_2_L4_B03_Design_and_Checkpoint_REVIEW.md) |
| F01-G03-M01 | Core Identity | [04](Feature_3_2_L4_B04_Design_and_Checkpoint_REVIEW.md) |
| F01-G03-M02 | Profile Integrity | [04](Feature_3_2_L4_B04_Design_and_Checkpoint_REVIEW.md) |
| F01-G04-M01 | Access Policy | P6 review |
| F01-G04-M02 | Consent Ledger | B01 normalized reference |
| F01-G05-M01 | Mode State | B01 normalized reference |
| F01-G05-M02 | Mode Transitions | [03](Feature_3_2_L4_B03_Design_and_Checkpoint_REVIEW.md) |
| F01-G06-M01 | Lifecycle Controls | [04](Feature_3_2_L4_B04_Design_and_Checkpoint_REVIEW.md), [26](Feature_3_2_L4_B26_Partial_Slices_and_Cross_Module_Review_REVIEW.md) |
| F01-G06-M02 | Entitlements & Billing | [25](Feature_3_2_L4_B25_Design_and_Checkpoint_REVIEW.md) |
| F01-G06-M03 | Subscription Billing Lifecycle | [25](Feature_3_2_L4_B25_Design_and_Checkpoint_REVIEW.md) |
| F02-G01-M01 | Intake & Updates | [10](Feature_3_2_L4_B10_Design_and_Checkpoint_REVIEW.md) |
| F02-G01-M02 | Incremental Questions | [10](Feature_3_2_L4_B10_Design_and_Checkpoint_REVIEW.md) |
| F02-G02-M01 | Preference Registry | [10](Feature_3_2_L4_B10_Design_and_Checkpoint_REVIEW.md) |
| F02-G02-M02 | Preference Revision | [10](Feature_3_2_L4_B10_Design_and_Checkpoint_REVIEW.md) |
| F02-G03-M01 | Evidence-linked Observations | [10](Feature_3_2_L4_B10_Design_and_Checkpoint_REVIEW.md) |
| F02-G03-M02 | Non-labeling Review | [11](Feature_3_2_L4_B11_Design_and_Checkpoint_REVIEW.md) |
| F02-G04-M01 | Environment Context | [11](Feature_3_2_L4_B11_Design_and_Checkpoint_REVIEW.md) |
| F02-G04-M02 | Context Permissions | [11](Feature_3_2_L4_B11_Design_and_Checkpoint_REVIEW.md) |
| F02-G05-M01 | Versioned Profile | [11](Feature_3_2_L4_B11_Design_and_Checkpoint_REVIEW.md) |
| F02-G05-M02 | Child Feedback | [12](Feature_3_2_L4_B12_Design_and_Checkpoint_REVIEW.md) |
| F02-G06-M01 | Provenance | [12](Feature_3_2_L4_B12_Design_and_Checkpoint_REVIEW.md) |
| F02-G06-M02 | Correction & Confidence | [12](Feature_3_2_L4_B12_Design_and_Checkpoint_REVIEW.md) |
| F03-G01-M01 | Framework Registry | [13](Feature_3_2_L4_B13_Design_and_Checkpoint_REVIEW.md) |
| F03-G01-M02 | Evidence Alignment | [13](Feature_3_2_L4_B13_Design_and_Checkpoint_REVIEW.md) |
| F03-G02-M01 | Dimension Taxonomy | [13](Feature_3_2_L4_B13_Design_and_Checkpoint_REVIEW.md) |
| F03-G02-M02 | Domain Mapping | [13](Feature_3_2_L4_B13_Design_and_Checkpoint_REVIEW.md) |
| F03-G03-M01 | Stage Catalog | [13](Feature_3_2_L4_B13_Design_and_Checkpoint_REVIEW.md) |
| F03-G03-M02 | Accessibility Adaptation | [14](Feature_3_2_L4_B14_Design_and_Checkpoint_REVIEW.md) |
| F03-G04-M01 | Goal Discovery | [14](Feature_3_2_L4_B14_Design_and_Checkpoint_REVIEW.md) |
| F03-G04-M02 | Goal Constraints | [14](Feature_3_2_L4_B14_Design_and_Checkpoint_REVIEW.md) |
| F03-G04-M03 | Development Roadmap & Milestones | [14](Feature_3_2_L4_B14_Design_and_Checkpoint_REVIEW.md) |
| F03-G05-M01 | Grounded Recommendation | [14](Feature_3_2_L4_B14_Design_and_Checkpoint_REVIEW.md) |
| F03-G05-M02 | Recommendation Review | [15](Feature_3_2_L4_B15_Design_and_Checkpoint_REVIEW.md) |
| F03-G05-M03 | Career Exploration Guidance | [15](Feature_3_2_L4_B15_Design_and_Checkpoint_REVIEW.md) |
| F03-G06-M01 | Goal Reassessment | [15](Feature_3_2_L4_B15_Design_and_Checkpoint_REVIEW.md) |
| F03-G06-M02 | Goal Change Proposal | [15](Feature_3_2_L4_B15_Design_and_Checkpoint_REVIEW.md) |
| F04-G01-M01 | Plan Structure | B01 normalized reference |
| F04-G01-M02 | Plan Templates | [16](Feature_3_2_L4_B16_Design_and_Checkpoint_REVIEW.md) |
| F04-G02-M01 | Schedule Construction | [16](Feature_3_2_L4_B16_Design_and_Checkpoint_REVIEW.md) |
| F04-G02-M02 | Schedule Conflict | [16](Feature_3_2_L4_B16_Design_and_Checkpoint_REVIEW.md) |
| F04-G02-M03 | Balanced Planning Validation | P6 review |
| F04-G03-M01 | Task Ownership | [16](Feature_3_2_L4_B16_Design_and_Checkpoint_REVIEW.md) |
| F04-G03-M02 | Approval Routing | [16](Feature_3_2_L4_B16_Design_and_Checkpoint_REVIEW.md) |
| F04-G04-M01 | Daily Task View | [17](Feature_3_2_L4_B17_Design_and_Checkpoint_REVIEW.md) |
| F04-G04-M02 | Execution Support | [17](Feature_3_2_L4_B17_Design_and_Checkpoint_REVIEW.md) |
| F04-G05-M01 | Lightweight Check-off | [17](Feature_3_2_L4_B17_Design_and_Checkpoint_REVIEW.md) |
| F04-G05-M02 | Evidence Submission | [18](Feature_3_2_L4_B18_Design_and_Checkpoint_REVIEW.md) |
| F04-G06-M01 | Change Requests | B01 normalized reference |
| F04-G06-M02 | Change History | [02](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md) |
| F04-G07-M01 | Schedule Notifications | [18](Feature_3_2_L4_B18_Design_and_Checkpoint_REVIEW.md) |
| F04-G07-M02 | Notification Preferences | [18](Feature_3_2_L4_B18_Design_and_Checkpoint_REVIEW.md) |
| F05-G01-M01 | Child Conversation | [08](Feature_3_2_L4_B08_Design_and_Checkpoint_REVIEW.md) |
| F05-G01-M02 | Companion Guardrails | [08](Feature_3_2_L4_B08_Design_and_Checkpoint_REVIEW.md) |
| F05-G02-M01 | Opt-in Check-in | [08](Feature_3_2_L4_B08_Design_and_Checkpoint_REVIEW.md) |
| F05-G02-M02 | Check-in Controls | [08](Feature_3_2_L4_B08_Design_and_Checkpoint_REVIEW.md) |
| F05-G03-M01 | Reflection Prompts | [08](Feature_3_2_L4_B08_Design_and_Checkpoint_REVIEW.md) |
| F05-G03-M02 | Reflection Review | [09](Feature_3_2_L4_B09_Design_and_Checkpoint_REVIEW.md) |
| F05-G04-M01 | Private Entries | [04](Feature_3_2_L4_B04_Design_and_Checkpoint_REVIEW.md) |
| F05-G04-M02 | Journal Retrieval | [04](Feature_3_2_L4_B04_Design_and_Checkpoint_REVIEW.md) |
| F05-G05-M01 | Structured Insight | [09](Feature_3_2_L4_B09_Design_and_Checkpoint_REVIEW.md) |
| F05-G05-M02 | Insight Correction | [09](Feature_3_2_L4_B09_Design_and_Checkpoint_REVIEW.md) |
| F05-G06-M01 | Selective Sharing | [02](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md) |
| F05-G06-M02 | Deletion Graph | [03](Feature_3_2_L4_B03_Design_and_Checkpoint_REVIEW.md) |
| F06-G01-M01 | Activity Event Log | [19](Feature_3_2_L4_B19_Design_and_Checkpoint_REVIEW.md) |
| F06-G01-M02 | Source Metadata | [19](Feature_3_2_L4_B19_Design_and_Checkpoint_REVIEW.md) |
| F06-G02-M01 | Progress Rules | [19](Feature_3_2_L4_B19_Design_and_Checkpoint_REVIEW.md) |
| F06-G02-M02 | Progress Exceptions | [19](Feature_3_2_L4_B19_Design_and_Checkpoint_REVIEW.md) |
| F06-G03-M01 | Indicator Registry | [19](Feature_3_2_L4_B19_Design_and_Checkpoint_REVIEW.md) |
| F06-G03-M02 | Indicator Evidence | [20](Feature_3_2_L4_B20_Design_and_Checkpoint_REVIEW.md) |
| F06-G04-M01 | Deterministic Trends | [20](Feature_3_2_L4_B20_Design_and_Checkpoint_REVIEW.md) |
| F06-G04-M02 | Cautious Insights | [20](Feature_3_2_L4_B20_Design_and_Checkpoint_REVIEW.md) |
| F06-G05-M01 | Audience Views | [20](Feature_3_2_L4_B20_Design_and_Checkpoint_REVIEW.md) |
| F06-G05-M02 | Summary Rendering | [21](Feature_3_2_L4_B21_Design_and_Checkpoint_REVIEW.md) |
| F06-G06-M01 | Review Sessions | [21](Feature_3_2_L4_B21_Design_and_Checkpoint_REVIEW.md) |
| F06-G06-M02 | Feedback Handoff | [21](Feature_3_2_L4_B21_Design_and_Checkpoint_REVIEW.md) |
| F06-G07-M01 | Academic Assessment | P6 review |
| F07-G01-M01 | Content CMS | [05](Feature_3_2_L4_B05_Design_and_Checkpoint_REVIEW.md) |
| F07-G01-M02 | Structured Retrieval | [05](Feature_3_2_L4_B05_Design_and_Checkpoint_REVIEW.md) |
| F07-G02-M01 | Editorial Workflow | [05](Feature_3_2_L4_B05_Design_and_Checkpoint_REVIEW.md) |
| F07-G02-M02 | Evidence Provenance | [05](Feature_3_2_L4_B05_Design_and_Checkpoint_REVIEW.md) |
| F07-G03-M01 | Single Interface Router | [05](Feature_3_2_L4_B05_Design_and_Checkpoint_REVIEW.md) |
| F07-G03-M02 | Execution Budget | [06](Feature_3_2_L4_B06_Design_and_Checkpoint_REVIEW.md) |
| F07-G03-M03 | Multimodal Interaction Orchestration | [06](Feature_3_2_L4_B06_Design_and_Checkpoint_REVIEW.md) |
| F07-G04-M01 | Policy Evaluation | [06](Feature_3_2_L4_B06_Design_and_Checkpoint_REVIEW.md) |
| F07-G04-M02 | Model Evaluation | [07](Feature_3_2_L4_B07_Design_and_Checkpoint_REVIEW.md) |
| F07-G05-M01 | Safety Triage | [07](Feature_3_2_L4_B07_Design_and_Checkpoint_REVIEW.md) |
| F07-G05-M02 | Human Response Workflow | [07](Feature_3_2_L4_B07_Design_and_Checkpoint_REVIEW.md) |
| F07-G06-M01 | Purpose-bound Access | B01 normalized reference |
| F07-G06-M02 | Retention & Export | [02](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md), [26](Feature_3_2_L4_B26_Partial_Slices_and_Cross_Module_Review_REVIEW.md) |
| F07-G07-M01 | Operational Console | [25](Feature_3_2_L4_B25_Design_and_Checkpoint_REVIEW.md) |
| F07-G07-M02 | Billing & Cost Operations | [25](Feature_3_2_L4_B25_Design_and_Checkpoint_REVIEW.md) |
| F08-G01-M01 | School Data Connectors | [22](Feature_3_2_L4_B22_Design_and_Checkpoint_REVIEW.md) |
| F08-G01-M02 | School Data Review | [22](Feature_3_2_L4_B22_Design_and_Checkpoint_REVIEW.md) |
| F08-G02-M01 | Expert Discovery | [22](Feature_3_2_L4_B22_Design_and_Checkpoint_REVIEW.md) |
| F08-G02-M02 | Expert Referral | [22](Feature_3_2_L4_B22_Design_and_Checkpoint_REVIEW.md) |
| F08-G03-M01 | Activity Directory | [22](Feature_3_2_L4_B22_Design_and_Checkpoint_REVIEW.md) |
| F08-G03-M02 | Resource Matching | [23](Feature_3_2_L4_B23_Design_and_Checkpoint_REVIEW.md) |
| F08-G04-M01 | Device Consents | [23](Feature_3_2_L4_B23_Design_and_Checkpoint_REVIEW.md) |
| F08-G04-M02 | External Data Import | [23](Feature_3_2_L4_B23_Design_and_Checkpoint_REVIEW.md) |
| F08-G05-M01 | Commerce Catalog | [23](Feature_3_2_L4_B23_Design_and_Checkpoint_REVIEW.md) |
| F08-G05-M02 | Transaction & Conflict Controls | [24](Feature_3_2_L4_B24_Design_and_Checkpoint_REVIEW.md) |
| F08-G06-M01 | Education Budget Planning | [24](Feature_3_2_L4_B24_Design_and_Checkpoint_REVIEW.md) |
| F08-G06-M02 | Expense & Approval Management | [24](Feature_3_2_L4_B24_Design_and_Checkpoint_REVIEW.md) |
