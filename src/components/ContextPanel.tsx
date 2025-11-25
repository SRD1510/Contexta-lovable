import { motion } from "framer-motion";
import { FileText, RefreshCw, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Conversation } from "@/types";
import { MODEL_CONFIGS } from "@/services/api";
import { cn } from "@/lib/utils";

interface ContextPanelProps {
  conversation: Conversation | null;
  onSummarize: () => void;
  onStartFresh: () => void;
  onExport: () => void;
  disabled: boolean;
}

export function ContextPanel({
  conversation,
  onSummarize,
  onStartFresh,
  onExport,
  disabled,
}: ContextPanelProps) {
  if (!conversation) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-t border-border bg-card p-6"
      >
        <div className="mx-auto max-w-4xl text-center text-muted-foreground">
          <p>No active conversation</p>
        </div>
      </motion.div>
    );
  }

  const config = MODEL_CONFIGS[conversation.metadata.model];
  const contextWindow = config?.contextWindow || 8192;
  const usagePercent = (conversation.total_tokens / contextWindow) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-t border-border bg-card p-6"
    >
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Context Usage</span>
            <span className="font-medium">
              {conversation.total_tokens.toLocaleString()} /{" "}
              {contextWindow.toLocaleString()} tokens
            </span>
          </div>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ transformOrigin: "left" }}
          >
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full transition-all duration-300",
                  usagePercent > 90
                    ? "bg-destructive"
                    : usagePercent > 70
                    ? "bg-yellow-500"
                    : "bg-primary"
                )}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
          </motion.div>
          <p className="text-xs text-muted-foreground">
            {usagePercent.toFixed(1)}% of context window used
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSummarize}
            disabled={disabled || conversation.messages.length === 0}
            className="transition-transform hover:scale-105 active:scale-95 text-xs"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            Summarize
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onStartFresh}
            disabled={disabled || !conversation.summary}
            className="transition-transform hover:scale-105 active:scale-95 text-xs"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Fresh Start
          </Button>

          <Button
            variant="outline"
            onClick={onExport}
            disabled={conversation.messages.length === 0}
            className="transition-transform hover:scale-105 active:scale-95 w-full text-xs"
          >
            <Download className="w-3 h-3 mr-1" />
            Export
          </Button>
        </div>

        {conversation.summary && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="rounded-lg border border-border bg-muted p-4"
          >
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4 text-primary" />
              Current Summary
            </div>
            <p className="text-sm text-muted-foreground">
              {conversation.summary}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
