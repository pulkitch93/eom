import { useState } from "react";
import { Upload, FileCheck, Search, BarChart3, Shield, Lightbulb, X, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const tourSteps = [
  { icon: <Upload className="h-8 w-8" />, title: "Upload PDFs", desc: "Drag & drop a folder of invoice PDFs, select multiple files, or upload a ZIP archive." },
  { icon: <Lightbulb className="h-8 w-8" />, title: "AI Processing", desc: "Watch AI extract invoice numbers, vendor names, amounts, dates, and PO numbers with confidence scores." },
  { icon: <FileCheck className="h-8 w-8" />, title: "Review Queue", desc: "Approve high-confidence matches with one click. Review medium-confidence and resolve exceptions." },
  { icon: <Search className="h-8 w-8" />, title: "Resolve Exceptions", desc: "Use match explanations and suggested candidates to assign unmatched documents." },
  { icon: <Shield className="h-8 w-8" />, title: "Export Audit Packet", desc: "Download complete audit packets with invoices, documents, matching metadata, and approval records." },
];

export function GuidedTour({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Getting Started</span>
            <span className="text-xs text-muted-foreground">Step {step + 1} of {tourSteps.length}</span>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose}><X className="h-3 w-3" /></Button>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-primary/60 shrink-0">{tourSteps[step].icon}</div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold">{tourSteps[step].title}</h4>
            <p className="text-xs text-muted-foreground">{tourSteps[step].desc}</p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-1">
            {tourSteps.map((_, i) => (
              <div key={i} className={`h-1.5 w-6 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>
              <ChevronLeft className="h-3 w-3" />
            </Button>
            {step < tourSteps.length - 1 ? (
              <Button size="sm" onClick={() => setStep(step + 1)} className="gap-1">
                Next <ChevronRight className="h-3 w-3" />
              </Button>
            ) : (
              <Button size="sm" onClick={onClose}>Done</Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
