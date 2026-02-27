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
│   └── ui/                        # shadcn/ui component library
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

The executive dashboard displays:
- **Stat Cards**: Total ARO, Total ERO, Active Obligations, Annual Accretion
- **Liability Trend Chart**: Quarterly trend (AreaChart via Recharts)
- **Forecast Chart**: 10-year ARO/ERO projections (BarChart)
- **Executive Risk Score Widget**: Portfolio Risk Index, Exposure Volatility, Forecast Confidence, Top Drivers, Risk Trend
- **Recent Activity Feed**: Latest obligation changes
- **AI Copilot FAB**: Floating button to open the copilot panel

The Risk Score widget calls `calculatePortfolioRisk()` from the Risk Scoring Engine on render and displays color-coded results (Low/Moderate/High/Critical).

---

## Module: Inventory

**Page**: `src/pages/Inventory.tsx`  
**Route**: `/inventory`

Provides a hierarchical browser for Sites → Facilities → Assets → Obligations:
- Site detail panels with contact info, permits, regulatory data
- Asset condition and depreciation tracking
- Obligation linkage to assets
- Environmental exposure cards
- Data driven from `sites`, `obligations`, `environmentalExposures`

---

## Module: ARO

**Page**: `src/pages/AROModule.tsx`  
**Route**: `/aro`

ARO lifecycle management with tabs:
- **Tracking**: ARO register from `aroTrackingEntries` with accretion schedules
- **Obligation Classification**: Document upload → AI classification (uses Classification Engine)
- **ARO Justification**: Audit-ready narrative generation (uses ARO Justification Engine)

---

## Module: ERO

**Page**: `src/pages/EROModule.tsx`  
**Route**: `/ero`

Environmental Remediation management:
- Remediation phase tracking (Assessment → Closure)
- Contaminant type and media tracking
- Progress visualization
- Regulatory deadline monitoring
- Data from `obligations.filter(o => o.type === "ERO")` and `environmentalExposures`

---

## Module: Plan

**Page**: `src/pages/PlanModule.tsx`  
**Route**: `/plan`

Multi-year forecasting and budget alignment:
- **Scenario Comparison**: Base Case vs High Inflation vs Accelerated Settlement
- **Liability Projections**: 10-year ARO/ERO forecasts (from `forecastScenarios`)
- **Budget Alignment**: FY2026 budget vs forecast variance (from `budgetItems`)
- **Scenario Simulator Tab**: Interactive Monte Carlo simulation (uses Scenario Simulator Engine)

---

## Module: Settlement

**Page**: `src/pages/SettlementModule.tsx`  
**Route**: `/settlement`

Spend management and vendor tracking:
- Project-level budget/spend/committed tracking
- Vendor payment management with retainage
- Cost item breakdown by category
- Milestone tracking
- **Variance Intelligence Tab**: AI-powered anomaly detection (uses Variance Intelligence Engine)
- Data from `settlementProjects`

---

## Module: Assurance

**Page**: `src/pages/AssuranceModule.tsx`  
**Route**: `/assurance`

Audit and compliance management:
- Audit trail viewer (from `auditTrail`)
- Internal control status tracking (from `controlItems`)
- Disclosure requirement tracking (from `disclosureItems`)
- ASC 410-20 / ASC 450-20 / SEC Reg S-K compliance

---

## Module: Financial Reporting

**Page**: `src/pages/FinancialReporting.tsx`  
**Route**: `/reporting`

Financial reporting tools:
- Liability rollforward (beginning balance → accretion → revisions → settlements → ending balance)
- Disclosure status dashboard
- Export capabilities (CSV/PDF)

---

## Module: Regulatory Intelligence

**Page**: `src/pages/RegulatoryIntelligence.tsx`  
**Route**: `/regulatory`

Regulatory change monitoring dashboard:
- Dashboard summary with KPI cards
- Regulatory update feed with impact scores
- Detailed impact analysis panels
- AI-generated regulatory narratives
- Predictive regulatory risk indicators
- Filtering by jurisdiction, change type, urgency

Powered by the **Regulatory Intelligence Engine**.

---

## Module: Risk Intelligence

**Page**: `src/pages/RiskIntelligence.tsx`  
**Route**: `/risk`

Executive risk scoring dashboard:
- **Portfolio Risk Index**: Weighted composite score (0–100)
- **Site Heatmap**: Color-coded risk by site
- **Risk Distribution**: Bar chart of component scores
- **Risk Composition**: Radar chart of risk dimensions
- **Trend History**: Quarterly risk trend (AreaChart)
- **AI Risk Narrative**: Expandable executive analysis sheet
- **Scenario Adjustment**: Interactive sliders for inflation/discount delta simulation
- Filtering by site, component

Powered by the **Risk Scoring Engine**.

---

## Engine: AI Copilot

**File**: `src/lib/copilot-engine.ts` (455 lines)

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

All responses follow a structured executive format:
1. **Executive Summary**
2. **Key Drivers** (bulleted)
3. **Financial Impact**
4. **Risk Implication**
5. **Recommended Action**

---

## Engine: Obligation Classification

**File**: `src/lib/obligation-classification-engine.ts` (321 lines)

Simulates AI-powered document classification for obligation intake.

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
```typescript
getAvailableDocuments()
// → ["EPA_Notice_EagleFord_2025.pdf", "Decommission_Plan_PermianBasin.pdf", ...]
```

**Available Documents** (5 total):
| Document | Type | Profile |
|----------|------|---------|
| `EPA_Notice_EagleFord_2025.pdf` | Regulatory Notice | Environmental Remediation |
| `Decommission_Plan_PermianBasin.pdf` | Decommission Plan | Decommissioning Requirement |
| `Consent_Decree_GulfCoast.pdf` | Consent Decree | Compliance Obligation |
| `Lease_Agreement_Appalachian.docx` | Contract / Lease | ARO |
| `GW_Monitoring_Q4_2025.csv` | Monitoring Report | Monitoring Obligation |

#### `classifyDocument(filename: string): ClassificationResult`
Runs full classification pipeline on a simulated document:

1. **Signal Extraction**: Identifies obligation signals (legal, regulatory, remediation, etc.) with confidence scores
2. **Liability Classification**: Maps to liability type with confidence
3. **ARO Likelihood**: Scores probability of being an ARO (0–100)
4. **Field Suggestion**: Auto-fills obligation type, jurisdiction, remediation type, environmental category, time horizon, cost indicator
5. **Missing Attribute Detection**: Identifies data gaps with severity ratings
6. **Completeness Scoring**: Overall data quality score (0–100)
7. **Risk Flagging**: Identifies high regulatory risk, financial exposure, long-term liability, multi-jurisdiction impacts
8. **Duplicate Detection**: Matches against existing obligations by keyword overlap
9. **Action Recommendations**: Suggests next steps (create ARO, link asset, request cost estimate, etc.)

```typescript
const result = classifyDocument("Decommission_Plan_PermianBasin.pdf");
// result.liabilityType → "Decommissioning Requirement"
// result.aroLikelihood → ~95
// result.signals.length → 6
// result.riskFlags → ["High Regulatory Risk", "Financial Exposure Indicator", ...]
```

### How It Works

The engine uses three internal dictionaries:

1. **`SIGNAL_PATTERNS`**: Maps signal types to keyword arrays and base confidence scores
2. **`DOCUMENT_PROFILES`**: Maps document profiles to liability types, ARO likelihood, suggested field values
3. **`SIMULATED_DOCUMENTS`**: Pre-authored signal extractions for each document

Confidence scores use a `jitter()` function (±8 range) to simulate realistic variance between classifications.

---

## Engine: ARO Justification

**File**: `src/lib/aro-justification-engine.ts` (436 lines)

Generates audit-ready ARO documentation from structured data.

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

interface NarrativeSection {
  id: string;
  title: string;
  content: string;               // Markdown-formatted
  sourceReferences: SourceReference[];
}
```

### Functions

#### `generateNarrative(obligationId, narrativeType, onSection, onComplete): Promise<void>`
Streams narrative sections with simulated delay (400–700ms per section).

```typescript
await generateNarrative(
  "OBL-001",
  "full_audit_package",
  (section) => setSections(prev => [...prev, section]),  // streaming callback
  (narrative) => setFinal(narrative)                      // completion callback
);
```

**Narrative Types & Sections**:

| Type | Sections Generated |
|------|-------------------|
| `calculation_rationale` | Executive Summary, Calculation Rationale, Key Assumptions, Source References |
| `assumption_documentation` | Key Assumptions, Assumption Sensitivity Analysis, Source References |
| `change_in_liability` | Executive Summary, Change-in-Liability Explanation, Source References |
| `regulatory_disclosure` | ASC 410/450 Disclosure Draft, Source References |
| `full_audit_package` | All 6 sections + Audit Trail Summary |

**Section Details**:

- **Executive Summary**: Obligation overview with financial magnitude, time horizon, risk profile
- **Calculation Rationale**: PV formula, discount rate application, inflation adjustment, accretion schedule table
- **Key Assumptions**: Tabular summary (discount rate, inflation, duration, scope, regulatory basis, probability weighting)
- **Assumption Sensitivity Analysis**: ±50bps discount rate impact, inflation scenario comparison, timeline sensitivity, peer benchmarking
- **Change-in-Liability**: Driver breakdown table (accretion vs revision vs inflation), audit trail
- **Disclosure Draft**: SEC-ready ASC 410-20 or ASC 450-20 disclosure language
- **Source References**: Cross-module data traceability

#### `getAROObligationsForJustification(): ObligationSummary[]`
Returns active ARO obligations for the UI selector.

### Audit Prep Checklist

Each narrative includes an 8-item audit readiness checklist:
1. Engineering Cost Estimate
2. Discount Rate Documentation
3. Settlement Timeline
4. Site Regulatory Permits
5. Periodic Review Documentation
6. Budget Alignment
7. Settlement Project Status
8. Revision History

Each item has status: `complete` | `missing` | `warning`.

---

## Engine: Scenario Simulator

**File**: `src/lib/scenario-simulator-engine.ts` (498 lines)

Monte Carlo simulation with sensitivity analysis and AI narrative.

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
Executes full simulation pipeline:

1. **Filter Obligations**: By level (portfolio/site/project/aro)
2. **Deterministic Adjustment**: Calculates adjusted liability using compound inflation, discount, escalation, regulatory, scope, and probability factors
3. **Monte Carlo** (1,000 iterations): Gaussian random sampling around input parameters
4. **Sensitivity Analysis**: Ranks 7 factors by dollar impact
5. **Tornado Data**: Low/high bounds for each factor
6. **Distribution Data**: 20-bucket frequency distribution
7. **AI Narrative**: Executive summary, primary drivers, sensitivity ranking, risk implications, recommended actions

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

#### `defaultInputs: SimulationInputs`
Baseline inputs with all adjustments at zero/neutral.

---

## Engine: Variance Intelligence

**File**: `src/lib/variance-intelligence-engine.ts` (673 lines)

Statistical anomaly detection, root-cause classification, and AI narrative for settlement variances.

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

#### `analyzeProjectVariance(project: SettlementProject): ProjectVarianceAnalysis`
Full variance analysis for a single settlement project:

1. **Cost Item Analysis**: Flags items exceeding 15% over budget
2. **Vendor Analysis**: Detects contract overruns and ceiling proximity (90%+ invoiced)
3. **Anomaly Detection**: Cost spikes, vendor anomalies, scope creep (spend/completion ratio > 1.25x)
4. **Driver Classification**: Attributes variance to categories (Vendor Escalation, Scope Expansion, Timeline Delay, Inflation, Estimation Error)
5. **Predictive Warning**: Projects budget overrun at completion based on burn rate
6. **Severity Rating**: Normal (< 8%) → Watch (8–15%) → Warning (15–25%) → Critical (> 25%)

#### `analyzePortfolio(): PortfolioVarianceSummary`
Aggregates all project analyses with Monte Carlo forecast confidence (500 iterations).

#### `getAllProjectAnalyses(): ProjectVarianceAnalysis[]`
Returns analysis for every settlement project.

#### `generateVarianceNarrative(analysis: ProjectVarianceAnalysis): VarianceNarrative`
Generates project-level AI narrative with:
- Executive summary
- Ranked primary drivers with dollar impact and evidence
- Financial risk implication
- Pattern analysis (systemic vs isolated)
- Prioritized recommended actions

#### `generatePortfolioNarrative(summary: PortfolioVarianceSummary): VarianceNarrative`
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

Structured, explainable, defensible portfolio risk scoring.

### Types

```typescript
type RiskLevel = "Low" | "Moderate" | "High" | "Critical";
type RiskTrend = "Improving" | "Stable" | "Deteriorating";

interface RiskComponentScore {
  name: string;
  key: string;
  score: number;        // 0–100
  weight: number;       // decimal
  weightedScore: number;
  drivers: string[];
  details: string;
}

interface SiteRiskScore {
  siteId: string;
  siteName: string;
  compositeScore: number;
  level: RiskLevel;
  trend: RiskTrend;
  components: RiskComponentScore[];
  topDrivers: { driver, contribution }[];
  totalExposure: number;
}

interface PortfolioRiskResult {
  portfolioScore: number;
  portfolioLevel: RiskLevel;
  portfolioTrend: RiskTrend;
  exposureVolatility: number;
  forecastConfidence: number;
  siteScores: SiteRiskScore[];
  topDrivers: { driver, contribution }[];
  trendHistory: { period, score }[];
  narrative: RiskNarrative;
}

interface RiskWeights {
  dataCompleteness: number;   // default 0.20
  costEscalation: number;     // default 0.25
  regulatory: number;         // default 0.20
  timeline: number;           // default 0.20
  settlement: number;         // default 0.15
}
```

### Scoring Components

| Component | Weight | What It Measures | Scoring Logic |
|-----------|--------|-----------------|---------------|
| **Data Completeness** | 20% | Missing cost estimates, discount rates, timelines, regulatory tags, unclassified obligations | % of failed data quality checks |
| **Cost Escalation** | 25% | Historical cost growth (initial → current), settlement project overruns | Average growth % normalized to 0–100 (30%+ = 100) |
| **Regulatory Risk** | 20% | Compliance status, deadline proximity, high/critical exposures | Weighted sum of compliance status score + deadline urgency + exposure count |
| **Timeline Uncertainty** | 20% | Long-tail obligations (>10yr), discount rate sensitivity | Scaled score from duration and rate factors |
| **Settlement Variance** | 15% | Budget overruns, scope expansion, cost category anomalies | Overrun count × 8 + variance percentage |

### Risk Level Thresholds

| Score Range | Level | Color Code |
|-------------|-------|-----------|
| 0–30 | Low | Green |
| 31–60 | Moderate | Yellow |
| 61–80 | High | Orange |
| 81–100 | Critical | Red |

### Functions

#### `calculateSiteRiskScore(site, weights?): SiteRiskScore`
Computes composite risk score for a single site.

#### `calculatePortfolioRisk(weights?): PortfolioRiskResult`
Computes portfolio-wide risk:
1. Calculates per-site scores
2. Weighted average by exposure (liability-proportional)
3. Exposure volatility: standard deviation of site scores × 2.5
4. Forecast confidence: `100 - volatility×0.4 - dataRisk×0.3`
5. Portfolio trend: majority vote of site trends
6. Aggregated top drivers
7. Simulated quarterly trend history
8. AI narrative generation

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
3. **Exposure Volatility**: Dispersion analysis, sensitivity description, top contributing sites
4. **Trend Analysis**: Improving/stable/deteriorating with leading indicators
5. **Recommended Actions**: Data-backed, conditionally generated based on component scores

---

## Engine: Regulatory Intelligence

**File**: `src/lib/regulatory-intelligence-engine.ts` (518 lines)

Regulatory change monitoring with structured impact analysis.

### Types

```typescript
type UrgencyLevel = "Monitor" | "Review" | "Immediate Action";
type ExposureRisk = "Low" | "Medium" | "High";

interface RegulatoryUpdate {
  id: string;
  title: string;
  regulatoryBody: string;
  jurisdiction: string;
  effectiveDate: string;
  changeType: "New Rule" | "Amendment" | "Enforcement" | "Guidance" | "Proposed Rule";
  summary: string;
  complianceRequirements: string[];
  confidenceScore: number;
}

interface RegulatoryImpactAnalysis {
  impactScore: number;
  exposureRisk: ExposureRisk;
  urgency: UrgencyLevel;
  impactedSites: ImpactedSite[];
  impactedObligations: ImpactedObligation[];
  exposure: ExposureEstimate;
  forecastAssumptionsAffected: string[];
}

interface RegulatoryNarrative {
  executiveSummary: string;
  whatChanged: string;
  affectedAssets: string;
  financialImplication: string;
  recommendedActions: { action, priority, rationale }[];
}
```

### Regulatory Updates Feed

6 simulated regulatory changes:

| ID | Title | Jurisdiction | Type | Impact |
|----|-------|-------------|------|--------|
| REG-001 | Enhanced GW Monitoring | Texas | New Rule | Site S001 |
| REG-002 | Revised NORM Disposal | New Mexico | Amendment | Site S002 |
| REG-003 | Pipeline Abandonment Standards | Federal | Guidance | All sites |
| REG-004 | Stricter TCE/PCE MCLs | Pennsylvania | Amendment | Site S003 |
| REG-005 | Marine Terminal Assessment | Louisiana | Proposed Rule | Site S004 |
| REG-006 | Financial Assurance Increase | Federal | New Rule | Sites S001, S002 |

### Functions

#### `analyzeRegulatory(update: RegulatoryUpdate): RegulatoryImpactAnalysis`
Full impact analysis pipeline:
1. **Site Matching**: Geography-based mapping (state → site)
2. **Obligation Matching**: Identifies affected obligations at impacted sites
3. **Exposure Estimation**: Heuristic multipliers by change type
4. **Impact Scoring**: 0–100 composite from site count, obligation count, exposure magnitude, confidence, change type severity
5. **Urgency Classification**: Based on score and days to effective date

**Exposure Multipliers** (applied to total affected liability):

| Change Type | Low | Base | High |
|------------|-----|------|------|
| Enforcement | 5% | 10% | 20% |
| New Rule | 3% | 6% | 12% |
| Amendment | 2% | 5% | 9% |
| Guidance | 1% | 3% | 6% |
| Proposed Rule | 1% | 2% | 5% |

#### `getAllAnalyses(): (RegulatoryUpdate & { analysis })[]`
Returns all updates with their analyses.

#### `getDashboardSummary(): RegulatoryDashboardSummary`
Aggregated dashboard metrics: total updates, high-impact count, total exposure, affected sites/AROs, jurisdiction breakdown.

#### `generateRegulatoryNarrative(update, analysis): RegulatoryNarrative`
AI narrative with:
- Executive summary with financial exposure range
- What changed (requirements list)
- Affected assets and obligations
- Financial implication with low/base/high estimates
- Prioritized recommended actions

#### `getPredictiveRisks(): PredictiveRisk[]`
Returns 5 forward-looking regulatory risk indicators by region with trend scores (0–100).

---

## Export Utilities

**File**: `src/lib/export-utils.ts`

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
- Styled with professional formatting
- Includes header, subtitle with date, and confidentiality footer
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

All module routes render inside `AppLayout` which provides the sidebar navigation (`AppSidebar`) and main content area via React Router's `<Outlet />`.

### Providers

```
QueryClientProvider (React Query)
  └─ TooltipProvider (Radix)
       ├─ Toaster (Radix-based)
       ├─ Sonner (toast library)
       └─ BrowserRouter
            └─ Routes
```

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

### Color Tokens (HSL)

All colors are defined as CSS custom properties in `index.css` and referenced via Tailwind:

```
--background, --foreground
--primary, --primary-foreground
--secondary, --secondary-foreground
--muted, --muted-foreground
--accent, --accent-foreground
--destructive, --destructive-foreground
--card, --card-foreground
--border, --input, --ring
```

Both light and dark modes are supported.

### Risk Color Mapping (used across modules)

| Level | Tailwind Class Pattern |
|-------|----------------------|
| Low / Compliant | `text-green-*` / `bg-green-*` |
| Medium / Moderate | `text-yellow-*` / `bg-yellow-*` |
| High | `text-orange-*` / `bg-orange-*` |
| Critical | `text-red-*` / `bg-red-*` |

---

*Generated for EOM Platform v1.0 — February 2026*
