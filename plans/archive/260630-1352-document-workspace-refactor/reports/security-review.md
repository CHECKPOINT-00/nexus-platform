# Security review — document workspace refactor

> Review target: `plans/260630-1352-document-workspace-refactor/` (plan + research/scout reports).
> Methodology: OWASP-aligned security-review skill. Plan reviewed against the actual codebase it proposes to change; findings cite current code as evidence of inherited vulnerable patterns.
> Date: 2026-06-30

## Summary
- **Findings**: 3 High (needs design changes before coding), 3 Needs Verification
- **Risk Level**: High — the plan introduces a generalized document write/read model without mandating the three controls that make it safe (URL scheme allowlist on write, field-level write allowlist, single authz chokepoint + `case_id`-scoped reads)
- **Confidence**: High

This is a plan review, so findings are framed as **gaps in the plan that will produce exploitable vulnerabilities when implemented**, with the current code cited as evidence of the inherited vulnerable pattern.

---

## Findings

### [VULN-001] Stored XSS via document URLs rendered as `href` (High)
- **Location (plan)**: `phase-04-workspace-ia-and-ui-refactor.md:27` (open/download actions) and `phase-03-api-assembly-and-compatibility.md:97` ("sanitize all document labels and URLs returned to clients")
- **Confidence**: High
- **Issue**: The plan treats URL safety as an **output**-sanitization concern only. Output sanitization of a URL string is unreliable and does not stop `javascript:` / `data:` schemes in an `<a href>`. The plan never mandates a URL **scheme allowlist on the write path**. Current code confirms the gap is real and revision-specific: `submit-revision.usecase.ts:84-93` validates only that `drive_url`/`file_url` is a non-empty string — any value passes, including `javascript:alert(document.cookie)`. The Google-Drive regex in `cases.schema.ts:69` is wired into create-case **only**, checks **only** `documents[0].drive_url`, and ignores `file_url` and `documents[1+]`. Phase 04 then renders these URLs as clickable links for every unit type.
- **Impact**: A student submits `javascript:...` as a revision `file_url`; it is persisted verbatim (`case.repository.ts:394-398` stores `JSON.stringify(documents)`). When a supporter/admin opens the case and clicks the document link, the payload executes in the supporter/admin session — stored XSS with privileged-context impact. Phase 04 widens this surface to versions, assessments, and generated assets.
- **Evidence**:
  ```ts
  // submit-revision.usecase.ts:84-93 — no scheme check
  for (const doc of documents) {
    const driveUrl = doc?.drive_url || doc?.file_url;
    if (typeof driveUrl !== "string" || !driveUrl.trim()) { /* reject */ }
  }
  // TabIdeaContent.tsx:114-115 — rendered directly as href
  <a href={driveUrl} target="_blank" rel="noopener noreferrer">
  ```
- **Fix**: Add to Phase 01/02 an invariant: **every** document URL write field (`file_url`, `download_url`, `drive_url`) is validated with `new URL()` and rejected unless `protocol ∈ {http:, https:}`, plus a per-`source_kind` host allowlist (Drive → `drive.google.com`/`docs.google.com`; Cloudinary → configured cloud host) before persistence. Output sanitization is defense-in-depth, not the primary control. Cover **all** array entries, not `documents[0]`.

### [VULN-002] Mass-assignment on the new document write DTO (High)
- **Location (plan)**: `phase-01-backend-contract-and-model.md:48-64` (model) and `:107` (todo: "draft write DTO shape for intake/revision/supporter outputs")
- **Confidence**: High
- **Issue**: The proposed document record includes security-sensitive fields — `uploaded_by_auth_user_id`, `is_primary`, `seq`, `source_kind`, `cloudinary_public_id`, `checkpoint_id`, `lifecycle_unit_id` — but the plan never defines which fields are **client-writable** vs **server-derived**. Current code already persists the raw request body wholesale (`case.repository.ts:195` does `content: JSON.stringify(rawBody)`; `:394-398` stores `documents` as-is), so there is no field-allowlist habit to inherit.
- **Impact**: If the new write DTOs bind these fields from the request body: `uploaded_by_auth_user_id` → attribute a document to another user (identity/attribution spoofing, corrupts audit trail); `is_primary`/`seq` → attacker controls which file is shown as primary and ordering; `checkpoint_id`/`lifecycle_unit_id` → inject a document into the wrong checkpoint/unit, enabling cross-checkpoint data mixing and, if reads join without `case_id` re-validation, cross-case leakage (see VULN-003).
- **Fix**: Phase 01 must define an explicit write-field allowlist per role. `uploaded_by_auth_user_id` (from session), `is_primary`/`seq` (server-computed), `source_kind` (server-derived from upload channel), `cloudinary_public_id` (server-assigned), and `checkpoint_id`/`lifecycle_unit_id` (from path params, re-verified to belong to the authorized case) must **never** be accepted from the request body. Use a typed input DTO that omits these fields, not the persistence model.

### [VULN-003] Authorization not funneled through one chokepoint; document-tree joins risk cross-case leakage (High)
- **Location (plan)**: `phase-03-api-assembly-and-compatibility.md:55-56` (reshapes `get-case-detail.usecase.ts`) — implementation steps `:62-71` do not mandate `requireCaseAccess` nor a `case_id`-scoped document query. Invariant stated only at `phase-01:125` ("no cross-case leakage through unit/file joins").
- **Confidence**: High
- **Issue**: `get-case-detail.usecase.ts:44-51` reimplements authorization inline instead of calling `requireCaseAccess`, so there are already two divergent authz code paths. Phase 03 reshapes this usecase and adds a `document_workspace` projection assembled from normalized records, but does not mandate (a) routing through `requireCaseAccess` or (b) fetching document rows with `where: { case_id }` from the authorized case. The plan itself flags that legacy rows contain orphan/cross-linked `lifecycle_unit_id`/`checkpoint_id` (`phase-02:47`). If the new tree is assembled by joining documents on `lifecycle_unit_id`/`checkpoint_id` without a `case_id` filter, a cross-linked row leaks another case's file metadata/URLs to a user authorized only for the requested case.
- **Impact**: Cross-case file metadata/URL disclosure via malformed or cross-linked legacy rows — exactly the class of data the plan is migrating. IDOR-adjacent, case-scoped.
- **Fix**: Phase 03 must (1) route the document-tree assembly through `requireCaseAccess` (consolidate the inline duplicate), (2) query document rows with `where: { case_id: <authorizedCaseId> }` — never join solely on `lifecycle_unit_id`/`checkpoint_id`, and (3) fail closed (drop + audit) any row whose `case_id` ≠ the authorized case id rather than silently including it.

---

## Needs Verification

### [VERIFY-001] Full `case` object returned to client — information disclosure
- **Location**: `get-case-detail.usecase.ts:81` (`case: caseDetails` from `findCaseByIdWithAllRelations`); plan `phase-03` is additive and preserves the `case` field.
- **Question**: `findCaseByIdWithAllRelations` likely returns `internal_status`, `assigned_supporter_auth_user_id`, and `members[].auth_user_id`. Confirm which internal-only fields leak to students via the response, and add a response-field allowlist to Phase 03's DTO work (don't pass the persistence model straight to `c.json`).

### [VERIFY-002] Cloudinary URL longevity / signed-URL policy
- **Location**: `plan.md:30` ("signed/public URL" listed as undecided); current precedent `README.md:48` stores long-lived public Cloudinary `secure_url` for payment proofs.
- **Question**: For non-public documents, will `download_url`/`file_url` be long-lived public Cloudinary URLs or signed short-TTL per-request URLs? Long-lived public URLs make any leaked link permanent access with no post-disclosure access control. Phase 03/04 should mandate signed + short-expiry URLs for non-public documents.

### [VERIFY-003] Download mechanism — potential SSRF
- **Location**: `phase-04:27` and `phase-05:73` ("open/download behavior for Drive and Cloudinary sources") — mechanism unspecified.
- **Question**: Will "download" be a client-side redirect to the stored URL, or a server-side proxy that fetches the Drive/Cloudinary URL and streams it? A server proxy that fetches user-supplied Drive URLs is SSRF (internal metadata endpoints, `169.254.169.254`, etc.). No server-side URL fetch exists today (confirmed: only `proxy.ts` fetching the server-controlled `AUTH_BASE_URL`), so this is a design decision the plan must make explicit — prefer client redirect with scheme-validated URLs; if a proxy is required, apply the VULN-001 allowlist plus private-IP/redirect blocking on the fetch.

---

## Plan strengths (security-relevant)
- `plan.md:24` correctly flags the `checkpoints[0]` write anti-pattern (`submit-revision.usecase.ts:95`) as a must-decide item — addressing it also closes cross-checkpoint write misassignment.
- Phase 02 (`:47`) correctly mandates fail-validation (not auto-merge) for cross-case/orphan rows, and Phase 02/05 (`:98`, `:101`) flag URL leakage in logs/fixtures.

---

## Bottom line
No code to block yet, but Phase 01 must add three explicit invariants before schema/DTO work begins — URL scheme allowlist on write (VULN-001), client-writable field allowlist with server-derived identity/ownership fields (VULN-002), and single authz chokepoint + `case_id`-scoped document reads (VULN-003). Without these, the generalized document model is less safe than the narrow URL-blob model it replaces.

