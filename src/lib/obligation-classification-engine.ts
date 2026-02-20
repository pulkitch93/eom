// ============================================================
// Intelligent Obligation Classification Engine
// Simulated AI: structured extraction, classification, scoring
// ============================================================

import { obligations, sites, type Obligation } from "@/data/mock-data";

// ---------- Types ----------

export interface ObligationSignal {
  id: string;
  signalType: SignalType;
  text: string;
  confidence: number; // 0–100
  pageNumber: number;
  paragraphIndex: number;
}

export type SignalType =
  | "Legal Obligation"
  | "Regulatory Citation"
  | "Remediation Requirement"
  | "Monitoring Mandate"
  | "Decommissioning Clause"
  | "Cleanup Trigger"
  | "Compliance Deadline";

export type LiabilityType =
  | "ARO"
  | "Environmental Remediation"
  | "Monitoring Obligation"
  | "Contingent Liability"
  | "Compliance Obligation"
  | "Decommissioning Requirement";

export type AROCategory =
  | "Asset-Linked Obligation"
  | "Facility Closure Obligation"
  | "Decommissioning Cost"
  | "Long-Term Monitoring Obligation";

export interface SuggestedFields {
  obligationType: string;
  regulatoryJurisdiction: string;
  remediationType: string;
  environmentalCategory: string;
  projectedTimeHorizon: string;
  potentialCostIndicator: string;
}

export interface MissingAttribute {
  field: string;
  severity: "Critical" | "High" | "Medium";
  recommendation: string;
}

export interface DuplicateMatch {
  obligationId: string;
  obligationName: string;
  siteName: string;
  similarity: number; // 0–100
}

export interface ClassificationResult {
  documentName: string;
  documentType: string;
  uploadedAt: string;
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

// ---------- Signal dictionaries ----------

const SIGNAL_PATTERNS: { type: SignalType; keywords: string[]; baseConfidence: number }[] = [
  { type: "Legal Obligation", keywords: ["shall", "obligated", "required to", "must comply", "legally binding", "consent decree"], baseConfidence: 88 },
  { type: "Regulatory Citation", keywords: ["RCRA", "CERCLA", "Clean Water Act", "40 CFR", "TCEQ", "EPA", "state regulation", "permit condition"], baseConfidence: 92 },
  { type: "Remediation Requirement", keywords: ["remediation", "cleanup", "soil removal", "groundwater treatment", "excavation", "pump-and-treat"], baseConfidence: 85 },
  { type: "Monitoring Mandate", keywords: ["monitoring", "sampling", "quarterly reporting", "annual inspection", "monitoring well"], baseConfidence: 80 },
  { type: "Decommissioning Clause", keywords: ["decommission", "dismantle", "plug and abandon", "site restoration", "asset retirement"], baseConfidence: 90 },
  { type: "Cleanup Trigger", keywords: ["release", "spill", "contamination detected", "exceedance", "corrective action", "response action"], baseConfidence: 83 },
  { type: "Compliance Deadline", keywords: ["deadline", "by no later than", "compliance date", "effective date", "within 180 days"], baseConfidence: 86 },
];

const DOCUMENT_PROFILES: Record<string, { liabilityType: LiabilityType; aroLikelihood: number; aroCategory: AROCategory | null; envCategory: string; remType: string; jurisdiction: string; timeHorizon: string; costRange: string }> = {
  "regulatory-notice": {
    liabilityType: "Environmental Remediation", aroLikelihood: 25, aroCategory: null,
    envCategory: "Soil & Groundwater", remType: "Corrective Action", jurisdiction: "State Environmental Agency",
    timeHorizon: "3–7 years", costRange: "$500K – $2.5M",
  },
  "consent-decree": {
    liabilityType: "Compliance Obligation", aroLikelihood: 35, aroCategory: null,
    envCategory: "Multi-Media (soil, groundwater, air)", remType: "Consent-Ordered Remediation", jurisdiction: "Federal / State Joint",
    timeHorizon: "5–15 years", costRange: "$1M – $10M",
  },
  "decommission-plan": {
    liabilityType: "Decommissioning Requirement", aroLikelihood: 95, aroCategory: "Decommissioning Cost",
    envCategory: "Facility Infrastructure", remType: "Full Decommissioning", jurisdiction: "State Oil & Gas Commission",
    timeHorizon: "10–25 years", costRange: "$800K – $5M",
  },
  "environmental-assessment": {
    liabilityType: "Contingent Liability", aroLikelihood: 40, aroCategory: null,
    envCategory: "Groundwater", remType: "Assessment / Characterization", jurisdiction: "State DEP",
    timeHorizon: "2–5 years", costRange: "$200K – $1.5M",
  },
  "contract-lease": {
    liabilityType: "ARO", aroLikelihood: 82, aroCategory: "Asset-Linked Obligation",
    envCategory: "Leased Infrastructure", remType: "Lease-End Restoration", jurisdiction: "Contractual / State",
    timeHorizon: "Lease term (5–20 years)", costRange: "$300K – $3M",
  },
  "monitoring-report": {
    liabilityType: "Monitoring Obligation", aroLikelihood: 15, aroCategory: "Long-Term Monitoring Obligation",
    envCategory: "Groundwater / Surface Water", remType: "Long-Term Monitoring", jurisdiction: "State Environmental Agency",
    timeHorizon: "5–30 years", costRange: "$50K – $500K/year",
  },
};

// ---------- Simulated document content ----------

const SIMULATED_DOCUMENTS: Record<string, { type: string; profile: string; signals: { type: SignalType; text: string; page: number; para: number }[] }> = {
  "EPA_Notice_EagleFord_2025.pdf": {
    type: "Regulatory Notice", profile: "regulatory-notice",
    signals: [
      { type: "Regulatory Citation", text: "Pursuant to 40 CFR § 264.101, corrective action is required for all solid waste management units (SWMUs) at the facility.", page: 1, para: 3 },
      { type: "Remediation Requirement", text: "The facility shall implement soil removal and off-site disposal for contaminated soils exceeding 10 mg/kg TPH in the tank farm area.", page: 2, para: 1 },
      { type: "Compliance Deadline", text: "Corrective action plan must be submitted within 180 days of receipt of this notice.", page: 3, para: 5 },
      { type: "Monitoring Mandate", text: "Quarterly groundwater monitoring shall continue at all 12 monitoring wells for a minimum of 5 years.", page: 4, para: 2 },
      { type: "Cleanup Trigger", text: "BTEX concentrations exceeding MCLs were detected in monitoring wells MW-3 and MW-7 during the October 2025 sampling event.", page: 2, para: 4 },
    ],
  },
  "Decommission_Plan_PermianBasin.pdf": {
    type: "Decommission Plan", profile: "decommission-plan",
    signals: [
      { type: "Decommissioning Clause", text: "Upon cessation of operations, the operator shall plug and abandon all wells in accordance with NMOCD Rule 19.15.25.9 NMAC.", page: 1, para: 2 },
      { type: "Legal Obligation", text: "The operator is legally obligated to restore the surface to pre-operational conditions as specified in the surface use agreement.", page: 2, para: 1 },
      { type: "Remediation Requirement", text: "All produced water impacted soils shall be excavated and disposed at a permitted facility.", page: 3, para: 3 },
      { type: "Compliance Deadline", text: "Decommissioning activities must commence within 12 months of the final production date.", page: 4, para: 1 },
      { type: "Regulatory Citation", text: "Per NMOCD Order No. R-14753, financial assurance in the amount of $1,200,000 shall be maintained.", page: 5, para: 2 },
      { type: "Monitoring Mandate", text: "Post-closure groundwater monitoring for a period of 30 years at designated monitoring points.", page: 6, para: 4 },
    ],
  },
  "Consent_Decree_GulfCoast.pdf": {
    type: "Consent Decree", profile: "consent-decree",
    signals: [
      { type: "Legal Obligation", text: "Defendant shall perform and complete all response actions required by this Consent Decree.", page: 1, para: 1 },
      { type: "Regulatory Citation", text: "This action is brought pursuant to Sections 106(a) and 107(a) of CERCLA, 42 U.S.C. §§ 9606(a) and 9607(a).", page: 1, para: 3 },
      { type: "Remediation Requirement", text: "Remedial action shall include excavation of 15,000 cubic yards of petroleum-impacted soil and installation of a pump-and-treat system.", page: 4, para: 2 },
      { type: "Cleanup Trigger", text: "Free-phase petroleum product was identified at a thickness of 0.5 inches in monitoring well MW-12.", page: 3, para: 5 },
      { type: "Compliance Deadline", text: "Defendant shall submit the Remedial Design within 120 days and achieve construction completion within 24 months.", page: 5, para: 1 },
    ],
  },
  "Lease_Agreement_Appalachian.docx": {
    type: "Contract / Lease", profile: "contract-lease",
    signals: [
      { type: "Legal Obligation", text: "Lessee shall, upon termination, restore the premises to a condition reasonably similar to its condition prior to commencement.", page: 8, para: 2 },
      { type: "Decommissioning Clause", text: "All structures, equipment, and improvements shall be removed at Lessee's sole expense within 180 days of lease termination.", page: 8, para: 4 },
      { type: "Remediation Requirement", text: "Any environmental contamination caused by Lessee's operations shall be remediated to applicable state cleanup standards.", page: 9, para: 1 },
    ],
  },
  "GW_Monitoring_Q4_2025.csv": {
    type: "Monitoring Report", profile: "monitoring-report",
    signals: [
      { type: "Monitoring Mandate", text: "Quarterly sampling of 12 monitoring wells per approved Sampling and Analysis Plan (SAP).", page: 1, para: 1 },
      { type: "Cleanup Trigger", text: "TCE concentration at MW-5 measured at 12.3 µg/L, exceeding the MCL of 5 µg/L.", page: 1, para: 8 },
      { type: "Regulatory Citation", text: "Monitoring conducted in accordance with PA DEP Chapter 245 requirements.", page: 1, para: 2 },
    ],
  },
};

// ---------- Engine ----------

function jitter(base: number, range: number = 8): number {
  return Math.min(100, Math.max(0, base + Math.floor(Math.random() * range * 2) - range));
}

export function getAvailableDocuments(): string[] {
  return Object.keys(SIMULATED_DOCUMENTS);
}

export function classifyDocument(filename: string): ClassificationResult {
  const doc = SIMULATED_DOCUMENTS[filename];
  if (!doc) {
    return createEmptyResult(filename);
  }

  const profile = DOCUMENT_PROFILES[doc.profile];

  // Build signals with confidence jitter
  const signals: ObligationSignal[] = doc.signals.map((s, i) => {
    const pattern = SIGNAL_PATTERNS.find(p => p.type === s.type);
    return {
      id: `SIG-${i + 1}`,
      signalType: s.type,
      text: s.text,
      confidence: jitter(pattern?.baseConfidence ?? 75),
      pageNumber: s.page,
      paragraphIndex: s.para,
    };
  });

  const liabilityConfidence = jitter(
    profile.liabilityType === "ARO" || profile.liabilityType === "Decommissioning Requirement" ? 89 : 78
  );

  // Missing attributes
  const missingAttributes: MissingAttribute[] = [];
  if (profile.aroLikelihood > 60) {
    missingAttributes.push(
      { field: "Discount Rate", severity: "Critical", recommendation: "Apply current risk-free rate per ASC 410-20 guidance." },
      { field: "Asset Linkage", severity: "High", recommendation: "Associate obligation with specific asset in hierarchy." },
    );
  }
  missingAttributes.push(
    { field: "Responsible Party", severity: "Medium", recommendation: "Assign environmental manager or site lead." },
    { field: "Cost Basis Documentation", severity: "High", recommendation: "Obtain third-party cost estimate or engineering study." },
  );
  if (profile.liabilityType !== "Monitoring Obligation") {
    missingAttributes.push(
      { field: "Timeline Assumptions", severity: "Medium", recommendation: "Define expected start and completion dates." },
    );
  }

  const completenessScore = Math.max(20, 100 - missingAttributes.length * 16 + jitter(0, 5));

  // Risk flags
  const riskFlags: string[] = [];
  if (profile.aroLikelihood > 70) riskFlags.push("High Regulatory Risk");
  if (profile.costRange.includes("$1M") || profile.costRange.includes("$5M") || profile.costRange.includes("$10M")) riskFlags.push("Financial Exposure Indicator");
  if (parseInt(profile.timeHorizon) > 10 || profile.timeHorizon.includes("25") || profile.timeHorizon.includes("30")) riskFlags.push("Long-Term Liability Flag");
  if (profile.jurisdiction.includes("Federal") || profile.jurisdiction.includes("Joint")) riskFlags.push("Multi-Jurisdiction Impact");

  // Duplicate detection
  const duplicateMatches: DuplicateMatch[] = [];
  const envCatLower = profile.envCategory.toLowerCase();
  for (const obl of obligations) {
    const desc = obl.description.toLowerCase();
    if (
      (envCatLower.includes("soil") && desc.includes("soil")) ||
      (envCatLower.includes("groundwater") && desc.includes("groundwater")) ||
      (envCatLower.includes("decommission") && desc.includes("decommission")) ||
      (envCatLower.includes("infrastructure") && (desc.includes("dismantl") || desc.includes("removal")))
    ) {
      duplicateMatches.push({
        obligationId: obl.id,
        obligationName: obl.name,
        siteName: obl.siteName,
        similarity: jitter(72, 12),
      });
    }
  }

  // Recommended actions
  const recommendedActions: string[] = [];
  if (profile.aroLikelihood > 60) recommendedActions.push("Create new ARO record in Inventory");
  recommendedActions.push("Link to existing asset in site hierarchy");
  recommendedActions.push("Request third-party cost estimate");
  if (profile.liabilityType === "Environmental Remediation" || profile.liabilityType === "Compliance Obligation") {
    recommendedActions.push("Escalate to Environmental Manager for review");
  }
  recommendedActions.push("Send to Assurance module for audit documentation");

  return {
    documentName: filename,
    documentType: doc.type,
    uploadedAt: new Date().toISOString(),
    signals,
    liabilityType: profile.liabilityType,
    liabilityConfidence,
    aroLikelihood: jitter(profile.aroLikelihood, 5),
    aroCategory: profile.aroCategory,
    suggestedFields: {
      obligationType: profile.liabilityType,
      regulatoryJurisdiction: profile.jurisdiction,
      remediationType: profile.remType,
      environmentalCategory: profile.envCategory,
      projectedTimeHorizon: profile.timeHorizon,
      potentialCostIndicator: profile.costRange,
    },
    missingAttributes,
    completenessScore,
    riskFlags,
    duplicateMatches: duplicateMatches.slice(0, 3),
    recommendedActions,
  };
}

function createEmptyResult(filename: string): ClassificationResult {
  return {
    documentName: filename,
    documentType: "Unknown",
    uploadedAt: new Date().toISOString(),
    signals: [],
    liabilityType: "Contingent Liability",
    liabilityConfidence: 0,
    aroLikelihood: 0,
    aroCategory: null,
    suggestedFields: {
      obligationType: "Data unavailable – manual review required.",
      regulatoryJurisdiction: "Data unavailable – manual review required.",
      remediationType: "Data unavailable – manual review required.",
      environmentalCategory: "Data unavailable – manual review required.",
      projectedTimeHorizon: "Data unavailable – manual review required.",
      potentialCostIndicator: "Data unavailable – manual review required.",
    },
    missingAttributes: [
      { field: "All Fields", severity: "Critical", recommendation: "Document could not be parsed. Upload a supported format." },
    ],
    completenessScore: 0,
    riskFlags: [],
    duplicateMatches: [],
    recommendedActions: ["Upload a supported document format (PDF, DOCX, CSV)"],
  };
}
