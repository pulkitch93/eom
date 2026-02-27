import { useState } from "react";
import { Search, FileText, Eye, ChevronRight, CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockInvoices, mockDocuments, mockAuditTrail, getDocStatusConfig, type Invoice } from "@/data/invoice-mock-data";

export function InvoiceListView() {
  const [search, setSearch] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const filtered = mockInvoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.vendor.toLowerCase().includes(search.toLowerCase())
  );

  const getAttachedDocs = (invoiceId: string) =>
    mockDocuments.filter((d) => d.bestMatchInvoiceId === invoiceId && d.matchApproved);

  const getRelatedAudit = (invoiceId: string) => {
    const docIds = mockDocuments.filter((d) => d.bestMatchInvoiceId === invoiceId).map((d) => d.id);
    return mockAuditTrail.filter((a) => docIds.includes(a.entityId) || a.entityId === invoiceId);
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "complete": return <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />;
      case "attached": return <FileText className="h-3.5 w-3.5 text-blue-600" />;
      case "needs_review": return <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />;
      case "missing": return <XCircle className="h-3.5 w-3.5 text-red-600" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
        </div>
        <div className="flex gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-600" /> Complete: {mockInvoices.filter((i) => i.docStatus === "complete").length}</span>
          <span className="flex items-center gap-1"><XCircle className="h-3 w-3 text-red-600" /> Missing: {mockInvoices.filter((i) => i.docStatus === "missing").length}</span>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Docs Status</TableHead>
                <TableHead className="text-center">Docs</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-center">Audit Ready</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((inv) => {
                const statusCfg = getDocStatusConfig(inv.docStatus);
                return (
                  <TableRow key={inv.id} className="cursor-pointer" onClick={() => setSelectedInvoice(inv)}>
                    <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                    <TableCell>{inv.vendor}</TableCell>
                    <TableCell className="text-right font-mono">${inv.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">{inv.date}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`gap-1 ${statusCfg.className}`}>
                        {statusIcon(inv.docStatus)} {statusCfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{inv.attachedDocCount}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{inv.lastUpdated}</TableCell>
                    <TableCell className="text-center">
                      {inv.auditReady ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" />
                      ) : (
                        <Clock className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invoice Detail Sheet */}
      <Sheet open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selectedInvoice && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedInvoice.invoiceNumber}</SheetTitle>
                <SheetDescription>{selectedInvoice.vendor}</SheetDescription>
              </SheetHeader>

              <div className="mt-4 space-y-4">
                {/* Invoice Details */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="border rounded p-2">
                    <span className="text-[10px] text-muted-foreground block">Amount</span>
                    <span className="font-mono font-semibold">${selectedInvoice.amount.toLocaleString()}</span>
                  </div>
                  <div className="border rounded p-2">
                    <span className="text-[10px] text-muted-foreground block">Date</span>
                    <span>{selectedInvoice.date}</span>
                  </div>
                  <div className="border rounded p-2">
                    <span className="text-[10px] text-muted-foreground block">PO Number</span>
                    <span>{selectedInvoice.poNumber || "—"}</span>
                  </div>
                  <div className="border rounded p-2">
                    <span className="text-[10px] text-muted-foreground block">Project Code</span>
                    <span>{selectedInvoice.projectCode || "—"}</span>
                  </div>
                </div>

                {/* Attached Documents */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Attached Documents</h4>
                  {getAttachedDocs(selectedInvoice.id).length > 0 ? (
                    getAttachedDocs(selectedInvoice.id).map((doc) => (
                      <div key={doc.id} className="border rounded-md p-2 mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <div>
                            <p className="text-xs font-medium">{doc.filename}</p>
                            <p className="text-[10px] text-muted-foreground">
                              Matched {doc.bestMatchConfidence}% • Approved by {doc.approvedBy}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost"><Eye className="h-3 w-3" /></Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground border rounded p-3 text-center">No documents attached yet</p>
                  )}
                </div>

                {/* Match History / Audit Trail */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Activity Timeline</h4>
                  <div className="space-y-2">
                    {getRelatedAudit(selectedInvoice.id).map((entry) => (
                      <div key={entry.id} className="flex gap-2 text-xs">
                        <div className="w-1 rounded-full bg-primary/20 shrink-0" />
                        <div>
                          <p className="font-medium">{entry.action}</p>
                          <p className="text-muted-foreground">{entry.details}</p>
                          <p className="text-[10px] text-muted-foreground/60">
                            {entry.performedBy} • {new Date(entry.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {getRelatedAudit(selectedInvoice.id).length === 0 && (
                      <p className="text-xs text-muted-foreground text-center">No activity recorded</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
