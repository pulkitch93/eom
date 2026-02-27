import { useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Eye, ChevronRight, MessageSquare, Flag, ArrowRight, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { mockDocuments, mockInvoices, getConfidenceLevel, type UploadedDocument } from "@/data/invoice-mock-data";

type Lane = "high" | "medium" | "low";

export function ReviewQueue() {
  const [selectedDoc, setSelectedDoc] = useState<UploadedDocument | null>(null);
  const [approvedIds, setApprovedIds] = useState<Set<string>>(
    new Set(mockDocuments.filter((d) => d.matchApproved).map((d) => d.id))
  );
  const [bulkComment, setBulkComment] = useState("");
  const [showBulkApproval, setShowBulkApproval] = useState(false);

  const lanes: { key: Lane; label: string; icon: React.ReactNode; docs: UploadedDocument[]; color: string }[] = [
    {
      key: "high", label: "Auto-Matched (≥90)", icon: <CheckCircle2 className="h-4 w-4 text-green-600" />,
      docs: mockDocuments.filter((d) => d.bestMatchConfidence >= 90),
      color: "border-green-200 bg-green-50/30",
    },
    {
      key: "medium", label: "Needs Review (60-89)", icon: <AlertTriangle className="h-4 w-4 text-amber-600" />,
      docs: mockDocuments.filter((d) => d.bestMatchConfidence >= 60 && d.bestMatchConfidence < 90),
      color: "border-amber-200 bg-amber-50/30",
    },
    {
      key: "low", label: "Exceptions (<60)", icon: <XCircle className="h-4 w-4 text-red-600" />,
      docs: mockDocuments.filter((d) => d.bestMatchConfidence < 60),
      color: "border-red-200 bg-red-50/30",
    },
  ];

  const highConfUnapproved = lanes[0].docs.filter((d) => !approvedIds.has(d.id));

  const approveDoc = (id: string) => setApprovedIds((prev) => new Set([...prev, id]));

  const bulkApproveHigh = () => {
    const newIds = new Set(approvedIds);
    highConfUnapproved.forEach((d) => newIds.add(d.id));
    setApprovedIds(newIds);
    setShowBulkApproval(false);
    setBulkComment("");
  };

  const getMatchedInvoice = (invoiceId: string | null) =>
    invoiceId ? mockInvoices.find((i) => i.id === invoiceId) : null;

  return (
    <div className="space-y-4">
      {/* Bulk Approval Banner */}
      {highConfUnapproved.length > 0 && (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">
                {highConfUnapproved.length} high-confidence match{highConfUnapproved.length > 1 ? "es" : ""} ready for bulk approval
              </span>
            </div>
            {showBulkApproval ? (
              <div className="flex items-center gap-2">
                <Textarea
                  placeholder="Optional comment..."
                  value={bulkComment}
                  onChange={(e) => setBulkComment(e.target.value)}
                  className="h-8 min-h-[32px] w-48 text-xs"
                />
                <Button size="sm" onClick={bulkApproveHigh} className="gap-1">
                  <Check className="h-3 w-3" /> Approve All
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowBulkApproval(false)}>Cancel</Button>
              </div>
            ) : (
              <Button size="sm" onClick={() => setShowBulkApproval(true)} className="gap-1">
                <Check className="h-3 w-3" /> Bulk Approve
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Three Lanes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {lanes.map((lane) => (
          <Card key={lane.key} className={lane.color}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                {lane.icon} {lane.label}
                <Badge variant="secondary" className="ml-auto">{lane.docs.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {lane.docs.map((doc) => {
                const inv = getMatchedInvoice(doc.bestMatchInvoiceId);
                const approved = approvedIds.has(doc.id);
                return (
                  <div
                    key={doc.id}
                    className={`border rounded-md p-3 cursor-pointer transition-colors hover:bg-accent/50 ${
                      approved ? "bg-green-50/50 border-green-200" : "bg-card"
                    }`}
                    onClick={() => setSelectedDoc(doc)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium truncate max-w-[160px]">{doc.filename}</span>
                      {approved && <CheckCircle2 className="h-3 w-3 text-green-600 shrink-0" />}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <span>Confidence: {doc.bestMatchConfidence}%</span>
                      {inv && (
                        <>
                          <ArrowRight className="h-2.5 w-2.5" />
                          <span>{inv.invoiceNumber}</span>
                        </>
                      )}
                    </div>
                    {doc.flagged && (
                      <div className="flex items-center gap-1 mt-1">
                        <Flag className="h-3 w-3 text-red-500" />
                        <span className="text-[10px] text-red-600">{doc.flagReason}</span>
                      </div>
                    )}
                  </div>
                );
              })}
              {lane.docs.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No documents in this lane</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selectedDoc && (
            <>
              <SheetHeader>
                <SheetTitle className="text-base">{selectedDoc.filename}</SheetTitle>
                <SheetDescription>Uploaded by {selectedDoc.uploadedBy} on {new Date(selectedDoc.uploadedAt).toLocaleDateString()}</SheetDescription>
              </SheetHeader>

              <div className="mt-4 space-y-4">
                {/* Simulated PDF Preview */}
                <div className="border rounded-lg bg-muted/30 h-40 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Eye className="h-8 w-8 mx-auto mb-1 opacity-40" />
                    <p className="text-xs">PDF Preview</p>
                    <p className="text-[10px]">{selectedDoc.filename}</p>
                  </div>
                </div>

                {/* Extracted Fields */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Extracted Fields</h4>
                  <div className="space-y-1">
                    {selectedDoc.extractedFields.map((f) => (
                      <div key={f.field} className="flex items-center justify-between text-xs border rounded px-2 py-1.5">
                        <span className="text-muted-foreground">{f.field}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{f.value || "—"}</span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              f.confidence >= 90 ? "border-green-300 text-green-700" :
                              f.confidence >= 60 ? "border-amber-300 text-amber-700" :
                              "border-red-300 text-red-700"
                            }`}
                          >
                            {f.confidence}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Match Candidates */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Match Candidates</h4>
                  {selectedDoc.matchCandidates.map((mc, idx) => {
                    const inv = mockInvoices.find((i) => i.id === mc.invoiceId);
                    return (
                      <div key={idx} className="border rounded-lg p-3 mb-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{inv?.invoiceNumber} — {inv?.vendor}</span>
                          <Badge
                            variant="outline"
                            className={`${
                              mc.confidence >= 90 ? "border-green-300 text-green-700 bg-green-50" :
                              mc.confidence >= 60 ? "border-amber-300 text-amber-700 bg-amber-50" :
                              "border-red-300 text-red-700 bg-red-50"
                            }`}
                          >
                            {mc.confidence}%
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground italic mb-2">"{mc.explanation}"</p>
                        <div className="space-y-1">
                          {mc.signals.map((s, si) => (
                            <div key={si} className="flex items-center justify-between text-[10px]">
                              <span>{s.signal}</span>
                              <span className="text-muted-foreground">{s.score}/{s.weight} — {s.detail}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  {!approvedIds.has(selectedDoc.id) && selectedDoc.bestMatchInvoiceId && (
                    <Button size="sm" onClick={() => { approveDoc(selectedDoc.id); setSelectedDoc(null); }} className="gap-1">
                      <Check className="h-3 w-3" /> Approve Match
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="gap-1">
                    <ArrowRight className="h-3 w-3" /> Reassign
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Flag className="h-3 w-3" /> Flag Invalid
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <MessageSquare className="h-3 w-3" /> Add Note
                  </Button>
                </div>

                {/* Notes */}
                {selectedDoc.notes.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Notes</h4>
                    {selectedDoc.notes.map((n, i) => (
                      <p key={i} className="text-xs text-muted-foreground border-l-2 border-primary/30 pl-2 mb-1">{n}</p>
                    ))}
                  </div>
                )}

                {/* Metadata */}
                <div className="text-[10px] text-muted-foreground space-y-0.5 border-t pt-2">
                  <p>Extraction Method: {selectedDoc.extractionMethod.toUpperCase()}</p>
                  <p>Model Version: {selectedDoc.modelVersion}</p>
                  <p>OCR Confidence: {selectedDoc.ocrConfidence}%</p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
