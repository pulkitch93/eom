import { useState } from "react";
import { DollarSign, Users, CheckCircle, Clock, TrendingUp, Brain } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { settlementProjects, SettlementProject, formatCurrency, formatCurrencyK } from "@/data/mock-data";
import VarianceIntelligenceTab from "@/components/VarianceIntelligenceTab";

const projectStatusColor: Record<string, string> = {
  "Planning": "bg-primary/10 text-primary border-primary/30",
  "In Progress": "bg-chart-warning/10 text-chart-warning border-chart-warning/30",
  "Pending Closure": "bg-chart-ero/10 text-chart-ero border-chart-ero/30",
  "Closed": "bg-chart-success/10 text-chart-success border-chart-success/30",
};

export default function SettlementModule() {
  const [selectedProject, setSelectedProject] = useState<SettlementProject | null>(null);

  const totalBudget = settlementProjects.reduce((s, p) => s + p.totalBudget, 0);
  const totalSpent = settlementProjects.reduce((s, p) => s + p.totalSpent, 0);
  const totalCommitted = settlementProjects.reduce((s, p) => s + p.totalCommitted, 0);
  const closedProjects = settlementProjects.filter(p => p.status === "Closed");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settlement</h1>

      <div className="grid gap-4 sm:grid-cols-4">
        <SummaryCard label="Total Budget" value={formatCurrencyK(totalBudget)} icon={<DollarSign className="h-4 w-4 text-primary" />} />
        <SummaryCard label="Total Spent" value={formatCurrencyK(totalSpent)} icon={<TrendingUp className="h-4 w-4 text-chart-ero" />} />
        <SummaryCard label="Committed" value={formatCurrencyK(totalCommitted)} icon={<Clock className="h-4 w-4 text-chart-warning" />} />
        <SummaryCard label="Closed Projects" value={`${closedProjects.length} / ${settlementProjects.length}`} icon={<CheckCircle className="h-4 w-4 text-chart-success" />} />
      </div>

      <Tabs defaultValue="tracking">
        <TabsList>
          <TabsTrigger value="tracking">Project Cost Tracking</TabsTrigger>
          <TabsTrigger value="vendors">Vendor Payments</TabsTrigger>
          <TabsTrigger value="bva">Budget vs Actuals</TabsTrigger>
          <TabsTrigger value="closure">Financial Closure</TabsTrigger>
          <TabsTrigger value="variance" className="flex items-center gap-1.5"><Brain className="h-3.5 w-3.5" /> Variance Intelligence</TabsTrigger>
        </TabsList>

        {/* Project Cost Tracking */}
        <TabsContent value="tracking" className="space-y-4">
          {settlementProjects.map(project => (
            <Card key={project.id} className="cursor-pointer hover:border-primary/40 transition-colors" onClick={() => setSelectedProject(project)}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium">{project.obligationName}</p>
                      <Badge variant={project.type === "ARO" ? "default" : "secondary"} className="text-[10px]">{project.type}</Badge>
                      <StatusBadge status={project.status} colors={projectStatusColor} />
                    </div>
                    <p className="text-[10px] text-muted-foreground">{project.siteName} • PM: {project.projectManager} • {project.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-medium">{formatCurrencyK(project.totalSpent)}</p>
                    <p className="text-[10px] text-muted-foreground">of {formatCurrencyK(project.totalBudget)} budget</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={project.completionPercent} className="h-2 flex-1" />
                  <span className="text-xs font-medium w-10 text-right">{project.completionPercent}%</span>
                </div>
                <div className="grid grid-cols-4 gap-4 mt-3 text-xs">
                  <div><p className="text-[10px] text-muted-foreground">Budget</p><p className="font-mono">{formatCurrency(project.totalBudget)}</p></div>
                  <div><p className="text-[10px] text-muted-foreground">Spent</p><p className="font-mono">{formatCurrency(project.totalSpent)}</p></div>
                  <div><p className="text-[10px] text-muted-foreground">Committed</p><p className="font-mono">{formatCurrency(project.totalCommitted)}</p></div>
                  <div><p className="text-[10px] text-muted-foreground">Remaining</p><p className="font-mono">{formatCurrency(project.totalBudget - project.totalCommitted)}</p></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Vendor Payments */}
        <TabsContent value="vendors">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Vendor Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Vendor</TableHead>
                    <TableHead className="text-xs">Project</TableHead>
                    <TableHead className="text-xs">Description</TableHead>
                    <TableHead className="text-xs text-right">Contract</TableHead>
                    <TableHead className="text-xs text-right">Invoiced</TableHead>
                    <TableHead className="text-xs text-right">Paid</TableHead>
                    <TableHead className="text-xs text-right">Retainage</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Last Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settlementProjects.flatMap(p =>
                    p.vendors.map(v => (
                      <TableRow key={v.id}>
                        <TableCell className="text-xs font-medium">{v.vendorName}</TableCell>
                        <TableCell className="text-xs">{p.obligationName}</TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate">{v.description}</TableCell>
                        <TableCell className="text-xs text-right font-mono">{formatCurrency(v.contractAmount)}</TableCell>
                        <TableCell className="text-xs text-right font-mono">{formatCurrency(v.invoicedAmount)}</TableCell>
                        <TableCell className="text-xs text-right font-mono">{formatCurrency(v.paidAmount)}</TableCell>
                        <TableCell className="text-xs text-right font-mono">{v.retainage > 0 ? formatCurrency(v.retainage) : "—"}</TableCell>
                        <TableCell>
                          <StatusBadge status={v.status} colors={{
                            Active: "bg-chart-warning/10 text-chart-warning border-chart-warning/30",
                            Complete: "bg-chart-success/10 text-chart-success border-chart-success/30",
                            Pending: "bg-muted text-muted-foreground border-border",
                          }} />
                        </TableCell>
                        <TableCell className="text-xs">{v.lastPaymentDate || "—"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget vs Actuals */}
        <TabsContent value="bva" className="space-y-4">
          {settlementProjects.map(project => (
            <Card key={project.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-medium">{project.obligationName}</CardTitle>
                    <StatusBadge status={project.status} colors={projectStatusColor} />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Spent: <span className="font-mono font-medium text-foreground">{formatCurrency(project.totalSpent)}</span> / {formatCurrency(project.totalBudget)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Category</TableHead>
                      <TableHead className="text-xs">Description</TableHead>
                      <TableHead className="text-xs text-right">Budgeted</TableHead>
                      <TableHead className="text-xs text-right">Actual</TableHead>
                      <TableHead className="text-xs text-right">Committed</TableHead>
                      <TableHead className="text-xs text-right">Variance</TableHead>
                      <TableHead className="text-xs">% Used</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {project.costItems.map(ci => {
                      const pctUsed = ci.budgeted > 0 ? ((ci.actual / ci.budgeted) * 100) : 0;
                      return (
                        <TableRow key={ci.id}>
                          <TableCell><Badge variant="outline" className="text-[10px]">{ci.category}</Badge></TableCell>
                          <TableCell className="text-xs">{ci.description}</TableCell>
                          <TableCell className="text-xs text-right font-mono">{formatCurrency(ci.budgeted)}</TableCell>
                          <TableCell className="text-xs text-right font-mono">{formatCurrency(ci.actual)}</TableCell>
                          <TableCell className="text-xs text-right font-mono">{formatCurrency(ci.committed)}</TableCell>
                          <TableCell className={`text-xs text-right font-mono ${ci.variance >= 0 ? "text-chart-success" : "text-destructive"}`}>
                            {ci.variance >= 0 ? "" : "-"}{formatCurrency(Math.abs(ci.variance))}
                          </TableCell>
                          <TableCell className="w-24">
                            <div className="flex items-center gap-2">
                              <Progress value={Math.min(100, pctUsed)} className="h-1.5" />
                              <span className="text-[10px] text-muted-foreground w-8">{pctUsed.toFixed(0)}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Financial Closure */}
        <TabsContent value="closure">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Financial Closure Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Project</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs text-right">Budget</TableHead>
                    <TableHead className="text-xs text-right">Final Cost</TableHead>
                    <TableHead className="text-xs text-right">Savings/(Overrun)</TableHead>
                    <TableHead className="text-xs">Timeline</TableHead>
                    <TableHead className="text-xs">Completion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settlementProjects.map(p => {
                    const savingsOverrun = p.totalBudget - p.totalSpent;
                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div>
                            <p className="text-xs font-medium">{p.obligationName}</p>
                            <p className="text-[10px] text-muted-foreground">{p.siteName}</p>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant={p.type === "ARO" ? "default" : "secondary"} className="text-[10px]">{p.type}</Badge></TableCell>
                        <TableCell><StatusBadge status={p.status} colors={projectStatusColor} /></TableCell>
                        <TableCell className="text-xs text-right font-mono">{formatCurrency(p.totalBudget)}</TableCell>
                        <TableCell className="text-xs text-right font-mono">{formatCurrency(p.totalSpent)}</TableCell>
                        <TableCell className={`text-xs text-right font-mono ${savingsOverrun >= 0 ? "text-chart-success" : "text-destructive"}`}>
                          {savingsOverrun >= 0 ? formatCurrency(savingsOverrun) : `(${formatCurrency(Math.abs(savingsOverrun))})`}
                        </TableCell>
                        <TableCell className="text-xs">{p.startDate} → {p.estimatedEndDate}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={p.completionPercent} className="h-1.5 w-16" />
                            <span className="text-[10px]">{p.completionPercent}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Variance Intelligence */}
        <TabsContent value="variance">
          <VarianceIntelligenceTab />
        </TabsContent>
      </Tabs>

      {/* Project Detail Sheet */}
      <Sheet open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <SheetContent className="sm:max-w-lg overflow-auto">
          {selectedProject && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Badge variant={selectedProject.type === "ARO" ? "default" : "secondary"}>{selectedProject.type}</Badge>
                  {selectedProject.obligationName}
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4 text-sm">
                <DetailRow label="Project ID" value={selectedProject.id} />
                <DetailRow label="Site" value={selectedProject.siteName} />
                <DetailRow label="Project Manager" value={selectedProject.projectManager} />
                <DetailRow label="Status" value={selectedProject.status} />
                <DetailRow label="Start Date" value={selectedProject.startDate} />
                <DetailRow label="End Date" value={selectedProject.estimatedEndDate} />
                <DetailRow label="Budget" value={formatCurrency(selectedProject.totalBudget)} />
                <DetailRow label="Spent" value={formatCurrency(selectedProject.totalSpent)} />
                <DetailRow label="Committed" value={formatCurrency(selectedProject.totalCommitted)} />
                <DetailRow label="Remaining" value={formatCurrency(selectedProject.totalBudget - selectedProject.totalCommitted)} />
                <DetailRow label="Completion" value={`${selectedProject.completionPercent}%`} />

                <div className="pt-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Vendors ({selectedProject.vendors.length})</p>
                  {selectedProject.vendors.map(v => (
                    <div key={v.id} className="border rounded-md p-3 mb-2 text-xs space-y-1">
                      <p className="font-medium">{v.vendorName}</p>
                      <p className="text-muted-foreground">{v.description}</p>
                      <div className="flex justify-between">
                        <span>Contract: {formatCurrency(v.contractAmount)}</span>
                        <span>Paid: {formatCurrency(v.paidAmount)}</span>
                      </div>
                    </div>
                  ))}
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
