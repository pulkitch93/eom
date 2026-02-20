// ============================================================
// AI Scenario Simulator Engine
// Monte Carlo simulation, sensitivity analysis, AI explanation
// ============================================================

import {
  obligations,
  forecastScenarios,
  sites,
  formatCurrency,
  formatCurrencyK,
  type Obligation,
  type ForecastScenario,
} from "@/data/mock-data";

// ---------- Types ----------

export interface SimulationInputs {
  inflationDelta: number;       // e.g. +0.02 = +2%
  discountDelta: number;        // e.g. -0.01 = -1%
  escalationFactor: number;     // multiplier, default 1.0
  timelineShiftYears: number;   // positive = extend
  regulatoryFactor: number;     // multiplier 1.0 = no change
  probabilityAdjustment: number; // +/- %
  scopeExpansion: number;       // 0-100%
  level: "portfolio" | "site" | "project" | "aro";
  levelId?: string;             // siteId, obligationId, etc.
}

export interface MonteCarloResult {
  mean: number;
  p5: number;
  p25: number;
  p50: number;
  p75: number;
  p95: number;
  stdDev: number;
  iterations: number;
}

export interface SensitivityItem {
  factor: string;
  baseValue: string;
  adjustedValue: string;
  impactDollars: number;
  impactPercent: number;
  rank: number;
}

export interface DriverBreakdown {
  driver: string;
  impactPercent: number;
  impactDollars: number;
}

export interface SimulationResult {
  id: string;
  timestamp: string;
  inputs: SimulationInputs;
  baselineLiability: number;
  adjustedLiability: number;
  deltaDollars: number;
  deltaPercent: number;
  npvChange: number;
  riskAdjustedExposure: number;
  forecastVolatilityRange: [number, number];
  monteCarlo: MonteCarloResult;
  sensitivity: SensitivityItem[];
  drivers: DriverBreakdown[];
  confidenceIndex: { before: number; after: number };
  riskScore: { before: number; after: number };
  volatilityScore: { before: number; after: number };
  narrative: SimulationNarrative;
  scenarioComparison: { year: number; base: number; scenario: number }[];
  tornadoData: { factor: string; low: number; high: number; base: number }[];
  distributionData: { bucket: number; frequency: number }[];
}

export interface SimulationNarrative {
  executiveSummary: string;
  primaryDrivers: string;
  sensitivityRanking: string;
  riskImplication: string;
  recommendedActions: string[];
}

export interface SavedScenario {
  id: string;
  name: string;
  timestamp: string;
  inputs: SimulationInputs;
  result: SimulationResult;
}

// ---------- Helpers ----------

function getFilteredObligations(inputs: SimulationInputs): Obligation[] {
  let filtered = obligations.filter(o => o.status !== "Settled");
  if (inputs.level === "site" && inputs.levelId) {
    filtered = filtered.filter(o => o.siteId === inputs.levelId);
  } else if (inputs.level === "aro" && inputs.levelId) {
    filtered = filtered.filter(o => o.id === inputs.levelId);
  } else if (inputs.level === "project" && inputs.levelId) {
    filtered = filtered.filter(o => o.facilityId === inputs.levelId);
  }
  return filtered;
}

function gaussianRandom(mean: number, stdDev: number): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return mean + stdDev * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function percentile(sorted: number[], p: number): number {
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

// ---------- Monte Carlo ----------

function runMonteCarlo(
  baseLiability: number,
  inputs: SimulationInputs,
  iterations: number = 1000
): MonteCarloResult {
  const results: number[] = [];
  const baseInflation = 0.025;
  const baseDiscount = 0.05;

  for (let i = 0; i < iterations; i++) {
    const inflRate = gaussianRandom(baseInflation + inputs.inflationDelta, 0.008);
    const discRate = gaussianRandom(baseDiscount + inputs.discountDelta, 0.005);
    const escFactor = gaussianRandom(inputs.escalationFactor, 0.05);
    const timeAdj = gaussianRandom(inputs.timelineShiftYears, 0.5);
    const regFactor = gaussianRandom(inputs.regulatoryFactor, 0.03);
    const scopeAdj = gaussianRandom(1 + inputs.scopeExpansion / 100, 0.02);

    const effectiveYears = 10 + timeAdj;
    const inflationMultiplier = Math.pow(1 + inflRate, effectiveYears);
    const discountMultiplier = 1 / Math.pow(1 + Math.max(discRate, 0.01), effectiveYears);
    const adjusted = baseLiability * inflationMultiplier * discountMultiplier * escFactor * regFactor * scopeAdj;
    results.push(Math.max(0, adjusted));
  }

  results.sort((a, b) => a - b);
  const mean = results.reduce((s, v) => s + v, 0) / iterations;
  const variance = results.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / iterations;

  return {
    mean: Math.round(mean),
    p5: Math.round(percentile(results, 5)),
    p25: Math.round(percentile(results, 25)),
    p50: Math.round(percentile(results, 50)),
    p75: Math.round(percentile(results, 75)),
    p95: Math.round(percentile(results, 95)),
    stdDev: Math.round(Math.sqrt(variance)),
    iterations,
  };
}

// ---------- Sensitivity Analysis ----------

function runSensitivity(baseLiability: number, inputs: SimulationInputs): SensitivityItem[] {
  const baseInflation = 0.025;
  const baseDiscount = 0.05;
  const avgYears = 10;

  const factors: { name: string; baseVal: string; adjVal: string; calc: () => number }[] = [
    {
      name: "Inflation Rate",
      baseVal: `${(baseInflation * 100).toFixed(1)}%`,
      adjVal: `${((baseInflation + inputs.inflationDelta) * 100).toFixed(1)}%`,
      calc: () => baseLiability * (Math.pow(1 + baseInflation + inputs.inflationDelta, avgYears) - Math.pow(1 + baseInflation, avgYears)) / Math.pow(1 + baseInflation, avgYears),
    },
    {
      name: "Discount Rate",
      baseVal: `${(baseDiscount * 100).toFixed(1)}%`,
      adjVal: `${((baseDiscount + inputs.discountDelta) * 100).toFixed(1)}%`,
      calc: () => baseLiability * (1 / Math.pow(1 + baseDiscount + inputs.discountDelta, avgYears) - 1 / Math.pow(1 + baseDiscount, avgYears)) * Math.pow(1 + baseDiscount, avgYears),
    },
    {
      name: "Cost Escalation",
      baseVal: "1.00x",
      adjVal: `${inputs.escalationFactor.toFixed(2)}x`,
      calc: () => baseLiability * (inputs.escalationFactor - 1),
    },
    {
      name: "Timeline Extension",
      baseVal: "0 years",
      adjVal: `${inputs.timelineShiftYears > 0 ? "+" : ""}${inputs.timelineShiftYears} years`,
      calc: () => baseLiability * inputs.timelineShiftYears * 0.028,
    },
    {
      name: "Regulatory Tightening",
      baseVal: "1.00x",
      adjVal: `${inputs.regulatoryFactor.toFixed(2)}x`,
      calc: () => baseLiability * (inputs.regulatoryFactor - 1),
    },
    {
      name: "Probability Weighting",
      baseVal: "0%",
      adjVal: `${inputs.probabilityAdjustment > 0 ? "+" : ""}${inputs.probabilityAdjustment}%`,
      calc: () => baseLiability * (inputs.probabilityAdjustment / 100),
    },
    {
      name: "Scope Expansion",
      baseVal: "0%",
      adjVal: `${inputs.scopeExpansion > 0 ? "+" : ""}${inputs.scopeExpansion}%`,
      calc: () => baseLiability * (inputs.scopeExpansion / 100),
    },
  ];

  const items = factors.map(f => ({
    factor: f.name,
    baseValue: f.baseVal,
    adjustedValue: f.adjVal,
    impactDollars: Math.round(f.calc()),
    impactPercent: 0,
    rank: 0,
  }));

  const totalImpact = items.reduce((s, i) => s + Math.abs(i.impactDollars), 0) || 1;
  items.forEach(i => {
    i.impactPercent = parseFloat(((i.impactDollars / baseLiability) * 100).toFixed(1));
  });
  items.sort((a, b) => Math.abs(b.impactDollars) - Math.abs(a.impactDollars));
  items.forEach((item, idx) => { item.rank = idx + 1; });

  return items;
}

// ---------- Tornado Data ----------

function generateTornadoData(baseLiability: number): { factor: string; low: number; high: number; base: number }[] {
  const factors = [
    { factor: "Inflation Rate", lowDelta: -0.01, highDelta: 0.02 },
    { factor: "Discount Rate", lowDelta: 0.01, highDelta: -0.015 },
    { factor: "Cost Escalation", lowDelta: -0.05, highDelta: 0.1 },
    { factor: "Timeline", lowDelta: -0.03, highDelta: 0.08 },
    { factor: "Regulatory", lowDelta: 0, highDelta: 0.15 },
    { factor: "Scope", lowDelta: 0, highDelta: 0.12 },
  ];

  return factors.map(f => ({
    factor: f.factor,
    low: Math.round(baseLiability * (1 + f.lowDelta)),
    high: Math.round(baseLiability * (1 + f.highDelta)),
    base: baseLiability,
  })).sort((a, b) => (b.high - b.low) - (a.high - a.low));
}

// ---------- Distribution Data ----------

function generateDistributionData(mc: MonteCarloResult): { bucket: number; frequency: number }[] {
  const buckets = 20;
  const range = mc.p95 - mc.p5;
  const step = range / buckets;
  const data: { bucket: number; frequency: number }[] = [];

  for (let i = 0; i < buckets; i++) {
    const bucketCenter = mc.p5 + step * (i + 0.5);
    // Normal distribution approximation
    const z = (bucketCenter - mc.mean) / mc.stdDev;
    const freq = Math.round(100 * Math.exp(-0.5 * z * z));
    data.push({ bucket: Math.round(bucketCenter), frequency: freq });
  }
  return data;
}

// ---------- AI Narrative ----------

function generateNarrative(
  baseLiability: number,
  result: Omit<SimulationResult, "narrative">,
  inputs: SimulationInputs,
  filteredObligations: Obligation[]
): SimulationNarrative {
  const deltaSign = result.deltaPercent >= 0 ? "increases" : "decreases";
  const absDeltaPct = Math.abs(result.deltaPercent).toFixed(1);
  const absDeltaDollars = formatCurrency(Math.abs(result.deltaDollars));

  const levelLabel = inputs.level === "portfolio" ? "total portfolio" :
    inputs.level === "site" ? `site-level (${sites.find(s => s.id === inputs.levelId)?.name || inputs.levelId})` :
    inputs.level === "aro" ? `obligation-level (${filteredObligations[0]?.name || inputs.levelId})` :
    "project-level";

  const changeDescriptions: string[] = [];
  if (inputs.inflationDelta !== 0) changeDescriptions.push(`${inputs.inflationDelta > 0 ? "+" : ""}${(inputs.inflationDelta * 100).toFixed(1)}% inflation adjustment`);
  if (inputs.discountDelta !== 0) changeDescriptions.push(`${inputs.discountDelta > 0 ? "+" : ""}${(inputs.discountDelta * 100).toFixed(1)}% discount rate change`);
  if (inputs.timelineShiftYears !== 0) changeDescriptions.push(`${inputs.timelineShiftYears > 0 ? "+" : ""}${inputs.timelineShiftYears}-year timeline shift`);
  if (inputs.escalationFactor !== 1) changeDescriptions.push(`${inputs.escalationFactor.toFixed(2)}x cost escalation`);
  if (inputs.regulatoryFactor !== 1) changeDescriptions.push(`${inputs.regulatoryFactor.toFixed(2)}x regulatory tightening`);
  if (inputs.scopeExpansion !== 0) changeDescriptions.push(`${inputs.scopeExpansion}% scope expansion`);

  const changeStr = changeDescriptions.length > 0 ? changeDescriptions.join(", ") : "no parameter changes";

  const executiveSummary = `Under the adjusted scenario with ${changeStr}, ${levelLabel} liability ${deltaSign} by ${absDeltaPct}% (${absDeltaDollars}). ` +
    `The risk-adjusted exposure moves from ${formatCurrency(baseLiability)} to ${formatCurrency(result.riskAdjustedExposure)}, ` +
    `with Monte Carlo simulation (${result.monteCarlo.iterations} iterations) indicating a P50 outcome of ${formatCurrency(result.monteCarlo.p50)} ` +
    `and a P95 worst-case of ${formatCurrency(result.monteCarlo.p95)}.`;

  const topDrivers = result.drivers.filter(d => Math.abs(d.impactPercent) > 0.1);
  const primaryDrivers = topDrivers.length > 0
    ? `**Primary impact drivers (ranked by contribution):**\n\n` +
      topDrivers.map((d, i) => `${i + 1}. **${d.driver}**: ${d.impactPercent >= 0 ? "+" : ""}${d.impactPercent.toFixed(1)}% (${formatCurrency(Math.abs(d.impactDollars))})`).join("\n\n") +
      `\n\nThe combined effect of all adjusted parameters accounts for the total ${absDeltaPct}% shift in liability. ` +
      `Compounding effects between inflation and timeline extension contribute approximately ${(Math.abs(result.deltaPercent) * 0.12).toFixed(1)}% of the total impact.`
    : "No significant drivers identified — the scenario parameters are close to baseline assumptions.";

  const topSensitivity = result.sensitivity.slice(0, 3);
  const sensitivityRanking = `**Assumption sensitivity ranking:**\n\n` +
    topSensitivity.map((s, i) => {
      const desc = s.rank === 1
        ? `Liability is **highly sensitive** to ${s.factor.toLowerCase()} due to long-term remediation timelines exceeding 10 years.`
        : s.rank === 2
        ? `${s.factor} has **moderate sensitivity** — changes compound across the obligation portfolio.`
        : `${s.factor} shows **lower sensitivity** but remains material for long-duration AROs.`;
      return `${i + 1}. **${s.factor}** — ${desc} (Impact: ${s.impactPercent >= 0 ? "+" : ""}${s.impactPercent}%)`;
    }).join("\n\n");

  const confDelta = result.confidenceIndex.after - result.confidenceIndex.before;
  const riskImplication = `**Exposure volatility**: ${result.volatilityScore.after > result.volatilityScore.before ? "Increased" : "Decreased"} from ${result.volatilityScore.before} to ${result.volatilityScore.after}.\n\n` +
    `**Forecast confidence**: ${confDelta < 0 ? "Reduced" : "Improved"} from ${result.confidenceIndex.before}% to ${result.confidenceIndex.after}%` +
    `${confDelta < 0 ? ` due to increased ${topSensitivity[0]?.factor.toLowerCase() || "assumption"} sensitivity` : ""}.\n\n` +
    `**Long-tail risk**: P95 exposure of ${formatCurrency(result.monteCarlo.p95)} represents a ${((result.monteCarlo.p95 / baseLiability - 1) * 100).toFixed(0)}% upside risk above current baseline.\n\n` +
    `**Most impacted sites**: ${filteredObligations.slice(0, 3).map(o => o.siteName).filter((v, i, a) => a.indexOf(v) === i).join(", ")}.`;

  const recommendedActions: string[] = [];
  if (inputs.inflationDelta > 0.01) recommendedActions.push("Re-evaluate cost estimates for long-duration obligations to account for elevated inflation assumptions.");
  if (inputs.timelineShiftYears > 1) recommendedActions.push("Consider accelerating remediation timelines for high-exposure sites to reduce compounding effects.");
  if (inputs.discountDelta < -0.005) recommendedActions.push("Reassess discount rate assumptions with Treasury and Accounting for consistency with credit-adjusted risk-free rates.");
  if (inputs.regulatoryFactor > 1.05) recommendedActions.push("Conduct vendor cost benchmarking to validate regulatory compliance cost estimates.");
  if (inputs.scopeExpansion > 5) recommendedActions.push("Initiate scope validation review with environmental engineering team for expanded obligation boundaries.");
  if (result.deltaPercent > 10) recommendedActions.push("Flag portfolio exposure change for quarterly CFO financial review.");
  if (result.monteCarlo.p95 > baseLiability * 1.3) recommendedActions.push("Consider establishing reserve buffer for tail-risk scenarios exceeding P95 threshold.");
  if (recommendedActions.length === 0) recommendedActions.push("No material exposure change detected — continue monitoring under current assumptions.");

  return { executiveSummary, primaryDrivers, sensitivityRanking, riskImplication, recommendedActions };
}

// ---------- Main Simulation ----------

export function runSimulation(inputs: SimulationInputs): SimulationResult {
  const filtered = getFilteredObligations(inputs);
  const baseLiability = filtered.reduce((s, o) => s + o.currentLiability, 0);

  // Calculate adjusted liability deterministically
  const baseInflation = 0.025;
  const baseDiscount = 0.05;
  const avgYears = 10;

  const newInflation = baseInflation + inputs.inflationDelta;
  const newDiscount = baseDiscount + inputs.discountDelta;
  const inflationEffect = Math.pow(1 + newInflation, avgYears + inputs.timelineShiftYears) / Math.pow(1 + baseInflation, avgYears);
  const discountEffect = Math.pow(1 + baseDiscount, avgYears) / Math.pow(1 + Math.max(newDiscount, 0.005), avgYears + inputs.timelineShiftYears);
  const adjustedLiability = Math.round(
    baseLiability * inflationEffect * discountEffect * inputs.escalationFactor * inputs.regulatoryFactor * (1 + inputs.scopeExpansion / 100) * (1 + inputs.probabilityAdjustment / 100)
  );

  const deltaDollars = adjustedLiability - baseLiability;
  const deltaPercent = baseLiability > 0 ? parseFloat(((deltaDollars / baseLiability) * 100).toFixed(1)) : 0;

  const mc = runMonteCarlo(baseLiability, inputs, 1000);
  const sensitivity = runSensitivity(baseLiability, inputs);
  const tornadoData = generateTornadoData(baseLiability);
  const distributionData = generateDistributionData(mc);

  const drivers: DriverBreakdown[] = sensitivity.map(s => ({
    driver: s.factor,
    impactPercent: s.impactPercent,
    impactDollars: s.impactDollars,
  }));

  // Scenario comparison over forecast years
  const baseScenario = forecastScenarios[0];
  const scenarioComparison = baseScenario.projections.map(p => {
    const baseTotal = p.aroLiability + p.eroLiability;
    const yearIdx = p.year - 2026;
    const compoundFactor = Math.pow(1 + inputs.inflationDelta, yearIdx + 1) *
      inputs.escalationFactor * inputs.regulatoryFactor * (1 + inputs.scopeExpansion / 100);
    return {
      year: p.year,
      base: baseTotal,
      scenario: Math.round(baseTotal * compoundFactor),
    };
  });

  const npvChange = Math.round(deltaDollars / Math.pow(1 + newDiscount, avgYears));
  const riskAdjustedExposure = Math.round(mc.p75 * 0.6 + mc.p95 * 0.4);

  const volBefore = 35;
  const volAfter = Math.min(100, Math.max(10, volBefore + Math.abs(deltaPercent) * 1.2));
  const confBefore = 82;
  const confAfter = Math.max(30, Math.min(95, confBefore - Math.abs(deltaPercent) * 0.8));
  const riskBefore = 42;
  const riskAfter = Math.min(100, Math.max(10, riskBefore + deltaPercent * 0.6));

  const partialResult = {
    id: `SIM-${Date.now()}`,
    timestamp: new Date().toISOString(),
    inputs,
    baselineLiability: baseLiability,
    adjustedLiability,
    deltaDollars,
    deltaPercent,
    npvChange,
    riskAdjustedExposure,
    forecastVolatilityRange: [mc.p25, mc.p75] as [number, number],
    monteCarlo: mc,
    sensitivity,
    drivers,
    confidenceIndex: { before: confBefore, after: Math.round(confAfter) },
    riskScore: { before: riskBefore, after: Math.round(riskAfter) },
    volatilityScore: { before: volBefore, after: Math.round(volAfter) },
    scenarioComparison,
    tornadoData,
    distributionData,
  };

  const narrative = generateNarrative(baseLiability, partialResult as any, inputs, filtered);

  return { ...partialResult, narrative };
}

// ---------- Reverse Scenario Solver ----------

export function solveReverseScenario(
  targetDeltaPercent: number,
  parameter: "inflation" | "discount" | "timeline" | "escalation"
): { value: number; label: string } {
  const baseLiability = obligations.filter(o => o.status !== "Settled").reduce((s, o) => s + o.currentLiability, 0);
  const targetLiability = baseLiability * (1 + targetDeltaPercent / 100);
  const ratio = targetLiability / baseLiability;

  switch (parameter) {
    case "inflation": {
      const rate = Math.pow(ratio, 1 / 10) - 1;
      return { value: rate, label: `Inflation rate of ${(rate * 100).toFixed(2)}% would produce a ${targetDeltaPercent}% liability change` };
    }
    case "discount": {
      const rate = Math.pow(1 / ratio, 1 / 10) + 0.025;
      return { value: rate, label: `Discount rate of ${(rate * 100).toFixed(2)}% would produce a ${targetDeltaPercent}% liability change` };
    }
    case "timeline": {
      const years = (ratio - 1) / 0.028;
      return { value: years, label: `Timeline extension of ${years.toFixed(1)} years would produce a ${targetDeltaPercent}% liability change` };
    }
    case "escalation": {
      return { value: ratio, label: `Escalation factor of ${ratio.toFixed(3)}x would produce a ${targetDeltaPercent}% liability change` };
    }
  }
}

// ---------- Stress Test Presets ----------

export const stressTestPresets: Record<string, { name: string; description: string; inputs: Partial<SimulationInputs> }> = {
  regulatory_shock: {
    name: "Regulatory Shock",
    description: "Sudden regulatory tightening with expanded scope requirements",
    inputs: { regulatoryFactor: 1.25, scopeExpansion: 15, probabilityAdjustment: 10 },
  },
  inflation_spike: {
    name: "Inflation Spike",
    description: "Sustained high inflation environment with cost escalation",
    inputs: { inflationDelta: 0.035, escalationFactor: 1.15, timelineShiftYears: 1 },
  },
  cost_overrun: {
    name: "High Cost Overrun",
    description: "Significant cost overruns across remediation and decommissioning",
    inputs: { escalationFactor: 1.3, scopeExpansion: 20, timelineShiftYears: 2 },
  },
  compliance_penalty: {
    name: "Compliance Penalty",
    description: "Regulatory penalties with accelerated compliance timelines",
    inputs: { regulatoryFactor: 1.4, probabilityAdjustment: 15, timelineShiftYears: -1 },
  },
  best_case: {
    name: "Best Case",
    description: "Favorable conditions with accelerated settlement",
    inputs: { inflationDelta: -0.01, escalationFactor: 0.9, timelineShiftYears: -2, discountDelta: 0.005 },
  },
};

export const defaultInputs: SimulationInputs = {
  inflationDelta: 0,
  discountDelta: 0,
  escalationFactor: 1.0,
  timelineShiftYears: 0,
  regulatoryFactor: 1.0,
  probabilityAdjustment: 0,
  scopeExpansion: 0,
  level: "portfolio",
};
