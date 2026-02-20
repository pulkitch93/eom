import { useState, useEffect } from "react";
import {
  Upload, FileText, AlertTriangle, CheckCircle2, XCircle,
  ChevronRight, Eye, Shield, Zap, Target, ArrowRight,
  Brain, Sparkles, Check, X, Edit3, RotateCcw, FileSearch
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import {
  type ClassificationResult, type ObligationSignal, type MissingAttribute,
  getAvailableDocuments, classifyDocument
} from "@/lib/obligation-classification-engine";

type FieldStatus = "pending" | "accepted" | "rejected" | "edited";

interface FieldDecision {
  status: FieldStatus;
  originalValue: string;
  currentValue: string;
}

function confidenceColor(c: number) {
  if (c >= 80) return "text-chart-success";
  if (c >= 60) return "text-chart-warning";
  return "text-destructive";
}

function confidenceBg(c: number) {
  if (c >= 80) return "bg-chart-success/10 border-chart-success/30";
  if (c >= 60) return "bg-chart-warning/10 border-chart-warning/30";
  return "bg-destructive/10 border-destructive/30";
}

function severityColor(s: string) {
  if (s === "Critical") return "bg-destructive/10 text-destructive border-destructive/30";
  if (s === "High") return "bg-chart-warning/10 text-chart-warning border-chart-warning/30";
  return "bg-primary/10 text-primary border-primary/30";
}

export default function ObligationClassificationTab() {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState(0);
  const [fieldDecisions, setFieldDecisions] = useState<Record<string, FieldDecision>>({});
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [activePanel, setActivePanel] = useState<"signals" | "fields" | "audit">("signals");

  const availableDocs = getAvailableDocuments();

  const STEPS = ["Parsing document…", "Extracting obligation signals…", "Classifying liability type…", "Detecting duplicates…", "Scoring completeness…"];

  const handleClassify = (filename: string) => {
    setSelectedDoc(filename);
    setResult(null);
    setIsProcessing(true);
    setProcessStep(0);
    setFieldDecisions({});
    setShowUploadDialog(false);

    // Simulate progressive processing
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setProcessStep(step);
      if (step >= STEPS.length) {
        clearInterval(interval);
        const classResult = classifyDocument(filename);
        setResult(classResult);
        setIsProcessing(false);
        // Initialize field decisions
        const decisions: Record<string, FieldDecision> = {};
        for (const [key, value] of Object.entries(classResult.suggestedFields)) {
          decisions[key] = { status: "pending", originalValue: value, currentValue: value };
        }
        setFieldDecisions(decisions);
      }
    }, 600);
  };

  const updateFieldStatus = (key: string, status: FieldStatus) => {
    setFieldDecisions(prev => ({
      ...prev,
      [key]: { ...prev[key], status },
    }));
  };

  const acceptAll = () => {
    setFieldDecisions(prev => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        next[key] = { ...next[key], status: "accepted" };
      }
      return next;
    });
  };

  const FIELD_LABELS: Record<string, string> = {
    obligationType: "Obligation Type",
    regulatoryJurisdiction: "Regulatory Jurisdiction",
    remediationType: "Remediation Type",
    environmentalCategory: "Environmental Category",
    projectedTimeHorizon: "Projected Time Horizon",
    potentialCostIndicator: "Potential Cost Indicator",
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-sm font-semibold">Intelligent Obligation Classification Engine</h2>
            <p className="text-[10px] text-muted-foreground">AI-powered document ingestion, signal extraction & liability classification</p>
          </div>
        </div>
        <Button size="sm" onClick={() => setShowUploadDialog(true)} className="gap-1.5">
          <Upload className="h-3.5 w-3.5" />
          AI Ingest & Classify Document
        </Button>
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSearch className="h-5 w-5 text-primary" />
              Select Document for Classification
            </DialogTitle>
            <DialogDescription>
              Choose an environmental document to ingest. The AI engine will extract obligation signals, classify liability types, and suggest field values.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mt-2">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Available Documents</p>
            {availableDocs.map(doc => (
              <button
                key={doc}
                onClick={() => handleClassify(doc)}
                className="w-full flex items-center gap-3 p-3 rounded-md border hover:border-primary/50 hover:bg-accent/50 transition-colors text-left"
              >
                <FileText className="h-4 w-4 text-primary shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate">{doc}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {doc.endsWith(".pdf") ? "PDF Document" : doc.endsWith(".docx") ? "Word Document" : doc.endsWith(".csv") ? "CSV Data File" : "Document"}
                  </p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">Supported formats: PDF, DOCX, MSG, CSV. OCR enabled for scanned documents.</p>
        </DialogContent>
      </Dialog>

      {/* Processing State */}
      {isProcessing && (
        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Processing: {selectedDoc}</p>
                <p className="text-xs text-muted-foreground mt-1">{STEPS[Math.min(processStep, STEPS.length - 1)]}</p>
              </div>
              <Progress value={(processStep / STEPS.length) * 100} className="w-64 h-2" />
              <div className="flex gap-1.5">
                {STEPS.map((s, i) => (
                  <div key={i} className={`h-1.5 w-1.5 rounded-full ${i <= processStep ? "bg-primary" : "bg-border"}`} />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && !isProcessing && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <SummaryCard label="Document Type" value={result.documentType} icon={<FileText className="h-4 w-4 text-primary" />} />
            <SummaryCard label="Liability Type" value={result.liabilityType} icon={<Target className="h-4 w-4 text-chart-ero" />} />
            <SummaryCard
              label="Confidence"
              value={`${result.liabilityConfidence}%`}
              icon={<Zap className={`h-4 w-4 ${confidenceColor(result.liabilityConfidence)}`} />}
              subtext={result.liabilityConfidence < 70 ? "Manual review recommended" : undefined}
            />
            <SummaryCard
              label="ARO Likelihood"
              value={`${result.aroLikelihood}%`}
              icon={<Shield className={`h-4 w-4 ${confidenceColor(result.aroLikelihood)}`} />}
              subtext={result.aroCategory || "N/A"}
            />
            <SummaryCard
              label="Completeness"
              value={`${result.completenessScore}%`}
              icon={<CheckCircle2 className={`h-4 w-4 ${confidenceColor(result.completenessScore)}`} />}
              subtext={`${result.missingAttributes.length} missing fields`}
            />
          </div>

          {/* Risk Flags */}
          {result.riskFlags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {result.riskFlags.map(flag => (
                <Badge key={flag} variant="outline" className="bg-destructive/5 text-destructive border-destructive/20 text-[10px] gap-1">
                  <AlertTriangle className="h-3 w-3" /> {flag}
                </Badge>
              ))}
            </div>
          )}

          {/* Main Panels */}
          <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
            {/* Left Panel */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Tabs value={activePanel} onValueChange={v => setActivePanel(v as typeof activePanel)} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="signals" className="text-xs gap-1"><Eye className="h-3 w-3" />Signals ({result.signals.length})</TabsTrigger>
                      <TabsTrigger value="fields" className="text-xs gap-1"><Edit3 className="h-3 w-3" />Autofill</TabsTrigger>
                      <TabsTrigger value="audit" className="text-xs gap-1"><Shield className="h-3 w-3" />Audit</TabsTrigger>
                    </TabsList>

                    {/* Signals Tab */}
                    <TabsContent value="signals" className="mt-3">
                      <ScrollArea className="h-[420px] pr-3">
                        <div className="space-y-3">
                          {result.signals.map(signal => (
                            <SignalCard key={signal.id} signal={signal} />
                          ))}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    {/* Autofill Tab */}
                    <TabsContent value="fields" className="mt-3">
                      <div className="flex justify-end mb-3">
                        <Button size="sm" variant="outline" onClick={acceptAll} className="text-xs gap-1">
                          <Check className="h-3 w-3" /> Accept All
                        </Button>
                      </div>
                      <ScrollArea className="h-[380px] pr-3">
                        <div className="space-y-2">
                          {Object.entries(fieldDecisions).map(([key, decision]) => (
                            <FieldRow
                              key={key}
                              label={FIELD_LABELS[key] || key}
                              decision={decision}
                              onAccept={() => updateFieldStatus(key, "accepted")}
                              onReject={() => updateFieldStatus(key, "rejected")}
                            />
                          ))}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    {/* Audit Tab */}
                    <TabsContent value="audit" className="mt-3">
                      <ScrollArea className="h-[420px] pr-3">
                        <div className="space-y-4">
                          <div>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Classification Metadata</p>
                            <div className="space-y-1.5 text-xs">
                              <AuditRow label="Document" value={result.documentName} />
                              <AuditRow label="Classified At" value={new Date(result.uploadedAt).toLocaleString()} />
                              <AuditRow label="Liability Type" value={result.liabilityType} />
                              <AuditRow label="Confidence" value={`${result.liabilityConfidence}%`} />
                              <AuditRow label="Signals Detected" value={result.signals.length.toString()} />
                              <AuditRow label="ARO Category" value={result.aroCategory || "None"} />
                            </div>
                          </div>

                          <div>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Field Decisions</p>
                            <div className="space-y-1 text-xs">
                              {Object.entries(fieldDecisions).map(([key, d]) => (
                                <div key={key} className="flex justify-between border-b pb-1">
                                  <span className="text-muted-foreground">{FIELD_LABELS[key]}</span>
                                  <Badge variant="outline" className={`text-[10px] ${
                                    d.status === "accepted" ? "bg-chart-success/10 text-chart-success border-chart-success/30" :
                                    d.status === "rejected" ? "bg-destructive/10 text-destructive border-destructive/30" :
                                    "bg-muted text-muted-foreground border-border"
                                  }`}>{d.status}</Badge>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Recommended Actions</p>
                            <div className="space-y-1.5">
                              {result.recommendedActions.map((action, i) => (
                                <div key={i} className="flex items-start gap-2 text-xs">
                                  <ChevronRight className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                                  <span>{action}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </div>
              </CardHeader>
            </Card>

            {/* Right Panel */}
            <div className="space-y-4">
              {/* Missing Attributes */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-chart-warning" />
                    Data Completeness Risk Flags
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {result.missingAttributes.map((attr, i) => (
                    <MissingAttrRow key={i} attr={attr} />
                  ))}
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Completeness Score</span>
                      <span className={`font-mono font-medium ${confidenceColor(result.completenessScore)}`}>{result.completenessScore}%</span>
                    </div>
                    <Progress value={result.completenessScore} className="h-1.5 mt-1.5" />
                  </div>
                </CardContent>
              </Card>

              {/* Duplicate Detection */}
              {result.duplicateMatches.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium flex items-center gap-1.5">
                      <RotateCcw className="h-3.5 w-3.5 text-chart-ero" />
                      Potential Duplicates Detected
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {result.duplicateMatches.map(dup => (
                      <div key={dup.obligationId} className="flex items-center justify-between p-2 rounded-md border text-xs">
                        <div>
                          <p className="font-medium">{dup.obligationName}</p>
                          <p className="text-[10px] text-muted-foreground">{dup.siteName} • {dup.obligationId}</p>
                        </div>
                        <Badge variant="outline" className={confidenceBg(dup.similarity)}>
                          {dup.similarity}%
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Re-run button */}
              <Button variant="outline" size="sm" className="w-full text-xs gap-1.5" onClick={() => selectedDoc && handleClassify(selectedDoc)}>
                <RotateCcw className="h-3 w-3" /> Re-run Classification
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Empty state */}
      {!result && !isProcessing && (
        <Card>
          <CardContent className="py-16 flex flex-col items-center gap-4 text-center">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Brain className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">No document classified yet</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-md">
                Upload a regulatory notice, consent decree, decommissioning plan, lease agreement, or monitoring report
                to automatically extract obligation signals and classify liability types.
              </p>
            </div>
            <Button size="sm" onClick={() => setShowUploadDialog(true)} className="gap-1.5">
              <Upload className="h-3.5 w-3.5" /> AI Ingest & Classify Document
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ---------- Sub-components ----------

function SignalCard({ signal }: { signal: ObligationSignal }) {
  return (
    <div className="p-3 rounded-md border space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px]">{signal.signalType}</Badge>
          <span className="text-[10px] text-muted-foreground">Page {signal.pageNumber}, ¶{signal.paragraphIndex}</span>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={`text-[10px] ${confidenceBg(signal.confidence)}`}>
              {signal.confidence}%
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="left" className="text-xs max-w-48">
            AI confidence score for this signal extraction
          </TooltipContent>
        </Tooltip>
      </div>
      <p className="text-xs leading-relaxed border-l-2 border-primary/40 pl-2.5 text-muted-foreground italic">
        "{signal.text}"
      </p>
    </div>
  );
}

function FieldRow({ label, decision, onAccept, onReject }: {
  label: string;
  decision: FieldDecision;
  onAccept: () => void;
  onReject: () => void;
}) {
  return (
    <div className={`p-2.5 rounded-md border transition-colors ${
      decision.status === "accepted" ? "border-chart-success/30 bg-chart-success/5" :
      decision.status === "rejected" ? "border-destructive/30 bg-destructive/5" :
      "border-border"
    }`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        {decision.status === "pending" ? (
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" className="h-5 w-5" onClick={onAccept}>
              <Check className="h-3 w-3 text-chart-success" />
            </Button>
            <Button size="icon" variant="ghost" className="h-5 w-5" onClick={onReject}>
              <X className="h-3 w-3 text-destructive" />
            </Button>
          </div>
        ) : (
          <Badge variant="outline" className={`text-[10px] ${
            decision.status === "accepted" ? "bg-chart-success/10 text-chart-success border-chart-success/30" :
            "bg-destructive/10 text-destructive border-destructive/30"
          }`}>
            {decision.status === "accepted" ? <Check className="h-2.5 w-2.5 mr-0.5" /> : <X className="h-2.5 w-2.5 mr-0.5" />}
            {decision.status}
          </Badge>
        )}
      </div>
      <p className="text-xs">{decision.currentValue}</p>
    </div>
  );
}

function MissingAttrRow({ attr }: { attr: MissingAttribute }) {
  return (
    <div className="p-2 rounded-md border space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">{attr.field}</span>
        <Badge variant="outline" className={`text-[10px] ${severityColor(attr.severity)}`}>{attr.severity}</Badge>
      </div>
      <p className="text-[10px] text-muted-foreground">{attr.recommendation}</p>
    </div>
  );
}

function AuditRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b pb-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right max-w-[60%]">{value}</span>
    </div>
  );
}

function SummaryCard({ label, value, icon, subtext }: { label: string; value: string; icon: React.ReactNode; subtext?: string }) {
  return (
    <Card>
      <CardContent className="pt-3 pb-2.5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className="text-sm font-bold mt-0.5">{value}</p>
            {subtext && <p className="text-[10px] text-muted-foreground mt-0.5">{subtext}</p>}
          </div>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
