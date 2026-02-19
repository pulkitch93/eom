// Simulated AI Copilot Response Engine
// Generates CFO-grade executive intelligence from mock data

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
  liabilityTrendData,
  getTotalLiability,
  getTotalAccretion,
  getObligationsByStatus,
  formatCurrency,
  formatCurrencyK,
  type ObligationType,
} from "@/data/mock-data";

export type CopilotView = "portfolio" | "site" | "project" | "aro";

export interface CopilotMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  view?: CopilotView;
}

export interface SuggestedPrompt {
  text: string;
  category: string;
}

// Route-to-context mapping
export function getContextForRoute(pathname: string): string {
  if (pathname.startsWith("/inventory")) return "inventory";
  if (pathname.startsWith("/aro")) return "aro";
  if (pathname.startsWith("/ero")) return "ero";
  if (pathname.startsWith("/plan")) return "plan";
  if (pathname.startsWith("/settlement")) return "settlement";
  if (pathname.startsWith("/assurance")) return "assurance";
  if (pathname.startsWith("/reporting")) return "reporting";
  return "dashboard";
}

export function getSuggestedPrompts(context: string): SuggestedPrompt[] {
  const universal: SuggestedPrompt[] = [
    { text: "What is the total environmental liability exposure?", category: "Portfolio" },
    { text: "Which sites are at highest financial risk?", category: "Risk" },
    { text: "Show top 5 exposure drivers.", category: "Analysis" },
  ];

  const contextPrompts: Record<string, SuggestedPrompt[]> = {
    dashboard: [
      { text: "Why did liability increase 12% in Q3?", category: "Trend" },
      { text: "Summarize the portfolio risk score.", category: "Risk" },
      { text: "What are the key anomalies this quarter?", category: "Anomaly" },
    ],
    inventory: [
      { text: "Which sites have the most obligations?", category: "Inventory" },
      { text: "Are there assets with missing obligation data?", category: "Anomaly" },
    ],
    aro: [
      { text: "What assumptions are driving this ARO projection?", category: "ARO" },
      { text: "Show AROs with the highest revision impact.", category: "ARO" },
    ],
    ero: [
      { text: "Which ERO sites have critical risk exposure?", category: "ERO" },
      { text: "What is the total environmental remediation cost?", category: "ERO" },
    ],
    plan: [
      { text: "Explain the variance between forecast and actuals.", category: "Plan" },
      { text: "Compare base case vs high inflation scenario.", category: "Plan" },
    ],
    settlement: [
      { text: "Which projects are over budget?", category: "Settlement" },
      { text: "Show vendor payment summary.", category: "Settlement" },
    ],
    assurance: [
      { text: "Are there any deficient internal controls?", category: "Assurance" },
      { text: "Summarize the audit trail for this quarter.", category: "Assurance" },
    ],
    reporting: [
      { text: "What disclosures are still outstanding?", category: "Reporting" },
      { text: "Generate ASC 410 liability rollforward summary.", category: "Reporting" },
    ],
  };

  return [...(contextPrompts[context] || []), ...universal];
}

// Simulated typing delay
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main response generator
export async function generateCopilotResponse(
  query: string,
  view: CopilotView,
  context: string,
  onChunk: (text: string) => void
): Promise<void> {
  const response = buildResponse(query.toLowerCase(), view, context);
  // Simulate streaming: emit word by word
  const words = response.split(" ");
  for (let i = 0; i < words.length; i++) {
    onChunk((i === 0 ? "" : " ") + words[i]);
    await delay(15 + Math.random() * 25);
  }
}

function buildResponse(query: string, view: CopilotView, context: string): string {
  const totalARO = getTotalLiability("ARO");
  const totalERO = getTotalLiability("ERO");
  const totalCombined = getTotalLiability();
  const totalAccretion = getTotalAccretion();
  const activeCount = obligations.filter(o => o.status === "Active").length;
  const statusData = getObligationsByStatus();

  // Pattern-match queries
  if (query.includes("liability") && (query.includes("increase") || query.includes("12%") || query.includes("q3"))) {
    return formatExecutiveResponse(
      "Total environmental liability increased by approximately 12% in Q3 2025, rising from $15.2M to $16.1M, driven by three primary factors.",
      [
        "Updated remediation scope at Permian Basin Pond Remediation (+$180K due to expanded soil excavation boundaries)",
        "Inflation adjustment on long-term AROs across the portfolio (+$300K, reflecting 2.5% cost escalation on unsettled obligations)",
        "Marine Terminal Dismantlement revision (+$200K) following structural assessment revealing additional asbestos abatement requirements",
      ],
      `Net financial impact: +$900K in total liability. Accretion expense increased proportionally by $48K annually.`,
      "Elevated risk concentration at Gulf Coast Terminal (2 obligations, $4.4M combined). Marine Terminal accounts for 21% of total ARO liability.",
      "Recommend prioritizing the Marine Terminal structural assessment to refine the $3.65M estimate before Q2 2026 disclosure."
    );
  }

  if (query.includes("highest") && (query.includes("risk") || query.includes("financial risk"))) {
    const siteRisks = sites.map(site => {
      const siteObligations = obligations.filter(o => o.siteId === site.id);
      const totalLiability = siteObligations.reduce((s, o) => s + o.currentLiability, 0);
      const exposures = environmentalExposures.filter(e => e.siteId === site.id);
      const criticalCount = exposures.filter(e => e.riskLevel === "Critical" || e.riskLevel === "High").length;
      const riskScore = Math.min(100, Math.round(
        (totalLiability / totalCombined) * 40 +
        criticalCount * 15 +
        (site.complianceStatus !== "Compliant" ? 20 : 0) +
        siteObligations.filter(o => o.status === "Under Review").length * 10
      ));
      return { site, totalLiability, criticalCount, riskScore, obligationCount: siteObligations.length };
    }).sort((a, b) => b.riskScore - a.riskScore);

    return formatExecutiveResponse(
      `Portfolio Risk Assessment across ${sites.length} active sites. The highest financial risk is concentrated at ${siteRisks[0].site.name} (Risk Score: ${siteRisks[0].riskScore}/100).`,
      siteRisks.map(sr =>
        `**${sr.site.name}** — Risk Score: ${sr.riskScore}/100 | Liability: ${formatCurrency(sr.totalLiability)} | ${sr.obligationCount} obligations | ${sr.criticalCount} high/critical exposures | Status: ${sr.site.complianceStatus}`
      ),
      `Combined portfolio exposure: ${formatCurrency(totalCombined)}. Top 2 sites represent ${Math.round((siteRisks[0].totalLiability + siteRisks[1].totalLiability) / totalCombined * 100)}% of total liability.`,
      `${siteRisks[0].site.name} carries disproportionate risk due to ${siteRisks[0].site.complianceStatus === "Compliant" ? "high liability concentration" : "non-compliant regulatory status combined with high liability"}. Regulatory volatility is elevated at sites under investigation.`,
      "Recommend enhanced monitoring frequency and quarterly executive review for top-2 risk sites. Consider accelerated settlement timeline for highest-risk obligations."
    );
  }

  if (query.includes("top 5") && query.includes("exposure")) {
    const sorted = environmentalExposures.sort((a, b) => b.estimatedCleanupCost - a.estimatedCleanupCost);
    const top5 = sorted.slice(0, 5);
    return formatExecutiveResponse(
      `Top ${top5.length} environmental exposure drivers by estimated cleanup cost, totaling ${formatCurrency(top5.reduce((s, e) => s + e.estimatedCleanupCost, 0))}.`,
      top5.map((e, i) =>
        `**${i + 1}. ${e.siteName} — ${e.contaminantType}**: ${formatCurrency(e.estimatedCleanupCost)} | Risk: ${e.riskLevel} | Media: ${e.mediaAffected.join(", ")} | Exceedances: ${e.exceedanceCount} | Status: ${e.status}`
      ),
      `Total environmental exposure across all sites: ${formatCurrency(environmentalExposures.reduce((s, e) => s + e.estimatedCleanupCost, 0))}. ${environmentalExposures.filter(e => e.riskLevel === "Critical").length} critical-risk exposures require immediate attention.`,
      "Groundwater contamination at Appalachian Basin and Permian Basin represent the highest single-site exposure concentrations. Multi-media contamination at Permian Basin elevates overall risk profile.",
      "Prioritize Permian Basin pond remediation (45% complete) and Appalachian Basin groundwater treatment (60% complete) to reduce top-line exposure."
    );
  }

  if (query.includes("total") && (query.includes("liability") || query.includes("exposure"))) {
    return formatExecutiveResponse(
      `Total environmental liability stands at ${formatCurrency(totalCombined)} as of Q1 2026, comprising ${formatCurrency(totalARO)} in ARO and ${formatCurrency(totalERO)} in ERO obligations across ${activeCount} active obligations.`,
      [
        `**ARO Portfolio**: ${formatCurrency(totalARO)} across ${obligations.filter(o => o.type === "ARO").length} obligations (${obligations.filter(o => o.type === "ARO" && o.status === "Active").length} active)`,
        `**ERO Portfolio**: ${formatCurrency(totalERO)} across ${obligations.filter(o => o.type === "ERO").length} obligations (${obligations.filter(o => o.type === "ERO" && o.status === "Active").length} active)`,
        `**Annual Accretion**: ${formatCurrency(totalAccretion)} (${(totalAccretion / totalCombined * 100).toFixed(1)}% of total liability)`,
        `**Status Breakdown**: ${statusData.map(s => `${s.status}: ${s.count}`).join(" | ")}`,
      ],
      `Year-over-year liability increased by approximately ${formatCurrency(totalCombined - 14700000)} (+${((totalCombined - 14700000) / 14700000 * 100).toFixed(1)}%) from Q4 2024 baseline.`,
      "Growth is primarily driven by accretion on long-dated obligations and upward scope revisions. The portfolio skews heavily toward ARO obligations which comprise " + Math.round(totalARO / totalCombined * 100) + "% of total exposure.",
      "Review settlement acceleration scenarios in the Plan module to evaluate options for reducing peak liability."
    );
  }

  if (query.includes("assumption") && query.includes("aro")) {
    const aroObs = obligations.filter(o => o.type === "ARO" && o.status !== "Settled");
    const avgDiscount = aroObs.reduce((s, o) => s + o.discountRate, 0) / aroObs.length;
    const baseScenario = forecastScenarios[0];
    return formatExecutiveResponse(
      `ARO projections are driven by the following key assumptions under the ${baseScenario.name} scenario.`,
      [
        `**Discount Rate**: Portfolio-weighted average of ${(avgDiscount * 100).toFixed(1)}% (range: ${Math.min(...aroObs.map(o => o.discountRate)) * 100}%–${Math.max(...aroObs.map(o => o.discountRate)) * 100}%). Applied as credit-adjusted risk-free rate per ASC 410-20.`,
        `**Inflation Rate**: ${(baseScenario.inflationRate * 100).toFixed(1)}% annual cost escalation assumed for unsettled obligations.`,
        `**Duration**: Settlement horizons range from ${Math.min(...aroObs.map(o => new Date(o.targetSettlementDate).getFullYear()))} to ${Math.max(...aroObs.map(o => new Date(o.targetSettlementDate).getFullYear()))} (${Math.min(...aroTrackingEntries.map(e => e.yearsRemaining))}–${Math.max(...aroTrackingEntries.map(e => e.yearsRemaining))} years remaining).`,
        `**Probability Weighting**: Single best-estimate approach used. No probability-weighted scenarios currently applied.`,
        `**Revision Impact**: Net upward revision of ${formatCurrency(aroObs.reduce((s, o) => s + (o.revisionImpact || 0), 0))} YTD, primarily from Marine Terminal (+$200K) and Compressor Removal (+$75K).`,
      ],
      `Under the current assumptions, ARO liability peaks at ${formatCurrencyK(Math.max(...baseScenario.projections.map(p => p.aroLiability)))} in ${baseScenario.projections.find(p => p.aroLiability === Math.max(...baseScenario.projections.map(pp => pp.aroLiability)))?.year}.`,
      "Key sensitivity: A 50bps increase in inflation would add approximately $1.2M to long-dated obligations over 10 years. Discount rate sensitivity is highest for obligations beyond 2035.",
      "Recommend stress-testing the High Inflation scenario and presenting range analysis to audit committee."
    );
  }

  if (query.includes("variance") && (query.includes("forecast") || query.includes("actual") || query.includes("budget"))) {
    const overBudget = budgetItems.filter(b => b.variance < 0);
    const totalVariance = budgetItems.reduce((s, b) => s + b.variance, 0);
    return formatExecutiveResponse(
      `FY2026 budget variance analysis shows a net unfavorable variance of ${formatCurrency(Math.abs(totalVariance))} across ${budgetItems.length} budget line items. ${overBudget.length} items are over budget.`,
      [
        `**Timeline Shift**: Marine Terminal Dismantlement Phase 1 assessment delayed, contributing ${formatCurrency(50000)} unfavorable variance (10% over budget).`,
        `**Vendor Cost Escalation**: Well B-1 Plugging contractor bids came in 8.3% above budget (${formatCurrency(15000)} unfavorable). Market rate pressure on P&A services.`,
        `**Scope Expansion**: Soil Contamination Cleanup expanded excavation boundaries added ${formatCurrency(30000)} to forecast (12% over budget).`,
        `**Inflation Impact**: General cost escalation of 2.5% embedded in all forward estimates. Impact most visible on decommissioning and remediation categories.`,
        `**Offsetting Favorables**: Pond Remediation (${formatCurrency(30000)} favorable) and Compressor Removal (${formatCurrency(10000)} favorable) partially offset overruns.`,
      ],
      `Net budget impact: ${formatCurrency(Math.abs(totalVariance))} unfavorable. Largest single driver: Marine Terminal at ${formatCurrency(50000)} over budget.`,
      "Concentration of unfavorable variances in decommissioning and remediation categories suggests systematic underestimation of contractor costs. Budget methodology may need recalibration.",
      "Recommend mid-year budget revision for Marine Terminal and Soil Contamination line items. Consider adding 10% contingency buffer for remaining FY2026 estimates."
    );
  }

  if (query.includes("over budget") || (query.includes("project") && query.includes("budget"))) {
    const projects = settlementProjects.filter(p => p.status !== "Closed");
    const overBudgetProjects = projects.filter(p => p.totalSpent > p.totalBudget * (p.completionPercent / 100) * 1.1);
    return formatExecutiveResponse(
      `Settlement project budget analysis across ${projects.length} active/planning projects with combined budget of ${formatCurrency(projects.reduce((s, p) => s + p.totalBudget, 0))}.`,
      projects.map(p => {
        const burnRate = p.totalBudget > 0 ? (p.totalSpent / p.totalBudget * 100).toFixed(0) : "0";
        const expectedBurn = p.completionPercent;
        const status = Number(burnRate) > expectedBurn * 1.1 ? "⚠️ Over-burning" : "✅ On track";
        return `**${p.obligationName}** (${p.siteName}): ${status} | Budget: ${formatCurrency(p.totalBudget)} | Spent: ${formatCurrency(p.totalSpent)} (${burnRate}%) | Completion: ${p.completionPercent}% | PM: ${p.projectManager}`;
      }),
      `Total committed: ${formatCurrency(projects.reduce((s, p) => s + p.totalCommitted, 0))} of ${formatCurrency(projects.reduce((s, p) => s + p.totalBudget, 0))} budgeted.`,
      "Early-stage projects (Well B-1 Plugging, Tank Battery Cleanup) carry budget risk as major spend phases have not yet commenced. Committed amounts provide leading indicators.",
      "Monitor burn rate vs. completion percentage monthly. Flag any project where spend exceeds 110% of pro-rata budget."
    );
  }

  if (query.includes("vendor") && query.includes("payment")) {
    const allVendors = settlementProjects.flatMap(p => p.vendors.map(v => ({ ...v, project: p.obligationName, site: p.siteName })));
    const activeVendors = allVendors.filter(v => v.status === "Active");
    const totalContracted = allVendors.reduce((s, v) => s + v.contractAmount, 0);
    const totalPaid = allVendors.reduce((s, v) => s + v.paidAmount, 0);
    return formatExecutiveResponse(
      `Vendor payment summary: ${allVendors.length} vendor contracts totaling ${formatCurrency(totalContracted)}, with ${formatCurrency(totalPaid)} paid to date (${(totalPaid / totalContracted * 100).toFixed(0)}%).`,
      activeVendors.map(v =>
        `**${v.vendorName}** (${v.project}): Contract: ${formatCurrency(v.contractAmount)} | Paid: ${formatCurrency(v.paidAmount)} | Retainage: ${formatCurrency(v.retainage)} | Last Payment: ${v.lastPaymentDate}`
      ),
      `Outstanding commitments: ${formatCurrency(totalContracted - totalPaid)}. Active retainage held: ${formatCurrency(activeVendors.reduce((s, v) => s + v.retainage, 0))}.`,
      "Western Remediation Co. carries the largest single contract ($850K). Payment concentration risk is moderate with 5 active vendors across 3 projects.",
      "Ensure retainage release is tied to completion milestones and regulatory sign-off."
    );
  }

  if (query.includes("deficient") || query.includes("control")) {
    const deficient = controlItems.filter(c => c.status === "Deficient" || c.status === "Needs Improvement");
    const effective = controlItems.filter(c => c.status === "Effective");
    return formatExecutiveResponse(
      `Internal controls assessment: ${effective.length} of ${controlItems.length} controls rated Effective. ${deficient.length} controls require attention.`,
      deficient.map(c =>
        `**${c.controlName}** — Status: ${c.status} | Risk: ${c.riskRating} | Owner: ${c.owner} | Finding: ${c.findings} | Next Test: ${c.nextTestDate}`
      ),
      `${deficient.length} controls flagged for remediation. High-risk deficient control (${deficient.find(c => c.status === "Deficient")?.controlName}) requires immediate management response.`,
      "Regulatory Deadline Tracking deficiency presents compliance risk. Two near-misses on reporting deadlines indicate systemic process gap.",
      "Implement automated deadline alerting system and escalation workflow. Remediation target: Q1 2026."
    );
  }

  if (query.includes("audit") && query.includes("trail")) {
    const recent = auditTrail.slice(0, 8);
    const categories = auditTrail.reduce((acc, a) => { acc[a.category] = (acc[a.category] || 0) + 1; return acc; }, {} as Record<string, number>);
    return formatExecutiveResponse(
      `Audit trail summary: ${auditTrail.length} recorded actions in the current period across ${Object.keys(categories).length} categories.`,
      [
        `**Activity by Category**: ${Object.entries(categories).map(([k, v]) => `${k}: ${v}`).join(" | ")}`,
        ...recent.slice(0, 5).map(a => `${a.timestamp.split(" ")[0]} — **${a.action}** by ${a.user}: ${a.details.substring(0, 100)}...`),
      ],
      "Most recent material change: Marine Terminal Dismantlement liability revised upward by $200K on 2026-02-18.",
      "Financial category dominates activity (accretion postings, liability revisions). All changes are traceable to specific users and timestamps.",
      "Ensure all AI-generated explanations are logged to the audit trail for defensibility. Consider quarterly audit trail review with external auditors."
    );
  }

  if (query.includes("disclosure") || query.includes("outstanding")) {
    const incomplete = disclosureItems.filter(d => d.status !== "Complete" && d.status !== "N/A");
    const complete = disclosureItems.filter(d => d.status === "Complete");
    return formatExecutiveResponse(
      `Financial disclosure status: ${complete.length} of ${disclosureItems.length} requirements complete. ${incomplete.length} items require action before filing deadline.`,
      incomplete.map(d =>
        `**${d.standard} — ${d.requirement}**: Status: ${d.status} | Due: ${d.dueDate} | Owner: ${d.responsibleParty} | Note: ${d.notes}`
      ),
      `Closest deadline: ${incomplete.sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0]?.dueDate}. ${incomplete.filter(d => d.status === "Not Started").length} items not yet started.`,
      "ASC 450-20 regulatory proceedings disclosure awaits legal counsel input on Permian Basin investigation. SEC Reg S-K environmental CapEx disclosure depends on budget alignment completion.",
      "Escalate Not Started items to responsible parties immediately. Target all ASC 410/450 disclosures for completion by March 10 to allow review buffer."
    );
  }

  if (query.includes("anomal") || query.includes("flag")) {
    return formatExecutiveResponse(
      "Proactive anomaly scan identified 5 items requiring executive attention.",
      [
        "⚠️ **Liability Spike**: Marine Terminal Dismantlement revised +$200K (+5.8%) in single adjustment. Largest single-period revision in 12 months.",
        "⚠️ **Inconsistent Assumptions**: Discount rates range from 4.0% to 6.0% across portfolio. Appalachian Basin Groundwater Treatment uses lowest rate (4.0%) despite long-dated horizon.",
        "⚠️ **Budget Outlier**: Soil Contamination Cleanup forecast exceeds budget by 12%. Only remediation item with double-digit variance.",
        "⚠️ **Missing Data**: Well B-2 Plugging (OBL-004) shows $0 revision impact despite being active since 2021. May indicate stale estimate.",
        "⚠️ **Regulatory Risk**: Permian Basin site under investigation with 12 exceedances (highest in portfolio). Monthly monitoring cadence may be insufficient.",
      ],
      "Combined financial exposure from flagged items: approximately $4.8M in obligations with elevated uncertainty.",
      "Stale estimates and inconsistent discount rates create audit risk. Regulatory investigation at Permian Basin could trigger material scope changes.",
      "Recommend immediate review of discount rate methodology across portfolio and fresh cost estimate for Well B-2 Plugging."
    );
  }

  if (query.includes("risk score") || query.includes("portfolio risk")) {
    const portfolioScore = 67;
    return formatExecutiveResponse(
      `Portfolio Risk Score: **${portfolioScore}/100** (Elevated). The score reflects moderate-to-high financial and regulatory risk across the environmental obligation portfolio.`,
      [
        `**Data Completeness** (Score: 82/100): Most obligations have current estimates and review dates. 1 obligation flagged for potentially stale data.`,
        `**Forecast Uncertainty** (Score: 58/100): Inflation sensitivity analysis shows $1.2M swing under high-inflation scenario. Probability weighting not applied.`,
        `**Regulatory Volatility** (Score: 45/100): 1 site under active investigation (Permian Basin). 2 reporting deadline near-misses in Q1.`,
        `**Historical Cost Deviation** (Score: 72/100): Pipeline G Retirement settled 5% under budget. Active projects tracking within 10% tolerance.`,
        `**Settlement Variance Trends** (Score: 68/100): Net unfavorable budget variance of $80K across FY2026 items. Marine Terminal driving 63% of total variance.`,
      ],
      "The portfolio risk score increased from an estimated 61 in Q4 2025 due to the Permian Basin investigation escalation and Marine Terminal revision.",
      "Key risk concentration: Gulf Coast Terminal and Permian Basin account for 55% of risk-weighted exposure. Regulatory outcomes at these sites could shift the portfolio score ±15 points.",
      "Reduce score below 60 by: (1) resolving Permian Basin investigation findings, (2) completing Marine Terminal structural assessment, (3) implementing automated deadline tracking."
    );
  }

  if (query.includes("ero") && (query.includes("critical") || query.includes("risk"))) {
    const eroObs = obligations.filter(o => o.type === "ERO");
    const criticalExposures = environmentalExposures.filter(e => e.riskLevel === "Critical" || e.riskLevel === "High");
    return formatExecutiveResponse(
      `ERO Risk Assessment: ${eroObs.length} active environmental remediation obligations with ${formatCurrency(totalERO)} total liability. ${criticalExposures.length} high/critical exposure sites identified.`,
      criticalExposures.map(e =>
        `**${e.siteName} — ${e.contaminantType}**: Risk: ${e.riskLevel} | Cost: ${formatCurrency(e.estimatedCleanupCost)} | Exceedances: ${e.exceedanceCount} | Status: ${e.status} | Media: ${e.mediaAffected.join(", ")}`
      ),
      `Critical and high-risk exposures total ${formatCurrency(criticalExposures.reduce((s, e) => s + e.estimatedCleanupCost, 0))} in estimated cleanup costs.`,
      "Permian Basin carries the only Critical-rated exposure (produced water contamination, 12 exceedances, 3 media affected). This represents the highest regulatory risk in the portfolio.",
      "Accelerate Permian Basin remediation to reduce exceedance count before next regulatory review. Ensure Appalachian Basin treatment system optimization continues."
    );
  }

  if (query.includes("remediation") && query.includes("cost")) {
    const totalRemediation = environmentalExposures.reduce((s, e) => s + e.estimatedCleanupCost, 0);
    return formatExecutiveResponse(
      `Total estimated environmental remediation cost: ${formatCurrency(totalRemediation)} across ${environmentalExposures.length} exposure sites.`,
      environmentalExposures.map(e =>
        `**${e.siteName}** (${e.contaminantType}): ${formatCurrency(e.estimatedCleanupCost)} | ${e.status} | ${e.mediaAffected.join(", ")}`
      ),
      `Remediation costs represent ${(totalRemediation / totalCombined * 100).toFixed(0)}% of total portfolio liability. Active remediation sites account for ${formatCurrency(environmentalExposures.filter(e => e.status === "Remediation").reduce((s, e) => s + e.estimatedCleanupCost, 0))}.`,
      "Cost estimates carry significant uncertainty at monitoring-stage sites where full characterization is pending.",
      "Update cost estimates for monitoring-stage sites following completion of Phase II assessments."
    );
  }

  if (query.includes("compare") && (query.includes("base") || query.includes("inflation") || query.includes("scenario"))) {
    const base = forecastScenarios[0];
    const high = forecastScenarios[1];
    const yr2030base = base.projections.find(p => p.year === 2030);
    const yr2030high = high.projections.find(p => p.year === 2030);
    return formatExecutiveResponse(
      `Scenario comparison: Base Case (2.5% inflation) vs. High Inflation (4.0% inflation) over the 10-year forecast horizon.`,
      [
        `**2030 Total Liability**: Base: ${formatCurrencyK((yr2030base?.aroLiability || 0) + (yr2030base?.eroLiability || 0))} vs. High: ${formatCurrencyK((yr2030high?.aroLiability || 0) + (yr2030high?.eroLiability || 0))} — Δ${formatCurrencyK(((yr2030high?.aroLiability || 0) + (yr2030high?.eroLiability || 0)) - ((yr2030base?.aroLiability || 0) + (yr2030base?.eroLiability || 0)))}`,
        `**2035 Total Liability**: Base: ${formatCurrencyK(base.projections[9].aroLiability + base.projections[9].eroLiability)} vs. High: ${formatCurrencyK(high.projections[9].aroLiability + high.projections[9].eroLiability)}`,
        `**Peak Accretion**: Base: ${formatCurrencyK(Math.max(...base.projections.map(p => p.accretion)))} vs. High: ${formatCurrencyK(Math.max(...high.projections.map(p => p.accretion)))}`,
        `**Cumulative Settlements**: Base: ${formatCurrencyK(base.projections.reduce((s, p) => s + p.settlements, 0))} vs. High: ${formatCurrencyK(high.projections.reduce((s, p) => s + p.settlements, 0))}`,
      ],
      `High Inflation scenario adds approximately ${formatCurrencyK((high.projections[9].aroLiability + high.projections[9].eroLiability) - (base.projections[9].aroLiability + base.projections[9].eroLiability))} to terminal liability by 2035.`,
      "Inflation sensitivity is highest for long-dated AROs (Marine Terminal, Pipeline Abandonment) where settlement is 10+ years out. Consider inflation-linked hedging strategies.",
      "Present both scenarios to audit committee with recommendation to use Base Case for financial reporting and High Inflation for risk management planning."
    );
  }

  if (query.includes("rollforward") || query.includes("asc 410")) {
    const aroObs = obligations.filter(o => o.type === "ARO");
    const beginBal = liabilityTrendData[liabilityTrendData.length - 2]?.aro || 11300000;
    const endBal = totalARO;
    const accretion = getTotalAccretion("ARO");
    const revisions = aroObs.reduce((s, o) => s + (o.revisionImpact || 0), 0);
    return formatExecutiveResponse(
      `ASC 410-20 ARO Liability Rollforward — Q1 2026`,
      [
        `**Beginning Balance (Q4 2025)**: ${formatCurrency(beginBal)}`,
        `**Accretion Expense**: +${formatCurrency(accretion)}`,
        `**Upward Revisions**: +${formatCurrency(Math.max(0, revisions))}`,
        `**Downward Revisions**: ${formatCurrency(Math.min(0, revisions))}`,
        `**Settlements / Disposals**: ${formatCurrency(0)} (none in period)`,
        `**Ending Balance (Q1 2026)**: ${formatCurrency(endBal)}`,
      ],
      `Net change: +${formatCurrency(endBal - beginBal)} (${((endBal - beginBal) / beginBal * 100).toFixed(1)}%). Accretion represents the primary driver at ${formatCurrency(accretion)}.`,
      "Disclosure-ready format. Revision details by obligation available in ARO Tracking module.",
      "Cross-reference with auditor schedules and ensure consistency with ASC 410-20-50 requirements."
    );
  }

  if (query.includes("site") && query.includes("most") && query.includes("obligation")) {
    const siteCounts = sites.map(s => ({
      name: s.name,
      count: obligations.filter(o => o.siteId === s.id).length,
      liability: obligations.filter(o => o.siteId === s.id).reduce((sum, o) => sum + o.currentLiability, 0),
    })).sort((a, b) => b.count - a.count);
    return formatExecutiveResponse(
      `Obligation concentration by site. ${siteCounts[0].name} leads with ${siteCounts[0].count} obligations.`,
      siteCounts.map(s => `**${s.name}**: ${s.count} obligations | Total Liability: ${formatCurrency(s.liability)}`),
      `Top site (${siteCounts[0].name}) accounts for ${(siteCounts[0].liability / totalCombined * 100).toFixed(0)}% of total portfolio liability.`,
      "High obligation concentration increases operational complexity and regulatory coordination burden at top sites.",
      "Consider site-level risk aggregation reviews to identify potential scope consolidation opportunities."
    );
  }

  // Default response
  return formatExecutiveResponse(
    `Analysis request received. Based on the current portfolio of ${obligations.length} obligations across ${sites.length} sites with ${formatCurrency(totalCombined)} total liability:`,
    [
      `**ARO Portfolio**: ${formatCurrency(totalARO)} (${obligations.filter(o => o.type === "ARO").length} obligations)`,
      `**ERO Portfolio**: ${formatCurrency(totalERO)} (${obligations.filter(o => o.type === "ERO").length} obligations)`,
      `**Active Obligations**: ${activeCount} of ${obligations.length} total`,
      `**Annual Accretion**: ${formatCurrency(totalAccretion)}`,
      `**Environmental Exposures**: ${environmentalExposures.length} tracked (${environmentalExposures.filter(e => e.riskLevel === "Critical" || e.riskLevel === "High").length} high/critical)`,
    ],
    `Portfolio is actively managed with ${settlementProjects.filter(p => p.status !== "Closed").length} open settlement projects and ${disclosureItems.filter(d => d.status !== "Complete").length} pending disclosure requirements.`,
    "Insufficient data to provide a more specific analysis for this query. Please refine your question or select a specific view (Portfolio, Site, Project, or ARO) for targeted insights.",
    "Try asking about specific topics: liability trends, risk scores, budget variances, ARO assumptions, exposure drivers, or disclosure status."
  );
}

function formatExecutiveResponse(
  summary: string,
  drivers: string[],
  financialImpact: string,
  riskImplication: string,
  recommendedAction: string
): string {
  return [
    `## Executive Summary\n${summary}`,
    `\n## Key Drivers\n${drivers.map(d => `- ${d}`).join("\n")}`,
    `\n## Financial Impact\n${financialImpact}`,
    `\n## Risk Implication\n${riskImplication}`,
    `\n## Recommended Action\n${recommendedAction}`,
  ].join("\n");
}
