# EOM Platform — Environmental Obligation Management

> A comprehensive enterprise platform for managing Asset Retirement Obligations (ARO), Environmental Remediation Obligations (ERO), financial reporting, regulatory intelligence, and executive risk scoring — built with React, TypeScript, and Tailwind CSS.

**Live URL**: [eom.lovable.app](https://eom.lovable.app)

---

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Platform Modules](#platform-modules)
  - [Dashboard](#1-dashboard)
  - [Inventory](#2-inventory-module)
  - [ARO Module](#3-aro-module)
  - [ERO Module](#4-ero-module)
  - [Plan Module](#5-plan-module)
  - [Settlement Module](#6-settlement-module)
  - [Assurance Module](#7-assurance-module)
  - [Financial Reporting](#8-financial-reporting)
  - [Regulatory Intelligence](#9-regulatory-intelligence)
  - [Risk Intelligence](#10-risk-intelligence)
  - [Settings](#11-settings)
- [AI Intelligence Engines](#ai-intelligence-engines)
  - [AI Copilot](#ai-copilot)
  - [Obligation Classification Engine](#obligation-classification-engine)
  - [ARO Justification Engine](#aro-justification-engine)
  - [Scenario Simulator Engine](#scenario-simulator-engine)
  - [Variance Intelligence Engine](#variance-intelligence-engine)
  - [Risk Scoring Engine](#risk-scoring-engine)
  - [Regulatory Intelligence Engine](#regulatory-intelligence-engine)
- [Export & Utilities](#export--utilities)
- [Design System](#design-system)
- [Project Structure](#project-structure)
- [Documentation](#documentation)

---

## Overview

The EOM Platform is a **frontend-only** single-page application designed for environmental obligation management professionals, financial controllers, and compliance teams. It simulates a production-grade enterprise tool using realistic mock data and client-side AI engines that generate structured, CFO-grade intelligence.

All data is hardcoded (no backend required). All financial calculations — present value, accretion schedules, Monte Carlo simulations, risk scoring — run entirely in the browser using real formulas and statistical methods.

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | React 18 | Component-based UI |
| Language | TypeScript | Type safety across all modules |
| Build Tool | Vite + SWC | Fast HMR & optimized bundling |
| Styling | Tailwind CSS | Utility-first responsive design |
| Components | shadcn/ui (60+) | Accessible, themed UI primitives |
| Charts | Recharts | Financial data visualizations |
| Routing | React Router v6 | Client-side SPA navigation |
| State | React Query + useState | Server-state caching & local state |
| Markdown | react-markdown | Rendering AI narrative output |
| Toasts | Sonner + Radix Toast | User feedback notifications |

---

## Getting Started

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project
cd eom-platform

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app runs at `http://localhost:8080` with hot module replacement enabled.

---

## Platform Modules

### 1. Dashboard

**Route:** `/` · **File:** `src/pages/Index.tsx`

The executive dashboard provides a high-level overview of the entire environmental obligation portfolio.

**How it's built:**
- Four `StatCard` components display total ARO liability, total ERO liability, active obligation count, and annual accretion expense — all computed from `mock-data.ts` helper functions (`getTotalLiability()`, `getTotalAccretion()`, `getObligationsByStatus()`).
- A **Liability Trend Chart** (Recharts `AreaChart`) plots quarterly liability data from `liabilityTrendData` spanning Q1 2024 – Q1 2026.
- A **10-Year Forecast Chart** (Recharts `BarChart`) visualizes projected ARO and ERO liabilities from `forecastData` (2026–2036).
- The **Executive Risk Score Widget** calls `calculatePortfolioRisk()` from the Risk Scoring Engine on mount and renders the composite score (0–100), exposure volatility, forecast confidence percentage, risk trend (Improving/Stable/Deteriorating), and top risk drivers — all color-coded by severity level.
- A **Recent Activity Feed** renders the latest entries from the `recentActivity` array with timestamps and action descriptions.
- The **AI Copilot FAB** (floating action button) is globally available via `CopilotFAB` component, opening the `CopilotPanel` chat interface.

**How it functions:**
On page load, the dashboard aggregates all mock data arrays, computes summary metrics, and renders interactive charts. The risk score widget provides immediate executive visibility into portfolio health without navigating to the full Risk Intelligence module.

---

### 2. Inventory Module

**Route:** `/inventory` · **File:** `src/pages/Inventory.tsx`

A hierarchical browser for navigating the complete site, facility, asset, and obligation structure.

**How it's built:**
- The **Site/Asset Hierarchy** is rendered as an expandable tree view built from the `sites` array, which contains nested `Facility[]` → `Asset[]` structures. Each node is clickable to reveal detail panels.
- The **Obligation Registry** is a searchable, sortable data table displaying all 13 obligations with columns for ID, name, type (ARO/ERO), site, status, estimated liability, accretion expense, and target settlement date.
- **Site Detail Panels** show contact information (`SiteContact[]`), active permits, GPS coordinates, compliance status, regulatory agency, and inspection dates.
- **Asset Cards** display condition (Good/Fair/Poor/Decommissioned), useful life vs. remaining life, original cost, net book value, and maintenance dates.
- **Environmental Exposure Cards** are rendered from `environmentalExposures`, showing contaminant type, affected media (soil, groundwater, etc.), risk level, cleanup cost estimates, and exceedance counts against regulatory limits.

**How it functions:**
The module flattens and cross-references the hierarchical data model to provide both tree-based navigation and flat table views. Clicking any obligation in the registry opens its full detail panel with linked site, asset, and exposure information.

---

### 3. ARO Module

**Route:** `/aro` · **File:** `src/pages/AROModule.tsx`

Complete Asset Retirement Obligation lifecycle management with AI-powered classification and justification.

**How it's built:**
- Organized into three tabs using shadcn `Tabs` component:
  - **Tracking Tab:** Renders an ARO register table from `aroTrackingEntries` with columns for obligation name, fair value, current liability, accretion expense, cumulative accretion, revision impact, discount rate, and retirement date. Selecting a row generates an interactive **Accretion Schedule Chart** using `generateAccretionSchedule()` which computes year-by-year beginning balance → accretion → ending balance.
  - **Classification Tab:** The `ObligationClassificationTab` component calls the Classification Engine. Users select from 5 simulated documents (`getAvailableDocuments()`), then `classifyDocument()` extracts obligation signals (7 signal types with confidence scores), determines liability type, calculates ARO likelihood, identifies missing attributes, flags risks, checks for duplicates against existing obligations, and recommends next actions.
  - **Justification Tab:** The `AROJustificationTab` component calls the ARO Justification Engine. Users select an ARO obligation and a narrative type (calculation rationale, assumption documentation, change in liability, regulatory disclosure, or full audit package), then `generateNarrative()` streams sections with simulated 400–700ms delays, producing audit-ready markdown documentation with source references and an 8-item audit readiness checklist.

**How it functions:**
The ARO module combines financial tracking with AI-assisted document intake and narrative generation. The accretion schedule uses the real formula: `beginningBalance × discountRate = accretionExpense`, compounded annually from initial recognition to expected settlement. The classification and justification engines produce structured, defensible output suitable for auditor review.

---

### 4. ERO Module

**Route:** `/ero` · **File:** `src/pages/EROModule.tsx`

Environmental Remediation Obligation management with phase tracking and cost estimation.

**How it's built:**
- **ERO Summary Cards** compute totals from `obligations.filter(o => o.type === "ERO")` — total ERO liability, remediation progress (weighted average of `remediationProgress`), and compliance status.
- **ERO Register Table** displays ERO-specific fields: remediation phase (Assessment → Planning → Active Remediation → Monitoring → Closure), contaminant type, estimated cleanup cost, regulatory deadlines, and progress percentage.
- **Remediation Tracker** visualizes the 5-phase remediation lifecycle as a timeline/progress view for each obligation, showing which phase is active and completion percentages.
- **Cost Estimation Tool** provides a form-based interface for estimating remediation costs based on contaminant type, affected area (acreage), and remediation method, using multiplier-based heuristics.

**How it functions:**
The ERO module tracks obligations through their full remediation lifecycle. Each ERO obligation has a `remediationPhase` and `remediationProgress` field that drives the progress visualization. Environmental exposure data from `environmentalExposures` is cross-referenced to show contaminant details, monitoring frequencies, and regulatory limit exceedances.

---

### 5. Plan Module

**Route:** `/plan` · **File:** `src/pages/PlanModule.tsx`

Multi-year forecasting, budget alignment, and Monte Carlo scenario simulation.

**How it's built:**
- **Scenario Comparison** renders three pre-built `ForecastScenario` models side-by-side:
  - *Base Case*: 2.5% inflation, 5% discount rate
  - *High Inflation*: 4% inflation, 5% discount rate
  - *Accelerated Settlement*: Aggressive front-loaded settlement timeline
- **Liability Projections** chart (Recharts) visualizes 10-year ARO/ERO forecasts from `forecastScenarios` yearly data arrays.
- **Budget Alignment** table shows FY2026 budget items from `budgetItems` with planned vs. actual spend, variance amounts, and percentage deviation.
- **Scenario Simulator Tab** (`ScenarioSimulatorTab` component) provides an interactive Monte Carlo simulation interface powered by the Scenario Simulator Engine. Users adjust 7 input parameters via sliders, run 1,000-iteration simulations, and view results as percentile distributions, tornado sensitivity charts, and AI-generated narrative analysis.

**How it functions:**
The Plan module connects historical financial data with forward-looking projections. Budget items are mapped to specific obligations for variance tracking. The Monte Carlo simulator uses Gaussian random walks around user-defined parameters to generate probability distributions, helping executives understand the range of possible liability outcomes and which factors drive the most uncertainty.

---

### 6. Settlement Module

**Route:** `/settlement` · **File:** `src/pages/SettlementModule.tsx`

Active spend management, vendor tracking, and AI-powered variance intelligence.

**How it's built:**
- **Settlement Project Cards** render from `settlementProjects` (4 active projects), each showing budget, spent, committed, remaining amounts, and completion percentage with progress bars.
- **Cost Item Breakdown** tables list individual cost categories (mobilization, excavation, disposal, monitoring, etc.) with budget vs. actual per item.
- **Vendor Payment Management** tracks payments against contract ceilings, showing invoiced amounts, retainage held, and ceiling proximity warnings.
- **Milestone Tracking** displays project milestones with status indicators (complete, in progress, pending).
- **Variance Intelligence Tab** (`VarianceIntelligenceTab` component) calls the Variance Intelligence Engine which runs statistical anomaly detection across all settlement projects. It computes Z-scores for cost variances, classifies severity (Normal/Watch/Warning/Critical), identifies root-cause drivers (8 categories including Vendor Cost Escalation, Scope Expansion, Timeline Delay), generates attribution breakdowns, and produces AI narrative briefings with recalibration suggestions.

**How it functions:**
The Settlement module provides real-time visibility into project-level spend. The variance engine flags anomalies using statistical thresholds (items >15% over budget, vendor invoices >90% of ceiling, spend-to-completion ratios >1.25×). Predictive warnings project budget overruns at completion based on current burn rates. The recalibration engine suggests parameter adjustments (inflation rate, vendor escalation factor, timeline buffer, contingency reserve) based on observed variance patterns.

---

### 7. Assurance Module

**Route:** `/assurance` · **File:** `src/pages/AssuranceModule.tsx`

Audit trail management, internal controls, and disclosure requirement tracking.

**How it's built:**
- **Audit Trail Viewer** renders a chronological log from `auditTrail` (8 entries) with timestamps, action types, user names, affected entities, and change details. Entries are filterable by action type and entity.
- **Internal Controls Dashboard** displays `controlItems` (6 controls) with control category (Financial, Operational, Compliance), assessment status (Effective / Needs Improvement / Deficient), last test date, and responsible party. Status badges are color-coded for quick scanning.
- **Disclosure Requirement Tracker** lists `disclosureItems` (6 items) mapped to accounting standards (ASC 410-20 for ARO, ASC 450-20 for contingencies, SEC Reg S-K for environmental disclosures) with preparation status (Draft/Ready/Review), due dates, and assigned owners.

**How it functions:**
The Assurance module serves as the compliance command center. It aggregates all audit-relevant data — change history, control effectiveness, and disclosure readiness — into a single view for compliance officers and auditors. The internal controls dashboard highlights deficient controls that need remediation, while the disclosure tracker ensures all regulatory filing requirements are met on schedule.

---

### 8. Financial Reporting

**Route:** `/reporting` · **File:** `src/pages/FinancialReporting.tsx`

Liability reporting, rollforward calculations, and financial disclosure preparation.

**How it's built:**
- **Liability Rollforward** computes the standard accounting reconciliation: Beginning Balance + Accretion + Upward Revisions − Downward Revisions − Settlements + New Obligations = Ending Balance. Values are derived from `obligations` and `aroTrackingEntries`.
- **Disclosure Status Dashboard** summarizes the readiness of all `disclosureItems` with completion percentages and upcoming deadlines.
- **Forecast Horizon Tables** show projected liability by year (2026–2036) split by ARO and ERO, using data from `forecastData`.
- **Export Capabilities** provide CSV and PDF download for all tables via `exportToCSV()` and `exportToPDF()` utility functions.

**How it functions:**
The Financial Reporting module formats obligation data into standard financial disclosure formats. The rollforward calculation follows GAAP requirements for ARO (ASC 410-20) and contingency (ASC 450-20) reporting. Export functions generate downloadable CSV files with proper cell escaping and printable PDF reports via HTML table rendering with professional formatting (landscape orientation, headers, confidentiality footer).

---

### 9. Regulatory Intelligence

**Route:** `/regulatory` · **File:** `src/pages/RegulatoryIntelligence.tsx`

Regulatory change monitoring with impact analysis and AI-generated compliance briefings.

**How it's built:**
- **Dashboard Summary** displays KPI cards computed by `getDashboardSummary()`: total regulatory updates, high-impact count, total financial exposure, affected sites, affected AROs, and jurisdiction breakdown.
- **Regulatory Update Feed** renders 6 simulated regulatory changes from the Regulatory Intelligence Engine, each with title, regulatory body, jurisdiction, change type (New Rule/Amendment/Enforcement/Guidance/Proposed Rule), effective date, and confidence score.
- **Impact Analysis Panels** expand each update to show `analyzeRegulatory()` results: impacted sites (geography-based mapping), affected obligations, financial exposure estimates (low/base/high using change-type multipliers), impact score (0–100), and urgency classification (Monitor/Review/Immediate Action).
- **AI Narrative Briefings** are generated by `generateRegulatoryNarrative()` for each update, producing executive summaries, "what changed" descriptions, affected asset lists, financial implications with dollar ranges, and prioritized recommended actions.
- **Predictive Risk Indicators** from `getPredictiveRisks()` display 5 forward-looking regulatory risk signals by geographic region with trend scores (0–100).

**How it functions:**
The Regulatory Intelligence module simulates a regulatory change monitoring service. The engine maps regulatory updates to affected sites using geographic matching (state → site location), then cascades to obligations at those sites. Exposure is estimated using heuristic multipliers by change type (e.g., Enforcement actions apply 5–20% of affected liability as potential exposure, while Guidance applies 1–6%). Impact scoring combines site count, obligation count, exposure magnitude, and confidence to produce a 0–100 composite. Urgency is classified based on score thresholds and days until the effective date.

---

### 10. Risk Intelligence

**Route:** `/risk` · **File:** `src/pages/RiskIntelligence.tsx`

Executive environmental risk scoring with a 5-factor weighted composite model.

**How it's built:**
- **Portfolio Risk Index** is the centerpiece, computed by `calculatePortfolioRisk()` which:
  1. Scores each site across 5 weighted components:
     - **Data Completeness** (20%): Checks for missing cost estimates, discount rates, timelines, regulatory tags, and unclassified obligations.
     - **Cost Escalation** (25%): Measures historical cost growth (initial estimate → current liability) and settlement project overruns.
     - **Regulatory Risk** (20%): Weighted sum of compliance status, deadline proximity, and high/critical exposure counts.
     - **Timeline Uncertainty** (20%): Flags long-tail obligations (>10 years) and discount rate sensitivity.
     - **Settlement Variance** (15%): Counts budget overruns and calculates variance percentages.
  2. Computes liability-weighted portfolio average across all sites.
  3. Calculates exposure volatility (standard deviation of site scores × 2.5).
  4. Derives forecast confidence (100 − volatility×0.4 − dataRisk×0.3).
  5. Determines portfolio trend by majority vote of site trends.
- **Site Heatmap** shows per-site risk scores with color-coded severity (Low 0–30 green, Moderate 31–60 yellow, High 61–80 orange, Critical 81–100 red).
- **Risk Distribution Chart** (Recharts `BarChart`) visualizes component score breakdown.
- **Risk Composition Radar** shows the 5-dimension risk profile.
- **Trend History** (Recharts `AreaChart`) plots simulated quarterly risk scores.
- **AI Risk Narrative** is generated by `generateRiskNarrative()` with 5 sections: executive summary, top drivers, exposure volatility analysis, trend analysis, and recommended actions.
- **Scenario Adjustment Sliders** allow users to simulate inflation/discount rate changes and see real-time risk score impact via `calculateScenarioAdjustedRisk()` (1% inflation ≈ +8 points, 1% discount change ≈ ±5 points).

**How it functions:**
The Risk Intelligence module provides a defensible, explainable risk score that executives can use for board reporting. Every component score has clearly defined drivers and calculation logic. The trend detection compares current vs. historical factor values to classify the portfolio trajectory. The scenario adjustment feature enables "what-if" analysis to understand how macroeconomic changes would affect the risk profile.

---

### 11. Settings

**Route:** `/settings` · **File:** `src/pages/SettingsPage.tsx`

Platform configuration for financial assumptions and site hierarchy management.

**How it's built:**
- **Financial Assumptions Card** provides input fields for default discount rate (%), inflation assumption (%), and reporting currency (USD/EUR/GBP/CAD) using shadcn `Input`, `Select`, and `Label` components with local `useState` state management.
- **Site Hierarchy Card** is a placeholder for future site/facility template management.
- Save action triggers a `sonner` toast notification confirming settings persistence.

**How it functions:**
Settings are currently stored in component-level state (no persistence). The page demonstrates the configuration interface that would connect to a backend settings store in a production environment.

---

## AI Intelligence Engines

All engines are **deterministic, client-side simulations** using pattern matching, statistical analysis, and template-based narrative generation. They produce structured, CFO-grade output from mock data.

### AI Copilot

**File:** `src/lib/copilot-engine.ts` (455 lines)

A context-aware conversational assistant accessible from every page via the floating action button. It detects user intent through 15+ regex-based keyword patterns, determines the current page context via `getContextForRoute()`, aggregates relevant data from mock arrays, and generates structured markdown responses following an executive format (Executive Summary → Key Drivers → Financial Impact → Risk Implication → Recommended Action). Responses are streamed word-by-word with 15–40ms delays to simulate real-time AI generation.

### Obligation Classification Engine

**File:** `src/lib/obligation-classification-engine.ts` (321 lines)

Simulates AI-powered document analysis for obligation intake. The engine processes 5 pre-authored document profiles through a 9-step pipeline: signal extraction (7 signal types with confidence scoring), liability type classification, ARO likelihood assessment, field auto-suggestion, missing attribute detection, completeness scoring, risk flagging, duplicate detection against existing obligations, and action recommendation generation.

### ARO Justification Engine

**File:** `src/lib/aro-justification-engine.ts` (436 lines)

Generates audit-ready ARO documentation supporting ASC 410/450 compliance. Produces 5 narrative types (calculation rationale, assumption documentation, change in liability, regulatory disclosure, full audit package) as streaming markdown sections with source references and automated data traceability. Each narrative includes an 8-item audit readiness checklist with status indicators (complete/warning/missing).

### Scenario Simulator Engine

**File:** `src/lib/scenario-simulator-engine.ts` (498 lines)

Monte Carlo simulation engine running 1,000 iterations with Gaussian random walks across 7 adjustable parameters (inflation, discount rate, escalation, timeline, regulatory factor, probability, scope). Outputs percentile distributions (P5–P95), sensitivity rankings, tornado chart data, 20-bucket frequency distributions, and AI narrative analysis. Includes 5 stress test presets and a reverse-solve function that determines what parameter value would produce a target liability change.

### Variance Intelligence Engine

**File:** `src/lib/variance-intelligence-engine.ts` (673 lines)

Statistical anomaly detection for settlement cost variances. Computes Z-scores across settlement projects, classifies severity using statistical thresholds, identifies root causes from 8 driver categories, generates attribution breakdowns, predicts budget overruns from burn rates, and produces AI narrative briefings. Portfolio-level analysis runs 500 Monte Carlo iterations for forecast confidence estimation. Includes a recalibration suggestion engine that recommends parameter adjustments based on observed patterns.

### Risk Scoring Engine

**File:** `src/lib/risk-scoring-engine.ts` (519 lines)

5-factor weighted composite risk scoring model producing explainable, defensible scores at both site and portfolio levels. Computes data completeness, cost escalation, regulatory risk, timeline uncertainty, and settlement variance components with customizable weights. Generates exposure volatility metrics, forecast confidence indices, trend classifications, peer benchmarks, and 5-section AI risk narratives. Supports scenario-adjusted scoring for inflation/discount rate sensitivity analysis.

### Regulatory Intelligence Engine

**File:** `src/lib/regulatory-intelligence-engine.ts` (518 lines)

Regulatory change monitoring with geographic impact mapping. Processes 6 simulated regulatory updates through a pipeline of site matching (state → site geography), obligation cascading, exposure estimation (change-type-specific multipliers), impact scoring (0–100 composite), urgency classification, and AI narrative generation. Includes predictive risk indicators by geographic region.

---

## Export & Utilities

### CSV Export (`exportToCSV`)
Generates downloadable CSV files with proper cell escaping (commas, quotes, newlines) via Blob URL download.

### PDF Export (`exportToPDF`)
Opens a browser print dialog with a professionally formatted HTML table — landscape orientation, styled headers, date subtitles, and confidentiality footers.

### Utility: `cn()`
Combines `clsx` and `tailwind-merge` for conditional, conflict-free Tailwind class composition used across all components.

---

## Design System

The platform uses a **semantic token architecture** with all colors defined as HSL CSS custom properties in `index.css`:

- **Layout tokens:** `--background`, `--foreground`, `--border`, `--input`, `--ring`
- **Semantic tokens:** `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive` (each with `-foreground` variant)
- **Component tokens:** `--card`, `--popover` (each with `-foreground`)
- **Sidebar tokens:** `--sidebar-background`, `--sidebar-primary`, `--sidebar-accent`, etc.

Both light and dark modes are fully supported. Risk severity is communicated through a consistent color mapping: Low (green), Moderate (yellow), High (orange), Critical (red).

---

## Project Structure

```
src/
├── components/          # Shared UI components
│   ├── AppLayout.tsx    # Shell: sidebar + header + outlet
│   ├── AppSidebar.tsx   # Collapsible navigation sidebar
│   ├── CopilotFAB.tsx   # Floating AI assistant button
│   ├── CopilotPanel.tsx # Chat panel interface
│   ├── StatCard.tsx     # Reusable metric card
│   └── ui/              # 60+ shadcn/ui primitives
├── pages/               # 12 route page components
├── lib/                 # 7 AI engines + utilities
├── data/                # Mock data (877 lines)
└── hooks/               # Custom React hooks
```

---

## Documentation

- **[API.md](./API.md)** — Complete API reference for all engines, data models, types, and function signatures with usage examples
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — System architecture with visual diagrams covering all layers, data flows, and engine pipelines

---

*EOM Platform v1.0 — February 2026*
