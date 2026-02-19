import { useState } from "react";
import { Shield, FileText, Eye, Clock, CheckCircle, AlertTriangle, Search, Download, BrainCircuit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  auditTrail, controlItems, disclosureItems,
  AuditTrailEntry, ControlItem, DisclosureItem,
} from "@/data/mock-data";
import { exportToCSV, exportToPDF } from "@/lib/export-utils";
import { AROJustificationTab } from "@/components/AROJustificationTab";

const controlStatusColor: Record<string, string> = {
  Effective: "bg-chart-success/10 text-chart-success border-chart-success/30",
  "Needs Improvement": "bg-chart-warning/10 text-chart-warning border-chart-warning/30",
  Deficient: "bg-destructive/10 text-destructive border-destructive/30",
  "Not Tested": "bg-muted text-muted-foreground border-border",
};

const disclosureStatusColor: Record<string, string> = {
  Complete: "bg-chart-success/10 text-chart-success border-chart-success/30",
  "In Progress": "bg-chart-warning/10 text-chart-warning border-chart-warning/30",
  "Not Started": "bg-muted text-muted-foreground border-border",
  "N/A": "bg-muted text-muted-foreground border-border",
};

const riskColor: Record<string, string> = {
  Low: "bg-chart-success/10 text-chart-success border-chart-success/30",
  Medium: "bg-chart-warning/10 text-chart-warning border-chart-warning/30",
  High: "bg-destructive/10 text-destructive border-destructive/30",
};

const categoryColor: Record<string, string> = {
  Obligation: "bg-primary/10 text-primary border-primary/30",
  Financial: "bg-chart-ero/10 text-chart-ero border-chart-ero/30",
  Compliance: "bg-chart-warning/10 text-chart-warning border-chart-warning/30",
  Settlement: "bg-chart-success/10 text-chart-success border-chart-success/30",
  System: "bg-muted text-muted-foreground border-border",
};

export default function AssuranceModule() {
  const [auditSearch, setAuditSearch] = useState("");
  const [auditCategoryFilter, setAuditCategoryFilter] = useState("all");
  const [selectedControl, setSelectedControl] = useState<ControlItem | null>(null);

  const filteredAudit = auditTrail.filter(e => {
    if (auditSearch && !e.action.toLowerCase().includes(auditSearch.toLowerCase()) && !e.details.toLowerCase().includes(auditSearch.toLowerCase()) && !e.user.toLowerCase().includes(auditSearch.toLowerCase())) return false;
    if (auditCategoryFilter !== "all" && e.category !== auditCategoryFilter) return false;
    return true;
  });

  const effectiveControls = controlItems.filter(c => c.status === "Effective").length;
  const completedDisclosures = disclosureItems.filter(d => d.status === "Complete").length;

  const exportAuditTrail = (format: "csv" | "pdf") => {
    const headers = ["Timestamp", "User", "Action", "Category", "Entity", "Details"];
    const rows = filteredAudit.map(e => [e.timestamp, e.user, e.action, e.category, e.entityId, e.details]);
    format === "csv"
      ? exportToCSV(headers, rows, "audit-trail")
      : exportToPDF("Audit Trail", headers, rows, "audit-trail");
  };

  const exportControls = (format: "csv" | "pdf") => {
    const headers = ["Control", "Category", "Frequency", "Owner", "Status", "Risk", "Last Tested", "Next Test", "Findings"];
    const rows = controlItems.map(c => [c.controlName, c.category, c.frequency, c.owner, c.status, c.riskRating, c.lastTestedDate, c.nextTestDate, c.findings]);
    format === "csv"
      ? exportToCSV(headers, rows, "internal-controls")
      : exportToPDF("Internal Controls", headers, rows, "internal-controls");
  };

  const exportDisclosures = (format: "csv" | "pdf") => {
    const headers = ["Standard", "Requirement", "Description", "Status", "Owner", "Due Date", "Completed", "Notes"];
    const rows = disclosureItems.map(d => [d.standard, d.requirement, d.description, d.status, d.responsibleParty, d.dueDate, d.completedDate || "—", d.notes]);
    format === "csv"
      ? exportToCSV(headers, rows, "financial-disclosures")
      : exportToPDF("Financial Disclosure Checklist", headers, rows, "financial-disclosures");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Assurance</h1>

      <div className="grid gap-4 sm:grid-cols-4">
        <SummaryCard label="Controls Effective" value={`${effectiveControls} / ${controlItems.length}`} icon={<Shield className="h-4 w-4 text-chart-success" />} />
        <SummaryCard label="Disclosures Complete" value={`${completedDisclosures} / ${disclosureItems.length}`} icon={<FileText className="h-4 w-4 text-primary" />} />
        <SummaryCard label="Audit Entries" value={auditTrail.length.toString()} icon={<Eye className="h-4 w-4 text-chart-ero" />} />
        <SummaryCard label="Findings Open" value={controlItems.filter(c => c.status !== "Effective").length.toString()} icon={<AlertTriangle className="h-4 w-4 text-chart-warning" />} />
      </div>

      <Tabs defaultValue="reporting">
        <TabsList>
          <TabsTrigger value="reporting">Reporting</TabsTrigger>
          <TabsTrigger value="controls">Controls</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="disclosure">Financial Disclosure</TabsTrigger>
          <TabsTrigger value="ai-justification" className="gap-1">
            <BrainCircuit className="h-3.5 w-3.5" /> AI Justification
          </TabsTrigger>
        </TabsList>

        {/* Reporting Dashboard */}
        <TabsContent value="reporting" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Control Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Control Status Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(["Effective", "Needs Improvement", "Deficient", "Not Tested"] as const).map(status => {
                  const count = controlItems.filter(c => c.status === status).length;
                  const pct = (count / controlItems.length) * 100;
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <StatusBadge status={status} colors={controlStatusColor} />
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${status === "Effective" ? "bg-chart-success" : status === "Needs Improvement" ? "bg-chart-warning" : status === "Deficient" ? "bg-destructive" : "bg-muted-foreground"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Disclosure Progress */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Disclosure Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(["Complete", "In Progress", "Not Started", "N/A"] as const).map(status => {
                  const count = disclosureItems.filter(d => d.status === status).length;
                  const pct = (count / disclosureItems.length) * 100;
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <StatusBadge status={status} colors={disclosureStatusColor} />
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${status === "Complete" ? "bg-chart-success" : status === "In Progress" ? "bg-chart-warning" : "bg-muted-foreground"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Recent Audit Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {auditTrail.slice(0, 5).map(e => (
                <div key={e.id} className="flex items-start gap-3 py-2 border-b last:border-0">
                  <div className="mt-0.5">
                    <StatusBadge status={e.category} colors={categoryColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{e.action}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{e.details}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-muted-foreground">{e.timestamp.split(" ")[0]}</p>
                    <p className="text-[10px] text-muted-foreground">{e.user}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Controls */}
        <TabsContent value="controls">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Internal Controls</CardTitle>
                <ExportButtons onCSV={() => exportControls("csv")} onPDF={() => exportControls("pdf")} />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Control</TableHead>
                    <TableHead className="text-xs">Category</TableHead>
                    <TableHead className="text-xs">Frequency</TableHead>
                    <TableHead className="text-xs">Owner</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Risk</TableHead>
                    <TableHead className="text-xs">Last Tested</TableHead>
                    <TableHead className="text-xs">Next Test</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {controlItems.map(c => (
                    <TableRow key={c.id} className="cursor-pointer" onClick={() => setSelectedControl(c)}>
                      <TableCell>
                        <div>
                          <p className="text-xs font-medium">{c.controlName}</p>
                          <p className="text-[10px] text-muted-foreground max-w-[250px] truncate">{c.description}</p>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{c.category}</Badge></TableCell>
                      <TableCell className="text-xs">{c.frequency}</TableCell>
                      <TableCell className="text-xs">{c.owner}</TableCell>
                      <TableCell><StatusBadge status={c.status} colors={controlStatusColor} /></TableCell>
                      <TableCell><StatusBadge status={c.riskRating} colors={riskColor} /></TableCell>
                      <TableCell className="text-xs">{c.lastTestedDate}</TableCell>
                      <TableCell className="text-xs">{c.nextTestDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Trail */}
        <TabsContent value="audit">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-sm font-medium">Audit Trail</CardTitle>
                <div className="flex items-center gap-2">
                  <ExportButtons onCSV={() => exportAuditTrail("csv")} onPDF={() => exportAuditTrail("pdf")} />
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input placeholder="Search…" className="pl-8 h-9 w-48 text-xs" value={auditSearch} onChange={e => setAuditSearch(e.target.value)} />
                  </div>
                  <Select value={auditCategoryFilter} onValueChange={setAuditCategoryFilter}>
                    <SelectTrigger className="h-9 w-32 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Obligation">Obligation</SelectItem>
                      <SelectItem value="Financial">Financial</SelectItem>
                      <SelectItem value="Compliance">Compliance</SelectItem>
                      <SelectItem value="Settlement">Settlement</SelectItem>
                      <SelectItem value="System">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Timestamp</TableHead>
                    <TableHead className="text-xs">User</TableHead>
                    <TableHead className="text-xs">Action</TableHead>
                    <TableHead className="text-xs">Category</TableHead>
                    <TableHead className="text-xs">Entity</TableHead>
                    <TableHead className="text-xs">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAudit.map(e => (
                    <TableRow key={e.id}>
                      <TableCell className="text-xs font-mono whitespace-nowrap">{e.timestamp}</TableCell>
                      <TableCell className="text-xs font-medium">{e.user}</TableCell>
                      <TableCell className="text-xs">{e.action}</TableCell>
                      <TableCell><StatusBadge status={e.category} colors={categoryColor} /></TableCell>
                      <TableCell className="text-xs font-mono">{e.entityId}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[300px] truncate">{e.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Disclosure */}
        <TabsContent value="disclosure">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Financial Disclosure Checklist</CardTitle>
                <ExportButtons onCSV={() => exportDisclosures("csv")} onPDF={() => exportDisclosures("pdf")} />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Standard</TableHead>
                    <TableHead className="text-xs">Requirement</TableHead>
                    <TableHead className="text-xs">Description</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Owner</TableHead>
                    <TableHead className="text-xs">Due Date</TableHead>
                    <TableHead className="text-xs">Completed</TableHead>
                    <TableHead className="text-xs">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {disclosureItems.map(d => (
                    <TableRow key={d.id}>
                      <TableCell><Badge variant="outline" className="text-[10px]">{d.standard}</Badge></TableCell>
                      <TableCell className="text-xs font-medium">{d.requirement}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate">{d.description}</TableCell>
                      <TableCell><StatusBadge status={d.status} colors={disclosureStatusColor} /></TableCell>
                      <TableCell className="text-xs">{d.responsibleParty}</TableCell>
                      <TableCell className="text-xs">{d.dueDate}</TableCell>
                      <TableCell className="text-xs">{d.completedDate || "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{d.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Justification */}
        <TabsContent value="ai-justification">
          <AROJustificationTab />
        </TabsContent>
      </Tabs>

      {/* Control Detail Sheet */}
      <Sheet open={!!selectedControl} onOpenChange={() => setSelectedControl(null)}>
        <SheetContent className="sm:max-w-lg overflow-auto">
          {selectedControl && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  {selectedControl.controlName}
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4 text-sm">
                <DetailRow label="ID" value={selectedControl.id} />
                <DetailRow label="Category" value={selectedControl.category} />
                <DetailRow label="Frequency" value={selectedControl.frequency} />
                <DetailRow label="Owner" value={selectedControl.owner} />
                <DetailRow label="Status" value={selectedControl.status} />
                <DetailRow label="Risk Rating" value={selectedControl.riskRating} />
                <DetailRow label="Last Tested" value={selectedControl.lastTestedDate} />
                <DetailRow label="Next Test" value={selectedControl.nextTestDate} />
                <div className="pt-2">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{selectedControl.description}</p>
                </div>
                <div className="pt-2">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Findings</p>
                  <p className="text-sm">{selectedControl.findings}</p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
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

function ExportButtons({ onCSV, onPDF }: { onCSV: () => void; onPDF: () => void }) {
  return (
    <div className="flex items-center gap-1">
      <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={onCSV}>
        <Download className="h-3 w-3" /> CSV
      </Button>
      <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={onPDF}>
        <FileText className="h-3 w-3" /> PDF
      </Button>
    </div>
  );
}
