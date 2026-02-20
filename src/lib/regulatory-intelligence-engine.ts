// ============================================================
// Regulatory Change Monitor – Intelligence Engine
// Structured regulatory impact analysis, exposure estimation,
// site/obligation mapping, risk scoring, and AI narrative
// ============================================================

import {
  sites,
  obligations,
  formatCurrency,
  formatCurrencyK,
  type Site,
  type Obligation,
} from "@/data/mock-data";

// ── Types ──────────────────────────────────────────────────

export type UrgencyLevel = "Monitor" | "Review" | "Immediate Action";
export type ExposureRisk = "Low" | "Medium" | "High";

export interface RegulatoryUpdate {
  id: string;
  title: string;
  regulatoryBody: string;
  jurisdiction: string;
  state: string;
  country: string;
  effectiveDate: string;
  publishedDate: string;
  sourceUrl: string;
  changeType: "New Rule" | "Amendment" | "Enforcement" | "Guidance" | "Proposed Rule";
  industrySector: string;
  summary: string;
  complianceRequirements: string[];
  affectedGeographies: string[];
  confidenceScore: number; // 0–100
}

export interface ImpactedSite {
  siteId: string;
  siteName: string;
  region: string;
  matchReason: string;
  obligationsAffected: number;
}

export interface ImpactedObligation {
  obligationId: string;
  obligationName: string;
  type: string;
  currentLiability: number;
  impactType: string;
}

export interface ExposureEstimate {
  lowCase: number;
  baseCase: number;
  highCase: number;
  drivers: string[];
}

export interface RegulatoryImpactAnalysis {
  updateId: string;
  impactScore: number; // 0–100
  exposureRisk: ExposureRisk;
  urgency: UrgencyLevel;
  impactedSites: ImpactedSite[];
  impactedObligations: ImpactedObligation[];
  exposure: ExposureEstimate;
  forecastAssumptionsAffected: string[];
}

export interface RegulatoryNarrative {
  executiveSummary: string;
  whatChanged: string;
  affectedAssets: string;
  financialImplication: string;
  recommendedActions: { action: string; priority: "High" | "Medium" | "Low"; rationale: string }[];
  generatedAt: string;
  sourceReference: string;
}

export interface RegulatoryDashboardSummary {
  totalUpdates: number;
  highImpactCount: number;
  totalExposureAtRisk: number;
  affectedSitesCount: number;
  affectedAROsCount: number;
  jurisdictionBreakdown: { jurisdiction: string; count: number }[];
  recentAlerts: (RegulatoryUpdate & { analysis: RegulatoryImpactAnalysis })[];
}

// ── Mock Regulatory Feed ───────────────────────────────────

export const regulatoryUpdates: RegulatoryUpdate[] = [
  {
    id: "REG-001",
    title: "Enhanced Groundwater Monitoring Standards for Oil & Gas Operations",
    regulatoryBody: "Texas Commission on Environmental Quality (TCEQ)",
    jurisdiction: "Texas",
    state: "Texas",
    country: "US",
    effectiveDate: "2026-07-01",
    publishedDate: "2026-02-10",
    sourceUrl: "https://www.tceq.texas.gov/rules/2026-gw-monitoring",
    changeType: "New Rule",
    industrySector: "Oil & Gas",
    summary: "TCEQ has adopted new groundwater monitoring requirements for facilities with aboveground storage tanks and active remediation sites. The rule expands monitoring well networks, increases sampling frequency from quarterly to monthly for high-risk sites, and requires real-time telemetry for contaminant plume tracking.",
    complianceRequirements: [
      "Expand monitoring well network to include downgradient sentinel wells",
      "Increase sampling frequency to monthly for sites exceeding TRRP limits",
      "Install real-time groundwater telemetry systems by January 2027",
      "Submit updated monitoring plans within 90 days of effective date",
    ],
    affectedGeographies: ["Texas"],
    confidenceScore: 94,
  },
  {
    id: "REG-002",
    title: "Revised NORM Disposal Standards for Oilfield Waste",
    regulatoryBody: "NM Energy, Minerals & Natural Resources Dept",
    jurisdiction: "New Mexico",
    state: "New Mexico",
    country: "US",
    effectiveDate: "2026-09-01",
    publishedDate: "2026-01-28",
    sourceUrl: "https://www.emnrd.nm.gov/ocd/rules/norm-disposal-2026",
    changeType: "Amendment",
    industrySector: "Oil & Gas",
    summary: "New Mexico has tightened NORM disposal standards, lowering the acceptable threshold from 30 pCi/g to 15 pCi/g Ra-226 for surface soils at active oilfield sites. This amendment also mandates annual NORM surveys for all gathering and disposal facilities.",
    complianceRequirements: [
      "Conduct NORM baseline survey at all gathering and disposal facilities",
      "Remediate soils exceeding 15 pCi/g Ra-226 within 24 months",
      "Submit annual NORM monitoring reports",
      "Update waste management plans to reflect new thresholds",
    ],
    affectedGeographies: ["New Mexico"],
    confidenceScore: 91,
  },
  {
    id: "REG-003",
    title: "Pipeline Abandonment Requirements – Enhanced Environmental Closure Standards",
    regulatoryBody: "PHMSA / EPA Joint Guidance",
    jurisdiction: "Federal",
    state: "Federal",
    country: "US",
    effectiveDate: "2026-10-15",
    publishedDate: "2026-02-05",
    sourceUrl: "https://www.phmsa.dot.gov/guidance/pipeline-abandonment-2026",
    changeType: "Guidance",
    industrySector: "Pipeline & Transportation",
    summary: "Joint PHMSA/EPA guidance establishes enhanced environmental closure standards for abandoned pipelines, requiring soil and groundwater sampling along pipeline corridors, cathodic protection assessment documentation, and post-abandonment monitoring for a minimum of 5 years.",
    complianceRequirements: [
      "Conduct soil and groundwater sampling along abandoned pipeline corridors",
      "Document cathodic protection status and corrosion assessment",
      "Implement 5-year post-abandonment monitoring program",
      "Submit closure reports to both PHMSA and state environmental agency",
    ],
    affectedGeographies: ["Texas", "New Mexico", "Pennsylvania", "Louisiana"],
    confidenceScore: 82,
  },
  {
    id: "REG-004",
    title: "Chlorinated Solvent Cleanup Standards – Stricter MCLs for TCE/PCE",
    regulatoryBody: "Pennsylvania DEP",
    jurisdiction: "Pennsylvania",
    state: "Pennsylvania",
    country: "US",
    effectiveDate: "2026-06-01",
    publishedDate: "2026-01-15",
    sourceUrl: "https://www.dep.pa.gov/rules/act2-standards-2026",
    changeType: "Amendment",
    industrySector: "Manufacturing & Processing",
    summary: "PA DEP has lowered maximum contaminant levels (MCLs) for trichloroethylene (TCE) from 5 µg/L to 2 µg/L and perchloroethylene (PCE) from 5 µg/L to 3 µg/L, aligning with updated EPA health advisories. Sites with existing pump-and-treat systems must demonstrate compliance with new standards.",
    complianceRequirements: [
      "Re-evaluate remediation goals against new MCLs",
      "Submit updated remediation strategy within 180 days",
      "Demonstrate treatment system capability to meet 2 µg/L TCE standard",
      "Update quarterly monitoring reports with new compliance benchmarks",
    ],
    affectedGeographies: ["Pennsylvania"],
    confidenceScore: 96,
  },
  {
    id: "REG-005",
    title: "Marine Terminal Environmental Assessment Requirements",
    regulatoryBody: "Louisiana DENR",
    jurisdiction: "Louisiana",
    state: "Louisiana",
    country: "US",
    effectiveDate: "2027-01-01",
    publishedDate: "2026-02-18",
    sourceUrl: "https://www.deq.louisiana.gov/marine-terminal-rules-2026",
    changeType: "Proposed Rule",
    industrySector: "Marine & Terminal",
    summary: "Louisiana DENR proposes comprehensive environmental assessment requirements for marine terminals, including mandatory Phase I/Phase II ESAs every 5 years, stormwater monitoring expansion, and legacy contamination characterization for facilities operating more than 20 years.",
    complianceRequirements: [
      "Conduct Phase I/Phase II ESA within 18 months of rule finalization",
      "Expand stormwater monitoring to include emerging contaminants (PFAS)",
      "Characterize legacy contamination in tank farm and loading dock areas",
      "Submit facility environmental baseline report",
    ],
    affectedGeographies: ["Louisiana"],
    confidenceScore: 72,
  },
  {
    id: "REG-006",
    title: "Increased Financial Assurance Requirements for Class II Injection Wells",
    regulatoryBody: "EPA Underground Injection Control Program",
    jurisdiction: "Federal",
    state: "Federal",
    country: "US",
    effectiveDate: "2026-12-01",
    publishedDate: "2026-02-12",
    sourceUrl: "https://www.epa.gov/uic/class-ii-financial-assurance-2026",
    changeType: "New Rule",
    industrySector: "Oil & Gas",
    summary: "EPA has finalized increased financial assurance requirements for Class II injection well operators, raising the minimum bonding amount from $25,000 to $150,000 per well and requiring demonstration of closure cost adequacy based on site-specific engineering estimates.",
    complianceRequirements: [
      "Update financial assurance instruments to meet $150K/well minimum",
      "Obtain site-specific closure cost estimate from qualified engineer",
      "Submit updated financial assurance documentation within 12 months",
      "Maintain proof of financial responsibility accessible for inspection",
    ],
    affectedGeographies: ["New Mexico", "Texas"],
    confidenceScore: 88,
  },
];

// ── Geography & Site Matching ──────────────────────────────

const siteRegionMap: Record<string, string[]> = {
  "Texas": ["S001"],
  "New Mexico": ["S002"],
  "Pennsylvania": ["S003"],
  "Louisiana": ["S004"],
  "Federal": ["S001", "S002", "S003", "S004"],
};

function matchSites(update: RegulatoryUpdate): ImpactedSite[] {
  const matchedSiteIds = new Set<string>();
  update.affectedGeographies.forEach(geo => {
    (siteRegionMap[geo] || []).forEach(id => matchedSiteIds.add(id));
  });

  return Array.from(matchedSiteIds).map(siteId => {
    const site = sites.find(s => s.id === siteId)!;
    const oblCount = obligations.filter(o => o.siteId === siteId && o.status !== "Settled").length;
    return {
      siteId: site.id,
      siteName: site.name,
      region: site.region,
      matchReason: `Site located in ${site.region}, within ${update.jurisdiction} jurisdiction.`,
      obligationsAffected: oblCount,
    };
  });
}

function matchObligations(impactedSiteIds: string[], update: RegulatoryUpdate): ImpactedObligation[] {
  return obligations
    .filter(o => impactedSiteIds.includes(o.siteId) && o.status !== "Settled")
    .map(o => ({
      obligationId: o.id,
      obligationName: o.name,
      type: o.type,
      currentLiability: o.currentLiability,
      impactType: determineImpactType(o, update),
    }));
}

function determineImpactType(obl: Obligation, update: RegulatoryUpdate): string {
  const title = update.title.toLowerCase();
  if (title.includes("monitoring")) return "Increased monitoring cost";
  if (title.includes("disposal") || title.includes("cleanup")) return "Remediation scope change";
  if (title.includes("pipeline") || title.includes("abandonment")) return "Closure requirement change";
  if (title.includes("financial assurance")) return "Financial assurance increase";
  if (title.includes("marine") || title.includes("terminal")) return "Assessment requirement";
  return "Compliance requirement change";
}

// ── Exposure Estimation ────────────────────────────────────

function estimateExposure(
  impactedObligations: ImpactedObligation[],
  update: RegulatoryUpdate
): ExposureEstimate {
  const totalLiability = impactedObligations.reduce((s, o) => s + o.currentLiability, 0);

  // Heuristic multipliers based on change type
  const multipliers: Record<string, { low: number; base: number; high: number }> = {
    "New Rule": { low: 0.03, base: 0.06, high: 0.12 },
    "Amendment": { low: 0.02, base: 0.05, high: 0.09 },
    "Enforcement": { low: 0.05, base: 0.10, high: 0.20 },
    "Guidance": { low: 0.01, base: 0.03, high: 0.06 },
    "Proposed Rule": { low: 0.01, base: 0.02, high: 0.05 },
  };

  const m = multipliers[update.changeType] || multipliers["Guidance"];

  const drivers: string[] = [];
  if (update.title.toLowerCase().includes("monitoring")) drivers.push("Expanded monitoring program costs");
  if (update.title.toLowerCase().includes("remediation") || update.title.toLowerCase().includes("cleanup")) drivers.push("Remediation scope expansion");
  if (update.title.toLowerCase().includes("financial assurance")) drivers.push("Increased bonding/financial assurance");
  if (update.title.toLowerCase().includes("disposal")) drivers.push("Disposal cost escalation");
  if (update.complianceRequirements.length > 3) drivers.push("Multi-requirement compliance burden");
  if (drivers.length === 0) drivers.push("General compliance cost increase");

  return {
    lowCase: Math.round(totalLiability * m.low),
    baseCase: Math.round(totalLiability * m.base),
    highCase: Math.round(totalLiability * m.high),
    drivers,
  };
}

// ── Risk Scoring ───────────────────────────────────────────

function scoreImpact(
  impactedSites: ImpactedSite[],
  impactedObligations: ImpactedObligation[],
  exposure: ExposureEstimate,
  update: RegulatoryUpdate
): { score: number; risk: ExposureRisk; urgency: UrgencyLevel } {
  let score = 0;

  // Site count factor (0-25)
  score += Math.min(25, impactedSites.length * 8);

  // Obligation count factor (0-20)
  score += Math.min(20, impactedObligations.length * 4);

  // Exposure magnitude (0-25)
  const exposurePct = exposure.baseCase / Math.max(1, impactedObligations.reduce((s, o) => s + o.currentLiability, 0));
  score += Math.min(25, exposurePct * 250);

  // Confidence & urgency (0-15)
  score += (update.confidenceScore / 100) * 15;

  // Change type severity (0-15)
  const typeSeverity: Record<string, number> = {
    "Enforcement": 15, "New Rule": 12, "Amendment": 10, "Guidance": 6, "Proposed Rule": 4,
  };
  score += typeSeverity[update.changeType] || 5;

  score = Math.min(100, Math.round(score));

  const risk: ExposureRisk = score >= 65 ? "High" : score >= 40 ? "Medium" : "Low";

  const daysToEffective = Math.max(0, (new Date(update.effectiveDate).getTime() - Date.now()) / 86400000);
  let urgency: UrgencyLevel = "Monitor";
  if (score >= 65 || daysToEffective < 90) urgency = "Immediate Action";
  else if (score >= 40 || daysToEffective < 180) urgency = "Review";

  return { score, risk, urgency };
}

// ── Full Analysis ──────────────────────────────────────────

export function analyzeRegulatory(update: RegulatoryUpdate): RegulatoryImpactAnalysis {
  const impactedSites = matchSites(update);
  const siteIds = impactedSites.map(s => s.siteId);
  const impactedObligations = matchObligations(siteIds, update);
  const exposure = estimateExposure(impactedObligations, update);
  const { score, risk, urgency } = scoreImpact(impactedSites, impactedObligations, exposure, update);

  const forecastAssumptions: string[] = [];
  if (update.title.toLowerCase().includes("monitoring")) forecastAssumptions.push("Monitoring cost escalation factor");
  if (update.title.toLowerCase().includes("cleanup") || update.title.toLowerCase().includes("remediation")) {
    forecastAssumptions.push("Remediation cost base estimate");
    forecastAssumptions.push("Timeline projection");
  }
  if (update.title.toLowerCase().includes("financial assurance")) forecastAssumptions.push("Financial assurance reserve");
  forecastAssumptions.push("Regulatory compliance cost baseline");

  return {
    updateId: update.id,
    impactScore: score,
    exposureRisk: risk,
    urgency,
    impactedSites,
    impactedObligations,
    exposure,
    forecastAssumptionsAffected: forecastAssumptions,
  };
}

export function getAllAnalyses(): (RegulatoryUpdate & { analysis: RegulatoryImpactAnalysis })[] {
  return regulatoryUpdates.map(u => ({
    ...u,
    analysis: analyzeRegulatory(u),
  }));
}

// ── Dashboard Summary ──────────────────────────────────────

export function getDashboardSummary(): RegulatoryDashboardSummary {
  const all = getAllAnalyses();
  const highImpact = all.filter(a => a.analysis.exposureRisk === "High");

  const totalExposure = all.reduce((s, a) => s + a.analysis.exposure.baseCase, 0);
  const affectedSiteIds = new Set(all.flatMap(a => a.analysis.impactedSites.map(s => s.siteId)));
  const affectedAROIds = new Set(
    all.flatMap(a => a.analysis.impactedObligations.filter(o => o.type === "ARO").map(o => o.obligationId))
  );

  const jurisdictionMap = new Map<string, number>();
  all.forEach(a => {
    const j = a.jurisdiction;
    jurisdictionMap.set(j, (jurisdictionMap.get(j) || 0) + 1);
  });

  return {
    totalUpdates: all.length,
    highImpactCount: highImpact.length,
    totalExposureAtRisk: totalExposure,
    affectedSitesCount: affectedSiteIds.size,
    affectedAROsCount: affectedAROIds.size,
    jurisdictionBreakdown: Array.from(jurisdictionMap.entries())
      .map(([jurisdiction, count]) => ({ jurisdiction, count }))
      .sort((a, b) => b.count - a.count),
    recentAlerts: all.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()),
  };
}

// ── Narrative Generation ───────────────────────────────────

export function generateRegulatoryNarrative(
  update: RegulatoryUpdate,
  analysis: RegulatoryImpactAnalysis
): RegulatoryNarrative {
  const siteNames = analysis.impactedSites.map(s => s.siteName).join(", ");
  const oblCount = analysis.impactedObligations.length;
  const aroCount = analysis.impactedObligations.filter(o => o.type === "ARO").length;
  const eroCount = analysis.impactedObligations.filter(o => o.type === "ERO").length;

  const executiveSummary = `${update.title} (${update.changeType}) published by ${update.regulatoryBody} on ${update.publishedDate} may impact ${analysis.impactedSites.length} site(s) and ${oblCount} obligation(s). Preliminary financial exposure is estimated at ${formatCurrency(analysis.exposure.lowCase)}–${formatCurrency(analysis.exposure.highCase)} (base case: ${formatCurrency(analysis.exposure.baseCase)}). Impact score: ${analysis.impactScore}/100. Urgency: ${analysis.urgency}.`;

  const whatChanged = `${update.summary}\n\nEffective Date: ${update.effectiveDate}\nConfidence Score: ${update.confidenceScore}%\n\nKey Compliance Requirements:\n${update.complianceRequirements.map((r, i) => `${i + 1}. ${r}`).join("\n")}`;

  const affectedAssets = `Affected Sites: ${siteNames || "None identified"}\n\nObligation Breakdown: ${aroCount} ARO(s), ${eroCount} ERO(s) across ${analysis.impactedSites.length} site(s).\n\n${
    analysis.impactedObligations.length > 0
      ? "Obligations requiring review:\n" + analysis.impactedObligations.map(o =>
          `• ${o.obligationName} (${o.type}): ${formatCurrency(o.currentLiability)} – ${o.impactType}`
        ).join("\n")
      : "No direct obligation impacts identified."
  }`;

  const financialImplication = `Preliminary Impact Estimate:\n• Low Case: ${formatCurrency(analysis.exposure.lowCase)}\n• Base Case: ${formatCurrency(analysis.exposure.baseCase)}\n• High Case: ${formatCurrency(analysis.exposure.highCase)}\n\nExposure Drivers:\n${analysis.exposure.drivers.map(d => `• ${d}`).join("\n")}\n\nForecast Assumptions Affected:\n${analysis.forecastAssumptionsAffected.map(a => `• ${a}`).join("\n")}\n\nNote: These are preliminary estimates based on structured impact mapping. Final assessment requires site-specific engineering evaluation.`;

  const recommendedActions: RegulatoryNarrative["recommendedActions"] = [];

  if (analysis.urgency === "Immediate Action") {
    recommendedActions.push({
      action: "Conduct compliance gap analysis within 30 days",
      priority: "High",
      rationale: `Regulation effective ${update.effectiveDate} with impact score of ${analysis.impactScore}/100.`,
    });
  }

  if (analysis.impactedObligations.some(o => o.type === "ARO")) {
    recommendedActions.push({
      action: "Trigger ARO reassessment for affected obligations",
      priority: analysis.exposureRisk === "High" ? "High" : "Medium",
      rationale: `${aroCount} ARO obligation(s) potentially impacted by regulatory change.`,
    });
  }

  if (analysis.exposure.baseCase > 100000) {
    recommendedActions.push({
      action: "Update forecast assumptions in Plan module",
      priority: "Medium",
      rationale: `Base case exposure of ${formatCurrency(analysis.exposure.baseCase)} warrants forecast revision.`,
    });
  }

  recommendedActions.push({
    action: "Notify environmental program manager and compliance team",
    priority: analysis.urgency === "Monitor" ? "Low" : "Medium",
    rationale: `Regulatory change from ${update.regulatoryBody} requires stakeholder awareness.`,
  });

  if (update.changeType === "Proposed Rule") {
    recommendedActions.push({
      action: "Submit public comment during open comment period",
      priority: "Medium",
      rationale: "Proposed rule — opportunity to influence final requirements.",
    });
  }

  return {
    executiveSummary,
    whatChanged,
    affectedAssets,
    financialImplication,
    recommendedActions,
    generatedAt: new Date().toISOString(),
    sourceReference: `${update.regulatoryBody} — ${update.sourceUrl} (Published: ${update.publishedDate})`,
  };
}

// ── Predictive Regulatory Risk ─────────────────────────────

export interface PredictiveRisk {
  region: string;
  riskDomain: string;
  trendScore: number; // 0-100
  rationale: string;
}

export function getPredictiveRisks(): PredictiveRisk[] {
  return [
    { region: "Texas", riskDomain: "Groundwater monitoring", trendScore: 85, rationale: "TCEQ has issued 3 new monitoring rules in 18 months. Trend suggests continued tightening of groundwater standards for O&G facilities." },
    { region: "New Mexico", riskDomain: "NORM / radioactive waste", trendScore: 72, rationale: "NORM threshold reduction from 30 to 15 pCi/g signals ongoing regulatory scrutiny of oilfield radioactive materials." },
    { region: "Federal", riskDomain: "Pipeline decommissioning", trendScore: 68, rationale: "PHMSA/EPA joint guidance indicates federal interest in enhanced pipeline abandonment standards." },
    { region: "Pennsylvania", riskDomain: "Chlorinated solvent cleanup", trendScore: 78, rationale: "PA DEP alignment with EPA health advisories suggests further MCL reductions possible for industrial solvents." },
    { region: "Louisiana", riskDomain: "Marine terminal assessment", trendScore: 55, rationale: "Proposed rule signals emerging focus on legacy contamination at coastal facilities." },
  ];
}
