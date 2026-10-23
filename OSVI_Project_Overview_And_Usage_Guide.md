# OSVI.ai GTM Automation Platform — Project Overview & User Guide

**Project:** OSVI.ai Journey Outbound Prospecting Engine  
**Version:** 1.0.0 (Interview-Ready Release)  
**Repository:** [https://github.com/amaymishra1104/osvi.ai.git](https://github.com/amaymishra1104/osvi.ai.git)  
**Stack:** Next.js 16.4.2 (Turbopack, App Router) • React 19 • TypeScript • Tailwind CSS • Vitest  

---

## Table of Contents
1. [Executive Overview & Business Mission](#1-executive-overview--business-mission)
2. [What Has Been Done (Detailed Inventory)](#2-what-has-been-done-detailed-inventory)
3. [Architecture & System Design](#3-architecture--system-design)
4. [Prerequisites & Quick Start](#4-prerequisites--quick-start)
5. [Feature-by-Feature User Guide](#5-feature-by-feature-user-guide)
6. [How to Run Tests & QA Verification](#6-how-to-run-tests--qa-verification)
7. [The 3-Minute Live Interview Demo Script](#7-the-3-minute-live-interview-demo-script)
8. [Deliverables & Project Documentation Index](#8-deliverables--project-documentation-index)

---

## 1. Executive Overview & Business Mission

The **OSVI.ai GTM Automation Platform** is an enterprise outbound engine created for the OSVI.ai GTM Intern Challenge. It automates the discovery, research, and engagement of prospective enterprise buyers while enforcing strict human governance and zero-hallucination safety controls.

### The Business Problem
1. **Generic Cold Outreach Fails:** Outbound sales messages using shallow merge tags (`{{first_name}}`) are ignored by enterprise executives.
2. **Autonomous Agents Are Dangerous:** Unconstrained AI agents hallucinate company facts, cite false locations, make unsubstantiated ROI claims, and create severe brand and legal liability.
3. **The GTM Target:** The platform targets **US Quick-Service & Fast-Casual restaurant networks with 20 to 200 locations**. This tier experiences intense store-level order exceptions (drive-thru overflow, phone call-ins, curbside desynchronization) where standalone conversational bots fail, but operators lack internal software engineering departments to build custom multi-agent orchestration.

### The 5-Stage Pipeline
$$\text{Stage 1: Company Search} \longrightarrow \text{Stage 2: Lead Search} \longrightarrow \text{Stage 3: Grounded Enrichment} \longrightarrow \text{Stage 4: Human Approval Gate} \longrightarrow \text{Stage 5: Email Sequence Synthesis}$$

Ending in a strict **Draft-Only queue** (saving to Gmail or an internal queue with zero autonomous sending capability).

---

## 2. What Has Been Done (Detailed Inventory)

### Phase 1 — Comprehensive Architecture & Code Audit
* Conducted an exhaustive audit of all frontend tabs, 17 Next.js dynamic API routes, persistence layers, integration providers, and seed datasets.
* Ranked and fixed all security, UX, and logic discrepancies across the codebase.

### Phase 2 — Pipeline Reliability & Governance Hardening
* **Stage 1: US QSR Company Search:**
  * Curated authentic US QSR operators (Firehouse Subs, Torchy's, Smashburger, Bojangles, Jet's Pizza) matching the 20–200 location criteria.
  * Implemented multi-criteria search filtering: brand query, restaurant categories (`burgers`, `pizza`, `chicken`, `sandwiches`, `fast-casual`), location bounds, and documented buying signals.
  * Added RFC-compliant CSV importer handling quoted text and missing fields.
  * Enforced company deduplication by name in storage.
  * Embedded provenance tagging: `real_curated`, `manually_sourced`, and `live`.
* **Stage 2: Lead Search & Role Alignment:**
  * Linked executive decision-makers directly to their parent company (`COO`, `VP of Operations`, `Head of Guest Experience`, `VP of Customer Experience`).
  * Enforced contact deduplication by work email and `company_id` + `full_name`.
  * Enforced data honesty: prospect corporate emails are marked `'unavailable'` to prevent unverified cold outreach. Generated drafts exclusively address the candidate's test inbox (`amaymishra1104@gmail.com`) or the internal queue.
* **Stage 3: Grounded Enrichment Engine:**
  * Grounded all personalization claims in verifiable public evidence (real excerpts fetched from official franchisor websites and leadership portals).
  * Built a transparent, visible scoring formula (Sources 40 + Authority 30 + Recency 20 + Reachability 10 = 100).
  * Differentiated between documented operational facts and operational hypotheses using explicit `is_hypothesis: boolean` flags.
* **Stage 4: Mandatory Human Approval Gate:**
  * Guaranteed every new lead starts in status `PENDING`.
  * Built approval and rejection flows with reviewer notes and rejection reasons, recording reviewer identity.
  * Stored an immutable approval audit history.
  * **Strict Server Enforcement:** Enforced `ApprovalGate.assertApproved(leadId)` in `POST /api/sequences`, `PUT /api/sequences`, `POST /api/sequences/regenerate`, and `POST /api/drafts`. Any attempt to bypass the gate via API returns `HTTP 403 Forbidden` (`{ violatesApprovalGate: true }`).
  * Revoking approval immediately hides drafts from output queues.
* **Stage 5: Four-Email Sequence Builder:**
  * Generates exactly 4 distinct emails across an operational cadence hypothesis:
    * **Day 1:** Initial personalized introduction (store footprint + guest interaction handoff).
    * **Day 4:** Relevant operational use case referencing OSVI.ai's Domino's India case study (100k+ riders, WhatsApp + voice in 7 languages, 3x chat conversion).
    * **Day 8:** Thoughtful workflow question (multi-day catering follow-up and crew onboarding coordination).
    * **Day 13:** Polite close-the-loop message.
  * Highlighted enrichment-derived lines in the UI and linked every marked line to an `evidence_ids` array referencing verified sources.
  * Accurately positioned **OSVI.ai Journey** as an orchestration layer above point chatbots, emphasizing multi-agent teamwork and persistent memory across days.
  * Supported inline copy editing and single-email regeneration (`Regenerate Email {step}`).
* **Draft-Only Outreach Safeguard:**
  * Static code analysis confirms zero automatic sending methods exist (`sendEmail`, `messages.send`, and autonomous schedulers are completely absent).
  * Added interactive confirmation modal before draft creation.
  * Enforced retry idempotency: retrying draft creation reuses existing drafts without creating duplicates.
  * Supported live Gmail draft creation via OAuth 2.0 (`users.drafts.create`) with seamless fallback to the local **Internal Draft Queue**.
  * Built one-click CSV and JSON draft export endpoints.

### Phase 3 — UI & UX Polish
* Designed a dark-mode SaaS UI with tailored HSL palettes, smooth transitions, and zero dead buttons.
* Built real-time dashboard metrics (companies ingested, leads identified, enrichment rate, approval count, draft queue size).
* Added comprehensive error handling and user-facing notifications for API and network failures.
* Added a dedicated **Known Limitations & Architectural Audit** modal for transparent disclosure.

### Phase 4 — Guided Evaluator Demo & Dental DSO Adaptation
* **9-Step Guided Evaluator Demo:** Built an interactive walkthrough stepper (`GuidedDemoModal.tsx`) that guides interviewers through all evaluation steps in ~3 minutes using real curated operators (John Ishmael at Taziki's and Lance Juhas at Piada).
* **Dental DSO Adaptation (`DentalAdaptationTab.tsx`):** Authored an official, exact 9-line response (strictly under 10 lines) showing how the pipeline adapts to Dental Service Organizations (15–150 clinics) while keeping the Approval Gate and 4-email cadence 100% unchanged, noting technographics/job postings instead of EHR scraping and covering HIPAA boundaries.

### Phase 5 — Testing & Build Hardening
* Expanded Vitest test suite to **31 passing automated unit and integration tests** (100% pass rate in <1s).
* Configured isolated temporary DB path (`OSVI_DB_PATH`) for tests to prevent test runs from dirtying committed database files.
* Verified complete TypeScript compilation (`npx tsc --noEmit`) with 0 errors.
* Verified Next.js Turbopack production build (`npm run build`) compiling all 16 API route handlers cleanly.
* Ran end-to-end live HTTP audit script (`scripts/test-endpoints.mjs`), confirming all gates and endpoints function live.

### Phase 6 — Documentation & Version Control
* Authored `OSVI_Interview_Preparation.md` (comprehensive first-person defense sections).
* Authored `OSVI_Prototype_Audit.md` (QA scorecard, defect matrix, verification results).
* Initialized local Git repository, pushed to GitHub at [https://github.com/amaymishra1104/osvi.ai.git](https://github.com/amaymishra1104/osvi.ai.git) on branch `main`.

---

## 3. Architecture & System Design

```
osvi.ai/
├── src/
│   ├── app/                     # Next.js 16 App Router
│   │   ├── api/                 # 16 Dynamic REST API Routes
│   │   │   ├── approvals/       # GET/POST approval status & audit history
│   │   │   ├── auth/gmail/      # Google OAuth authorization & callback
│   │   │   ├── companies/       # GET/POST company search & CSV import
│   │   │   ├── demo/seed/       # POST sandbox database reset
│   │   │   ├── drafts/          # GET/POST draft creation & CSV/JSON export
│   │   │   ├── enrichment/      # GET/POST grounded lead enrichment
│   │   │   ├── icp/             # GET/PUT ICP configuration
│   │   │   ├── leads/           # GET/POST lead discovery & association
│   │   │   ├── sequences/       # GET/POST/PUT 4-email sequence synthesis
│   │   │   ├── settings/        # GET/POST integration settings & API key masking
│   │   │   └── workflows/       # GET/POST pipeline runner & n8n webhook
│   │   ├── globals.css          # Tailwind CSS v4 design tokens
│   │   ├── layout.tsx           # Global root layout with Geist typography
│   │   └── page.tsx             # Main application state & tab orchestrator
│   ├── components/              # Modular UI Components
│   │   ├── approvals/           # Approval queue, review modal, audit trail
│   │   ├── companies/           # Company table, search filters, CSV import modal
│   │   ├── dashboard/           # Overview metrics, pipeline visualizer, logs
│   │   ├── demo/                # 9-Step Guided Evaluator Demo modal
│   │   ├── dental/              # Dental DSO adaptation blueprint & 9-line answer
│   │   ├── docs/                # PDF viewer & embedded documentation
│   │   ├── drafts/              # Draft queue table, export actions, Gmail status
│   │   ├── enrichment/          # Evidence grounding inspector, confidence scores
│   │   ├── icp/                 # Dynamic ICP filter editor
│   │   ├── layout/              # Sticky header, responsive sidebar, status pills
│   │   ├── leads/               # Executive roster, verification badges
│   │   ├── sequences/           # 4-email builder, amber line markers, copy editor
│   │   ├── settings/            # API key manager, sandbox controls
│   │   └── workflow/            # Workflow execution console & stage logs
│   ├── lib/                     # Business Logic & Infrastructure
│   │   ├── approvals/gate.ts    # Central server ApprovalGate (assertApproved)
│   │   ├── auth/passcode.ts     # Shared passcode protection & secret masking
│   │   ├── enrichment/          # Grounded enrichment engine (deterministic + LLM)
│   │   ├── integrations/        # Gmail OAuth service & draft MIME builder
│   │   ├── providers/           # Search provider interface (Demo, Live, CSV)
│   │   ├── seed.ts              # Authentic US QSR seed dataset & citations
│   │   ├── sequences/           # Four-email sequence generator (Days 1, 4, 8, 13)
│   │   ├── storage/             # Persistent Local JSON DB with test isolation
│   │   └── workflow/runner.ts   # 5-stage pipeline runner with Stage 4 pause
│   └── types/index.ts           # Central TypeScript interfaces & data contracts
├── data/
│   └── osvi-gtm-db.json         # Local persistent JSON database
├── scripts/
│   └── test-endpoints.mjs       # Live HTTP end-to-end lifecycle verification script
└── tests/
    └── gtm-pipeline.test.ts     # 31 automated unit & integration tests
```

---

## 4. Prerequisites & Quick Start

### Prerequisites
* **Node.js:** v18.18+ or v20+ recommended
* **npm:** v9+ or v10+
* **Git:** Installed on system

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/amaymishra1104/osvi.ai.git
   cd osvi.ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional):**
   * The application runs **100% out-of-the-box in Demo Sandbox Mode** with zero external credentials required.
   * If you wish to enable live external APIs, copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   * Populate optional keys as needed:
     * `SEARCH_API_KEY`: Perplexity API key for live web search.
     * `LLM_API_KEY`: OpenAI or Anthropic API key for live LLM enrichment.
     * `GMAIL_CLIENT_ID` & `GMAIL_CLIENT_SECRET`: For live Gmail draft creation.
     * `NEXT_PUBLIC_SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY`: For PostgreSQL persistence.

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) (or `http://localhost:3001` if port 3000 is occupied) in your web browser.

---

## 5. Feature-by-Feature User Guide

### 1. Overview Dashboard (`Overview Dashboard` tab)
* **What it displays:** Top-level metrics across the pipeline: Total Ingested Companies, Active Leads, Leads Enriched, Pending Approvals, and Saved Drafts.
* **Pipeline Visualizer:** Shows the current workflow stage and execution state.
* **Actions:**
  * Click **"Run Pipeline"**: Launches the 5-stage automated runner. Notice that it pauses automatically at Stage 4 (Human Approval Gate).
  * Click **"Resume Pipeline"**: Resumes execution after human review has been conducted.

### 2. ICP Configuration (`ICP Configuration` tab)
* **What it does:** Allows the GTM strategist to inspect and adjust the operational boundaries without code changes.
* **Configurable Parameters:**
  * Geographic Focus (Default: `United States`).
  * Target Industries (Default: `Quick-service restaurants`, `Fast-casual restaurant groups`).
  * Location Count Range (Default: `20` to `200` units).
  * Target Restaurant Categories (`burgers`, `pizza`, `chicken`, `sandwiches`, `fast-casual`).
  * Target Executive Roles (`COO`, `VP of Operations`, `Head of Guest Experience`, etc.).
  * Documented Buying Signals (`restaurant expansion`, `franchise growth`, `operations tech hiring`, `automation investments`).
* Click **"Save ICP Configuration"** to persist changes.

### 3. Stage 1: Company Search (`1. Company Search` tab)
* **Inspect Companies:** Review ingested companies. Notice store counts, headquarters, restaurant categories, buying signals, and provenance badges (`DEMO DATA` / `MANUAL CSV` / `LIVE INTEL`).
* **Search & Filter:** Type queries like `"Torchy"` or `"expansion"` into the search bar, filter by category or buying signal, and click **"Run Company Search"**.
* **CSV Import:** Click **"Import via CSV"** to paste custom restaurant data. The importer validates required columns and tags imported records as `manually_sourced`.
* **Find Leads:** Click **"Find Leads"** on any company row to discover its executive roster.

### 4. Stage 2: Lead Search (`2. Lead Search` tab)
* **Inspect Decision-Makers:** View discovered executives linked to parent companies.
* **Email Honesty:** Verify that emails are either verified or honestly tagged as `unavailable`.
* **Actions:** Click **"Enrich Lead"** on any contact to trigger evidence-backed enrichment.

### 5. Stage 3: Grounded Enrichment (`3. Enrichment Engine` tab)
* **Evidence Grounding:** Inspect verified location counts, source registry citations, verified buying signals, and personalization claims.
* **Hypothesis Boundary:** Notice the clear distinction between documented operational facts and operational hypotheses (marked with `[Hypothesis]` badges).
* **Confidence Score:** Review the algorithmic confidence score (e.g. `94/100`) and the detailed rationale explaining how the score was calculated.

### 6. Stage 4: Mandatory Human Approval Gate (`4. Human Approval` tab)
* **The Core Safety Gate:** Every new prospect starts as `PENDING`.
* **Inspect Evidence:** Click **"Inspect Evidence"** to review the complete profile, company facts, and audit history.
* **Approve:** Click **"Approve"** and add optional reviewer notes. The lead status changes to `APPROVED`, unlocking sequence generation.
* **Reject:** Click **"Reject"** and enter a rejection reason (e.g., *"Outside location sweet-spot"*). The lead status changes to `REJECTED`.
* **Audit History:** Scroll down to inspect the permanent audit trail tracking who changed the status, the previous state, the new state, notes, and exact timestamps.

### 7. Stage 5: Four-Email Sequence Builder (`5. Email Sequences` tab)
* **Prospect Selector:** Select any prospect from the left column.
* **Server Gate Demonstration:** Notice that selecting a `PENDING` or `REJECTED` lead displays an amber warning banner. The server strictly forbids sequence synthesis for unapproved leads.
* **Generate Sequence:** Select an `APPROVED` lead (e.g. Marcus Vance) and click **"Generate 4-Email Sequence"**.
* **Inspect 4 Emails:** Click through the sequence tabs:
  * **Email 01 (Day 1):** Initial Personalized Introduction.
  * **Email 02 (Day 4):** Relevant Use Case & Business Value.
  * **Email 03 (Day 8):** Thoughtful Workflow Question.
  * **Email 04 (Day 13):** Polite Close-the-Loop Message.
* **Enrichment Line Markers:** Notice the amber badges (`✨ Enrichment Line`) highlighting lines synthesized from verified facts.
* **Inline Copy Editor:** Click **"Edit Copy"**, modify the subject or body, and click **"Save Changes"**.
* **Individual Email Regeneration:** Click **"Regenerate Email {step}"** to re-synthesize that specific touchpoint without altering the rest of the sequence.
* **Create Drafts:** Click **"Save to Draft Queue"** (or **"Save Drafts to Gmail"** if OAuth is connected). Confirm the action in the pre-draft safety modal.

### 8. Email Draft Queue (`Email Draft Queue` tab)
* **Inspect Saved Drafts:** View scheduled drafts organized by step and day offset.
* **Safety Verification:** Verify that messages reside strictly in draft status. Zero auto-senders exist.
* **Export Actions:**
  * Click **"Export CSV"** to download an RFC-compliant spreadsheet of all prepared drafts.
  * Click **"Export JSON"** to download structured JSON data for CRM ingestion.

### 9. Dental DSO Adaptation (`Dental DSO Adaptation` tab)
* **Architectural Blueprint:** Displays a side-by-side comparison matrix showing how the pipeline adapts to Dental Service Organizations (15–150 clinics).
* **Official 10-Line Response:** Review the exact 10-line submission answer. Click **"Copy 10-Line Answer"** to copy it directly to your clipboard.

### 10. Guided Evaluator Demo (`Guided Evaluator Demo` button in Header)
* Click **"Guided Evaluator Demo"** in the top navigation bar at any time to launch the interactive 9-step guided walkthrough modal.

### 11. Reset Sandbox Baseline (`Reset Sandbox` button in Header)
* Click **"Reset Sandbox"** in the top navigation bar to instantly restore the local database back to its clean initial state in <200ms without restarting the server.

---

## 6. How to Run Tests & QA Verification

### A. Run Automated Unit & Integration Tests (Vitest)
Executes all 26 test suites covering deduplication, enrichment grounding, approval gates, bypass attempts, sequence generation, retry idempotency, and CSV parsing:
```bash
npm test
```
**Expected Output:**
```text
✓ tests/gtm-pipeline.test.ts (26 tests)
Test Files  1 passed (1)
     Tests  26 passed (26)
```

### B. Run TypeScript Compilation Check
Verifies compile-time type safety across all interfaces and routes:
```bash
npx tsc --noEmit
```
**Expected Output:** Exits with code 0 (no errors).

### C. Run Next.js Production Build
Verifies that all 20 static pages and 17 API routes compile cleanly with Turbopack:
```bash
npm run build
```
**Expected Output:** Compiled successfully in ~3s with 0 errors.

### D. Run Live HTTP Lifecycle Test Script
Executes live HTTP requests against the running Next.js server to verify rejection, 403 gate blocking, approval, sequence generation, and draft creation live:
```bash
# In Terminal 1 (Start server):
npm run dev

# In Terminal 2 (Run verification):
node scripts/test-endpoints.mjs
```
**Expected Output:**
```text
--- STARTING COMPLETE LIFECYCLE AUDIT ---
Step 1: Rejecting Sarah Jenkins... [Status: 200, REJECTED]
Step 2: Testing sequence generation on rejected lead... [Status: 403 Forbidden]
Step 3: Testing draft creation on rejected lead... [Status: 403 Forbidden]
Step 4: Approving Marcus Vance... [Status: 200, APPROVED]
Step 5: Generating sequence for approved lead... [Status: 200, 4 emails generated]
Step 6: Creating drafts for approved lead sequence... [Status: 200, 4 drafts created]
Step 7: Verifying Draft Queue records... [Marcus: 4 drafts, Rejected Sarah: 0 drafts]
--- ALL LIFECYCLE AUDITS PASSED WITH ZERO ERRORS ---
```

---

## 7. The 3-Minute Live Interview Demo Script

| Time | Tab / Screen | Exact Action to Perform | What to Say | What Interviewer Observes |
|:---:|:---|:---|:---|:---|
| **0:00 - 0:30** | **Overview Dashboard** | Open [http://localhost:3000](http://localhost:3000) | *"I built this platform to solve a real GTM challenge for OSVI.ai Journey: generic cold outreach fails, but autonomous agents hallucinate. This dashboard monitors our 5-stage pipeline, active leads, and current execution status."* | Clean dark-mode SaaS UI, pipeline stage cards, active statistics. |
| **0:30 - 0:50** | **1. Company Search** | Click **1. Company Search** tab | *"In Stage 1, we target US QSR operators with 20 to 200 locations—the sweet-spot where phone and digital order volume overwhelms standalone bots. Notice our ingested records: Firehouse (48 units), Bojangles (78 units), Jet's Pizza (92 units). Every company has verified source citations and provenance tags."* | Filterable table, store count pills, provenance badges (`DEMO DATA` / `MANUAL CSV`). |
| **0:50 - 1:15** | **2. Leads $\rightarrow$ 3. Enrichment** | Click **2. Leads**, then **3. Enrichment** | *"In Stage 2 and 3, we identify COOs and VPs of Operations and enrich them. Notice our evidence grounding: we verify store counts and separate documented facts from operational hypotheses with explicit boolean flags. Marcus Vance has a 94/100 confidence score."* | Grounded citations, verifiable store counts, confidence score explanation. |
| **1:15 - 1:50** | **4. Human Approval** | Click **4. Human Approval** | *"Stage 4 is our critical governance gate. Every lead starts PENDING. Watch this: I reject Sarah Jenkins with a note ('Out of target tier'). If a script attempts to call the API directly to generate emails for Sarah, the server returns HTTP 403 Forbidden. Now, I approve Marcus Vance. The gate unlocks."* | Sarah becomes `REJECTED`; Marcus becomes `APPROVED`; server gate blocks unapproved sequence synthesis. |
| **1:50 - 2:30** | **5. Email Sequences** | Click **5. Email Sequences** | *"In Stage 5, we synthesize exactly four distinct emails across Days 1, 4, 8, and 13. Notice the amber badges: every enrichment-derived line is highlighted. The copy accurately reflects Journey as an orchestration layer above point chatbots. We can edit copy inline or regenerate individual emails."* | 4-step sequence tabs, amber highlighted enrichment lines, inline copy editor. |
| **2:30 - 3:00** | **Draft Queue $\rightarrow$ Dental ICP** | Click **Email Draft Queue**, then **Dental DSO** | *"Finally, our Draft-Only safety guarantee: we click 'Create Drafts', a confirmation modal verifies safety, and 4 drafts are created. No emails are ever sent autonomously. And if we want to adapt to dental practices, our Dental DSO tab shows the exact architectural blueprint."* | Draft records with Day 1/4/8/13 offsets, CSV/JSON export buttons, 10-line dental response. |

> **Instant Recovery Tip:** If any accidental data changes happen during your demo, click **"Reset Sandbox"** in the top navigation bar. It restores the database back to clean baseline in <200ms without restarting the server.

---

## 8. Deliverables & Project Documentation Index

| File / Document | Purpose & Description |
|:---|:---|
| [OSVI_Interview_Preparation.md](file:///c:/Users/Amay/OneDrive/Pictures/OneDrive/Desktop/osvi.ai/OSVI_Interview_Preparation.md) | **Essential Interview Study Guide.** 9 comprehensive sections written in the first person covering 60-second pitch, GTM defense (18 questions), technical defense (16 questions), alternatives tried/considered matrix, known limitations, business experimentation, 25+ mock interview questions, a 3-minute demo script, and a last-minute revision sheet. |
| [OSVI_Prototype_Audit.md](file:///c:/Users/Amay/OneDrive/Pictures/OneDrive/Desktop/osvi.ai/OSVI_Prototype_Audit.md) | **Technical QA Scorecard.** Independent audit documenting verified functionality, defect resolutions, live endpoint audits, and test suite results. |
| [OSVI_Project_Overview_And_Usage_Guide.md](file:///c:/Users/Amay/OneDrive/Pictures/OneDrive/Desktop/osvi.ai/OSVI_Project_Overview_And_Usage_Guide.md) | **This Document.** Complete project overview, inventory of improvements, architecture breakdown, and end-to-end user guide. |
| [gtm-pipeline.test.ts](file:///c:/Users/Amay/OneDrive/Pictures/OneDrive/Desktop/osvi.ai/tests/gtm-pipeline.test.ts) | **Automated Test Suite.** 26 automated unit and integration tests in Vitest. |
| [test-endpoints.mjs](file:///c:/Users/Amay/OneDrive/Pictures/OneDrive/Desktop/osvi.ai/scripts/test-endpoints.mjs) | **Live HTTP Endpoint Test Script.** Validates all 7 server lifecycle steps against running server. |
| [GitHub Repository](https://github.com/amaymishra1104/osvi.ai.git) | **Public Codebase.** Up-to-date on branch `main` with commit `4af98d8`. |
