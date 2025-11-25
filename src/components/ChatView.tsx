import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "./Message";
import { Message as MessageType } from "@/types";

interface ChatViewProps {
  messages: MessageType[];
  onEditMessage?: (messageId: string, newContent: string) => void;
}

export function ChatView({ messages, onEditMessage }: ChatViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <ScrollArea className="flex-1" ref={scrollRef}>
      <div className="mx-auto max-w-5xl py-8">
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex h-full flex-col items-center justify-center gap-6 px-6 py-24 text-center"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">
                Context Manager
              </h2>
              <p className="text-lg text-muted-foreground">
                Your intelligent multi-model AI assistant
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Multi-Model Support",
                  description:
                    "Switch between GPT-4, Claude, and Gemini seamlessly",
                },
                {
                  title: "Context Management",
                  description:
                    "Track token usage and manage conversation context",
                },
                {
                  title: "Export & Summary",
                  description: "Save conversations and generate summaries",
                },
              ].map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-lg border border-border bg-card p-6 shadow-card transition-smooth hover:border-primary hover:shadow-glow"
                >
                  <h3 className="mb-2 font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              Start a conversation by typing a message below
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <Message
                key={message.id}
                message={message}
                isGenerating={
                  index === messages.length - 1 && message.role === "assistant"
                }
                onEditMessage={onEditMessage}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </ScrollArea>
  );
}
