# EOM Platform — Architecture Documentation

> **Environmental Obligation Management Platform**
> A client-side enterprise application for managing Asset Retirement Obligations (ARO), Environmental Remediation Obligations (ERO), financial reporting, regulatory intelligence, and executive risk scoring.

---

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Technology Stack](#technology-stack)
3. [Application Layer Diagram](#application-layer-diagram)
4. [Routing & Navigation](#routing--navigation)
5. [Data Model](#data-model)
6. [AI Engine Architecture](#ai-engine-architecture)
7. [Module Breakdown](#module-breakdown)
8. [Component Hierarchy](#component-hierarchy)
9. [Data Flow](#data-flow)
10. [Design System](#design-system)
11. [File Structure](#file-structure)

---

## High-Level Architecture

The EOM Platform is a **frontend-only** single-page application. All data is mock/hardcoded and all calculations — including present value, accretion, Monte Carlo simulation, and risk scoring — run entirely client-side.

```
┌─────────────────────────────────────────────────────────┐
│                      Browser                            │
│  ┌───────────────────────────────────────────────────┐  │
│  │               React 18 + Vite SPA                 │  │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────────────┐ │  │
│  │  │  Pages   │  │   UI     │  │   AI Engines     │ │  │
│  │  │ (Routes) │──│Components│──│ (Client-side)    │ │  │
│  │  └─────────┘  └──────────┘  └──────────────────┘ │  │
│  │       │              │               │            │  │
│  │       └──────────────┴───────────────┘            │  │
│  │                      │                            │  │
│  │              ┌───────────────┐                    │  │
│  │              │   Mock Data   │                    │  │
│  │              │  (In-Memory)  │                    │  │
│  │              └───────────────┘                    │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | React 18 | Component-based UI |
| Build Tool | Vite + SWC | Fast HMR & bundling |
| Styling | Tailwind CSS + shadcn/ui | Utility-first design system |
| Charts | Recharts | Financial data visualizations |
| Routing | React Router v6 | Client-side navigation |
| State | React Query + useState | Server-state & local state |
| Language | TypeScript | Type safety |
| Animation | Tailwind Animate | Transitions & keyframes |

---

## Application Layer Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐   │
│  │Dashboard │ │Inventory │ │ARO/ERO   │ │Financial Rpt  │   │
│  │  Index   │ │  Module  │ │ Modules  │ │   Module      │   │
│  └──────────┘ └──────────┘ └──────────┘ └───────────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐   │
│  │Settlement│ │Assurance │ │Regulatory│ │Risk           │   │
│  │  Module  │ │  Module  │ │  Intel   │ │Intelligence   │   │
│  └──────────┘ └──────────┘ └──────────┘ └───────────────┘   │
├──────────────────────────────────────────────────────────────┤
│                     INTELLIGENCE LAYER                       │
│  ┌───────────────┐ ┌────────────────┐ ┌──────────────────┐   │
│  │Copilot Engine │ │Risk Scoring    │ │Scenario Simulator│   │
│  │(NLP Patterns) │ │(5-Factor Model)│ │(Monte Carlo)     │   │
│  └───────────────┘ └────────────────┘ └──────────────────┘   │
│  ┌───────────────┐ ┌────────────────┐ ┌──────────────────┐   │
│  │Classification │ │ARO Justifcation│ │Variance Intel    │   │
│  │(Doc Signals)  │ │(Narratives)    │ │(Anomaly Detect)  │   │
│  └───────────────┘ └────────────────┘ └──────────────────┘   │
│  ┌───────────────┐                                           │
│  │Regulatory     │                                           │
│  │Monitor Engine │                                           │
│  └───────────────┘                                           │
├──────────────────────────────────────────────────────────────┤
│                       DATA LAYER                             │
│  ┌───────────────────────────────────────────────────────┐   │
│  │  mock-data.ts — Sites, Assets, Obligations, Budgets,  │   │
│  │  Settlements, Exposures, Forecasts, Audit Trail       │   │
│  │  + Financial Utilities (PV, Accretion, Formatting)    │   │
│  └───────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

---

## Routing & Navigation

All routes are wrapped in `<AppLayout>` which provides the collapsible sidebar and top header bar.

| Route | Page Component | Module |
|-------|---------------|--------|
| `/` | `Index` | Dashboard |
| `/inventory` | `Inventory` | Obligation Registry |
| `/aro` | `AROModule` | Asset Retirement Obligations |
| `/ero` | `EROModule` | Environmental Remediation |
| `/plan` | `PlanModule` | Forecast & Planning |
| `/settlement` | `SettlementModule` | Spend Management |
| `/assurance` | `AssuranceModule` | Audit & Compliance |
| `/reporting` | `FinancialReporting` | Financial Disclosures |
| `/regulatory` | `RegulatoryIntelligence` | Regulatory Change Monitor |
| `/risk` | `RiskIntelligence` | Executive Risk Scoring |
| `/settings` | `SettingsPage` | Configuration |
| `*` | `NotFound` | 404 Fallback |

### Navigation Flow

```
         ┌──────────────────────────────┐
         │        BrowserRouter         │
         └──────────┬───────────────────┘
                    │
         ┌──────────▼───────────────────┐
         │        AppLayout             │
         │  ┌────────┐ ┌────────────┐   │
         │  │Sidebar │ │  <Outlet/> │   │
         │  │ (Nav)  │ │  (Pages)   │   │
         │  └────────┘ └────────────┘   │
         │         ┌────────────┐       │
         │         │CopilotFAB  │       │
         │         └────────────┘       │
         └──────────────────────────────┘
```

---

## Data Model

### Core Entity Relationships

```
Site (1)
 └── Facility (N)
      └── Asset (N)
           └── Obligation (N)  ← ARO or ERO
                ├── EnvironmentalExposure (N)
                ├── AROTrackingEntry (1)
                ├── BudgetItem (N)
                ├── SettlementProject (N)
                │    ├── CostItem (N)
                │    └── VendorPayment (N)
                ├── ForecastScenario (N)
                ├── AuditTrailEntry (N)
                ├── ControlItem (N)
                └── DisclosureItem (N)
```

### Key Interfaces

| Interface | Location | Purpose |
|-----------|----------|---------|
| `Site` | mock-data.ts | Physical location with contacts, permits, coordinates |
| `Facility` | mock-data.ts | Facility within a site, contains assets |
| `Asset` | mock-data.ts | Physical asset with cost, condition, lifecycle data |
| `Obligation` | mock-data.ts | ARO or ERO record with financial calculations |
| `EnvironmentalExposure` | mock-data.ts | Contaminant data, risk levels, monitoring |
| `AROTrackingEntry` | mock-data.ts | ARO-specific accretion and settlement tracking |
| `SettlementProject` | mock-data.ts | Active spend/settlement with cost items and payments |
| `ForecastScenario` | mock-data.ts | Base, optimistic, pessimistic liability projections |
| `BudgetItem` | mock-data.ts | Planned vs. actual budget line items |
| `AuditTrailEntry` | mock-data.ts | Change log for compliance tracking |
| `ControlItem` | mock-data.ts | Internal control assessments |
| `DisclosureItem` | mock-data.ts | Financial disclosure line items (ASC 410/450) |

### Financial Utility Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `calculatePresentValue` | `(future, rate, years) → number` | Discounts future cash flow to present value |
| `generateAccretionSchedule` | `(initial, rate, years) → AccretionYear[]` | Year-by-year liability buildup table |
| `getTotalLiability` | `() → number` | Sum of all obligation current liabilities |
| `getTotalAccretion` | `() → number` | Sum of all accretion expenses |
| `getObligationsByStatus` | `(status) → Obligation[]` | Filter obligations by status |
| `formatCurrency` | `(n) → string` | Format as `$1,234,567` |
| `formatCurrencyK` | `(n) → string` | Format as `$1,234.6K` |

---

## AI Engine Architecture

All AI engines are **deterministic, client-side simulations** that generate structured, CFO-grade output from mock data using pattern matching, statistical analysis, and template-based narrative generation.

### Engine Overview

```
┌────────────────────────────────────────────────────────────┐
│                    AI ENGINE LAYER                          │
│                                                            │
│  ┌─────────────────┐     ┌──────────────────────────────┐  │
│  │  Copilot Engine  │     │  Risk Scoring Engine         │  │
│  │  - NLP patterns  │     │  - 5-factor weighted model   │  │
│  │  - Intent match  │     │  - Score 0–100               │  │
│  │  - Context-aware │     │  - Trend detection           │  │
│  │    responses     │     │  - Peer benchmarking         │  │
│  └─────────────────┘     └──────────────────────────────┘  │
│                                                            │
│  ┌─────────────────┐     ┌──────────────────────────────┐  │
│  │  Scenario Sim   │     │  Variance Intelligence       │  │
│  │  - Monte Carlo  │     │  - Statistical anomaly       │  │
│  │  - 1000 iters   │     │  - Z-score thresholds        │  │
│  │  - Sensitivity  │     │  - Root-cause classification  │  │
│  │  - Tornado chart│     │  - Attribution breakdown     │  │
│  └─────────────────┘     └──────────────────────────────┘  │
│                                                            │
│  ┌─────────────────┐     ┌──────────────────────────────┐  │
│  │  Classification │     │  ARO Justification           │  │
│  │  - Signal types │     │  - Narrative templates       │  │
│  │  - Confidence   │     │  - Audit-ready packages      │  │
│  │  - Doc parsing  │     │  - ASC 410 disclosure        │  │
│  └─────────────────┘     └──────────────────────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Regulatory Intelligence Engine                     │   │
│  │  - Geography-based obligation mapping               │   │
│  │  - Impact scoring & urgency classification          │   │
│  │  - Site exposure estimation                         │   │
│  │  - AI narrative for compliance briefings            │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

### 1. Copilot Engine (`copilot-engine.ts`)

**Purpose:** Context-aware conversational assistant that generates executive-level financial intelligence.

```
User Input (Natural Language)
        │
        ▼
┌───────────────────┐
│  Intent Detection  │  ← Keyword/pattern matching
│  (Regex Patterns)  │
└────────┬──────────┘
         │
    ┌────▼────┐
    │ Context │  ← portfolio / site / project / aro
    │  Level  │
    └────┬────┘
         │
    ┌────▼──────────────┐
    │ Response Generator │  ← Template + live mock data
    │ (Markdown Output)  │
    └───────────────────┘
```

- **Views:** `portfolio`, `site`, `project`, `aro`
- **Intents:** liability summaries, accretion details, forecast scenarios, compliance status, risk exposure
- **Output:** Structured markdown with tables, bullet points, and financial figures

### 2. Risk Scoring Engine (`risk-scoring-engine.ts`)

**Purpose:** 5-factor weighted composite risk score with explainability and trend detection.

```
┌──────────────────────────────────────────────┐
│            Risk Scoring Pipeline              │
│                                              │
│  ┌──────────────┐  Weight                    │
│  │ Data Quality  │  0.15  ──┐                │
│  ├──────────────┤          │                │
│  │ Cost Exposure │  0.30  ──┤                │
│  ├──────────────┤          ├── Weighted ──▶ Composite
│  │ Regulatory   │  0.20  ──┤    Sum        Score
│  ├──────────────┤          │              (0–100)
│  │ Timeline     │  0.15  ──┤                │
│  ├──────────────┤          │                │
│  │ Settlement   │  0.20  ──┘                │
│  └──────────────┘                           │
│                                              │
│  Score → Level:                              │
│    0–30  Low                                 │
│   31–55  Moderate                            │
│   56–75  High                                │
│   76–100 Critical                            │
└──────────────────────────────────────────────┘
```

- **Outputs:** `RiskComponentScore[]`, composite score, `RiskLevel`, `RiskTrend`, top drivers, peer benchmark, narrative
- **Trend Detection:** Compares current vs. historical factor values to determine Improving / Stable / Deteriorating

### 3. Scenario Simulator Engine (`scenario-simulator-engine.ts`)

**Purpose:** Monte Carlo simulation with sensitivity analysis for liability forecasting.

```
┌─────────────────────────────────────────┐
│          Simulation Inputs               │
│  - Inflation delta (+/- %)               │
│  - Discount rate delta                   │
│  - Escalation factor                     │
│  - Timeline shift (years)                │
│  - Regulatory factor                     │
│  - Probability adjustment                │
│  - Scope expansion (0–100%)              │
└──────────────┬──────────────────────────┘
               │
      ┌────────▼────────┐
      │  Monte Carlo     │
      │  1,000 Iterations│
      │  (Random Walks)  │
      └────────┬────────┘
               │
      ┌────────▼────────────────────────┐
      │  Statistical Analysis            │
      │  - Mean, Median, P5, P25,        │
      │    P75, P95 percentiles          │
      │  - Distribution histogram        │
      └────────┬────────────────────────┘
               │
      ┌────────▼────────────────────────┐
      │  Sensitivity Analysis            │
      │  - Tornado chart factors         │
      │  - Per-factor impact ranking     │
      └────────┬────────────────────────┘
               │
      ┌────────▼────────────────────────┐
      │  AI Narrative Generation         │
      │  - Executive summary             │
      │  - Key findings                  │
      │  - Recommendations               │
      └────────────────────────────────┘
```

### 4. Variance Intelligence Engine (`variance-intelligence-engine.ts`)

**Purpose:** Statistical anomaly detection and root-cause attribution for settlement cost variances.

```
Settlement Projects
        │
        ▼
┌──────────────────────┐
│ Variance Calculation  │  actual vs. budget
│ Z-Score Computation   │
└──────────┬───────────┘
           │
    ┌──────▼──────────────────┐
    │ Severity Classification  │
    │  Normal  │ Z│ < 1.0     │
    │  Watch   │ Z│ < 1.5     │
    │  Warning │ Z│ < 2.0     │
    │  Critical│ Z│ >= 2.0    │
    └──────────┬──────────────┘
               │
    ┌──────────▼──────────────┐
    │ Root-Cause Drivers       │
    │  - Vendor Cost Escalation│
    │  - Scope Expansion       │
    │  - Timeline Delay        │
    │  - Inflation Escalation  │
    │  - Regulatory Shift      │
    │  - Estimation Error      │
    └──────────┬──────────────┘
               │
    ┌──────────▼──────────────┐
    │ Attribution Breakdown    │
    │  % contribution per      │
    │  driver category         │
    └──────────┬──────────────┘
               │
    ┌──────────▼──────────────┐
    │ AI Narrative             │
    │  Executive briefing text │
    └─────────────────────────┘
```

### 5. Obligation Classification Engine (`obligation-classification-engine.ts`)

**Purpose:** Simulated document analysis — extracts obligation signals from text and classifies liability type.

```
Document Text Input
        │
        ▼
┌────────────────────────┐
│  Signal Extraction      │
│  - Legal Obligation     │
│  - Regulatory Citation  │
│  - Remediation Req.     │
│  - Monitoring Mandate   │
│  - Decommissioning      │
│  - Cleanup Trigger      │
│  - Compliance Deadline  │
└──────────┬─────────────┘
           │
    ┌──────▼──────────────┐
    │ Confidence Scoring   │  0–100 per signal
    └──────────┬──────────┘
               │
    ┌──────────▼──────────┐
    │ Liability Type       │
    │  - ARO               │
    │  - Environmental     │
    │    Remediation       │
    │  - Compliance        │
    │  - Contingent        │
    └─────────────────────┘
```

### 6. ARO Justification Engine (`aro-justification-engine.ts`)

**Purpose:** Generates audit-ready, ASC 410-compliant narrative documentation for ARO records.

```
┌────────────────────────────────────────────────┐
│           Narrative Types                       │
│                                                │
│  calculation_rationale                         │
│    └── PV formula, discount rate, timeline     │
│                                                │
│  assumption_documentation                      │
│    └── Key assumptions with rationale          │
│                                                │
│  change_in_liability                           │
│    └── Revision impact, accretion walkthrough  │
│                                                │
│  regulatory_disclosure                         │
│    └── ASC 410 / ASC 450 formatted text        │
│                                                │
│  full_audit_package                            │
│    └── All sections combined into one document │
└────────────────────────────────────────────────┘
```

- **Output:** `NarrativeSection[]` — each with `id`, `title`, `content` (markdown), `citations`

### 7. Regulatory Intelligence Engine (`regulatory-intelligence-engine.ts`)

**Purpose:** Monitors regulatory changes and maps geographic/jurisdictional impacts to obligations and sites.

```
Regulatory Updates (Mock Feed)
        │
        ▼
┌────────────────────────────┐
│ Geographic Mapping          │
│  State → Sites → Obligations│
└──────────┬─────────────────┘
           │
    ┌──────▼──────────────────┐
    │ Impact Scoring           │
    │  - Financial exposure    │
    │  - Obligation count      │
    │  - Compliance gap        │
    └──────────┬──────────────┘
               │
    ┌──────────▼──────────────┐
    │ Urgency Classification   │
    │  - Monitor               │
    │  - Review                │
    │  - Immediate Action      │
    └──────────┬──────────────┘
               │
    ┌──────────▼──────────────┐
    │ AI Compliance Briefing   │
    │  Executive narrative     │
    └─────────────────────────┘
```

---

## Module Breakdown

### Dashboard (`Index.tsx`)
- **Summary stat cards** — total ARO/ERO liabilities, accretion, obligation count
- **Liability trend chart** — Recharts line chart over time
- **Obligations by status** — donut/pie chart
- **Executive Risk Score** — composite 5-factor risk widget
- **Recent activity feed** — audit trail entries
- **AI Copilot panel** — floating assistant (CopilotFAB)

### Inventory (`Inventory.tsx`)
- **Site/Asset tree hierarchy** — expandable tree view
- **Obligation registry** — searchable, filterable data table
- **Detail panel** — full obligation information on click

### ARO Module (`AROModule.tsx`)
- **ARO summary cards** — total liability, accretion, revisions
- **ARO register table** — sortable/filterable
- **Liability calculator** — interactive PV calculation tool
- **Accretion schedule** — year-by-year buildup chart
- **AI Justification tab** — `AROJustificationTab` component
- **Classification tab** — `ObligationClassificationTab` component

### ERO Module (`EROModule.tsx`)
- **ERO summary cards** — liability, remediation progress
- **ERO register** — with remediation phase and regulatory deadlines
- **Remediation tracker** — timeline/progress visualization
- **Cost estimation tool** — contaminant-based estimation

### Plan Module (`PlanModule.tsx`)
- **Forecast scenarios** — base, optimistic, pessimistic
- **Budget tracking** — planned vs. actual spend
- **Scenario simulator** — `ScenarioSimulatorTab` component (Monte Carlo)

### Settlement Module (`SettlementModule.tsx`)
- **Settlement projects** — active spend tracking
- **Cost items & vendor payments** — detailed breakdown
- **Variance intelligence** — `VarianceIntelligenceTab` component

### Assurance Module (`AssuranceModule.tsx`)
- **Audit trail** — chronological change log
- **Control items** — internal control assessments
- **Compliance dashboard** — status overview

### Financial Reporting (`FinancialReporting.tsx`)
- **Liability overview** — combined ARO + ERO dashboard
- **Disclosure tables** — ASC 410 / ASC 450 formatted output
- **Forecast projections** — 5/10/20 year horizon charts

### Regulatory Intelligence (`RegulatoryIntelligence.tsx`)
- **Regulatory feed** — latest changes and updates
- **Impact dashboard** — geographic heat map
- **Compliance briefings** — AI-generated narratives

### Risk Intelligence (`RiskIntelligence.tsx`)
- **Executive risk score** — composite dashboard
- **Factor breakdown** — 5 components with drivers
- **Trend analysis** — improving/stable/deteriorating
- **Peer benchmarking** — industry comparison

---

## Component Hierarchy

```
App
├── QueryClientProvider
│   └── TooltipProvider
│       └── BrowserRouter
│           └── Routes
│               ├── AppLayout
│               │   ├── AppSidebar (collapsible nav)
│               │   ├── Header (SidebarTrigger + title)
│               │   ├── <Outlet /> (page content)
│               │   └── CopilotFAB
│               │       └── CopilotPanel (chat UI)
│               └── NotFound (404)
├── Toaster (shadcn toast)
└── Sonner (sonner toast)
```

### Shared Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `StatCard` | components/ | Reusable metric card with icon, value, delta |
| `NavLink` | components/ | Active-state-aware navigation link |
| `CopilotFAB` | components/ | Floating action button for AI assistant |
| `CopilotPanel` | components/ | Conversational chat interface |
| `AROJustificationTab` | components/ | ARO narrative generation UI |
| `ObligationClassificationTab` | components/ | Document classification UI |
| `ScenarioSimulatorTab` | components/ | Monte Carlo simulation UI |
| `VarianceIntelligenceTab` | components/ | Settlement variance analysis UI |

---

## Data Flow

```
┌──────────────┐     import      ┌──────────────┐
│  mock-data   │ ◀──────────────│   Pages /    │
│    .ts       │                 │  Components  │
└──────┬───────┘                 └──────┬───────┘
       │                                │
       │  export arrays,                │  call engine
       │  helpers, types                │  functions
       │                                │
       ▼                                ▼
┌──────────────┐     import      ┌──────────────┐
│  Utility     │ ◀──────────────│  AI Engines  │
│  Functions   │                 │  (7 engines) │
│  (PV, fmt)   │                 └──────────────┘
└──────────────┘                        │
                                        │
                                        ▼
                                 ┌──────────────┐
                                 │   Rendered   │
                                 │   Output     │
                                 │ (Charts,     │
                                 │  Tables,     │
                                 │  Narratives) │
                                 └──────────────┘
```

### Export Pipeline

```
Table Data ──▶ exportToCSV() ──▶ .csv download
Table Data ──▶ exportToPDF() ──▶ Print dialog (HTML table)
```

---

## Design System

### Token Architecture

All colors use HSL values defined as CSS custom properties in `index.css`, referenced through Tailwind classes. No hard-coded color values in components.

```
:root (Light Mode)
├── --background / --foreground
├── --card / --card-foreground
├── --primary / --primary-foreground
├── --secondary / --secondary-foreground
├── --muted / --muted-foreground
├── --accent / --accent-foreground
├── --destructive / --destructive-foreground
├── --border / --input / --ring
└── --sidebar-* (sidebar-specific tokens)

.dark (Dark Mode)
└── All tokens overridden for dark theme
```

### Layout Principles

- **Desktop-first** — data-dense tables and dashboards
- **Collapsible sidebar** — icon-only or full-width navigation
- **Card-based layouts** — consistent spacing and elevation
- **Responsive grids** — `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` patterns

---

## File Structure

```
src/
├── App.tsx                          # Root router
├── main.tsx                         # Vite entry point
├── index.css                        # Design tokens & global styles
│
├── components/
│   ├── AppLayout.tsx                # Shell: sidebar + header + outlet
│   ├── AppSidebar.tsx               # Navigation sidebar
│   ├── NavLink.tsx                  # Active-aware link
│   ├── StatCard.tsx                 # Reusable metric card
│   ├── CopilotFAB.tsx              # Floating AI button
│   ├── CopilotPanel.tsx            # Chat panel UI
│   ├── AROJustificationTab.tsx     # ARO narrative UI
│   ├── ObligationClassificationTab.tsx # Doc classification UI
│   ├── ScenarioSimulatorTab.tsx    # Monte Carlo UI
│   ├── VarianceIntelligenceTab.tsx # Variance analysis UI
│   └── ui/                         # shadcn/ui primitives (40+ components)
│
├── pages/
│   ├── Index.tsx                    # Dashboard
│   ├── Inventory.tsx                # Obligation registry
│   ├── AROModule.tsx                # Asset Retirement
│   ├── EROModule.tsx                # Environmental Remediation
│   ├── PlanModule.tsx               # Forecast & Planning
│   ├── SettlementModule.tsx         # Spend Management
│   ├── AssuranceModule.tsx          # Audit & Compliance
│   ├── FinancialReporting.tsx       # Financial Disclosures
│   ├── RegulatoryIntelligence.tsx   # Regulatory Monitor
│   ├── RiskIntelligence.tsx         # Executive Risk
│   ├── SettingsPage.tsx             # Configuration
│   └── NotFound.tsx                 # 404
│
├── lib/
│   ├── utils.ts                     # cn() helper
│   ├── export-utils.ts              # CSV / PDF export
│   ├── copilot-engine.ts            # AI Copilot (455 lines)
│   ├── risk-scoring-engine.ts       # Risk Scoring (519 lines)
│   ├── scenario-simulator-engine.ts # Monte Carlo (498 lines)
│   ├── variance-intelligence-engine.ts # Variance (673 lines)
│   ├── obligation-classification-engine.ts # Classification (321 lines)
│   ├── aro-justification-engine.ts  # ARO Narratives (436 lines)
│   └── regulatory-intelligence-engine.ts # Regulatory (518 lines)
│
├── data/
│   └── mock-data.ts                 # All mock data + utilities (877 lines)
│
└── hooks/
    ├── use-mobile.tsx               # Mobile breakpoint hook
    └── use-toast.ts                 # Toast hook
```

---

*Last updated: 2026-02-27*
