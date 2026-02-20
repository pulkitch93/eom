import { useState, useMemo } from "react";
import {
  ShieldAlert, TrendingUp, TrendingDown, Minus, Activity, Brain,
  AlertTriangle, BarChart3, Target, FileText, ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell, PieChart, Pie, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar,
} from "recharts";
import {
  calculatePortfolioRisk,
  calculateScenarioAdjustedRisk,
  type PortfolioRiskResult,
  type SiteRiskScore,
  type RiskLevel,
  DEFAULT_WEIGHTS,
} from "@/lib/risk-scoring-engine";
import { formatCurrencyK } from "@/data/mock-data";

const RISK_COLORS: Record<RiskLevel, string> = {
  Low: "hsl(152, 55%, 42%)",
  Moderate: "hsl(38, 92%, 50%)",
  High: "hsl(32, 80%, 50%)",
  Critical: "hsl(0, 72%, 51%)",
};

const RISK_BG: Record<RiskLevel, string> = {
  Low: "bg-chart-success/10 text-chart-success border-chart-success/30",
  Moderate: "bg-chart-warning/10 text-chart-warning border-chart-warning/30",
  High: "bg-chart-ero/10 text-chart-ero border-chart-ero/30",
  Critical: "bg-destructive/10 text-destructive border-destructive/30",
};

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === "Deteriorating") return <TrendingUp className="h-4 w-4 text-destructive" />;
  if (trend === "Improving") return <TrendingDown className="h-4 w-4 text-chart-success" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
};

export default function RiskIntelligence() {
  const [selectedSite, setSelectedSite] = useState<SiteRiskScore | null>(null);
  const [regionFilter, setRegionFilter] = useState("all");
  const [narrativeOpen, setNarrativeOpen] = useState(false);
  const [scenarioInflation, setScenarioInflation] = useState(0);
  const [scenarioDiscount, setScenarioDiscount] = useState(0);

  const result = useMemo(() => calculatePortfolioRisk(), []);

  const scenarioResult = useMemo(() => {
    if (scenarioInflation === 0 && scenarioDiscount === 0) return null;
    return calculateScenarioAdjustedRisk(scenarioInflation / 100, scenarioDiscount / 100);
  }, [scenarioInflation, scenarioDiscount]);

  const filteredSites = regionFilter === "all"
    ? result.siteScores
    : result.siteScores.filter(s => s.region === regionFilter);

  const regions = [...new Set(result.siteScores.map(s => s.region))];

  // Chart data
  const distributionData = [
    { range: "0–30 (Low)", count: result.siteScores.filter(s => s.compositeScore <= 30).length, fill: RISK_COLORS.Low },
    { range: "31–60 (Mod)", count: result.siteScores.filter(s => s.compositeScore > 30 && s.compositeScore <= 60).length, fill: RISK_COLORS.Moderate },
    { range: "61–80 (High)", count: result.siteScores.filter(s => s.compositeScore > 60 && s.compositeScore <= 80).length, fill: RISK_COLORS.High },
    { range: "81–100 (Crit)", count: result.siteScores.filter(s => s.compositeScore > 80).length, fill: RISK_COLORS.Critical },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Risk Intelligence</h1>
          <p className="text-sm text-muted-foreground">Executive Environmental Risk Score — AI-driven portfolio risk quantification</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setNarrativeOpen(true)}>
            <Brain className="mr-1 h-4 w-4" /> AI Risk Narrative
          </Button>
          <Button size="sm" variant="outline">
            <FileText className="mr-1 h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>

      {/* Portfolio KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Portfolio Risk Index</p>
                <p className="text-3xl font-bold">{result.portfolioScore}</p>
                <RiskBadge level={result.portfolioLevel} />
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${RISK_COLORS[result.portfolioLevel]}20` }}>
                <ShieldAlert className="h-6 w-6" style={{ color: RISK_COLORS[result.portfolioLevel] }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Exposure Volatility</p>
                <p className="text-3xl font-bold">{result.exposureVolatility}</p>
                <p className="text-xs text-muted-foreground">Score dispersion index</p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-chart-warning/10">
                <Activity className="h-5 w-5 text-chart-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Forecast Confidence</p>
                <p className="text-3xl font-bold">{result.forecastConfidence}%</p>
                <p className="text-xs text-muted-foreground">Based on data quality & volatility</p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Risk Trend</p>
                <div className="flex items-center gap-2 mt-1">
                  <TrendIcon trend={result.portfolioTrend} />
                  <p className="text-lg font-bold">{result.portfolioTrend}</p>
                </div>
                <p className="text-xs text-muted-foreground">Quarter-over-quarter</p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent">
                <BarChart3 className="h-5 w-5 text-accent-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="heatmap">
        <TabsList>
          <TabsTrigger value="heatmap">Site Heatmap</TabsTrigger>
          <TabsTrigger value="distribution">Risk Distribution</TabsTrigger>
          <TabsTrigger value="trend">Risk Trend</TabsTrigger>
          <TabsTrigger value="drivers">Driver Breakdown</TabsTrigger>
          <TabsTrigger value="scenario" className="flex items-center gap-1.5">
            <Brain className="h-3.5 w-3.5" /> Scenario Adjustment
          </TabsTrigger>
        </TabsList>

        {/* Site Heatmap / Table */}
        <TabsContent value="heatmap" className="space-y-4">
          <div className="flex items-center gap-3">
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="w-48 h-8 text-xs">
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {regions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredSites
              .sort((a, b) => b.compositeScore - a.compositeScore)
              .map(site => (
                <Card
                  key={site.siteId}
                  className="cursor-pointer hover:border-primary/40 transition-colors"
                  onClick={() => setSelectedSite(site)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-medium">{site.siteName}</p>
                        <p className="text-[10px] text-muted-foreground">{site.region} • {site.obligationCount} obligations • {formatCurrencyK(site.totalExposure)}</p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <span className="text-xl font-bold" style={{ color: RISK_COLORS[site.level] }}>{site.compositeScore}</span>
                        <RiskBadge level={site.level} />
                      </div>
                    </div>
                    {/* Component bars */}
                    <div className="space-y-1.5">
                      {site.components.map(comp => (
                        <div key={comp.key} className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground w-24 truncate">{comp.name}</span>
                          <Progress value={comp.score} className="h-1.5 flex-1" />
                          <span className="text-[10px] font-mono w-6 text-right">{comp.score}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                      <TrendIcon trend={site.trend} />
                      <span>{site.trend}</span>
                      <ChevronRight className="h-3 w-3 ml-auto" />
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* Risk Distribution */}
        <TabsContent value="distribution" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Risk Distribution by Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={distributionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
                      <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" name="Sites">
                        {distributionData.map((d, i) => (
                          <Cell key={i} fill={d.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Risk Composition (Avg)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={
                      ["Data Completeness", "Cost Escalation", "Regulatory", "Timeline", "Settlement"].map((name, i) => {
                        const keys = ["dataCompleteness", "costEscalation", "regulatory", "timeline", "settlement"];
                        const avg = result.siteScores.reduce((s, ss) => {
                          const comp = ss.components.find(c => c.key === keys[i]);
                          return s + (comp?.score || 0);
                        }, 0) / Math.max(1, result.siteScores.length);
                        return { subject: name, score: Math.round(avg), fullMark: 100 };
                      })
                    }>
                      <PolarGrid stroke="hsl(214, 20%, 88%)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                      <Radar name="Avg Score" dataKey="score" stroke="hsl(187, 60%, 38%)" fill="hsl(187, 60%, 38%)" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Risk Trend */}
        <TabsContent value="trend">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Portfolio Risk Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.trendHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
                    <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="score" stroke="hsl(187, 60%, 38%)" fill="hsl(187, 60%, 38%)" fillOpacity={0.2} name="Risk Score" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Driver Breakdown */}
        <TabsContent value="drivers">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Top Portfolio Risk Drivers</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Rank</TableHead>
                    <TableHead className="text-xs">Driver</TableHead>
                    <TableHead className="text-xs text-right">Weighted Impact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.topDrivers.map((d, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs font-medium">#{i + 1}</TableCell>
                      <TableCell className="text-xs">{d.driver}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{d.contribution}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3">Component Scores by Site</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Site</TableHead>
                      <TableHead className="text-xs text-center">Data</TableHead>
                      <TableHead className="text-xs text-center">Cost</TableHead>
                      <TableHead className="text-xs text-center">Regulatory</TableHead>
                      <TableHead className="text-xs text-center">Timeline</TableHead>
                      <TableHead className="text-xs text-center">Settlement</TableHead>
                      <TableHead className="text-xs text-center">Composite</TableHead>
                      <TableHead className="text-xs">Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.siteScores.sort((a, b) => b.compositeScore - a.compositeScore).map(site => (
                      <TableRow key={site.siteId}>
                        <TableCell className="text-xs font-medium">{site.siteName}</TableCell>
                        {site.components.map(c => (
                          <TableCell key={c.key} className="text-xs text-center font-mono">{c.score}</TableCell>
                        ))}
                        <TableCell className="text-xs text-center font-mono font-bold">{site.compositeScore}</TableCell>
                        <TableCell><RiskBadge level={site.level} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scenario Adjustment */}
        <TabsContent value="scenario" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" /> Scenario-Adjusted Risk Score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-xs text-muted-foreground">
                Simulate how changes in inflation and discount rate assumptions impact the portfolio risk score.
              </p>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-medium">Inflation Change: {scenarioInflation > 0 ? "+" : ""}{scenarioInflation}%</label>
                  <Slider min={-5} max={10} step={0.5} value={[scenarioInflation]} onValueChange={([v]) => setScenarioInflation(v)} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Discount Rate Change: {scenarioDiscount > 0 ? "+" : ""}{scenarioDiscount}%</label>
                  <Slider min={-3} max={5} step={0.25} value={[scenarioDiscount]} onValueChange={([v]) => setScenarioDiscount(v)} />
                </div>
              </div>

              {scenarioResult && (
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-[10px] text-muted-foreground uppercase">Base Score</p>
                      <p className="text-2xl font-bold">{scenarioResult.baseScore}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-[10px] text-muted-foreground uppercase">Adjusted Score</p>
                      <p className="text-2xl font-bold" style={{ color: RISK_COLORS[scenarioResult.adjustedLevel] }}>
                        {scenarioResult.adjustedScore}
                      </p>
                      <RiskBadge level={scenarioResult.adjustedLevel} />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-[10px] text-muted-foreground uppercase">Delta</p>
                      <p className={`text-2xl font-bold ${scenarioResult.delta > 0 ? "text-destructive" : "text-chart-success"}`}>
                        {scenarioResult.delta > 0 ? "+" : ""}{scenarioResult.delta}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {!scenarioResult && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Adjust the sliders above to simulate a scenario.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Site Detail Sheet */}
      <Sheet open={!!selectedSite} onOpenChange={() => setSelectedSite(null)}>
        <SheetContent className="sm:max-w-lg overflow-auto">
          {selectedSite && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <span style={{ color: RISK_COLORS[selectedSite.level] }} className="text-2xl font-bold">{selectedSite.compositeScore}</span>
                  {selectedSite.siteName}
                  <RiskBadge level={selectedSite.level} />
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="flex justify-between text-sm border-b pb-2">
                  <span className="text-muted-foreground">Region</span>
                  <span className="font-medium">{selectedSite.region}</span>
                </div>
                <div className="flex justify-between text-sm border-b pb-2">
                  <span className="text-muted-foreground">Obligations</span>
                  <span className="font-medium">{selectedSite.obligationCount}</span>
                </div>
                <div className="flex justify-between text-sm border-b pb-2">
                  <span className="text-muted-foreground">Total Exposure</span>
                  <span className="font-medium">{formatCurrencyK(selectedSite.totalExposure)}</span>
                </div>
                <div className="flex justify-between text-sm border-b pb-2">
                  <span className="text-muted-foreground">Trend</span>
                  <span className="font-medium flex items-center gap-1"><TrendIcon trend={selectedSite.trend} /> {selectedSite.trend}</span>
                </div>

                <div className="pt-2">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Risk Components</p>
                  {selectedSite.components.map(comp => (
                    <div key={comp.key} className="border rounded-md p-3 mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">{comp.name}</span>
                        <span className="text-xs font-mono font-bold">{comp.score}/100 (×{comp.weight})</span>
                      </div>
                      <Progress value={comp.score} className="h-1.5 mb-1.5" />
                      <p className="text-[10px] text-muted-foreground">{comp.details}</p>
                      {comp.drivers.length > 0 && (
                        <ul className="mt-1">
                          {comp.drivers.map((d, i) => (
                            <li key={i} className="text-[10px] text-muted-foreground flex items-start gap-1">
                              <AlertTriangle className="h-3 w-3 text-chart-warning shrink-0 mt-0.5" />
                              {d}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* AI Narrative Sheet */}
      <Sheet open={narrativeOpen} onOpenChange={setNarrativeOpen}>
        <SheetContent className="sm:max-w-xl overflow-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" /> AI Risk Narrative
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-6 text-sm">
            <section>
              <h3 className="font-semibold flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-[10px]">Section 1</Badge> Executive Summary
              </h3>
              <p className="text-muted-foreground leading-relaxed">{result.narrative.executiveSummary}</p>
            </section>

            <section>
              <h3 className="font-semibold flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-[10px]">Section 2</Badge> Top Risk Drivers
              </h3>
              {result.narrative.topDrivers.map((d, i) => (
                <div key={i} className="flex items-start gap-2 mb-2 border-l-2 border-primary/30 pl-3">
                  <span className="text-xs font-mono text-primary font-bold">{d.contribution}</span>
                  <div>
                    <p className="text-xs font-medium">{d.driver}</p>
                    <p className="text-[10px] text-muted-foreground">{d.detail}</p>
                  </div>
                </div>
              ))}
            </section>

            <section>
              <h3 className="font-semibold flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-[10px]">Section 3</Badge> Exposure Volatility
              </h3>
              <p className="text-muted-foreground leading-relaxed">{result.narrative.exposureVolatility}</p>
            </section>

            <section>
              <h3 className="font-semibold flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-[10px]">Section 4</Badge> Trend Analysis
              </h3>
              <p className="text-muted-foreground leading-relaxed">{result.narrative.trendAnalysis}</p>
            </section>

            <section>
              <h3 className="font-semibold flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-[10px]">Section 5</Badge> Recommended Actions
              </h3>
              <ul className="space-y-1.5">
                {result.narrative.recommendedActions.map((action, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <span className="text-primary font-bold">{i + 1}.</span>
                    <span className="text-muted-foreground">{action}</span>
                  </li>
                ))}
              </ul>
            </section>

            <div className="pt-3 border-t text-[10px] text-muted-foreground">
              Generated: {new Date(result.timestamp).toLocaleString()} • All scores traceable to structured data inputs.
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${RISK_BG[level]}`}>
      {level}
    </span>
  );
}
