import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Loader2, ChevronDown, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ContextControls } from "@/components/ContextControls";
import { Conversation } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { estimateTokens, MODEL_CONFIGS } from "@/services/api";

interface InputBoxProps {
  onSend: (message: string) => void;
  disabled: boolean;
  isLoading: boolean;
  currentModel: string;
  onModelChange: (model: string) => void;
  hasMessages: boolean;
  sidebarCollapsed: boolean;
  activeConversation: Conversation | null;
  onSummarize: () => void;
  onStartFresh: () => void;
  onExport: () => void;
}

export function InputBox({ 
  onSend, 
  disabled, 
  isLoading, 
  currentModel, 
  onModelChange, 
  hasMessages,
  sidebarCollapsed,
  activeConversation,
  onSummarize,
  onStartFresh,
  onExport,
}: InputBoxProps) {
  const [input, setInput] = useState("");
  const [pendingModel, setPendingModel] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);

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

  const handleModelSelect = (model: string) => {
    if (hasMessages && model !== currentModel) {
      setPendingModel(model);
      setShowWarning(true);
    } else {
      onModelChange(model);
    }
  };

  const confirmModelChange = () => {
    if (pendingModel) {
      onModelChange(pendingModel);
    }
    setShowWarning(false);
    setPendingModel(null);
  };

  const cancelModelChange = () => {
    setShowWarning(false);
    setPendingModel(null);
  };

  return (
    <>
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-t border-border bg-background p-6"
        onSubmit={handleSubmit}
      >
        <div className="mx-auto max-w-4xl space-y-3">
          {sidebarCollapsed && (
            <div className="pb-2 border-b border-border">
              <ContextControls
                activeConversation={activeConversation}
                onSummarize={onSummarize}
                onStartFresh={onStartFresh}
                onExport={onExport}
                disabled={disabled}
                compact
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <Select value={currentModel} onValueChange={handleModelSelect}>
              <SelectTrigger className="w-auto min-w-[200px] transition-all hover:border-primary focus:shadow-glow">
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-gradient-primary" />
                  <SelectValue />
                </div>
                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {Object.entries(MODEL_CONFIGS).map(([id, config]) => (
                  <SelectItem key={id} value={id} className="cursor-pointer">
                    <div className="flex items-center justify-between gap-4">
                      <span>{config.name}</span>
                      <span className="text-xs text-muted-foreground">{config.provider}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative flex-1">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message... (Shift+Enter for new line)"
                disabled={disabled}
                className="min-h-[60px] resize-none pr-12 transition-all focus:shadow-glow focus:ring-2 focus:ring-primary"
              />
              <Button
                type="submit"
                size="icon"
                disabled={disabled || !input.trim()}
                className="absolute bottom-2 right-2 transition-transform hover:scale-110 active:scale-95"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
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

      <Dialog open={showWarning} onOpenChange={setShowWarning}>
        <DialogContent className="border-destructive bg-card">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <DialogTitle>Switch Model Mid-Conversation?</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              You're about to switch from{" "}
              <span className="font-semibold text-foreground">
                {MODEL_CONFIGS[currentModel]?.name}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-foreground">
                {pendingModel && MODEL_CONFIGS[pendingModel]?.name}
              </span>
              .
              <br />
              <br />
              Different models may have different response styles, capabilities, and context
              handling. Your conversation history will be sent to the new model, but responses may
              vary.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelModelChange}>
              Cancel
            </Button>
            <Button onClick={confirmModelChange} className="gradient-primary">
              Switch Model
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
