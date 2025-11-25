import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Loader2,
  X,
  AlertTriangle,
  Mic,
  Square,
  Plus,
  CircleStop, // Changed from Paperclip for the "add" action
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

// Interface remains the same
interface InputBoxProps {
  onSend: (message: string, attachments?: File[]) => void;
  disabled: boolean;
  isLoading: boolean;
  currentModel: string;
  onModelChange: (model: string) => void;
  hasMessages: boolean;
  onStop: () => void;
}

export function InputBox({
  onSend,
  disabled,
  isLoading,
  currentModel,
  onModelChange,
  hasMessages,
  onStop,
}: InputBoxProps) {
  // All state and handlers remain the same
  const [input, setInput] = useState("");
  const [pendingModel, setPendingModel] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && attachments.length === 0) return;
    onSend(input.trim(), attachments);
    setInput("");
    setAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleModelSelect = (model: string) => {
    if (hasMessages && model !== currentModel) {
      setPendingModel(model);
      setShowWarning(true);
    } else {
      onModelChange(model);
    }
  };

  const confirmModelChange = () => {
    if (pendingModel) onModelChange(pendingModel);
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
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="w-full px-4 pb-4 bg-background flex justify-center "
      >
        {/* ✨ New Vertical Layout Container */}
        <div className="w-full max-w-5xl flex flex-col gap-3">
          {/* ✨ 1. Attachment Previews (Top) */}
          <AnimatePresence>
            {attachments.length > 0 && (
              <motion.div
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 overflow-x-auto p-1"
              >
                {attachments.map((file, index) => (
                  <motion.div
                    layout
                    key={index}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border bg-muted"
                  >
                    {file.type.startsWith("image/") ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="text-xs text-center p-2 text-muted-foreground truncate">
                        {file.name}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ✨ 2. Textarea (Middle) */}
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            disabled={disabled}
            rows={2}
            className="resize-none border-none bg-background focus-visible:ring-0 focus-visible:ring-offset-0 text-lg p-4 min-h-[60px] rounded-2xl"
          />

          {/* ✨ 3. Action Bar (Bottom) */}
          <div className="flex items-center justify-between">
            {/* Left Tools */}
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="icon">
                <label>
                  <Plus className="h-5 w-5" />
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </Button>
              <Button variant="ghost" size="icon">
                <Mic className="h-5 w-5" />
              </Button>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <Select value={currentModel} onValueChange={handleModelSelect}>
                <SelectTrigger className="w-[150px] h-9 text-sm">
                  <SelectValue>
                    {MODEL_CONFIGS[currentModel]?.name || "Model"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {Object.entries(MODEL_CONFIGS).map(([id, config]) => (
                    <SelectItem key={id} value={id}>
                      <div className="flex items-center justify-between gap-4">
                        <span>{config.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {config.provider}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {isLoading ? (
                <Button type="button" size="icon" onClick={onStop}>
                  <CircleStop className="h-5 w-5" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="icon"
                  disabled={
                    disabled || (!input.trim() && attachments.length === 0)
                  }
                >
                  <Send className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.form>

      {/* Dialog for model switch warning remains the same */}
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
              Different models may have different response styles, capabilities,
              and context handling.
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
