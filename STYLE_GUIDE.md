# Froggo Design System & Style Guide

Welcome to the **Froggo Design System**, the visual and architectural specification powering Froggo — India's legal contract review application for students, residential tenants, and freelancers.

---

## 1. Visual Source of Truth: The Emerald System

The **Emerald Theme** (`.emerald-app`) serves as the single source of truth across all Froggo dashboards, tools, and reading rooms. It replaces arbitrary hardcoded dark backgrounds (e.g. `#080808`) with a unified, soothing, and authoritative emerald palette inspired by archival legal stationery and focused editorial desks.

---

## 2. Design Tokens (`@theme` & CSS Variables)

### 2.1 Theme Colors
Defined in `src/index.css` under the `@theme` block:

| Token Name | Hex Value | Semantic Role |
| :--- | :--- | :--- |
| `--color-emerald-deep` | `#003d2d` | Deep background gradient anchor |
| `--color-emerald-forest` | `#00533e` | Primary container gradient midtone |
| `--color-emerald-primary` | `#005b45` | Primary brand color, primary CTA buttons |
| `--color-emerald-primary-hover` | `#00805e` | Hover state for primary buttons |
| `--color-emerald-accent` | `#237c65` | Highlights, active tab borders, icons |
| `--color-emerald-mint` | `#d2efdf` | Soft tint for badges and selected tags |
| `--color-emerald-teal` | `#00a285` | Accents and focus rings |
| `--color-emerald-border` | `#d9e7df` | Subtle light border |
| `--color-emerald-border-dark`| `#32483c` | Subtle dark border |

### 2.2 Dynamic CSS Variables

#### Light Mode (`:root`)
* `--bg-canvas`: `#f4f8f5` (Calm tinted canvas)
* `--bg-surface`: `#ffffff` (Pure white card surfaces)
* `--bg-elevated`: `#ebf3ee` (Soft elevated panels & secondary controls)
* `--border-subtle`: `#d6e4dc` (Clean architectural borders)
* `--text-primary`: `#1f332c` (Deep forest text, contrast ratio $\ge 11:1$)
* `--text-secondary`: `#52685e` (Muted secondary text, contrast ratio $\ge 5.2:1$)
* `--focus-ring`: `#00805e` (High-visibility keyboard focus outline)

#### Dark Mode (`.dark`)
* `--bg-canvas`: `#111e19` (Deep obsidian-emerald canvas)
* `--bg-surface`: `#1a2d25` (Elevated dark card surface)
* `--bg-elevated`: `#233b31` (Secondary elevated controls)
* `--border-subtle`: `#2f4b3f` (Low-contrast dark border)
* `--text-primary`: `#e8f5ee` (High-contrast pale green text, $\ge 10:1$)
* `--text-secondary`: `#9cb5a8` (Readable muted text, $\ge 4.8:1$)
* `--focus-ring`: `#68cf9e` (Luminous emerald focus outline)

---

## 3. Typography & Accessibility Standards

### 3.1 Minimum Text Size Policy (WCAG AA Compliance)
* **Minimum Font Size**: **12px** across all UI elements without exception.
  * Sub-12px text (`7px`, `8px`, `9px`, `10px`, `11px`) is prohibited.
  * Meta labels, badge text, table headers, and fine print must use at least `12px` (e.g. `text-xs` or `font-size: 12px`).
* **Line Heights**:
  * Body copy: minimum `1.6` for comfortable reading.
  * Verbatim legal clauses: minimum `1.7` (`font-legal`) or `1.8` (`font-legal-serif`).

### 3.2 Font Families
* **Interface & Body**: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif`.
* **Headings**: `Plus Jakarta Sans`, `Inter`, `sans-serif` with tighter tracking (`letter-spacing: -0.03em`).
* **Verbatim Legal Clauses**:
  * Default: `Inter Sans` (`font-legal`).
  * Serif mode: `Merriweather`, `Georgia`, `serif` (`font-legal-serif`).
* **Telemetry & Statutes**: Monospace font (`font-mono`) for clause identifiers (`[c-001]`), PAN/Aadhaar masks, and currency values.

### 3.3 Focus Rings & Keyboard Navigation
Every interactive element (`button`, `a`, `input`, `textarea`, `select`) must render a distinct focus indicator:
```css
button:focus-visible,
a:focus-visible,
input:focus-visible,
textarea:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 3px;
}
```

---

## 4. Component Structure & Architecture

To avoid monolithic components, workspace views are divided into modular units under `src/components/workspace/`:

* **`Sidebar.tsx`**: Persistent workspace navigation, account switch, AI Assistant toggle, and quick add action.
* **`Topbar.tsx`**: Mobile hamburger toggle, workspace breadcrumb, active perspective pill, and theme mode switch.
* **`HomeView.tsx`**:
  * Hero banner with dual primary CTAs: *"Upload a contract"* and *"Try a sample"*.
  * 3-Step Explainer (Add & Mask $\rightarrow$ Indian Law Audit $\rightarrow$ Chat & Audit PDF).
  * Sample result preview card with 1-click Reading Room launcher.
  * Secondary workspace tools and searchable document collection table.
* **`UploadView.tsx`**: Perspective lens picker (`Freelancer` / `Tenant` / `Student`), drag-and-drop file extractor supporting PDF/DOCX/TXT/MD, and editable raw text preview.
* **`ReadingRoomView.tsx`**: 3-column analysis environment:
  1. *Left Column*: Document switcher, role perspective switcher, and Indian statutory status cards.
  2. *Center Column*: Verbatim clause viewer with color-coded risk level borders (`high`, `medium`, `safe`, `not_assessed`).
  3. *Right Column*: Contract score breakdown dial, plain-English executive summary, role impact callout, suggested negotiation questions, and missing statutory protection suggestions.

---

## 5. Statutory Risk & Severity Levels

When displaying clause assessments or statutory checks:

| Severity Level | Border / Color Treatment | Meaning |
| :--- | :--- | :--- |
| **`high`** | Crimson / Red (`border-l-red-500`, `bg-red-50/70`) | Clear statutory conflict (e.g. Sec 27 non-compete restraint, uncapped liability) |
| **`medium`** | Amber (`border-l-amber-500`, `bg-amber-50/70`) | One-sided terms (e.g. Net-60 payment, vague IP assignment, heavy penalty) |
| **`safe`** | Emerald (`border-l-emerald-600`, `bg-emerald-50/60`) | Standard balanced terms that respect role rights and statutory limits |
| **`not_assessed`** | Slate (`border-l-slate-400`, `bg-slate-50/80`) | Clauses not evaluated for specific statutory breaches (never falsely labelled "safe") |

---

## 6. Copy & Editorial Principles

1. **Never Fabricate Legal Verdicts**: Do not display "Compliant" or "Certified Safe" for contracts or clauses that were not comprehensively audited. Use truthful terms like *"Issue detected"*, *"Not detected in this text"*, or *"Not assessed"*.
2. **Indian Legal Grounding**: Reference specific applicable statutes:
   * **Section 27, Indian Contract Act, 1872** (void agreements in restraint of trade).
   * **Sections 15 & 16, MSMED Act, 2006** (45-day maximum payment cap).
   * **Section 194J, Income Tax Act, 1961** (TDS rates for professional and technical services).
3. **Currency & Localization**: Use Indian Rupee formatting (`₹`) with realistic figures rather than generic dollar placeholders.
4. **Transparent Estimates**: Risk score is explicitly labeled as an automated estimate to guide negotiations, never legal counsel.
