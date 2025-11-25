// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   CheckCircle,
//   AlertTriangle,
//   AlertCircle,
//   XCircle,
//   ChevronDown,
//   ChevronUp,
//   Sparkles,
//   RefreshCw,
//   Download,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Conversation } from "@/types";
// import { getContextUsage } from "@/services/tokenCounter";
// import { cn } from "@/lib/utils";
// import * as Popover from "@radix-ui/react-popover";

// interface CompactContextPanelProps {
//   conversation: Conversation;
//   currentModel: string;
//   lastAutoSummary: { timestamp: string; tokensSaved: number } | null;
//   disabled: boolean;
//   onSummarize: () => void;
//   onStartFresh: () => void;
//   onExport: () => void;
// }

// export function CompactContextPanel({
//   conversation,
//   currentModel,
//   lastAutoSummary,
//   disabled,
//   onSummarize,
//   onStartFresh,
//   onExport,
// }: CompactContextPanelProps) {
//   const [isExpanded, setIsExpanded] = useState(false);

//   const contextUsage = getContextUsage(conversation.messages, currentModel);

//   const stateConfig = {
//     healthy: {
//       icon: CheckCircle,
//       color: "text-green-500",
//       bgColor: "bg-green-500",
//     },
//     warning: {
//       icon: AlertTriangle,
//       color: "text-yellow-500",
//       bgColor: "bg-yellow-500",
//     },
//     critical: {
//       icon: AlertCircle,
//       color: "text-orange-500",
//       bgColor: "bg-orange-500",
//     },
//     danger: {
//       icon: XCircle,
//       color: "text-red-500",
//       bgColor: "bg-red-500",
//     },
//   };

//   const config = stateConfig[contextUsage.state];
//   const Icon = config.icon;

//   console.log("📊 CompactContextPanel - usage:", contextUsage);

//   return (
//     <Popover.Root open={isExpanded} onOpenChange={setIsExpanded}>
//       <Popover.Trigger asChild>
//         <Button
//           variant="outline"
//           size="sm"
//           className="flex items-center gap-2"
//           onClick={() => {
//             console.log("📊 Context panel clicked, isExpanded:", !isExpanded);
//             setIsExpanded(!isExpanded);
//           }}
//         >
//           <Icon className={cn("h-4 w-4", config.color)} />
//           <span className="text-sm font-medium">
//             {contextUsage.totalTokens.toLocaleString()} /{" "}
//             {contextUsage.contextWindow.toLocaleString()}
//           </span>
//           <span className={cn("text-xs", config.color)}>
//             {contextUsage.usagePercent.toFixed(1)}%
//           </span>
//           <ChevronDown
//             className={cn(
//               "h-4 w-4 transition-transform",
//               isExpanded && "rotate-180"
//             )}
//           />
//         </Button>
//       </Popover.Trigger>

//       <Popover.Portal>
//         <Popover.Content
//           align="end"
//           sideOffset={8}
//           className="z-50 w-80 rounded-lg border bg-popover p-4 shadow-lg"
//         >
//           <motion.div
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="space-y-4"
//           >
//             <div className="space-y-2">
//               <div className="flex items-center justify-between text-sm">
//                 <span className="font-medium text-muted-foreground">
//                   Token Usage
//                 </span>
//                 <div className={cn("flex items-center gap-2", config.color)}>
//                   <Icon className="h-4 w-4" />
//                   <span className="font-medium">
//                     {contextUsage.totalTokens.toLocaleString()} /{" "}
//                     {contextUsage.contextWindow.toLocaleString()}
//                   </span>
//                 </div>
//               </div>

//               <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
//                 <motion.div
//                   initial={{ width: 0 }}
//                   animate={{
//                     width: `${Math.min(contextUsage.usagePercent, 100)}%`,
//                   }}
//                   transition={{ duration: 0.5, ease: "easeOut" }}
//                   className={cn("h-full transition-colors", config.bgColor)}
//                 />
//               </div>

//               <p className="text-xs text-muted-foreground">
//                 {contextUsage.usagePercent.toFixed(1)}% of context window used
//               </p>
//             </div>

//             {lastAutoSummary && (
//               <div className="border-t border-border pt-3 text-xs text-muted-foreground">
//                 <div className="flex items-center justify-between">
//                   <span>💡 Last auto-summary</span>
//                   <span className="font-medium text-green-500">
//                     Saved {lastAutoSummary.tokensSaved.toLocaleString()} tokens
//                   </span>
//                 </div>
//               </div>
//             )}

//             <div className="grid grid-cols-3 gap-2">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => {
//                   console.log("✨ Summarize clicked from compact panel");
//                   onSummarize();
//                   setIsExpanded(false);
//                 }}
//                 disabled={disabled || conversation.messages.length === 0}
//               >
//                 <Sparkles className="mr-1 h-3 w-3" />
//                 Summarize
//               </Button>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => {
//                   console.log("🔄 Start Fresh clicked from compact panel");
//                   onStartFresh();
//                   setIsExpanded(false);
//                 }}
//                 disabled={disabled || !conversation.summary}
//               >
//                 <RefreshCw className="mr-1 h-3 w-3" />
//                 Fresh
//               </Button>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => {
//                   console.log("📥 Export clicked from compact panel");
//                   onExport();
//                   setIsExpanded(false);
//                 }}
//                 disabled={conversation.messages.length === 0}
//               >
//                 <Download className="mr-1 h-3 w-3" />
//                 Export
//               </Button>
//             </div>
//           </motion.div>
//         </Popover.Content>
//       </Popover.Portal>
//     </Popover.Root>
//   );
// }

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RefreshCw,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Conversation } from "@/types";
import { getContextUsage } from "@/services/tokenCounter";
import { cn } from "@/lib/utils";
import * as Popover from "@radix-ui/react-popover";

interface CompactContextPanelProps {
  conversation: Conversation;
  currentModel: string;
  lastAutoSummary: { timestamp: string; tokensSaved: number } | null;
  disabled: boolean;
  onSummarize: () => void;
  onStartFresh: () => void;
  onExport: () => void;
}

export function CompactContextPanel({
  conversation,
  currentModel,
  lastAutoSummary,
  disabled,
  onSummarize,
  onStartFresh,
  onExport,
}: CompactContextPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const contextUsageResult = getContextUsage(
    conversation.messages,
    currentModel
  );

  //Handle undefined or null result
  const contextUsage = contextUsageResult || {
    state: "healthy",
    totalTokens: 0,
    contextWindow: 0,
    usagePercent: 0,
  };

  const stateConfig = {
    healthy: {
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500",
    },
    warning: {
      icon: AlertTriangle,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500",
    },
    critical: {
      icon: AlertCircle,
      color: "text-orange-500",
      bgColor: "bg-orange-500",
    },
    danger: {
      icon: XCircle,
      color: "text-red-500",
      bgColor: "bg-red-500",
    },
  };

  //Safely get config, default to healthy if state is invalid
  const config = stateConfig[contextUsage.state] || stateConfig["healthy"];
  const Icon = config.icon;

  console.log("📊 CompactContextPanel - usage:", contextUsage);

  return (
    <Popover.Root open={isExpanded} onOpenChange={setIsExpanded}>
      <Popover.Trigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4", config.color)} />
          <span className="text-sm font-medium">
            {contextUsage.totalTokens.toLocaleString()} /{" "}
            {contextUsage.contextWindow.toLocaleString()}
          </span>
          <span className={cn("text-xs", config.color)}>
            {contextUsage.usagePercent.toFixed(1)}%
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              isExpanded && "rotate-180"
            )}
          />
        </Button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className="z-50 w-80 rounded-lg border bg-popover p-4 shadow-lg"
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-muted-foreground">
                  Token Usage
                </span>
                <div className={cn("flex items-center gap-2", config.color)}>
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">
                    {contextUsage.totalTokens.toLocaleString()} /{" "}
                    {contextUsage.contextWindow.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(contextUsage.usagePercent, 100)}%`,
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={cn("h-full transition-colors", config.bgColor)}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                {contextUsage.usagePercent.toFixed(1)}% of context window used
              </p>
            </div>

            {lastAutoSummary && (
              <div className="border-t border-border pt-3 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>💡 Last auto-summary</span>
                  <span className="font-medium text-green-500">
                    Saved {lastAutoSummary.tokensSaved.toLocaleString()} tokens
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-sm md:text-xs"
                onClick={() => {
                  console.log("✨ Summarize clicked from compact panel");
                  try {
                    onSummarize();
                  } catch (error) {
                    console.error("Error during summarize:", error);
                    // Display error message to user if appropriate
                  }
                  setIsExpanded(false);
                }}
                disabled={disabled || conversation.messages.length === 0}
              >
                <Sparkles className="mr-1 h-3 w-3" />
                Summarize
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-sm md:text-xs"
                onClick={() => {
                  console.log("🔄 Start Fresh clicked from compact panel");
                  try {
                    onStartFresh();
                  } catch (error) {
                    console.error("Error during start fresh:", error);
                    // Display error message to user if appropriate
                  }
                  setIsExpanded(false);
                }}
                disabled={disabled || !conversation.summary}
              >
                <RefreshCw className="mr-1 h-3 w-3" />
                Fresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs flex justify-center items-center col-span-2"
                onClick={() => {
                  console.log("📥 Export clicked from compact panel");
                  try {
                    onExport();
                  } catch (error) {
                    console.error("Error during export:", error);
                    // Display error message to user if appropriate
                  }
                  setIsExpanded(false);
                }}
                disabled={conversation.messages.length === 0}
              >
                <Download className="mr-1 h-3 w-3" />
                Export
              </Button>
            </div>
          </motion.div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
