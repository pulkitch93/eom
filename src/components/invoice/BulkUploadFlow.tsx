import { useState, useEffect } from "react";
import { Upload, FolderOpen, FileArchive, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { processingSteps, type ProcessingStatus } from "@/data/invoice-mock-data";

interface SimulatedFile {
  name: string;
  size: string;
  status: ProcessingStatus;
  progress: number;
}

const demoFiles: SimulatedFile[] = [
  { name: "Acme_Invoice_Q4_2025.pdf", size: "2.1 MB", status: "received", progress: 0 },
  { name: "GreenTech_Remediation_Dec.pdf", size: "3.4 MB", status: "received", progress: 0 },
  { name: "PacificDecom_WO_2025.pdf", size: "1.8 MB", status: "received", progress: 0 },
  { name: "TerraClean_Pipeline_Invoice.pdf", size: "5.2 MB", status: "received", progress: 0 },
  { name: "EcoRestore_Settlement_Jan.pdf", size: "0.9 MB", status: "received", progress: 0 },
];

export function BulkUploadFlow() {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<SimulatedFile[]>([]);
  const [showUploadArea, setShowUploadArea] = useState(true);

  const stepIndex = (s: ProcessingStatus) => processingSteps.findIndex((p) => p.status === s);

  const simulateProcessing = () => {
    setShowUploadArea(false);
    setUploading(true);
    setFiles(demoFiles.map((f) => ({ ...f, status: "received" as ProcessingStatus, progress: 0 })));

    const statuses: ProcessingStatus[] = ["received", "ocr_complete", "fields_extracted", "candidates_generated", "scored", "ready_for_review"];

    demoFiles.forEach((_, fileIdx) => {
      statuses.forEach((status, statusIdx) => {
        setTimeout(() => {
          setFiles((prev) =>
            prev.map((f, i) =>
              i === fileIdx
                ? { ...f, status, progress: Math.round(((statusIdx + 1) / statuses.length) * 100) }
                : f
            )
          );
          if (fileIdx === demoFiles.length - 1 && statusIdx === statuses.length - 1) {
            setTimeout(() => setUploading(false), 500);
          }
        }, fileIdx * 800 + statusIdx * 400 + 300);
      });
    });
  };

  return (
    <div className="space-y-6">
      {showUploadArea && (
        <Card className="border-dashed border-2 border-primary/30 bg-accent/20">
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Upload className="h-10 w-10 text-primary/60" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Upload Invoice Documents</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Drag & drop PDFs here, or use the buttons below. Supports folder upload, multi-select, and ZIP archives.
            </p>
            <div className="flex gap-3 flex-wrap justify-center">
              <Button variant="outline" onClick={simulateProcessing} className="gap-2">
                <FolderOpen className="h-4 w-4" /> Upload Folder
              </Button>
              <Button variant="outline" onClick={simulateProcessing} className="gap-2">
                <Upload className="h-4 w-4" /> Select Files
              </Button>
              <Button variant="outline" onClick={simulateProcessing} className="gap-2">
                <FileArchive className="h-4 w-4" /> Upload ZIP
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {files.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">AI Processing Pipeline</CardTitle>
              {!uploading && (
                <Button size="sm" variant="ghost" onClick={() => { setFiles([]); setShowUploadArea(true); }}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {/* Pipeline legend */}
            <div className="flex items-center gap-1 flex-wrap mt-2">
              {processingSteps.map((step, i) => (
                <div key={step.status} className="flex items-center gap-1">
                  <span className="text-xs">{step.icon}</span>
                  <span className="text-[10px] text-muted-foreground">{step.label}</span>
                  {i < processingSteps.length - 1 && <span className="text-muted-foreground/40 mx-1">→</span>}
                </div>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {files.map((file, idx) => {
              const currentStepIdx = stepIndex(file.status);
              const isComplete = file.status === "ready_for_review";
              return (
                <div key={idx} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate max-w-[240px]">{file.name}</span>
                      <span className="text-xs text-muted-foreground">{file.size}</span>
                    </div>
                    <Badge variant={isComplete ? "default" : "secondary"} className={isComplete ? "bg-green-600" : ""}>
                      {isComplete ? "✅ Ready" : (
                        <span className="flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          {processingSteps[currentStepIdx]?.label}
                        </span>
                      )}
                    </Badge>
                  </div>
                  <Progress value={file.progress} className="h-1.5" />
                  <div className="flex gap-1">
                    {processingSteps.map((step, i) => (
                      <div
                        key={step.status}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i <= currentStepIdx ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
