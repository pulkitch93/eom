import { useState } from "react";
import { AlertTriangle, Search, Eye, ArrowRight, TrendingDown, TrendingUp, CheckCircle2, XCircle, FileWarning, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  mockDocuments, mockInvoices, mockExceptionReasons, mockDataQualityTrends,
  type UploadedDocument,
} from "@/data/invoice-mock-data";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export function DataQualityDashboard() {
  const [selectedUnmatched, setSelectedUnmatched] = useState<UploadedDocument | null>(null);

  const totalInvoices = mockInvoices.length;
  const totalDocs = mockDocuments.length;
  const matchedDocs = mockDocuments.filter((d) => d.matchApproved).length;
  const unmatchedDocs = mockDocuments.filter((d) => !d.matchApproved && d.bestMatchConfidence < 60).length;
  const conflicts = mockDocuments.filter((d) => d.matchCandidates.length > 1 && !d.matchApproved).length;
  const missingDocs = mockInvoices.filter((i) => i.docStatus === "missing").length;

  const tiles = [
    { label: "Total Invoices", value: totalInvoices, icon: <BarChart3 className="h-4 w-4" /> },
    { label: "Documents Uploaded", value: totalDocs, icon: <BarChart3 className="h-4 w-4" /> },
    { label: "Matched", value: matchedDocs, icon: <CheckCircle2 className="h-4 w-4 text-green-600" /> },
    { label: "Unmatched", value: unmatchedDocs, icon: <XCircle className="h-4 w-4 text-red-600" /> },
    { label: "Conflicts", value: conflicts, icon: <AlertTriangle className="h-4 w-4 text-amber-600" /> },
    { label: "Invoices Missing Docs", value: missingDocs, icon: <FileWarning className="h-4 w-4 text-red-600" /> },
  ];

  const unmatchedDocsList = mockDocuments.filter((d) => !d.matchApproved);
  const missingDocInvoices = mockInvoices.filter((i) => i.docStatus === "missing");

  const severityColor = (s: string) => {
    if (s === "high") return "bg-red-50 text-red-700 border-red-200";
    if (s === "medium") return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-blue-50 text-blue-700 border-blue-200";
  };

  return (
    <div className="space-y-6">
      {/* A) Summary Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {tiles.map((t) => (
          <Card key={t.label}>
            <CardContent className="p-3 text-center">
              <div className="flex items-center justify-center mb-1">{t.icon}</div>
              <p className="text-2xl font-bold">{t.value}</p>
              <p className="text-[10px] text-muted-foreground">{t.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* B) Exception Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Exception Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reason</TableHead>
                <TableHead className="text-center">Count</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Recommended Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockExceptionReasons.map((er) => (
                <TableRow key={er.reason}>
                  <TableCell className="font-medium text-sm">{er.reason}</TableCell>
                  <TableCell className="text-center">{er.count}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] ${severityColor(er.severity)}`}>
                      {er.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[300px]">{er.recommendedAction}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* C) Unmatched Documents Queue */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Unmatched Documents Queue</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead className="text-center">OCR Confidence</TableHead>
                <TableHead>Fields Present</TableHead>
                <TableHead>Top Failure Reason</TableHead>
                <TableHead>Suggested Matches</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unmatchedDocsList.map((doc) => {
                const presentFields = doc.extractedFields.filter((f) => f.value && f.confidence >= 60);
                const missingFields = doc.extractedFields.filter((f) => !f.value || f.confidence < 60);
                const topReason = !doc.extractedFields.find((f) => f.field === "Invoice Number")?.value
                  ? "Missing invoice number"
                  : doc.ocrConfidence < 70
                  ? "Low OCR confidence"
                  : "Vendor mismatch";
                return (
                  <TableRow key={doc.id} className="cursor-pointer" onClick={() => setSelectedUnmatched(doc)}>
                    <TableCell className="text-sm font-medium">{doc.filename}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(doc.uploadedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={`${
                        doc.ocrConfidence >= 90 ? "border-green-300 text-green-700" :
                        doc.ocrConfidence >= 60 ? "border-amber-300 text-amber-700" :
                        "border-red-300 text-red-700"
                      }`}>
                        {doc.ocrConfidence}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-0.5 flex-wrap">
                        {presentFields.map((f) => (
                          <Badge key={f.field} variant="secondary" className="text-[9px] bg-green-50 text-green-700">{f.field.split(" ")[0]}</Badge>
                        ))}
                        {missingFields.map((f) => (
                          <Badge key={f.field} variant="outline" className="text-[9px] border-red-200 text-red-500">{f.field.split(" ")[0]}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{topReason}</TableCell>
                    <TableCell className="text-xs">
                      {doc.matchCandidates.slice(0, 2).map((mc) => {
                        const inv = mockInvoices.find((i) => i.id === mc.invoiceId);
                        return (
                          <span key={mc.invoiceId} className="block">{inv?.invoiceNumber} ({mc.confidence}%)</span>
                        );
                      })}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" className="text-xs gap-1">
                        <Eye className="h-3 w-3" /> Review
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* D) Invoices Missing Documents */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Invoices Missing Documents</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {missingDocInvoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                  <TableCell>{inv.vendor}</TableCell>
                  <TableCell className="text-right font-mono">${inv.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground">{inv.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50 text-[10px]">Missing</Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" className="text-xs gap-1">
                      <ArrowRight className="h-3 w-3" /> Request Docs
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* E) Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-green-600" /> Unmatched Documents Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={mockDataQualityTrends}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="unmatched" stroke="hsl(0, 72%, 51%)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="conflictsResolved" stroke="hsl(187, 60%, 38%)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Match Completion %
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={mockDataQualityTrends}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="completionPct" fill="hsl(187, 60%, 38%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detail Sheet for Unmatched */}
      <Sheet open={!!selectedUnmatched} onOpenChange={() => setSelectedUnmatched(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selectedUnmatched && (
            <>
              <SheetHeader>
                <SheetTitle className="text-base">{selectedUnmatched.filename}</SheetTitle>
                <SheetDescription>Review and assign this unmatched document</SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                {/* PDF Preview */}
                <div className="border rounded-lg bg-muted/30 h-32 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Eye className="h-6 w-6 mx-auto mb-1 opacity-40" />
                    <p className="text-xs">PDF Preview</p>
                  </div>
                </div>

                {/* Extracted Fields */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Extracted Fields</h4>
                  {selectedUnmatched.extractedFields.map((f) => (
                    <div key={f.field} className="flex items-center justify-between text-xs border rounded px-2 py-1.5 mb-1">
                      <span className="text-muted-foreground">{f.field}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{f.value || "—"}</span>
                        <Badge variant="outline" className={`text-[10px] ${
                          f.confidence >= 90 ? "border-green-300 text-green-700" :
                          f.confidence >= 60 ? "border-amber-300 text-amber-700" :
                          "border-red-300 text-red-700"
                        }`}>{f.confidence}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Why it failed */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Match Explanation</h4>
                  {selectedUnmatched.matchCandidates.map((mc, i) => {
                    const inv = mockInvoices.find((inv) => inv.id === mc.invoiceId);
                    return (
                      <div key={i} className="border rounded p-2 mb-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium">{inv?.invoiceNumber} ({mc.confidence}%)</span>
                          <Button size="sm" variant="outline" className="text-[10px] h-6">Assign</Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground italic">{mc.explanation}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Manual Assignment */}
                <Button size="sm" variant="outline" className="w-full gap-1">
                  <Search className="h-3 w-3" /> Search & Assign Manually
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
