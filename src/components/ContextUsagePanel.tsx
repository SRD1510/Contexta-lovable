import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContextUsagePanelProps {
  totalTokens: number;
  contextWindow: number;
  usagePercent: number;
  state: "healthy" | "warning" | "critical" | "danger";
  lastSummarizedAt?: string;
  tokensSaved?: number;
}

export function ContextUsagePanel({
  totalTokens,
  contextWindow,
  usagePercent,
  state,
  lastSummarizedAt,
  tokensSaved,
}: ContextUsagePanelProps) {
  const stateConfig = {
    healthy: {
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500",
      message: "Context healthy",
    },
    warning: {
      icon: AlertTriangle,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500",
      message: "Consider summarizing soon",
    },
    critical: {
      icon: AlertCircle,
      color: "text-orange-500",
      bgColor: "bg-orange-500",
      message: "Summarization recommended",
    },
    danger: {
      icon: XCircle,
      color: "text-red-500",
      bgColor: "bg-red-500",
      message: "Critical: Context nearly full",
    },
  };

  const config = stateConfig[state];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3 rounded-lg border border-border bg-card p-4"
    >
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-muted-foreground">Token Usage</span>
        <div className={cn("flex items-center gap-2", config.color)}>
          <Icon className="h-4 w-4" />
          <span className="font-medium">
            {totalTokens.toLocaleString()} / {contextWindow.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(usagePercent, 100)}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={cn("h-full transition-colors", config.bgColor)}
          />
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className={config.color}>{config.message}</span>
          <span className="text-muted-foreground">
            {usagePercent.toFixed(1)}%
          </span>
        </div>
      </div>

      {lastSummarizedAt && tokensSaved && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="border-t border-border pt-3 text-xs text-muted-foreground"
        >
          <div className="flex items-center justify-between">
            <span>💡 Auto-summarized {getTimeAgo(lastSummarizedAt)}</span>
            <span className="font-medium text-green-500">
              Saved {tokensSaved.toLocaleString()} tokens
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function getTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}
