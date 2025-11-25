import { useState } from "react";
import { MessageSquare, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Conversation } from "@/types";
import { cn } from "@/lib/utils";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

interface RecentChatsDropdownProps {
  conversations: Record<string, Conversation>;
  activeId: string | null;
  onSelectConversation: (id: string) => void;
}

export function RecentChatsDropdown({
  conversations,
  activeId,
  onSelectConversation,
}: RecentChatsDropdownProps) {
  const conversationList = Object.values(conversations)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 7);

  console.log(
    "📋 RecentChatsDropdown - showing",
    conversationList.length,
    "conversations"
  );

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <span>Recent Chats</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={8}
          className="z-50 w-80 rounded-lg border bg-popover p-2 shadow-lg"
        >
          {conversationList.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No conversations yet
            </div>
          ) : (
            conversationList.map((conv) => (
              <DropdownMenu.Item
                key={conv.id}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-md p-3 outline-none transition-colors hover:bg-accent",
                  activeId === conv.id && "bg-accent"
                )}
                onClick={() => {
                  console.log("📂 Recent chat selected:", conv.id);
                  onSelectConversation(conv.id);
                }}
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {conv.title
                    .split(" ")
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{conv.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {conv.messages.length} messages • {conv.total_tokens} tokens
                  </p>
                </div>
              </DropdownMenu.Item>
            ))
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
export default RecentChatsDropdown;
