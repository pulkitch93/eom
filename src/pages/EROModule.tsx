import { useState } from "react";
import { Leaf, FlaskConical, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatCard } from "@/components/StatCard";
import { getEROObligations, getTotalLiability, getTotalAccretion, formatCurrency, formatCurrencyK } from "@/data/mock-data";

const phaseColor: Record<string, string> = {
  Assessment: "bg-primary/10 text-primary",
  Planning: "bg-chart-warning/10 text-chart-warning",
  "Active Remediation": "bg-chart-ero/10 text-chart-ero",
  Monitoring: "bg-chart-success/10 text-chart-success",
  Closure: "bg-muted text-muted-foreground",
};

export default function EROModule() {
  const eroObligations = getEROObligations();
  const totalLiability = getTotalLiability("ERO");
  const totalAccretion = getTotalAccretion("ERO");
  const avgProgress = Math.round(eroObligations.reduce((s, o) => s + (o.remediationProgress || 0), 0) / eroObligations.length);

  // Cost Estimator
  const [contaminant, setContaminant] = useState("petroleum");
  const [area, setArea] = useState("5000");
  const [method, setMethod] = useState("excavation");

  const baseCosts: Record<string, number> = { petroleum: 35, solvents: 55, metals: 45, mixed: 65 };
  const methodMultipliers: Record<string, number> = { excavation: 1.0, bioremediation: 0.7, "pump-treat": 1.3, "in-situ": 0.85 };
  const estimatedCost = (baseCosts[contaminant] || 40) * Number(area) * (methodMultipliers[method] || 1);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ERO Module</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total ERO Liability" value={formatCurrencyK(totalLiability)} icon={Leaf} subtitle={`${eroObligations.length} obligations`} />
        <StatCard title="Avg. Remediation Progress" value={`${avgProgress}%`} icon={ShieldCheck} subtitle="Across all EROs" />
        <StatCard title="Annual Accretion" value={formatCurrencyK(totalAccretion)} icon={Leaf} subtitle="Current year expense" />
      </div>

      <Tabs defaultValue="register">
        <TabsList>
          <TabsTrigger value="register">ERO Register</TabsTrigger>
          <TabsTrigger value="tracker">Remediation Tracker</TabsTrigger>
          <TabsTrigger value="estimator">Cost Estimator</TabsTrigger>
        </TabsList>

        <TabsContent value="register">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">ID</TableHead>
                    <TableHead className="text-xs">Obligation</TableHead>
                    <TableHead className="text-xs">Site</TableHead>
                    <TableHead className="text-xs">Phase</TableHead>
                    <TableHead className="text-xs">Contaminant</TableHead>
                    <TableHead className="text-xs text-right">Est. Cost</TableHead>
                    <TableHead className="text-xs">Regulatory Deadline</TableHead>
                    <TableHead className="text-xs text-right">Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eroObligations.map(o => (
                    <TableRow key={o.id}>
                      <TableCell className="text-xs font-mono">{o.id}</TableCell>
                      <TableCell className="text-xs font-medium">{o.name}</TableCell>
                      <TableCell className="text-xs">{o.siteName}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${phaseColor[o.remediationPhase || ""]}`}>
                          {o.remediationPhase}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">{o.contaminantType}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{formatCurrency(o.currentLiability)}</TableCell>
                      <TableCell className="text-xs">{o.regulatoryDeadline}</TableCell>
                      <TableCell className="text-xs text-right">{o.remediationProgress}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracker">
          <div className="space-y-4">
            {eroObligations.map(o => (
              <Card key={o.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium">{o.name}</p>
                      <p className="text-xs text-muted-foreground">{o.siteName} — {o.contaminantType}</p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${phaseColor[o.remediationPhase || ""]}`}>
                      {o.remediationPhase}
                    </span>
                  </div>
                  <Progress value={o.remediationProgress} className="h-2" />
                  <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>{o.remediationProgress}% complete</span>
                    <span>Deadline: {o.regulatoryDeadline}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="estimator">
          <Card className="max-w-lg">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FlaskConical className="h-4 w-4" /> Remediation Cost Estimator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Contaminant Type</Label>
                <Select value={contaminant} onValueChange={setContaminant}>
                  <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="petroleum">Petroleum Hydrocarbons</SelectItem>
                    <SelectItem value="solvents">Chlorinated Solvents</SelectItem>
                    <SelectItem value="metals">Heavy Metals</SelectItem>
                    <SelectItem value="mixed">Mixed Contamination</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Affected Area (sq ft)</Label>
                <Input type="number" value={area} onChange={e => setArea(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Remediation Method</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excavation">Excavation & Disposal</SelectItem>
                    <SelectItem value="bioremediation">Bioremediation</SelectItem>
                    <SelectItem value="pump-treat">Pump & Treat</SelectItem>
                    <SelectItem value="in-situ">In-Situ Treatment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-xs text-muted-foreground">Estimated Remediation Cost</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(estimatedCost)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on ${baseCosts[contaminant]}/sq ft × {methodMultipliers[method]}x multiplier
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
