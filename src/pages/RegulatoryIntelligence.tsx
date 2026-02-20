import { useState, useEffect } from "react";
import {
  AlertTriangle, Shield, Globe, MapPin, TrendingUp, FileText,
  ChevronRight, Download, RefreshCw, ExternalLink, Info, Radio,
  Building2, DollarSign, Calendar, Target, ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getDashboardSummary,
  generateRegulatoryNarrative,
  getPredictiveRisks,
  type RegulatoryUpdate,
  type RegulatoryImpactAnalysis,
  type RegulatoryNarrative,
  type RegulatoryDashboardSummary,
  type PredictiveRisk,
  type UrgencyLevel,
  type ExposureRisk,
} from "@/lib/regulatory-intelligence-engine";
import { formatCurrency, formatCurrencyK } from "@/data/mock-data";
import { exportToPDF } from "@/lib/export-utils";

const urgencyColor: Record<UrgencyLevel, string> = {
  "Monitor": "bg-chart-success/10 text-chart-success border-chart-success/30",
  "Review": "bg-chart-warning/10 text-chart-warning border-chart-warning/30",
  "Immediate Action": "bg-destructive/10 text-destructive border-destructive/30",
};

const riskColor: Record<ExposureRisk, string> = {
  Low: "bg-chart-success/10 text-chart-success border-chart-success/30",
  Medium: "bg-chart-warning/10 text-chart-warning border-chart-warning/30",
  High: "bg-destructive/10 text-destructive border-destructive/30",
};

const changeTypeColor: Record<string, string> = {
  "New Rule": "bg-destructive/10 text-destructive border-destructive/30",
  "Amendment": "bg-chart-warning/10 text-chart-warning border-chart-warning/30",
  "Enforcement": "bg-destructive/10 text-destructive border-destructive/30",
  "Guidance": "bg-primary/10 text-primary border-primary/30",
  "Proposed Rule": "bg-muted text-muted-foreground border-border",
};

const priorityColor: Record<string, string> = {
  High: "bg-destructive/10 text-destructive border-destructive/30",
  Medium: "bg-chart-warning/10 text-chart-warning border-chart-warning/30",
  Low: "bg-chart-success/10 text-chart-success border-chart-success/30",
};

export default function RegulatoryIntelligence() {
  const [summary, setSummary] = useState<RegulatoryDashboardSummary | null>(null);
  const [predictiveRisks, setPredictiveRisks] = useState<PredictiveRisk[]>([]);
  const [selectedUpdate, setSelectedUpdate] = useState<(RegulatoryUpdate & { analysis: RegulatoryImpactAnalysis }) | null>(null);
  const [narrative, setNarrative] = useState<RegulatoryNarrative | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [filterJurisdiction, setFilterJurisdiction] = useState("all");
  const [filterUrgency, setFilterUrgency] = useState("all");

  useEffect(() => {
    setSummary(getDashboardSummary());
    setPredictiveRisks(getPredictiveRisks());
  }, []);

  const filteredAlerts = summary?.recentAlerts.filter(a => {
    if (filterJurisdiction !== "all" && a.jurisdiction !== filterJurisdiction) return false;
    if (filterUrgency !== "all" && a.analysis.urgency !== filterUrgency) return false;
    return true;
  }) || [];

  const jurisdictions = [...new Set(summary?.recentAlerts.map(a => a.jurisdiction) || [])];

  const handleOpenDetail = async (update: RegulatoryUpdate & { analysis: RegulatoryImpactAnalysis }) => {
    setSelectedUpdate(update);
    setIsGenerating(true);
    setNarrative(null);
    await new Promise(r => setTimeout(r, 1200));
    setNarrative(generateRegulatoryNarrative(update, update.analysis));
    setIsGenerating(false);
  };

  const handleExportPDF = () => {
    if (!narrative || !selectedUpdate) return;
    const rows = [
      ["Executive Summary", narrative.executiveSummary],
      ["What Changed", narrative.whatChanged],
      ["Affected Assets", narrative.affectedAssets],
      ["Financial Implication", narrative.financialImplication],
      ...narrative.recommendedActions.map(a => [`[${a.priority}] ${a.action}`, a.rationale]),
    ];
    exportToPDF("Regulatory Impact Report", ["Section", "Content"], rows, `regulatory-impact-${selectedUpdate.id}`);
  };

  if (!summary) return null;

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Regulatory Intelligence</h1>
          <Badge variant="outline" className="text-xs gap-1">
            <Radio className="h-3 w-3 text-chart-success animate-pulse" /> Live Monitoring
          </Badge>
        </div>

        {/* KPI Row */}
        <div className="grid gap-4 sm:grid-cols-5">
          <KPICard label="Regulatory Updates" value={String(summary.totalUpdates)} subtext="Active monitoring" icon={<Globe className="h-4 w-4 text-primary" />} />
          <KPICard label="High-Impact Alerts" value={String(summary.highImpactCount)} subtext="Require action" icon={<AlertTriangle className="h-4 w-4 text-destructive" />} />
          <KPICard label="Exposure at Risk" value={formatCurrencyK(summary.totalExposureAtRisk)} subtext="Base case estimate" icon={<DollarSign className="h-4 w-4 text-chart-warning" />} />
          <KPICard label="Affected Sites" value={`${summary.affectedSitesCount} / 4`} subtext="Across portfolio" icon={<MapPin className="h-4 w-4 text-chart-ero" />} />
          <KPICard label="AROs Impacted" value={String(summary.affectedAROsCount)} subtext="Require reassessment" icon={<Building2 className="h-4 w-4 text-chart-aro" />} />
        </div>

        <Tabs defaultValue="updates">
          <TabsList>
            <TabsTrigger value="updates">Regulatory Updates</TabsTrigger>
            <TabsTrigger value="predictive">Predictive Risk</TabsTrigger>
            <TabsTrigger value="jurisdiction">Jurisdiction View</TabsTrigger>
          </TabsList>

          {/* Updates Tab */}
          <TabsContent value="updates" className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-2">
              <Select value={filterJurisdiction} onValueChange={setFilterJurisdiction}>
                <SelectTrigger className="h-7 text-xs w-[160px]">
                  <SelectValue placeholder="All Jurisdictions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jurisdictions</SelectItem>
                  {jurisdictions.map(j => <SelectItem key={j} value={j}>{j}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterUrgency} onValueChange={setFilterUrgency}>
                <SelectTrigger className="h-7 text-xs w-[160px]">
                  <SelectValue placeholder="All Urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Urgency</SelectItem>
                  <SelectItem value="Immediate Action">Immediate Action</SelectItem>
                  <SelectItem value="Review">Review</SelectItem>
                  <SelectItem value="Monitor">Monitor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Alert Cards */}
            {filteredAlerts.map(alert => (
              <Card
                key={alert.id}
                className="cursor-pointer hover:border-primary/40 transition-colors"
                onClick={() => handleOpenDetail(alert)}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-sm font-medium">{alert.title}</p>
                        <SeverityBadge label={alert.changeType} colors={changeTypeColor} />
                        <SeverityBadge label={alert.analysis.urgency} colors={urgencyColor} />
                        <SeverityBadge label={alert.analysis.exposureRisk} colors={riskColor} />
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {alert.regulatoryBody} • {alert.jurisdiction} • Published: {alert.publishedDate} • Effective: {alert.effectiveDate}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-sm font-mono font-medium">{alert.analysis.impactScore}/100</p>
                      <p className="text-[10px] text-muted-foreground">Impact Score</p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{alert.summary}</p>

                  <div className="grid grid-cols-4 gap-4 text-xs">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Sites Impacted</p>
                      <p className="font-medium">{alert.analysis.impactedSites.length}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Obligations</p>
                      <p className="font-medium">{alert.analysis.impactedObligations.length}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Exposure (Base)</p>
                      <p className="font-mono font-medium">{formatCurrencyK(alert.analysis.exposure.baseCase)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Confidence</p>
                      <div className="flex items-center gap-1.5">
                        <Progress value={alert.confidenceScore} className="h-1.5 flex-1" />
                        <span className="text-[10px]">{alert.confidenceScore}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Predictive Risk Tab */}
          <TabsContent value="predictive" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Predictive Regulatory Risk Model
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {predictiveRisks.map((risk, i) => (
                  <div key={i} className="border rounded-md p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium">{risk.region}</span>
                        <Badge variant="outline" className="text-[10px]">{risk.riskDomain}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={risk.trendScore} className="h-1.5 w-20" />
                        <span className={`text-xs font-mono font-medium ${risk.trendScore >= 70 ? "text-destructive" : risk.trendScore >= 50 ? "text-chart-warning" : "text-chart-success"}`}>
                          {risk.trendScore}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{risk.rationale}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Jurisdiction Tab */}
          <TabsContent value="jurisdiction">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Jurisdiction Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Jurisdiction</TableHead>
                      <TableHead className="text-xs text-center">Updates</TableHead>
                      <TableHead className="text-xs text-center">High Impact</TableHead>
                      <TableHead className="text-xs text-right">Exposure (Base)</TableHead>
                      <TableHead className="text-xs text-center">Sites</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary.jurisdictionBreakdown.map(j => {
                      const jAlerts = summary.recentAlerts.filter(a => a.jurisdiction === j.jurisdiction);
                      const highCount = jAlerts.filter(a => a.analysis.exposureRisk === "High").length;
                      const totalExposure = jAlerts.reduce((s, a) => s + a.analysis.exposure.baseCase, 0);
                      const siteIds = new Set(jAlerts.flatMap(a => a.analysis.impactedSites.map(s => s.siteId)));
                      return (
                        <TableRow key={j.jurisdiction}>
                          <TableCell className="text-xs font-medium">{j.jurisdiction}</TableCell>
                          <TableCell className="text-xs text-center">{j.count}</TableCell>
                          <TableCell className="text-center">
                            {highCount > 0 ? (
                              <Badge variant="outline" className="text-[10px] border-destructive/40 text-destructive">{highCount}</Badge>
                            ) : <span className="text-[10px] text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell className="text-xs text-right font-mono">{formatCurrencyK(totalExposure)}</TableCell>
                          <TableCell className="text-xs text-center">{siteIds.size}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Detail Sheet */}
        <Sheet open={!!selectedUpdate} onOpenChange={() => { setSelectedUpdate(null); setNarrative(null); }}>
          <SheetContent className="sm:max-w-2xl overflow-auto">
            {selectedUpdate && (
              <>
                <SheetHeader>
                  <SheetTitle className="text-base flex items-center gap-2 flex-wrap">
                    <Shield className="h-4 w-4 text-primary" />
                    {selectedUpdate.title}
                  </SheetTitle>
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    <SeverityBadge label={selectedUpdate.changeType} colors={changeTypeColor} />
                    <SeverityBadge label={selectedUpdate.analysis.urgency} colors={urgencyColor} />
                    <SeverityBadge label={`Score: ${selectedUpdate.analysis.impactScore}`} colors={
                      selectedUpdate.analysis.impactScore >= 65
                        ? { [`Score: ${selectedUpdate.analysis.impactScore}`]: riskColor.High }
                        : selectedUpdate.analysis.impactScore >= 40
                          ? { [`Score: ${selectedUpdate.analysis.impactScore}`]: riskColor.Medium }
                          : { [`Score: ${selectedUpdate.analysis.impactScore}`]: riskColor.Low }
                    } />
                  </div>
                </SheetHeader>

                {isGenerating ? (
                  <div className="mt-8 space-y-4">
                    <div className="flex items-center gap-3">
                      <RefreshCw className="h-4 w-4 text-primary animate-spin" />
                      <p className="text-sm text-muted-foreground">Analyzing regulatory impact…</p>
                    </div>
                    {["Parsing regulatory text", "Mapping affected sites", "Estimating financial exposure", "Generating narrative"].map((step, i) => (
                      <div key={step} className="flex items-center gap-2 ml-7">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: `${i * 250}ms` }} />
                        <span className="text-xs text-muted-foreground">{step}</span>
                      </div>
                    ))}
                  </div>
                ) : narrative ? (
                  <ScrollArea className="mt-4 h-[calc(100vh-140px)]">
                    <div className="space-y-5 pr-4">
                      {/* Meta */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="border rounded-md p-2.5">
                          <p className="text-[10px] text-muted-foreground">Regulatory Body</p>
                          <p className="font-medium">{selectedUpdate.regulatoryBody}</p>
                        </div>
                        <div className="border rounded-md p-2.5">
                          <p className="text-[10px] text-muted-foreground">Effective Date</p>
                          <p className="font-medium">{selectedUpdate.effectiveDate}</p>
                        </div>
                        <div className="border rounded-md p-2.5">
                          <p className="text-[10px] text-muted-foreground">Exposure Range</p>
                          <p className="font-mono font-medium">
                            {formatCurrency(selectedUpdate.analysis.exposure.lowCase)} – {formatCurrency(selectedUpdate.analysis.exposure.highCase)}
                          </p>
                        </div>
                        <div className="border rounded-md p-2.5">
                          <p className="text-[10px] text-muted-foreground">Confidence</p>
                          <div className="flex items-center gap-2">
                            <Progress value={selectedUpdate.confidenceScore} className="h-1.5 flex-1" />
                            <span className="font-medium">{selectedUpdate.confidenceScore}%</span>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <section>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Executive Summary</h3>
                        <p className="text-sm leading-relaxed">{narrative.executiveSummary}</p>
                      </section>

                      <Separator />

                      <section>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">What Changed</h3>
                        <p className="text-sm leading-relaxed whitespace-pre-line">{narrative.whatChanged}</p>
                      </section>

                      <Separator />

                      <section>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Affected Assets</h3>
                        <p className="text-sm leading-relaxed whitespace-pre-line">{narrative.affectedAssets}</p>
                      </section>

                      <Separator />

                      {/* Impacted Sites Table */}
                      {selectedUpdate.analysis.impactedSites.length > 0 && (
                        <section>
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Impacted Sites</h3>
                          <div className="space-y-1.5">
                            {selectedUpdate.analysis.impactedSites.map(s => (
                              <div key={s.siteId} className="border rounded-md p-2.5 text-xs flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{s.siteName}</p>
                                  <p className="text-[10px] text-muted-foreground">{s.matchReason}</p>
                                </div>
                                <Badge variant="outline" className="text-[10px]">{s.obligationsAffected} obligation(s)</Badge>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      <Separator />

                      <section>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Financial Implication</h3>
                        <p className="text-sm leading-relaxed whitespace-pre-line">{narrative.financialImplication}</p>
                      </section>

                      <Separator />

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

                      <section>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Source Reference</h3>
                        <p className="text-xs text-muted-foreground">{narrative.sourceReference}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Generated: {new Date(narrative.generatedAt).toLocaleString()}</p>
                      </section>

                      <div className="flex gap-2 pt-2 pb-4">
                        <Button variant="outline" size="sm" className="text-xs" onClick={handleExportPDF}>
                          <Download className="h-3 w-3 mr-1" /> Export PDF
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs" asChild>
                          <a href={selectedUpdate.sourceUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" /> Source Document
                          </a>
                        </Button>
                      </div>
                    </div>
                  </ScrollArea>
                ) : null}
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </TooltipProvider>
  );
}

function KPICard({ label, value, subtext, icon }: { label: string; value: string; subtext: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className="text-lg font-bold mt-1">{value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{subtext}</p>
          </div>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function SeverityBadge({ label, colors }: { label: string; colors: Record<string, string> }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${colors[label] || "bg-muted text-muted-foreground border-border"}`}>
      {label}
    </span>
  );
}
