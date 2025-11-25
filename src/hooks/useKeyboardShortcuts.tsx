import { useEffect } from "react";

interface KeyboardShortcuts {
  onToggleSidebar: () => void;
  onNewConversation: () => void;
  //onToggleFocusMode: () => void;
}

export function useKeyboardShortcuts({
  onToggleSidebar,
  onNewConversation,
}: //onToggleFocusMode,
KeyboardShortcuts) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+B - Toggle sidebar
      if (e.ctrlKey && e.key === "b") {
        e.preventDefault();
        console.log("⌨️ Keyboard: Ctrl+B - Toggle sidebar");
        onToggleSidebar();
      }

      // Ctrl+N - New conversation
      if (e.ctrlKey && e.key === "n") {
        e.preventDefault();
        console.log("⌨️ Keyboard: Ctrl+N - New conversation");
        onNewConversation();
      }

      // F11 - Toggle focus mode
      //   if (e.key === "F11") {
      //     e.preventDefault();
      //     console.log("⌨️ Keyboard: F11 - Toggle focus mode");
      //     onToggleFocusMode();
      //   }

      //   // Escape - Exit focus mode
      //   if (e.key === "Escape") {
      //     console.log("⌨️ Keyboard: Escape");
      //     // Only exit focus mode, don't prevent default
      //     onToggleFocusMode();
      //   }
    };

    document.addEventListener("keydown", handleKeyDown);
    console.log("⌨️ Keyboard shortcuts registered");

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      console.log("⌨️ Keyboard shortcuts unregistered");
    };
  }, [onToggleSidebar, onNewConversation]);
}
export default useKeyboardShortcuts;
