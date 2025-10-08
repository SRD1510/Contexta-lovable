import { ChevronDown, AlertTriangle } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { MODEL_CONFIGS } from "@/services/api";
import { useState } from "react";

interface ModelSwitcherProps {
  currentModel: string;
  onModelChange: (model: string) => void;
  hasMessages: boolean;
}

export function ModelSwitcher({ currentModel, onModelChange, hasMessages }: ModelSwitcherProps) {
  const [pendingModel, setPendingModel] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);

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
      <div className="mx-auto w-full max-w-4xl px-6 pb-4">
        <Select value={currentModel} onValueChange={handleModelSelect}>
          <SelectTrigger className="w-full transition-all hover:border-primary focus:shadow-glow">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Model:</span>
              <SelectValue />
            </div>
            <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
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
      </div>

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
