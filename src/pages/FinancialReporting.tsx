import { BarChart3, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatCard } from "@/components/StatCard";
import {
  obligations,
  forecastData,
  getTotalLiability,
  getTotalAccretion,
  getAROObligations,
  getEROObligations,
  formatCurrency,
  formatCurrencyK,
} from "@/data/mock-data";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function FinancialReporting() {
  const totalLiability = getTotalLiability();
  const aroLiability = getTotalLiability("ARO");
  const eroLiability = getTotalLiability("ERO");
  const totalAccretion = getTotalAccretion();
  const aroObls = getAROObligations();
  const eroObls = getEROObligations();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Financial Reporting</h1>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Combined Liability" value={formatCurrencyK(totalLiability)} icon={BarChart3} />
        <StatCard title="ARO Liability" value={formatCurrencyK(aroLiability)} icon={BarChart3} subtitle={`${((aroLiability / totalLiability) * 100).toFixed(0)}% of total`} />
        <StatCard title="ERO Liability" value={formatCurrencyK(eroLiability)} icon={BarChart3} subtitle={`${((eroLiability / totalLiability) * 100).toFixed(0)}% of total`} />
        <StatCard title="Total Accretion" value={formatCurrencyK(totalAccretion)} icon={TrendingUp} subtitle="Annual expense" />
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Liability Overview</TabsTrigger>
          <TabsTrigger value="asc410">ASC 410 (ARO)</TabsTrigger>
          <TabsTrigger value="asc450">ASC 450 (ERO)</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* By Site */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Liability by Site</CardTitle></CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Site</TableHead>
                      <TableHead className="text-xs text-right">ARO</TableHead>
                      <TableHead className="text-xs text-right">ERO</TableHead>
                      <TableHead className="text-xs text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {["Eagle Ford Basin", "Permian Basin", "Appalachian Basin", "Gulf Coast Terminal"].map(site => {
                      const siteObls = obligations.filter(o => o.siteName === site);
                      const aro = siteObls.filter(o => o.type === "ARO").reduce((s, o) => s + o.currentLiability, 0);
                      const ero = siteObls.filter(o => o.type === "ERO").reduce((s, o) => s + o.currentLiability, 0);
                      return (
                        <TableRow key={site}>
                          <TableCell className="text-xs font-medium">{site}</TableCell>
                          <TableCell className="text-xs text-right font-mono">{formatCurrency(aro)}</TableCell>
                          <TableCell className="text-xs text-right font-mono">{formatCurrency(ero)}</TableCell>
                          <TableCell className="text-xs text-right font-mono font-semibold">{formatCurrency(aro + ero)}</TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow className="font-bold">
                      <TableCell className="text-xs">Total</TableCell>
                      <TableCell className="text-xs text-right font-mono">{formatCurrency(aroLiability)}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{formatCurrency(eroLiability)}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{formatCurrency(totalLiability)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* PV Summary */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Present Value Summary</CardTitle></CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Obligation</TableHead>
                      <TableHead className="text-xs text-right">Initial PV</TableHead>
                      <TableHead className="text-xs text-right">Current FV</TableHead>
                      <TableHead className="text-xs text-center">Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {obligations.filter(o => o.status !== "Settled").slice(0, 8).map(o => (
                      <TableRow key={o.id}>
                        <TableCell className="text-xs">{o.name}</TableCell>
                        <TableCell className="text-xs text-right font-mono">{formatCurrency(o.initialEstimate)}</TableCell>
                        <TableCell className="text-xs text-right font-mono">{formatCurrency(o.currentLiability)}</TableCell>
                        <TableCell className="text-xs text-center">{(o.discountRate * 100).toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="asc410">
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">ASC 410-20 — Asset Retirement Obligations Disclosure</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Description</TableHead>
                    <TableHead className="text-xs text-right">Beginning Balance</TableHead>
                    <TableHead className="text-xs text-right">Accretion</TableHead>
                    <TableHead className="text-xs text-right">Revisions</TableHead>
                    <TableHead className="text-xs text-right">Settlements</TableHead>
                    <TableHead className="text-xs text-right">Ending Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aroObls.filter(o => o.status !== "Settled").map(o => (
                    <TableRow key={o.id}>
                      <TableCell className="text-xs">{o.name}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{formatCurrency(o.currentLiability - o.accretionExpense - (o.revisionImpact || 0))}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{formatCurrency(o.accretionExpense)}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{formatCurrency(o.revisionImpact || 0)}</TableCell>
                      <TableCell className="text-xs text-right font-mono">$0</TableCell>
                      <TableCell className="text-xs text-right font-mono font-semibold">{formatCurrency(o.currentLiability)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold border-t-2">
                    <TableCell className="text-xs">Total ARO</TableCell>
                    <TableCell className="text-xs text-right font-mono">{formatCurrency(aroObls.filter(o => o.status !== "Settled").reduce((s, o) => s + o.currentLiability - o.accretionExpense - (o.revisionImpact || 0), 0))}</TableCell>
                    <TableCell className="text-xs text-right font-mono">{formatCurrency(getTotalAccretion("ARO"))}</TableCell>
                    <TableCell className="text-xs text-right font-mono">{formatCurrency(aroObls.reduce((s, o) => s + (o.revisionImpact || 0), 0))}</TableCell>
                    <TableCell className="text-xs text-right font-mono">$0</TableCell>
                    <TableCell className="text-xs text-right font-mono">{formatCurrency(aroLiability)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="asc450">
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">ASC 450-20 — Environmental Remediation Obligations</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Obligation</TableHead>
                    <TableHead className="text-xs">Contaminant</TableHead>
                    <TableHead className="text-xs">Phase</TableHead>
                    <TableHead className="text-xs text-right">Accrued Liability</TableHead>
                    <TableHead className="text-xs">Regulatory Deadline</TableHead>
                    <TableHead className="text-xs text-right">Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eroObls.map(o => (
                    <TableRow key={o.id}>
                      <TableCell className="text-xs">{o.name}</TableCell>
                      <TableCell className="text-xs">{o.contaminantType}</TableCell>
                      <TableCell className="text-xs">{o.remediationPhase}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{formatCurrency(o.currentLiability)}</TableCell>
                      <TableCell className="text-xs">{o.regulatoryDeadline}</TableCell>
                      <TableCell className="text-xs text-right">{o.remediationProgress}%</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold border-t-2">
                    <TableCell className="text-xs" colSpan={3}>Total ERO</TableCell>
                    <TableCell className="text-xs text-right font-mono">{formatCurrency(eroLiability)}</TableCell>
                    <TableCell colSpan={2}></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Liability Forecast (2026–2036)</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={v => formatCurrencyK(v)} tick={{ fontSize: 11 }} width={60} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Legend />
                    <Area type="monotone" dataKey="aro" stroke="hsl(187, 60%, 38%)" fill="hsl(187, 60%, 38%)" fillOpacity={0.2} name="ARO" />
                    <Area type="monotone" dataKey="ero" stroke="hsl(32, 80%, 50%)" fill="hsl(32, 80%, 50%)" fillOpacity={0.2} name="ERO" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
