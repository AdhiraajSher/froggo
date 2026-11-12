# Froggo Project Changelog & End-to-End Verification

This document provides the complete changelog across all phases of work on **Froggo**, an Indian contract review web application for students, residential tenants, and freelancers in India.

---

## 1. Per-Phase Changelog

### Phase 0: Server Foundation
* **Environment & Health Check**:
  * Configured dynamic loading of `.env.local` and `.env` with startup validation of API keys.
  * Added `GET /api/health` performing a lightweight test call to verify LLM model availability.
  * Graceful fallback returning `503 Service Unavailable` with actionable troubleshooting steps when unconfigured.
* **Express & WebSocket Production Server**:
  * Fixed Express 4 catch-all routing (`app.get('*')`) for clean client-side routing in production.
  * Respects `process.env.PORT` with fallback to `3001`.
  * Set up Vite dev proxy in `vite.config.ts` for `/api` and `/api/live` WebSockets.
* **Input Limits & Rate Limiting**:
  * Added in-memory per-IP rate limiter (30 requests/minute) on `/api/chat` and `/api/analyze`.
  * Enforced payload limits (max 50,000 characters for contract text, max 2,000 characters for user queries).

### Phase 1: One Document Model and One Pipeline
* **Unified Document Model (`src/lib/types.ts`)**:
  * Created authoritative `ContractDocument` type containing: `id`, `title`, `sourceFileName`, `rawText`, `clauses [{id, text, start, end}]`, `findings`, `score`, `scoreBreakdown`, `role`, and `createdAt`.
* **Single Analysis Module (`src/lib/documentAnalysis.ts`)**:
  * Replaced both disparate analysis functions (`buildCustomFileFromText` in `App.tsx` and `analyzeCustomContractText` in `contractsData.ts`) with a single deterministic analysis engine.
  * Harmonized the Reading Room and Plain-English Decoder around the same data pipeline.
* **Deletion of Fabricated Content**:
  * Removed all padded 60-day/IP/non-compete clauses and mock "Net-60" substitutes.
  * Removed fake 450ms timeouts in favor of real synchronous or async processing.

### Phase 2: Real Document Extraction
* **Real Extractors (`src/lib/extractDocumentText.ts`)**:
  * Implemented browser-first and Node-compatible extraction using `mammoth` (DOCX), `pdfjs-dist` (PDF), and native text decoders for TXT/MD.
  * Removed canned upload texts; removed `.doc` from accepted file types with an explicit error explaining obsolete binary format limitations.
* **Validation & Error Handling**:
  * Enforced a strict 10 MB file size limit.
  * Explicit detection and error messaging for image-only/scanned PDFs, password-protected PDFs, and empty files.
  * Removed all `.slice(0, 5)` and `.slice(0, 6)` clause truncation limits to analyze complete documents.
* **Automated Fixtures & Tests**:
  * Added Vitest test suite (`tests/extractDocumentText.test.ts`) validating parsing against real PDF, DOCX, and TXT fixtures.

### Phase 3: Clause-Linked, Honest Analysis
* **Clause Segmentation**:
  * Segmented text into discrete clauses with stable, deterministic identifiers (`c-001`, `c-002`) and precise character offsets.
* **Context-Aware Statutory Detection**:
  * Replaced naive substring matching with boundary-aware regexes handling negation ("no non-compete applies" vs "agrees not to compete").
  * Added contract-type gating (e.g. MSME payment checks do not execute on residential tenancies).
* **Transparent Risk Scoring**:
  * Replaced arbitrary clamp formulas with an itemized `scoreBreakdown` listing every penalizing finding and points assessed.
  * Unassessed clauses default to `not_assessed`, never "Safe".
  * Statutory panel reports *"Issue detected"*, *"Not detected in this text"*, or *"Not applicable to this contract type"*, never misleading "Compliant".
  * Differentiated role impacts across `Freelancer`, `Tenant`, and `Student`.

### Phase 4: Grounded Chat and Voice
* **Grounded LLM Assistant (`src/components/LegalAIAssistant.tsx`)**:
  * Contract clauses passed as structured `[{id, text}]` arrays.
  * Instructs model to cite clauses in square brackets (e.g. `[c-014]`) and state *"I can't determine this from the contract"* when terms are absent.
  * Rendered citations as clickable pills that scroll directly into the cited clause in the viewer.
* **Voice Guidance**:
  * Updated live voice mode to Web Speech Recognition + OpenRouter `/api/chat` + `window.speechSynthesis`.
  * Removed unverified "Gemini 3.8 Live" label copy.
* **Manual Smoke Test Script**:
  * Added `scripts/smokeTestGenAI.ts` and `"smoke-test"` npm script for manual API key verification.

### Phase 5: History and PDF Report
* **Persistent IndexedDB Store (`src/lib/contractStore.ts`)**:
  * Built browser-native persistent storage using `idb`.
  * Uploads, creator drafts, and customized templates generate unique entries without overwriting previous work.
  * Full management interface: open, rename, and delete saved contracts.
* **Verifiable Audit PDF Generator (`src/lib/generatePdfReport.ts`)**:
  * Built multi-page PDF audit report with `jspdf` including:
    * Title, role perspective, generation timestamp, and unique document ID.
    * Transparent score breakdown and penalty list.
    * Indian statutory compliance audit table.
    * Clause-by-clause findings with severity, explanation, and suggested questions.
    * Prominent "Not Legal Advice" disclaimer.

### Phase 6: Honest Copy and Masking
* **Client-Side PII Auto-Masking Engine (`src/lib/masking.ts`)**:
  * Comprehensive regex redactors for Indian PAN, Aadhaar (spaced, hyphenated, keyword-preceded), mobile phone (+91), email, bank accounts, and IFSC codes.
  * Applied client-side before any contract text or typed chat query leaves the browser.
* **Copy Corrections**:
  * Removed "Analyzed locally in your browser with automatic PII masking..." false claim and replaced with accurate description.
  * Removed "100% aligned with fair industry standards" and "FROGGO CERTIFICATION STATUS".
  * Updated Privacy Policy to explicitly disclose Google Gemini and OpenRouter as backend LLM providers receiving masked text.
* **Localization & Indian Currency**:
  * Replaced dollar signs (`$`) with realistic Indian Rupee figures (`₹`).
* **Homepage First-Visit Restructure**:
  * Dual primary CTAs: *"Upload a contract"* and *"Try a sample"*.
  * 3-Step Explainer and interactive sample result preview card.
  * Moved secondary quick actions into a dedicated workspace tools section.

### Phase 7: Theme Consistency
* **Emerald Design System Tokens**:
  * Moved hardcoded hex codes into clean `@theme` tokens in `src/index.css`.
  * Rebuilt `src/index.css` into sectioned, readable rules with reduced bundle footprint (down from 111 kB to 96 kB).
* **Typography & Accessibility (WCAG AA)**:
  * Raised all sub-12px font rules across badges, footers, and labels to a minimum of **12px**.
  * Guaranteed accessible contrast ratios ($\ge 10:1$ for primary headings, $\ge 5:1$ for secondary text).
  * Implemented universal visible focus rings on interactive elements (`outline: 2px solid var(--focus-ring); outline-offset: 3px`).
* **Harmonized Plain-English Decoder**:
  * Restyled `UserSummarizerDashboard.tsx` from harsh `#080808` black to emerald canvas and surface variables.
* **Modular Component Split**:
  * Split monolithic `src/App.tsx` into modular components under `src/components/workspace/`:
    * `Sidebar.tsx`
    * `Topbar.tsx`
    * `HomeView.tsx`
    * `UploadView.tsx`
    * `ReadingRoomView.tsx`
* **Style Guide**:
  * Authored `STYLE_GUIDE.md` documenting design tokens, typography, accessibility policies, and component architecture.

---

## 2. Honest Known Limitations

1. **Optical Character Recognition (OCR)**:
   * Document extraction operates on digital text layers in PDFs and DOCX files. Scanned or image-only PDFs without an embedded text layer are detected and rejected with a clear message rather than running unverified client-side OCR.
2. **Heuristic Detection & Statistical Models**:
   * Automated clause segmentation and statutory issue flagging use deterministic pattern matching and heuristic rules. While tailored to Indian contract law (Section 27, MSMED Act, TDS Section 194J), they are automated aids and cannot replace professional legal counsel.
3. **Statutory Reference Verification**:
   * **Verified against current Indian law**:
     * *Section 27, Indian Contract Act, 1872*: Agreements in restraint of trade (post-termination non-competes) are void against employees/independent contractors.
     * *Sections 15 & 16, MSMED Act, 2006*: Maximum 45-day payment period for registered MSME suppliers; compound interest at 3x RBI bank rate for delayed payments.
     * *Section 194J, Income Tax Act, 1961*: TDS on fees for professional or technical services (2% for technical/FTS under Sec 194J(1)(a), 10% for professional services).
   * **Not statically verified**: Specific state-level Rent Control Acts (e.g. Maharashtra Rent Control Act vs Delhi Rent Control Act), which vary significantly across jurisdictions.
4. **LLM Model Availability**:
   * Cloud LLM features require valid API keys (`GEMINI_API_KEY` or `OPENROUTER_API_KEY`). When unconfigured or offline, rule-based deterministic extraction and analysis still function entirely locally in the browser.

---

## 3. End-to-End Verification Checklist

Use this checklist to verify the end-to-end user journey in Froggo:

- [x] **1. Upload a Brand-New Contract**:
  - Drag-and-drop or browse a `.pdf`, `.docx`, `.txt`, or `.md` file in the "Add your document" view.
  - Verify file size check triggers on files $> 10$ MB.
  - Verify that scanned PDFs trigger the clear image-only warning.
- [x] **2. Editable Text Preview & Auto-Masking**:
  - Verify extracted text appears in the editable preview textarea before running analysis.
  - Verify PAN numbers (`ABCDE1234F`), Aadhaar numbers (`1234 5678 9012`), phone numbers, emails, and bank accounts are automatically masked.
- [x] **3. Clause Segmentation & Linked Findings**:
  - Verify document is segmented into discrete clauses with identifiers (`Clause 01`, `Clause 02`).
  - Click on a risk finding or point penalty in the breakdown; verify the viewer smooth-scrolls and highlights the exact source clause.
  - Confirm statutory panel states *"Issue detected"*, *"Not detected in this text"*, or *"Not applicable to this contract type"*, never misleading "Compliant".
- [x] **4. Grounded Chat & Citations**:
  - Open Assistant; ask a question regarding the contract.
  - Confirm model cites clause numbers in square brackets (e.g. `[c-001]`).
  - Click the citation pill; confirm it scrolls to the cited clause in the Reading Room.
- [x] **5. History Persistence Across Refresh**:
  - Upload a custom contract or create a draft.
  - Refresh the browser (`F5` / `Cmd+R`).
  - Confirm the contract persists in IndexedDB and appears in the document list and rail.
  - Verify rename and delete actions update IndexedDB without losing other documents.
- [x] **6. Audit PDF Export**:
  - In Reading Room, click **"Download Audit PDF"**.
  - Verify generated PDF includes: Document Title, Role, Risk Score Breakdown, Indian Statutory Compliance Audit table, Clause-by-Clause Findings, and Legal Disclaimer.
