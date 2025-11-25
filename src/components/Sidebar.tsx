// import { motion, AnimatePresence } from "framer-motion";
// import {
//   MessageSquarePlus,
//   Trash2,
//   Calendar,
//   Sparkles,
//   RefreshCw,
//   Download,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Conversation } from "@/types";
// import { getContextUsage } from "@/services/tokenCounter";
// import { ContextUsagePanel } from "./ContextUsagePanel";
// import { cn } from "@/lib/utils";

// interface SidebarProps {
//   conversations: Record<string, Conversation>;
//   activeId: string | null;
//   activeConversation: Conversation | null;
//   onNewConversation: () => void;
//   onSelectConversation: (id: string) => void;
//   onDeleteConversation: (id: string) => void;
//   onSummarize: () => void;
//   onStartFresh: () => void;
//   onExport: () => void;
//   disabled: boolean;
//   currentModel: string;
//   lastAutoSummary: { timestamp: string; tokensSaved: number } | null;
// }

// export function Sidebar({
//   conversations,
//   activeId,
//   activeConversation,
//   onNewConversation,
//   onSelectConversation,
//   onDeleteConversation,
//   onSummarize,
//   onStartFresh,
//   onExport,
//   disabled,
//   currentModel,
//   lastAutoSummary,
// }: SidebarProps) {
//   const conversationList = Object.values(conversations).sort(
//     (a, b) =>
//       new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
//   );

//   const contextUsage = activeConversation
//     ? getContextUsage(activeConversation.messages, currentModel)
//     : null;

//   return (
//     <motion.aside
//       initial={{ x: -300, opacity: 0 }}
//       animate={{ x: 0, opacity: 1 }}
//       className="hidden md:flex h-screen w-80 flex-col border-r border-sidebar-border bg-sidebar flex-shrink-0 min-width: 200px;"
//     >
//       <div className="space-y-4 border-b border-sidebar-border p-4">
//         <Button
//           onClick={onNewConversation}
//           className="w-full gradient-primary transition-transform hover:scale-105 active:scale-95"
//         >
//           <MessageSquarePlus className="mr-2 h-4 w-4" />
//           New Conversation
//         </Button>

//         {activeConversation && contextUsage && (
//           <motion.div
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="space-y-3"
//           >
//             <ContextUsagePanel
//               totalTokens={contextUsage.totalTokens}
//               contextWindow={contextUsage.contextWindow}
//               usagePercent={contextUsage.usagePercent}
//               state={contextUsage.state}
//               lastSummarizedAt={lastAutoSummary?.timestamp}
//               tokensSaved={lastAutoSummary?.tokensSaved}
//             />

//             <div className="grid grid-cols-2 gap-2">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={onSummarize}
//                 disabled={disabled || activeConversation.messages.length === 0}
//                 className="transition-transform hover:scale-105 active:scale-95"
//               >
//                 <Sparkles className="mr-2 h-4 w-4" />
//                 Summarize
//               </Button>

//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={onStartFresh}
//                 disabled={disabled || !activeConversation.summary}
//                 className="transition-transform hover:scale-105 active:scale-95"
//               >
//                 <RefreshCw className="mr-2 h-4 w-4" />
//                 Start Fresh
//               </Button>
//             </div>

//             <Button
//               variant="outline"
//               size="sm"
//               onClick={onExport}
//               disabled={activeConversation.messages.length === 0}
//               className="w-full transition-transform hover:scale-105 active:scale-95"
//             >
//               <Download className="mr-2 h-4 w-4" />
//               Export JSON
//             </Button>
//           </motion.div>
//         )}
//       </div>

//       <ScrollArea className="flex-1  ">
//         <div className="space-y-2 p-2">
//           <AnimatePresence>
//             {conversationList.map((conversation) => (
//               <motion.div
//                 key={conversation.id}
//                 initial={{ opacity: 0, y: -10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, scale: 0.95 }}
//                 transition={{ duration: 0.15 }}
//                 className={cn(
//                   "group relative rounded-lg p-3 transition-all cursor-pointer",
//                   activeId === conversation.id
//                     ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow"
//                     : "hover:bg-sidebar-accent"
//                 )}
//                 onClick={() => onSelectConversation(conversation.id)}
//               >
//                 <div className="pr-10 flex flex-col gap-1">
//                   <h3 className="truncate font-medium leading-tight">
//                     {conversation.title}
//                   </h3>
//                   <div className="flex items-center gap-2 text-xs text-muted-foreground">
//                     <Calendar className="h-3 w-3 shrink-0" />
//                     <span className="truncate">
//                       {new Date(conversation.created_at).toLocaleDateString()}
//                     </span>
//                   </div>
//                   <div className="text-xs text-muted-foreground truncate">
//                     {conversation.messages.length} messages •{" "}
//                     {conversation.total_tokens} tokens
//                   </div>
//                   {conversation.summary && (
//                     <div className="mt-1 rounded bg-primary/10 px-2 py-1 text-xs text-primary w-fit">
//                       Has summary
//                     </div>
//                   )}
//                 </div>

//                 <Button
//                   size="icon"
//                   variant="ghost"
//                   className="absolute right-2 top-2 h-8 w-8 z-10 opacity-0 transition-all duration-200 hover:bg-destructive hover:text-destructive-foreground group-hover:opacity-100 shrink-0"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     onDeleteConversation(conversation.id);
//                   }}
//                   aria-label="Delete conversation"
//                 >
//                   <Trash2 className="h-4 w-4" />
//                 </Button>
//               </motion.div>
//             ))}
//           </AnimatePresence>

//           {conversationList.length === 0 && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="py-12 text-center text-muted-foreground"
//             >
//               <p>No conversations yet.</p>
//               <p className="mt-1 text-sm">Start a new one!</p>
//             </motion.div>
//           )}
//         </div>
//       </ScrollArea>
//     </motion.aside>
//   );
// }
/*---------------------------------------------------------------------------------------------*/
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   MessageSquarePlus,
//   Trash2,
//   Calendar,
//   Sparkles,
//   RefreshCw,
//   Download,
//   MoreHorizontal,
//   Edit,
//   X,
//   Check,
//   MoreVertical,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Conversation } from "@/types";
// import { getContextUsage } from "@/services/tokenCounter";
// import { ContextUsagePanel } from "./ContextUsagePanel";
// import { cn } from "@/lib/utils";
// import * as Popover from "@radix-ui/react-popover";
// import * as AlertDialog from "@radix-ui/react-alert-dialog";
// import { useState, useRef, useEffect } from "react";

// interface SidebarProps {
//   conversations: Record<string, Conversation>;
//   activeId: string | null;
//   activeConversation: Conversation | null;
//   onNewConversation: () => void;
//   onSelectConversation: (id: string) => void;
//   onDeleteConversation: (id: string) => void;
//   onRenameConversation: (id: string, newTitle: string) => void;
//   onSummarize: () => void;
//   onStartFresh: () => void;
//   onExport: () => void;
//   disabled: boolean;
//   currentModel: string;
//   lastAutoSummary: { timestamp: string; tokensSaved: number } | null;
// }

// export function Sidebar({
//   conversations,
//   activeId,
//   activeConversation,
//   onNewConversation,
//   onSelectConversation,
//   onDeleteConversation,
//   onRenameConversation,
//   onSummarize,
//   onStartFresh,
//   onExport,
//   disabled,
//   currentModel,
//   lastAutoSummary,
// }: SidebarProps) {
//   const conversationList = Object.values(conversations).sort(
//     (a, b) =>
//       new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
//   );

//   const contextUsage = activeConversation
//     ? getContextUsage(activeConversation.messages, currentModel)
//     : null;

//   return (
//     <motion.aside
//       initial={{ x: -300, opacity: 0 }}
//       animate={{ x: 0, opacity: 1 }}
//       // className="hidden md:flex h-screen w-80 flex-col border-r border-sidebar-border bg-sidebar flex-shrink-0 min-width:200px;"
//       className="hidden md:flex h-screen flex-col border-r border-sidebar-border bg-sidebar flex-shrink-0 min-width:200px; "
//     >
//       {/* Header */}
//       <div className="space-y-4 border-b border-sidebar-border p-4">
//         <Button
//           onClick={onNewConversation}
//           className="w-full gradient-primary transition-transform hover:scale-105 active:scale-95"
//         >
//           <MessageSquarePlus className="mr-2 h-4 w-4" />
//           New Conversation
//         </Button>

//         {activeConversation && contextUsage && (
//           <motion.div
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="space-y-3"
//           >
//             <ContextUsagePanel
//               totalTokens={contextUsage.totalTokens}
//               contextWindow={contextUsage.contextWindow}
//               usagePercent={contextUsage.usagePercent}
//               state={contextUsage.state}
//               lastSummarizedAt={lastAutoSummary?.timestamp}
//               tokensSaved={lastAutoSummary?.tokensSaved}
//             />

//             <div className="grid grid-cols- gap-2">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={onSummarize}
//                 disabled={disabled || activeConversation.messages.length === 0}
//               >
//                 <Sparkles className="mr-2 h-4 w-4" />
//                 Summarize
//               </Button>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={onStartFresh}
//                 disabled={disabled || !activeConversation.summary}
//               >
//                 <RefreshCw className="mr-2 h-4 w-4" />
//                 Start Fresh
//               </Button>
//             </div>

//             <Button
//               variant="outline"
//               size="sm"
//               onClick={onExport}
//               disabled={activeConversation.messages.length === 0}
//               className="w-full"
//             >
//               <Download className="mr-2 h-4 w-4" />
//               Export JSON
//             </Button>
//           </motion.div>
//         )}
//       </div>

//       {/* Conversation List */}
//       <ScrollArea className="flex-1">
//         <div className="space-y-2 p-2">
//           <AnimatePresence>
//             {conversationList.map((conversation) => (
//               <ConversationItem
//                 key={conversation.id}
//                 conversation={conversation}
//                 activeId={activeId}
//                 onSelectConversation={onSelectConversation}
//                 onDeleteConversation={onDeleteConversation}
//                 onRenameConversation={onRenameConversation}
//               />
//             ))}
//           </AnimatePresence>

//           {conversationList.length === 0 && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="py-12 text-center text-muted-foreground"
//             >
//               <p>No conversations yet.</p>
//               <p className="mt-1 text-sm">Start a new one!</p>
//             </motion.div>
//           )}
//         </div>
//       </ScrollArea>
//     </motion.aside>
//   );
// }

// /* ==============================
//    Conversation Item
// ================================= */
// interface ConversationItemProps {
//   conversation: Conversation;
//   activeId: string | null;
//   onSelectConversation: (id: string) => void;
//   onDeleteConversation: (id: string) => void;
//   onRenameConversation: (id: string, newTitle: string) => void;
// }

// function ConversationItem({
//   conversation,
//   activeId,
//   onSelectConversation,
//   onDeleteConversation,
//   onRenameConversation,
// }: ConversationItemProps) {
//   const [open, setOpen] = useState(false);
//   const [isRenaming, setIsRenaming] = useState(false);
//   const [newTitle, setNewTitle] = useState(conversation.title);
//   const [showDeleteDialog, setShowDeleteDialog] = useState(false);
//   const inputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     if (isRenaming && inputRef.current) {
//       inputRef.current.focus();
//       inputRef.current.select();
//     }
//   }, [isRenaming]);

//   const handleRename = (e?: React.MouseEvent) => {
//     e?.stopPropagation();
//     if (newTitle.trim() && newTitle.trim() !== conversation.title) {
//       onRenameConversation(conversation.id, newTitle.trim());
//     }
//     setIsRenaming(false);
//     setOpen(false);
//   };

//   const handleCancelRename = (e?: React.MouseEvent) => {
//     e?.stopPropagation();
//     setNewTitle(conversation.title);
//     setIsRenaming(false);
//     setOpen(false);
//   };

//   return (
//     <>
//       <motion.div
//         key={conversation.id}
//         initial={{ opacity: 0, y: -10 }}
//         animate={{ opacity: 1, y: 0 }}
//         exit={{ opacity: 0, scale: 0.95 }}
//         transition={{ duration: 0.15 }}
//         className={cn(
//           "group relative rounded-lg p-3 transition-all cursor-pointer",
//           activeId === conversation.id
//             ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow"
//             : "hover:bg-sidebar-accent"
//         )}
//         onClick={() => !isRenaming && onSelectConversation(conversation.id)}
//       >
//         <div className="pr-10 flex flex-col gap-1">
//           {isRenaming ? (
//             <div className="flex items-center gap-2">
//               <input
//                 ref={inputRef}
//                 value={newTitle}
//                 onChange={(e) => setNewTitle(e.target.value)}
//                 onClick={(e) => e.stopPropagation()}
//                 className="w-full rounded border border-border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
//               />
//               <Button
//                 size="icon"
//                 variant="ghost"
//                 onClick={handleRename}
//                 aria-label="Save rename"
//               >
//                 <Check className="h-4 w-4" />
//               </Button>
//               <Button
//                 size="icon"
//                 variant="ghost"
//                 onClick={handleCancelRename}
//                 aria-label="Cancel rename"
//               >
//                 <X className="h-4 w-4" />
//               </Button>
//             </div>
//           ) : (
//             <>
//               <h3 className="truncate font-medium leading-tight">
//                 {conversation.title}
//               </h3>
//               <div className="flex items-center gap-2 text-xs text-muted-foreground">
//                 <Calendar className="h-3 w-3 shrink-0" />
//                 <span>
//                   {new Date(conversation.created_at).toLocaleDateString()}
//                 </span>
//               </div>
//               <div className="text-xs text-muted-foreground truncate">
//                 {conversation.messages.length} messages •{" "}
//                 {conversation.total_tokens} tokens
//               </div>
//               {conversation.summary && (
//                 <div className="mt-1 rounded bg-primary/10 px-2 py-1 text-xs text-primary w-fit">
//                   Has summary
//                 </div>
//               )}
//             </>
//           )}
//         </div>

//         {/* More Options (⋯) */}
//         {!isRenaming && (
//           <Popover.Root open={open} onOpenChange={setOpen}>
//             <Popover.Trigger asChild>
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="absolute right-2 top-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 <MoreVertical className="h-4 w-4" />
//               </Button>
//             </Popover.Trigger>
//             <Popover.Portal>
//               <Popover.Content
//                 align="end"
//                 sideOffset={4}
//                 className="z-50 rounded-md border bg-popover p-1 shadow-md"
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="w-full justify-start text-sm"
//                   onClick={() => {
//                     setIsRenaming(true);
//                     setOpen(false);
//                   }}
//                 >
//                   <Edit className="mr-2 h-4 w-4" /> Rename
//                 </Button>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="w-full justify-start text-sm text-destructive"
//                   onClick={() => {
//                     setShowDeleteDialog(true);
//                     setOpen(false);
//                   }}
//                 >
//                   <Trash2 className="mr-2 h-4 w-4" /> Delete
//                 </Button>
//               </Popover.Content>
//             </Popover.Portal>
//           </Popover.Root>
//         )}
//       </motion.div>

//       {/* Confirm Delete Modal */}
//       <AlertDialog.Root
//         open={showDeleteDialog}
//         onOpenChange={setShowDeleteDialog}
//       >
//         <AlertDialog.Portal>
//           <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
//           <AlertDialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-md bg-background p-6 shadow-lg space-y-4">
//             <AlertDialog.Title className="text-lg font-semibold">
//               Delete Conversation
//             </AlertDialog.Title>
//             <AlertDialog.Description className="text-sm text-muted-foreground">
//               Are you sure you want to delete{" "}
//               <strong>{conversation.title}</strong>? This action cannot be
//               undone.
//             </AlertDialog.Description>
//             <div className="flex justify-end gap-2 mt-4">
//               <AlertDialog.Cancel asChild>
//                 <Button variant="outline">Cancel</Button>
//               </AlertDialog.Cancel>
//               <AlertDialog.Action asChild>
//                 <Button
//                   variant="destructive"
//                   onClick={() => onDeleteConversation(conversation.id)}
//                 >
//                   Delete
//                 </Button>
//               </AlertDialog.Action>
//             </div>
//           </AlertDialog.Content>
//         </AlertDialog.Portal>
//       </AlertDialog.Root>
//     </>
//   );
// }

/*==============================*/

// import { motion, AnimatePresence } from "framer-motion";
// import {
//   MessageSquarePlus,
//   Trash2,
//   Calendar,
//   Edit,
//   X,
//   Check,
//   MoreVertical,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Conversation, SidebarState } from "@/types";
// import { cn } from "@/lib/utils";
// import * as Popover from "@radix-ui/react-popover";
// import * as AlertDialog from "@radix-ui/react-alert-dialog";
// import * as Tooltip from "@radix-ui/react-tooltip";
// import { useState, useRef, useEffect } from "react";

// interface SidebarProps {
//   conversations: Record<string, Conversation>;
//   activeId: string | null;
//   onNewConversation: () => void;
//   onSelectConversation: (id: string) => void;
//   onDeleteConversation: (id: string) => void;
//   onRenameConversation: (id: string, newTitle: string) => void;
//   sidebarState: SidebarState;
//   sidebarWidth: number;
// }

// export function Sidebar({
//   conversations,
//   activeId,
//   onNewConversation,
//   onSelectConversation,
//   onDeleteConversation,
//   onRenameConversation,
//   sidebarState,
//   sidebarWidth,
// }: SidebarProps) {
//   const conversationList = Object.values(conversations).sort(
//     (a, b) =>
//       new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
//   );

//   console.log(
//     "🎨 Sidebar render - state:",
//     sidebarState,
//     "width:",
//     sidebarWidth
//   );

//   // Hidden state
//   if (sidebarState === "hidden") {
//     return null;
//   }

//   // Collapsed state
//   if (sidebarState === "collapsed") {
//     return (
//       <motion.aside
//         initial={{ width: sidebarWidth }}
//         animate={{ width: 70, opacity: 1 }}
//         exit={{ width: 0, opacity: 0 }}
//         transition={{ duration: 0.3, ease: "easeInOut" }}
//         className="h-screen flex-col border-r border-sidebar-border bg-sidebar flex-shrink-0 hidden md:flex"
//       >
//         <div className="space-y-4 border-b border-sidebar-border p-2">
//           <Tooltip.Provider>
//             <Tooltip.Root>
//               <Tooltip.Trigger asChild>
//                 <Button
//                   onClick={() => {
//                     console.log("✨ New conversation (collapsed)");
//                     onNewConversation();
//                   }}
//                   size="icon"
//                   className="w-full gradient-primary"
//                 >
//                   <MessageSquarePlus className="h-5 w-5" />
//                 </Button>
//               </Tooltip.Trigger>
//               <Tooltip.Portal>
//                 <Tooltip.Content
//                   side="right"
//                   className="z-50 rounded-md bg-popover px-3 py-1.5 text-sm shadow-md"
//                 >
//                   New Conversation
//                 </Tooltip.Content>
//               </Tooltip.Portal>
//             </Tooltip.Root>
//           </Tooltip.Provider>
//         </div>

//         <ScrollArea className="flex-1">
//           <div className="space-y-2 p-2">
//             {conversationList.map((conversation) => (
//               <CollapsedConversationItem
//                 key={conversation.id}
//                 conversation={conversation}
//                 activeId={activeId}
//                 onSelectConversation={onSelectConversation}
//               />
//             ))}
//           </div>
//         </ScrollArea>
//       </motion.aside>
//     );
//   }

//   // Full state
//   return (
//     <motion.aside
//       initial={{ width: 0, opacity: 0 }}
//       animate={{ width: sidebarWidth, opacity: 1 }}
//       exit={{ width: 0, opacity: 0 }}
//       transition={{ duration: 0.3, ease: "easeInOut" }}
//       className="h-screen flex-col border-r border-sidebar-border bg-sidebar flex-shrink-0 hidden md:flex"
//       style={{ width: sidebarWidth }}
//     >
//       <div className="space-y-4 border-b border-sidebar-border p-4">
//         <Button
//           onClick={() => {
//             console.log("✨ New conversation (full)");
//             onNewConversation();
//           }}
//           className="w-full gradient-primary transition-transform hover:scale-105 active:scale-95"
//         >
//           <MessageSquarePlus className="mr-2 h-4 w-4" />
//           New Conversation
//         </Button>
//       </div>

//       <ScrollArea className="flex-1">
//         <div className="space-y-2 p-2">
//           <AnimatePresence>
//             {conversationList.map((conversation) => (
//               <ConversationItem
//                 key={conversation.id}
//                 conversation={conversation}
//                 activeId={activeId}
//                 onSelectConversation={onSelectConversation}
//                 onDeleteConversation={onDeleteConversation}
//                 onRenameConversation={onRenameConversation}
//               />
//             ))}
//           </AnimatePresence>

//           {conversationList.length === 0 && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="py-12 text-center text-muted-foreground"
//             >
//               <p>No conversations yet.</p>
//               <p className="mt-1 text-sm">Start a new one!</p>
//             </motion.div>
//           )}
//         </div>
//       </ScrollArea>
//     </motion.aside>
//   );
// }

// /* ==============================
//    Collapsed Conversation Item
// ================================= */
// interface CollapsedConversationItemProps {
//   conversation: Conversation;
//   activeId: string | null;
//   onSelectConversation: (id: string) => void;
// }

// function CollapsedConversationItem({
//   conversation,
//   activeId,
//   onSelectConversation,
// }: CollapsedConversationItemProps) {
//   const initials = conversation.title
//     .split(" ")
//     .slice(0, 2)
//     .map((w) => w[0])
//     .join("")
//     .toUpperCase();

//   return (
//     <Tooltip.Provider>
//       <Tooltip.Root>
//         <Tooltip.Trigger asChild>
//           <motion.button
//             initial={{ opacity: 0, scale: 0.8 }}
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{ opacity: 0, scale: 0.8 }}
//             className={cn(
//               "flex h-12 w-12 items-center justify-center rounded-lg text-sm font-bold transition-all",
//               activeId === conversation.id
//                 ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow"
//                 : "bg-sidebar-accent text-foreground hover:bg-sidebar-accent/80"
//             )}
//             onClick={() => {
//               console.log(
//                 "📂 Conversation selected (collapsed):",
//                 conversation.id
//               );
//               onSelectConversation(conversation.id);
//             }}
//           >
//             {initials}
//           </motion.button>
//         </Tooltip.Trigger>
//         <Tooltip.Portal>
//           <Tooltip.Content
//             side="right"
//             className="z-50 max-w-xs rounded-md bg-popover p-3 shadow-md"
//           >
//             <p className="font-medium">{conversation.title}</p>
//             <p className="text-xs text-muted-foreground">
//               {conversation.messages.length} messages •{" "}
//               {conversation.total_tokens} tokens
//             </p>
//           </Tooltip.Content>
//         </Tooltip.Portal>
//       </Tooltip.Root>
//     </Tooltip.Provider>
//   );
// }

// /* ==============================
//    Full Conversation Item
// ================================= */
// interface ConversationItemProps {
//   conversation: Conversation;
//   activeId: string | null;
//   onSelectConversation: (id: string) => void;
//   onDeleteConversation: (id: string) => void;
//   onRenameConversation: (id: string, newTitle: string) => void;
// }

// function ConversationItem({
//   conversation,
//   activeId,
//   onSelectConversation,
//   onDeleteConversation,
//   onRenameConversation,
// }: ConversationItemProps) {
//   const [open, setOpen] = useState(false);
//   const [isRenaming, setIsRenaming] = useState(false);
//   const [newTitle, setNewTitle] = useState(conversation.title);
//   const [showDeleteDialog, setShowDeleteDialog] = useState(false);
//   const inputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     if (isRenaming && inputRef.current) {
//       inputRef.current.focus();
//       inputRef.current.select();
//     }
//   }, [isRenaming]);

//   const handleRename = (e?: React.MouseEvent) => {
//     e?.stopPropagation();
//     if (newTitle.trim() && newTitle.trim() !== conversation.title) {
//       console.log("✏️ Renaming to:", newTitle.trim());
//       onRenameConversation(conversation.id, newTitle.trim());
//     }
//     setIsRenaming(false);
//     setOpen(false);
//   };

//   const handleCancelRename = (e?: React.MouseEvent) => {
//     e?.stopPropagation();
//     console.log("❌ Rename cancelled");
//     setNewTitle(conversation.title);
//     setIsRenaming(false);
//     setOpen(false);
//   };

//   return (
//     <>
//       <motion.div
//         key={conversation.id}
//         initial={{ opacity: 0, y: -10 }}
//         animate={{ opacity: 1, y: 0 }}
//         exit={{ opacity: 0, scale: 0.95 }}
//         transition={{ duration: 0.15 }}
//         className={cn(
//           "group relative rounded-lg p-3 transition-all cursor-pointer",
//           activeId === conversation.id
//             ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow"
//             : "hover:bg-sidebar-accent"
//         )}
//         onClick={() => {
//           if (!isRenaming) {
//             console.log("📂 Conversation selected (full):", conversation.id);
//             onSelectConversation(conversation.id);
//           }
//         }}
//       >
//         <div className="pr-10 flex flex-col gap-1">
//           {isRenaming ? (
//             <div className="flex items-center gap-2">
//               <input
//                 ref={inputRef}
//                 value={newTitle}
//                 onChange={(e) => setNewTitle(e.target.value)}
//                 onClick={(e) => e.stopPropagation()}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter") handleRename();
//                   if (e.key === "Escape") handleCancelRename();
//                 }}
//                 className="w-full rounded border border-border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
//               />
//               <Button
//                 size="icon"
//                 variant="ghost"
//                 onClick={handleRename}
//                 aria-label="Save rename"
//               >
//                 <Check className="h-4 w-4" />
//               </Button>
//               <Button
//                 size="icon"
//                 variant="ghost"
//                 onClick={handleCancelRename}
//                 aria-label="Cancel rename"
//               >
//                 <X className="h-4 w-4" />
//               </Button>
//             </div>
//           ) : (
//             <>
//               <h3 className="truncate font-medium leading-tight">
//                 {conversation.title}
//               </h3>
//               <div className="flex items-center gap-2 text-xs text-muted-foreground">
//                 <Calendar className="h-3 w-3 shrink-0" />
//                 <span>
//                   {new Date(conversation.created_at).toLocaleDateString()}
//                 </span>
//               </div>
//               <div className="text-xs text-muted-foreground truncate">
//                 {conversation.messages.length} messages •{" "}
//                 {conversation.total_tokens} tokens
//               </div>
//               {conversation.summary && (
//                 <div className="mt-1 rounded bg-primary/10 px-2 py-1 text-xs text-primary w-fit">
//                   Has summary
//                 </div>
//               )}
//             </>
//           )}
//         </div>

//         {!isRenaming && (
//           <Popover.Root open={open} onOpenChange={setOpen}>
//             <Popover.Trigger asChild>
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="absolute right-2 top-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   console.log("⋮ More options clicked");
//                 }}
//               >
//                 <MoreVertical className="h-4 w-4" />
//               </Button>
//             </Popover.Trigger>
//             <Popover.Portal>
//               <Popover.Content
//                 align="end"
//                 sideOffset={4}
//                 className="z-50 rounded-md border bg-popover p-1 shadow-md"
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="w-full justify-start text-sm"
//                   onClick={() => {
//                     console.log("✏️ Rename clicked");
//                     setIsRenaming(true);
//                     setOpen(false);
//                   }}
//                 >
//                   <Edit className="mr-2 h-4 w-4" /> Rename
//                 </Button>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="w-full justify-start text-sm text-destructive"
//                   onClick={() => {
//                     console.log("🗑️ Delete clicked");
//                     setShowDeleteDialog(true);
//                     setOpen(false);
//                   }}
//                 >
//                   <Trash2 className="mr-2 h-4 w-4" /> Delete
//                 </Button>
//               </Popover.Content>
//             </Popover.Portal>
//           </Popover.Root>
//         )}
//       </motion.div>

//       <AlertDialog.Root
//         open={showDeleteDialog}
//         onOpenChange={setShowDeleteDialog}
//       >
//         <AlertDialog.Portal>
//           <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
//           <AlertDialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-md bg-background p-6 shadow-lg space-y-4">
//             <AlertDialog.Title className="text-lg font-semibold">
//               Delete Conversation
//             </AlertDialog.Title>
//             <AlertDialog.Description className="text-sm text-muted-foreground">
//               Are you sure you want to delete{" "}
//               <strong>{conversation.title}</strong>? This action cannot be
//               undone.
//             </AlertDialog.Description>
//             <div className="flex justify-end gap-2 mt-4">
//               <AlertDialog.Cancel asChild>
//                 <Button variant="outline">Cancel</Button>
//               </AlertDialog.Cancel>
//               <AlertDialog.Action asChild>
//                 <Button
//                   variant="destructive"
//                   onClick={() => {
//                     console.log("🗑️ Deleting conversation:", conversation.id);
//                     onDeleteConversation(conversation.id);
//                   }}
//                 >
//                   Delete
//                 </Button>
//               </AlertDialog.Action>
//             </div>
//           </AlertDialog.Content>
//         </AlertDialog.Portal>
//       </AlertDialog.Root>
//     </>
//   );
// }

// import { motion, AnimatePresence } from "framer-motion";
// import {
//   MessageSquarePlus,
//   Trash2,
//   Edit,
//   X,
//   Check,
//   MoreVertical,
//   MessageSquare,
//   Menu,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Conversation, SidebarState } from "@/types";
// import { cn } from "@/lib/utils";
// import * as Popover from "@radix-ui/react-popover";
// import * as AlertDialog from "@radix-ui/react-alert-dialog";
// import * as Tooltip from "@radix-ui/react-tooltip";
// import { useState, useRef, useEffect } from "react";

// interface SidebarProps {
//   conversations: Record<string, Conversation>;
//   activeId: string | null;
//   onNewConversation: () => void;
//   onSelectConversation: (id: string) => void;
//   onDeleteConversation: (id: string) => void;
//   onRenameConversation: (id: string, newTitle: string) => void;
//   sidebarState: SidebarState;
//   sidebarWidth: number;
//   onToggleSidebar: () => void;
// }

// export function Sidebar({
//   conversations,
//   activeId,
//   onNewConversation,
//   onSelectConversation,
//   onDeleteConversation,
//   onRenameConversation,
//   sidebarState,
//   sidebarWidth,
//   onToggleSidebar,
// }: SidebarProps) {
//   const conversationList = Object.values(conversations).sort(
//     (a, b) =>
//       new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
//   );

//   console.log(
//     "🎨 Sidebar render - state:",
//     sidebarState,
//     "width:",
//     sidebarWidth
//   );

//   // Collapsed state - super minimal
//   if (sidebarState === "collapsed") {
//     return (
//       <motion.aside
//         initial={{ width: sidebarWidth }}
//         animate={{ width: 70, opacity: 1 }}
//         exit={{ width: 0, opacity: 0 }}
//         transition={{ duration: 0.3, ease: "easeInOut" }}
//         className="h-screen flex-col bg-sidebar flex-shrink-0 hidden md:flex"
//       >
//         <div className="flex flex-col items-center gap-2 p-3">
//           {/* Hamburger */}
//           <Tooltip.Provider>
//             <Tooltip.Root>
//               <Tooltip.Trigger asChild>
//                 <Button
//                   onClick={() => {
//                     console.log("🔘 Hamburger clicked (collapsed → full)");
//                     onToggleSidebar();
//                   }}
//                   size="icon"
//                   variant="ghost"
//                   className="w-12 h-12"
//                 >
//                   <Menu className="h-5 w-5" />
//                 </Button>
//               </Tooltip.Trigger>
//               <Tooltip.Portal>
//                 <Tooltip.Content
//                   side="right"
//                   className="z-50 rounded-md bg-popover px-3 py-1.5 text-sm shadow-md"
//                 >
//                   Expand sidebar
//                 </Tooltip.Content>
//               </Tooltip.Portal>
//             </Tooltip.Root>
//           </Tooltip.Provider>

//           {/* New Chat Icon */}
//           <Tooltip.Provider>
//             <Tooltip.Root>
//               <Tooltip.Trigger asChild>
//                 <Button
//                   onClick={() => {
//                     console.log("✨ New conversation (collapsed)");
//                     onNewConversation();
//                   }}
//                   size="icon"
//                   variant="ghost"
//                   className="w-12 h-12"
//                 >
//                   <MessageSquarePlus className="h-5 w-5" />
//                 </Button>
//               </Tooltip.Trigger>
//               <Tooltip.Portal>
//                 <Tooltip.Content
//                   side="right"
//                   className="z-50 rounded-md bg-popover px-3 py-1.5 text-sm shadow-md"
//                 >
//                   New conversation
//                 </Tooltip.Content>
//               </Tooltip.Portal>
//             </Tooltip.Root>
//           </Tooltip.Provider>
//         </div>

//         {/* Empty space - no conversation list in collapsed */}
//       </motion.aside>
//     );
//   }

//   // Full state - Gemini style
//   return (
//     <motion.aside
//       initial={{ width: 0, opacity: 0 }}
//       animate={{ width: sidebarWidth, opacity: 1 }}
//       exit={{ width: 0, opacity: 0 }}
//       transition={{ duration: 0.3, ease: "easeInOut" }}
//       className="h-screen flex-col bg-sidebar flex-shrink-0 hidden md:flex"
//       style={{ width: sidebarWidth }}
//     >
//       {/* Top Section: Hamburger + New Chat */}
//       <div className="p-3 space-y-2">
//         {/* Hamburger */}
//         <Button
//           onClick={() => {
//             console.log("🔘 Hamburger clicked (full → collapsed)");
//             onToggleSidebar();
//           }}
//           size="icon"
//           variant="ghost"
//           className="w-12 h-12"
//         >
//           <Menu className="h-5 w-5" />
//         </Button>

//         {/* New Chat Button */}
//         <Button
//           onClick={() => {
//             console.log("✨ New conversation (full)");
//             onNewConversation();
//           }}
//           variant="ghost"
//           className="w-full justify-start h-12 text-base hover:bg-accent"
//         >
//           <MessageSquarePlus className="mr-3 h-5 w-5" />
//           New chat
//         </Button>
//       </div>

//       {/* Recent Section */}
//       <div className="px-4 py-2">
//         <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
//           Recent
//         </h3>
//       </div>

//       {/* Conversation List */}
//       <ScrollArea className="flex-1">
//         <div className="px-2 pb-4">
//           <AnimatePresence>
//             {conversationList.map((conversation) => (
//               <ConversationItem
//                 key={conversation.id}
//                 conversation={conversation}
//                 activeId={activeId}
//                 onSelectConversation={onSelectConversation}
//                 onDeleteConversation={onDeleteConversation}
//                 onRenameConversation={onRenameConversation}
//               />
//             ))}
//           </AnimatePresence>

//           {conversationList.length === 0 && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="py-12 text-center text-muted-foreground px-4"
//             >
//               <p className="text-sm">No conversations yet.</p>
//               <p className="mt-1 text-xs">Click "New chat" to start!</p>
//             </motion.div>
//           )}
//         </div>
//       </ScrollArea>
//     </motion.aside>
//   );
// }

// /* ==============================
//    Full Conversation Item (Gemini Style)
// ================================= */
// interface ConversationItemProps {
//   conversation: Conversation;
//   activeId: string | null;
//   onSelectConversation: (id: string) => void;
//   onDeleteConversation: (id: string) => void;
//   onRenameConversation: (id: string, newTitle: string) => void;
// }

// function ConversationItem({
//   conversation,
//   activeId,
//   onSelectConversation,
//   onDeleteConversation,
//   onRenameConversation,
// }: ConversationItemProps) {
//   const [open, setOpen] = useState(false);
//   const [isRenaming, setIsRenaming] = useState(false);
//   const [newTitle, setNewTitle] = useState(conversation.title);
//   const [showDeleteDialog, setShowDeleteDialog] = useState(false);
//   const inputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     if (isRenaming && inputRef.current) {
//       inputRef.current.focus();
//       inputRef.current.select();
//     }
//   }, [isRenaming]);

//   const handleRename = (e?: React.MouseEvent) => {
//     e?.stopPropagation();
//     if (newTitle.trim() && newTitle.trim() !== conversation.title) {
//       console.log("✏️ Renaming to:", newTitle.trim());
//       onRenameConversation(conversation.id, newTitle.trim());
//     }
//     setIsRenaming(false);
//     setOpen(false);
//   };

//   const handleCancelRename = (e?: React.MouseEvent) => {
//     e?.stopPropagation();
//     console.log("❌ Rename cancelled");
//     setNewTitle(conversation.title);
//     setIsRenaming(false);
//     setOpen(false);
//   };

//   return (
//     <>
//       <motion.div
//         initial={{ opacity: 0, y: -5 }}
//         animate={{ opacity: 1, y: 0 }}
//         exit={{ opacity: 0, scale: 0.95 }}
//         transition={{ duration: 0.15 }}
//         className={cn(
//           "group relative rounded-lg px-3 py-2.5 transition-all cursor-pointer mb-1",
//           activeId === conversation.id
//             ? "bg-primary text-primary-foreground"
//             : "hover:bg-accent"
//         )}
//         onClick={() => {
//           if (!isRenaming) {
//             console.log("📂 Conversation selected (full):", conversation.id);
//             onSelectConversation(conversation.id);
//           }
//         }}
//       >
//         {isRenaming ? (
//           <div
//             className="flex items-center gap-2"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <input
//               ref={inputRef}
//               value={newTitle}
//               onChange={(e) => setNewTitle(e.target.value)}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") handleRename();
//                 if (e.key === "Escape") handleCancelRename();
//               }}
//               className="flex-1 rounded border border-border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
//             />
//             <Button
//               size="icon"
//               variant="ghost"
//               className="h-7 w-7 flex-shrink-0"
//               onClick={handleRename}
//             >
//               <Check className="h-4 w-4" />
//             </Button>
//             <Button
//               size="icon"
//               variant="ghost"
//               className="h-7 w-7 flex-shrink-0"
//               onClick={handleCancelRename}
//             >
//               <X className="h-4 w-4" />
//             </Button>
//           </div>
//         ) : (
//           <div className="flex items-center gap-2">
//             <MessageSquare className="h-4 w-4 flex-shrink-0 opacity-70" />
//             <span className="flex-1 truncate text-sm font-medium">
//               {conversation.title}
//             </span>
//             <Popover.Root open={open} onOpenChange={setOpen}>
//               <Popover.Trigger asChild>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   className={cn(
//                     "h-7 w-7 flex-shrink-0 transition-opacity",
//                     activeId === conversation.id
//                       ? "opacity-100"
//                       : "opacity-0 group-hover:opacity-100"
//                   )}
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     console.log("⋮ More options clicked");
//                   }}
//                 >
//                   <MoreVertical className="h-4 w-4" />
//                 </Button>
//               </Popover.Trigger>
//               <Popover.Portal>
//                 <Popover.Content
//                   align="end"
//                   sideOffset={4}
//                   className="z-50 w-48 rounded-lg border bg-popover p-1 shadow-lg"
//                   onClick={(e) => e.stopPropagation()}
//                 >
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     className="w-full justify-start text-sm font-normal"
//                     onClick={() => {
//                       console.log("✏️ Rename clicked");
//                       setIsRenaming(true);
//                       setOpen(false);
//                     }}
//                   >
//                     <Edit className="mr-2 h-4 w-4" />
//                     Rename
//                   </Button>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     className="w-full justify-start text-sm font-normal text-destructive hover:text-destructive"
//                     onClick={() => {
//                       console.log("🗑️ Delete clicked");
//                       setShowDeleteDialog(true);
//                       setOpen(false);
//                     }}
//                   >
//                     <Trash2 className="mr-2 h-4 w-4" />
//                     Delete
//                   </Button>
//                 </Popover.Content>
//               </Popover.Portal>
//             </Popover.Root>
//           </div>
//         )}
//       </motion.div>

//       {/* Delete Confirmation Dialog */}
//       <AlertDialog.Root
//         open={showDeleteDialog}
//         onOpenChange={setShowDeleteDialog}
//       >
//         <AlertDialog.Portal>
//           <AlertDialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
//           <AlertDialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-background p-6 shadow-xl z-50">
//             <AlertDialog.Title className="text-lg font-semibold mb-2">
//               Delete conversation?
//             </AlertDialog.Title>
//             <AlertDialog.Description className="text-sm text-muted-foreground mb-6">
//               This will delete{" "}
//               <strong className="text-foreground">{conversation.title}</strong>.
//               This action cannot be undone.
//             </AlertDialog.Description>
//             <div className="flex justify-end gap-3">
//               <AlertDialog.Cancel asChild>
//                 <Button variant="outline" size="sm">
//                   Cancel
//                 </Button>
//               </AlertDialog.Cancel>
//               <AlertDialog.Action asChild>
//                 <Button
//                   variant="destructive"
//                   size="sm"
//                   onClick={() => {
//                     console.log("🗑️ Deleting conversation:", conversation.id);
//                     onDeleteConversation(conversation.id);
//                   }}
//                 >
//                   Delete
//                 </Button>
//               </AlertDialog.Action>
//             </div>
//           </AlertDialog.Content>
//         </AlertDialog.Portal>
//       </AlertDialog.Root>
//     </>
//   );
// }

import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquarePlus,
  Trash2,
  Edit,
  X,
  Check,
  MoreVertical,
  MessageSquare,
  Menu,
  Search,
  X as XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Conversation, SidebarState } from "@/types";
import { cn } from "@/lib/utils";
import * as Popover from "@radix-ui/react-popover";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useState, useRef, useEffect, useMemo } from "react";

interface SidebarProps {
  conversations: Record<string, Conversation>;
  activeId: string | null;
  onNewConversation: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  sidebarState: SidebarState;
  sidebarWidth: number;
  onToggleSidebar: () => void;
}

export function Sidebar({
  conversations,
  activeId,
  onNewConversation,
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
  sidebarState,
  sidebarWidth,
  onToggleSidebar,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const allConversations = useMemo(() => {
    return Object.values(conversations).sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [conversations]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) {
      return allConversations;
    }

    const query = searchQuery.toLowerCase().trim();
    return allConversations.filter((conv) => {
      const titleMatch = conv.title.toLowerCase().includes(query);
      const contentMatch = conv.messages.some((msg) =>
        msg.content.toLowerCase().includes(query)
      );
      return titleMatch || contentMatch;
    });
  }, [allConversations, searchQuery]);

  if (import.meta.env.DEV) {
    console.log(
      "🎨 Sidebar render - state:",
      sidebarState,
      "width:",
      sidebarWidth
    );
  }

  // Collapsed state
  if (sidebarState === "collapsed") {
    return (
      <motion.aside
        initial={{ width: sidebarWidth }}
        animate={{ width: 70, opacity: 1 }}
        exit={{ width: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="h-screen flex-col bg-sidebar flex-shrink-0 hidden md:flex"
      >
        <div className="flex flex-col items-center gap-2 p-3">
          {/* Hamburger */}
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <Button
                  onClick={() => onToggleSidebar()}
                  size="icon"
                  variant="ghost"
                  className="w-12 h-12"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  side="right"
                  className="z-50 rounded-md bg-popover px-3 py-1.5 text-sm shadow-md"
                >
                  Expand sidebar
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>

          {/* New Chat Icon */}
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <Button
                  onClick={() => onNewConversation()}
                  size="icon"
                  variant="ghost"
                  className="w-12 h-12"
                >
                  <MessageSquarePlus className="h-5 w-5" />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  side="right"
                  className="z-50 rounded-md bg-popover px-3 py-1.5 text-sm shadow-md"
                >
                  New conversation
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        </div>
      </motion.aside>
    );
  }

  // Full state
  return (
    <motion.aside
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: sidebarWidth, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-screen flex-col bg-sidebar flex-shrink-0 hidden md:flex"
      style={{ width: sidebarWidth }}
    >
      {/* Top Section */}
      <div className="p-3 space-y-2">
        <Button
          onClick={() => onToggleSidebar()}
          size="icon"
          variant="ghost"
          className="w-12 h-12"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Button
          onClick={() => onNewConversation()}
          variant="ghost"
          className="w-full justify-start h-12 text-base hover:bg-accent"
        >
          <MessageSquarePlus className="mr-3 h-5 w-5" />
          New chat
        </Button>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8 h-9 text-sm"
          />
          {searchQuery && (
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setSearchQuery("")}
            >
              <XIcon className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Recent Section */}
      <div className="px-4 py-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {searchQuery
            ? `Search Results (${filteredConversations.length})`
            : "Recent"}
        </h3>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1 px-2 pb-4">
        <AnimatePresence>
          {filteredConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              activeId={activeId}
              searchQuery={searchQuery}
              onSelectConversation={onSelectConversation}
              onDeleteConversation={onDeleteConversation}
              onRenameConversation={onRenameConversation}
            />
          ))}
        </AnimatePresence>

        {filteredConversations.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-12 text-center text-muted-foreground px-4"
          >
            {searchQuery ? (
              <>
                <p className="text-sm">No conversations found.</p>
                <p className="mt-1 text-xs">Try a different search term.</p>
              </>
            ) : (
              <>
                <p className="text-sm">No conversations yet.</p>
                <p className="mt-1 text-xs">Click "New chat" to start!</p>
              </>
            )}
          </motion.div>
        )}
      </ScrollArea>
    </motion.aside>
  );
}

/* ==============================
   Conversation Item
================================= */
interface ConversationItemProps {
  conversation: Conversation;
  activeId: string | null;
  searchQuery?: string;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
}

function ConversationItem({
  conversation,
  activeId,
  searchQuery = "",
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
}: ConversationItemProps) {
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark
          key={i}
          className="bg-primary/20 text-primary-foreground rounded px-0.5"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };
  const [open, setOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(conversation.title);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleRename = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (newTitle.trim() && newTitle.trim() !== conversation.title) {
      onRenameConversation(conversation.id, newTitle.trim());
    }
    setIsRenaming(false);
    setOpen(false);
  };

  const handleCancelRename = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setNewTitle(conversation.title);
    setIsRenaming(false);
    setOpen(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className={cn(
          "group relative rounded-xl px-3 py-2 transition-all cursor-pointer mb-1 flex items-center",
          activeId === conversation.id
            ? "bg-primary text-primary-foreground shadow-sm"
            : "hover:grey-800"
        )}
        onClick={() => {
          if (!isRenaming) onSelectConversation(conversation.id);
        }}
      >
        {isRenaming ? (
          <div
            className="flex items-center gap-2 "
            onClick={(e) => e.stopPropagation()}
          >
            <input
              ref={inputRef}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
                if (e.key === "Escape") handleCancelRename();
              }}
              className="flex-1 rounded border border-border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 flex-shrink-0"
              onClick={handleRename}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 flex-shrink-0"
              onClick={handleCancelRename}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 w-half">
            <MessageSquare className="h-4 w-4 flex-shrink-0 opacity-70" />
            {/* <span className="flex-1 truncate text-sm font-medium">
              {conversation.title}
            </span> */}
            <span className="flex-1 truncate text-sm font-medium max-w-[150px]">
              {searchQuery
                ? highlightText(conversation.title, searchQuery)
                : conversation.title}
            </span>
            <Popover.Root open={open} onOpenChange={setOpen}>
              <Popover.Trigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-7 w-7 flex-shrink-0 transition-opacity",
                    activeId === conversation.id
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  align="end"
                  sideOffset={4}
                  className="z-50 w-48 rounded-lg border bg-popover p-1 shadow-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-sm font-normal"
                    onClick={() => {
                      setIsRenaming(true);
                      setOpen(false);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Rename
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-sm font-normal text-destructive hover:text-destructive"
                    onClick={() => {
                      setShowDeleteDialog(true);
                      setOpen(false);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </div>
        )}
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog.Root
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-background p-6 shadow-xl z-50">
            <AlertDialog.Title className="text-lg font-semibold mb-2">
              Delete conversation?
            </AlertDialog.Title>
            <AlertDialog.Description className="text-sm text-muted-foreground mb-6">
              This will delete{" "}
              <strong className="text-foreground">{conversation.title}</strong>.
              This action cannot be undone.
            </AlertDialog.Description>
            <div className="flex justify-end gap-3">
              <AlertDialog.Cancel asChild>
                <Button variant="outline" size="sm">
                  Cancel
                </Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDeleteConversation(conversation.id)}
                >
                  Delete
                </Button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  );
}
