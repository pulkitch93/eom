// AI ARO Justification Engine - Narrative Generation
// Generates audit-ready ARO documentation from structured mock data

import {
  obligations,
  sites,
  environmentalExposures,
  forecastScenarios,
  budgetItems,
  settlementProjects,
  auditTrail,
  controlItems,
  disclosureItems,
  aroTrackingEntries,
  formatCurrency,
  generateAccretionSchedule,
  type Obligation,
} from "@/data/mock-data";

export type NarrativeType =
  | "calculation_rationale"
  | "assumption_documentation"
  | "change_in_liability"
  | "regulatory_disclosure"
  | "full_audit_package";

export interface NarrativeSection {
  id: string;
  title: string;
  content: string;
  sourceReferences: SourceReference[];
}

export interface SourceReference {
  field: string;
  value: string;
  module: string;
}

export interface GeneratedNarrative {
  id: string;
  obligationId: string;
  narrativeType: NarrativeType;
  generatedAt: Date;
  generatedBy: string;
  version: number;
  sections: NarrativeSection[];
  auditPrepChecklist?: AuditChecklistItem[];
}

export interface AuditChecklistItem {
  item: string;
  status: "complete" | "missing" | "warning";
  detail: string;
}

export const NARRATIVE_TYPE_LABELS: Record<NarrativeType, string> = {
  calculation_rationale: "ARO Calculation Rationale",
  assumption_documentation: "Assumption Documentation",
  change_in_liability: "Change-in-Liability Explanation",
  regulatory_disclosure: "Regulatory Disclosure Draft",
  full_audit_package: "Full Audit Package",
};

// Simulated streaming generation
export async function generateNarrative(
  obligationId: string,
  narrativeType: NarrativeType,
  onSection: (section: NarrativeSection) => void,
  onComplete: (narrative: GeneratedNarrative) => void
): Promise<void> {
  const obligation = obligations.find(o => o.id === obligationId);
  if (!obligation) {
    const errSection: NarrativeSection = {
      id: "err-1",
      title: "Error",
      content: "Data unavailable – manual review required. The specified obligation could not be found in the system.",
      sourceReferences: [],
    };
    onSection(errSection);
    onComplete({
      id: crypto.randomUUID(),
      obligationId,
      narrativeType,
      generatedAt: new Date(),
      generatedBy: "EOM AI Engine",
      version: 1,
      sections: [errSection],
    });
    return;
  }

  const sections: NarrativeSection[] = [];

  const buildSections = getSectionsForType(obligation, narrativeType);

  for (const section of buildSections) {
    await delay(400 + Math.random() * 300);
    sections.push(section);
    onSection(section);
  }

  const checklist = generateAuditChecklist(obligation);

  await delay(200);
  onComplete({
    id: crypto.randomUUID(),
    obligationId,
    narrativeType,
    generatedAt: new Date(),
    generatedBy: "EOM AI Engine",
    version: 1,
    sections,
    auditPrepChecklist: checklist,
  });
}

function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

function getSectionsForType(ob: Obligation, type: NarrativeType): NarrativeSection[] {
  const site = sites.find(s => s.id === ob.siteId);
  const tracking = aroTrackingEntries.find(e => e.obligationId === ob.id);
  const relatedBudget = budgetItems.filter(b => b.obligationId === ob.id);
  const relatedProject = settlementProjects.find(p => p.obligationId === ob.id);
  const relatedAudit = auditTrail.filter(a => a.entityId === ob.id);
  const relatedDisclosures = disclosureItems.filter(d =>
    (ob.type === "ARO" && d.standard.includes("410")) || (ob.type === "ERO" && d.standard.includes("450"))
  );
  const baseScenario = forecastScenarios[0];
  const schedule = ob.type === "ARO" ? generateAccretionSchedule(ob) : [];

  const exec = buildExecutiveSummary(ob, site, tracking);
  const calc = buildCalculationRationale(ob, site, tracking, schedule);
  const assumptions = buildAssumptions(ob, baseScenario);
  const change = buildChangeInLiability(ob, tracking, relatedAudit);
  const disclosure = buildDisclosureDraft(ob, site, tracking);
  const sources = buildSourceReferences(ob, site, tracking, relatedBudget, relatedProject);

  switch (type) {
    case "calculation_rationale":
      return [exec, calc, assumptions, sources];
    case "assumption_documentation":
      return [assumptions, buildAssumptionDetail(ob, baseScenario), sources];
    case "change_in_liability":
      return [exec, change, sources];
    case "regulatory_disclosure":
      return [disclosure, sources];
    case "full_audit_package":
      return [exec, calc, assumptions, change, disclosure, buildAuditTrailSummary(relatedAudit), sources];
  }
}

function buildExecutiveSummary(ob: Obligation, site: ReturnType<typeof sites.find>, tracking: typeof aroTrackingEntries[0] | undefined): NarrativeSection {
  const yearsRemaining = tracking?.yearsRemaining ?? Math.max(0, new Date(ob.targetSettlementDate).getFullYear() - 2026);
  const riskProfile = ob.currentLiability > 2000000 ? "High" : ob.currentLiability > 500000 ? "Moderate" : "Low";

  return {
    id: "exec-summary",
    title: "Section 1: Executive Summary",
    content: `**Obligation**: ${ob.name} (${ob.id})\n**Type**: ${ob.type === "ARO" ? "Asset Retirement Obligation (ASC 410-20)" : "Environmental Remediation Obligation (ASC 450-20)"}\n**Site**: ${site?.name ?? "Unknown"} — ${site?.region ?? "Unknown Region"}\n\n**Nature of Obligation**: ${ob.description}\n\n**Financial Magnitude**: The current liability is recorded at ${formatCurrency(ob.currentLiability)}, reflecting a ${ob.currentLiability > ob.initialEstimate ? "net increase" : "decrease"} of ${formatCurrency(Math.abs(ob.currentLiability - ob.initialEstimate))} (${((Math.abs(ob.currentLiability - ob.initialEstimate) / ob.initialEstimate) * 100).toFixed(1)}%) from the initial estimate of ${formatCurrency(ob.initialEstimate)}.\n\n**Time Horizon**: Settlement is targeted for ${ob.targetSettlementDate} (${yearsRemaining} years remaining). ${ob.type === "ARO" ? `Annual accretion expense of ${formatCurrency(ob.accretionExpense)} is recognized.` : `Remediation is currently in the "${ob.remediationPhase}" phase at ${ob.remediationProgress}% completion.`}\n\n**Risk Profile**: ${riskProfile}. ${riskProfile === "High" ? "This obligation represents a material exposure requiring quarterly executive review." : "Standard monitoring cadence is appropriate."}`,
    sourceReferences: [
      { field: "currentLiability", value: formatCurrency(ob.currentLiability), module: "Inventory" },
      { field: "initialEstimate", value: formatCurrency(ob.initialEstimate), module: "Inventory" },
      { field: "targetSettlementDate", value: ob.targetSettlementDate, module: "Plan" },
      { field: "accretionExpense", value: formatCurrency(ob.accretionExpense), module: "Inventory" },
    ],
  };
}

function buildCalculationRationale(ob: Obligation, site: ReturnType<typeof sites.find>, tracking: typeof aroTrackingEntries[0] | undefined, schedule: ReturnType<typeof generateAccretionSchedule>): NarrativeSection {
  const yearsTotal = new Date(ob.targetSettlementDate).getFullYear() - new Date(ob.createdDate).getFullYear();

  let content = `**Base Cost Estimate**: The initial undiscounted cost estimate of ${formatCurrency(ob.initialEstimate)} was established on ${ob.createdDate} based on engineering assessments and third-party cost studies for ${ob.description.toLowerCase()}\n\n`;

  content += `**Timeline**: The obligation spans ${yearsTotal} years from inception (${ob.createdDate}) to targeted settlement (${ob.targetSettlementDate}).\n\n`;

  content += `**Present Value Calculation**: The liability reflects projected ${ob.type === "ARO" ? "retirement" : "remediation"} costs discounted at a credit-adjusted risk-free rate of ${(ob.discountRate * 100).toFixed(1)}% to reflect present value. The discount rate is determined based on the entity's credit standing and the duration of the obligation, consistent with ${ob.type === "ARO" ? "ASC 410-20-30" : "ASC 450-20"} requirements.\n\n`;

  content += `**Discount Rate Application**: Applying the ${(ob.discountRate * 100).toFixed(1)}% discount rate over ${yearsTotal} years:\n\nPV = FV / (1 + r)^n\nPV = ${formatCurrency(ob.initialEstimate)} / (1 + ${ob.discountRate})^${yearsTotal}\n\nThe liability reflects projected ${ob.type === "ARO" ? "retirement" : "remediation"} costs of ${formatCurrency(ob.initialEstimate)} over ${yearsTotal} years, discounted at ${(ob.discountRate * 100).toFixed(1)}% to reflect present value. Cumulative accretion of ${formatCurrency(ob.currentLiability - ob.initialEstimate)} has been recognized through the current period.\n\n`;

  content += `**Inflation Adjustment**: Annual cost escalation of 2.5% is applied to the undiscounted estimate to reflect expected increases in contractor labor, materials, and regulatory compliance costs.\n\n`;

  if (schedule.length > 0) {
    const recentYears = schedule.filter(s => s.year >= 2024 && s.year <= 2028);
    content += `**Accretion Schedule (Recent)**:\n| Year | Beginning Balance | Accretion | Ending Balance |\n|------|------------------|-----------|----------------|\n`;
    recentYears.forEach(s => {
      content += `| ${s.year} | ${formatCurrency(Math.round(s.beginningBalance))} | ${formatCurrency(Math.round(s.accretion))} | ${formatCurrency(Math.round(s.endingBalance))} |\n`;
    });
  }

  return {
    id: "calc-rationale",
    title: "Section 2: Liability Calculation Rationale",
    content,
    sourceReferences: [
      { field: "discountRate", value: `${(ob.discountRate * 100).toFixed(1)}%`, module: "Plan" },
      { field: "initialEstimate", value: formatCurrency(ob.initialEstimate), module: "Inventory" },
      { field: "createdDate", value: ob.createdDate, module: "Inventory" },
      { field: "targetSettlementDate", value: ob.targetSettlementDate, module: "Plan" },
    ],
  };
}

function buildAssumptions(ob: Obligation, scenario: typeof forecastScenarios[0]): NarrativeSection {
  return {
    id: "key-assumptions",
    title: "Section 3: Key Assumptions",
    content: `The following assumptions underpin the obligation measurement:\n\n| Assumption | Value | Basis |\n|------------|-------|-------|\n| Discount Rate | ${(ob.discountRate * 100).toFixed(1)}% | Credit-adjusted risk-free rate per ASC 410-20-30 |\n| Inflation Rate | ${(scenario.inflationRate * 100).toFixed(1)}% | CPI-based escalation for environmental services |\n| Escalation Factor | 2.5% annually | Contractor labor & materials index |\n| Duration | ${new Date(ob.targetSettlementDate).getFullYear() - new Date(ob.createdDate).getFullYear()} years | Engineering assessment of ${ob.type === "ARO" ? "asset useful life" : "remediation timeline"} |\n| Scope | ${ob.description} | Site-specific engineering study |\n| Regulatory Basis | ${ob.type === "ARO" ? "PHMSA / State Commission requirements" : ob.regulatoryDeadline ? `State environmental agency, deadline: ${ob.regulatoryDeadline}` : "State environmental regulations"} | Applicable federal and state regulations |\n| Probability Weighting | Single best estimate | Most likely outcome approach per ASC 410-20 |\n\nAll assumptions are traceable to system-maintained data fields and were last reviewed on ${aroTrackingEntries.find(e => e.obligationId === ob.id)?.lastReviewDate ?? "2025-12-15"}.`,
    sourceReferences: [
      { field: "discountRate", value: `${(ob.discountRate * 100).toFixed(1)}%`, module: "Plan" },
      { field: "inflationRate", value: `${(scenario.inflationRate * 100).toFixed(1)}%`, module: "Plan" },
      { field: "scenarioVersion", value: scenario.name, module: "Plan" },
    ],
  };
}

function buildAssumptionDetail(ob: Obligation, scenario: typeof forecastScenarios[0]): NarrativeSection {
  return {
    id: "assumption-detail",
    title: "Assumption Sensitivity Analysis",
    content: `**Discount Rate Sensitivity**: A ±50bps change in the discount rate would result in approximately ±${formatCurrency(Math.round(ob.currentLiability * 0.03))} change in the recorded liability.\n\n**Inflation Sensitivity**: Under the High Inflation scenario (${(forecastScenarios[1].inflationRate * 100).toFixed(1)}% vs. base ${(scenario.inflationRate * 100).toFixed(1)}%), the obligation would increase by approximately ${formatCurrency(Math.round(ob.currentLiability * 0.08))} over the remaining term.\n\n**Timeline Sensitivity**: Accelerating the settlement date by 2 years would reduce the accretion impact by approximately ${formatCurrency(Math.round(ob.accretionExpense * 2))} but may increase direct costs due to compressed execution.\n\n**Methodology**: The entity employs a single best-estimate approach. Management has considered but not adopted a probability-weighted methodology, as the range of outcomes does not warrant probabilistic analysis at this time.\n\n**Peer Benchmarking**: The discount rate of ${(ob.discountRate * 100).toFixed(1)}% falls within the industry range of 4.0%–6.0% for comparable environmental obligations. No adjustment to the rate is indicated at this time.`,
    sourceReferences: [
      { field: "discountRate", value: `${(ob.discountRate * 100).toFixed(1)}%`, module: "Plan" },
      { field: "highInflationRate", value: `${(forecastScenarios[1].inflationRate * 100).toFixed(1)}%`, module: "Plan" },
    ],
  };
}

function buildChangeInLiability(ob: Obligation, tracking: typeof aroTrackingEntries[0] | undefined, relatedAudit: typeof auditTrail): NarrativeSection {
  const revision = ob.revisionImpact || 0;
  const accretion = ob.accretionExpense;
  const totalChange = ob.currentLiability - ob.initialEstimate;

  if (totalChange === 0) {
    return {
      id: "change-liability",
      title: "Section 4: Change-in-Liability Explanation",
      content: "No material change in liability has occurred since inception. The obligation remains at the initial estimate.",
      sourceReferences: [],
    };
  }

  const accretionPct = totalChange > 0 ? ((totalChange - Math.abs(revision)) / totalChange * 100).toFixed(0) : "0";
  const revisionPct = totalChange > 0 ? (Math.abs(revision) / totalChange * 100).toFixed(0) : "0";

  let content = `The liability for ${ob.name} has changed from the initial estimate of ${formatCurrency(ob.initialEstimate)} to the current balance of ${formatCurrency(ob.currentLiability)}, a net ${totalChange > 0 ? "increase" : "decrease"} of ${formatCurrency(Math.abs(totalChange))} (${((Math.abs(totalChange) / ob.initialEstimate) * 100).toFixed(1)}%).\n\n`;

  content += `**Driver Breakdown**:\n\n| Driver | Amount | % Contribution |\n|--------|--------|----------------|\n| Accretion (time value) | ${formatCurrency(totalChange - Math.abs(revision))} | ${accretionPct}% |\n| Scope / Cost Revision | ${formatCurrency(revision)} | ${revisionPct}% |\n| Inflation Escalation | Embedded in accretion | — |\n| Regulatory Change | ${revision > 0 ? "Contributing factor" : "None identified"} | — |\n| Timeline Shift | None in current period | 0% |\n\n`;

  if (revision > 0) {
    content += `**Revision Detail**: An upward revision of ${formatCurrency(revision)} was recorded, driven by updated scope assessments and/or cost re-estimation. ${tracking?.reviewNotes ?? ""}\n\n`;
  } else if (revision < 0) {
    content += `**Revision Detail**: A downward revision of ${formatCurrency(Math.abs(revision))} was recorded, reflecting reduced scope or favorable cost developments. ${tracking?.reviewNotes ?? ""}\n\n`;
  }

  if (relatedAudit.length > 0) {
    content += `**Audit Trail**: ${relatedAudit.length} recorded changes to this obligation. Most recent: "${relatedAudit[0].action}" on ${relatedAudit[0].timestamp.split(" ")[0]} by ${relatedAudit[0].user}.`;
  }

  return {
    id: "change-liability",
    title: "Section 4: Change-in-Liability Explanation",
    content,
    sourceReferences: [
      { field: "revisionImpact", value: formatCurrency(revision), module: "Inventory" },
      { field: "currentLiability", value: formatCurrency(ob.currentLiability), module: "Inventory" },
      { field: "accretionExpense", value: formatCurrency(accretion), module: "Inventory" },
    ],
  };
}

function buildDisclosureDraft(ob: Obligation, site: ReturnType<typeof sites.find>, tracking: typeof aroTrackingEntries[0] | undefined): NarrativeSection {
  const standard = ob.type === "ARO" ? "ASC 410-20" : "ASC 450-20";
  let content = `**${standard} Disclosure Draft — ${ob.name}**\n\n`;

  if (ob.type === "ARO") {
    content += `The Company has recorded an asset retirement obligation of ${formatCurrency(ob.currentLiability)} as of the reporting date related to the future ${ob.description.toLowerCase()}. The obligation was initially recognized at a fair value of ${formatCurrency(ob.initialEstimate)} on ${ob.createdDate} and is being accreted to its settlement value over the estimated ${new Date(ob.targetSettlementDate).getFullYear() - new Date(ob.createdDate).getFullYear()}-year useful life of the underlying asset.\n\n`;
    content += `The fair value of the obligation was estimated using a discounted cash flow approach, applying a credit-adjusted risk-free rate of ${(ob.discountRate * 100).toFixed(1)}% and an inflation rate of 2.5% per annum. The estimate is based on current engineering assessments and third-party cost studies and reflects the Company's best estimate of the costs to settle the obligation.\n\n`;
    content += `During the current period, accretion expense of ${formatCurrency(ob.accretionExpense)} was recognized. ${ob.revisionImpact && ob.revisionImpact !== 0 ? `A ${ob.revisionImpact > 0 ? "upward" : "downward"} revision of ${formatCurrency(Math.abs(ob.revisionImpact))} was recorded due to changes in estimated costs.` : "No revisions to the estimated obligation were recorded during the period."}\n\n`;
    content += `The Company is legally obligated to perform ${ob.description.toLowerCase()} upon retirement of the asset located at ${site?.name ?? "the operating site"}, ${site?.region ?? ""}. The obligation is subject to applicable federal and state regulations administered by ${site?.regulatoryAgency ?? "the relevant regulatory agency"}.`;
  } else {
    content += `The Company has accrued an estimated environmental remediation liability of ${formatCurrency(ob.currentLiability)} for ${ob.description.toLowerCase()} at the ${site?.name ?? "operating"} facility. The liability represents management's best estimate of the probable costs to remediate identified ${ob.contaminantType ?? "environmental"} contamination.\n\n`;
    content += `Remediation activities are currently in the "${ob.remediationPhase}" phase, with ${ob.remediationProgress}% of the planned scope completed. ${ob.regulatoryDeadline ? `The remediation is subject to a regulatory deadline of ${ob.regulatoryDeadline}.` : ""}\n\n`;
    content += `The estimate is based on currently available information, including site investigation results, engineering cost studies, and experience with similar remediation projects. The actual costs may vary from the estimate based on factors including but not limited to changes in regulatory requirements, scope modifications, and variations in contractor costs. The Company does not believe that it is reasonably possible that the ultimate costs will exceed the accrued amount by a material amount.`;
  }

  content += `\n\n*This disclosure draft is generated for internal review purposes and requires management approval before inclusion in external filings. Tone: Formal, technical, defensible, non-promotional.*`;

  return {
    id: "reg-disclosure",
    title: "Section 5: Regulatory Disclosure Draft",
    content,
    sourceReferences: [
      { field: "standard", value: standard, module: "Assurance" },
      { field: "currentLiability", value: formatCurrency(ob.currentLiability), module: "Inventory" },
      { field: "regulatoryAgency", value: site?.regulatoryAgency ?? "N/A", module: "Inventory" },
    ],
  };
}

function buildAuditTrailSummary(relatedAudit: typeof auditTrail): NarrativeSection {
  if (relatedAudit.length === 0) {
    return {
      id: "audit-summary",
      title: "Audit Trail Summary",
      content: "No audit trail entries recorded for this obligation in the current period.",
      sourceReferences: [],
    };
  }

  let content = `**${relatedAudit.length} audit trail entries** recorded for this obligation:\n\n`;
  content += `| Date | User | Action | Details |\n|------|------|--------|--------|\n`;
  relatedAudit.forEach(a => {
    content += `| ${a.timestamp.split(" ")[0]} | ${a.user} | ${a.action} | ${a.details.substring(0, 80)}… |\n`;
  });

  return {
    id: "audit-summary",
    title: "Audit Trail Summary",
    content,
    sourceReferences: relatedAudit.map(a => ({
      field: "auditEntry",
      value: `${a.action} (${a.timestamp.split(" ")[0]})`,
      module: "Assurance",
    })),
  };
}

function buildSourceReferences(
  ob: Obligation,
  site: ReturnType<typeof sites.find>,
  tracking: typeof aroTrackingEntries[0] | undefined,
  relatedBudget: typeof budgetItems,
  relatedProject: typeof settlementProjects[0] | undefined
): NarrativeSection {
  const refs: string[] = [
    `**Inventory Module**: Obligation ${ob.id} — ${ob.name} | Site: ${site?.name ?? "N/A"} (${site?.id ?? "N/A"}) | Status: ${ob.status}`,
    `**Plan Module**: Discount Rate: ${(ob.discountRate * 100).toFixed(1)}% | Inflation: 2.5% | Scenario: Base Case | Target Date: ${ob.targetSettlementDate}`,
  ];

  if (relatedBudget.length > 0) {
    refs.push(`**Plan Module (Budget)**: ${relatedBudget.length} budget line items totaling ${formatCurrency(relatedBudget.reduce((s, b) => s + b.budgetedAmount, 0))} budgeted`);
  }

  if (relatedProject) {
    refs.push(`**Settlement Module**: Project ${relatedProject.id} | Status: ${relatedProject.status} | Spent: ${formatCurrency(relatedProject.totalSpent)} of ${formatCurrency(relatedProject.totalBudget)} | PM: ${relatedProject.projectManager}`);
  }

  if (tracking) {
    refs.push(`**Assurance Module**: Last Review: ${tracking.lastReviewDate} | Next Review: ${tracking.nextReviewDate} | Notes: ${tracking.reviewNotes}`);
  }

  const relatedDisclosures = disclosureItems.filter(d =>
    (ob.type === "ARO" && d.standard.includes("410")) || (ob.type === "ERO" && d.standard.includes("450"))
  );
  if (relatedDisclosures.length > 0) {
    refs.push(`**Assurance Module (Disclosure)**: ${relatedDisclosures.length} related disclosure requirements. ${relatedDisclosures.filter(d => d.status === "Complete").length} complete, ${relatedDisclosures.filter(d => d.status !== "Complete" && d.status !== "N/A").length} pending.`);
  }

  return {
    id: "source-refs",
    title: "Source Data References",
    content: `All data points in this narrative are derived from the following system sources. Each value is traceable to a specific module and field.\n\n${refs.map(r => `- ${r}`).join("\n")}`,
    sourceReferences: [
      { field: "obligationId", value: ob.id, module: "Inventory" },
      { field: "siteId", value: site?.id ?? "N/A", module: "Inventory" },
    ],
  };
}

function generateAuditChecklist(ob: Obligation): AuditChecklistItem[] {
  const site = sites.find(s => s.id === ob.siteId);
  const tracking = aroTrackingEntries.find(e => e.obligationId === ob.id);
  const relatedProject = settlementProjects.find(p => p.obligationId === ob.id);
  const relatedBudget = budgetItems.filter(b => b.obligationId === ob.id);

  const items: AuditChecklistItem[] = [
    {
      item: "Engineering Cost Estimate",
      status: ob.initialEstimate > 0 ? "complete" : "missing",
      detail: ob.initialEstimate > 0 ? `Initial estimate of ${formatCurrency(ob.initialEstimate)} on file` : "No cost estimate recorded",
    },
    {
      item: "Discount Rate Documentation",
      status: ob.discountRate > 0 ? "complete" : "missing",
      detail: `Rate: ${(ob.discountRate * 100).toFixed(1)}% — credit-adjusted risk-free rate`,
    },
    {
      item: "Settlement Timeline",
      status: ob.targetSettlementDate ? "complete" : "missing",
      detail: `Target: ${ob.targetSettlementDate}`,
    },
    {
      item: "Site Regulatory Permits",
      status: site && site.permitNumbers.length > 0 ? "complete" : "missing",
      detail: site ? `${site.permitNumbers.length} permits on file (${site.regulatoryAgency})` : "Site data unavailable",
    },
    {
      item: "Periodic Review Documentation",
      status: tracking ? "complete" : "warning",
      detail: tracking ? `Last reviewed: ${tracking.lastReviewDate}. Next: ${tracking.nextReviewDate}` : "No review schedule found — manual review required",
    },
    {
      item: "Budget Alignment",
      status: relatedBudget.length > 0 ? "complete" : "warning",
      detail: relatedBudget.length > 0 ? `${relatedBudget.length} budget items totaling ${formatCurrency(relatedBudget.reduce((s, b) => s + b.budgetedAmount, 0))}` : "No budget items linked — recommend budget alignment review",
    },
    {
      item: "Settlement Project Status",
      status: relatedProject ? "complete" : ob.status === "Active" ? "warning" : "complete",
      detail: relatedProject ? `Project ${relatedProject.id}: ${relatedProject.status} (${relatedProject.completionPercent}% complete)` : ob.status === "Settled" ? "Obligation settled" : "No settlement project created — may be needed for active obligations",
    },
    {
      item: "Revision History",
      status: (ob.revisionImpact && ob.revisionImpact !== 0) || ob.status === "Active" ? "complete" : "warning",
      detail: ob.revisionImpact && ob.revisionImpact !== 0 ? `Revision of ${formatCurrency(ob.revisionImpact)} recorded` : "No revisions recorded — confirm estimate is current",
    },
  ];

  return items;
}

// Get list of ARO obligations for the selector
export function getAROObligationsForJustification() {
  return obligations
    .filter(o => o.type === "ARO" && o.status !== "Settled")
    .map(o => ({
      id: o.id,
      name: o.name,
      siteName: o.siteName,
      currentLiability: o.currentLiability,
      status: o.status,
    }));
}
