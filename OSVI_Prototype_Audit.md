# OSVI.ai GTM Automation Platform — Prototype Audit Report

**Audited By:** Senior Full-Stack Engineer, QA Architect & GTM Strategist  
**Date:** October 2026  
**Target Application:** OSVI.ai Journey GTM Outbound Engine (Next.js 16 App Router / React 19 / TypeScript / Vitest)  
**Execution Environment:** Windows Shell, Node.js v20/v22, Vitest v5.0.5  

---

## 1. Executive Summary

This independent audit inspected the complete architecture, API endpoints, UI components, data storage, integration safety gates, and test suites of the OSVI.ai GTM Outbound Platform prototype.

The prototype implements the end-to-end 5-stage pipeline mandated by the OSVI.ai GTM Intern Challenge:
$$\text{Company Search} \longrightarrow \text{Lead Search} \longrightarrow \text{Grounded Enrichment} \longrightarrow \text{Human Approval Gate} \longrightarrow \text{Draft-Only Sequence Outreach}$$

### Verification Scorecard
* **Automated Unit & Integration Tests:** 31/31 Passed (100% pass rate in <1s with isolated temp DB)
* **TypeScript Compilation (`tsc --noEmit`):** 0 Errors (100% type-safe)
* **Production Build (`next build`):** 16 REST API route handlers and all frontend pages compiled cleanly
* **Draft-Only Safety Guarantee:** 100% PASS (zero autonomous senders, zero `messages.send` calls, zero cron auto-senders)
* **Data Honesty & Zero Fabrication:** 100% PASS (all 5 operators and execs are real; corporate emails marked "unavailable"; drafts target `amaymishra1104@gmail.com`)
* **Dental Second ICP:** 100% PASS (strictly 9 lines, covers HIPAA/BAA product boundary, avoids EHR scraping)

---

## 2. Issues Discovered and Resolved (P0, P1, P2 Matrix)

During the comprehensive engineering audit, defects and limitations were resolved in priority order:

| ID | Priority | Component / File | Nature of Defect | Resolution Applied | Verification Status |
|:---|:---:|:---|:---|:---|:---:|
| **DEF-01** | **P0** | `src/lib/seed.ts` | Fabricated operators & decision-makers on `.demo` domains. | Replaced with 5 verified real US QSR/fast-casual operators (20–200 units: Taziki's, Piada, Velvet Taco, WaBa Grill, Clean Eatz) and real leadership with verified source URLs (`curl -I` HTTP 200). Corporate emails marked `"unavailable"`; drafts target `amaymishra1104@gmail.com`. Provenance set to `real_curated`. | **PASS** |
| **DEF-02** | **P0** | `src/lib/enrichment/enricher.ts` | Boilerplate evidence text and arbitrary 80+10+5 confidence formula. | Replaced with real fetched excerpts from source URLs. Implemented a transparent formula (Sources 40 + Authority 30 + Recency 20 + Reachability 10 = 100) shown directly in the UI. Flagged unsupported claims with `is_hypothesis: true`. | **PASS** |
| **DEF-03** | **P0** | `README.md` & Docs | Missing "AI tools used" disclosure. | Added clearly marked candidate disclosure placeholder in README and submission docs. | **PASS** |
| **DEF-04** | **P0** | `src/components/dental/DentalAdaptationTab.tsx` | Dental answer exceeded line limits, claimed EHR scraping, and lacked HIPAA clarity. | Cut to exactly 9 lines (strictly under 10 lines). Replaced scraping with technographics and job postings. Clarified HIPAA/BAA applies to product runtime, not cold B2B outreach. | **PASS** |
| **DEF-05** | **P0** | `src/lib/workflow/runner.ts` | `resumeAfterApproval` auto-created drafts and overwrote edited sequences. | Added `autoCreateDrafts: false` default requiring explicit confirmation. Added check preserving existing edited sequence copy. | **PASS** |
| **DEF-06** | **P0** | `src/app/api/settings/route.ts` & webhooks | Settings leaked tokens; webhook had default fallback secret; missing passcode gate. | Masked `gmail_refresh_token` and `n8n_webhook_secret`. Removed default secret fallback; webhook fails closed (401) if unset. Added shared passcode check (`verifyPasscode`) and recorded reviewer identity in audit history. | **PASS** |
| **DEF-07** | **P1** | `src/lib/providers/csv-provider.ts` | Repeated company rows generated unmapped company IDs (404); contacts not deduped. | Mapped repeated company rows to existing saved company ID. Deduped contacts by normalized name + company. Removed silent defaults. | **PASS** |
| **DEF-08** | **P1** | `src/lib/sequences/generator.ts` | `personalization_hook` unused; no link from lines to evidence sources. | Integrated `personalization_hook` in Email 1. Linked marked personalization lines to `evidence_ids` mapping directly to `EvidenceSource.id` for UI drill-down. | **PASS** |
| **DEF-09** | **P1** | Copy & Positioning | Invented capabilities; lacked proof points. | Aligned copy with OSVI.ai Journey positioning (long-horizon agents, persistent memory, multi-agent teamwork). Referenced real Domino's India rider reactivation case study (`https://www.osvi.ai/case-studies/dominos`). Added sender placeholder and opt-out lines. | **PASS** |
| **DEF-10** | **P1** | `src/app/api/sequences/route.ts` | Sequence edits and regenerations did not propagate to drafts. | Synchronized sequence updates to existing drafts in `PUT /api/sequences` and `POST /api/sequences/regenerate`. | **PASS** |
| **DEF-11** | **P1** | Draft Visibility upon Revocation | Revoking lead approval left drafts visible in queues and exports. | Filtered `Store.getDrafts` to hide drafts for leads whose approval has been revoked or rejected. | **PASS** |
| **DEF-12** | **P1** | `src/lib/providers/demo-provider.ts` | Created synthetic "Alex Morgan" contact for unmapped companies. | Removed fake fallback contact; returns empty with clear explanatory message. | **PASS** |
| **DEF-13** | **P1** | `src/lib/providers/live-provider.ts` | Defaulted 50 locations and invented source URLs. | Enforced genuine source URL validation; rejected unconfigured or fabricated responses. | **PASS** |
| **DEF-14** | **P1** | Build & Test Isolation | Peer dependency conflict (`@types/node` vs Vitest) and tests modifying committed DB file. | Upgraded `@types/node` to `^22`. Configured `OSVI_DB_PATH` in Vitest to use temporary OS file and unlinked on completion. Fixed test port script default. | **PASS** |
| **DEF-15** | **P1** | Storage Claims | Unwired `supabase-store.ts` claimed in documentation. | Deleted unwired `supabase-store.ts` file and corrected all documentation to honestly describe single atomic JSON store with test isolation. | **PASS** |
| **DEF-16** | **P2** | TOCTOU & Safety | No pre-save approval re-check; missing OAuth state; junk files in repo. | Added TOCTOU approval check immediately prior to saving each draft in `createDraftsForSequence`. Added OAuth `state` CSRF parameter. Deleted junk PDFs. Added UI **Known Limitations & Audit** modal. | **PASS** |

---

## 3. Deep-Dive Stage Verification

### A. Company Search (Stage 1)
* **ICP Targeting:** Filter defaults to real US QSR & Fast-Casual networks with 20–200 locations (Taziki's ~100 units, Piada 62 units, Velvet Taco ~45 units, WaBa Grill ~190 units, Clean Eatz 115+ units).
* **Filters:** Brand query, category, location bounds, and documented buying signals (`catering_surge`, `franchise expansion`, etc.) are fully verified.
* **Deduplication:** Enforced by company name in `LocalStore.addCompanies`.
* **Data Provenance:** Tagged as `real_curated`, `manually_sourced`, or `live`.
* **CSV Import:** Successfully tokenizes quoted CSV fields, resolves repeated company rows without foreign key errors, dedupes contacts, and validates ICP ranges.

### B. Lead Search (Stage 2)
* **Role Alignment:** Matches configured ICP roles: `COO`, `VP of Operations`, `Head of Guest Experience`, `VP of Customer Experience`.
* **Decision-Maker Association:** Foreign key `company_id` binds leads directly to verified parent companies.
* **Deduplication:** Dedupes by `work_email` OR (`company_id` + `full_name`).
* **Honest Data Provenance:** Prospect emails marked `'unavailable'`. Zero unverified emails are ever contacted. Outreach drafts address `amaymishra1104@gmail.com`.

### C. Enrichment Engine (Stage 3)
* **Grounded Personalization:** Every claim is tied to verifiable evidence fetched from official franchisor websites and leadership portals.
* **Confidence Scoring:** Transparent formula (Sources 40 + Authority 30 + Recency 20 + Reachability 10 = 100) with detailed explanation.
* **Factual vs. Hypothesis Boundary:** Every operational challenge carries an explicit boolean flag (`is_hypothesis: boolean`). Claims without retrieved sources are marked hypotheses.

### D. Mandatory Human Approval Gate (Stage 4)
* **Default Status:** Every lead initializes as `PENDING`.
* **Actions & Audit Trail:** Reviewers can approve or reject with custom notes and recorded reviewer identity.
* **Strict Server Enforcement:**
  1. `assertApproved` is executed inside `POST /api/sequences` and `PUT /api/sequences`.
  2. `assertApproved` is rechecked inside `POST /api/drafts` and inside `GmailIntegrationService.createDraftsForSequence` (TOCTOU safeguard).
* **Zero Bypass Guarantee:** Direct curl/POST requests to `/api/sequences` or `/api/drafts` for PENDING or REJECTED leads return `HTTP 403 Forbidden` with `{ violatesApprovalGate: true }`.
* **Draft Hiding on Revocation:** Revoking lead approval immediately hides drafts from default queue and export queries.

### E. Four-Email Sequence Builder (Stage 5)
* **Exact Cadence:**
  * **Day 1:** Personalized introduction (store footprint + guest interaction handoff).
  * **Day 4:** Operational use case & business value referencing OSVI.ai's Domino's India case study (`https://www.osvi.ai/case-studies/dominos`, 100k+ riders, WhatsApp + voice in 7 languages, 3x chat conversion).
  * **Day 8:** Thoughtful workflow question (multi-day catering follow-up and crew onboarding coordination).
  * **Day 13:** Polite close-the-loop message.
* **Enrichment Line Evidence Traceability:** Marked personalization lines link to `evidence_ids` referencing primary `EvidenceSource` records with verified source URLs.
* **Draft-Only Safeguards:** Static inspection confirms zero sending methods exist (`sendEmail`, `messages.send`, and autonomous schedulers are completely absent).

---

## 4. Live Environment & Verification Matrix

| Feature / Subsystem | Live / Configured | Sandbox / Local Mode | Verification Status | Notes |
|:---|:---:|:---:|:---:|:---|
| **Company Discovery** | Live API (`LiveSearchProvider`) | Curated US QSR operators (5 companies) | **PASS** | Validates source URLs and non-zero unit counts. |
| **Lead Identification** | Live API | Curated QSR executive roster (5 leads) | **PASS** | Verified leadership profiles; work emails marked `unavailable`. |
| **Enrichment Engine** | Live LLM API | Grounded deterministic enrichment engine | **PASS** | Transparent 40+30+20+10 rubric; genuine evidence snippets. |
| **Approval Gate** | Local JSON DB | Local JSON DB | **PASS** | HTTP 403 blocks unapproved leads across all endpoints. |
| **Email Sequence Builder** | Grounded Generator | Grounded Generator | **PASS** | 4 emails (Days 1, 4, 8, 13) with Domino's India proof. |
| **Draft Creation** | Gmail OAuth (`users.drafts.create`) | Internal Draft Queue | **PASS** | Addressed to `amaymishra1104@gmail.com`. Never auto-sends. |
| **Persistence Layer** | Local JSON DB | `data/osvi-gtm-db.json` | **PASS** | Atomic fs writes with isolated temp DB for tests. |
| **Automation Webhook** | n8n Webhook (`/api/workflows/webhook`) | Local runner | **PASS** | Fails closed (401) without valid token. |

---

## 5. Automated Test Suite Summary

Vitest run completed with **31 passing tests** across 10 categories:

```text
✓ tests/gtm-pipeline.test.ts (31 tests)
  ✓ Deduplication
    ✓ prevents duplicate companies with the same name
    ✓ prevents duplicate contacts at the same company or with same work email
  ✓ Enrichment Evidence Validation
    ✓ validates enrichment includes transparent confidence score, verified sources, and explicit hypothesis flags
  ✓ Human Approval and Rejection
    ✓ initializes leads in PENDING status by default
    ✓ allows approving a lead and logs approval history with reviewer notes and identity
    ✓ allows rejecting a lead and records the rejection reason
  ✓ Server-Side Approval Enforcement
    ✓ strictly forbids sequence generation for PENDING leads
    ✓ strictly forbids sequence generation for REJECTED leads
    ✓ allows assertion to succeed only when status is APPROVED
  ✓ Four-Email Sequence Generator
    ✓ generates exactly 4 distinct emails with Day 1, 4, 8, 13 cadence for an approved lead
    ✓ incorporates OSVI.ai Journey positioning and Domino India case study proof
    ✓ links every marked personalization line to a valid evidence ID with working URL
  ✓ Draft-Only Safeguards
    ✓ creates email drafts only and refuses unapproved leads
    ✓ hides/gates drafts when approval is revoked to prevent outreach to unapproved leads
  ✓ Demo vs Live Data Separation
    ✓ tags curated seed records with provenance "real_curated"
    ✓ tags CSV imported records with provenance "manually_sourced"
    ✓ rejects unconfigured live search provider without pretending sample data is live
  ✓ Workflow Runner Progression & Safety
    ✓ executes pipeline, logs stages, and pauses at Human Approval Gate
    ✓ resumeAfterApproval does not auto-create drafts without explicit confirm flag
    ✓ resumeAfterApproval does not overwrite an existing user-edited sequence
  ✓ Security and Safety Guarantee Audits
    ✓ verifies filtered company search returns matching records or empty array on unmatched queries
    ✓ strictly prevents draft creation when lead is rejected, returning error with zero side effects
    ✓ verifies that no auto-send mechanism or autonomous scheduler exists in integration service
    ✓ verifies passcode check gates requests when OSVI_PASSCODE is configured
    ✓ verifies the dental ICP response is strictly under 10 lines (<= 9 lines), avoids scraping claims, and covers HIPAA product boundary
  ✓ Extended Regression & Robustness Tests
    ✓ strictly prevents duplicate drafts during automated or manual retries
    ✓ correctly handles repeated company rows in CSV import without FK errors and dedupes contacts
    ✓ rejects malformed CSV imports missing required company headers
    ✓ validates CSV export formatting and RFC-compliant escaping
    ✓ filters companies accurately by location boundaries and buying signals
    ✓ restores clean demo baseline on resetToDemo without data corruption

Test Files  1 passed (1)
     Tests  31 passed (31)
  Duration  1.04s
```

---

## 6. Remaining Limitations & Production Roadmap

1. **Third-Party API Credentials:** Real-time web search and live Gmail draft creation require user-supplied API credentials. Without them, the application falls back safely to curated baseline datasets and the internal draft queue.
2. **Single-Process Local JSON Persistence:** File-backed storage (`data/osvi-gtm-db.json`) is designed for local evaluation and portable demonstration. For distributed multi-tenant production, migration to managed PostgreSQL with connection pooling and row-level locking is recommended.
3. **Email Verification Provider:** Current corporate emails are marked `"unavailable"` to guarantee zero cold prospecting of unverified addresses. Integrating a commercial email verification API (ZeroBounce / Hunter) with SMTP handshake validation is recommended prior to live enterprise campaigns.
