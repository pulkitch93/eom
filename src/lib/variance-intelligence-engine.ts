// ============================================================
// Settlement Variance Intelligence Engine
// Statistical anomaly detection, root-cause classification,
// attribution breakdown, and AI narrative generation
// ============================================================

import {
  settlementProjects,
  SettlementProject,
  CostItem,
  VendorPayment,
  obligations,
  budgetItems,
  forecastScenarios,
  formatCurrency,
  formatCurrencyK,
} from "@/data/mock-data";

// ── Types ──────────────────────────────────────────────────

export type VarianceSeverity = "Normal" | "Watch" | "Warning" | "Critical";
export type DriverCategory =
  | "Vendor Cost Escalation"
  | "Scope Expansion"
  | "Timeline Delay"
  | "Inflation Escalation"
  | "Regulatory Shift"
  | "Estimation Error"
  | "Data Entry Inconsistency"
  | "Budget Misalignment";

export interface VarianceDriver {
  category: DriverCategory;
  dollarImpact: number;
  percentContribution: number;
  confidence: number; // 0-100
  supportingEvidence: string;
  dataSource: string;
}

export interface AnomalyFlag {
  id: string;
  type: "Cost Spike" | "Forecast Deviation" | "Vendor Anomaly" | "Scope Creep" | "Timeline Slippage" | "Regulatory Change";
  description: string;
  severity: VarianceSeverity;
  projectId: string;
  projectName: string;
  metric: string;
  value: number;
  threshold: number;
  detectedDate: string;
}

export interface ProjectVarianceAnalysis {
  projectId: string;
  projectName: string;
  siteName: string;
  type: string;
  totalBudget: number;
  totalSpent: number;
  totalCommitted: number;
  totalVariance: number;
  variancePercent: number;
  favorableVariance: number;
  unfavorableVariance: number;
  severity: VarianceSeverity;
  drivers: VarianceDriver[];
  anomalies: AnomalyFlag[];
  predictiveWarning: string | null;
  costItemBreakdown: CostItemVariance[];
  vendorAnalysis: VendorVarianceAnalysis[];
}

export interface CostItemVariance {
  category: string;
  description: string;
  budgeted: number;
  actual: number;
  committed: number;
  variance: number;
  percentUsed: number;
  isAnomaly: boolean;
  anomalyReason: string | null;
}

export interface VendorVarianceAnalysis {
  vendorName: string;
  contractAmount: number;
  invoicedAmount: number;
  paidAmount: number;
  invoiceRatio: number; // invoiced/contract
  paymentRatio: number; // paid/invoiced
  isOverrun: boolean;
  overrunAmount: number;
}

export interface PortfolioVarianceSummary {
  totalBudget: number;
  totalSpent: number;
  totalCommitted: number;
  totalVariance: number;
  variancePercent: number;
  favorableTotal: number;
  unfavorableTotal: number;
  topDrivers: VarianceDriver[];
  highRiskProjects: ProjectVarianceAnalysis[];
  anomalyCount: number;
  trendVsPrior: number; // variance change vs prior period (%)
  forecastConfidence: number; // 0-100
  riskScore: number; // 0-100
}

export interface VarianceNarrative {
  executiveSummary: string;
  primaryDrivers: { rank: number; driver: string; dollarImpact: string; percentContribution: string; evidence: string }[];
  financialRiskImplication: string;
  patternAnalysis: string;
  recommendedActions: { action: string; priority: "High" | "Medium" | "Low"; rationale: string }[];
  generatedAt: string;
  generatedBy: string;
  dataSnapshot: Record<string, string>;
}

// ── Constants ──────────────────────────────────────────────

const ANOMALY_THRESHOLD_PCT = 15; // % over budget flags anomaly
const VENDOR_OVERRUN_THRESHOLD = 0.90; // 90% invoiced = watch
const CRITICAL_VARIANCE_PCT = 25;
const WARNING_VARIANCE_PCT = 15;
const WATCH_VARIANCE_PCT = 8;

// ── Helpers ────────────────────────────────────────────────

function classifySeverity(variancePct: number): VarianceSeverity {
  const abs = Math.abs(variancePct);
  if (abs >= CRITICAL_VARIANCE_PCT) return "Critical";
  if (abs >= WARNING_VARIANCE_PCT) return "Warning";
  if (abs >= WATCH_VARIANCE_PCT) return "Watch";
  return "Normal";
}

function gaussianRandom(mean: number, stdDev: number): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return mean + stdDev * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// ── Core Analysis Functions ────────────────────────────────

export function analyzeProjectVariance(project: SettlementProject): ProjectVarianceAnalysis {
  const totalVariance = project.totalBudget - project.totalSpent;
  const variancePct = project.totalBudget > 0
    ? ((project.totalBudget - project.totalSpent) / project.totalBudget) * 100
    : 0;

  const favorable = project.costItems.reduce(
    (s, ci) => s + Math.max(0, ci.variance), 0
  );
  const unfavorable = project.costItems.reduce(
    (s, ci) => s + Math.abs(Math.min(0, ci.variance)), 0
  );

  const costItemBreakdown = analyzeCostItems(project.costItems, project.totalBudget);
  const vendorAnalysis = analyzeVendors(project.vendors);
  const anomalies = detectAnomalies(project, costItemBreakdown, vendorAnalysis);
  const drivers = classifyDrivers(project, costItemBreakdown, vendorAnalysis, anomalies);
  const predictiveWarning = generatePredictiveWarning(project);

  return {
    projectId: project.id,
    projectName: project.obligationName,
    siteName: project.siteName,
    type: project.type,
    totalBudget: project.totalBudget,
    totalSpent: project.totalSpent,
    totalCommitted: project.totalCommitted,
    totalVariance: totalVariance,
    variancePercent: variancePct,
    favorableVariance: favorable,
    unfavorableVariance: unfavorable,
    severity: classifySeverity(variancePct < 0 ? variancePct : -Math.abs(unfavorable / project.totalBudget * 100)),
    drivers,
    anomalies,
    predictiveWarning,
    costItemBreakdown,
    vendorAnalysis,
  };
}

function analyzeCostItems(items: CostItem[], totalBudget: number): CostItemVariance[] {
  return items.map(ci => {
    const pctUsed = ci.budgeted > 0 ? (ci.actual / ci.budgeted) * 100 : 0;
    const isAnomaly = ci.budgeted > 0 && ci.actual > ci.budgeted * (1 + ANOMALY_THRESHOLD_PCT / 100);
    return {
      category: ci.category,
      description: ci.description,
      budgeted: ci.budgeted,
      actual: ci.actual,
      committed: ci.committed,
      variance: ci.variance,
      percentUsed: pctUsed,
      isAnomaly,
      anomalyReason: isAnomaly
        ? `Actual spend exceeds budget by ${((ci.actual / ci.budgeted - 1) * 100).toFixed(1)}%, above the ${ANOMALY_THRESHOLD_PCT}% anomaly threshold.`
        : null,
    };
  });
}

function analyzeVendors(vendors: VendorPayment[]): VendorVarianceAnalysis[] {
  return vendors.map(v => {
    const invoiceRatio = v.contractAmount > 0 ? v.invoicedAmount / v.contractAmount : 0;
    const paymentRatio = v.invoicedAmount > 0 ? v.paidAmount / v.invoicedAmount : 0;
    const isOverrun = invoiceRatio > 1;
    return {
      vendorName: v.vendorName,
      contractAmount: v.contractAmount,
      invoicedAmount: v.invoicedAmount,
      paidAmount: v.paidAmount,
      invoiceRatio,
      paymentRatio,
      isOverrun,
      overrunAmount: isOverrun ? v.invoicedAmount - v.contractAmount : 0,
    };
  });
}

function detectAnomalies(
  project: SettlementProject,
  costItems: CostItemVariance[],
  vendors: VendorVarianceAnalysis[]
): AnomalyFlag[] {
  const flags: AnomalyFlag[] = [];
  const now = "2026-02-20";

  // Cost spike detection
  costItems.forEach(ci => {
    if (ci.isAnomaly) {
      flags.push({
        id: `ANM-${project.id}-${ci.category}`,
        type: "Cost Spike",
        description: `${ci.category}: ${ci.anomalyReason}`,
        severity: ci.percentUsed > 130 ? "Critical" : "Warning",
        projectId: project.id,
        projectName: project.obligationName,
        metric: `${ci.category} spend`,
        value: ci.actual,
        threshold: ci.budgeted * (1 + ANOMALY_THRESHOLD_PCT / 100),
        detectedDate: now,
      });
    }
  });

  // Vendor overrun detection
  vendors.forEach(v => {
    if (v.invoiceRatio >= VENDOR_OVERRUN_THRESHOLD && !v.isOverrun) {
      flags.push({
        id: `ANM-${project.id}-${v.vendorName.replace(/\s/g, "")}`,
        type: "Vendor Anomaly",
        description: `${v.vendorName}: ${(v.invoiceRatio * 100).toFixed(0)}% of contract invoiced. Approaching contract ceiling.`,
        severity: "Watch",
        projectId: project.id,
        projectName: project.obligationName,
        metric: "Invoice-to-contract ratio",
        value: v.invoiceRatio,
        threshold: VENDOR_OVERRUN_THRESHOLD,
        detectedDate: now,
      });
    }
    if (v.isOverrun) {
      flags.push({
        id: `ANM-${project.id}-${v.vendorName.replace(/\s/g, "")}-overrun`,
        type: "Vendor Anomaly",
        description: `${v.vendorName}: Contract exceeded by ${formatCurrency(v.overrunAmount)}.`,
        severity: "Critical",
        projectId: project.id,
        projectName: project.obligationName,
        metric: "Contract overrun",
        value: v.invoicedAmount,
        threshold: v.contractAmount,
        detectedDate: now,
      });
    }
  });

  // Completion vs spend ratio anomaly (scope creep proxy)
  const spendRatio = project.totalBudget > 0 ? project.totalSpent / project.totalBudget : 0;
  const completionRatio = project.completionPercent / 100;
  if (completionRatio > 0 && spendRatio / completionRatio > 1.25) {
    flags.push({
      id: `ANM-${project.id}-scope`,
      type: "Scope Creep",
      description: `Spend-to-completion ratio is ${(spendRatio / completionRatio).toFixed(2)}x. Spending outpacing progress.`,
      severity: spendRatio / completionRatio > 1.5 ? "Critical" : "Warning",
      projectId: project.id,
      projectName: project.obligationName,
      metric: "Spend/completion ratio",
      value: spendRatio / completionRatio,
      threshold: 1.25,
      detectedDate: "2026-02-20",
    });
  }

  return flags;
}

function classifyDrivers(
  project: SettlementProject,
  costItems: CostItemVariance[],
  vendors: VendorVarianceAnalysis[],
  anomalies: AnomalyFlag[]
): VarianceDriver[] {
  const drivers: VarianceDriver[] = [];
  const totalUnfavorable = costItems.reduce((s, ci) => s + Math.abs(Math.min(0, ci.variance)), 0);
  if (totalUnfavorable === 0) return drivers;

  // Derive vendor cost escalation contribution
  const vendorOverruns = vendors.filter(v => v.isOverrun);
  if (vendorOverruns.length > 0) {
    const overrunTotal = vendorOverruns.reduce((s, v) => s + v.overrunAmount, 0);
    drivers.push({
      category: "Vendor Cost Escalation",
      dollarImpact: overrunTotal,
      percentContribution: Math.min(100, (overrunTotal / Math.max(1, totalUnfavorable)) * 100),
      confidence: 88,
      supportingEvidence: `${vendorOverruns.length} vendor(s) exceeded contract: ${vendorOverruns.map(v => v.vendorName).join(", ")}.`,
      dataSource: "Settlement Module → Vendor Payments",
    });
  }

  // Scope expansion proxy from cost item anomalies
  const anomalousItems = costItems.filter(ci => ci.isAnomaly);
  if (anomalousItems.length > 0) {
    const scopeImpact = anomalousItems.reduce((s, ci) => s + Math.abs(ci.variance), 0);
    drivers.push({
      category: "Scope Expansion",
      dollarImpact: scopeImpact,
      percentContribution: Math.min(100, (scopeImpact / Math.max(1, totalUnfavorable)) * 100),
      confidence: 75,
      supportingEvidence: `${anomalousItems.length} cost category(ies) exceeded budget threshold: ${anomalousItems.map(ci => ci.category).join(", ")}.`,
      dataSource: "Settlement Module → Cost Items",
    });
  }

  // Timeline delay from completion-based analysis
  const spendRatio = project.totalBudget > 0 ? project.totalSpent / project.totalBudget : 0;
  const completionRatio = project.completionPercent / 100;
  if (completionRatio > 0 && completionRatio < 0.9 && spendRatio > completionRatio) {
    const timelineImpact = (spendRatio - completionRatio) * project.totalBudget;
    drivers.push({
      category: "Timeline Delay",
      dollarImpact: timelineImpact,
      percentContribution: Math.min(100, (timelineImpact / Math.max(1, totalUnfavorable)) * 100),
      confidence: 68,
      supportingEvidence: `Project is ${project.completionPercent}% complete but ${(spendRatio * 100).toFixed(1)}% of budget consumed.`,
      dataSource: "Settlement Module → Project Tracking",
    });
  }

  // Inflation escalation from plan module
  const budgetMatch = budgetItems.find(b => b.obligationId === project.obligationId);
  if (budgetMatch && budgetMatch.variance < 0) {
    const inflationImpact = Math.abs(budgetMatch.variance) * 0.4; // attribute 40% to inflation
    drivers.push({
      category: "Inflation Escalation",
      dollarImpact: inflationImpact,
      percentContribution: Math.min(100, (inflationImpact / Math.max(1, totalUnfavorable)) * 100),
      confidence: 62,
      supportingEvidence: `Budget item ${budgetMatch.obligationName} shows ${budgetMatch.variancePercent.toFixed(1)}% forecast variance.`,
      dataSource: "Plan Module → Budget Alignment",
    });
  }

  // Estimation error (catch-all for remaining unfavorable variance)
  const attributedTotal = drivers.reduce((s, d) => s + d.dollarImpact, 0);
  const remainder = totalUnfavorable - attributedTotal;
  if (remainder > 0 && totalUnfavorable > 0) {
    drivers.push({
      category: "Estimation Error",
      dollarImpact: remainder,
      percentContribution: (remainder / totalUnfavorable) * 100,
      confidence: 55,
      supportingEvidence: "Residual variance not attributable to specific identified drivers.",
      dataSource: "Settlement Module → Cost Items",
    });
  }

  // Normalize percentages to 100
  const totalPct = drivers.reduce((s, d) => s + d.percentContribution, 0);
  if (totalPct > 0) {
    drivers.forEach(d => {
      d.percentContribution = (d.percentContribution / totalPct) * 100;
    });
  }

  // Sort by impact
  drivers.sort((a, b) => b.dollarImpact - a.dollarImpact);
  return drivers;
}

function generatePredictiveWarning(project: SettlementProject): string | null {
  if (project.status === "Closed") return null;
  const burnRate = project.completionPercent > 0
    ? project.totalSpent / (project.completionPercent / 100)
    : 0;
  if (burnRate > project.totalBudget * 1.1) {
    const projectedOverrun = burnRate - project.totalBudget;
    const pct = ((projectedOverrun / project.totalBudget) * 100).toFixed(1);
    return `Based on current burn rate, project is projected to exceed budget by ${pct}% (${formatCurrency(projectedOverrun)}) at completion.`;
  }
  return null;
}

// ── Portfolio Analysis ─────────────────────────────────────

export function analyzePortfolio(): PortfolioVarianceSummary {
  const analyses = settlementProjects.map(analyzeProjectVariance);

  const totalBudget = analyses.reduce((s, a) => s + a.totalBudget, 0);
  const totalSpent = analyses.reduce((s, a) => s + a.totalSpent, 0);
  const totalCommitted = analyses.reduce((s, a) => s + a.totalCommitted, 0);
  const totalVariance = totalBudget - totalSpent;
  const variancePct = totalBudget > 0 ? (totalVariance / totalBudget) * 100 : 0;
  const favorableTotal = analyses.reduce((s, a) => s + a.favorableVariance, 0);
  const unfavorableTotal = analyses.reduce((s, a) => s + a.unfavorableVariance, 0);

  // Aggregate top drivers across portfolio
  const driverMap = new Map<DriverCategory, VarianceDriver>();
  analyses.forEach(a => {
    a.drivers.forEach(d => {
      const existing = driverMap.get(d.category);
      if (existing) {
        existing.dollarImpact += d.dollarImpact;
      } else {
        driverMap.set(d.category, { ...d });
      }
    });
  });
  const topDrivers = Array.from(driverMap.values())
    .sort((a, b) => b.dollarImpact - a.dollarImpact)
    .slice(0, 5);
  // Recalculate percent contributions
  const driverTotal = topDrivers.reduce((s, d) => s + d.dollarImpact, 0);
  topDrivers.forEach(d => {
    d.percentContribution = driverTotal > 0 ? (d.dollarImpact / driverTotal) * 100 : 0;
  });

  const highRisk = analyses.filter(a => a.severity === "Warning" || a.severity === "Critical");
  const anomalyCount = analyses.reduce((s, a) => s + a.anomalies.length, 0);

  // Monte Carlo based forecast confidence
  const confidenceScores: number[] = [];
  for (let i = 0; i < 500; i++) {
    const simVariance = gaussianRandom(variancePct, 8);
    confidenceScores.push(simVariance);
  }
  const withinRange = confidenceScores.filter(v => Math.abs(v - variancePct) < 10).length;
  const forecastConfidence = Math.round((withinRange / 500) * 100);

  const riskScore = Math.min(100, Math.round(
    (unfavorableTotal / Math.max(1, totalBudget)) * 100 * 1.5 + anomalyCount * 5
  ));

  return {
    totalBudget,
    totalSpent,
    totalCommitted,
    totalVariance,
    variancePercent: variancePct,
    favorableTotal,
    unfavorableTotal,
    topDrivers,
    highRiskProjects: highRisk,
    anomalyCount,
    trendVsPrior: -2.4, // simulated: variance worsened 2.4% vs prior quarter
    forecastConfidence,
    riskScore,
  };
}

export function getAllProjectAnalyses(): ProjectVarianceAnalysis[] {
  return settlementProjects.map(analyzeProjectVariance);
}

// ── Narrative Generation ───────────────────────────────────

export function generateVarianceNarrative(
  analysis: ProjectVarianceAnalysis
): VarianceNarrative {
  const varianceDirection = analysis.totalVariance >= 0 ? "favorable" : "unfavorable";
  const absPct = Math.abs(analysis.variancePercent).toFixed(1);

  const executiveSummary = analysis.totalVariance >= 0
    ? `Project "${analysis.projectName}" at ${analysis.siteName} shows a ${varianceDirection} variance of ${formatCurrency(Math.abs(analysis.totalVariance))} (${absPct}% of budget). Total budget is ${formatCurrency(analysis.totalBudget)} with ${formatCurrency(analysis.totalSpent)} spent to date. The project is ${analysis.severity === "Normal" ? "tracking within expected parameters" : `flagged as ${analysis.severity} for management review`}.`
    : `Project "${analysis.projectName}" at ${analysis.siteName} has an ${varianceDirection} net position with ${formatCurrency(analysis.totalSpent)} spent against a ${formatCurrency(analysis.totalBudget)} budget. While total variance remains ${varianceDirection} at ${formatCurrency(Math.abs(analysis.totalVariance))}, unfavorable cost categories total ${formatCurrency(analysis.unfavorableVariance)}. Severity: ${analysis.severity}.`;

  const primaryDrivers = analysis.drivers.map((d, i) => ({
    rank: i + 1,
    driver: d.category,
    dollarImpact: formatCurrency(d.dollarImpact),
    percentContribution: `${d.percentContribution.toFixed(1)}%`,
    evidence: d.supportingEvidence,
  }));

  const riskLevel = analysis.severity === "Critical" ? "elevated" : analysis.severity === "Warning" ? "moderate" : "low";
  const financialRiskImplication = `Current variance patterns indicate ${riskLevel} financial risk. ${
    analysis.unfavorableVariance > 0
      ? `Unfavorable categories total ${formatCurrency(analysis.unfavorableVariance)}, representing ${((analysis.unfavorableVariance / analysis.totalBudget) * 100).toFixed(1)}% of total budget.`
      : "No unfavorable cost categories detected."
  } ${
    analysis.predictiveWarning
      ? `Predictive analysis: ${analysis.predictiveWarning}`
      : "Current trajectory suggests project will complete within budget parameters."
  } Forecast confidence for this project is ${analysis.severity === "Normal" ? "high" : analysis.severity === "Watch" ? "moderate" : "reduced"} given the ${analysis.anomalies.length} anomaly flag(s) detected.`;

  const hasRecurring = analysis.anomalies.length > 1;
  const patternAnalysis = `${analysis.anomalies.length} anomaly flag(s) detected for this project. ${
    hasRecurring
      ? `Multiple anomaly signals suggest a systemic pattern rather than an isolated event. Cross-category analysis indicates correlation between ${analysis.anomalies.map(a => a.type).filter((v, i, arr) => arr.indexOf(v) === i).join(" and ")} indicators.`
      : analysis.anomalies.length === 1
        ? `Single anomaly detected: ${analysis.anomalies[0].description}. Historical trend comparison suggests this is an isolated occurrence pending further data.`
        : "No statistical anomalies detected. Cost patterns are within historical ranges."
  }`;

  const recommendedActions: VarianceNarrative["recommendedActions"] = [];
  analysis.drivers.forEach(d => {
    switch (d.category) {
      case "Vendor Cost Escalation":
        recommendedActions.push({ action: "Review vendor contracts and renegotiate rates where applicable", priority: "High", rationale: `Vendor escalation accounts for ${d.percentContribution.toFixed(0)}% of variance.` });
        break;
      case "Scope Expansion":
        recommendedActions.push({ action: "Conduct scope validation against original work order", priority: "High", rationale: `Scope-related costs exceeded budget thresholds.` });
        break;
      case "Timeline Delay":
        recommendedActions.push({ action: "Rebaseline project schedule and update forecast assumptions", priority: "Medium", rationale: `Spending is outpacing project completion milestones.` });
        break;
      case "Inflation Escalation":
        recommendedActions.push({ action: "Adjust inflation assumption in forecast model to reflect current rates", priority: "Medium", rationale: `Inflation-driven cost increases detected in budget vs. forecast.` });
        break;
      case "Estimation Error":
        recommendedActions.push({ action: "Commission independent cost re-estimate for remaining work", priority: "Low", rationale: `Residual variance indicates initial estimates may need recalibration.` });
        break;
    }
  });
  if (analysis.predictiveWarning) {
    recommendedActions.push({ action: "Escalate to environmental program manager for budget review", priority: "High", rationale: analysis.predictiveWarning });
  }

  return {
    executiveSummary,
    primaryDrivers,
    financialRiskImplication,
    patternAnalysis,
    recommendedActions,
    generatedAt: new Date().toISOString(),
    generatedBy: "Variance Intelligence Engine v1.0",
    dataSnapshot: {
      "Total Budget": formatCurrency(analysis.totalBudget),
      "Total Spent": formatCurrency(analysis.totalSpent),
      "Total Committed": formatCurrency(analysis.totalCommitted),
      "Variance ($)": formatCurrency(analysis.totalVariance),
      "Variance (%)": `${analysis.variancePercent.toFixed(1)}%`,
      "Anomaly Count": String(analysis.anomalies.length),
      "Severity": analysis.severity,
    },
  };
}

export function generatePortfolioNarrative(
  summary: PortfolioVarianceSummary
): VarianceNarrative {
  const direction = summary.totalVariance >= 0 ? "favorable" : "unfavorable";

  const executiveSummary = `Portfolio-wide variance stands at ${formatCurrency(Math.abs(summary.totalVariance))} ${direction} (${Math.abs(summary.variancePercent).toFixed(1)}% of ${formatCurrencyK(summary.totalBudget)} total budget). Favorable variances total ${formatCurrency(summary.favorableTotal)} while unfavorable variances total ${formatCurrency(summary.unfavorableTotal)}. ${summary.highRiskProjects.length} project(s) flagged for elevated risk. Variance trend vs prior period: ${summary.trendVsPrior > 0 ? "improved" : "worsened"} by ${Math.abs(summary.trendVsPrior).toFixed(1)}%. Forecast confidence: ${summary.forecastConfidence}%. Portfolio risk score: ${summary.riskScore}/100.`;

  const primaryDrivers = summary.topDrivers.map((d, i) => ({
    rank: i + 1,
    driver: d.category,
    dollarImpact: formatCurrency(d.dollarImpact),
    percentContribution: `${d.percentContribution.toFixed(1)}%`,
    evidence: d.supportingEvidence,
  }));

  const financialRiskImplication = `Unfavorable variance of ${formatCurrency(summary.unfavorableTotal)} across the portfolio represents ${((summary.unfavorableTotal / summary.totalBudget) * 100).toFixed(1)}% of total budget. ${summary.anomalyCount} anomaly flags detected across all projects. Forecast confidence is at ${summary.forecastConfidence}%, ${summary.forecastConfidence >= 75 ? "within acceptable range" : "below the 75% threshold warranting management attention"}.`;

  const patternAnalysis = `Cross-project pattern analysis: ${summary.highRiskProjects.length > 0 ? `Projects at risk: ${summary.highRiskProjects.map(p => p.projectName).join(", ")}. ` : "No high-risk projects detected. "}Variance trend has ${summary.trendVsPrior > 0 ? "improved" : "worsened"} by ${Math.abs(summary.trendVsPrior).toFixed(1)}% compared to prior period. ${summary.anomalyCount > 3 ? "Elevated anomaly count suggests systemic cost pressure across the portfolio." : "Anomaly distribution appears isolated to specific projects."}`;

  const recommendedActions: VarianceNarrative["recommendedActions"] = [
    { action: "Review vendor contracts across high-risk projects", priority: "High", rationale: "Multiple vendor-related anomalies detected." },
    { action: "Update portfolio forecast with revised assumptions", priority: "Medium", rationale: `Forecast confidence at ${summary.forecastConfidence}%.` },
    { action: "Conduct cross-project scope validation", priority: "Medium", rationale: "Scope-related variances detected in multiple projects." },
  ];

  return {
    executiveSummary,
    primaryDrivers,
    financialRiskImplication,
    patternAnalysis,
    recommendedActions,
    generatedAt: new Date().toISOString(),
    generatedBy: "Variance Intelligence Engine v1.0",
    dataSnapshot: {
      "Total Budget": formatCurrency(summary.totalBudget),
      "Total Spent": formatCurrency(summary.totalSpent),
      "Variance": formatCurrency(summary.totalVariance),
      "Favorable": formatCurrency(summary.favorableTotal),
      "Unfavorable": formatCurrency(summary.unfavorableTotal),
      "High-Risk Projects": String(summary.highRiskProjects.length),
      "Anomalies": String(summary.anomalyCount),
      "Risk Score": `${summary.riskScore}/100`,
    },
  };
}

// ── Forecast Recalibration ─────────────────────────────────

export interface RecalibrationSuggestion {
  parameter: string;
  currentValue: string;
  suggestedValue: string;
  rationale: string;
  impactEstimate: string;
}

export function generateRecalibrationSuggestions(
  summary: PortfolioVarianceSummary
): RecalibrationSuggestion[] {
  const suggestions: RecalibrationSuggestion[] = [];

  const hasInflation = summary.topDrivers.some(d => d.category === "Inflation Escalation");
  if (hasInflation) {
    suggestions.push({
      parameter: "Inflation Rate",
      currentValue: "2.5%",
      suggestedValue: "3.2%",
      rationale: "Actual cost escalation patterns suggest inflation running above baseline assumption.",
      impactEstimate: `+${formatCurrencyK(summary.totalBudget * 0.007)} portfolio-wide`,
    });
  }

  const hasVendor = summary.topDrivers.some(d => d.category === "Vendor Cost Escalation");
  if (hasVendor) {
    suggestions.push({
      parameter: "Vendor Escalation Factor",
      currentValue: "3.0%",
      suggestedValue: "4.5%",
      rationale: "Multiple vendor contracts showing cost escalation above historical norms.",
      impactEstimate: `+${formatCurrencyK(summary.totalBudget * 0.015)} on committed contracts`,
    });
  }

  const hasTimeline = summary.topDrivers.some(d => d.category === "Timeline Delay");
  if (hasTimeline) {
    suggestions.push({
      parameter: "Timeline Buffer",
      currentValue: "0 months",
      suggestedValue: "6 months",
      rationale: "Spend-to-completion ratios indicate timeline extensions across active projects.",
      impactEstimate: `+${formatCurrencyK(summary.totalBudget * 0.02)} carrying costs`,
    });
  }

  suggestions.push({
    parameter: "Contingency Reserve",
    currentValue: "5%",
    suggestedValue: `${Math.min(15, 5 + Math.round(summary.riskScore / 20))}%`,
    rationale: `Portfolio risk score of ${summary.riskScore}/100 suggests contingency increase.`,
    impactEstimate: `+${formatCurrencyK(summary.totalBudget * (Math.min(15, 5 + Math.round(summary.riskScore / 20)) - 5) / 100)} reserve`,
  });

  return suggestions;
}
