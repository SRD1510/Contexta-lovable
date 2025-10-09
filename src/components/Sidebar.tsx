import { motion, AnimatePresence } from "framer-motion";
import { MessageSquarePlus, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Conversation } from "@/types";
import { cn } from "@/lib/utils";
import { ContextControls } from "@/components/ContextControls";

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
}: SidebarProps) {
  const conversationList = Object.values(conversations).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <motion.aside
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="flex h-screen w-80 flex-col border-r border-sidebar-border bg-sidebar"
    >
      <div className="space-y-4 border-b border-sidebar-border p-4">
        <Button
          onClick={onNewConversation}
          className="w-full gradient-primary transition-transform hover:scale-105 active:scale-95"
        >
          <MessageSquarePlus className="mr-2 h-4 w-4" />
          New Conversation
        </Button>

        <ContextControls
          activeConversation={activeConversation}
          onSummarize={onSummarize}
          onStartFresh={onStartFresh}
          onExport={onExport}
          disabled={disabled}
        />
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          <AnimatePresence mode="popLayout">
            {conversationList.map((conversation) => (
              <motion.div
                key={conversation.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "group relative rounded-lg p-3 transition-smooth cursor-pointer",
                  activeId === conversation.id
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow"
                    : "hover:bg-sidebar-accent"
                )}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className="pr-8">
                  <h3 className="truncate font-medium">{conversation.title}</h3>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(conversation.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {conversation.messages.length} messages • {conversation.total_tokens} tokens
                  </div>
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-2 top-2 h-8 w-8 opacity-0 transition-opacity hover:bg-destructive hover:text-destructive-foreground group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conversation.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                {conversation.summary && (
                  <div className="mt-2 rounded bg-primary/10 px-2 py-1 text-xs text-primary">
                    Has summary
                  </div>
                )}
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
