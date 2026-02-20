import { useState, useCallback, useMemo } from "react";
import {
  Play, RotateCcw, Download, AlertTriangle, TrendingUp, TrendingDown,
  ChevronRight, Zap, Target, Shield, BarChart3, Brain, Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  runSimulation,
  solveReverseScenario,
  stressTestPresets,
  defaultInputs,
  type SimulationInputs,
  type SimulationResult,
} from "@/lib/scenario-simulator-engine";
import { sites, obligations, formatCurrency, formatCurrencyK } from "@/data/mock-data";
import { exportToPDF } from "@/lib/export-utils";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine,
} from "recharts";

export default function ScenarioSimulatorTab() {
  const [inputs, setInputs] = useState<SimulationInputs>({ ...defaultInputs });
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [savedScenarios, setSavedScenarios] = useState<{ name: string; result: SimulationResult }[]>([]);
  const [reverseTarget, setReverseTarget] = useState(20);
  const [reverseParam, setReverseParam] = useState<"inflation" | "discount" | "timeline" | "escalation">("inflation");
  const [activeTab, setActiveTab] = useState("controls");

  const activeObligations = useMemo(() => obligations.filter(o => o.status !== "Settled"), []);

  const handleRun = useCallback(() => {
    setIsRunning(true);
    setProgress(0);
    const steps = [10, 25, 45, 65, 80, 92, 100];
    let step = 0;
    const interval = setInterval(() => {
      if (step < steps.length) {
        setProgress(steps[step]);
        step++;
      } else {
        clearInterval(interval);
        const simResult = runSimulation(inputs);
        setResult(simResult);
        setIsRunning(false);
        setActiveTab("results");
      }
    }, 180);
  }, [inputs]);

  const handleReset = () => {
    setInputs({ ...defaultInputs });
    setResult(null);
  };

  const applyPreset = (key: string) => {
    const preset = stressTestPresets[key];
    if (preset) {
      setInputs({ ...defaultInputs, ...preset.inputs });
    }
  };

  const handleSave = () => {
    if (result) {
      setSavedScenarios(prev => [...prev, { name: `Scenario ${prev.length + 1}`, result }]);
    }
  };

  const handleExport = () => {
    if (!result) return;
    const headers = ["Metric", "Value"];
    const rows = [
      ["Baseline Liability", formatCurrency(result.baselineLiability)],
      ["Adjusted Liability", formatCurrency(result.adjustedLiability)],
      ["Delta ($)", formatCurrency(result.deltaDollars)],
      ["Delta (%)", `${result.deltaPercent}%`],
      ["NPV Change", formatCurrency(result.npvChange)],
      ["Risk-Adjusted Exposure", formatCurrency(result.riskAdjustedExposure)],
      ["Monte Carlo P50", formatCurrency(result.monteCarlo.p50)],
      ["Monte Carlo P95", formatCurrency(result.monteCarlo.p95)],
      ["Confidence Index", `${result.confidenceIndex.before}% → ${result.confidenceIndex.after}%`],
      ["Risk Score", `${result.riskScore.before} → ${result.riskScore.after}`],
    ];
    exportToPDF("AI Scenario Simulation Report", headers, rows, "scenario-simulation");
  };

  const reverseResult = useMemo(() => {
    if (reverseTarget === 0) return null;
    return solveReverseScenario(reverseTarget, reverseParam);
  }, [reverseTarget, reverseParam]);

  const updateInput = <K extends keyof SimulationInputs>(key: K, value: SimulationInputs[K]) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="controls" className="text-xs"><Target className="h-3 w-3 mr-1" />Controls</TabsTrigger>
          <TabsTrigger value="results" className="text-xs" disabled={!result}><BarChart3 className="h-3 w-3 mr-1" />Results</TabsTrigger>
          <TabsTrigger value="analysis" className="text-xs" disabled={!result}><Brain className="h-3 w-3 mr-1" />AI Analysis</TabsTrigger>
          <TabsTrigger value="stress" className="text-xs"><Zap className="h-3 w-3 mr-1" />Stress Tests</TabsTrigger>
          <TabsTrigger value="reverse" className="text-xs"><RotateCcw className="h-3 w-3 mr-1" />Reverse</TabsTrigger>
        </TabsList>

        {/* ===== CONTROLS ===== */}
        <TabsContent value="controls" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Scope */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" /> Simulation Scope
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Level</Label>
                  <Select value={inputs.level} onValueChange={v => updateInput("level", v as SimulationInputs["level"])}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portfolio">Portfolio</SelectItem>
                      <SelectItem value="site">Site</SelectItem>
                      <SelectItem value="project">Project (Facility)</SelectItem>
                      <SelectItem value="aro">ARO / Obligation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {inputs.level === "site" && (
                  <div>
                    <Label className="text-xs">Site</Label>
                    <Select value={inputs.levelId || ""} onValueChange={v => updateInput("levelId", v)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select site" /></SelectTrigger>
                      <SelectContent>
                        {sites.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {inputs.level === "aro" && (
                  <div>
                    <Label className="text-xs">Obligation</Label>
                    <Select value={inputs.levelId || ""} onValueChange={v => updateInput("levelId", v)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select obligation" /></SelectTrigger>
                      <SelectContent>
                        {activeObligations.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rate Adjustments */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Rate Adjustments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SliderControl
                  label="Inflation Rate Δ"
                  value={inputs.inflationDelta}
                  min={-0.03} max={0.06} step={0.005}
                  format={v => `${v >= 0 ? "+" : ""}${(v * 100).toFixed(1)}%`}
                  onChange={v => updateInput("inflationDelta", v)}
                />
                <SliderControl
                  label="Discount Rate Δ"
                  value={inputs.discountDelta}
                  min={-0.03} max={0.03} step={0.005}
                  format={v => `${v >= 0 ? "+" : ""}${(v * 100).toFixed(1)}%`}
                  onChange={v => updateInput("discountDelta", v)}
                />
                <SliderControl
                  label="Cost Escalation"
                  value={inputs.escalationFactor}
                  min={0.8} max={1.5} step={0.01}
                  format={v => `${v.toFixed(2)}x`}
                  onChange={v => updateInput("escalationFactor", v)}
                />
              </CardContent>
            </Card>

            {/* Scenario Adjustments */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Scenario Adjustments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SliderControl
                  label="Timeline Shift"
                  value={inputs.timelineShiftYears}
                  min={-5} max={10} step={1}
                  format={v => `${v >= 0 ? "+" : ""}${v} yrs`}
                  onChange={v => updateInput("timelineShiftYears", v)}
                />
                <SliderControl
                  label="Regulatory Factor"
                  value={inputs.regulatoryFactor}
                  min={0.8} max={1.5} step={0.01}
                  format={v => `${v.toFixed(2)}x`}
                  onChange={v => updateInput("regulatoryFactor", v)}
                />
                <SliderControl
                  label="Scope Expansion"
                  value={inputs.scopeExpansion}
                  min={0} max={50} step={1}
                  format={v => `+${v}%`}
                  onChange={v => updateInput("scopeExpansion", v)}
                />
                <SliderControl
                  label="Probability Adj."
                  value={inputs.probabilityAdjustment}
                  min={-20} max={30} step={1}
                  format={v => `${v >= 0 ? "+" : ""}${v}%`}
                  onChange={v => updateInput("probabilityAdjustment", v)}
                />
              </CardContent>
            </Card>
          </div>

          {/* Run button */}
          <div className="flex items-center gap-3">
            <Button onClick={handleRun} disabled={isRunning} className="gap-2">
              <Play className="h-4 w-4" />
              {isRunning ? "Running Simulation…" : "Run AI Simulation"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}><RotateCcw className="h-3 w-3 mr-1" />Reset</Button>
            {result && (
              <>
                <Button variant="outline" size="sm" onClick={handleSave}>Save Scenario</Button>
                <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-3 w-3 mr-1" />Export PDF</Button>
              </>
            )}
          </div>

          {isRunning && (
            <Card>
              <CardContent className="py-4 space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Running Monte Carlo simulation ({1000} iterations)…</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-[10px] text-muted-foreground">
                  {progress < 30 ? "Initializing parameters…" : progress < 60 ? "Running sensitivity analysis…" : progress < 90 ? "Computing distributions…" : "Generating AI narrative…"}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ===== RESULTS ===== */}
        <TabsContent value="results" className="space-y-4">
          {result && (
            <>
              {/* Summary cards */}
              <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
                <MetricCard label="Adjusted Liability" value={formatCurrencyK(result.adjustedLiability)} />
                <MetricCard
                  label="Liability Delta"
                  value={`${result.deltaPercent >= 0 ? "+" : ""}${result.deltaPercent}%`}
                  sub={formatCurrency(result.deltaDollars)}
                  variant={result.deltaPercent >= 0 ? "destructive" : "success"}
                />
                <MetricCard label="NPV Change" value={formatCurrencyK(result.npvChange)} />
                <MetricCard label="Risk Exposure" value={formatCurrencyK(result.riskAdjustedExposure)} />
                <MetricCard
                  label="Confidence"
                  value={`${result.confidenceIndex.before}% → ${result.confidenceIndex.after}%`}
                  variant={result.confidenceIndex.after < result.confidenceIndex.before ? "warning" : "success"}
                />
              </div>

              {/* Base vs Scenario chart */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Base Case vs Scenario Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={result.scenarioComparison}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                        <YAxis tickFormatter={v => formatCurrencyK(v)} tick={{ fontSize: 11 }} width={60} />
                        <Tooltip formatter={(v: number) => formatCurrency(v)} />
                        <Legend />
                        <Area type="monotone" dataKey="base" stroke="hsl(var(--chart-aro))" fill="hsl(var(--chart-aro))" fillOpacity={0.1} name="Base Case" />
                        <Area type="monotone" dataKey="scenario" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.1} name="Scenario" strokeDasharray="5 5" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 lg:grid-cols-2">
                {/* Tornado */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Sensitivity Tornado Chart</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={result.tornadoData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis type="number" tickFormatter={v => formatCurrencyK(v)} tick={{ fontSize: 10 }} />
                          <YAxis dataKey="factor" type="category" tick={{ fontSize: 10 }} width={90} />
                          <Tooltip formatter={(v: number) => formatCurrency(v)} />
                          <ReferenceLine x={result.baselineLiability} stroke="hsl(var(--foreground))" strokeDasharray="3 3" />
                          <Bar dataKey="low" fill="hsl(var(--chart-success))" name="Low" />
                          <Bar dataKey="high" fill="hsl(var(--destructive))" name="High" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Distribution */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Risk Distribution Curve (Monte Carlo)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={result.distributionData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="bucket" tickFormatter={v => formatCurrencyK(v)} tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip labelFormatter={v => formatCurrency(Number(v))} />
                          <Area type="monotone" dataKey="frequency" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} name="Frequency" />
                          <ReferenceLine x={result.monteCarlo.p50} stroke="hsl(var(--chart-ero))" strokeDasharray="5 5" label={{ value: "P50", fontSize: 10 }} />
                          <ReferenceLine x={result.monteCarlo.p95} stroke="hsl(var(--destructive))" strokeDasharray="5 5" label={{ value: "P95", fontSize: 10 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex gap-4 mt-2 text-[10px] text-muted-foreground">
                      <span>P5: {formatCurrencyK(result.monteCarlo.p5)}</span>
                      <span>P25: {formatCurrencyK(result.monteCarlo.p25)}</span>
                      <span className="font-medium text-foreground">P50: {formatCurrencyK(result.monteCarlo.p50)}</span>
                      <span>P75: {formatCurrencyK(result.monteCarlo.p75)}</span>
                      <span className="font-medium text-destructive">P95: {formatCurrencyK(result.monteCarlo.p95)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sensitivity table */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Sensitivity Analysis Detail</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Rank</TableHead>
                        <TableHead className="text-xs">Factor</TableHead>
                        <TableHead className="text-xs">Base</TableHead>
                        <TableHead className="text-xs">Adjusted</TableHead>
                        <TableHead className="text-xs text-right">Impact ($)</TableHead>
                        <TableHead className="text-xs text-right">Impact (%)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.sensitivity.map(s => (
                        <TableRow key={s.factor}>
                          <TableCell className="text-xs font-medium">#{s.rank}</TableCell>
                          <TableCell className="text-xs">{s.factor}</TableCell>
                          <TableCell className="text-xs font-mono text-muted-foreground">{s.baseValue}</TableCell>
                          <TableCell className="text-xs font-mono">{s.adjustedValue}</TableCell>
                          <TableCell className={`text-xs text-right font-mono ${s.impactDollars >= 0 ? "text-destructive" : "text-chart-success"}`}>
                            {s.impactDollars >= 0 ? "+" : ""}{formatCurrency(s.impactDollars)}
                          </TableCell>
                          <TableCell className={`text-xs text-right font-mono ${s.impactPercent >= 0 ? "text-destructive" : "text-chart-success"}`}>
                            {s.impactPercent >= 0 ? "+" : ""}{s.impactPercent}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Risk scores */}
              <div className="grid gap-3 grid-cols-3">
                <ScoreCard label="Portfolio Risk Score" before={result.riskScore.before} after={result.riskScore.after} />
                <ScoreCard label="Exposure Volatility" before={result.volatilityScore.before} after={result.volatilityScore.after} />
                <ScoreCard label="Forecast Confidence" before={result.confidenceIndex.before} after={result.confidenceIndex.after} invert />
              </div>
            </>
          )}
        </TabsContent>

        {/* ===== AI ANALYSIS ===== */}
        <TabsContent value="analysis" className="space-y-4">
          {result && (
            <>
              <NarrativeSection title="Executive Summary" content={result.narrative.executiveSummary} icon={<TrendingUp className="h-4 w-4 text-primary" />} />
              <NarrativeSection title="Primary Drivers of Change" content={result.narrative.primaryDrivers} icon={<BarChart3 className="h-4 w-4 text-chart-ero" />} />
              <NarrativeSection title="Assumption Sensitivity Ranking" content={result.narrative.sensitivityRanking} icon={<Target className="h-4 w-4 text-chart-combined" />} />
              <NarrativeSection title="Risk Implication" content={result.narrative.riskImplication} icon={<AlertTriangle className="h-4 w-4 text-chart-warning" />} />
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4 text-chart-success" /> Recommended Executive Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.narrative.recommendedActions.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs">
                        <ChevronRight className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-3 w-3 mr-1" />Export Report</Button>
                <Button variant="outline" size="sm" onClick={handleSave}>Save Scenario</Button>
              </div>
            </>
          )}
        </TabsContent>

        {/* ===== STRESS TESTS ===== */}
        <TabsContent value="stress" className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-3">
            {Object.entries(stressTestPresets).map(([key, preset]) => (
              <Card key={key} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => { applyPreset(key); setActiveTab("controls"); }}>
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Zap className="h-4 w-4 text-chart-warning" />
                    {preset.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-2">{preset.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(preset.inputs).map(([k, v]) => (
                      <Badge key={k} variant="outline" className="text-[10px]">
                        {k.replace(/([A-Z])/g, " $1").trim()}: {typeof v === "number" ? (v > 1 ? `${v}x` : v < 0 ? `${(v * 100).toFixed(0)}%` : `+${typeof v === "number" && v < 1 ? (v * 100).toFixed(0) + "%" : v}`) : v}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Saved scenario comparison */}
          {savedScenarios.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Saved Scenario Comparison</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Scenario</TableHead>
                      <TableHead className="text-xs text-right">Baseline</TableHead>
                      <TableHead className="text-xs text-right">Adjusted</TableHead>
                      <TableHead className="text-xs text-right">Delta</TableHead>
                      <TableHead className="text-xs text-right">Risk Score</TableHead>
                      <TableHead className="text-xs text-right">Confidence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {savedScenarios.map((s, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs font-medium">{s.name}</TableCell>
                        <TableCell className="text-xs text-right font-mono">{formatCurrencyK(s.result.baselineLiability)}</TableCell>
                        <TableCell className="text-xs text-right font-mono">{formatCurrencyK(s.result.adjustedLiability)}</TableCell>
                        <TableCell className={`text-xs text-right font-mono ${s.result.deltaPercent >= 0 ? "text-destructive" : "text-chart-success"}`}>
                          {s.result.deltaPercent >= 0 ? "+" : ""}{s.result.deltaPercent}%
                        </TableCell>
                        <TableCell className="text-xs text-right font-mono">{s.result.riskScore.after}</TableCell>
                        <TableCell className="text-xs text-right font-mono">{s.result.confidenceIndex.after}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ===== REVERSE SCENARIO ===== */}
        <TabsContent value="reverse" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Reverse Scenario Solver</CardTitle>
              <p className="text-xs text-muted-foreground">Ask: "What value of a parameter would produce a specific liability change?"</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Target Liability Change (%)</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="number"
                      value={reverseTarget}
                      onChange={e => setReverseTarget(Number(e.target.value))}
                      className="h-8 text-xs w-24"
                    />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Solve For</Label>
                  <Select value={reverseParam} onValueChange={v => setReverseParam(v as typeof reverseParam)}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inflation">Inflation Rate</SelectItem>
                      <SelectItem value="discount">Discount Rate</SelectItem>
                      <SelectItem value="timeline">Timeline Extension</SelectItem>
                      <SelectItem value="escalation">Cost Escalation Factor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {reverseResult && (
                <div className="p-3 bg-accent/50 rounded-md border">
                  <p className="text-xs font-medium text-accent-foreground">{reverseResult.label}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---------- Sub-components ----------

function SliderControl({ label, value, min, max, step, format, onChange }: {
  label: string; value: number; min: number; max: number; step: number;
  format: (v: number) => string; onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <Label className="text-xs">{label}</Label>
        <span className="text-xs font-mono font-medium">{format(value)}</span>
      </div>
      <Slider
        value={[value]}
        min={min} max={max} step={step}
        onValueChange={([v]) => onChange(v)}
      />
    </div>
  );
}

function MetricCard({ label, value, sub, variant }: {
  label: string; value: string; sub?: string; variant?: "destructive" | "success" | "warning";
}) {
  const colorClass = variant === "destructive" ? "text-destructive" : variant === "success" ? "text-chart-success" : variant === "warning" ? "text-chart-warning" : "";
  return (
    <Card>
      <CardContent className="pt-3 pb-2">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
        <p className={`text-lg font-bold font-mono mt-0.5 ${colorClass}`}>{value}</p>
        {sub && <p className={`text-xs font-mono ${colorClass}`}>{sub}</p>}
      </CardContent>
    </Card>
  );
}

function ScoreCard({ label, before, after, invert }: {
  label: string; before: number; after: number; invert?: boolean;
}) {
  const isWorse = invert ? after < before : after > before;
  return (
    <Card>
      <CardContent className="pt-3 pb-2">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-mono text-muted-foreground">{before}</span>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
          <span className={`text-lg font-bold font-mono ${isWorse ? "text-destructive" : "text-chart-success"}`}>{after}</span>
        </div>
        <Progress value={after} className="h-1.5 mt-1.5" />
      </CardContent>
    </Card>
  );
}

function NarrativeSection({ title, content, icon }: { title: string; content: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">{icon} {title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xs leading-relaxed whitespace-pre-line">{content}</div>
      </CardContent>
    </Card>
  );
}
