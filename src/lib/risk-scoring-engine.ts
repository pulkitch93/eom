// ============================================================
// Executive Environmental Risk Scoring Engine
// Structured, explainable, defensible risk scoring
// ============================================================

import {
  obligations,
  sites,
  settlementProjects,
  environmentalExposures,
  forecastScenarios,
  type Obligation,
  type Site,
} from "@/data/mock-data";

// ---- Types ----

export type RiskLevel = "Low" | "Moderate" | "High" | "Critical";
export type RiskTrend = "Improving" | "Stable" | "Deteriorating";

export interface RiskComponentScore {
  name: string;
  key: string;
  score: number; // 0–100
  weight: number; // decimal (sums to 1.0)
  weightedScore: number;
  drivers: string[];
  details: string;
}

export interface SiteRiskScore {
  siteId: string;
  siteName: string;
  region: string;
  compositeScore: number;
  level: RiskLevel;
  trend: RiskTrend;
  components: RiskComponentScore[];
  topDrivers: { driver: string; contribution: number }[];
  obligationCount: number;
  totalExposure: number;
}

export interface PortfolioRiskResult {
  portfolioScore: number;
  portfolioLevel: RiskLevel;
  portfolioTrend: RiskTrend;
  exposureVolatility: number; // 0–100
  forecastConfidence: number; // 0–100
  siteScores: SiteRiskScore[];
  topDrivers: { driver: string; contribution: number }[];
  trendHistory: { period: string; score: number }[];
  narrative: RiskNarrative;
  timestamp: string;
}

export interface RiskNarrative {
  executiveSummary: string;
  topDrivers: { driver: string; contribution: string; detail: string }[];
  exposureVolatility: string;
  trendAnalysis: string;
  recommendedActions: string[];
}

export interface RiskWeights {
  dataCompleteness: number;
  costEscalation: number;
  regulatory: number;
  timeline: number;
  settlement: number;
}

// ---- Default Weights (configurable) ----

export const DEFAULT_WEIGHTS: RiskWeights = {
  dataCompleteness: 0.20,
  costEscalation: 0.25,
  regulatory: 0.20,
  timeline: 0.20,
  settlement: 0.15,
};

// ---- Scoring Functions ----

function getRiskLevel(score: number): RiskLevel {
  if (score <= 30) return "Low";
  if (score <= 60) return "Moderate";
  if (score <= 80) return "High";
  return "Critical";
}

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v));
}

// --- Component Scorers ---

function scoreDataCompleteness(siteObligations: Obligation[], site: Site): RiskComponentScore {
  let missingCount = 0;
  let totalChecks = 0;
  const drivers: string[] = [];

  for (const obl of siteObligations) {
    totalChecks += 5;
    if (!obl.currentLiability || obl.currentLiability === 0) { missingCount++; drivers.push(`Missing cost estimate: ${obl.name}`); }
    if (!obl.discountRate || obl.discountRate === 0) { missingCount++; drivers.push(`Missing discount rate: ${obl.name}`); }
    if (!obl.targetSettlementDate) { missingCount++; drivers.push(`Missing timeline: ${obl.name}`); }
    if (obl.type === "ERO" && !obl.contaminantType) { missingCount++; drivers.push(`Missing regulatory tag: ${obl.name}`); }
    else { totalChecks--; }
    if (obl.status === "Pending") { missingCount++; drivers.push(`Unclassified obligation: ${obl.name}`); }
  }

  if (siteObligations.length === 0) {
    totalChecks = 1;
    missingCount = 0;
  }

  const completenessRatio = totalChecks > 0 ? missingCount / totalChecks : 0;
  const score = clamp(Math.round(completenessRatio * 100));

  return {
    name: "Data Completeness",
    key: "dataCompleteness",
    score,
    weight: DEFAULT_WEIGHTS.dataCompleteness,
    weightedScore: score * DEFAULT_WEIGHTS.dataCompleteness,
    drivers: drivers.slice(0, 3),
    details: `${missingCount} of ${totalChecks} data quality checks flagged across ${siteObligations.length} obligations.`,
  };
}

function scoreCostEscalation(siteObligations: Obligation[]): RiskComponentScore {
  const drivers: string[] = [];
  let escalationScore = 0;
  let count = 0;

  for (const obl of siteObligations) {
    if (obl.currentLiability > 0 && obl.initialEstimate > 0) {
      const growthPct = ((obl.currentLiability - obl.initialEstimate) / obl.initialEstimate) * 100;
      escalationScore += growthPct;
      count++;
      if (growthPct > 15) {
        drivers.push(`${obl.name}: ${growthPct.toFixed(1)}% cost growth`);
      }
    }
  }

  const avgGrowth = count > 0 ? escalationScore / count : 0;
  // Normalize: 0% growth = 0 score, 30%+ = 100
  const score = clamp(Math.round((avgGrowth / 30) * 100));

  // Check vendor volatility from settlement projects
  const siteIds = new Set(siteObligations.map(o => o.siteId));
  const siteProjects = settlementProjects.filter(p => {
    const matchObl = siteObligations.find(o => o.name === p.obligationName);
    return matchObl !== undefined;
  });
  const overrunProjects = siteProjects.filter(p => p.totalSpent > p.totalBudget);
  if (overrunProjects.length > 0) {
    drivers.push(`${overrunProjects.length} project(s) over budget`);
  }

  return {
    name: "Cost Escalation",
    key: "costEscalation",
    score,
    weight: DEFAULT_WEIGHTS.costEscalation,
    weightedScore: score * DEFAULT_WEIGHTS.costEscalation,
    drivers: drivers.slice(0, 3),
    details: `Average cost growth of ${avgGrowth.toFixed(1)}% across ${count} obligations. ${overrunProjects.length} settlement overrun(s).`,
  };
}

function scoreRegulatory(site: Site, siteObligations: Obligation[]): RiskComponentScore {
  const drivers: string[] = [];
  let score = 0;

  // Compliance status factor
  const complianceMap: Record<string, number> = {
    "Compliant": 0,
    "Pending Review": 30,
    "Under Investigation": 70,
    "Non-Compliant": 100,
  };
  score += complianceMap[site.complianceStatus] || 20;

  if (site.complianceStatus !== "Compliant") {
    drivers.push(`Site compliance: ${site.complianceStatus}`);
  }

  // Regulatory deadline proximity
  const eroObls = siteObligations.filter(o => o.type === "ERO" && o.regulatoryDeadline);
  for (const obl of eroObls) {
    const daysToDeadline = (new Date(obl.regulatoryDeadline!).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (daysToDeadline < 365) {
      score += 15;
      drivers.push(`${obl.name}: deadline within ${Math.round(daysToDeadline / 30)} months`);
    }
  }

  // Environmental exposure severity
  const siteExposures = environmentalExposures.filter(e => e.siteId === site.id);
  const criticalExposures = siteExposures.filter(e => e.riskLevel === "Critical" || e.riskLevel === "High");
  if (criticalExposures.length > 0) {
    score += criticalExposures.length * 10;
    drivers.push(`${criticalExposures.length} high/critical exposure(s)`);
  }

  return {
    name: "Regulatory Risk",
    key: "regulatory",
    score: clamp(score),
    weight: DEFAULT_WEIGHTS.regulatory,
    weightedScore: clamp(score) * DEFAULT_WEIGHTS.regulatory,
    drivers: drivers.slice(0, 3),
    details: `Compliance: ${site.complianceStatus}. ${eroObls.length} ERO(s) with regulatory deadlines. ${criticalExposures.length} high-severity exposure(s).`,
  };
}

function scoreTimeline(siteObligations: Obligation[]): RiskComponentScore {
  const drivers: string[] = [];
  let score = 0;
  let count = 0;

  for (const obl of siteObligations) {
    if (obl.targetSettlementDate) {
      const yearsRemaining = (new Date(obl.targetSettlementDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 365.25);
      count++;

      // Long-tail exposure risk (> 10 years = higher risk)
      if (yearsRemaining > 10) {
        score += 15;
        drivers.push(`${obl.name}: ${Math.round(yearsRemaining)} years remaining (long-tail)`);
      } else if (yearsRemaining > 7) {
        score += 8;
      }

      // High discount rate sensitivity for long-duration
      if (yearsRemaining > 8 && obl.discountRate > 0.05) {
        score += 5;
      }
    }
  }

  const avgScore = count > 0 ? score / count : 0;
  const finalScore = clamp(Math.round(avgScore * 3)); // Scale up

  return {
    name: "Timeline Uncertainty",
    key: "timeline",
    score: finalScore,
    weight: DEFAULT_WEIGHTS.timeline,
    weightedScore: finalScore * DEFAULT_WEIGHTS.timeline,
    drivers: drivers.slice(0, 3),
    details: `${count} obligations assessed. Long-duration liabilities increase forecast volatility and discount rate sensitivity.`,
  };
}

function scoreSettlement(siteObligations: Obligation[]): RiskComponentScore {
  const drivers: string[] = [];
  let score = 0;

  const siteProjects = settlementProjects.filter(p => {
    return siteObligations.some(o => o.name === p.obligationName);
  });

  let overrunCount = 0;
  let totalVariancePct = 0;

  for (const proj of siteProjects) {
    const variancePct = ((proj.totalSpent - proj.totalBudget) / proj.totalBudget) * 100;
    if (variancePct > 0) {
      overrunCount++;
      totalVariancePct += variancePct;
      drivers.push(`${proj.obligationName}: ${variancePct.toFixed(1)}% over budget`);
    }

    // Scope expansion detection
    const scopeItems = proj.costItems.filter(ci => ci.variance < -10000);
    if (scopeItems.length > 2) {
      score += 10;
      drivers.push(`${proj.obligationName}: ${scopeItems.length} cost categories over budget`);
    }
  }

  if (overrunCount > 0) {
    score += Math.round((totalVariancePct / overrunCount) * 2);
  }

  // Forecast deviation from budget items
  score += overrunCount * 8;

  return {
    name: "Settlement Variance",
    key: "settlement",
    score: clamp(score),
    weight: DEFAULT_WEIGHTS.settlement,
    weightedScore: clamp(score) * DEFAULT_WEIGHTS.settlement,
    drivers: drivers.slice(0, 3),
    details: `${siteProjects.length} settlement projects tracked. ${overrunCount} with cost overruns.`,
  };
}

// ---- Main Scoring Function ----

export function calculateSiteRiskScore(site: Site, weights: RiskWeights = DEFAULT_WEIGHTS): SiteRiskScore {
  const siteObligations = obligations.filter(o => o.siteId === site.id && o.status !== "Settled");

  const components: RiskComponentScore[] = [
    scoreDataCompleteness(siteObligations, site),
    scoreCostEscalation(siteObligations),
    scoreRegulatory(site, siteObligations),
    scoreTimeline(siteObligations),
    scoreSettlement(siteObligations),
  ];

  // Recalculate with custom weights
  for (const comp of components) {
    comp.weight = weights[comp.key as keyof RiskWeights] || comp.weight;
    comp.weightedScore = comp.score * comp.weight;
  }

  const compositeScore = Math.round(components.reduce((sum, c) => sum + c.weightedScore, 0));
  const totalExposure = siteObligations.reduce((sum, o) => sum + o.currentLiability, 0);

  // Top drivers across all components
  const allDrivers = components
    .flatMap(c => c.drivers.map(d => ({ driver: d, contribution: c.weightedScore / Math.max(1, c.drivers.length) })))
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 5);

  // Simulate trend based on cost growth direction
  const avgGrowth = siteObligations.reduce((sum, o) => {
    return sum + (o.currentLiability - o.initialEstimate) / Math.max(1, o.initialEstimate);
  }, 0) / Math.max(1, siteObligations.length);

  const trend: RiskTrend = avgGrowth > 0.15 ? "Deteriorating" : avgGrowth < 0.05 ? "Improving" : "Stable";

  return {
    siteId: site.id,
    siteName: site.name,
    region: site.region,
    compositeScore: clamp(compositeScore),
    level: getRiskLevel(clamp(compositeScore)),
    trend,
    components,
    topDrivers: allDrivers,
    obligationCount: siteObligations.length,
    totalExposure,
  };
}

// ---- Portfolio Scoring ----

export function calculatePortfolioRisk(weights: RiskWeights = DEFAULT_WEIGHTS): PortfolioRiskResult {
  const siteScores = sites.map(site => calculateSiteRiskScore(site, weights));

  // Weighted average by exposure
  const totalExposure = siteScores.reduce((sum, s) => sum + s.totalExposure, 0);
  const portfolioScore = totalExposure > 0
    ? Math.round(siteScores.reduce((sum, s) => sum + s.compositeScore * (s.totalExposure / totalExposure), 0))
    : Math.round(siteScores.reduce((sum, s) => sum + s.compositeScore, 0) / Math.max(1, siteScores.length));

  // Exposure volatility: std deviation of site scores
  const mean = siteScores.reduce((s, ss) => s + ss.compositeScore, 0) / Math.max(1, siteScores.length);
  const variance = siteScores.reduce((s, ss) => s + Math.pow(ss.compositeScore - mean, 2), 0) / Math.max(1, siteScores.length);
  const exposureVolatility = clamp(Math.round(Math.sqrt(variance) * 2.5));

  // Forecast confidence (inverse of volatility + data risk)
  const avgDataRisk = siteScores.reduce((s, ss) => {
    const dataComp = ss.components.find(c => c.key === "dataCompleteness");
    return s + (dataComp?.score || 0);
  }, 0) / Math.max(1, siteScores.length);
  const forecastConfidence = clamp(Math.round(100 - exposureVolatility * 0.4 - avgDataRisk * 0.3));

  // Portfolio trend
  const deterioratingCount = siteScores.filter(s => s.trend === "Deteriorating").length;
  const improvingCount = siteScores.filter(s => s.trend === "Improving").length;
  const portfolioTrend: RiskTrend = deterioratingCount > improvingCount ? "Deteriorating"
    : improvingCount > deterioratingCount ? "Improving" : "Stable";

  // Aggregate top drivers
  const driverMap = new Map<string, number>();
  for (const ss of siteScores) {
    for (const d of ss.topDrivers) {
      driverMap.set(d.driver, (driverMap.get(d.driver) || 0) + d.contribution);
    }
  }
  const topDrivers = Array.from(driverMap.entries())
    .map(([driver, contribution]) => ({ driver, contribution: Math.round(contribution) }))
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 5);

  // Trend history (simulated quarterly)
  const trendHistory = [
    { period: "Q1 2025", score: Math.max(30, portfolioScore - 12) },
    { period: "Q2 2025", score: Math.max(30, portfolioScore - 8) },
    { period: "Q3 2025", score: Math.max(30, portfolioScore - 4) },
    { period: "Q4 2025", score: Math.max(30, portfolioScore - 1) },
    { period: "Q1 2026", score: portfolioScore },
  ];

  const narrative = generateRiskNarrative(portfolioScore, portfolioTrend, siteScores, topDrivers, exposureVolatility, forecastConfidence);

  return {
    portfolioScore: clamp(portfolioScore),
    portfolioLevel: getRiskLevel(clamp(portfolioScore)),
    portfolioTrend,
    exposureVolatility,
    forecastConfidence,
    siteScores,
    topDrivers,
    trendHistory,
    narrative,
    timestamp: new Date().toISOString(),
  };
}

// ---- AI Narrative Generator ----

function generateRiskNarrative(
  score: number,
  trend: RiskTrend,
  siteScores: SiteRiskScore[],
  topDrivers: { driver: string; contribution: number }[],
  volatility: number,
  confidence: number,
): RiskNarrative {
  const highRiskSites = siteScores.filter(s => s.level === "High" || s.level === "Critical");
  const totalExposure = siteScores.reduce((s, ss) => s + ss.totalExposure, 0);
  const prevScore = Math.max(30, score - 8);

  // Section 1: Executive Summary
  const trendWord = trend === "Deteriorating" ? "increased" : trend === "Improving" ? "decreased" : "remained stable";
  const executiveSummary = `Portfolio Risk Index ${trendWord} from ${prevScore} to ${score} this quarter` +
    (highRiskSites.length > 0
      ? `, driven by ${highRiskSites.length} high-risk site(s) including ${highRiskSites[0].siteName}. ` +
        `Total portfolio exposure is $${(totalExposure / 1_000_000).toFixed(1)}M across ${siteScores.length} sites.`
      : `. Total portfolio exposure is $${(totalExposure / 1_000_000).toFixed(1)}M across ${siteScores.length} sites with no critical risk concentrations.`);

  // Section 2: Top Drivers
  const totalContrib = topDrivers.reduce((s, d) => s + d.contribution, 0);
  const driverDetails = topDrivers.map(d => ({
    driver: d.driver,
    contribution: totalContrib > 0 ? `${Math.round((d.contribution / totalContrib) * 100)}%` : "—",
    detail: `Contributing ${d.contribution} weighted points to portfolio risk.`,
  }));

  // Section 3: Exposure Volatility
  const volatilityNarrative = volatility > 50
    ? `Exposure volatility is elevated at ${volatility}/100, indicating significant dispersion in site-level risk scores. ` +
      `The portfolio is highly sensitive to changes in inflation and discount rate assumptions. ` +
      `Sites contributing most to volatility: ${siteScores.sort((a, b) => b.compositeScore - a.compositeScore).slice(0, 2).map(s => s.siteName).join(", ")}.`
    : `Exposure volatility is moderate at ${volatility}/100, suggesting relatively consistent risk distribution across sites. ` +
      `Forecast confidence remains at ${confidence}%. Long-tail remediation timelines remain the primary volatility driver.`;

  // Section 4: Trend Analysis
  const trendAnalysis = trend === "Deteriorating"
    ? `Risk trajectory is deteriorating. ${highRiskSites.length} site(s) show worsening scores driven by cost escalation and regulatory pressure. ` +
      `Leading indicators suggest continued upward pressure from vendor cost volatility and approaching compliance deadlines.`
    : trend === "Improving"
    ? `Risk trajectory is improving. Data completeness efforts and settlement progress are reducing overall portfolio risk. ` +
      `Continued focus on high-duration AROs is recommended to sustain improvement.`
    : `Risk trajectory is stable. No significant changes in underlying risk factors this quarter. ` +
      `Monitor regulatory developments and vendor cost trends for potential shifts.`;

  // Section 5: Recommended Actions
  const recommendedActions: string[] = [];
  const dataComp = siteScores.some(s => s.components.find(c => c.key === "dataCompleteness" && c.score > 40));
  if (dataComp) recommendedActions.push("Conduct ARO data completeness audit across flagged sites");

  const highCost = siteScores.some(s => s.components.find(c => c.key === "costEscalation" && c.score > 50));
  if (highCost) recommendedActions.push("Review vendor contracts and rebaseline high-volatility cost estimates");

  const regRisk = siteScores.some(s => s.components.find(c => c.key === "regulatory" && c.score > 50));
  if (regRisk) recommendedActions.push("Prioritize compliance gap review for sites under investigation");

  const timeRisk = siteScores.some(s => s.components.find(c => c.key === "timeline" && c.score > 40));
  if (timeRisk) recommendedActions.push("Re-evaluate long-duration liabilities exceeding 10-year horizons");

  const settRisk = siteScores.some(s => s.components.find(c => c.key === "settlement" && c.score > 40));
  if (settRisk) recommendedActions.push("Investigate repeated settlement overruns and adjust forecast assumptions");

  if (recommendedActions.length === 0) recommendedActions.push("Maintain current monitoring cadence and review quarterly");

  recommendedActions.push("Adjust discount rate assumptions for sites with highest inflation sensitivity");

  return {
    executiveSummary,
    topDrivers: driverDetails,
    exposureVolatility: volatilityNarrative,
    trendAnalysis,
    recommendedActions,
  };
}

// ---- Scenario-Adjusted Risk ----

export function calculateScenarioAdjustedRisk(
  inflationDelta: number,
  discountDelta: number,
  weights: RiskWeights = DEFAULT_WEIGHTS,
): { baseScore: number; adjustedScore: number; delta: number; adjustedLevel: RiskLevel } {
  const baseResult = calculatePortfolioRisk(weights);
  
  // Inflation increases cost escalation risk
  const inflationImpact = Math.round(inflationDelta * 800); // 1% inflation = ~8 points
  // Discount rate changes affect timeline risk
  const discountImpact = Math.round(discountDelta * 500); // 1% discount change = ~5 points
  
  const adjustedScore = clamp(baseResult.portfolioScore + inflationImpact + discountImpact);
  
  return {
    baseScore: baseResult.portfolioScore,
    adjustedScore,
    delta: adjustedScore - baseResult.portfolioScore,
    adjustedLevel: getRiskLevel(adjustedScore),
  };
}
