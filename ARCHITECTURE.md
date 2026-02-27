# EOM Platform — Architecture & Data Flow

> **Environmental Obligation Management (EOM)**  
> Component relationships, data flow diagrams, and system architecture.

---

## Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Application Shell & Routing](#application-shell--routing)
3. [Data Layer Architecture](#data-layer-architecture)
4. [Module Dependency Map](#module-dependency-map)
5. [Dashboard Data Flow](#dashboard-data-flow)
6. [Inventory Module — Hierarchy](#inventory-module--hierarchy)
7. [ARO Module — Processing Pipeline](#aro-module--processing-pipeline)
8. [ERO Module — Remediation Lifecycle](#ero-module--remediation-lifecycle)
9. [Plan Module — Forecasting Pipeline](#plan-module--forecasting-pipeline)
10. [Settlement Module — Variance Intelligence](#settlement-module--variance-intelligence)
11. [Assurance Module — Audit Flow](#assurance-module--audit-flow)
12. [Risk Intelligence — Scoring Pipeline](#risk-intelligence--scoring-pipeline)
13. [Regulatory Intelligence — Impact Analysis](#regulatory-intelligence--impact-analysis)
14. [AI Copilot — Query Resolution](#ai-copilot--query-resolution)
15. [Obligation Classification — Document Pipeline](#obligation-classification--document-pipeline)
16. [Scenario Simulator — Monte Carlo Pipeline](#scenario-simulator--monte-carlo-pipeline)
17. [Cross-Module Data Dependencies](#cross-module-data-dependencies)
18. [Component Hierarchy](#component-hierarchy)
19. [Design System Architecture](#design-system-architecture)

---

## System Architecture Overview

The EOM platform is a **client-side single-page application** with no backend dependencies. All AI features use a simulated RAG (Retrieval-Augmented Generation) engine that generates structured, CFO-grade narratives from in-memory mock data.

```mermaid
graph TB
    subgraph Browser["Browser Runtime"]
        subgraph Providers["React Provider Stack"]
            QC[QueryClientProvider]
            TP[TooltipProvider]
            RT[BrowserRouter]
        end

        subgraph Shell["Application Shell"]
            AL[AppLayout]
            SB[AppSidebar]
            OL[Outlet - Page Content]
            FAB[CopilotFAB]
        end

        subgraph Pages["Page Modules"]
            IDX[Dashboard]
            INV[Inventory]
            ARO[ARO Module]
            ERO[ERO Module]
            PLN[Plan Module]
            STL[Settlement Module]
            ASR[Assurance Module]
            RPT[Financial Reporting]
            REG[Regulatory Intelligence]
            RSK[Risk Intelligence]
        end

        subgraph Engines["AI / Computation Engines"]
            CE[Copilot Engine]
            OCE[Classification Engine]
            AJE[ARO Justification Engine]
            SSE[Scenario Simulator Engine]
            VIE[Variance Intelligence Engine]
            RSE[Risk Scoring Engine]
            RIE[Regulatory Intelligence Engine]
        end

        subgraph Data["Data Layer"]
            MD[mock-data.ts]
        end

        subgraph Utils["Utilities"]
            CN[cn - Class Merge]
            EXP[Export Utils - CSV/PDF]
        end
    end

    Providers --> Shell
    Shell --> Pages
    Pages --> Engines
    Engines --> Data
    Pages --> Utils
    Pages --> Data
```

---

## Application Shell & Routing

The app wraps all routes in a provider stack, then renders `AppLayout` which contains the sidebar and a content outlet.

```mermaid
graph LR
    subgraph Providers
        A[QueryClientProvider] --> B[TooltipProvider]
        B --> C[Toaster - Radix]
        B --> D[Sonner]
        B --> E[BrowserRouter]
    end

    E --> F[Routes]

    F --> G["AppLayout (wrapper)"]
    F --> H["NotFound (standalone)"]

    G --> I[AppSidebar]
    G --> J["Outlet (page content)"]
    G --> K[CopilotFAB]

    J --> L["/ - Dashboard"]
    J --> M["/inventory - Inventory"]
    J --> N["/aro - ARO Module"]
    J --> O["/ero - ERO Module"]
    J --> P["/plan - Plan Module"]
    J --> Q["/settlement - Settlement"]
    J --> R["/assurance - Assurance"]
    J --> S["/reporting - Reporting"]
    J --> T["/regulatory - Regulatory"]
    J --> U["/risk - Risk Intelligence"]
    J --> V["/settings - Settings"]
```

---

## Data Layer Architecture

All modules read from a single shared data layer (`mock-data.ts`). The data is structured as a hierarchical domain model.

```mermaid
erDiagram
    SITE ||--o{ FACILITY : contains
    FACILITY ||--o{ ASSET : contains
    SITE ||--o{ OBLIGATION : "has obligations"
    FACILITY ||--o{ OBLIGATION : "has obligations"
    ASSET ||--o| OBLIGATION : "linked to"
    SITE ||--o{ ENVIRONMENTAL_EXPOSURE : "has exposures"
    OBLIGATION ||--o| ENVIRONMENTAL_EXPOSURE : "related to"
    OBLIGATION ||--o| ARO_TRACKING_ENTRY : "tracked by"
    OBLIGATION ||--o| BUDGET_ITEM : "budgeted in"
    OBLIGATION ||--o| SETTLEMENT_PROJECT : "settled via"
    OBLIGATION ||--o| AUDIT_TRAIL_ENTRY : "logged in"
    SETTLEMENT_PROJECT ||--o{ COST_ITEM : "has costs"
    SETTLEMENT_PROJECT ||--o{ VENDOR_PAYMENT : "has vendors"
    SETTLEMENT_PROJECT ||--o{ MILESTONE : "has milestones"

    SITE {
        string id PK
        string name
        string region
        string complianceStatus
        string regulatoryAgency
    }

    FACILITY {
        string id PK
        string name
        string siteId FK
    }

    ASSET {
        string id PK
        string assetType
        string condition
        number originalCost
        number netBookValue
    }

    OBLIGATION {
        string id PK
        string type "ARO or ERO"
        string status
        number initialEstimate
        number currentLiability
        number discountRate
        number accretionExpense
    }

    ENVIRONMENTAL_EXPOSURE {
        string id PK
        string contaminantType
        string riskLevel
        number estimatedCleanupCost
    }

    SETTLEMENT_PROJECT {
        string id PK
        string obligationId FK
        number totalBudget
        number totalSpent
        number completionPercent
    }
```

### Helper Function Dependency

```mermaid
graph TD
    subgraph "Exported Helper Functions"
        FC[formatCurrency]
        FCK[formatCurrencyK]
        CPV[calculatePresentValue]
        GAS[generateAccretionSchedule]
        GARO[getAROObligations]
        GERO[getEROObligations]
        GAO[getActiveObligations]
        GTL[getTotalLiability]
        GTA[getTotalAccretion]
        GOBS[getObligationsByStatus]
        GAA[getAllAssets]
    end

    subgraph "Consumed By"
        CE[Copilot Engine]
        AJE[ARO Justification Engine]
        RSE[Risk Scoring Engine]
        SSE[Scenario Simulator Engine]
        VIE[Variance Intelligence Engine]
        RIE[Regulatory Intelligence Engine]
        PG[Page Components]
    end

    FC --> CE
    FC --> AJE
    FC --> VIE
    FC --> RIE
    FCK --> CE
    FCK --> SSE
    FCK --> VIE
    GTL --> CE
    GTA --> CE
    GOBS --> CE
    GAS --> AJE
    CPV --> PG
    GAA --> PG
    GARO --> PG
    GERO --> PG
```

---

## Module Dependency Map

Shows which engines and data sources each page module depends on.

```mermaid
graph TB
    MD[(mock-data.ts)]

    subgraph "Page Modules"
        IDX[Dashboard]
        INV[Inventory]
        AROM[ARO Module]
        EROM[ERO Module]
        PLNM[Plan Module]
        STLM[Settlement Module]
        ASRM[Assurance Module]
        RPTM[Financial Reporting]
        REGM[Regulatory Intelligence]
        RSKM[Risk Intelligence]
    end

    subgraph "AI Engines"
        CE[Copilot Engine]
        OCE[Classification Engine]
        AJE[ARO Justification Engine]
        SSE[Scenario Simulator Engine]
        VIE[Variance Intelligence Engine]
        RSE[Risk Scoring Engine]
        RIE[Regulatory Intelligence Engine]
    end

    MD --> IDX
    MD --> INV
    MD --> AROM
    MD --> EROM
    MD --> PLNM
    MD --> STLM
    MD --> ASRM
    MD --> RPTM

    RSE --> IDX
    RSE --> RSKM
    RIE --> REGM
    OCE --> AROM
    AJE --> AROM
    SSE --> PLNM
    VIE --> STLM
    CE --> IDX
    CE --> INV
    CE --> AROM
    CE --> EROM
    CE --> PLNM
    CE --> STLM
    CE --> ASRM
    CE --> RPTM

    MD --> CE
    MD --> OCE
    MD --> AJE
    MD --> SSE
    MD --> VIE
    MD --> RSE
    MD --> RIE
```

---

## Dashboard Data Flow

The executive dashboard aggregates data from multiple sources into a unified view.

```mermaid
graph LR
    subgraph "Data Sources"
        OBL[obligations]
        LTD[liabilityTrendData]
        FCD[forecastData]
        RA[recentActivity]
    end

    subgraph "Engine Calls"
        RSE["calculatePortfolioRisk()"]
    end

    subgraph "Dashboard Widgets"
        SC1[ARO StatCard]
        SC2[ERO StatCard]
        SC3[Active Count]
        SC4[Accretion StatCard]
        TC[Liability Trend Chart]
        FC[Forecast Chart]
        RW[Risk Score Widget]
        RAF[Recent Activity Feed]
    end

    OBL -->|getTotalLiability ARO| SC1
    OBL -->|getTotalLiability ERO| SC2
    OBL -->|filter Active| SC3
    OBL -->|getTotalAccretion| SC4
    LTD --> TC
    FCD --> FC
    RA --> RAF
    RSE --> RW

    RW --> PS[Portfolio Score 0-100]
    RW --> EV[Exposure Volatility]
    RW --> FCI[Forecast Confidence]
    RW --> TD[Top Drivers]
    RW --> RT[Risk Trend]
```

---

## Inventory Module — Hierarchy

The Inventory module provides a drill-down browser for the site-facility-asset-obligation hierarchy.

```mermaid
graph TD
    SL[Site List] --> SD[Site Detail Panel]
    SD --> SI[Site Info Card]
    SD --> SC[Site Contacts]
    SD --> SP[Permits List]
    SD --> FL[Facility List]

    FL --> FD[Facility Detail]
    FD --> AL[Asset List]

    AL --> AD[Asset Detail Card]
    AD --> ACI[Condition / Depreciation]
    AD --> AOL[Linked Obligations]

    AOL --> OD[Obligation Detail]
    OD --> EE[Environmental Exposures]

    style SL fill:#e0f2fe
    style SD fill:#e0f2fe
    style FD fill:#dbeafe
    style AD fill:#c7d2fe
    style OD fill:#fce7f3
```

---

## ARO Module — Processing Pipeline

The ARO module combines tracking, document classification, and narrative generation.

```mermaid
graph TB
    subgraph "Tab 1: ARO Tracking"
        ATE[aroTrackingEntries] --> TBL[ARO Register Table]
        TBL --> DET[Detail Panel]
        DET --> SCH["Accretion Schedule (generateAccretionSchedule)"]
        DET --> RVW[Review Notes]
    end

    subgraph "Tab 2: Obligation Classification"
        DOC[Select Document] --> CE["classifyDocument()"]
        CE --> SIG[Signal Extraction]
        CE --> LT[Liability Type]
        CE --> AL[ARO Likelihood]
        CE --> SF[Suggested Fields]
        CE --> MA[Missing Attributes]
        CE --> CS[Completeness Score]
        CE --> RF[Risk Flags]
        CE --> DM[Duplicate Matches]
        CE --> RA[Recommended Actions]
    end

    subgraph "Tab 3: ARO Justification"
        SEL[Select Obligation] --> NT[Select Narrative Type]
        NT --> GN["generateNarrative()"]
        GN -->|streaming| S1[Executive Summary]
        GN -->|streaming| S2[Calculation Rationale]
        GN -->|streaming| S3[Key Assumptions]
        GN -->|streaming| S4[Change-in-Liability]
        GN -->|streaming| S5[Disclosure Draft]
        GN -->|streaming| S6[Audit Trail Summary]
        GN -->|streaming| S7[Source References]
        GN --> CL[Audit Prep Checklist]
    end
```

---

## ERO Module — Remediation Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Assessment: Discovery / Regulatory Notice
    Assessment --> Planning: Characterization Complete
    Planning --> ActiveRemediation: Remediation Plan Approved
    ActiveRemediation --> Monitoring: Cleanup Goals Met
    Monitoring --> Closure: Regulatory Sign-off
    Closure --> [*]: Case Closed

    state Assessment {
        [*] --> PhaseI: Phase I ESA
        PhaseI --> PhaseII: Phase II ESA
        PhaseII --> Delineation: Contaminant Delineation
    }

    state ActiveRemediation {
        [*] --> Excavation: Soil Removal
        [*] --> PumpAndTreat: Groundwater Treatment
        [*] --> InSitu: In-Situ Treatment
    }

    state Monitoring {
        [*] --> Quarterly: Quarterly Sampling
        Quarterly --> Annual: Reduction Approved
        Annual --> SemiAnnual: If Exceedance
    }
```

---

## Plan Module — Forecasting Pipeline

```mermaid
graph TB
    subgraph "Input Data"
        OBL[obligations]
        FS[forecastScenarios - 3 scenarios]
        BI[budgetItems]
    end

    subgraph "Scenario Comparison"
        BC[Base Case - 2.5% inflation]
        HI[High Inflation - 4.0%]
        AS[Accelerated Settlement]
    end

    subgraph "Visualizations"
        LC[Liability Projection Chart]
        AC[Accretion Forecast]
        SB[Settlement Timeline]
        BV[Budget Variance Table]
    end

    subgraph "Scenario Simulator Engine"
        SI[SimulationInputs] --> RS["runSimulation()"]
        RS --> MC[Monte Carlo - 1000 iterations]
        RS --> SA[Sensitivity Analysis - 7 factors]
        RS --> TD[Tornado Diagram Data]
        RS --> DD[Distribution Data]
        RS --> NR[AI Narrative]
        RS --> SC[Scenario Comparison]
    end

    FS --> BC
    FS --> HI
    FS --> AS
    BC --> LC
    HI --> LC
    AS --> LC
    OBL --> AC
    FS --> SB
    BI --> BV

    SI -->|"inflationDelta, discountDelta, escalation, timeline, regulatory, scope"| RS
```

### Monte Carlo Simulation Detail

```mermaid
graph LR
    subgraph "Input Parameters"
        INF[Inflation Delta]
        DSC[Discount Delta]
        ESC[Escalation Factor]
        TML[Timeline Shift]
        REG[Regulatory Factor]
        SCP[Scope Expansion]
        PRB[Probability Adjustment]
    end

    subgraph "Monte Carlo Engine"
        direction TB
        GR[Gaussian Random Sampling]
        I1[Iteration 1]
        I2[Iteration 2]
        IN[Iteration 1000]
        SORT[Sort Results]
    end

    subgraph "Output Percentiles"
        P5[P5 - Best Case]
        P25[P25]
        P50[P50 - Median]
        P75[P75]
        P95[P95 - Worst Case]
        MN[Mean]
        SD[Std Deviation]
    end

    INF --> GR
    DSC --> GR
    ESC --> GR
    TML --> GR
    REG --> GR
    SCP --> GR

    GR --> I1
    GR --> I2
    GR --> IN
    I1 --> SORT
    I2 --> SORT
    IN --> SORT
    SORT --> P5
    SORT --> P25
    SORT --> P50
    SORT --> P75
    SORT --> P95
    SORT --> MN
    SORT --> SD
```

---

## Settlement Module — Variance Intelligence

```mermaid
graph TB
    subgraph "Settlement Data"
        SP[settlementProjects]
        CI[costItems]
        VP[vendorPayments]
        MS[milestones]
    end

    subgraph "Variance Intelligence Engine"
        APV["analyzeProjectVariance()"]
        APF["analyzePortfolio()"]
        GVN["generateVarianceNarrative()"]
        GPN["generatePortfolioNarrative()"]
        GRS["generateRecalibrationSuggestions()"]
    end

    subgraph "Analysis Pipeline"
        ACI[Analyze Cost Items]
        AV[Analyze Vendors]
        DA[Detect Anomalies]
        CD[Classify Drivers]
        PW[Predictive Warning]
        SEV[Severity Rating]
    end

    subgraph "Anomaly Types"
        CSP[Cost Spike - over 15% budget]
        VA[Vendor Anomaly - over 90% invoiced]
        SCC[Scope Creep - spend/completion over 1.25x]
    end

    subgraph "Driver Categories"
        VCE[Vendor Cost Escalation]
        SE[Scope Expansion]
        TLD[Timeline Delay]
        IE[Inflation Escalation]
        EE[Estimation Error]
    end

    SP --> APV
    APV --> ACI
    APV --> AV
    ACI --> DA
    AV --> DA
    DA --> CSP
    DA --> VA
    DA --> SCC
    DA --> CD
    CD --> VCE
    CD --> SE
    CD --> TLD
    CD --> IE
    CD --> EE
    CD --> PW
    PW --> SEV
    APV --> GVN
    APF --> GPN
    APF --> GRS
```

---

## Assurance Module — Audit Flow

```mermaid
graph LR
    subgraph "Audit Components"
        AT[Audit Trail]
        IC[Internal Controls]
        DI[Disclosure Items]
    end

    subgraph "Audit Trail"
        ATE1[Liability Revision]
        ATE2[Status Change]
        ATE3[Cost Update]
        ATE4[Review Completion]
    end

    subgraph "Control Status"
        EF[Effective]
        NI[Needs Improvement]
        DF[Deficient]
    end

    subgraph "Disclosure Standards"
        ASC410[ASC 410-20 - ARO]
        ASC450[ASC 450-20 - ERO]
        SECSK[SEC Reg S-K]
    end

    subgraph "Disclosure Status"
        CP[Complete]
        IP[In Progress]
        NS[Not Started]
    end

    AT --> ATE1
    AT --> ATE2
    AT --> ATE3
    AT --> ATE4

    IC --> EF
    IC --> NI
    IC --> DF

    DI --> ASC410
    DI --> ASC450
    DI --> SECSK

    ASC410 --> CP
    ASC410 --> IP
    ASC450 --> IP
    ASC450 --> NS
    SECSK --> NS
```

---

## Risk Intelligence — Scoring Pipeline

```mermaid
graph TB
    subgraph "Input Data"
        OBL[obligations]
        SITES[sites]
        EXP[environmentalExposures]
        SP[settlementProjects]
    end

    subgraph "Per-Site Scoring"
        direction TB
        S1["scoreDataCompleteness()"]
        S2["scoreCostEscalation()"]
        S3["scoreRegulatory()"]
        S4["scoreTimeline()"]
        S5["scoreSettlement()"]
    end

    subgraph "Weights - Configurable"
        W1["Data: 20%"]
        W2["Cost: 25%"]
        W3["Regulatory: 20%"]
        W4["Timeline: 20%"]
        W5["Settlement: 15%"]
    end

    subgraph "Portfolio Aggregation"
        CSR["calculateSiteRiskScore() - per site"]
        CPR["calculatePortfolioRisk()"]
        WAV[Weighted Average by Exposure]
        VOL[Exposure Volatility - Std Dev]
        FCI[Forecast Confidence]
        NRR["generateRiskNarrative()"]
    end

    subgraph "Output"
        PS[Portfolio Score 0-100]
        PL[Risk Level]
        PT[Risk Trend]
        SS[Site Scores Array]
        TD[Top Drivers]
        TH[Trend History]
        NR[AI Narrative - 5 sections]
    end

    OBL --> S1
    OBL --> S2
    OBL --> S4
    OBL --> S5
    SITES --> S3
    EXP --> S3
    SP --> S2
    SP --> S5

    S1 --- W1
    S2 --- W2
    S3 --- W3
    S4 --- W4
    S5 --- W5

    W1 --> CSR
    W2 --> CSR
    W3 --> CSR
    W4 --> CSR
    W5 --> CSR

    CSR --> CPR
    CPR --> WAV
    CPR --> VOL
    CPR --> FCI
    CPR --> NRR

    WAV --> PS
    PS --> PL
    CPR --> PT
    CPR --> SS
    CPR --> TD
    CPR --> TH
    NRR --> NR
```

### Risk Level Classification

```mermaid
graph LR
    subgraph "Score Ranges"
        R1["0-30: Low"]
        R2["31-60: Moderate"]
        R3["61-80: High"]
        R4["81-100: Critical"]
    end

    subgraph "Trend Detection"
        IG["avgGrowth > 15% = Deteriorating"]
        ST["5-15% = Stable"]
        IM["< 5% = Improving"]
    end

    R1 -.- G[Green]
    R2 -.- Y[Yellow]
    R3 -.- O[Orange]
    R4 -.- R[Red]
```

---

## Regulatory Intelligence — Impact Analysis

```mermaid
graph TB
    subgraph "Regulatory Feed"
        RU1[REG-001: TX GW Monitoring]
        RU2[REG-002: NM NORM Disposal]
        RU3[REG-003: Federal Pipeline]
        RU4[REG-004: PA TCE/PCE MCLs]
        RU5[REG-005: LA Marine Terminal]
        RU6[REG-006: Federal Injection Wells]
    end

    subgraph "Impact Analysis Pipeline"
        MS["matchSites() - Geography Mapping"]
        MO["matchObligations() - Obligation Filtering"]
        EE["estimateExposure() - Heuristic Multipliers"]
        SI["scoreImpact() - 0-100 Composite"]
        UR[Urgency Classification]
    end

    subgraph "Exposure Multipliers"
        ENF["Enforcement: 5-20%"]
        NR["New Rule: 3-12%"]
        AMD["Amendment: 2-9%"]
        GD["Guidance: 1-6%"]
        PR["Proposed Rule: 1-5%"]
    end

    subgraph "Output"
        IA[Impact Score]
        ER[Exposure Risk Level]
        UL[Urgency Level]
        IS[Impacted Sites]
        IO[Impacted Obligations]
        EX[Exposure Estimate - Low/Base/High]
        FA[Forecast Assumptions Affected]
        RN["generateRegulatoryNarrative()"]
    end

    RU1 --> MS
    RU2 --> MS
    RU3 --> MS
    MS --> MO
    MO --> EE
    EE --> ENF
    EE --> NR
    EE --> AMD
    EE --> GD
    EE --> PR
    EE --> SI
    SI --> UR

    SI --> IA
    SI --> ER
    UR --> UL
    MS --> IS
    MO --> IO
    EE --> EX
    MO --> FA
    IA --> RN
```

### Geography-to-Site Mapping

```mermaid
graph LR
    TX[Texas] --> S001[Eagle Ford Basin]
    NM[New Mexico] --> S002[Permian Basin]
    PA[Pennsylvania] --> S003[Appalachian Basin]
    LA[Louisiana] --> S004[Gulf Coast Terminal]
    FED[Federal] --> S001
    FED --> S002
    FED --> S003
    FED --> S004
```

---

## AI Copilot — Query Resolution

```mermaid
graph TB
    subgraph "User Interaction"
        UQ[User Query]
        VP[Current View - portfolio/site/project/aro]
        CT[Current Route Context]
    end

    subgraph "Context Resolution"
        GCR["getContextForRoute()"]
        GSP["getSuggestedPrompts()"]
    end

    subgraph "Response Engine"
        GCR2["generateCopilotResponse()"]
        BR["buildResponse() - Pattern Matching"]
    end

    subgraph "Pattern Matchers - 15+"
        PM1[liability + increase]
        PM2[highest + risk]
        PM3[top 5 + exposure]
        PM4[total + liability]
        PM5[assumption + aro]
        PM6[variance + forecast]
        PM7[over budget]
        PM8[vendor + payment]
        PM9[deficient / control]
        PM10[risk score]
        PM11[rollforward / asc 410]
        PM12[Default Handler]
    end

    subgraph "Response Format"
        ES[Executive Summary]
        KD[Key Drivers]
        FI[Financial Impact]
        RI[Risk Implication]
        RA[Recommended Action]
    end

    subgraph "Streaming Output"
        WBW[Word-by-Word Emission]
        DLY["15-40ms delay per word"]
    end

    UQ --> GCR2
    VP --> GCR2
    CT --> GCR

    GCR --> GSP
    GCR2 --> BR
    BR --> PM1
    BR --> PM2
    BR --> PM3
    BR --> PM4
    BR --> PM5
    BR --> PM6
    BR --> PM7
    BR --> PM8
    BR --> PM9
    BR --> PM10
    BR --> PM11
    BR --> PM12

    PM1 --> ES
    ES --> KD
    KD --> FI
    FI --> RI
    RI --> RA

    RA --> WBW
    WBW --> DLY
```

---

## Obligation Classification — Document Pipeline

```mermaid
graph TB
    subgraph "Document Selection"
        DS[Select from 5 simulated documents]
    end

    subgraph "Internal Dictionaries"
        SPT[SIGNAL_PATTERNS - 7 signal types with keywords]
        DP[DOCUMENT_PROFILES - 6 profiles with liability mapping]
        SD[SIMULATED_DOCUMENTS - Pre-authored signal extractions]
    end

    subgraph "Classification Pipeline"
        SE[Signal Extraction with confidence jitter]
        LC[Liability Classification]
        ARL[ARO Likelihood Scoring]
        SFF[Suggested Field Population]
        MAD[Missing Attribute Detection]
        CSS[Completeness Scoring]
        RFD[Risk Flag Detection]
        DDD[Duplicate Detection vs existing obligations]
        RAG[Recommended Action Generation]
    end

    subgraph "Output"
        CR[ClassificationResult]
    end

    DS --> SD
    SD --> SE
    SPT --> SE
    DP --> LC
    DP --> ARL
    DP --> SFF
    SE --> CR
    LC --> CR
    ARL --> CR
    SFF --> CR
    MAD --> CR
    CSS --> CR
    RFD --> CR
    DDD --> CR
    RAG --> CR
```

---

## Scenario Simulator — Monte Carlo Pipeline

```mermaid
graph TB
    subgraph "User Inputs - 7 Parameters"
        P1[Inflation Delta]
        P2[Discount Delta]
        P3[Escalation Factor]
        P4[Timeline Shift]
        P5[Regulatory Factor]
        P6[Probability Adjustment]
        P7[Scope Expansion]
    end

    subgraph "Scope Filter"
        LVL[Level: portfolio / site / project / aro]
        FO[Filtered Obligations]
    end

    subgraph "Deterministic Calculation"
        BL[Baseline Liability]
        IE[Inflation Effect]
        DE[Discount Effect]
        AL["Adjusted = Base * Inflation * Discount * Escalation * Regulatory * Scope * Probability"]
    end

    subgraph "Monte Carlo - 1000 iterations"
        GS[Gaussian Sampling per parameter]
        CF[Compound Factor Calculation]
        SR[Sort Results]
        PC[Percentile Calculation - P5 P25 P50 P75 P95]
    end

    subgraph "Sensitivity Analysis"
        F1[Inflation Rate Impact]
        F2[Discount Rate Impact]
        F3[Cost Escalation Impact]
        F4[Timeline Extension Impact]
        F5[Regulatory Tightening Impact]
        F6[Probability Weighting Impact]
        F7[Scope Expansion Impact]
        RNK[Rank by Absolute Dollar Impact]
    end

    subgraph "AI Narrative Generation"
        EXSUM[Executive Summary]
        PDRV[Primary Drivers Ranked]
        SNSR[Sensitivity Ranking]
        RISK[Risk Implications]
        ACTS[Recommended Actions]
    end

    P1 --> LVL
    P2 --> LVL
    P3 --> LVL
    P4 --> LVL
    P5 --> LVL
    P6 --> LVL
    P7 --> LVL
    LVL --> FO
    FO --> BL

    BL --> IE
    BL --> DE
    IE --> AL
    DE --> AL

    BL --> GS
    GS --> CF
    CF --> SR
    SR --> PC

    BL --> F1
    BL --> F2
    BL --> F3
    BL --> F4
    BL --> F5
    BL --> F6
    BL --> F7
    F1 --> RNK
    F2 --> RNK
    F3 --> RNK

    AL --> EXSUM
    PC --> EXSUM
    RNK --> SNSR
    EXSUM --> PDRV
    PDRV --> RISK
    RISK --> ACTS
```

### Reverse Scenario Solver

```mermaid
graph LR
    TGT["Target: +15% liability change"] --> RSE["solveReverseScenario()"]
    PAR["Parameter: inflation / discount / timeline / escalation"] --> RSE
    RSE --> VAL["Required parameter value"]
    RSE --> LBL["Human-readable explanation"]
```

---

## Cross-Module Data Dependencies

Shows how data flows between feature modules through shared data and engine outputs.

```mermaid
graph TB
    subgraph "Core Data"
        OBL[obligations]
        SITES[sites]
        EXPO[exposures]
    end

    subgraph "Inventory Module"
        INV_H[Site/Facility/Asset Hierarchy]
        INV_O[Obligation Linkage]
    end

    subgraph "ARO Module"
        ARO_T[ARO Tracking]
        ARO_C[Classification]
        ARO_J[Justification Narratives]
    end

    subgraph "Plan Module"
        PLN_F[Forecast Scenarios]
        PLN_B[Budget Items]
        PLN_S[Scenario Simulator]
    end

    subgraph "Settlement Module"
        STL_P[Settlement Projects]
        STL_V[Variance Intelligence]
    end

    subgraph "Assurance Module"
        ASR_A[Audit Trail]
        ASR_C[Controls]
        ASR_D[Disclosures]
    end

    subgraph "Risk Intelligence"
        RSK_S[Risk Scoring Engine]
    end

    subgraph "Regulatory Intelligence"
        REG_U[Regulatory Updates]
        REG_A[Impact Analysis]
    end

    OBL --> INV_O
    OBL --> ARO_T
    OBL --> PLN_F
    OBL --> STL_P
    OBL --> RSK_S
    OBL --> REG_A
    OBL --> ARO_J

    SITES --> INV_H
    SITES --> RSK_S
    SITES --> REG_A

    EXPO --> RSK_S

    PLN_B --> VIE_REF[Variance Engine References]
    STL_P --> RSK_S
    STL_P --> STL_V

    ASR_A --> ARO_J
    ASR_D --> ARO_J

    PLN_F --> ARO_J
    PLN_F --> PLN_S

    REG_A -.->|"Forecast assumptions affected"| PLN_F
    STL_V -.->|"Recalibration suggestions"| PLN_F
    RSK_S -.->|"Risk score widget"| IDX_DASH[Dashboard]
    ARO_J -.->|"Disclosure drafts"| ASR_D
```

---

## Component Hierarchy

```mermaid
graph TD
    APP[App.tsx]
    APP --> QCP[QueryClientProvider]
    QCP --> TTP[TooltipProvider]
    TTP --> TST[Toaster]
    TTP --> SON[Sonner]
    TTP --> BR[BrowserRouter]

    BR --> RTS[Routes]
    RTS --> ALP[AppLayout]
    RTS --> NF[NotFound]

    ALP --> ASB[AppSidebar]
    ALP --> OTL[Outlet]
    ALP --> CFB[CopilotFAB]
    CFB --> CPL[CopilotPanel]

    OTL --> PG[Page Components]

    subgraph "Shared Tab Components"
        OCT[ObligationClassificationTab]
        AJT[AROJustificationTab]
        SST[ScenarioSimulatorTab]
        VIT[VarianceIntelligenceTab]
    end

    PG --> OCT
    PG --> AJT
    PG --> SST
    PG --> VIT

    subgraph "Reusable Components"
        STC[StatCard]
        NVL[NavLink]
    end

    PG --> STC
    ASB --> NVL
```

---

## Design System Architecture

```mermaid
graph TB
    subgraph "CSS Layer"
        IDX_CSS["index.css - CSS Custom Properties (HSL)"]
        TW_CFG["tailwind.config.ts - Token Mapping"]
    end

    subgraph "Semantic Tokens"
        BG["--background / --foreground"]
        PR["--primary / --primary-foreground"]
        SC["--secondary / --secondary-foreground"]
        MT["--muted / --muted-foreground"]
        AC["--accent / --accent-foreground"]
        DS["--destructive"]
        BD["--border / --input / --ring"]
        CD["--card / --card-foreground"]
    end

    subgraph "Component Library"
        SHAD["shadcn/ui - 60+ components"]
        CVA["class-variance-authority - Variants"]
        TWM["tailwind-merge - Class dedup"]
        CLSX["clsx - Conditional classes"]
    end

    subgraph "Utility"
        CN["cn() - utils.ts"]
    end

    IDX_CSS --> BG
    IDX_CSS --> PR
    IDX_CSS --> SC
    IDX_CSS --> MT
    IDX_CSS --> AC
    IDX_CSS --> DS
    IDX_CSS --> BD
    IDX_CSS --> CD

    TW_CFG --> SHAD
    BG --> SHAD
    PR --> SHAD

    CLSX --> CN
    TWM --> CN
    CN --> SHAD
    CVA --> SHAD
```

### Theme Modes

```mermaid
graph LR
    subgraph "Light Mode"
        LR1[":root { }"]
    end
    subgraph "Dark Mode"
        DR1[".dark { }"]
    end

    LR1 -->|"Toggle via next-themes"| DR1
    DR1 -->|"Toggle via next-themes"| LR1

    LR1 --> TC1["All semantic tokens redefined"]
    DR1 --> TC2["All semantic tokens redefined"]
```

---

## Key Design Decisions

### Why Client-Side Only?
- **No backend dependency**: Runs entirely in the browser
- **Instant feedback**: All AI engines respond synchronously (with simulated delays for realism)
- **Portable**: Deploy as static files to any CDN

### Why Simulated RAG?
- **Deterministic outputs**: Pattern-matched queries produce consistent, auditable responses
- **Domain expertise**: Pre-authored CFO-grade narratives ensure quality without LLM variance
- **No API keys**: No external AI service required
- **Controlled randomization**: `jitter()` and `gaussianRandom()` add realism without unpredictability

### Why Single Data File?
- **Single source of truth**: All modules read from the same `mock-data.ts`
- **Referential integrity**: Obligation → Site → Facility → Asset relationships are always consistent
- **Helper functions**: Centralized aggregation logic prevents duplication

### Why Separate Engine Files?
- **Separation of concerns**: Each engine is independently testable
- **Module isolation**: Engines import only from `mock-data.ts`, never from each other
- **Extensibility**: New engines can be added without modifying existing ones

---

*Architecture documentation for EOM Platform v1.0 — February 2026*
