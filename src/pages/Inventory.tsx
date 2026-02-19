import { useState } from "react";
import { ChevronRight, ChevronDown, MapPin, Building2, Box, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { sites, obligations, Obligation, formatCurrency } from "@/data/mock-data";

const statusColor: Record<string, string> = {
  Active: "bg-chart-success/10 text-chart-success border-chart-success/30",
  "Under Review": "bg-chart-warning/10 text-chart-warning border-chart-warning/30",
  Settled: "bg-muted text-muted-foreground border-border",
  Pending: "bg-primary/10 text-primary border-primary/30",
};

export default function Inventory() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedSites, setExpandedSites] = useState<Set<string>>(new Set(["S001"]));
  const [expandedFacilities, setExpandedFacilities] = useState<Set<string>>(new Set());
  const [selectedObligation, setSelectedObligation] = useState<Obligation | null>(null);

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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Inventory</h1>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
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
                        {expandedFacilities.has(fac.id) && fac.assets.map((asset) => (
                          <div key={asset.id} className="ml-6 flex items-center gap-1.5 py-0.5 text-xs text-muted-foreground">
                            <Box className="h-3 w-3" /> {asset.name}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Obligation Registry */}
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
                    <TableCell><span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusColor[o.status]}`}>{o.status}</span></TableCell>
                    <TableCell className="text-xs text-right font-mono">{formatCurrency(o.currentLiability)}</TableCell>
                    <TableCell className="text-xs text-right font-mono">{formatCurrency(o.accretionExpense)}</TableCell>
                    <TableCell className="text-xs">{o.targetSettlementDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Detail Sheet */}
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
    </div>
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
