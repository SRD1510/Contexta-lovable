import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface SummaryEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: string;
  onSave: (editedSummary: string) => void;
  onStartFresh: () => void;
}

export function SummaryEditDialog({
  open,
  onOpenChange,
  summary,
  onSave,
  onStartFresh,
}: SummaryEditDialogProps) {
  const [editedSummary, setEditedSummary] = useState(summary);

  useEffect(() => {
    setEditedSummary(summary);
  }, [summary]);

  const handleSave = () => {
    onSave(editedSummary);
    onOpenChange(false);
  };

  const handleStartFresh = () => {
    onSave(editedSummary);
    onStartFresh();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <DialogTitle>Edit Summary</DialogTitle>
          </div>
          <DialogDescription>
            Review and edit the conversation summary before starting fresh.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Textarea
            value={editedSummary}
            onChange={(e) => setEditedSummary(e.target.value)}
            className="min-h-[200px] resize-none"
            placeholder="Enter summary..."
          />
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handleSave}>
            Save Only
          </Button>
          <Button onClick={handleStartFresh} className="gradient-primary">
            Save & Start Fresh
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
