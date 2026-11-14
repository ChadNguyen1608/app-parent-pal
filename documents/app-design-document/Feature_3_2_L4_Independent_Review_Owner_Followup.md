# Owner follow-up · Child App Linking and safety scope

Source: Owner response following independent review disposition at `7105c008696a78d32ae7b272453bfbc88f20ad8b`.

- **Linking flow.** The Child App generates a distinct ID on the child's device. The guardian uses that ID on their device to match the Child App to the household. The Child App provides an unlink option. This replaces the assumed guardian-initiated pairing direction in B02. Existing authorization and scope checks still apply. The generated ID does not by itself establish authority or grant data access. ID lifetime, replacement after unlink, verification mechanics, and same-child enrollment in a different household after unlink remain open. ODP-01 still prohibits transferring an existing link across households.
- **Human response.** Human response workflow is out of initial release scope. A safety signal does not create a human case or imply live monitoring. Preserve the independent gates for any reviewed static support content.
- **AI answer scope.** Owner requested clarification on the difference between safety scenarios and ordinary AI requests. Global versus safety-only applicability remains open. No change to the provisional fail-closed design while awaiting clarification.

Candidate verification: Child App generates its own ID; an authorized guardian can use it to match within the allowed household; the Child App can unlink; after effective unlink, protected operations relying on the former binding are denied. Attempted transfer of the existing link fails. These are design oracles, not runtime evidence.

## Owner decision · response to a risk-of-harm signal

When the safety rules identify a risk-of-harm signal, the only child-facing advice in this flow is to talk to a trusted adult who can help. Use reviewed static wording and do not generate additional advice or decide or act on the child's behalf. This advice does not initiate a human case, contact an adult, notify family, or share the child's message. Human response remains out of initial release scope. This decision specifies the safety flow. The applicability of the approved-answer-scope rule to ordinary AI requests remains open.

**Proposed oracle IR-T03:** Given authorized processing and an eligible safety trigger, including when AI answer scope is UNKNOWN, show only the reviewed suggestion to talk to a trusted adult. Assert zero generated AI answer bytes, zero outbound contact or disclosure, and zero human case or other action taken on the child's behalf. The safety trigger itself creates no new access authority.
