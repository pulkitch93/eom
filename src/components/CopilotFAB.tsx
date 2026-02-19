import { useState } from "react";
import { BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CopilotPanel } from "@/components/CopilotPanel";

export function CopilotFAB() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow bg-primary text-primary-foreground"
            onClick={() => setOpen(true)}
          >
            <BrainCircuit className="h-6 w-6" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>EOM Intelligence Copilot</p>
        </TooltipContent>
      </Tooltip>
      <CopilotPanel open={open} onOpenChange={setOpen} />
    </>
  );
}
