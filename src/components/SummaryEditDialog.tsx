import { useState, useEffect } from "react";
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
import { Sparkles, Save } from "lucide-react";

interface SummaryEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: string;
  onSave: (editedSummary: string) => void;
  isLoading?: boolean;
}

export function SummaryEditDialog({
  open,
  onOpenChange,
  summary,
  onSave,
  isLoading,
}: SummaryEditDialogProps) {
  const [editedSummary, setEditedSummary] = useState(summary);

  // Update edited summary when summary prop changes
  useEffect(() => {
    setEditedSummary(summary);
  }, [summary]);

  const handleSave = () => {
    onSave(editedSummary);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Edit Conversation Summary
          </DialogTitle>
          <DialogDescription>
            Review and edit the generated summary before saving. This summary will be used when starting fresh conversations.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Textarea
            value={editedSummary}
            onChange={(e) => setEditedSummary(e.target.value)}
            placeholder="Edit your summary here..."
            className="min-h-[200px] resize-none"
            disabled={isLoading}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || !editedSummary.trim()}
            className="gradient-primary"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Summary
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
