# Parent-Pal · Consolidation Owner Decision Log

Status: OWNER DECISIONS RECORDED · FINAL L4 ACCEPTANCE PENDING

Source: Product Owner’s numbered response to the [Owner Decision Package](Feature_3_2_L4_Consolidation_and_Owner_Decision_Package_REVIEW.md). Package snapshot `db71db4d44bc2a3f37b41093dbb50e365c43ab05`, package blob `f9aea057c2462298043a43a6e48b7d30f3584b13`.

| ID | Owner decision | Candidate design consequence |
|---|---|---|
| ODP-01 | Không hỗ trợ chuyển liên kết giữa hai hộ gia đình. Owner nêu lý do là quy trình phức tạp và ít xảy ra. | Child App Linking rejects a cross-household transfer with no binding or permission change. A disputed or ambiguous binding can enter scoped verification/support for resolution within approved policy. Support has no transfer capability under this decision. |
| ODP-02 | Theo đề xuất: quy trình xóa Journal một chiều sau bước xác nhận rõ ràng, tùy kết quả xác minh nghĩa vụ pháp lý. | After an authorized deletion is accepted, product flow offers no withdrawal or restore. Preserve immediate suppression and the approved 60-day permanent deletion baseline, subject to verified legal requirements and disclosed lawful exceptions. If verification requires another path, return the conflict to Owner review before release. |
| ODP-03 | AI sau này chỉ sử dụng các câu trả lời đã được hỗ trợ, hoặc đã được huấn luyện. Ngoài đó thì không phản hồi. | Enforce an approved scope for AI responses. For an out-of-scope request, or when scope cannot be established, emit no AI answer. Define and verify what qualifies as supported or trained before implementation. Human safety-response scope remains undecided. |

## Trace and proposed regression oracles

| Oracle | Trace | Expected result |
|---|---|---|
| ODP-T01 | B02 L2–L5; B03 membership; B26 family contract | With an active binding in household A, an actor in household B attempts transfer. No transfer or additional binding is created. Existing permissions are unchanged. Response discloses no private household information to the caller. |
| ODP-T02 | B02 R1–R6; B03 G3–G4; B26 export | After confirmed, accepted Journal deletion, a withdrawal or restore request leaves suppression and the original purge schedule intact under the proposed lawful configuration. Pending export and restored backups remain fenced. |
| ODP-T03 | B05 routing/fallback; B07 safety triage and human response; B08 companion guardrails | An in-scope request may receive an answer only after all current policy and permission gates pass. Outside-scope or unverified requests produce no AI answer. The AI decision creates no human assignment or disclosure authority. |

All oracles are proposed. Legal and independent review gates remain open. No canonical updates or merge.
