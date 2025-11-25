// import { Menu, ChevronDown } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { SettingsModal } from "@/components/SettingsModal";
// import { CompactContextPanel } from "@/components/CompactContextPanel";
// import { RecentChatsDropdown } from "@/components/RecentChatsDropdown";
// import { Settings, Conversation, SidebarState } from "@/types";
// import { motion, AnimatePresence } from "framer-motion";

// interface HeaderProps {
//   sidebarState: SidebarState;
//   activeConversation: Conversation | null;
//   conversations: Record<string, Conversation>;
//   settings: Settings;
//   currentModel: string;
//   lastAutoSummary: { timestamp: string; tokensSaved: number } | null;
//   disabled: boolean;
//   onToggleSidebar: () => void;
//   onSelectConversation: (id: string) => void;
//   onSummarize: () => void;
//   onStartFresh: () => void;
//   onExport: () => void;
//   onUpdateSettings: (settings: Partial<Settings>) => void;
// }

// export function Header({
//   sidebarState,
//   activeConversation,
//   conversations,
//   settings,
//   currentModel,
//   lastAutoSummary,
//   disabled,
//   onToggleSidebar,
//   onSelectConversation,
//   onSummarize,
//   onStartFresh,
//   onExport,
//   onUpdateSettings,
// }: HeaderProps) {
//   console.log("🎨 Header render - sidebarState:", sidebarState);

//   return (
//     <header className="flex items-center justify-between border-b border-border bg-card px-4 md:px-6 py-4 flex-shrink-0 gap-4">
//       {/* Left Side */}
//       <div className="flex items-center gap-3 min-w-0 flex-1">
//         <Button
//           variant="ghost"
//           size="icon"
//           onClick={() => {
//             console.log("🔘 Hamburger clicked");
//             onToggleSidebar();
//           }}
//           className="flex-shrink-0"
//         >
//           <Menu className="h-5 w-5" />
//         </Button>

//         <AnimatePresence mode="wait">
//           {sidebarState === "hidden" ? (
//             <motion.div
//               key="recent-chats"
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               exit={{ opacity: 0, x: -20 }}
//               transition={{ duration: 0.2 }}
//             >
//               <RecentChatsDropdown
//                 conversations={conversations}
//                 activeId={activeConversation?.id || null}
//                 onSelectConversation={onSelectConversation}
//               />
//             </motion.div>
//           ) : (
//             <motion.div
//               key="title"
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               exit={{ opacity: 0, x: -20 }}
//               transition={{ duration: 0.2 }}
//               className="min-w-0 flex-1"
//             >
//               <h1 className="text-lg md:text-xl font-bold truncate">
//                 {activeConversation?.title || "Context Manager"}
//               </h1>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>

//       {/* Right Side */}
//       <div className="flex items-center gap-3 flex-shrink-0">
//         {activeConversation && (
//           <CompactContextPanel
//             conversation={activeConversation}
//             currentModel={currentModel}
//             lastAutoSummary={lastAutoSummary}
//             disabled={disabled}
//             onSummarize={onSummarize}
//             onStartFresh={onStartFresh}
//             onExport={onExport}
//           />
//         )}

//         <SettingsModal settings={settings} onSave={onUpdateSettings} />
//       </div>
//     </header>
//   );
// }
import { Maximize2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsModal } from "@/components/SettingsModal";
import { CompactContextPanel } from "@/components/CompactContextPanel";
import { Settings, Conversation, SidebarState } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import * as Tooltip from "@radix-ui/react-tooltip";

interface HeaderProps {
  sidebarState: SidebarState;
  activeConversation: Conversation | null;
  conversations: Record<string, Conversation>;
  settings: Settings;
  currentModel: string;
  lastAutoSummary: { timestamp: string; tokensSaved: number } | null;
  disabled: boolean;
  onSelectConversation: (id: string) => void;
  onSummarize: () => void;
  onStartFresh: () => void;
  onExport: () => void;
  onUpdateSettings: (settings: Partial<Settings>) => void;
  //onToggleFocusMode: () => void;
}

export function Header({
  sidebarState,
  activeConversation,
  conversations,
  settings,
  currentModel,
  lastAutoSummary,
  disabled,
  onSelectConversation,
  onSummarize,
  onStartFresh,
  onExport,
  onUpdateSettings,
}: // onToggleFocusMode,
HeaderProps) {
  console.log("🎨 Header render - sidebarState:", sidebarState);

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-4 md:px-6 py-4 flex-shrink-0 gap-4">
      {/* Left Side */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Focus Mode Button */}
        <Tooltip.Provider>
          <Tooltip.Root>
            {/* <Tooltip.Trigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  console.log("🎯 Focus mode button clicked");
                  onToggleFocusMode();
                }}
                className="flex-shrink-0"
              >
                <Maximize2 className="h-5 w-5" />
              </Button>
            </Tooltip.Trigger> */}
            <Tooltip.Portal>
              <Tooltip.Content
                side="bottom"
                className="z-50 rounded-md bg-popover px-3 py-1.5 text-sm shadow-md"
              >
                Focus mode (F11)
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="min-w-0 flex-1"
        >
          <h1 className="text-lg md:text-xl font-bold truncate">
            {/* {activeConversation?.title || "Context Manager"} */}
            {"Context Manager"}
          </h1>
        </motion.div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {activeConversation && (
          <CompactContextPanel
            conversation={activeConversation}
            currentModel={currentModel}
            lastAutoSummary={lastAutoSummary}
            disabled={disabled}
            onSummarize={onSummarize}
            onStartFresh={onStartFresh}
            onExport={onExport}
          />
        )}

        <SettingsModal settings={settings} onSave={onUpdateSettings} />
      </div>
    </header>
  );
}
export default Header;
