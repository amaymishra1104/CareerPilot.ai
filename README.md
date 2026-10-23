# OSVI.ai GTM Automation Platform (QSR Journey Orchestration)

> **OSVI.ai GTM Intern Challenge Submission**  
> **Candidate:** Amay Mishra (`amaymishra1104@gmail.com`)  
> **Target:** US Quick-Service Restaurant (QSR) & Fast-Casual Operators (20–200 Units)  
> **Product Positioning:** Osvi AI "Journey" — Multi-agent orchestration layer above traditional voice/chat bots with persistent memory, multi-day inquiry management, and governed human handoffs.

---

## 1. Executive Summary & Authoritative Challenge Scope

This application is an audited, production-grade Go-To-Market (GTM) outreach engine built specifically to solve the OSVI.ai GTM Intern Challenge. It implements a strict, 5-stage governed pipeline designed to prospect, enrich, review, and draft personalized multi-day outreach into mid-market US restaurant operators.

### Core Architectural Decisions & Integrity Commitments
- **Zero Fabrication:** 100% of default operators, decision-makers, URLs, and store counts are real and publicly verifiable. No synthetic or hallucinated `.demo` domains.
- **Drafts-Only (Zero Auto-Send):** The Gmail integration is strictly limited to `users.drafts.create`. There is **zero code** invoking `users.messages.send` and no autonomous dispatch cron. All drafts are addressed to candidate inbox `amaymishra1104@gmail.com` or queued in the internal database to ensure zero real prospects receive unsolicited emails.
- **Deterministic Governed State-Machine:** Outreach is not run on an unbounded autonomous loop. Stage progression halts unconditionally at Stage 4 (Human Approval Gate) requiring manual operator sign-off before sequence creation or draft synthesis.
- **Honest Provenance & Transparent Scoring:** Enrichment confidence scores are calculated via a transparent, visible formula (Sources 40 + Authority 30 + Recency 20 + Reachability 10 = 100) and every marked personalization line links to a verifiable source URL and excerpt.

---

## 2. Ideal Customer Profile (ICP): US QSR & Fast Casual (20–200 Units)

### Why 20–200 Units First?
Operators in this tier face a severe "orchestration gap":
1. **Too large for manual staff handling:** At 20–200 units, store general managers cannot keep up with high-value multi-day catering inquiries, driver recruitment drop-offs, or negative guest review recovery.
2. **Too small / lean for custom enterprise IT:** Unlike McDonald's or Yum! Brands, operators with 20–200 units cannot invest $50M building bespoke agentic infrastructure.
3. **Disjointed point-solution fatigue:** They already run point solutions (Toast/NCR POS, Ovation guest feedback, 7shifts scheduling, simple phone IVRs), but these bots fail when guest or employee interactions span multiple days and channels.

### Decision-Maker Roles
- **Chief Operating Officer (COO):** Directly accountable for multi-unit labor efficiency, store-level throughput, and margin preservation.
- **VP / Director of Operations:** Manages regional franchise performance, store technology rollouts, and front-of-house consistency.
- **Head / VP of Guest Experience:** Owns net promoter score (NPS), guest recovery loops, and digital order satisfaction.
- **VP of People / Talent:** Manages hourly crew recruiting friction and high driver turnover.

### Key Buying Signals
- Regional multi-unit store expansion (>15% annual unit growth).
- Executive operational restructuring (e.g., appointment of new COO or VP Operations).
- Public rollout of guest feedback recovery platforms (e.g., Ovation, Thanx).
- Digital pickup/drive-thru lane modernization programs.

---

## 3. Real Curated Operators & Verifiable Proof Matrix

All 5 default operators and decision-makers are real US operators verified via public franchisor filings and leadership disclosures:

| Brand | HQ | Real Units | Decision-Maker | Verified Public Source |
|---|---|---|---|---|
| **Taziki's Mediterranean Cafe** | Birmingham, AL | ~100 | **John Ishmael** (COO) | [Leadership Announcement](https://www.tazikisfranchising.com/updates/introducing-tazikis-new-coo-john-ishmael) |
| **Piada Italian Street Food** | Columbus, OH | 62 | **Lance Juhas** (Co-CEO & COO) | [Locations & Press](https://mypiada.com/newsroom) |
| **Velvet Taco** | Dallas, TX | ~45 | **Chris Schultz** (CEO / Ops Lead) | [Velvet Taco Story](https://www.velvettaco.com/about-us/) |
| **WaBa Grill** | City of Industry, CA | ~190 | **Jonathan Aguirre** (Director of Ops) | [Corporate Leadership](https://www.wabagrill.com/leadership) |
| **Clean Eatz** | Wilmington, NC | 115+ | **Quinn Newhall** (COO) | [Franchise Leadership](https://cleaneatz.com/why-clean-eatz) |

*Note on email addresses:* Prospect corporate emails are marked `"unavailable"` in the public dataset to prevent unverified cold outreach. Draft creation exclusively targets `amaymishra1104@gmail.com`.

---

## 4. The 5-Stage Governed Pipeline

```
┌─────────────────┐     ┌──────────────┐     ┌────────────────┐     ┌──────────────────────┐     ┌─────────────────────┐
│ 1. Company      │ ──> │ 2. Lead      │ ──> │ 3. Grounded    │ ──> │ 4. HUMAN APPROVAL    │ ──> │ 5. Draft-Only       │
│    Search (ICP) │     │    Discovery │     │    Enrichment  │     │    GATE (403 Strict) │     │    Outreach (Gmail) │
└─────────────────┘     └──────────────┘     └────────────────┘     └──────────────────────┘     └─────────────────────┘
```

1. **Company Search:** Filters operators by verified location counts (20–200) and operational signals.
2. **Lead Discovery:** Identifies verified executive leadership overseeing operations and guest experience.
3. **Grounded Enrichment:** Retrieves documented evidence snippets, grades confidence via transparent mathematical rubric, and flags operational challenges without sources as hypotheses (`is_hypothesis: true`).
4. **Human Approval Gate (Strict 403 Server Boundary):** Leads begin in `PENDING`. Direct API calls to generate sequences (`POST /api/sequences`, `PUT /api/sequences`, `POST /api/sequences/regenerate`) or create drafts (`POST /api/drafts`) fail with `HTTP 403 Forbidden` unless the lead has explicit human approval. Approval history logs reviewer identity and notes. Revoking approval immediately hides drafts from output queues.
5. **Draft-Only Outreach:** Generates a 4-email multi-day sequence (Days 1, 4, 8, 13) grounded in OSVI.ai Journey positioning and Domino's India case study proof (`https://www.osvi.ai/case-studies/dominos`), linking every personalization claim to an evidence source ID.

---

## 5. Dental Second ICP Adaptation (Strictly 9 Lines)

```
1. Target ICP: US Dental Service Organizations (DSOs) & regional practice networks (15–150 clinics; e.g. regional group practices).
2. Target Roles: Chief Operating Officer, VP of Clinical Operations, VP/Director of Patient Experience, Director of Practice Operations.
3. Buying Signals: M&A clinic integrations, multi-location front-desk hiring, online booking friction, and hygiene recall leakage.
4. Stage 1 (Search): Queries state dental board registries and DSO directories filtering by 15–150 clinic count instead of restaurant franchisee lists.
5. Stage 2 (Leads): Targets clinical operations and patient experience executives instead of store operations directors.
6. Stage 3 (Enrichment): Detects practice management software (Dentrix/Eaglesoft) via job postings and technographics (not EHR scraping).
7. Stage 4 (Approval): 100% UNCHANGED — Mandatory human review gate, evidence auditing, and duplicate prevention remain identical.
8. Stage 5 (Outreach): 4-email cadence (Days 1, 4, 8, 13) and draft-only queue addressing amaymishra1104@gmail.com remain 100% UNCHANGED.
9. Messaging & Compliance: Shifts to patient intake and recall loops; product requires HIPAA/BAA boundaries (cold email itself has no PHI).
```

---

## 6. Security, Hardening & Zero-Send Safeguards

- **Passcode-Protected Endpoints:** When `OSVI_PASSCODE` is configured, requests to administrative and mutation routes (`/api/approvals`, `/api/settings`, `/api/demo/seed`, `/api/workflows`) require header `x-osvi-passcode` or `Authorization: Bearer <passcode>`.
- **Fail-Closed Webhooks:** `/api/workflows/webhook` requires `N8N_WEBHOOK_SECRET` and fails closed (HTTP 401) if unset or mismatched.
- **Masked Secrets:** `GET /api/settings` masks `llm_api_key`, `search_api_key`, `gmail_client_secret`, `gmail_refresh_token`, and `n8n_webhook_secret`.
- **Atomic Local Persistence & Test DB Isolation:** Local JSON database uses atomic file write routines. Vitest tests configure `OSVI_DB_PATH` to a temporary directory in OS temp and unlink it upon suite completion, ensuring zero pollution of committed seed data.
- **TOCTOU Approval Verification:** Lead approval is re-validated immediately before draft persistence. If an approval is revoked between workflow steps, draft creation aborts with HTTP 403.
- **RFC-Compliant CSV Import Deduplication:** Importer resolves repeated company rows without foreign key errors and dedupes contacts by normalized name + company.

---

## 7. AI Tools Used (Candidate Disclosure)

<!-- 
=============================================================================
CANDIDATE DISCLOSURE PLACEHOLDER
Amay: Please fill in this section honestly with the AI tools you utilized 
during the development of this challenge and the specific tasks they assisted with.
Do NOT leave this blank upon final submission.
=============================================================================
-->

- **AI Tools Used:** `[CANDIDATE TO COMPLETE: e.g. Cursor, Claude 3.5 Sonnet, ChatGPT, Antigravity IDE]`
- **Specific Tasks:**
  - `[CANDIDATE TO COMPLETE: e.g. Brainstorming QSR operational pain points]`
  - `[CANDIDATE TO COMPLETE: e.g. Assisting with Next.js 16 App Router boilerplate]`
  - `[CANDIDATE TO COMPLETE: e.g. Auditing Vitest test coverage and edge cases]`

---

## 8. Verification & Quick Start

### Prerequisites
- Node.js 18+ (tested on Node v20/v22)
- npm 9+

### Clean Install & Validation
```bash
# 1. Install dependencies cleanly
npm ci

# 2. Type-check TypeScript codebase
npx tsc --noEmit

# 3. Execute full Vitest pipeline suite (31 tests)
npm test -- --run

# 4. Launch development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to access the interactive dashboard, Guided Evaluator Demo tour, and Known Limitations Audit modal.
