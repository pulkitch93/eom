import { useState } from "react";
import { Landmark, Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/StatCard";
import {
  getAROObligations,
  getTotalLiability,
  getTotalAccretion,
  formatCurrency,
  formatCurrencyK,
  calculatePresentValue,
  generateAccretionSchedule,
} from "@/data/mock-data";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export default function AROModule() {
  const aroObligations = getAROObligations();
  const totalLiability = getTotalLiability("ARO");
  const totalAccretion = getTotalAccretion("ARO");
  const totalRevision = aroObligations.reduce((s, o) => s + (o.revisionImpact || 0), 0);

  // Calculator state
  const [calcFV, setCalcFV] = useState("1000000");
  const [calcRate, setCalcRate] = useState("5");
  const [calcYears, setCalcYears] = useState("10");
  const pvResult = calculatePresentValue(Number(calcFV), Number(calcRate) / 100, Number(calcYears));

  // Accretion schedule for first active obligation
  const firstActive = aroObligations.find(o => o.status === "Active");
  const [selectedForSchedule, setSelectedForSchedule] = useState(firstActive?.id || "");
  const scheduleObl = aroObligations.find(o => o.id === selectedForSchedule);
  const schedule = scheduleObl ? generateAccretionSchedule(scheduleObl) : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ARO Module</h1>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total ARO Liability" value={formatCurrencyK(totalLiability)} icon={Landmark} subtitle={`${aroObligations.length} obligations`} />
        <StatCard title="Annual Accretion Expense" value={formatCurrencyK(totalAccretion)} icon={Landmark} subtitle="Current year" />
        <StatCard title="Net Revision Impact" value={formatCurrencyK(totalRevision)} icon={Landmark} trend={{ value: formatCurrencyK(Math.abs(totalRevision)), positive: totalRevision <= 0 }} />
      </div>

      <Tabs defaultValue="register">
        <TabsList>
          <TabsTrigger value="register">ARO Register</TabsTrigger>
          <TabsTrigger value="calculator">Liability Calculator</TabsTrigger>
          <TabsTrigger value="accretion">Accretion Schedule</TabsTrigger>
        </TabsList>

        {/* Register */}
        <TabsContent value="register">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">ID</TableHead>
                    <TableHead className="text-xs">Obligation</TableHead>
                    <TableHead className="text-xs">Site</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs text-right">Fair Value</TableHead>
                    <TableHead className="text-xs text-right">Accretion</TableHead>
                    <TableHead className="text-xs text-right">Revision</TableHead>
                    <TableHead className="text-xs">Retirement Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aroObligations.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="text-xs font-mono">{o.id}</TableCell>
                      <TableCell className="text-xs font-medium">{o.name}</TableCell>
                      <TableCell className="text-xs">{o.siteName}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{o.status}</Badge></TableCell>
                      <TableCell className="text-xs text-right font-mono">{formatCurrency(o.fairValue || 0)}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{formatCurrency(o.accretionExpense)}</TableCell>
                      <TableCell className={`text-xs text-right font-mono ${(o.revisionImpact || 0) > 0 ? "text-destructive" : (o.revisionImpact || 0) < 0 ? "text-chart-success" : ""}`}>
                        {(o.revisionImpact || 0) >= 0 ? "+" : ""}{formatCurrency(o.revisionImpact || 0)}
                      </TableCell>
                      <TableCell className="text-xs">{o.targetSettlementDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calculator */}
        <TabsContent value="calculator">
          <Card className="max-w-lg">
            <CardHeader><CardTitle className="text-sm font-medium flex items-center gap-2"><Calculator className="h-4 w-4" /> Present Value Calculator</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Future Value ($)</Label>
                  <Input type="number" value={calcFV} onChange={e => setCalcFV(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Discount Rate (%)</Label>
                  <Input type="number" step="0.1" value={calcRate} onChange={e => setCalcRate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Years to Settlement</Label>
                  <Input type="number" value={calcYears} onChange={e => setCalcYears(e.target.value)} />
                </div>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-xs text-muted-foreground">Present Value (Fair Value at Inception)</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(pvResult)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Total accretion over life: {formatCurrency(Number(calcFV) - pvResult)}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accretion Schedule */}
        <TabsContent value="accretion">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3 flex-wrap">
                <CardTitle className="text-sm font-medium">Accretion Schedule</CardTitle>
                <select
                  className="text-xs border rounded px-2 py-1 bg-background"
                  value={selectedForSchedule}
                  onChange={e => setSelectedForSchedule(e.target.value)}
                >
                  {aroObligations.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
            </CardHeader>
            <CardContent>
              {schedule.length > 0 && (
                <>
                  <div className="h-[250px] mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={schedule}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
                        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                        <YAxis tickFormatter={v => formatCurrencyK(v)} tick={{ fontSize: 11 }} width={60} />
                        <Tooltip formatter={(v: number) => formatCurrency(v)} />
                        <Bar dataKey="accretion" fill="hsl(187, 60%, 38%)" name="Accretion" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Year</TableHead>
                        <TableHead className="text-xs text-right">Beginning Balance</TableHead>
                        <TableHead className="text-xs text-right">Accretion</TableHead>
                        <TableHead className="text-xs text-right">Ending Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schedule.map(row => (
                        <TableRow key={row.year}>
                          <TableCell className="text-xs">{row.year}</TableCell>
                          <TableCell className="text-xs text-right font-mono">{formatCurrency(row.beginningBalance)}</TableCell>
                          <TableCell className="text-xs text-right font-mono">{formatCurrency(row.accretion)}</TableCell>
                          <TableCell className="text-xs text-right font-mono">{formatCurrency(row.endingBalance)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
