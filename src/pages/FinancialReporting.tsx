import { BarChart3, TrendingUp, Download, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { exportToCSV, exportToPDF } from "@/lib/export-utils";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function FinancialReporting() {
  const totalLiability = getTotalLiability();
  const aroLiability = getTotalLiability("ARO");
  const eroLiability = getTotalLiability("ERO");
  const totalAccretion = getTotalAccretion();
  const aroObls = getAROObligations();
  const eroObls = getEROObligations();

  const siteNames = ["Eagle Ford Basin", "Permian Basin", "Appalachian Basin", "Gulf Coast Terminal"];

  const exportLiabilitySite = (format: "csv" | "pdf") => {
    const headers = ["Site", "ARO", "ERO", "Total"];
    const rows = siteNames.map(site => {
      const siteObls = obligations.filter(o => o.siteName === site);
      const aro = siteObls.filter(o => o.type === "ARO").reduce((s, o) => s + o.currentLiability, 0);
      const ero = siteObls.filter(o => o.type === "ERO").reduce((s, o) => s + o.currentLiability, 0);
      return [site, formatCurrency(aro), formatCurrency(ero), formatCurrency(aro + ero)];
    });
    rows.push(["Total", formatCurrency(aroLiability), formatCurrency(eroLiability), formatCurrency(totalLiability)]);
    format === "csv"
      ? exportToCSV(headers, rows, "liability-by-site")
      : exportToPDF("Liability by Site", headers, rows, "liability-by-site");
  };

  const exportASC410 = (format: "csv" | "pdf") => {
    const headers = ["Description", "Beginning Balance", "Accretion", "Revisions", "Settlements", "Ending Balance"];
    const activeARO = aroObls.filter(o => o.status !== "Settled");
    const rows = activeARO.map(o => [
      o.name,
      formatCurrency(o.currentLiability - o.accretionExpense - (o.revisionImpact || 0)),
      formatCurrency(o.accretionExpense),
      formatCurrency(o.revisionImpact || 0),
      "$0",
      formatCurrency(o.currentLiability),
    ]);
    rows.push([
      "Total ARO",
      formatCurrency(activeARO.reduce((s, o) => s + o.currentLiability - o.accretionExpense - (o.revisionImpact || 0), 0)),
      formatCurrency(getTotalAccretion("ARO")),
      formatCurrency(aroObls.reduce((s, o) => s + (o.revisionImpact || 0), 0)),
      "$0",
      formatCurrency(aroLiability),
    ]);
    format === "csv"
      ? exportToCSV(headers, rows, "asc-410-disclosure")
      : exportToPDF("ASC 410-20 — Asset Retirement Obligations Disclosure", headers, rows, "asc-410-disclosure");
  };

  const exportASC450 = (format: "csv" | "pdf") => {
    const headers = ["Obligation", "Contaminant", "Phase", "Accrued Liability", "Regulatory Deadline", "Progress"];
    const rows = eroObls.map(o => [
      o.name, o.contaminantType || "", o.remediationPhase || "",
      formatCurrency(o.currentLiability), o.regulatoryDeadline || "", `${o.remediationProgress}%`,
    ]);
    rows.push(["Total ERO", "", "", formatCurrency(eroLiability), "", ""]);
    format === "csv"
      ? exportToCSV(headers, rows, "asc-450-disclosure")
      : exportToPDF("ASC 450-20 — Environmental Remediation Obligations", headers, rows, "asc-450-disclosure");
  };

  const exportForecast = (format: "csv" | "pdf") => {
    const headers = ["Year", "ARO", "ERO", "Total"];
    const rows = forecastData.map(d => [d.year.toString(), formatCurrency(d.aro), formatCurrency(d.ero), formatCurrency(d.aro + d.ero)]);
    format === "csv"
      ? exportToCSV(headers, rows, "liability-forecast")
      : exportToPDF("Liability Forecast (2026–2036)", headers, rows, "liability-forecast");
  };

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
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Liability by Site</CardTitle>
                  <ExportButtons onCSV={() => exportLiabilitySite("csv")} onPDF={() => exportLiabilitySite("pdf")} />
                </div>
              </CardHeader>
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
                    {siteNames.map(site => {
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
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">ASC 410-20 — Asset Retirement Obligations Disclosure</CardTitle>
                <ExportButtons onCSV={() => exportASC410("csv")} onPDF={() => exportASC410("pdf")} />
              </div>
            </CardHeader>
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
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">ASC 450-20 — Environmental Remediation Obligations</CardTitle>
                <ExportButtons onCSV={() => exportASC450("csv")} onPDF={() => exportASC450("pdf")} />
              </div>
            </CardHeader>
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
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Liability Forecast (2026–2036)</CardTitle>
                <ExportButtons onCSV={() => exportForecast("csv")} onPDF={() => exportForecast("pdf")} />
              </div>
            </CardHeader>
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
