

# Environmental Obligation Management (EOM) Platform

A personal project for managing Asset Retirement Obligations (ARO), Environmental Remediation Obligations (ERO), and financial reporting/liability calculations — styled similar to ENFOS, using mock data.

---

## Pages & Navigation

### 1. **Dashboard (Home)**
- Summary cards showing total ARO liabilities, ERO liabilities, and combined financial exposure
- Charts: liability trend over time, obligations by status, upcoming settlement milestones
- Recent activity feed (newly added obligations, status changes)
- Quick-action buttons to add new ARO or ERO records

### 2. **Inventory Module**
- **Asset/Site Hierarchy** — tree view of sites, facilities, and assets with obligation counts
- **Obligation Registry** — searchable, filterable table of all ARO and ERO obligations with columns for: ID, name, type (ARO/ERO), site, status, estimated liability, accretion, target date
- **Obligation Detail View** — clicking a record opens a detail panel showing full information, cost estimates, timeline, and associated documents
- **Add/Edit Obligation Form** — form to create or update ARO/ERO records with fields for asset info, obligation type, initial estimate, discount rate, expected settlement date

### 3. **ARO Module**
- **ARO Summary** — cards showing total ARO liability, current-year accretion expense, and revision impacts
- **ARO Register** — table of all asset retirement obligations with fair value, accretion, and retirement date
- **Liability Calculator** — interactive tool to calculate present value of ARO using discount rate, expected cash flows, and settlement timeline
- **Accretion Schedule** — table/chart showing year-by-year accretion expense buildup for each obligation

### 4. **ERO Module**
- **ERO Summary** — cards for total ERO liability, remediation progress, and compliance status
- **ERO Register** — table of environmental remediation obligations with estimated cost, remediation phase, and regulatory deadlines
- **Remediation Tracker** — timeline/progress view of remediation activities per obligation
- **Cost Estimation Tool** — form to estimate remediation costs based on contaminant type, area, and method

### 5. **Financial Reporting & Liability**
- **Liability Overview** — combined ARO + ERO liability dashboard with breakdowns by type, site, and time period
- **Present Value Calculations** — summary of discount rates applied, fair value measurements, and revision history
- **Reporting Tables** — formatted tables matching common financial disclosure formats (ASC 410 for ARO, ASC 450 for ERO)
- **Forecast View** — projected liability growth over 5/10/20 year horizons with charts

### 6. **Settings**
- Configure default discount rates, inflation assumptions, and reporting currency
- Manage site/facility hierarchy templates

---

## Design & Layout
- **ENFOS-inspired** professional look: dark sidebar navigation, clean white content area, blue/teal accent colors
- Sidebar with icons for each module (Dashboard, Inventory, ARO, ERO, Financial Reporting, Settings)
- Data-dense tables with sorting, filtering, and search
- Cards and charts using recharts for financial visualizations
- Responsive but desktop-first (this is a data-heavy tool)

---

## Data Approach
- All data is **mock/hardcoded** — realistic sample ARO and ERO records with calculated liabilities
- Mock data includes ~10-15 obligations across multiple sites with varying statuses and timelines
- Calculations (present value, accretion) are done client-side with real formulas

