# EOM Platform — API & Architecture Documentation

> **Environmental Obligation Management (EOM)** Platform  
> Complete technical reference for all engines, data models, utility functions, and UI modules.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Data Layer — `mock-data.ts`](#data-layer)
4. [Utility Functions](#utility-functions)
5. [Module: Dashboard (Index)](#module-dashboard)
6. [Module: Inventory](#module-inventory)
7. [Module: ARO (Asset Retirement Obligations)](#module-aro)
8. [Module: ERO (Environmental Remediation Obligations)](#module-ero)
9. [Module: Plan (Forecasting & Budget)](#module-plan)
10. [Module: Settlement (Spend Management)](#module-settlement)
11. [Module: Assurance (Audit & Compliance)](#module-assurance)
12. [Module: Financial Reporting](#module-financial-reporting)
13. [Module: Regulatory Intelligence](#module-regulatory-intelligence)
14. [Module: Risk Intelligence](#module-risk-intelligence)
15. [Engine: AI Copilot](#engine-ai-copilot)
16. [Engine: Obligation Classification](#engine-obligation-classification)
17. [Engine: ARO Justification (Narrative Generation)](#engine-aro-justification)
18. [Engine: Scenario Simulator](#engine-scenario-simulator)
19. [Engine: Variance Intelligence](#engine-variance-intelligence)
20. [Engine: Risk Scoring](#engine-risk-scoring)
21. [Engine: Regulatory Intelligence](#engine-regulatory-intelligence-engine)
22. [Export Utilities](#export-utilities)
23. [Routing & Layout](#routing-and-layout)

---

## Architecture Overview

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          BROWSER (SPA)                              │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                   PRESENTATION LAYER                          │  │
│  │                                                               │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │  │
│  │  │Dashboard │ │Inventory │ │ARO / ERO │ │ Financial Rpt    │ │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘ │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │  │
│  │  │Plan      │ │Settlement│ │Assurance │ │ Settings         │ │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘ │  │
│  │  ┌──────────┐ ┌──────────┐                                   │  │
│  │  │Regulatory│ │Risk Intel│                                   │  │
│  │  └──────────┘ └──────────┘                                   │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│  ┌───────────────────────────▼───────────────────────────────────┐  │
│  │                   INTELLIGENCE LAYER                          │  │
│  │                                                               │  │
│  │  ┌───────────────┐  ┌────────────────┐  ┌─────────────────┐  │  │
│  │  │Copilot Engine │  │Risk Scoring    │  │Scenario Sim     │  │  │
│  │  │(NLP Patterns) │  │(5-Factor)      │  │(Monte Carlo)    │  │  │
│  │  └───────────────┘  └────────────────┘  └─────────────────┘  │  │
│  │  ┌───────────────┐  ┌────────────────┐  ┌─────────────────┐  │  │
│  │  │Classification │  │ARO Justifcation│  │Variance Intel   │  │  │
│  │  │(Doc Signals)  │  │(Narratives)    │  │(Anomaly Detect) │  │  │
│  │  └───────────────┘  └────────────────┘  └─────────────────┘  │  │
│  │  ┌───────────────┐                                            │  │
│  │  │Regulatory     │                                            │  │
│  │  │Monitor Engine │                                            │  │
│  │  └───────────────┘                                            │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│  ┌───────────────────────────▼───────────────────────────────────┐  │
│  │                      DATA LAYER                               │  │
│  │  ┌────────────────────────────────────────────────────────┐   │  │
│  │  │  mock-data.ts                                          │   │  │
│  │  │  Sites, Facilities, Assets, Obligations, Exposures,    │   │  │
│  │  │  Budgets, Settlements, Forecasts, Audit Trail,         │   │  │
│  │  │  Controls, Disclosures                                 │   │  │
│  │  │  + PV Calculator, Accretion, Formatting Utilities      │   │  │
│  │  └────────────────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### File Structure

```
src/
├── App.tsx                         # Root router & providers
├── main.tsx                        # React entry point
├── index.css                       # Design tokens & Tailwind theme
├── components/
│   ├── AppLayout.tsx               # Sidebar + Outlet layout shell
│   ├── AppSidebar.tsx              # Navigation sidebar
│   ├── CopilotFAB.tsx             # Floating action button for AI Copilot
│   ├── CopilotPanel.tsx           # AI Copilot chat panel
│   ├── StatCard.tsx               # Reusable KPI stat card
│   ├── NavLink.tsx                # Active-aware nav link
│   ├── ObligationClassificationTab.tsx  # Document classification UI
│   ├── AROJustificationTab.tsx    # ARO narrative generation UI
│   ├── ScenarioSimulatorTab.tsx   # Monte Carlo simulator UI
│   ├── VarianceIntelligenceTab.tsx # Variance analysis UI
│   └── ui/                        # shadcn/ui component library (60+)
├── data/
│   └── mock-data.ts               # All domain data + helper functions
├── lib/
│   ├── utils.ts                   # Tailwind merge utility
│   ├── export-utils.ts            # CSV/PDF export
│   ├── copilot-engine.ts          # AI Copilot response engine
│   ├── obligation-classification-engine.ts  # Document classification
│   ├── aro-justification-engine.ts          # Narrative generation
│   ├── scenario-simulator-engine.ts         # Monte Carlo + sensitivity
│   ├── variance-intelligence-engine.ts      # Anomaly detection & variance
│   ├── risk-scoring-engine.ts               # Portfolio risk scoring
│   └── regulatory-intelligence-engine.ts    # Regulatory change monitor
├── pages/
│   ├── Index.tsx                   # Executive Dashboard
│   ├── Inventory.tsx              # Site/Asset/Obligation browser
│   ├── AROModule.tsx              # ARO management
│   ├── EROModule.tsx              # ERO management
│   ├── PlanModule.tsx             # Forecasting & budgets
│   ├── SettlementModule.tsx       # Spend tracking
│   ├── AssuranceModule.tsx        # Audit & controls
│   ├── FinancialReporting.tsx     # Liability reporting
│   ├── RegulatoryIntelligence.tsx # Regulatory change monitor
│   ├── RiskIntelligence.tsx       # Executive risk scoring
│   ├── SettingsPage.tsx           # Platform settings
│   └── NotFound.tsx               # 404 page
└── hooks/
    ├── use-mobile.tsx             # Responsive breakpoint hook
    └── use-toast.ts               # Toast notification hook
```

The platform follows a **client-side-only architecture** with simulated AI engines. All data is generated from structured mock datasets; all "AI" outputs are deterministic pattern-matched responses with controlled randomization for realism.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Routing | React Router DOM v6 |
| Charts | Recharts |
| State | React Query (QueryClient) |
| Animations | Tailwind CSS Animate |
| Markdown | react-markdown |
| Toasts | Sonner + Radix Toast |

---

## Data Layer

**File**: `src/data/mock-data.ts` (877 lines)

### Entity Relationship Diagram

```
┌─────────────────┐
│      Site        │
│  id, name,       │
│  region, coords  │
│  compliance,     │
│  permits         │
└────────┬────────┘
         │ 1:N
┌────────▼────────┐
│    Facility      │
│  id, name,       │
│  siteId          │
└────────┬────────┘
         │ 1:N
┌────────▼────────┐         ┌──────────────────────┐
│     Asset        │         │ EnvironmentalExposure │
│  id, type,       │         │  contaminant, media,  │
│  condition,      │         │  riskLevel, cost,     │
│  cost, NBV       │         │  exceedances          │
└────────┬────────┘         └──────────┬───────────┘
         │ 1:N                         │ N:1
┌────────▼─────────────────────────────▼──────────┐
│                  Obligation                      │
│  id, type (ARO|ERO), status, initialEstimate,    │
│  currentLiability, discountRate, accretion,      │
│  fairValue, revisionImpact, remediationPhase     │
└───┬────────┬───────────┬────────┬───────────┬───┘
    │        │           │        │           │
    ▼        ▼           ▼        ▼           ▼
┌────────┐ ┌─────────┐ ┌──────┐ ┌─────────┐ ┌──────────┐
│AROTrack│ │Settlement│ │Budget│ │Forecast │ │AuditTrail│
│Entry   │ │Project   │ │Item  │ │Scenario │ │Entry     │
└────────┘ └────┬─────┘ └──────┘ └─────────┘ └──────────┘
                │
       ┌────────┴────────┐
       ▼                 ▼
  ┌─────────┐     ┌────────────┐
  │CostItem │     │VendorPayment│
  └─────────┘     └────────────┘

Additional entities (linked to Obligations):
  ┌────────────┐  ┌───────────────┐
  │ControlItem │  │DisclosureItem │
  └────────────┘  └───────────────┘
```

### Core Types

```typescript
type ObligationType = "ARO" | "ERO";
type ObligationStatus = "Active" | "Under Review" | "Settled" | "Pending";
type RemediationPhase = "Assessment" | "Planning" | "Active Remediation" | "Monitoring" | "Closure";
type AssetCondition = "Good" | "Fair" | "Poor" | "Decommissioned";
type ComplianceStatus = "Compliant" | "Non-Compliant" | "Under Investigation" | "Pending Review";
type ExposureRiskLevel = "Low" | "Medium" | "High" | "Critical";
```

### Data Interfaces

#### `Site`
Represents a physical operating location with regulatory metadata.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier (e.g., `"S001"`) |
| `name` | `string` | Site name |
| `region` | `string` | State/region |
| `address` | `string` | Physical address |
| `latitude` / `longitude` | `number` | GPS coordinates |
| `siteType` | `string` | Operational classification |
| `operatingStatus` | `string` | Current status |
| `complianceStatus` | `ComplianceStatus` | Regulatory compliance state |
| `regulatoryAgency` | `string` | Primary oversight body |
| `permitNumbers` | `string[]` | Active permits |
| `totalAcreage` | `number` | Site size |
| `siteContacts` | `SiteContact[]` | Personnel |
| `facilities` | `Facility[]` | Nested facility hierarchy |

#### `Facility`
Groups assets within a site.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | e.g., `"F001"` |
| `name` | `string` | Facility name |
| `siteId` | `string` | Parent site |
| `assets` | `Asset[]` | Nested assets |

#### `Asset`
Physical infrastructure with depreciation data.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | e.g., `"A001"` |
| `assetType` | `string` | Storage, Pipeline, Well, etc. |
| `condition` | `AssetCondition` | Current condition |
| `usefulLifeYears` | `number` | Total useful life |
| `remainingLifeYears` | `number` | Remaining years |
| `originalCost` | `number` | Acquisition cost |
| `netBookValue` | `number` | Depreciated value |

#### `Obligation`
Central entity linking sites, assets, liabilities, and timelines.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | e.g., `"OBL-001"` |
| `type` | `ObligationType` | ARO or ERO |
| `siteId` / `siteName` | `string` | Parent site |
| `status` | `ObligationStatus` | Lifecycle state |
| `initialEstimate` | `number` | Original cost estimate |
| `currentLiability` | `number` | Current recorded liability |
| `discountRate` | `number` | Credit-adjusted risk-free rate |
| `accretionExpense` | `number` | Annual accretion |
| `targetSettlementDate` | `string` | Expected settlement date |
| `fairValue` | `number` | ARO-specific fair value |
| `revisionImpact` | `number` | ARO-specific revision amount |
| `remediationPhase` | `RemediationPhase` | ERO-specific phase |
| `remediationProgress` | `number` | ERO-specific % complete |

#### `EnvironmentalExposure`
Tracks contamination events with monitoring data.

| Field | Type | Description |
|-------|------|-------------|
| `contaminantType` | `string` | Type of contamination |
| `mediaAffected` | `string[]` | Soil, Groundwater, etc. |
| `riskLevel` | `ExposureRiskLevel` | Risk classification |
| `estimatedCleanupCost` | `number` | Projected cost |
| `exceedanceCount` | `number` | Regulatory exceedances |
| `maxConcentration` | `string` | Measured level |
| `regulatoryLimit` | `string` | Threshold |

#### `AROTrackingEntry`
Derived from ARO obligations; tracks accretion and review cycles.

#### `ForecastScenario`
Multi-year projection with inflation/discount assumptions. Three pre-built scenarios:
- **Base Case**: 2.5% inflation, 5% discount
- **High Inflation**: 4% inflation, 5% discount
- **Accelerated Settlement**: Aggressive settlement timeline

#### `BudgetItem`
FY2026 budget line items mapped to obligations with variance tracking.

#### `SettlementProject`
Active settlement projects with vendor payments, cost items, and milestones.

#### `AuditTrailEntry`
Timestamped log of all system actions.

#### `ControlItem`
Internal control assessments (Effective / Needs Improvement / Deficient).

#### `DisclosureItem`
ASC 410-20 / ASC 450-20 / SEC Reg S-K disclosure requirements.

### Exported Data Arrays

| Export | Type | Count | Description |
|--------|------|-------|-------------|
| `sites` | `Site[]` | 4 | Operating locations |
| `obligations` | `Obligation[]` | 13 | ARO + ERO obligations |
| `environmentalExposures` | `EnvironmentalExposure[]` | 5 | Contamination records |
| `aroTrackingEntries` | `AROTrackingEntry[]` | derived | ARO tracking (computed) |
| `recentActivity` | `ActivityItem[]` | 6 | Dashboard activity feed |
| `liabilityTrendData` | `object[]` | 9 | Quarterly trend Q1'24–Q1'26 |
| `forecastData` | `object[]` | 11 | 2026–2036 projections |
| `forecastScenarios` | `ForecastScenario[]` | 3 | Scenario models |
| `budgetItems` | `BudgetItem[]` | 8 | FY2026 budget items |
| `settlementProjects` | `SettlementProject[]` | 4 | Active projects |
| `auditTrail` | `AuditTrailEntry[]` | 8 | Audit log |
| `controlItems` | `ControlItem[]` | 6 | Internal controls |
| `disclosureItems` | `DisclosureItem[]` | 6 | Disclosure requirements |

### Helper Functions

#### `formatCurrency(value: number): string`
Formats number as USD with no decimal places.
```typescript
formatCurrency(2847000) // → "$2,847,000"
```

#### `formatCurrencyK(value: number): string`
Abbreviated currency formatting.
```typescript
formatCurrencyK(2847000)  // → "$2.8M"
formatCurrencyK(450000)   // → "$450K"
```

#### `calculatePresentValue(futureValue, discountRate, years): number`
Standard PV calculation: `FV / (1 + r)^n`

#### `generateAccretionSchedule(obligation): AccretionRow[]`
Generates year-by-year accretion schedule from inception to settlement.
```typescript
const schedule = generateAccretionSchedule(obligation);
// → [{ year: 2019, beginningBalance, accretion, endingBalance }, ...]
```

#### `getAROObligations(): Obligation[]`
Returns all obligations where `type === "ARO"`.

#### `getEROObligations(): Obligation[]`
Returns all obligations where `type === "ERO"`.

#### `getActiveObligations(): Obligation[]`
Returns obligations where `status === "Active"`.

#### `getTotalLiability(type?: ObligationType): number`
Sum of `currentLiability` across all (or filtered) obligations.

#### `getTotalAccretion(type?: ObligationType): number`
Sum of `accretionExpense` across all (or filtered) obligations.

#### `getObligationsByStatus(): { status, count }[]`
Groups obligations by status with counts.

#### `getAllAssets(): FlattenedAsset[]`
Flattens the Site → Facility → Asset hierarchy into a flat array with parent references.

---

## Utility Functions

### `cn(...inputs: ClassValue[]): string`
**File**: `src/lib/utils.ts`

Combines `clsx` and `tailwind-merge` for conditional Tailwind class composition.
```typescript
cn("px-4 py-2", isActive && "bg-primary", className)
```

---

## Module: Dashboard

**Page**: `src/pages/Index.tsx`  
**Route**: `/`

### Dashboard Layout

```
┌─────────────────────────────────────────────────────────┐
│                    DASHBOARD                             │
│                                                         │
│  ┌────────┐ ┌────────┐ ┌──────────┐ ┌───────────────┐  │
│  │Total   │ │Total   │ │Active    │ │Annual         │  │
│  │ARO     │ │ERO     │ │Obligatns │ │Accretion      │  │
│  │$XX.XM  │ │$XX.XM  │ │   XX     │ │$XX.XK         │  │
│  └────────┘ └────────┘ └──────────┘ └───────────────┘  │
│                                                         │
│  ┌──────────────────────┐  ┌─────────────────────────┐  │
│  │ Liability Trend      │  │ 10-Year Forecast        │  │
│  │ ▁▂▃▅▆▇ (AreaChart)   │  │ ▐▐▐▐▐▐▐ (BarChart)     │  │
│  └──────────────────────┘  └─────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Executive Risk Score                              │   │
│  │  Portfolio Risk Index: XX   Volatility: XX        │   │
│  │  Forecast Confidence: XX%   Trend: Stable         │   │
│  │  Top Drivers: [driver1] [driver2] [driver3]       │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────┐  ┌─────────────────────────┐  │
│  │ Recent Activity      │  │ AI Copilot (FAB)        │  │
│  │ • Change 1           │  │ 💬 Ask anything...      │  │
│  │ • Change 2           │  │                         │  │
│  │ • Change 3           │  │                         │  │
│  └──────────────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

The Risk Score widget calls `calculatePortfolioRisk()` from the Risk Scoring Engine on render and displays color-coded results (Low/Moderate/High/Critical).

---

## Module: Inventory

**Page**: `src/pages/Inventory.tsx`  
**Route**: `/inventory`

### Inventory Hierarchy

```
┌─────────────────────────────────────────────────────┐
│  INVENTORY MODULE                                    │
│                                                     │
│  ┌── Site: Eagle Ford Operations                    │
│  │   ├── Facility: Tank Farm A                      │
│  │   │   ├── Asset: Storage Tank #1                 │
│  │   │   │   └── Obligation: OBL-001 (ARO)          │
│  │   │   └── Asset: Pipeline Section A              │
│  │   │       └── Obligation: OBL-002 (ARO)          │
│  │   └── Facility: Processing Unit                  │
│  │       └── Asset: Compressor Station              │
│  │           └── Obligation: OBL-003 (ERO)          │
│  │                                                  │
│  ├── Site: Permian Basin Complex                    │
│  │   └── ...                                        │
│  │                                                  │
│  ├── Site: Appalachian Gas Field                    │
│  │   └── ...                                        │
│  │                                                  │
│  └── Site: Gulf Coast Terminal                      │
│      └── ...                                        │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ Obligation Registry (filterable table)       │    │
│  │ ID │ Name │ Type │ Site │ Status │ Liability │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

- Site detail panels with contact info, permits, regulatory data
- Asset condition and depreciation tracking
- Environmental exposure cards

---

## Module: ARO

**Page**: `src/pages/AROModule.tsx`  
**Route**: `/aro`

### ARO Module Flow

```
┌──────────────────────────────────────────────────────┐
│  ARO MODULE                                           │
│                                                      │
│  ┌─── Tabs ──────────────────────────────────────┐   │
│  │ [Tracking] [Classification] [Justification]   │   │
│  └───────────────────────────────────────────────┘   │
│                                                      │
│  Tracking Tab:                                       │
│  ┌────────────────────────────────────────────────┐  │
│  │ ARO Register Table                             │  │
│  │ Obligation │ Fair Value │ Accretion │ Retire Dt │  │
│  │ ─────────── ──────────── ─────────── ───────── │  │
│  │ Select → Accretion Schedule Chart              │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  Classification Tab:                                 │
│  ┌────────────────────────────────────────────────┐  │
│  │ Upload Doc → classifyDocument() → Results      │  │
│  │ Signals │ Confidence │ Liability Type │ Flags   │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  Justification Tab:                                  │
│  ┌────────────────────────────────────────────────┐  │
│  │ Select ARO → Select Type → generateNarrative() │  │
│  │ Streaming sections → Audit Checklist           │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

---

## Module: ERO

**Page**: `src/pages/EROModule.tsx`  
**Route**: `/ero`

### ERO Remediation Pipeline

```
┌───────────────────────────────────────────────────┐
│  ERO REMEDIATION LIFECYCLE                         │
│                                                   │
│  Assessment ──▶ Planning ──▶ Active Remediation   │
│      │              │              │               │
│      ▼              ▼              ▼               │
│  Discovery      Cost Est.     Contractor          │
│  Sampling       Permitting    Excavation          │
│  Risk Eval      Scheduling    Treatment           │
│                                    │               │
│                              ┌─────▼─────┐        │
│                              │ Monitoring │        │
│                              │ Sampling   │        │
│                              │ Reporting  │        │
│                              └─────┬─────┘        │
│                                    │               │
│                              ┌─────▼─────┐        │
│                              │  Closure   │        │
│                              │ Final Rpt  │        │
│                              │ Reg Signoff│        │
│                              └───────────┘        │
└───────────────────────────────────────────────────┘
```

- Contaminant type and media tracking
- Progress visualization per obligation
- Regulatory deadline monitoring

---

## Module: Plan

**Page**: `src/pages/PlanModule.tsx`  
**Route**: `/plan`

### Scenario Comparison Model

```
┌────────────────────────────────────────────────────┐
│  FORECAST SCENARIOS                                 │
│                                                    │
│  ┌─────────────────┐                               │
│  │   Base Case      │  2.5% inflation, 5% discount │
│  │   ▁▂▃▄▅▆▇       │  10-year projection           │
│  └─────────────────┘                               │
│  ┌─────────────────┐                               │
│  │  High Inflation  │  4.0% inflation, 5% discount │
│  │   ▁▂▃▅▆▇█       │  Higher cost trajectory       │
│  └─────────────────┘                               │
│  ┌─────────────────┐                               │
│  │  Accelerated     │  Aggressive timeline          │
│  │   ▁▃▅▇▅▃▁       │  Front-loaded spend           │
│  └─────────────────┘                               │
│                                                    │
│  Budget Alignment:                                 │
│  ┌──────────────────────────────────────────────┐  │
│  │ Category │ Planned │ Actual │ Variance │ %   │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  [Scenario Simulator Tab] → Monte Carlo Engine     │
└────────────────────────────────────────────────────┘
```

---

## Module: Settlement

**Page**: `src/pages/SettlementModule.tsx`  
**Route**: `/settlement`

### Settlement Tracking Architecture

```
┌────────────────────────────────────────────────────┐
│  SETTLEMENT MODULE                                  │
│                                                    │
│  Settlement Project                                │
│  ├── Budget: $X.XM                                 │
│  ├── Spent:  $X.XM                                 │
│  ├── Status: Active / Complete                     │
│  │                                                 │
│  ├── Cost Items                                    │
│  │   ├── Mobilization    $XXX,XXX (budget/actual)  │
│  │   ├── Excavation      $XXX,XXX                  │
│  │   ├── Disposal        $XXX,XXX                  │
│  │   └── Monitoring      $XXX,XXX                  │
│  │                                                 │
│  ├── Vendor Payments                               │
│  │   ├── Vendor A  $XXX,XXX / $XXX,XXX ceiling     │
│  │   └── Vendor B  $XXX,XXX / $XXX,XXX ceiling     │
│  │                                                 │
│  └── Milestones                                    │
│      ├── Site Prep          ✓ Complete              │
│      ├── Excavation Phase   ◐ In Progress           │
│      └── Final Closure      ○ Pending               │
│                                                    │
│  [Variance Intelligence Tab] → Anomaly Detection   │
└────────────────────────────────────────────────────┘
```

---

## Module: Assurance

**Page**: `src/pages/AssuranceModule.tsx`  
**Route**: `/assurance`

### Compliance Framework

```
┌────────────────────────────────────────────────────┐
│  ASSURANCE MODULE                                   │
│                                                    │
│  ┌── Audit Trail ──────────────────────────────┐   │
│  │ Timestamp │ Action │ User │ Entity │ Details │   │
│  │ Chronological log of all system changes      │   │
│  └──────────────────────────────────────────────┘   │
│                                                    │
│  ┌── Internal Controls ────────────────────────┐   │
│  │ Control │ Category │ Status      │ Last Test │   │
│  │ ─────── │ ──────── │ ─────────── │ ───────── │   │
│  │ IC-001  │ Financial│ Effective   │ 2025-12   │   │
│  │ IC-002  │ Operat.  │ Needs Impro │ 2025-11   │   │
│  │ IC-003  │ Complian │ Deficient   │ 2025-10   │   │
│  └──────────────────────────────────────────────┘   │
│                                                    │
│  ┌── Disclosure Requirements ──────────────────┐   │
│  │ Standard      │ Requirement │ Status │ Due   │   │
│  │ ASC 410-20    │ ARO Discl.  │ Draft  │ Q1    │   │
│  │ ASC 450-20    │ Contingency │ Ready  │ Q1    │   │
│  │ SEC Reg S-K   │ Env. Discl. │ Review │ Q2    │   │
│  └──────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────┘
```

---

## Module: Financial Reporting

**Page**: `src/pages/FinancialReporting.tsx`  
**Route**: `/reporting`

### Liability Rollforward

```
┌───────────────────────────────────────────────────────┐
│  FINANCIAL REPORTING                                   │
│                                                       │
│  Liability Rollforward:                               │
│                                                       │
│  Beginning Balance          $XX,XXX,XXX               │
│    + Accretion Expense        + $XXX,XXX              │
│    + Upward Revisions         + $XXX,XXX              │
│    − Downward Revisions       − $XXX,XXX              │
│    − Settlements              − $XXX,XXX              │
│    + New Obligations          + $XXX,XXX              │
│  ────────────────────────────────────────              │
│  Ending Balance             $XX,XXX,XXX               │
│                                                       │
│  ┌── Forecast Horizon ────────────────────────────┐   │
│  │  Year │ ARO Liability │ ERO Liability │ Total   │   │
│  │  2026 │ $XX.XM        │ $XX.XM        │ $XX.XM  │   │
│  │  ...  │               │               │         │   │
│  │  2036 │ $XX.XM        │ $XX.XM        │ $XX.XM  │   │
│  └────────────────────────────────────────────────┘   │
│                                                       │
│  [Export CSV] [Export PDF]                             │
└───────────────────────────────────────────────────────┘
```

---

## Module: Regulatory Intelligence

**Page**: `src/pages/RegulatoryIntelligence.tsx`  
**Route**: `/regulatory`

Regulatory change monitoring dashboard powered by the **Regulatory Intelligence Engine**.

- Dashboard summary with KPI cards
- Regulatory update feed with impact scores
- Detailed impact analysis panels
- AI-generated regulatory narratives
- Predictive regulatory risk indicators
- Filtering by jurisdiction, change type, urgency

---

## Module: Risk Intelligence

**Page**: `src/pages/RiskIntelligence.tsx`  
**Route**: `/risk`

### Risk Intelligence Dashboard

```
┌────────────────────────────────────────────────────────┐
│  RISK INTELLIGENCE                                      │
│                                                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Portfolio Risk Index                             │   │
│  │                                                 │   │
│  │    ┌────────────────────────────┐               │   │
│  │    │         Score: 54          │               │   │
│  │    │       Level: MODERATE      │               │   │
│  │    │      Trend: ── Stable      │               │   │
│  │    └────────────────────────────┘               │   │
│  │                                                 │   │
│  │  Exposure Volatility: 38   Confidence: 72%      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                        │
│  ┌─── Component Breakdown ─────────────────────────┐   │
│  │ Data Completeness  ████████░░░░  62   (×0.20)   │   │
│  │ Cost Escalation    ██████████░░  78   (×0.25)   │   │
│  │ Regulatory Risk    ███████░░░░░  55   (×0.20)   │   │
│  │ Timeline           ████████░░░░  65   (×0.20)   │   │
│  │ Settlement         ██████░░░░░░  48   (×0.15)   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                        │
│  ┌─── Site Heatmap ──┐  ┌─── Trend History ────────┐   │
│  │ S001 ████ High    │  │ Q1'25  ▁▂                │   │
│  │ S002 ███░ Moderate│  │ Q2'25  ▁▂▃              │   │
│  │ S003 ██░░ Moderate│  │ Q3'25  ▁▂▃▅             │   │
│  │ S004 ████ High    │  │ Q4'25  ▁▂▃▅▆            │   │
│  └────────────────────┘  └─────────────────────────┘   │
│                                                        │
│  [AI Risk Narrative] [Scenario Adjustment Sliders]     │
└────────────────────────────────────────────────────────┘
```

---

## Engine: AI Copilot

**File**: `src/lib/copilot-engine.ts` (455 lines)

### Copilot Processing Pipeline

```
User Input (Natural Language)
        │
        ▼
┌───────────────────────┐
│  Route Context Detection│  ← getContextForRoute()
│  (dashboard, aro, etc.) │
└──────────┬────────────┘
           │
    ┌──────▼──────────────┐
    │  Intent Detection    │  ← Regex keyword matching
    │  15+ query patterns  │     against input text
    └──────────┬──────────┘
               │
    ┌──────────▼──────────┐
    │  Data Aggregation    │  ← Pull from mock-data.ts
    │  (obligations,       │     arrays, helpers
    │   settlements, etc.) │
    └──────────┬──────────┘
               │
    ┌──────────▼──────────┐
    │  Response Template   │  ← buildResponse()
    │  (Markdown w/ tables │     Executive format
    │   bullets, figures)  │
    └──────────┬──────────┘
               │
    ┌──────────▼──────────┐
    │  Streaming Simulation│  ← 15–40ms per word
    │  (onChunk callback)  │     via setTimeout
    └─────────────────────┘
```

### Types

```typescript
type CopilotView = "portfolio" | "site" | "project" | "aro";

interface CopilotMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  view?: CopilotView;
}

interface SuggestedPrompt {
  text: string;
  category: string;
}
```

### Functions

#### `getContextForRoute(pathname: string): string`
Maps the current route to a context label for prompt suggestions.
```typescript
getContextForRoute("/aro")        // → "aro"
getContextForRoute("/settlement") // → "settlement"
getContextForRoute("/")           // → "dashboard"
```

#### `getSuggestedPrompts(context: string): SuggestedPrompt[]`
Returns context-aware prompt suggestions. Each context (dashboard, inventory, aro, ero, plan, settlement, assurance, reporting) has 2–3 specific prompts plus 3 universal prompts.

#### `generateCopilotResponse(query, view, context, onChunk): Promise<void>`
Simulates streaming AI response. Calls `buildResponse()` internally and emits word-by-word via `onChunk` callback with 15–40ms delays.

```typescript
await generateCopilotResponse(
  "What is the total environmental liability exposure?",
  "portfolio",
  "dashboard",
  (text) => setResponse(prev => prev + text)
);
```

### Pattern-Matched Queries

The engine handles 15+ query patterns:

| Pattern Keywords | Response Topic |
|-----------------|---------------|
| `liability` + `increase`/`q3` | Q3 liability growth analysis |
| `highest` + `risk` | Site risk ranking |
| `top 5` + `exposure` | Top exposure drivers |
| `total` + `liability` | Portfolio summary |
| `assumption` + `aro` | ARO assumption documentation |
| `variance` + `forecast` | Budget variance analysis |
| `over budget` | Settlement project analysis |
| `vendor` + `payment` | Vendor payment summary |
| `deficient` / `control` | Internal controls assessment |
| `audit` + `trail` | Audit trail summary |
| `disclosure` / `outstanding` | Disclosure status |
| `anomal` / `flag` | Proactive anomaly scan |
| `risk score` | Portfolio risk score |
| `ero` + `critical` | ERO risk assessment |
| `remediation` + `cost` | Remediation cost breakdown |
| `compare` + `scenario` | Scenario comparison |
| `rollforward` / `asc 410` | ASC 410-20 rollforward |

### Response Format

All responses follow a structured executive format:

```
┌─────────────────────────────────────┐
│  Executive Summary                   │
│  One-paragraph overview with $       │
├─────────────────────────────────────┤
│  Key Drivers                         │
│  • Driver 1 with $ impact            │
│  • Driver 2 with $ impact            │
├─────────────────────────────────────┤
│  Financial Impact                    │
│  Quantified exposure / delta         │
├─────────────────────────────────────┤
│  Risk Implication                    │
│  Risk level & trend                  │
├─────────────────────────────────────┤
│  Recommended Action                  │
│  Prioritized next steps              │
└─────────────────────────────────────┘
```

---

## Engine: Obligation Classification

**File**: `src/lib/obligation-classification-engine.ts` (321 lines)

### Classification Pipeline

```
Document Input (filename)
        │
        ▼
┌────────────────────────────┐
│ 1. Document Profile Lookup  │  ← SIMULATED_DOCUMENTS map
│    Match filename → profile │
└──────────────┬─────────────┘
               │
┌──────────────▼─────────────┐
│ 2. Signal Extraction        │  ← Extract obligation signals
│    7 signal types with      │     with confidence scores
│    page/paragraph refs      │     (jitter ±8 for realism)
└──────────────┬─────────────┘
               │
┌──────────────▼─────────────┐
│ 3. Liability Classification │
│    Signal patterns →        │
│    ARO / ERO / Contingent   │
│    + ARO likelihood (0–100) │
└──────────────┬─────────────┘
               │
┌──────────────▼─────────────┐
│ 4. Field Suggestion         │
│    Auto-fill: type, juris-  │
│    diction, env. category,  │
│    time horizon, cost       │
└──────────────┬─────────────┘
               │
┌──────────────▼─────────────┐
│ 5. Quality & Risk Analysis  │
│    - Missing attributes     │
│    - Completeness score     │
│    - Risk flags             │
│    - Duplicate detection    │
│    - Recommended actions    │
└─────────────────────────────┘
```

### Types

```typescript
type SignalType =
  | "Legal Obligation" | "Regulatory Citation"
  | "Remediation Requirement" | "Monitoring Mandate"
  | "Decommissioning Clause" | "Cleanup Trigger"
  | "Compliance Deadline";

type LiabilityType =
  | "ARO" | "Environmental Remediation"
  | "Monitoring Obligation" | "Contingent Liability"
  | "Compliance Obligation" | "Decommissioning Requirement";

type AROCategory =
  | "Asset-Linked Obligation" | "Facility Closure Obligation"
  | "Decommissioning Cost" | "Long-Term Monitoring Obligation";

interface ClassificationResult {
  documentName: string;
  documentType: string;
  signals: ObligationSignal[];
  liabilityType: LiabilityType;
  liabilityConfidence: number;
  aroLikelihood: number;
  aroCategory: AROCategory | null;
  suggestedFields: SuggestedFields;
  missingAttributes: MissingAttribute[];
  completenessScore: number;
  riskFlags: string[];
  duplicateMatches: DuplicateMatch[];
  recommendedActions: string[];
}
```

### Functions

#### `getAvailableDocuments(): string[]`
Returns filenames of simulated documents available for classification.

**Available Documents** (5 total):

| Document | Type | Profile |
|----------|------|---------|
| `EPA_Notice_EagleFord_2025.pdf` | Regulatory Notice | Environmental Remediation |
| `Decommission_Plan_PermianBasin.pdf` | Decommission Plan | Decommissioning Requirement |
| `Consent_Decree_GulfCoast.pdf` | Consent Decree | Compliance Obligation |
| `Lease_Agreement_Appalachian.docx` | Contract / Lease | ARO |
| `GW_Monitoring_Q4_2025.csv` | Monitoring Report | Monitoring Obligation |

#### `classifyDocument(filename: string): ClassificationResult`
Runs full classification pipeline on a simulated document.

```typescript
const result = classifyDocument("Decommission_Plan_PermianBasin.pdf");
// result.liabilityType → "Decommissioning Requirement"
// result.aroLikelihood → ~95
// result.signals.length → 6
// result.riskFlags → ["High Regulatory Risk", "Financial Exposure Indicator", ...]
```

---

## Engine: ARO Justification

**File**: `src/lib/aro-justification-engine.ts` (436 lines)

### Narrative Generation Flow

```
┌──────────────┐    ┌───────────────┐    ┌───────────────────┐
│ Select ARO   │───▶│ Select Type   │───▶│ generateNarrative()│
│ (obligation) │    │ (narrative)   │    │                   │
└──────────────┘    └───────────────┘    └─────────┬─────────┘
                                                   │
                    ┌──────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────┐
│  Narrative Types                                    │
│                                                    │
│  ┌─ calculation_rationale ────────────────────┐    │
│  │ PV formula, discount rate, accretion table │    │
│  └────────────────────────────────────────────┘    │
│  ┌─ assumption_documentation ─────────────────┐    │
│  │ Key assumptions with sensitivity analysis  │    │
│  └────────────────────────────────────────────┘    │
│  ┌─ change_in_liability ─────────────────────┐    │
│  │ Revision impact, accretion walkthrough     │    │
│  └────────────────────────────────────────────┘    │
│  ┌─ regulatory_disclosure ───────────────────┐    │
│  │ ASC 410 / ASC 450 formatted disclosure     │    │
│  └────────────────────────────────────────────┘    │
│  ┌─ full_audit_package ──────────────────────┐    │
│  │ All sections + audit trail + checklist     │    │
│  └────────────────────────────────────────────┘    │
│                                                    │
│  Output: Streaming NarrativeSection[] via callback │
│  Delay: 400–700ms per section (simulated)          │
└────────────────────────────────────────────────────┘
```

### Types

```typescript
type NarrativeType =
  | "calculation_rationale"
  | "assumption_documentation"
  | "change_in_liability"
  | "regulatory_disclosure"
  | "full_audit_package";

interface GeneratedNarrative {
  id: string;
  obligationId: string;
  narrativeType: NarrativeType;
  generatedAt: Date;
  generatedBy: string;
  version: number;
  sections: NarrativeSection[];
  auditPrepChecklist?: AuditChecklistItem[];
}
```

### Functions

#### `generateNarrative(obligationId, narrativeType, onSection, onComplete): Promise<void>`
```typescript
await generateNarrative(
  "OBL-001",
  "full_audit_package",
  (section) => setSections(prev => [...prev, section]),
  (narrative) => setFinal(narrative)
);
```

### Audit Prep Checklist

Each narrative includes an 8-item audit readiness checklist:

```
┌────────────────────────────────┬──────────┐
│ Item                           │ Status   │
├────────────────────────────────┼──────────┤
│ Engineering Cost Estimate      │ ✓ Complete│
│ Discount Rate Documentation    │ ✓ Complete│
│ Settlement Timeline            │ ✓ Complete│
│ Site Regulatory Permits        │ ⚠ Warning │
│ Periodic Review Documentation  │ ✓ Complete│
│ Budget Alignment               │ ✓ Complete│
│ Settlement Project Status      │ ✓ Complete│
│ Revision History               │ ✗ Missing │
└────────────────────────────────┴──────────┘
```

---

## Engine: Scenario Simulator

**File**: `src/lib/scenario-simulator-engine.ts` (498 lines)

### Monte Carlo Simulation Pipeline

```
┌─────────────────────────────────────────────────────┐
│  SIMULATION INPUTS                                   │
│                                                     │
│  Inflation Δ ──────── +/- % ──┐                     │
│  Discount Δ ───────── +/- % ──┤                     │
│  Escalation Factor ── ×1.0  ──┤                     │
│  Timeline Shift ───── ±yrs  ──┼── Combined into     │
│  Regulatory Factor ── ×1.0  ──┤   adjustment model  │
│  Probability Adj ──── +/- % ──┤                     │
│  Scope Expansion ──── 0-100%──┘                     │
│                                                     │
└──────────────────┬──────────────────────────────────┘
                   │
      ┌────────────▼─────────────┐
      │  DETERMINISTIC PASS       │
      │  Compound adjustment      │
      │  baseline → adjusted      │
      └────────────┬─────────────┘
                   │
      ┌────────────▼─────────────┐
      │  MONTE CARLO ENGINE       │
      │  1,000 iterations         │
      │  Gaussian random walks    │
      │  around input parameters  │
      └────────────┬─────────────┘
                   │
      ┌────────────▼──────────────────────────────┐
      │  STATISTICAL OUTPUT                        │
      │                                            │
      │  ┌─ Percentiles ────────────────────────┐  │
      │  │ P5    P25    P50    P75    P95        │  │
      │  │ $XM   $XM   $XM    $XM   $XM         │  │
      │  └──────────────────────────────────────┘  │
      │                                            │
      │  ┌─ Distribution (20 buckets) ──────────┐  │
      │  │ ▁▂▃▅▆▇██▇▆▅▃▂▁                      │  │
      │  └──────────────────────────────────────┘  │
      │                                            │
      │  ┌─ Sensitivity (Tornado) ──────────────┐  │
      │  │ Inflation     ◀════════════▶  $X.XM  │  │
      │  │ Regulatory    ◀═══════▶       $X.XM  │  │
      │  │ Scope         ◀══════▶        $X.XM  │  │
      │  │ Escalation    ◀═════▶         $X.XM  │  │
      │  │ Timeline      ◀════▶          $X.XM  │  │
      │  │ Discount      ◀═══▶           $X.XM  │  │
      │  │ Probability   ◀══▶            $X.XM  │  │
      │  └──────────────────────────────────────┘  │
      └────────────┬──────────────────────────────┘
                   │
      ┌────────────▼─────────────┐
      │  AI NARRATIVE             │
      │  Executive summary        │
      │  Key findings             │
      │  Recommendations          │
      └──────────────────────────┘
```

### Types

```typescript
interface SimulationInputs {
  inflationDelta: number;        // e.g., +0.02 = +2%
  discountDelta: number;         // e.g., -0.01 = -1%
  escalationFactor: number;      // multiplier, default 1.0
  timelineShiftYears: number;    // positive = extend
  regulatoryFactor: number;      // multiplier 1.0 = no change
  probabilityAdjustment: number; // +/- %
  scopeExpansion: number;        // 0-100%
  level: "portfolio" | "site" | "project" | "aro";
  levelId?: string;
}

interface SimulationResult {
  baselineLiability: number;
  adjustedLiability: number;
  deltaDollars: number;
  deltaPercent: number;
  monteCarlo: MonteCarloResult;
  sensitivity: SensitivityItem[];
  drivers: DriverBreakdown[];
  narrative: SimulationNarrative;
  scenarioComparison: { year, base, scenario }[];
  tornadoData: { factor, low, high, base }[];
  distributionData: { bucket, frequency }[];
  confidenceIndex: { before, after };
  riskScore: { before, after };
  volatilityScore: { before, after };
}

interface MonteCarloResult {
  mean: number;
  p5: number;  p25: number;
  p50: number; p75: number; p95: number;
  stdDev: number;
  iterations: number;
}
```

### Functions

#### `runSimulation(inputs: SimulationInputs): SimulationResult`
Executes full simulation pipeline.

```typescript
const result = runSimulation({
  inflationDelta: 0.02,
  discountDelta: -0.005,
  escalationFactor: 1.1,
  timelineShiftYears: 2,
  regulatoryFactor: 1.05,
  probabilityAdjustment: 5,
  scopeExpansion: 10,
  level: "portfolio",
});
// result.deltaPercent → e.g., +18.3%
// result.monteCarlo.p95 → e.g., $24,500,000
```

#### `solveReverseScenario(targetDeltaPercent, parameter): { value, label }`
Reverse-engineers what parameter value would produce a target liability change.
```typescript
solveReverseScenario(15, "inflation")
// → { value: 0.014, label: "Inflation rate of 1.40% would produce a 15% liability change" }
```

#### Stress Test Presets

| Preset | Description | Key Inputs |
|--------|-------------|-----------|
| `regulatory_shock` | Sudden regulatory tightening | 1.25x regulatory, +15% scope |
| `inflation_spike` | Sustained high inflation | +3.5% inflation, 1.15x escalation |
| `cost_overrun` | Significant cost overruns | 1.3x escalation, +20% scope |
| `compliance_penalty` | Regulatory penalties | 1.4x regulatory, -1yr timeline |
| `best_case` | Favorable conditions | -1% inflation, 0.9x escalation |

---

## Engine: Variance Intelligence

**File**: `src/lib/variance-intelligence-engine.ts` (673 lines)

### Variance Analysis Pipeline

```
Settlement Projects (4)
        │
        ▼
┌──────────────────────────┐
│ 1. Cost Item Analysis     │  Flag items >15% over budget
│    per project            │
└──────────┬───────────────┘
           │
┌──────────▼───────────────┐
│ 2. Vendor Analysis        │  Detect contract ceiling
│    Invoice vs. ceiling    │  proximity (>90%)
└──────────┬───────────────┘
           │
┌──────────▼───────────────┐
│ 3. Anomaly Detection      │
│                           │
│    ┌─ Cost Spike ────┐    │
│    │ Item >25% over  │    │
│    └─────────────────┘    │
│    ┌─ Vendor Anomaly ┐    │
│    │ >90% ceiling    │    │
│    └─────────────────┘    │
│    ┌─ Scope Creep ───┐    │
│    │ Spend/complete   │    │
│    │ ratio > 1.25x   │    │
│    └─────────────────┘    │
└──────────┬───────────────┘
           │
┌──────────▼───────────────┐
│ 4. Z-Score Severity       │
│                           │
│    |Z| < 1.0  → Normal   │
│    |Z| < 1.5  → Watch    │
│    |Z| < 2.0  → Warning  │
│    |Z| ≥ 2.0  → Critical │
└──────────┬───────────────┘
           │
┌──────────▼───────────────┐
│ 5. Root-Cause Drivers     │
│                           │
│    Vendor Cost Escalation │
│    Scope Expansion        │
│    Timeline Delay         │
│    Inflation Escalation   │
│    Regulatory Shift       │
│    Estimation Error       │
│    Data Entry Error       │
│    Budget Misalignment    │
└──────────┬───────────────┘
           │
┌──────────▼───────────────┐
│ 6. Attribution Breakdown  │
│    % per driver category  │
└──────────┬───────────────┘
           │
┌──────────▼───────────────┐
│ 7. Predictive Warning     │
│    Burn rate → projected  │
│    overrun at completion  │
└──────────┬───────────────┘
           │
┌──────────▼───────────────┐
│ 8. AI Narrative           │
│    Executive briefing     │
│    + Recalibration ideas  │
└──────────────────────────┘
```

### Types

```typescript
type VarianceSeverity = "Normal" | "Watch" | "Warning" | "Critical";

type DriverCategory =
  | "Vendor Cost Escalation" | "Scope Expansion"
  | "Timeline Delay" | "Inflation Escalation"
  | "Regulatory Shift" | "Estimation Error"
  | "Data Entry Inconsistency" | "Budget Misalignment";

interface ProjectVarianceAnalysis {
  projectId: string;
  projectName: string;
  totalBudget: number;
  totalSpent: number;
  totalVariance: number;
  variancePercent: number;
  severity: VarianceSeverity;
  drivers: VarianceDriver[];
  anomalies: AnomalyFlag[];
  predictiveWarning: string | null;
  costItemBreakdown: CostItemVariance[];
  vendorAnalysis: VendorVarianceAnalysis[];
}

interface PortfolioVarianceSummary {
  totalBudget: number;
  totalSpent: number;
  totalVariance: number;
  topDrivers: VarianceDriver[];
  highRiskProjects: ProjectVarianceAnalysis[];
  anomalyCount: number;
  forecastConfidence: number;  // Monte Carlo based
  riskScore: number;
}
```

### Functions

#### `analyzeProjectVariance(project): ProjectVarianceAnalysis`
Full variance analysis for a single settlement project.

#### `analyzePortfolio(): PortfolioVarianceSummary`
Aggregates all project analyses with Monte Carlo forecast confidence (500 iterations).

#### `getAllProjectAnalyses(): ProjectVarianceAnalysis[]`
Returns analysis for every settlement project.

#### `generateVarianceNarrative(analysis): VarianceNarrative`
Generates project-level AI narrative.

#### `generatePortfolioNarrative(summary): VarianceNarrative`
Portfolio-wide narrative with cross-project pattern analysis.

#### `generateRecalibrationSuggestions(summary): RecalibrationSuggestion[]`
Suggests parameter adjustments based on observed variance patterns:

| Parameter | When Triggered | Typical Suggestion |
|-----------|---------------|-------------------|
| Inflation Rate | Inflation driver detected | 2.5% → 3.2% |
| Vendor Escalation Factor | Vendor overruns detected | 3.0% → 4.5% |
| Timeline Buffer | Timeline delays detected | 0 → 6 months |
| Contingency Reserve | Always (risk-adjusted) | 5% → risk-based % |

---

## Engine: Risk Scoring

**File**: `src/lib/risk-scoring-engine.ts` (519 lines)

### 5-Factor Risk Scoring Model

```
┌──────────────────────────────────────────────────────────────┐
│                  RISK SCORING ENGINE                          │
│                                                              │
│  INPUT: Sites, Obligations, Settlements, Exposures           │
│                                                              │
│  ┌──────────────────┐                                        │
│  │ Data Completeness │  Weight: 0.20                         │
│  │ Missing estimates,│  Score: % of failed quality checks    │
│  │ rates, timelines  │                                       │
│  └────────┬─────────┘                                        │
│  ┌────────┴─────────┐                                        │
│  │ Cost Escalation   │  Weight: 0.25                         │
│  │ Initial→current   │  Score: avg growth % (30%+ = 100)     │
│  │ growth, overruns  │                                       │
│  └────────┬─────────┘                                        │
│  ┌────────┴─────────┐                                        │
│  │ Regulatory Risk   │  Weight: 0.20                         │
│  │ Compliance status,│  Score: weighted sum of status +      │
│  │ deadline proximity│  deadline urgency + exposure count    │
│  └────────┬─────────┘                                        │
│  ┌────────┴─────────┐                                        │
│  │ Timeline          │  Weight: 0.20                         │
│  │ Long-tail (>10yr),│  Score: duration + rate sensitivity   │
│  │ discount rate     │                                       │
│  └────────┬─────────┘                                        │
│  ┌────────┴─────────┐                                        │
│  │ Settlement        │  Weight: 0.15                         │
│  │ Budget overruns,  │  Score: overrun count × 8 + var%      │
│  │ scope expansion   │                                       │
│  └────────┬─────────┘                                        │
│           │                                                  │
│  ┌────────▼─────────────────────────────────────────────┐    │
│  │  COMPOSITE SCORE = Σ (component × weight)             │    │
│  │                                                       │    │
│  │   0───────30──────60──────80──────100                  │    │
│  │   │  Low   │ Moderate│  High │ Critical│               │    │
│  │   │ Green  │ Yellow  │Orange │  Red    │               │    │
│  └───────────────────────────────────────────────────────┘    │
│                                                              │
│  OUTPUTS:                                                    │
│  • Per-site scores with component breakdown                  │
│  • Portfolio composite (liability-weighted average)           │
│  • Exposure volatility (stddev × 2.5)                        │
│  • Forecast confidence (100 - vol×0.4 - data×0.3)           │
│  • Trend: Improving / Stable / Deteriorating                 │
│  • Top drivers ranked by contribution %                      │
│  • Quarterly trend history (simulated)                       │
│  • AI narrative (5 sections)                                 │
└──────────────────────────────────────────────────────────────┘
```

### Functions

#### `calculateSiteRiskScore(site, weights?): SiteRiskScore`
Computes composite risk score for a single site.

#### `calculatePortfolioRisk(weights?): PortfolioRiskResult`
Computes portfolio-wide risk.

```typescript
const risk = calculatePortfolioRisk();
// risk.portfolioScore → e.g., 54
// risk.portfolioLevel → "Moderate"
// risk.exposureVolatility → e.g., 38
// risk.narrative.executiveSummary → "Portfolio Risk Index remained stable..."
```

#### `calculateScenarioAdjustedRisk(inflationDelta, discountDelta, weights?)`
Simulates risk score change from inflation/discount assumptions:
- 1% inflation = ~8 point increase
- 1% discount rate change = ~5 point change

```typescript
calculateScenarioAdjustedRisk(0.02, -0.01)
// → { baseScore: 54, adjustedScore: 75, delta: 21, adjustedLevel: "High" }
```

### AI Risk Narrative

Generated by `generateRiskNarrative()`, includes 5 sections:

1. **Executive Summary**: Score trend, high-risk sites, total exposure
2. **Top Drivers**: Ranked with % contribution
3. **Exposure Volatility**: Dispersion analysis, sensitivity description
4. **Trend Analysis**: Improving/stable/deteriorating with leading indicators
5. **Recommended Actions**: Data-backed, conditionally generated

---

## Engine: Regulatory Intelligence

**File**: `src/lib/regulatory-intelligence-engine.ts` (518 lines)

### Regulatory Impact Analysis Pipeline

```
┌─────────────────────────────────────────────────────┐
│  REGULATORY CHANGE FEED (6 simulated updates)        │
│                                                     │
│  REG-001: Enhanced GW Monitoring (Texas, New Rule)  │
│  REG-002: Revised NORM Disposal (NM, Amendment)     │
│  REG-003: Pipeline Abandonment (Federal, Guidance)  │
│  REG-004: Stricter TCE/PCE MCLs (PA, Amendment)    │
│  REG-005: Marine Terminal Assessment (LA, Proposed) │
│  REG-006: Financial Assurance Increase (Fed, Rule)  │
└──────────────────┬──────────────────────────────────┘
                   │
      ┌────────────▼──────────────────┐
      │ 1. Geographic Mapping          │
      │    State → Sites → Obligations │
      │    Federal → All sites         │
      └────────────┬──────────────────┘
                   │
      ┌────────────▼──────────────────┐
      │ 2. Exposure Estimation         │
      │                                │
      │    Change Type    Multiplier   │
      │    ──────────     ──────────   │
      │    Enforcement    5–10–20%     │
      │    New Rule       3–6–12%      │
      │    Amendment      2–5–9%       │
      │    Guidance       1–3–6%       │
      │    Proposed       1–2–5%       │
      └────────────┬──────────────────┘
                   │
      ┌────────────▼──────────────────┐
      │ 3. Impact Scoring (0–100)      │
      │    = f(site count,             │
      │        obligation count,       │
      │        exposure magnitude,     │
      │        confidence,             │
      │        change type severity)   │
      └────────────┬──────────────────┘
                   │
      ┌────────────▼──────────────────┐
      │ 4. Urgency Classification      │
      │                                │
      │    Score ≥ 70            →     │
      │      "Immediate Action"        │
      │    Score ≥ 40 OR <60 days →    │
      │      "Review"                  │
      │    Otherwise →                 │
      │      "Monitor"                 │
      └────────────┬──────────────────┘
                   │
      ┌────────────▼──────────────────┐
      │ 5. AI Narrative                │
      │    Executive summary           │
      │    What changed                │
      │    Affected assets             │
      │    Financial implication       │
      │    Recommended actions         │
      └──────────────────────────────┘
```

### Functions

#### `analyzeRegulatory(update): RegulatoryImpactAnalysis`
Full impact analysis pipeline.

#### `getAllAnalyses(): (RegulatoryUpdate & { analysis })[]`
Returns all updates with their analyses.

#### `getDashboardSummary(): RegulatoryDashboardSummary`
Aggregated dashboard metrics.

#### `generateRegulatoryNarrative(update, analysis): RegulatoryNarrative`
AI narrative with financial exposure estimates and prioritized actions.

#### `getPredictiveRisks(): PredictiveRisk[]`
Returns 5 forward-looking regulatory risk indicators by region with trend scores (0–100).

---

## Export Utilities

**File**: `src/lib/export-utils.ts`

### Export Pipeline

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│ Table Data   │────▶│ exportToCSV()│────▶│ .csv download│
│ (headers +   │     └──────────────┘     └──────────────┘
│  rows[][])   │
│              │     ┌──────────────┐     ┌──────────────┐
│              │────▶│ exportToPDF()│────▶│ Print dialog │
└─────────────┘     └──────────────┘     └──────────────┘
```

### `exportToCSV(headers: string[], rows: string[][], filename: string): void`
Generates and downloads a CSV file.
- Handles cell escaping (commas, quotes, newlines)
- Triggers browser download via Blob URL

```typescript
exportToCSV(
  ["Name", "Liability", "Status"],
  [["Tank Farm Decommissioning", "$2,847,000", "Active"]],
  "obligations-report"
);
```

### `exportToPDF(title: string, headers: string[], rows: string[][], filename: string): void`
Generates a printable HTML table and opens the browser print dialog.
- Landscape orientation
- Professional formatting with header, date subtitle, confidentiality footer
- Uses `window.open()` + `window.print()`

```typescript
exportToPDF(
  "ARO Liability Report",
  ["Obligation", "Current Liability", "Accretion"],
  [...rows],
  "aro-report"
);
```

---

## Routing and Layout

**File**: `src/App.tsx`

### Provider & Layout Hierarchy

```
┌── QueryClientProvider ─────────────────────────────────┐
│  ┌── TooltipProvider ───────────────────────────────┐  │
│  │  ┌── Toaster (Radix) ────┐                      │  │
│  │  └───────────────────────┘                      │  │
│  │  ┌── Sonner ─────────────┐                      │  │
│  │  └───────────────────────┘                      │  │
│  │  ┌── BrowserRouter ──────────────────────────┐  │  │
│  │  │  ┌── Routes ──────────────────────────┐   │  │  │
│  │  │  │                                    │   │  │  │
│  │  │  │  ┌── AppLayout ─────────────────┐  │   │  │  │
│  │  │  │  │  ┌────────┐ ┌─────────────┐  │  │   │  │  │
│  │  │  │  │  │Sidebar │ │  <Outlet/>  │  │  │   │  │  │
│  │  │  │  │  │  Nav   │ │   (Page)    │  │  │   │  │  │
│  │  │  │  │  └────────┘ └─────────────┘  │  │   │  │  │
│  │  │  │  │  ┌──────────────────────┐    │  │   │  │  │
│  │  │  │  │  │   CopilotFAB        │    │  │   │  │  │
│  │  │  │  │  └──────────────────────┘    │  │   │  │  │
│  │  │  │  └──────────────────────────────┘  │   │  │  │
│  │  │  │                                    │   │  │  │
│  │  │  │  ┌── NotFound (404) ────────────┐  │   │  │  │
│  │  │  │  └──────────────────────────────┘  │   │  │  │
│  │  │  └────────────────────────────────────┘   │  │  │
│  │  └───────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### Route Map

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Index` | Executive Dashboard |
| `/inventory` | `Inventory` | Site/Asset/Obligation Browser |
| `/aro` | `AROModule` | ARO Management |
| `/ero` | `EROModule` | ERO Management |
| `/plan` | `PlanModule` | Forecasting & Budget |
| `/settlement` | `SettlementModule` | Spend Management |
| `/assurance` | `AssuranceModule` | Audit & Compliance |
| `/reporting` | `FinancialReporting` | Financial Reporting |
| `/regulatory` | `RegulatoryIntelligence` | Regulatory Change Monitor |
| `/risk` | `RiskIntelligence` | Executive Risk Scoring |
| `/settings` | `SettingsPage` | Platform Settings |
| `*` | `NotFound` | 404 Page |

---

## Component Library

The platform uses **shadcn/ui** components (60+ components in `src/components/ui/`), including:

- Layout: `card`, `sheet`, `dialog`, `tabs`, `accordion`, `collapsible`, `separator`
- Forms: `input`, `select`, `checkbox`, `radio-group`, `switch`, `slider`, `textarea`, `form`
- Data: `table`, `badge`, `progress`, `skeleton`
- Navigation: `sidebar`, `breadcrumb`, `navigation-menu`, `pagination`
- Feedback: `toast`, `alert`, `tooltip`, `hover-card`
- Overlay: `dropdown-menu`, `context-menu`, `popover`, `command`

All components use semantic design tokens from `index.css` and `tailwind.config.ts`.

---

## Design System

### Color Token Architecture

```
┌── :root (Light Mode) ──────────────────────────────────┐
│                                                        │
│  Layout Tokens         Component Tokens                │
│  ──────────────        ─────────────────               │
│  --background          --card                          │
│  --foreground          --card-foreground               │
│  --border              --popover                       │
│  --input               --popover-foreground            │
│  --ring                                                │
│                                                        │
│  Semantic Tokens       Sidebar Tokens                  │
│  ──────────────        ──────────────                  │
│  --primary             --sidebar-background            │
│  --primary-foreground  --sidebar-foreground             │
│  --secondary           --sidebar-primary               │
│  --muted               --sidebar-accent                │
│  --accent              --sidebar-border                │
│  --destructive         --sidebar-ring                  │
│                                                        │
├── .dark (Dark Mode) ───────────────────────────────────┤
│  All tokens overridden for dark theme                  │
└────────────────────────────────────────────────────────┘
```

### Risk Color Mapping (used across modules)

| Level | Tailwind Class Pattern |
|-------|----------------------|
| Low / Compliant | `text-green-*` / `bg-green-*` |
| Medium / Moderate | `text-yellow-*` / `bg-yellow-*` |
| High | `text-orange-*` / `bg-orange-*` |
| Critical | `text-red-*` / `bg-red-*` |

---

*Generated for EOM Platform v1.0 — February 2026*
