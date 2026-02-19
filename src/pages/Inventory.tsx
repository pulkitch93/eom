import { useState } from "react";
import {
  ChevronRight, ChevronDown, MapPin, Building2, Box, Search,
  Globe, Phone, Mail, Calendar, Shield, AlertTriangle, TrendingUp,
  Wrench, FileText, Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  sites, obligations, Obligation, formatCurrency, formatCurrencyK,
  environmentalExposures, aroTrackingEntries, getAllAssets,
  Site, EnvironmentalExposure, AROTrackingEntry
} from "@/data/mock-data";

const statusColor: Record<string, string> = {
  Active: "bg-chart-success/10 text-chart-success border-chart-success/30",
  "Under Review": "bg-chart-warning/10 text-chart-warning border-chart-warning/30",
  Settled: "bg-muted text-muted-foreground border-border",
  Pending: "bg-primary/10 text-primary border-primary/30",
};

const complianceColor: Record<string, string> = {
  Compliant: "bg-chart-success/10 text-chart-success border-chart-success/30",
  "Non-Compliant": "bg-destructive/10 text-destructive border-destructive/30",
  "Under Investigation": "bg-chart-warning/10 text-chart-warning border-chart-warning/30",
  "Pending Review": "bg-primary/10 text-primary border-primary/30",
};

const riskColor: Record<string, string> = {
  Low: "bg-chart-success/10 text-chart-success border-chart-success/30",
  Medium: "bg-chart-warning/10 text-chart-warning border-chart-warning/30",
  High: "bg-destructive/10 text-destructive border-destructive/30",
  Critical: "bg-destructive/20 text-destructive border-destructive/50",
};

const conditionColor: Record<string, string> = {
  Good: "bg-chart-success/10 text-chart-success border-chart-success/30",
  Fair: "bg-chart-warning/10 text-chart-warning border-chart-warning/30",
  Poor: "bg-destructive/10 text-destructive border-destructive/30",
  Decommissioned: "bg-muted text-muted-foreground border-border",
};

export default function Inventory() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedSites, setExpandedSites] = useState<Set<string>>(new Set(["S001"]));
  const [expandedFacilities, setExpandedFacilities] = useState<Set<string>>(new Set());
  const [selectedObligation, setSelectedObligation] = useState<Obligation | null>(null);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [selectedExposure, setSelectedExposure] = useState<EnvironmentalExposure | null>(null);
  const [activeTab, setActiveTab] = useState("registry");

  const toggleSite = (id: string) => {
    const s = new Set(expandedSites);
    s.has(id) ? s.delete(id) : s.add(id);
    setExpandedSites(s);
  };
  const toggleFacility = (id: string) => {
    const s = new Set(expandedFacilities);
    s.has(id) ? s.delete(id) : s.add(id);
    setExpandedFacilities(s);
  };

  const filtered = obligations.filter((o) => {
    if (search && !o.name.toLowerCase().includes(search.toLowerCase()) && !o.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== "all" && o.type !== typeFilter) return false;
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    return true;
  });

  const allAssets = getAllAssets();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Inventory</h1>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Site Hierarchy Tree */}
        <Card className="h-fit">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Asset / Site Hierarchy</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            {sites.map((site) => {
              const siteObls = obligations.filter(o => o.siteId === site.id);
              return (
                <div key={site.id}>
                  <button onClick={() => toggleSite(site.id)} className="flex items-center gap-1.5 w-full text-left py-1 hover:text-primary font-medium">
                    {expandedSites.has(site.id) ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {site.name}
                    <Badge variant="outline" className="ml-auto text-[10px] h-4">{siteObls.length}</Badge>
                  </button>
                  {expandedSites.has(site.id) && site.facilities.map((fac) => {
                    const facObls = obligations.filter(o => o.facilityId === fac.id);
                    return (
                      <div key={fac.id} className="ml-5">
                        <button onClick={() => toggleFacility(fac.id)} className="flex items-center gap-1.5 w-full text-left py-1 hover:text-primary text-muted-foreground">
                          {expandedFacilities.has(fac.id) ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                          <Building2 className="h-3 w-3" />
                          {fac.name}
                          <Badge variant="outline" className="ml-auto text-[10px] h-4">{facObls.length}</Badge>
                        </button>
                        {expandedFacilities.has(fac.id) && fac.assets.map((asset) => {
                          const assetObls = obligations.filter(o => o.assetId === asset.id);
                          return (
                            <div key={asset.id} className="ml-6 flex items-center gap-1.5 py-0.5 text-xs text-muted-foreground">
                              <Box className="h-3 w-3" /> {asset.name}
                              {assetObls.length > 0 && (
                                <Badge variant="outline" className="ml-auto text-[10px] h-4">{assetObls.length}</Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Main Content with Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="registry" className="text-xs"><FileText className="h-3.5 w-3.5 mr-1" />Registry</TabsTrigger>
            <TabsTrigger value="sites" className="text-xs"><MapPin className="h-3.5 w-3.5 mr-1" />Site Data</TabsTrigger>
            <TabsTrigger value="assets" className="text-xs"><Box className="h-3.5 w-3.5 mr-1" />Assets</TabsTrigger>
            <TabsTrigger value="aro" className="text-xs"><TrendingUp className="h-3.5 w-3.5 mr-1" />ARO Tracking</TabsTrigger>
            <TabsTrigger value="exposure" className="text-xs"><AlertTriangle className="h-3.5 w-3.5 mr-1" />Exposure</TabsTrigger>
          </TabsList>

          {/* ===== REGISTRY TAB ===== */}
          <TabsContent value="registry">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-sm font-medium">Obligation Registry</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <Input placeholder="Search…" className="pl-8 h-9 w-48 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="h-9 w-24 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="ARO">ARO</SelectItem>
                        <SelectItem value="ERO">ERO</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="h-9 w-28 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Under Review">Under Review</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Settled">Settled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">ID</TableHead>
                      <TableHead className="text-xs">Name</TableHead>
                      <TableHead className="text-xs">Type</TableHead>
                      <TableHead className="text-xs">Site</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs text-right">Liability</TableHead>
                      <TableHead className="text-xs text-right">Accretion</TableHead>
                      <TableHead className="text-xs">Target Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((o) => (
                      <TableRow key={o.id} className="cursor-pointer" onClick={() => setSelectedObligation(o)}>
                        <TableCell className="text-xs font-mono">{o.id}</TableCell>
                        <TableCell className="text-xs font-medium">{o.name}</TableCell>
                        <TableCell><Badge variant={o.type === "ARO" ? "default" : "secondary"} className="text-[10px]">{o.type}</Badge></TableCell>
                        <TableCell className="text-xs">{o.siteName}</TableCell>
                        <TableCell><StatusBadge status={o.status} colors={statusColor} /></TableCell>
                        <TableCell className="text-xs text-right font-mono">{formatCurrency(o.currentLiability)}</TableCell>
                        <TableCell className="text-xs text-right font-mono">{formatCurrency(o.accretionExpense)}</TableCell>
                        <TableCell className="text-xs">{o.targetSettlementDate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== SITE DATA TAB ===== */}
          <TabsContent value="sites" className="space-y-4">
            {sites.map((site) => {
              const siteObls = obligations.filter(o => o.siteId === site.id);
              const siteExposures = environmentalExposures.filter(e => e.siteId === site.id);
              const totalLiability = siteObls.reduce((s, o) => s + o.currentLiability, 0);
              return (
                <Card key={site.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <CardTitle className="text-sm font-medium">{site.name}</CardTitle>
                        <StatusBadge status={site.complianceStatus} colors={complianceColor} />
                      </div>
                      <button onClick={() => setSelectedSite(site)} className="text-xs text-primary hover:underline">View Details</button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Location</p>
                        <p className="text-xs">{site.address}</p>
                        <p className="text-[10px] text-muted-foreground">{site.latitude.toFixed(4)}°N, {Math.abs(site.longitude).toFixed(4)}°W</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Operations</p>
                        <p className="text-xs">{site.siteType}</p>
                        <p className="text-[10px] text-muted-foreground">{site.totalAcreage.toLocaleString()} acres • {site.operatingStatus}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Obligations</p>
                        <p className="text-xs font-mono font-medium">{formatCurrencyK(totalLiability)}</p>
                        <p className="text-[10px] text-muted-foreground">{siteObls.length} obligations • {siteExposures.length} exposures</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Regulatory</p>
                        <p className="text-xs">{site.regulatoryAgency}</p>
                        <p className="text-[10px] text-muted-foreground">Next inspection: {site.nextInspectionDate}</p>
                      </div>
                    </div>
                    {/* Contacts */}
                    <div className="mt-4 pt-3 border-t">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Site Contacts</p>
                      <div className="flex flex-wrap gap-4">
                        {site.siteContacts.map((c, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs">
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-medium text-primary">{c.name.split(" ").map(n => n[0]).join("")}</div>
                            <div>
                              <p className="font-medium">{c.name}</p>
                              <p className="text-[10px] text-muted-foreground">{c.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* ===== ASSET OBLIGATIONS TAB ===== */}
          <TabsContent value="assets">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Asset-Level Obligations</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Asset</TableHead>
                      <TableHead className="text-xs">Type</TableHead>
                      <TableHead className="text-xs">Site / Facility</TableHead>
                      <TableHead className="text-xs">Condition</TableHead>
                      <TableHead className="text-xs text-right">Net Book Value</TableHead>
                      <TableHead className="text-xs text-right">Remaining Life</TableHead>
                      <TableHead className="text-xs">Obligations</TableHead>
                      <TableHead className="text-xs text-right">Total Liability</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allAssets.map((asset) => {
                      const assetObls = obligations.filter(o => o.assetId === asset.id);
                      const totalLiability = assetObls.reduce((s, o) => s + o.currentLiability, 0);
                      return (
                        <TableRow key={asset.id}>
                          <TableCell>
                            <div>
                              <p className="text-xs font-medium">{asset.name}</p>
                              <p className="text-[10px] text-muted-foreground font-mono">{asset.id}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">{asset.assetType}</TableCell>
                          <TableCell>
                            <div>
                              <p className="text-xs">{asset.siteName}</p>
                              <p className="text-[10px] text-muted-foreground">{asset.facilityName}</p>
                            </div>
                          </TableCell>
                          <TableCell><StatusBadge status={asset.condition} colors={conditionColor} /></TableCell>
                          <TableCell className="text-xs text-right font-mono">{formatCurrencyK(asset.netBookValue)}</TableCell>
                          <TableCell className="text-xs text-right">{asset.remainingLifeYears > 0 ? `${asset.remainingLifeYears} yrs` : "—"}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {assetObls.length > 0 ? assetObls.map(o => (
                                <Badge key={o.id} variant={o.type === "ARO" ? "default" : "secondary"} className="text-[10px] cursor-pointer" onClick={() => setSelectedObligation(o)}>
                                  {o.type}
                                </Badge>
                              )) : <span className="text-[10px] text-muted-foreground">None</span>}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-right font-mono">{totalLiability > 0 ? formatCurrency(totalLiability) : "—"}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== ARO TRACKING TAB ===== */}
          <TabsContent value="aro" className="space-y-4">
            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-4">
              <SummaryCard label="Active AROs" value={aroTrackingEntries.length.toString()} icon={<Activity className="h-4 w-4 text-primary" />} />
              <SummaryCard label="Total Fair Value" value={formatCurrencyK(aroTrackingEntries.reduce((s, e) => s + e.fairValue, 0))} icon={<TrendingUp className="h-4 w-4 text-primary" />} />
              <SummaryCard label="Annual Accretion" value={formatCurrencyK(aroTrackingEntries.reduce((s, e) => s + e.accretionExpense, 0))} icon={<Calendar className="h-4 w-4 text-chart-warning" />} />
              <SummaryCard label="Net Revisions" value={formatCurrencyK(aroTrackingEntries.reduce((s, e) => s + e.revisionImpact, 0))} icon={<Shield className="h-4 w-4 text-chart-ero" />} />
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">ARO Liability Tracker</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Obligation</TableHead>
                      <TableHead className="text-xs">Asset</TableHead>
                      <TableHead className="text-xs text-right">Initial Est.</TableHead>
                      <TableHead className="text-xs text-right">Fair Value</TableHead>
                      <TableHead className="text-xs text-right">Accretion</TableHead>
                      <TableHead className="text-xs text-right">Cum. Accretion</TableHead>
                      <TableHead className="text-xs text-right">Revision</TableHead>
                      <TableHead className="text-xs">Rate</TableHead>
                      <TableHead className="text-xs">Yrs Left</TableHead>
                      <TableHead className="text-xs">Progress</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {aroTrackingEntries.map((entry) => (
                      <TableRow key={entry.obligationId}>
                        <TableCell>
                          <div>
                            <p className="text-xs font-medium">{entry.obligationName}</p>
                            <p className="text-[10px] text-muted-foreground">{entry.siteName}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">{entry.assetName}</TableCell>
                        <TableCell className="text-xs text-right font-mono">{formatCurrencyK(entry.initialEstimate)}</TableCell>
                        <TableCell className="text-xs text-right font-mono font-medium">{formatCurrencyK(entry.fairValue)}</TableCell>
                        <TableCell className="text-xs text-right font-mono">{formatCurrencyK(entry.accretionExpense)}</TableCell>
                        <TableCell className="text-xs text-right font-mono">{formatCurrencyK(entry.cumulativeAccretion)}</TableCell>
                        <TableCell className={`text-xs text-right font-mono ${entry.revisionImpact > 0 ? "text-destructive" : entry.revisionImpact < 0 ? "text-chart-success" : ""}`}>
                          {entry.revisionImpact !== 0 ? (entry.revisionImpact > 0 ? "+" : "") + formatCurrencyK(entry.revisionImpact) : "—"}
                        </TableCell>
                        <TableCell className="text-xs">{(entry.discountRate * 100).toFixed(1)}%</TableCell>
                        <TableCell className="text-xs text-center">{entry.yearsRemaining}</TableCell>
                        <TableCell className="w-28">
                          <div className="flex items-center gap-2">
                            <Progress value={entry.settlementProgress} className="h-1.5" />
                            <span className="text-[10px] text-muted-foreground w-8">{entry.settlementProgress}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== ENVIRONMENTAL EXPOSURE TAB ===== */}
          <TabsContent value="exposure" className="space-y-4">
            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-4">
              <SummaryCard label="Active Exposures" value={environmentalExposures.filter(e => e.status !== "Closed").length.toString()} icon={<AlertTriangle className="h-4 w-4 text-chart-warning" />} />
              <SummaryCard label="Total Cleanup Cost" value={formatCurrencyK(environmentalExposures.reduce((s, e) => s + e.estimatedCleanupCost, 0))} icon={<TrendingUp className="h-4 w-4 text-destructive" />} />
              <SummaryCard label="Critical/High Risk" value={environmentalExposures.filter(e => e.riskLevel === "Critical" || e.riskLevel === "High").length.toString()} icon={<Shield className="h-4 w-4 text-destructive" />} />
              <SummaryCard label="Total Exceedances" value={environmentalExposures.reduce((s, e) => s + e.exceedanceCount, 0).toString()} icon={<Activity className="h-4 w-4 text-chart-ero" />} />
            </div>

            {environmentalExposures.map((exp) => (
              <Card key={exp.id} className="cursor-pointer hover:border-primary/40 transition-colors" onClick={() => setSelectedExposure(exp)}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`h-4 w-4 ${exp.riskLevel === "Critical" || exp.riskLevel === "High" ? "text-destructive" : "text-chart-warning"}`} />
                      <div>
                        <p className="text-sm font-medium">{exp.contaminantType}</p>
                        <p className="text-[10px] text-muted-foreground">{exp.siteName} • {exp.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={exp.riskLevel} colors={riskColor} />
                      <StatusBadge status={exp.status} colors={{
                        Open: "bg-chart-warning/10 text-chart-warning border-chart-warning/30",
                        Monitoring: "bg-primary/10 text-primary border-primary/30",
                        Remediation: "bg-chart-ero/10 text-chart-ero border-chart-ero/30",
                        Closed: "bg-muted text-muted-foreground border-border",
                      }} />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-5 text-xs">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Media Affected</p>
                      <div className="flex flex-wrap gap-1 mt-0.5">{exp.mediaAffected.map(m => <Badge key={m} variant="outline" className="text-[10px] h-4">{m}</Badge>)}</div>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Cleanup Cost</p>
                      <p className="font-mono font-medium">{formatCurrency(exp.estimatedCleanupCost)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Area</p>
                      <p>{exp.exposureArea} acres</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Exceedances</p>
                      <p>{exp.exceedanceCount} ({exp.maxConcentration})</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Regulatory Limit</p>
                      <p>{exp.regulatoryLimit}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Obligation Detail Sheet */}
      <Sheet open={!!selectedObligation} onOpenChange={() => setSelectedObligation(null)}>
        <SheetContent className="sm:max-w-lg overflow-auto">
          {selectedObligation && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Badge variant={selectedObligation.type === "ARO" ? "default" : "secondary"}>{selectedObligation.type}</Badge>
                  {selectedObligation.name}
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4 text-sm">
                <DetailRow label="ID" value={selectedObligation.id} />
                <DetailRow label="Site" value={`${selectedObligation.siteName} / ${selectedObligation.facilityName}`} />
                {selectedObligation.assetName && <DetailRow label="Asset" value={selectedObligation.assetName} />}
                <DetailRow label="Status" value={selectedObligation.status} />
                <DetailRow label="Initial Estimate" value={formatCurrency(selectedObligation.initialEstimate)} />
                <DetailRow label="Current Liability" value={formatCurrency(selectedObligation.currentLiability)} />
                <DetailRow label="Discount Rate" value={`${(selectedObligation.discountRate * 100).toFixed(1)}%`} />
                <DetailRow label="Annual Accretion" value={formatCurrency(selectedObligation.accretionExpense)} />
                <DetailRow label="Created" value={selectedObligation.createdDate} />
                <DetailRow label="Target Settlement" value={selectedObligation.targetSettlementDate} />
                {selectedObligation.remediationPhase && <DetailRow label="Remediation Phase" value={selectedObligation.remediationPhase} />}
                {selectedObligation.contaminantType && <DetailRow label="Contaminant" value={selectedObligation.contaminantType} />}
                {selectedObligation.remediationProgress != null && <DetailRow label="Progress" value={`${selectedObligation.remediationProgress}%`} />}
                <div className="pt-2">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{selectedObligation.description}</p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Site Detail Sheet */}
      <Sheet open={!!selectedSite} onOpenChange={() => setSelectedSite(null)}>
        <SheetContent className="sm:max-w-lg overflow-auto">
          {selectedSite && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  {selectedSite.name}
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4 text-sm">
                <DetailRow label="Region" value={selectedSite.region} />
                <DetailRow label="Address" value={selectedSite.address} />
                <DetailRow label="Coordinates" value={`${selectedSite.latitude.toFixed(4)}°N, ${Math.abs(selectedSite.longitude).toFixed(4)}°W`} />
                <DetailRow label="Site Type" value={selectedSite.siteType} />
                <DetailRow label="Operating Status" value={selectedSite.operatingStatus} />
                <DetailRow label="Compliance" value={selectedSite.complianceStatus} />
                <DetailRow label="Acreage" value={`${selectedSite.totalAcreage.toLocaleString()} acres`} />
                <DetailRow label="Regulatory Agency" value={selectedSite.regulatoryAgency} />
                <DetailRow label="Permits" value={selectedSite.permitNumbers.join(", ")} />
                <DetailRow label="Last Inspection" value={selectedSite.lastInspectionDate} />
                <DetailRow label="Next Inspection" value={selectedSite.nextInspectionDate} />
                <div className="pt-2">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Contacts</p>
                  {selectedSite.siteContacts.map((c, i) => (
                    <div key={i} className="flex flex-col gap-0.5 mb-3 text-sm">
                      <p className="font-medium">{c.name} — {c.role}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="h-3 w-3" />{c.email}</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{c.phone}</div>
                    </div>
                  ))}
                </div>
                <div className="pt-2">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{selectedSite.notes}</p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Exposure Detail Sheet */}
      <Sheet open={!!selectedExposure} onOpenChange={() => setSelectedExposure(null)}>
        <SheetContent className="sm:max-w-lg overflow-auto">
          {selectedExposure && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-chart-warning" />
                  {selectedExposure.contaminantType}
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4 text-sm">
                <DetailRow label="ID" value={selectedExposure.id} />
                <DetailRow label="Site" value={selectedExposure.siteName} />
                {selectedExposure.obligationName && <DetailRow label="Linked Obligation" value={selectedExposure.obligationName} />}
                <DetailRow label="Risk Level" value={selectedExposure.riskLevel} />
                <DetailRow label="Status" value={selectedExposure.status} />
                <DetailRow label="Media Affected" value={selectedExposure.mediaAffected.join(", ")} />
                <DetailRow label="Exposure Area" value={`${selectedExposure.exposureArea} acres`} />
                <DetailRow label="Cleanup Cost" value={formatCurrency(selectedExposure.estimatedCleanupCost)} />
                <DetailRow label="Regulatory Driver" value={selectedExposure.regulatoryDriver} />
                <DetailRow label="Discovery Date" value={selectedExposure.discoveryDate} />
                <DetailRow label="Reporting Deadline" value={selectedExposure.reportingDeadline} />
                <DetailRow label="Monitoring" value={selectedExposure.monitoringFrequency} />
                <DetailRow label="Last Sampled" value={selectedExposure.lastSampleDate} />
                <DetailRow label="Exceedances" value={selectedExposure.exceedanceCount.toString()} />
                <DetailRow label="Max Concentration" value={selectedExposure.maxConcentration} />
                <DetailRow label="Regulatory Limit" value={selectedExposure.regulatoryLimit} />
                <div className="pt-2">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{selectedExposure.notes}</p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right max-w-[60%]">{value}</span>
    </div>
  );
}

function StatusBadge({ status, colors }: { status: string; colors: Record<string, string> }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${colors[status] || "bg-muted text-muted-foreground border-border"}`}>
      {status}
    </span>
  );
}

function SummaryCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className="text-lg font-bold mt-1">{value}</p>
          </div>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
