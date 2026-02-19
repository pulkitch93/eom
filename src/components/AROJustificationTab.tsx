import { useState, useCallback } from "react";
import {
  BrainCircuit,
  FileText,
  Download,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  BookOpen,
  ClipboardCheck,
  History,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import ReactMarkdown from "react-markdown";
import {
  type NarrativeType,
  type NarrativeSection,
  type GeneratedNarrative,
  type AuditChecklistItem,
  NARRATIVE_TYPE_LABELS,
  generateNarrative,
  getAROObligationsForJustification,
} from "@/lib/aro-justification-engine";
import { exportToPDF } from "@/lib/export-utils";
import { formatCurrency } from "@/data/mock-data";

const CHECKLIST_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  complete: { icon: CheckCircle2, color: "text-chart-success" },
  missing: { icon: XCircle, color: "text-destructive" },
  warning: { icon: AlertTriangle, color: "text-chart-warning" },
};

export function AROJustificationTab() {
  const aroObligations = getAROObligationsForJustification();
  const [selectedObligation, setSelectedObligation] = useState("");
  const [narrativeType, setNarrativeType] = useState<NarrativeType>("full_audit_package");
  const [isGenerating, setIsGenerating] = useState(false);
  const [sections, setSections] = useState<NarrativeSection[]>([]);
  const [narrative, setNarrative] = useState<GeneratedNarrative | null>(null);
  const [generationHistory, setGenerationHistory] = useState<
    { id: string; obligationName: string; type: NarrativeType; timestamp: Date }[]
  >([]);

  const handleGenerate = useCallback(async () => {
    if (!selectedObligation) return;
    setIsGenerating(true);
    setSections([]);
    setNarrative(null);

    await generateNarrative(
      selectedObligation,
      narrativeType,
      (section) => {
        setSections(prev => [...prev, section]);
      },
      (result) => {
        setNarrative(result);
        setIsGenerating(false);
        const ob = aroObligations.find(o => o.id === selectedObligation);
        setGenerationHistory(prev => [
          { id: result.id, obligationName: ob?.name ?? selectedObligation, type: narrativeType, timestamp: new Date() },
          ...prev,
        ]);
      }
    );
  }, [selectedObligation, narrativeType, aroObligations]);

  const handleExportPDF = () => {
    if (!narrative || sections.length === 0) return;
    const ob = aroObligations.find(o => o.id === selectedObligation);
    const title = `ARO Justification — ${ob?.name ?? selectedObligation}`;
    const headers = ["Section", "Content"];
    const rows = sections.map(s => [s.title, s.content.replace(/\*\*/g, "").replace(/\n/g, " ").substring(0, 500)]);
    exportToPDF(title, headers, rows, `aro-justification-${selectedObligation}`);
  };

  const handleExportWord = () => {
    if (!narrative || sections.length === 0) return;
    const ob = aroObligations.find(o => o.id === selectedObligation);
    const htmlContent = sections.map(s => `<h2>${s.title}</h2><div>${s.content.replace(/\n/g, "<br/>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</div>`).join("<hr/>");
    const blob = new Blob([`<html><head><meta charset="utf-8"><title>ARO Justification — ${ob?.name}</title><style>body{font-family:Calibri,sans-serif;padding:40px;font-size:11pt;color:#1a1a2e}h2{font-size:13pt;color:#2a7d8a;border-bottom:1px solid #ddd;padding-bottom:4px}table{border-collapse:collapse;width:100%;font-size:10pt}th,td{border:1px solid #ddd;padding:6px 8px;text-align:left}th{background:#f1f5f9}.footer{margin-top:30px;font-size:9pt;color:#999;text-align:center}</style></head><body><h1>ARO Audit Justification</h1><p><strong>Obligation:</strong> ${ob?.name} (${selectedObligation})</p><p><strong>Generated:</strong> ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p><p><strong>Type:</strong> ${NARRATIVE_TYPE_LABELS[narrativeType]}</p><hr/>${htmlContent}<div class="footer">Environmental Obligation Management Platform — Confidential — AI-Generated Document</div></body></html>`], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `aro-justification-${selectedObligation}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Controls Row */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1 flex-1 min-w-[200px]">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">ARO Obligation</label>
              <Select value={selectedObligation} onValueChange={setSelectedObligation}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select an ARO obligation…" />
                </SelectTrigger>
                <SelectContent>
                  {aroObligations.map(o => (
                    <SelectItem key={o.id} value={o.id} className="text-xs">
                      <span className="font-medium">{o.name}</span>
                      <span className="text-muted-foreground ml-2">— {o.siteName} ({formatCurrency(o.currentLiability)})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 min-w-[220px]">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Narrative Type</label>
              <Select value={narrativeType} onValueChange={(v) => setNarrativeType(v as NarrativeType)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(NARRATIVE_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key} className="text-xs">{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              size="sm"
              className="h-9 gap-1.5"
              onClick={handleGenerate}
              disabled={!selectedObligation || isGenerating}
            >
              {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BrainCircuit className="h-3.5 w-3.5" />}
              Generate Audit Justification
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* Main Narrative Preview */}
        <div className="space-y-4">
          {sections.length === 0 && !isGenerating ? (
            <Card className="border-dashed">
              <CardContent className="py-16 flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                  <BookOpen className="h-8 w-8" />
                </div>
                <h3 className="text-sm font-semibold mb-1">AI ARO Justification Engine</h3>
                <p className="text-xs text-muted-foreground max-w-md">
                  Select an ARO obligation and narrative type above, then click "Generate Audit Justification" to create
                  audit-ready documentation with full financial rationale, assumption traceability, and regulatory disclosure drafts.
                </p>
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  {Object.values(NARRATIVE_TYPE_LABELS).map(label => (
                    <Badge key={label} variant="secondary" className="text-[10px]">{label}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Export Bar */}
              {narrative && (
                <div className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-2.5 border">
                  <div className="flex items-center gap-2 text-xs">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span className="font-medium">
                      {NARRATIVE_TYPE_LABELS[narrative.narrativeType]}
                    </span>
                    <span className="text-muted-foreground">
                      — v{narrative.version} • Generated {narrative.generatedAt.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={handleExportPDF}>
                      <Download className="h-3 w-3" /> PDF
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={handleExportWord}>
                      <FileText className="h-3 w-3" /> Word
                    </Button>
                  </div>
                </div>
              )}

              {/* Sections */}
              {sections.map((section, idx) => (
                <Card key={section.id} className="overflow-hidden">
                  <CardHeader className="pb-2 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        {section.title}
                      </CardTitle>
                      {section.sourceReferences.length > 0 && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className="text-[9px] gap-1 cursor-help">
                              <BookOpen className="h-2.5 w-2.5" />
                              {section.sourceReferences.length} sources
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="max-w-xs">
                            <p className="text-[11px] font-medium mb-1">Source Data References</p>
                            {section.sourceReferences.map((ref, i) => (
                              <p key={i} className="text-[10px] text-muted-foreground">
                                <span className="font-medium">{ref.module}</span>: {ref.field} = {ref.value}
                              </p>
                            ))}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-3">
                    <div className="prose prose-sm max-w-none dark:prose-invert text-[13px] leading-relaxed [&_h2]:text-[13px] [&_h2]:font-semibold [&_table]:text-[11px] [&_table]:border-collapse [&_th]:bg-muted/50 [&_th]:px-2 [&_th]:py-1.5 [&_th]:border [&_th]:border-border [&_th]:text-left [&_td]:px-2 [&_td]:py-1.5 [&_td]:border [&_td]:border-border [&_p]:my-1.5 [&_ul]:my-1 [&_li]:my-0.5">
                      <ReactMarkdown>{section.content}</ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {isGenerating && (
                <Card className="border-dashed border-primary/30">
                  <CardContent className="py-8 flex items-center justify-center gap-2 text-primary">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm font-medium">Generating next section…</span>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        {/* Right Panel: Checklist + History */}
        <div className="space-y-4">
          {/* Audit Prep Checklist */}
          {narrative?.auditPrepChecklist && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium flex items-center gap-1.5">
                  <ClipboardCheck className="h-3.5 w-3.5 text-primary" />
                  Audit Prep Checklist
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {narrative.auditPrepChecklist.map((item, i) => {
                  const iconInfo = CHECKLIST_ICONS[item.status];
                  const Icon = iconInfo.icon;
                  return (
                    <div key={i} className="flex items-start gap-2 py-1.5 border-b last:border-0">
                      <Icon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${iconInfo.color}`} />
                      <div>
                        <p className="text-[11px] font-medium">{item.item}</p>
                        <p className="text-[10px] text-muted-foreground">{item.detail}</p>
                      </div>
                    </div>
                  );
                })}
                <Separator className="my-2" />
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">
                    {narrative.auditPrepChecklist.filter(i => i.status === "complete").length}/{narrative.auditPrepChecklist.length} complete
                  </span>
                  <span className={`font-medium ${narrative.auditPrepChecklist.some(i => i.status === "missing") ? "text-destructive" : "text-chart-success"}`}>
                    {narrative.auditPrepChecklist.some(i => i.status === "missing") ? "Action Required" : "Audit Ready"}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Generation History */}
          {generationHistory.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5 text-muted-foreground" />
                  Generation History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[300px]">
                  <div className="space-y-2">
                    {generationHistory.map((h, i) => (
                      <div key={h.id} className={`text-[11px] py-1.5 ${i > 0 ? "border-t" : ""}`}>
                        <p className="font-medium">{h.obligationName}</p>
                        <p className="text-muted-foreground">{NARRATIVE_TYPE_LABELS[h.type]}</p>
                        <p className="text-[10px] text-muted-foreground">{h.timestamp.toLocaleTimeString()}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Info Card */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-start gap-2">
                <BrainCircuit className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] font-medium">Audit-Ready by Design</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    All narratives are generated from structured system data with full source traceability.
                    No values are fabricated. Hover over source badges to verify data origin.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
