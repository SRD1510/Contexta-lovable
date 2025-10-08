import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { estimateTokens } from "@/services/api";

interface InputBoxProps {
  onSend: (message: string) => void;
  disabled: boolean;
  isLoading: boolean;
}

export function InputBox({ onSend, disabled, isLoading }: InputBoxProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const tokenCount = estimateTokens(input);

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-t border-border bg-background p-6"
      onSubmit={handleSubmit}
    >
      <div className="mx-auto max-w-4xl space-y-2">
        <div className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Shift+Enter for new line)"
            disabled={disabled}
            className="min-h-[100px] resize-none pr-12 transition-all focus:shadow-glow focus:ring-2 focus:ring-primary"
          />
          <Button
            type="submit"
            size="icon"
            disabled={disabled || !input.trim()}
            className="absolute bottom-3 right-3 transition-transform hover:scale-110 active:scale-95"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Estimated tokens: ~{tokenCount}</span>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-primary"
            >
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Thinking
              </motion.span>
              <motion.div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  >
                    •
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.form>
  );
}
