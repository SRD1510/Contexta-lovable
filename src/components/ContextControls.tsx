import { motion } from "framer-motion";
import { Sparkles, RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Conversation } from "@/types";
import { MODEL_CONFIGS } from "@/services/api";
import { cn } from "@/lib/utils";

interface ContextControlsProps {
  activeConversation: Conversation | null;
  onSummarize: () => void;
  onStartFresh: () => void;
  onExport: () => void;
  disabled: boolean;
  compact?: boolean;
}

export function ContextControls({
  activeConversation,
  onSummarize,
  onStartFresh,
  onExport,
  disabled,
  compact = false,
}: ContextControlsProps) {
  if (!activeConversation) return null;

  const config = MODEL_CONFIGS[activeConversation.metadata.model];
  const contextWindow = config?.contextWindow || 8192;
  const totalTokens = activeConversation.total_tokens;
  const usagePercent = (totalTokens / contextWindow) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: compact ? -10 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("space-y-3", compact && "flex items-center gap-2")}
    >
      {!compact && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-sidebar-foreground">Token Usage</span>
            <span className="font-medium text-sidebar-foreground">
              {totalTokens.toLocaleString()} / {contextWindow.toLocaleString()}
            </span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-sidebar-accent">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(usagePercent, 100)}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={cn(
                "h-full transition-colors duration-300",
                usagePercent > 90
                  ? "bg-destructive"
                  : usagePercent > 70
                    ? "bg-yellow-500"
                    : "bg-primary"
              )}
            />
          </div>
        </div>
      )}

      <div className={cn(compact ? "flex gap-2" : "grid grid-cols-2 gap-2")}>
        <Button
          variant="outline"
          size="sm"
          onClick={onSummarize}
          disabled={disabled || activeConversation.messages.length === 0}
          className="transition-transform hover:scale-105 active:scale-95"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {!compact && "Summarize"}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onStartFresh}
          disabled={disabled || !activeConversation.summary}
          className="transition-transform hover:scale-105 active:scale-95"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          {!compact && "Start Fresh"}
        </Button>
      </div>

      {!compact && (
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          disabled={activeConversation.messages.length === 0}
          className="w-full transition-transform hover:scale-105 active:scale-95"
        >
          <Download className="mr-2 h-4 w-4" />
          Export JSON
        </Button>
      )}

      {compact && (
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          disabled={activeConversation.messages.length === 0}
          className="transition-transform hover:scale-105 active:scale-95"
        >
          <Download className="h-4 w-4" />
        </Button>
      )}
    </motion.div>
  );
}
