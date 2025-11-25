import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FocusModeOverlayProps {
  onExit: () => void;
}

export function FocusModeOverlay({ onExit }: FocusModeOverlayProps) {
  console.log("🎯 FocusModeOverlay rendered");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Button
        variant="destructive"
        size="lg"
        onClick={() => {
          console.log("🎯 Exiting focus mode");
          onExit();
        }}
        className="shadow-lg"
      >
        <X className="mr-2 h-5 w-5" />
        Exit Focus Mode
      </Button>
    </motion.div>
  );
}
export default FocusModeOverlay;
