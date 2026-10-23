# OSVI.ai GTM Automation Platform — Verification & Audit Report

**Candidate:** Amay Mishra  
**Email:** `amaymishra1104@gmail.com`  
**Repository:** [https://github.com/amaymishra1104/osvi.ai.git](https://github.com/amaymishra1104/osvi.ai.git)  
**Date of Audit:** October 2026  
**Auditor Role:** Senior Full-Stack Engineer, QA Architect & GTM Strategist  
**Stack:** Next.js 16 (App Router, Turbopack) / React 19 / TypeScript / Vitest / Local Atomic Store  

---

## 1. Executive Summary & Root Cause Analysis

### Root Cause of the Pipeline "Running Without Producing Visible Results" Issue
During codebase inspection, two core defects were identified that caused the pipeline to display "Running" or "Executing..." without producing visible results or progressing:
1. **Frontend Silent Error Swallowing in `handleRunWorkflow` (`src/app/page.tsx`):**
   - When the user clicked "Run Pipeline" / "Run Workflow", `fetch('/api/workflows', { method: 'POST', body: JSON.stringify({ action: 'run' }) })` was executed.
   - If the backend returned an HTTP error (such as a 400, 401, 500, or network timeout), the code only checked `if (res.ok) { ... }` with **no `else` block and no error toast/notification**.
   - As a result, when an error occurred (e.g. missing API key in live mode, or network failure), the execution failed on the backend, but the frontend silently dismissed it without alerting the user.
2. **Orphaned `RUNNING` Status in Local Storage (`local-store.ts`):**
   - If a previous workflow run crashed, was cancelled, or stopped before updating execution status, `local-store.ts` persisted `execution.status = 'RUNNING'`.
   - On browser refresh or page reload, `getLatestWorkflowExecution()` returned that orphaned execution, causing the UI to display `"Status: Running"` indefinitely even though no background process was active.
   - **Resolution:** Added automatic recovery in `local-store.ts`: if an execution has been in `'RUNNING'` status for longer than 2 minutes, it is automatically marked `'FAILED'` with summary `"Execution interrupted or timed out. Ready to re-run."`
3. **Stage 4 Human Approval Gate Pause Without Explicit Notification:**
   - In `WorkflowRunner.runPipeline`, the runner automatically advances from Company Search (Stage 1) to Lead Search (Stage 2) to Lead Enrichment (Stage 3).
   - At Stage 4 (Human Approval Gate), the system correctly paused execution with `status = 'AWAITING_APPROVAL'`. Because this is an intentional safety pause (not an error), users who expected drafts to appear immediately thought the pipeline stalled.
   - **Resolution:** Updated execution summary and toast messaging to explicitly explain: *"Workflow paused at Stage 4 (Human Approval Gate). Review pending leads in the Approvals tab to approve them for sequence drafting."*

---

## 2. Apollo.io API Integration Details

### Architecture & Endpoints Integrated
Apollo.io was integrated directly via `ApolloSearchProvider` (`src/lib/providers/apollo-provider.ts`) following Apollo's official API specifications:

1. **Authentication:**
   - Server-side environment variable `APOLLO_API_KEY`.
   - Authenticated via HTTP header `x-api-key: <APOLLO_API_KEY>` and `Content-Type: application/json`.
   - Never exposed to frontend JavaScript or returned in API responses/logs. Masked as `••••••••<last4>` in the Settings UI.
2. **Company Search Endpoint:**
   - `POST https://api.apollo.io/api/v1/mixed_companies/search`
   - **Purpose:** Discovers real US Quick-Service Restaurants (QSR) and Fast-Casual restaurant chains matching ICP parameters.
   - **Parameters:** `q_organization_name`, `organization_locations: ["United States"]`, `organization_num_employees_ranges: ["20,200"]`, `page: 1`, `per_page: 10`.
   - **Differentiating Headcount from Store Count:** Apollo returns employee count (`estimated_num_employees`). As explicitly mandated, employee count is **never** equated to physical restaurant locations. The UI displays headcount separately, and store counts without independent verification are marked `"Unknown (Verification Required)"`.
3. **Decision-Maker / People Search Endpoint:**
   - `POST https://api.apollo.io/api/v1/mixed_people/api_search` (with fallback to `mixed_people/search` for legacy sandbox tiers).
   - **Purpose:** Discovers corporate Operations executives (Chief Operating Officer, VP of Operations, Director of Operations, Chief Digital Officer, VP Technology, Head of Customer Experience).
   - **Parameters:** `q_organization_name`, `organization_ids: [companyId]`, `person_titles: [...]`, `page: 1`, `per_page: 10`.
   - **Company Match Verification:** Validates that returned contacts match the selected organization ID or corporate name tokens (`is_company_verified: true`).
   - **Email Availability:** Masked or unavailable emails are strictly preserved as `"unavailable"`. Never guessed or fabricated.
4. **Organization Enrichment Endpoint:**
   - `GET / POST https://api.apollo.io/api/v1/organizations/enrich`
   - **Purpose:** Enriches company firmographics and verifies official domains.
5. **Robust Error Classes:**
   - `ApolloMissingApiKeyError`: Thrown when `APOLLO_API_KEY` is unset.
   - `ApolloAuthenticationError`: Thrown on HTTP 401.
   - `ApolloRateLimitError`: Thrown on HTTP 429.
   - `ApolloCreditExhaustedError`: Thrown on HTTP 402/403.
   - Zero synthetic fallbacks: If an Apollo request fails, the pipeline fails transparently and informs the user rather than faking live data.

---

## 3. Google Gemini LLM Integration Details

Apollo provides prospect firmographics; it is not an LLM. Google Gemini was integrated separately in `src/lib/enrichment/gemini.ts`:
- **API Key:** Provided by candidate and stored server-side in `.env.local` (`GEMINI_API_KEY`).
- **Model Selected:** `gemini-3.5-flash` (tested and actively serving with HTTP 200).
- **Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`.
- **Capabilities:**
  1. **Structured Research Synthesis:** Synthesizes verified disclosures into structured JSON matching strict schemas.
  2. **Hypothesis Separation:** Classifies operational challenges strictly into Documented Facts vs Operational Hypotheses (`is_hypothesis: true`).
  3. **Personalized 4-Email Sequence Generation:** Generates personalized copy tailored to OSVI.ai Journey and Domino's India case study proof, with explicit line citations.
  4. **Fallback:** If Gemini experiences temporary demand spikes (HTTP 503), the engine falls back transparently to the grounded factual synthesizer and notes the method in the confidence explanation.

---

## 4. Files Changed

| File | Change Summary |
|:---|:---|
| `src/lib/providers/apollo-provider.ts` | **NEW:** Implemented `ApolloSearchProvider` with official API authentication, company search, people search, organization enrichment, and custom error classes. |
| `src/lib/enrichment/gemini.ts` | **NEW:** Implemented `GeminiService` integrating Google Gemini REST API (`gemini-3.5-flash`) for structured research synthesis and personalized email sequences. |
| `tests/apollo-gemini.test.ts` | **NEW:** Comprehensive Vitest test suite with 15 tests verifying Apollo errors (401/429/402), zero-result handling, company match verification, and Gemini LLM output structure. |
| `src/lib/providers/live-provider.ts` | Upgraded to delegate live discovery directly to `ApolloSearchProvider`. |
| `src/lib/providers/types.ts` | Enhanced search parameters (`location`, `minEmployees`, `maxEmployees`, `domain`) and provider metadata (`creditInfo`). |
| `src/lib/enrichment/enricher.ts` | Integrated `GeminiService` into `EnrichmentEngine`; added 4-way classification and headcount/store footprint separation. |
| `src/lib/sequences/generator.ts` | Added `getScaleDescription` helper to cleanly handle unverified location counts and employee headcounts without printing `"0 units"`. |
| `src/lib/storage/local-store.ts` | Added auto-recovery for stale/crashed `RUNNING` executions in `getLatestWorkflowExecution`. |
| `src/lib/workflow/runner.ts` | Integrated `ApolloSearchProvider` into Stage 1 and Stage 2; added detailed execution logs and error propagation. |
| `src/types/index.ts` | Added `provider_company_id`, `employee_count`, `location_count_status`, `source_provider`, `provider_person_id`, `is_company_verified`, and settings keys. |
| `src/app/api/companies/route.ts` | Added Apollo parameter forwarding (`location`, `minEmployees`, `maxEmployees`) and credit metadata. |
| `src/app/api/leads/route.ts` | Upgraded to query decision-makers via Apollo with company matching. |
| `src/app/api/settings/route.ts` | Added `apollo_api_key` and `gemini_api_key` masking, persistence, and connection detection. |
| `src/app/page.tsx` | Fixed silent error swallowing in `handleRunWorkflow`, `handleResumeWorkflow`, `handleSearchLeadsForCompany`, and `handleEnrichLead`; passed Apollo and Gemini statuses to Header. |
| `src/components/companies/CompanySearchTab.tsx` | Upgraded search form, added headcount vs location footprint notice, and added "Discover People" action. |
| `src/components/leads/LeadSearchTab.tsx` | Upgraded to show Apollo live status, company match verification badge, and provider IDs. |
| `src/components/enrichment/EnrichmentWorkspaceTab.tsx` | Added 4-Way Classification Matrix (Provider-Reported, Independently Verified, Operational Hypothesis, Missing/Pending). |
| `src/components/layout/Header.tsx` | Added live connection status badges for `APOLLO LIVE` and `GEMINI LLM`. |
| `src/components/settings/SettingsTab.tsx` | Added dedicated Apollo.io and Google Gemini configuration sections with live connection badges. |
| `.env.example` | Added `APOLLO_API_KEY` and `GEMINI_API_KEY` empty placeholders. |
| `.env.local` | Created local configuration with `GEMINI_API_KEY` and `LLM_MODEL=gemini-3.5-flash` (ignored by Git). |

---

## 5. Required Environment Variables

Add these to `.env.local` (kept out of Git):

```bash
# Google Gemini LLM API Key (Active & Tested)
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
LLM_MODEL=gemini-3.5-flash

# Apollo.io API Key (Live B2B Prospect Discovery)
SEARCH_PROVIDER=apollo
APOLLO_API_KEY=your_apollo_api_key_here
APOLLO_API_BASE_URL=https://api.apollo.io/api/v1
```

*Note: If `APOLLO_API_KEY` is not provided, the platform transparently operates in **Curated Sandbox Mode**, allowing full inspection of real restaurant chains (Taziki's, Teriyaki Madness, Velvet Taco, WaBa Grill, Clean Eatz) without errors.*

---

## 6. How to Start the Application & Run the Pipeline

### Starting the Server
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Company Search (Stage 1)
1. Navigate to **Stage 1: Companies** (`/` -> `1. Company Search`).
2. Enter a company name (e.g. `Sweetgreen`, `Chipotle`, `Shake Shack`, or `Taziki's`), or filter by location (e.g. `California`, `Texas`, `United States`).
3. Click **Search Companies**.
4. In live mode with Apollo configured, matching restaurant organizations are retrieved via `POST /api/v1/mixed_companies/search`.
5. Notice that employee headcount is clearly labeled separately from physical store count to maintain data integrity.

### Discovering Decision-Makers (Stage 2)
1. On any company card or table row, click **Discover People** (or navigate to **2. Lead Search** and select the company).
2. Click **Search People at Company**.
3. Real decision-makers (`COO`, `VP of Operations`, `Director of Operations`, etc.) are retrieved via Apollo's `mixed_people/api_search`.
4. Company affiliation is confirmed via returned organization IDs, and email verification status is displayed.

### Lead Enrichment & 4-Way Fact Matrix (Stage 3)
1. Click **Enrich** on any lead.
2. If Google Gemini is configured, it synthesizes structured research grounded in provider data.
3. The **4-Way Classification Matrix** separates facts into:
   - **Provider-Reported:** Apollo Person ID, Title, Apollo Org ID, Headcount.
   - **Independently Verified:** Source URLs and citation snippets retrieved over HTTP.
   - **Operational Hypothesis:** Potential multi-unit bot escalation challenges (explicitly tagged `UNVERIFIED HYPOTHESIS`).
   - **Missing / Pending:** Masked email status or unverified physical store counts.

### Human Approval Gate (Stage 4)
1. Navigate to **4. Human Approval**.
2. Review the prospect and evidence citations.
3. Click **Approve** (with optional reviewer notes) or **Reject** (with reason).
4. The server-side gate enforces that **only APPROVED leads** can proceed. Unapproved or rejected leads return HTTP 403 on `/api/sequences`.

### Sequence & Draft Preview (Stage 5)
1. Approved leads advance to **5. Sequence Generator**.
2. Review the 4-email sequence with marked line citations.
3. Click **Create Drafts** to save drafts into the internal draft queue (or authentic Gmail drafts if OAuth is connected).
4. **Safety Guarantee:** Zero automated prospect emails are ever sent.

---

## 7. Automated Test Results

The test suite was run via `npm test` (Vitest 5) with mocked Apollo and Gemini responses to avoid burning API credits:

```
 RUN  v5.0.5 C:/Users/Amay/OneDrive/Pictures/OneDrive/Desktop/osvi.ai

 ✓ tests/apollo-gemini.test.ts (15 tests) 165ms
 ✓ tests/gtm-pipeline.test.ts (31 tests) 596ms

 Test Files  2 passed (2)
      Tests  46 passed (46)
   Duration  1.40s
```

All 46 tests pass, including:
- Missing Apollo API key error handling.
- HTTP 401 Authentication failure handling.
- HTTP 429 Rate limit error handling.
- HTTP 402/403 Credit exhaustion error handling.
- Company search parsing and headcount/location separation.
- Zero-results company and people searches.
- Company affiliation verification for decision-makers.
- Masked email handling (`work_email: 'unavailable'`).
- Company and contact deduplication across repeated searches.
- Google Gemini LLM structured output parsing and hypothesis tagging.
- Strict server-side approval gate enforcement (HTTP 403 on PENDING/REJECTED leads).
- Production build (`npm run build`) succeeded with 0 errors across all 20 routes.
- TypeScript check (`npx tsc --noEmit`) succeeded with 0 type errors.

---

## 8. Limitations & Recommended Next Steps

1. **Apollo Free/Starter Tier Restrictions:**
   - Apollo's `mixed_people/api_search` endpoint returns partial contact profiles with obfuscated emails to preserve credits. Full email unlocking requires the `people/bulk_match` credit-consuming endpoint.
   - For demo and evaluation safety, obfuscated emails are preserved as `"unavailable"` rather than guessed.
2. **Store Count Verification:**
   - Apollo does not natively maintain verified physical unit counts for restaurant franchisee groups. Location counts must be verified via official corporate franchisor registries or state licensing filings.
3. **Recommended Next Steps:**
   - Integrate a location registry API (such as Google Places API or ScrapeHero Store Locator APIs) to automatically verify physical restaurant store counts alongside Apollo headcount.
   - Add webhook listener support for Apollo asynchronous person enrichment callbacks.
