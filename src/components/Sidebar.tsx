import { motion, AnimatePresence } from "framer-motion";
import { MessageSquarePlus, Trash2, Calendar, Sparkles, RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Conversation } from "@/types";
import { getContextUsage } from "@/services/tokenCounter";
import { ContextUsagePanel } from "./ContextUsagePanel";
import { cn } from "@/lib/utils";

interface SidebarProps {
  conversations: Record<string, Conversation>;
  activeId: string | null;
  activeConversation: Conversation | null;
  onNewConversation: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onSummarize: () => void;
  onStartFresh: () => void;
  onExport: () => void;
  disabled: boolean;
  currentModel: string;
  lastAutoSummary: { timestamp: string; tokensSaved: number } | null;
}

export function Sidebar({
  conversations,
  activeId,
  activeConversation,
  onNewConversation,
  onSelectConversation,
  onDeleteConversation,
  onSummarize,
  onStartFresh,
  onExport,
  disabled,
  currentModel,
  lastAutoSummary,
}: SidebarProps) {
  const conversationList = Object.values(conversations).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const contextUsage = activeConversation
    ? getContextUsage(activeConversation.messages, currentModel)
    : null;

  return (
    <motion.aside
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="hidden md:flex h-screen w-80 flex-col border-r border-sidebar-border bg-sidebar flex-shrink-0"
    >
      <div className="space-y-4 border-b border-sidebar-border p-4">
        <Button
          onClick={onNewConversation}
          className="w-full gradient-primary transition-transform hover:scale-105 active:scale-95"
        >
          <MessageSquarePlus className="mr-2 h-4 w-4" />
          New Conversation
        </Button>

        {activeConversation && contextUsage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <ContextUsagePanel
              totalTokens={contextUsage.totalTokens}
              contextWindow={contextUsage.contextWindow}
              usagePercent={contextUsage.usagePercent}
              state={contextUsage.state}
              lastSummarizedAt={lastAutoSummary?.timestamp}
              tokensSaved={lastAutoSummary?.tokensSaved}
            />

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onSummarize}
                disabled={disabled || activeConversation.messages.length === 0}
                className="transition-transform hover:scale-105 active:scale-95"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Summarize
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onStartFresh}
                disabled={disabled || !activeConversation.summary}
                className="transition-transform hover:scale-105 active:scale-95"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Start Fresh
              </Button>
            </div>

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
          </motion.div>
        )}
      </div>

      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="space-y-2 p-2">
          <AnimatePresence>
            {conversationList.map((conversation) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  "group relative rounded-lg p-3 transition-all cursor-pointer",
                  activeId === conversation.id
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow"
                    : "hover:bg-sidebar-accent"
                )}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className="pr-10 flex flex-col gap-1">
                  <h3 className="truncate font-medium leading-tight">{conversation.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 shrink-0" />
                    <span className="truncate">{new Date(conversation.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {conversation.messages.length} messages • {conversation.total_tokens} tokens
                  </div>
                  {conversation.summary && (
                    <div className="mt-1 rounded bg-primary/10 px-2 py-1 text-xs text-primary w-fit">
                      Has summary
                    </div>
                  )}
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-2 top-2 h-8 w-8 z-10 opacity-0 transition-all duration-200 hover:bg-destructive hover:text-destructive-foreground group-hover:opacity-100 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conversation.id);
                  }}
                  aria-label="Delete conversation"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>

          {conversationList.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 text-center text-muted-foreground"
            >
              <p>No conversations yet.</p>
              <p className="mt-1 text-sm">Start a new one!</p>
            </motion.div>
          )}
        </div>
      </ScrollArea>
    </motion.aside>
  );
}
