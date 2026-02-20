import { useState, useEffect } from "react";
import {
  AlertTriangle, TrendingDown, TrendingUp, Activity, Target, FileText,
  ChevronRight, Download, RefreshCw, ArrowUpRight, ArrowDownRight, Info,
  BarChart3, Shield
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  analyzePortfolio,
  getAllProjectAnalyses,
  generateVarianceNarrative,
  generatePortfolioNarrative,
  generateRecalibrationSuggestions,
  type ProjectVarianceAnalysis,
  type PortfolioVarianceSummary,
  type VarianceNarrative,
  type VarianceSeverity,
  type RecalibrationSuggestion,
} from "@/lib/variance-intelligence-engine";
import { formatCurrency, formatCurrencyK } from "@/data/mock-data";
import { exportToPDF } from "@/lib/export-utils";

const severityColor: Record<VarianceSeverity, string> = {
  Normal: "bg-chart-success/10 text-chart-success border-chart-success/30",
  Watch: "bg-primary/10 text-primary border-primary/30",
  Warning: "bg-chart-warning/10 text-chart-warning border-chart-warning/30",
  Critical: "bg-destructive/10 text-destructive border-destructive/30",
};

const priorityColor: Record<string, string> = {
  High: "bg-destructive/10 text-destructive border-destructive/30",
  Medium: "bg-chart-warning/10 text-chart-warning border-chart-warning/30",
  Low: "bg-chart-success/10 text-chart-success border-chart-success/30",
};

export default function VarianceIntelligenceTab() {
  const [portfolio, setPortfolio] = useState<PortfolioVarianceSummary | null>(null);
  const [projects, setProjects] = useState<ProjectVarianceAnalysis[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectVarianceAnalysis | null>(null);
  const [narrative, setNarrative] = useState<VarianceNarrative | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [filterSite, setFilterSite] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [recalibrations, setRecalibrations] = useState<RecalibrationSuggestion[]>([]);
  const [showNarrativeSheet, setShowNarrativeSheet] = useState(false);

  useEffect(() => {
    const p = analyzePortfolio();
    setPortfolio(p);
    setProjects(getAllProjectAnalyses());
    setRecalibrations(generateRecalibrationSuggestions(p));
  }, []);

  const filteredProjects = projects.filter(p => {
    if (filterSite !== "all" && p.siteName !== filterSite) return false;
    if (filterSeverity !== "all" && p.severity !== filterSeverity) return false;
    return true;
  });

  const sites = [...new Set(projects.map(p => p.siteName))];

  const handleExplainVariance = async (analysis: ProjectVarianceAnalysis | null) => {
    setIsGenerating(true);
    setShowNarrativeSheet(true);

    // Simulate AI processing
    await new Promise(r => setTimeout(r, 1500));

    if (analysis) {
      setNarrative(generateVarianceNarrative(analysis));
    } else if (portfolio) {
      setNarrative(generatePortfolioNarrative(portfolio));
    }
    setIsGenerating(false);
  };

  const handleExportPDF = () => {
    if (!narrative) return;
    const content = [
      ["Variance Intelligence Report"],
      [""],
      ["Executive Summary"],
      [narrative.executiveSummary],
      [""],
      ["Primary Drivers"],
      ...narrative.primaryDrivers.map(d =>
        [`${d.rank}. ${d.driver}: ${d.dollarImpact} (${d.percentContribution})`]
      ),
      [""],
      ["Financial Risk Implication"],
      [narrative.financialRiskImplication],
      [""],
      ["Pattern Analysis"],
      [narrative.patternAnalysis],
      [""],
      ["Recommended Actions"],
      ...narrative.recommendedActions.map(a => [`[${a.priority}] ${a.action}`]),
    ];
    const headers = ["Section", "Content"];
    const rows = [
      ["Executive Summary", narrative.executiveSummary],
      ...narrative.primaryDrivers.map(d => [`Driver #${d.rank}: ${d.driver}`, `${d.dollarImpact} (${d.percentContribution}) — ${d.evidence}`]),
      ["Financial Risk", narrative.financialRiskImplication],
      ["Pattern Analysis", narrative.patternAnalysis],
      ...narrative.recommendedActions.map(a => [`[${a.priority}] ${a.action}`, a.rationale]),
    ];
    exportToPDF(
      "Variance Intelligence Report",
      headers,
      rows,
      `variance-intelligence-${new Date().toISOString().slice(0, 10)}`
    );
  };

  if (!portfolio) return null;

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Summary KPIs */}
        <div className="grid gap-4 sm:grid-cols-5">
          <KPICard
            label="Total Variance"
            value={formatCurrencyK(Math.abs(portfolio.totalVariance))}
            subtext={`${Math.abs(portfolio.variancePercent).toFixed(1)}% ${portfolio.totalVariance >= 0 ? "favorable" : "unfavorable"}`}
            icon={portfolio.totalVariance >= 0
              ? <TrendingUp className="h-4 w-4 text-chart-success" />
              : <TrendingDown className="h-4 w-4 text-destructive" />
            }
            trend={portfolio.totalVariance >= 0 ? "positive" : "negative"}
          />
          <KPICard
            label="Favorable"
            value={formatCurrencyK(portfolio.favorableTotal)}
            subtext="Under budget categories"
            icon={<ArrowDownRight className="h-4 w-4 text-chart-success" />}
            trend="positive"
          />
          <KPICard
            label="Unfavorable"
            value={formatCurrencyK(portfolio.unfavorableTotal)}
            subtext="Over budget categories"
            icon={<ArrowUpRight className="h-4 w-4 text-destructive" />}
            trend="negative"
          />
          <KPICard
            label="Anomalies"
            value={String(portfolio.anomalyCount)}
            subtext={`${portfolio.highRiskProjects.length} high-risk project(s)`}
            icon={<AlertTriangle className="h-4 w-4 text-chart-warning" />}
            trend="neutral"
          />
          <KPICard
            label="Risk Score"
            value={`${portfolio.riskScore}/100`}
            subtext={`Confidence: ${portfolio.forecastConfidence}%`}
            icon={<Shield className="h-4 w-4 text-primary" />}
            trend={portfolio.riskScore > 50 ? "negative" : "positive"}
          />
        </div>

        {/* Top Drivers + Trend */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Top Variance Drivers</CardTitle>
                <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => handleExplainVariance(null)}>
                  <FileText className="h-3 w-3 mr-1" /> Explain Portfolio Variance
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {portfolio.topDrivers.map((driver, i) => (
                <div key={driver.category} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-muted-foreground w-4">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{driver.category}</span>
                      <span className="text-xs font-mono">{formatCurrency(driver.dollarImpact)}</span>
                    </div>
                    <Progress value={driver.percentContribution} className="h-1.5" />
                  </div>
                  <span className="text-[10px] text-muted-foreground w-10 text-right">
                    {driver.percentContribution.toFixed(0)}%
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Forecast Recalibration Suggestions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recalibrations.map((r, i) => (
                <div key={i} className="border rounded-md p-2.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{r.parameter}</span>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-muted-foreground font-mono">{r.currentValue}</span>
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      <span className="font-mono font-medium text-primary">{r.suggestedValue}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{r.rationale}</p>
                  <p className="text-[10px] font-medium">Impact: {r.impactEstimate}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Project-Level Variance Table */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-sm font-medium">Project Variance Analysis</CardTitle>
              <div className="flex items-center gap-2">
                <Select value={filterSite} onValueChange={setFilterSite}>
                  <SelectTrigger className="h-7 text-xs w-[140px]">
                    <SelectValue placeholder="All Sites" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sites</SelectItem>
                    {sites.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                  <SelectTrigger className="h-7 text-xs w-[120px]">
                    <SelectValue placeholder="All Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severity</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="Warning">Warning</SelectItem>
                    <SelectItem value="Watch">Watch</SelectItem>
                    <SelectItem value="Normal">Normal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Project</TableHead>
                  <TableHead className="text-xs">Site</TableHead>
                  <TableHead className="text-xs text-right">Budget</TableHead>
                  <TableHead className="text-xs text-right">Spent</TableHead>
                  <TableHead className="text-xs text-right">Variance</TableHead>
                  <TableHead className="text-xs">Severity</TableHead>
                  <TableHead className="text-xs">Top Driver</TableHead>
                  <TableHead className="text-xs text-center">Anomalies</TableHead>
                  <TableHead className="text-xs text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map(p => (
                  <TableRow key={p.projectId} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedProject(p)}>
                    <TableCell>
                      <div>
                        <p className="text-xs font-medium">{p.projectName}</p>
                        <p className="text-[10px] text-muted-foreground">{p.type} • {p.projectId}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">{p.siteName}</TableCell>
                    <TableCell className="text-xs text-right font-mono">{formatCurrencyK(p.totalBudget)}</TableCell>
                    <TableCell className="text-xs text-right font-mono">{formatCurrencyK(p.totalSpent)}</TableCell>
                    <TableCell className={`text-xs text-right font-mono ${p.totalVariance >= 0 ? "text-chart-success" : "text-destructive"}`}>
                      {p.totalVariance >= 0 ? "" : "-"}{formatCurrencyK(Math.abs(p.totalVariance))}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${severityColor[p.severity]}`}>
                        {p.severity}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs max-w-[120px] truncate">
                      {p.drivers[0]?.category || "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      {p.anomalies.length > 0 ? (
                        <Badge variant="outline" className="text-[10px] border-chart-warning/40 text-chart-warning">
                          {p.anomalies.length}
                        </Badge>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px] px-2"
                        onClick={(e) => { e.stopPropagation(); handleExplainVariance(p); }}
                      >
                        <FileText className="h-3 w-3 mr-1" /> Explain
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Anomaly Flags */}
        {projects.some(p => p.anomalies.length > 0) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-chart-warning" />
                Anomaly Detection Flags
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Project</TableHead>
                    <TableHead className="text-xs">Description</TableHead>
                    <TableHead className="text-xs">Severity</TableHead>
                    <TableHead className="text-xs">Detected</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.flatMap(p => p.anomalies).map(a => (
                    <TableRow key={a.id}>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">{a.type}</Badge>
                      </TableCell>
                      <TableCell className="text-xs font-medium">{a.projectName}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[280px]">{a.description}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${severityColor[a.severity]}`}>
                          {a.severity}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">{a.detectedDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Predictive Warnings */}
        {projects.some(p => p.predictiveWarning) && (
          <Card className="border-chart-warning/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-chart-warning" />
                Predictive Variance Warnings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {projects.filter(p => p.predictiveWarning).map(p => (
                <div key={p.projectId} className="border rounded-md p-3 bg-chart-warning/5">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-chart-warning mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium">{p.projectName} — {p.siteName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{p.predictiveWarning}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Project Detail Sheet */}
        <Sheet open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
          <SheetContent className="sm:max-w-lg overflow-auto">
            {selectedProject && (
              <>
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2 text-base">
                    {selectedProject.projectName}
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${severityColor[selectedProject.severity]}`}>
                      {selectedProject.severity}
                    </span>
                  </SheetTitle>
                </SheetHeader>

                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="border rounded-md p-2.5">
                      <p className="text-[10px] text-muted-foreground">Budget</p>
                      <p className="font-mono font-medium">{formatCurrency(selectedProject.totalBudget)}</p>
                    </div>
                    <div className="border rounded-md p-2.5">
                      <p className="text-[10px] text-muted-foreground">Spent</p>
                      <p className="font-mono font-medium">{formatCurrency(selectedProject.totalSpent)}</p>
                    </div>
                    <div className="border rounded-md p-2.5">
                      <p className="text-[10px] text-muted-foreground">Variance</p>
                      <p className={`font-mono font-medium ${selectedProject.totalVariance >= 0 ? "text-chart-success" : "text-destructive"}`}>
                        {selectedProject.totalVariance >= 0 ? "" : "-"}{formatCurrency(Math.abs(selectedProject.totalVariance))}
                      </p>
                    </div>
                    <div className="border rounded-md p-2.5">
                      <p className="text-[10px] text-muted-foreground">Anomalies</p>
                      <p className="font-medium">{selectedProject.anomalies.length} detected</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-xs font-medium mb-2">Root Cause Drivers</p>
                    {selectedProject.drivers.map((d, i) => (
                      <div key={d.category} className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] text-muted-foreground w-3">{i + 1}</span>
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-0.5">
                            <span className="font-medium">{d.category}</span>
                            <span className="font-mono">{formatCurrency(d.dollarImpact)} ({d.percentContribution.toFixed(0)}%)</span>
                          </div>
                          <Progress value={d.percentContribution} className="h-1" />
                          <div className="flex justify-between mt-0.5">
                            <p className="text-[10px] text-muted-foreground max-w-[70%] truncate">{d.supportingEvidence}</p>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-3 w-3 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent side="left" className="max-w-xs text-xs">
                                <p className="font-medium">Confidence: {d.confidence}%</p>
                                <p className="text-muted-foreground">Source: {d.dataSource}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div>
                    <p className="text-xs font-medium mb-2">Cost Item Breakdown</p>
                    {selectedProject.costItemBreakdown.map(ci => (
                      <div key={ci.category} className={`border rounded-md p-2 mb-1.5 text-xs ${ci.isAnomaly ? "border-chart-warning/40 bg-chart-warning/5" : ""}`}>
                        <div className="flex justify-between mb-0.5">
                          <span className="font-medium">{ci.category}</span>
                          <span className={`font-mono ${ci.variance >= 0 ? "text-chart-success" : "text-destructive"}`}>
                            {ci.variance >= 0 ? "+" : ""}{formatCurrency(ci.variance)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={Math.min(100, ci.percentUsed)} className="h-1 flex-1" />
                          <span className="text-[10px] text-muted-foreground">{ci.percentUsed.toFixed(0)}%</span>
                        </div>
                        {ci.isAnomaly && (
                          <p className="text-[10px] text-chart-warning mt-1 flex items-center gap-1">
                            <AlertTriangle className="h-2.5 w-2.5" /> {ci.anomalyReason}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div>
                    <p className="text-xs font-medium mb-2">Vendor Analysis</p>
                    {selectedProject.vendorAnalysis.map(v => (
                      <div key={v.vendorName} className={`border rounded-md p-2 mb-1.5 text-xs ${v.isOverrun ? "border-destructive/30 bg-destructive/5" : ""}`}>
                        <p className="font-medium">{v.vendorName}</p>
                        <div className="grid grid-cols-3 gap-2 mt-1 text-[10px]">
                          <div>
                            <span className="text-muted-foreground">Contract</span>
                            <p className="font-mono">{formatCurrency(v.contractAmount)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Invoiced</span>
                            <p className="font-mono">{formatCurrency(v.invoicedAmount)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Invoice Ratio</span>
                            <p className={`font-mono ${v.invoiceRatio > 0.9 ? "text-chart-warning" : ""} ${v.isOverrun ? "text-destructive" : ""}`}>
                              {(v.invoiceRatio * 100).toFixed(0)}%
                            </p>
                          </div>
                        </div>
                        {v.isOverrun && (
                          <p className="text-[10px] text-destructive mt-1">Overrun: {formatCurrency(v.overrunAmount)}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  <Button className="w-full text-xs" onClick={() => handleExplainVariance(selectedProject)}>
                    <FileText className="h-3.5 w-3.5 mr-1.5" /> Generate Full Explanation
                  </Button>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>

        {/* Narrative Sheet */}
        <Sheet open={showNarrativeSheet} onOpenChange={setShowNarrativeSheet}>
          <SheetContent className="sm:max-w-2xl overflow-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4 text-primary" />
                Variance Intelligence Report
              </SheetTitle>
            </SheetHeader>

            {isGenerating ? (
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-4 w-4 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">Analyzing variance patterns…</p>
                </div>
                {["Detecting anomalies", "Classifying root causes", "Computing attribution", "Generating narrative"].map((step, i) => (
                  <div key={step} className="flex items-center gap-2 ml-7">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: `${i * 300}ms` }} />
                    <span className="text-xs text-muted-foreground">{step}</span>
                  </div>
                ))}
              </div>
            ) : narrative ? (
              <ScrollArea className="mt-4 h-[calc(100vh-120px)]">
                <div className="space-y-5 pr-4">
                  {/* Executive Summary */}
                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Executive Summary</h3>
                    <p className="text-sm leading-relaxed">{narrative.executiveSummary}</p>
                  </section>

                  <Separator />

                  {/* Primary Drivers */}
                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Primary Drivers</h3>
                    <div className="space-y-2">
                      {narrative.primaryDrivers.map(d => (
                        <div key={d.rank} className="border rounded-md p-3">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-primary">#{d.rank}</span>
                              <span className="text-sm font-medium">{d.driver}</span>
                            </div>
                            <div className="text-right text-xs">
                              <span className="font-mono font-medium">{d.dollarImpact}</span>
                              <span className="text-muted-foreground ml-2">({d.percentContribution})</span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">{d.evidence}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <Separator />

                  {/* Financial Risk */}
                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Financial Risk Implication</h3>
                    <p className="text-sm leading-relaxed">{narrative.financialRiskImplication}</p>
                  </section>

                  <Separator />

                  {/* Pattern Analysis */}
                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Pattern Analysis</h3>
                    <p className="text-sm leading-relaxed">{narrative.patternAnalysis}</p>
                  </section>

                  <Separator />

                  {/* Recommended Actions */}
                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Recommended Actions</h3>
                    <div className="space-y-2">
                      {narrative.recommendedActions.map((a, i) => (
                        <div key={i} className="border rounded-md p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${priorityColor[a.priority]}`}>
                              {a.priority}
                            </span>
                            <span className="text-sm font-medium">{a.action}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{a.rationale}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <Separator />

                  {/* Data Snapshot */}
                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Data Snapshot</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(narrative.dataSnapshot).map(([key, val]) => (
                        <div key={key} className="flex justify-between border-b pb-1 text-xs">
                          <span className="text-muted-foreground">{key}</span>
                          <span className="font-mono font-medium">{val}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      Generated: {new Date(narrative.generatedAt).toLocaleString()} • {narrative.generatedBy}
                    </p>
                  </section>

                  <div className="flex gap-2 pt-2 pb-4">
                    <Button variant="outline" size="sm" className="text-xs" onClick={handleExportPDF}>
                      <Download className="h-3 w-3 mr-1" /> Export PDF
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            ) : null}
          </SheetContent>
        </Sheet>
      </div>
    </TooltipProvider>
  );
}

function KPICard({
  label, value, subtext, icon, trend,
}: {
  label: string; value: string; subtext: string; icon: React.ReactNode; trend: "positive" | "negative" | "neutral";
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className="text-lg font-bold mt-1">{value}</p>
            <p className={`text-[10px] mt-0.5 ${trend === "positive" ? "text-chart-success" : trend === "negative" ? "text-destructive" : "text-muted-foreground"}`}>
              {subtext}
            </p>
          </div>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
