import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  BrainCircuit,
  Send,
  Sparkles,
  Building2,
  FolderKanban,
  Landmark,
  Globe,
  RotateCcw,
  Loader2,
} from "lucide-react";
import {
  type CopilotMessage,
  type CopilotView,
  getSuggestedPrompts,
  getContextForRoute,
  generateCopilotResponse,
} from "@/lib/copilot-engine";
import ReactMarkdown from "react-markdown";

const VIEW_OPTIONS: { value: CopilotView; label: string; icon: React.ElementType }[] = [
  { value: "portfolio", label: "Portfolio", icon: Globe },
  { value: "site", label: "Site", icon: Building2 },
  { value: "project", label: "Project", icon: FolderKanban },
  { value: "aro", label: "ARO", icon: Landmark },
];

interface CopilotPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CopilotPanel({ open, onOpenChange }: CopilotPanelProps) {
  const location = useLocation();
  const context = getContextForRoute(location.pathname);
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeView, setActiveView] = useState<CopilotView>("portfolio");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const suggestedPrompts = getSuggestedPrompts(context);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async (text?: string) => {
    const query = text || input.trim();
    if (!query || isStreaming) return;
    setInput("");

    const userMsg: CopilotMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: query,
      timestamp: new Date(),
      view: activeView,
    };
    setMessages(prev => [...prev, userMsg]);
    setIsStreaming(true);

    const assistantId = crypto.randomUUID();
    let accumulated = "";
    setMessages(prev => [
      ...prev,
      { id: assistantId, role: "assistant", content: "", timestamp: new Date(), view: activeView },
    ]);

    await generateCopilotResponse(query, activeView, context, (chunk) => {
      accumulated += chunk;
      setMessages(prev =>
        prev.map(m => (m.id === assistantId ? { ...m, content: accumulated } : m))
      );
    });

    setIsStreaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([]);
    setInput("");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[520px] p-0 flex flex-col gap-0 bg-background"
      >
        {/* Header */}
        <SheetHeader className="px-5 pt-5 pb-3 border-b space-y-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <div>
                <SheetTitle className="text-base">EOM Intelligence</SheetTitle>
                <p className="text-[11px] text-muted-foreground">AI-Powered Environmental Financial Copilot</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleReset} className="h-8 w-8">
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
          {/* View Switcher */}
          <div className="flex gap-1.5 mt-3">
            {VIEW_OPTIONS.map(v => (
              <Button
                key={v.value}
                size="sm"
                variant={activeView === v.value ? "default" : "outline"}
                className="h-7 text-[11px] px-2.5 gap-1"
                onClick={() => setActiveView(v.value)}
              >
                <v.icon className="h-3 w-3" />
                {v.label}
              </Button>
            ))}
          </div>
        </SheetHeader>

        {/* Messages */}
        <ScrollArea ref={scrollRef} className="flex-1 min-h-0">
          <div className="px-5 py-4 space-y-4">
            {messages.length === 0 ? (
              <div className="space-y-4">
                <div className="text-center py-6">
                  <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
                    <Sparkles className="h-7 w-7" />
                  </div>
                  <h3 className="text-sm font-semibold mb-1">Environmental Obligation Intelligence</h3>
                  <p className="text-xs text-muted-foreground max-w-[300px] mx-auto">
                    CFO-grade analysis across your entire environmental liability portfolio. Ask about risk, forecasts, variances, or compliance.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide px-1">Suggested Prompts</p>
                  {suggestedPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(prompt.text)}
                      className="w-full text-left px-3 py-2.5 rounded-lg border border-border/60 hover:bg-accent/50 hover:border-primary/30 transition-colors group"
                    >
                      <div className="flex items-start gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-medium group-hover:text-primary transition-colors">{prompt.text}</p>
                          <Badge variant="secondary" className="mt-1 text-[9px] h-4 px-1.5">{prompt.category}</Badge>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[90%] rounded-xl px-3.5 py-2.5 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/60 border border-border/40"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <p className="text-[13px]">{msg.content}</p>
                    ) : msg.content ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert text-[13px] leading-relaxed [&_h2]:text-[13px] [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1.5 [&_h2]:first:mt-0 [&_ul]:my-1 [&_li]:my-0.5 [&_p]:my-1">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span className="text-xs">Analyzing...</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {isStreaming && messages[messages.length - 1]?.content && (
              <div className="flex items-center gap-1.5 text-muted-foreground px-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="text-[11px]">Generating response...</span>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t px-4 py-3">
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              placeholder="Ask about liabilities, risk, forecasts, compliance..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[44px] max-h-[120px] resize-none text-[13px] py-2.5"
              rows={1}
              disabled={isStreaming}
            />
            <Button
              size="icon"
              className="shrink-0 h-[44px] w-[44px]"
              onClick={() => handleSend()}
              disabled={!input.trim() || isStreaming}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
            EOM Intelligence • Simulated AI • Context: {context.charAt(0).toUpperCase() + context.slice(1)} • {activeView.charAt(0).toUpperCase() + activeView.slice(1)} View
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
