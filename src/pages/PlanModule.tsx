import { useState } from "react";
import { TrendingUp, Calendar, DollarSign, Target, ArrowUpDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  forecastScenarios,
  budgetItems,
  formatCurrency,
  formatCurrencyK,
  getTotalLiability,
  getTotalAccretion,
} from "@/data/mock-data";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Line,
} from "recharts";

export default function PlanModule() {
  const [selectedScenario, setSelectedScenario] = useState("SCN-BASE");
  const scenario = forecastScenarios.find(s => s.id === selectedScenario)!;

  const totalBudgeted = budgetItems.reduce((s, b) => s + b.budgetedAmount, 0);
  const totalForecast = budgetItems.reduce((s, b) => s + b.forecastAmount, 0);
  const totalVariance = budgetItems.reduce((s, b) => s + b.variance, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Plan</h1>

      <div className="grid gap-4 sm:grid-cols-4">
        <SummaryCard label="Total Liability" value={formatCurrencyK(getTotalLiability())} icon={<DollarSign className="h-4 w-4 text-primary" />} />
        <SummaryCard label="Annual Accretion" value={formatCurrencyK(getTotalAccretion())} icon={<TrendingUp className="h-4 w-4 text-chart-ero" />} />
        <SummaryCard label="FY2026 Budget" value={formatCurrencyK(totalBudgeted)} icon={<Target className="h-4 w-4 text-chart-success" />} />
        <SummaryCard label="Budget Variance" value={formatCurrencyK(totalVariance)} icon={<ArrowUpDown className={`h-4 w-4 ${totalVariance >= 0 ? "text-chart-success" : "text-destructive"}`} />} />
      </div>

      <Tabs defaultValue="forecast">
        <TabsList>
          <TabsTrigger value="forecast">Multi-Year Forecast</TabsTrigger>
          <TabsTrigger value="modeling">Liability Modeling</TabsTrigger>
          <TabsTrigger value="projections">Cost Projections</TabsTrigger>
          <TabsTrigger value="budget">Budget Alignment</TabsTrigger>
        </TabsList>

        {/* Multi-Year Forecast */}
        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-sm font-medium">Liability Forecast by Scenario</CardTitle>
                <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                  <SelectTrigger className="h-9 w-56 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {forecastScenarios.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{scenario.description}</p>
              <div className="flex gap-4 mt-2">
                <Badge variant="outline" className="text-[10px]">Inflation: {(scenario.inflationRate * 100).toFixed(1)}%</Badge>
                <Badge variant="outline" className="text-[10px]">Discount Rate: {(scenario.discountRate * 100).toFixed(1)}%</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={scenario.projections}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={v => formatCurrencyK(v)} tick={{ fontSize: 11 }} width={60} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Legend />
                    <Area type="monotone" dataKey="aroLiability" stroke="hsl(187, 60%, 38%)" fill="hsl(187, 60%, 38%)" fillOpacity={0.15} name="ARO Liability" stackId="1" />
                    <Area type="monotone" dataKey="eroLiability" stroke="hsl(32, 80%, 50%)" fill="hsl(32, 80%, 50%)" fillOpacity={0.15} name="ERO Liability" stackId="1" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Annual Projections — {scenario.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Year</TableHead>
                    <TableHead className="text-xs text-right">ARO Liability</TableHead>
                    <TableHead className="text-xs text-right">ERO Liability</TableHead>
                    <TableHead className="text-xs text-right">Total</TableHead>
                    <TableHead className="text-xs text-right">Accretion</TableHead>
                    <TableHead className="text-xs text-right">Settlements</TableHead>
                    <TableHead className="text-xs text-right">Net Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scenario.projections.map(p => (
                    <TableRow key={p.year}>
                      <TableCell className="text-xs font-medium">{p.year}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{formatCurrencyK(p.aroLiability)}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{formatCurrencyK(p.eroLiability)}</TableCell>
                      <TableCell className="text-xs text-right font-mono font-medium">{formatCurrencyK(p.aroLiability + p.eroLiability)}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{formatCurrencyK(p.accretion)}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{p.settlements > 0 ? `(${formatCurrencyK(p.settlements)})` : "—"}</TableCell>
                      <TableCell className={`text-xs text-right font-mono ${p.netChange >= 0 ? "" : "text-chart-success"}`}>{p.netChange >= 0 ? formatCurrencyK(p.netChange) : `(${formatCurrencyK(Math.abs(p.netChange))})`}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Liability Modeling - Scenario Comparison */}
        <TabsContent value="modeling" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Scenario Comparison — Total Liability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={forecastScenarios[0].projections.map((p, i) => ({
                    year: p.year,
                    base: p.aroLiability + p.eroLiability,
                    high: forecastScenarios[1].projections[i].aroLiability + forecastScenarios[1].projections[i].eroLiability,
                    accelerated: forecastScenarios[2].projections[i].aroLiability + forecastScenarios[2].projections[i].eroLiability,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={v => formatCurrencyK(v)} tick={{ fontSize: 11 }} width={60} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Legend />
                    <Line type="monotone" dataKey="base" stroke="hsl(187, 60%, 38%)" strokeWidth={2} name="Base Case" dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="high" stroke="hsl(0, 72%, 51%)" strokeWidth={2} name="High Inflation" dot={{ r: 3 }} strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="accelerated" stroke="hsl(152, 55%, 42%)" strokeWidth={2} name="Accelerated" dot={{ r: 3 }} strokeDasharray="3 3" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-3">
            {forecastScenarios.map(s => {
              const finalYear = s.projections[s.projections.length - 1];
              const startYear = s.projections[0];
              const totalSettlements = s.projections.reduce((sum, p) => sum + p.settlements, 0);
              return (
                <Card key={s.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{s.name}</CardTitle>
                    <p className="text-[10px] text-muted-foreground">{s.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    <DetailRow label="2026 Total" value={formatCurrencyK(startYear.aroLiability + startYear.eroLiability)} />
                    <DetailRow label="2035 Total" value={formatCurrencyK(finalYear.aroLiability + finalYear.eroLiability)} />
                    <DetailRow label="Total Settlements" value={formatCurrencyK(totalSettlements)} />
                    <DetailRow label="Net Reduction" value={formatCurrencyK(
                      (startYear.aroLiability + startYear.eroLiability) - (finalYear.aroLiability + finalYear.eroLiability)
                    )} />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Cost Projections */}
        <TabsContent value="projections">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Settlement & Accretion Projections — {scenario.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scenario.projections}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={v => formatCurrencyK(v)} tick={{ fontSize: 11 }} width={60} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Legend />
                    <Bar dataKey="accretion" fill="hsl(187, 60%, 38%)" name="Accretion" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="settlements" fill="hsl(32, 80%, 50%)" name="Settlements" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget Alignment */}
        <TabsContent value="budget">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">FY2026 Budget Alignment</CardTitle>
                <div className="flex gap-4 text-xs">
                  <span>Budgeted: <span className="font-mono font-medium">{formatCurrency(totalBudgeted)}</span></span>
                  <span>Forecast: <span className="font-mono font-medium">{formatCurrency(totalForecast)}</span></span>
                  <span className={totalVariance >= 0 ? "text-chart-success" : "text-destructive"}>
                    Variance: <span className="font-mono font-medium">{totalVariance >= 0 ? "" : "-"}{formatCurrency(Math.abs(totalVariance))}</span>
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Obligation</TableHead>
                    <TableHead className="text-xs">Category</TableHead>
                    <TableHead className="text-xs">Site</TableHead>
                    <TableHead className="text-xs text-right">Budget</TableHead>
                    <TableHead className="text-xs text-right">Forecast</TableHead>
                    <TableHead className="text-xs text-right">Variance</TableHead>
                    <TableHead className="text-xs text-right">Var %</TableHead>
                    <TableHead className="text-xs">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetItems.map(b => (
                    <TableRow key={b.id}>
                      <TableCell className="text-xs font-medium">{b.obligationName}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{b.category}</Badge></TableCell>
                      <TableCell className="text-xs">{b.siteName}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{formatCurrency(b.budgetedAmount)}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{formatCurrency(b.forecastAmount)}</TableCell>
                      <TableCell className={`text-xs text-right font-mono ${b.variance >= 0 ? "text-chart-success" : "text-destructive"}`}>
                        {b.variance >= 0 ? "" : "-"}{formatCurrency(Math.abs(b.variance))}
                      </TableCell>
                      <TableCell className={`text-xs text-right font-mono ${b.variancePercent >= 0 ? "text-chart-success" : "text-destructive"}`}>
                        {b.variancePercent >= 0 ? "+" : ""}{b.variancePercent.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{b.notes}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold border-t-2">
                    <TableCell className="text-xs" colSpan={3}>Total</TableCell>
                    <TableCell className="text-xs text-right font-mono">{formatCurrency(totalBudgeted)}</TableCell>
                    <TableCell className="text-xs text-right font-mono">{formatCurrency(totalForecast)}</TableCell>
                    <TableCell className={`text-xs text-right font-mono ${totalVariance >= 0 ? "text-chart-success" : "text-destructive"}`}>
                      {totalVariance >= 0 ? "" : "-"}{formatCurrency(Math.abs(totalVariance))}
                    </TableCell>
                    <TableCell className="text-xs text-right font-mono">{((totalVariance / totalBudgeted) * 100).toFixed(1)}%</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
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
    <div className="flex justify-between border-b pb-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium font-mono">{value}</span>
    </div>
  );
}
