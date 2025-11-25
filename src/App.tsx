// import { useState, useEffect } from "react";
// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { useAppState } from "@/hooks/useAppState";
// import { Sidebar } from "@/components/Sidebar";
// import { ChatView } from "@/components/ChatView";
// import { InputBox } from "@/components/InputBox";
// import { SettingsModal } from "@/components/SettingsModal";
// import { SummaryEditDialog } from "@/components/SummaryEditDialog";
// import { sendMessage, MODEL_CONFIGS } from "@/services/api";
// import { storage } from "@/services/storage";
// import { Message } from "@/types";
// import { useToast } from "@/hooks/use-toast";
// import {
//   shouldAutoSummarize,
//   countMessageTokens,
// } from "@/services/tokenCounter";
// import { autoSummarize } from "@/services/summarizer";
// import { toast as sonnerToast } from "sonner";

// const queryClient = new QueryClient();

// function ContextManager() {
//   const {
//     state,
//     activeConversation,
//     createConversation,
//     loadConversation,
//     deleteConversation,
//     addMessage,
//     replaceMessages,
//     updateSettings,
//     summarizeConversation,
//     startFreshWithSummary,
//     renameConversation,
//   } = useAppState();

//   const [isLoading, setIsLoading] = useState(false);
//   const [isSummarizing, setIsSummarizing] = useState(false);
//   const [currentModel, setCurrentModel] = useState(state.settings.defaultModel);
//   const [showSummaryDialog, setShowSummaryDialog] = useState(false);
//   const [pendingSummary, setPendingSummary] = useState("");
//   const [lastAutoSummary, setLastAutoSummary] = useState<{
//     timestamp: string;
//     tokensSaved: number;
//   } | null>(null);
//   const { toast } = useToast();

//   const handleNewConversation = () => {
//     createConversation();
//   };

//   const handleSendMessage = async (content: string) => {
//     if (!activeConversation) {
//       const newId = createConversation();
//       const conversation = state.conversations[newId];
//       if (!conversation) return;
//     }

//     const conversationId =
//       activeConversation?.id || state.active_conversation_id;
//     if (!conversationId) return;

//     const config = MODEL_CONFIGS[currentModel];
//     const apiKey = state.settings.apiKeys[config.provider];

//     if (!apiKey) {
//       toast({
//         title: "API Key Required",
//         description: `Please configure your ${config.provider} API key in settings.`,
//         variant: "destructive",
//       });
//       return;
//     }

//     const userMessage: Message = {
//       id: `msg-${Date.now()}-user`,
//       role: "user",
//       content,
//       timestamp: new Date().toISOString(),
//     };

//     addMessage(conversationId, userMessage);
//     setIsLoading(true);

//     try {
//       const conversation = state.conversations[conversationId];
//       const allMessages = [...conversation.messages, userMessage];

//       const response = await sendMessage(
//         allMessages,
//         currentModel,
//         apiKey,
//         state.settings.defaultTemperature,
//         state.settings.defaultMaxTokens
//       );

//       const assistantMessage: Message = {
//         id: `msg-${Date.now()}-assistant`,
//         role: "assistant",
//         content: response.content,
//         timestamp: new Date().toISOString(),
//         metadata: {
//           model: config.name,
//           provider: config.provider,
//           temperature: state.settings.defaultTemperature,
//           tokens: response.tokensUsed,
//         },
//       };

//       addMessage(conversationId, assistantMessage);

//       // Check if auto-summarization is needed with the complete message array
//       const allMessagesAfterResponse = [...allMessages, assistantMessage];
//       await checkAndAutoSummarize(conversationId, allMessagesAfterResponse);
//     } catch (error) {
//       toast({
//         title: "Error",
//         description:
//           error instanceof Error ? error.message : "Failed to send message",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const checkAndAutoSummarize = async (
//     conversationId: string,
//     messages: Message[]
//   ) => {
//     const { autoSummarization } = state.settings;

//     if (!autoSummarization.enabled) return;

//     // Check if we should auto-summarize
//     const shouldSummarize = shouldAutoSummarize(
//       messages,
//       currentModel,
//       autoSummarization.threshold
//     );

//     if (!shouldSummarize) return;

//     // Don't auto-summarize if we don't have enough messages
//     if (messages.length <= autoSummarization.keepRecentCount) return;

//     try {
//       setIsSummarizing(true);
//       sonnerToast.loading("💡 Optimizing context...", { id: "auto-summarize" });

//       const config = MODEL_CONFIGS[currentModel];
//       const apiKey = state.settings.apiKeys[config.provider];

//       if (!apiKey) {
//         sonnerToast.dismiss("auto-summarize");
//         return;
//       }

//       const result = await autoSummarize(
//         messages,
//         currentModel,
//         apiKey,
//         autoSummarization.keepRecentCount,
//         autoSummarization.style
//       );

//       // Update conversation with summarized messages
//       const newTokenCount = countMessageTokens(result.messages, currentModel);
//       replaceMessages(conversationId, result.messages, newTokenCount);

//       // Track last summary
//       setLastAutoSummary({
//         timestamp: new Date().toISOString(),
//         tokensSaved: result.tokensSaved,
//       });

//       sonnerToast.success(
//         `✓ Context optimized - Summarized ${
//           result.summarizedCount
//         } messages, saved ${result.tokensSaved.toLocaleString()} tokens`,
//         { id: "auto-summarize", duration: 5000 }
//       );
//     } catch (error) {
//       sonnerToast.error(
//         `Failed to auto-summarize: ${
//           error instanceof Error ? error.message : "Unknown error"
//         }`,
//         { id: "auto-summarize" }
//       );
//     } finally {
//       setIsSummarizing(false);
//     }
//   };

//   const handleSummarize = async () => {
//     if (!activeConversation) return;

//     setIsLoading(true);
//     try {
//       const config = MODEL_CONFIGS[currentModel];
//       const apiKey = state.settings.apiKeys[config.provider];

//       if (!apiKey) {
//         toast({
//           title: "API Key Required",
//           description: `Please configure your ${config.provider} API key in settings.`,
//           variant: "destructive",
//         });
//         return;
//       }

//       const summaryPrompt: Message = {
//         id: "summary-prompt",
//         role: "user",
//         content:
//           "Please provide a concise summary of our conversation so far, highlighting the key points and any important context.",
//         timestamp: new Date().toISOString(),
//       };

//       const response = await sendMessage(
//         [...activeConversation.messages, summaryPrompt],
//         currentModel,
//         apiKey
//       );

//       setPendingSummary(response.content);
//       setShowSummaryDialog(true);
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to generate summary",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleSaveSummary = async (editedSummary: string) => {
//     if (!activeConversation) return;

//     await summarizeConversation(activeConversation.id, editedSummary);
//     toast({
//       title: "Summary Saved",
//       description: "Conversation summary has been saved successfully.",
//     });
//   };

//   const handleStartFresh = () => {
//     if (!activeConversation) return;
//     startFreshWithSummary(activeConversation.id);
//     toast({
//       title: "Fresh Start",
//       description: "New conversation created with previous summary.",
//     });
//   };

//   const handleExport = () => {
//     if (!activeConversation) return;
//     storage.exportConversation(activeConversation);
//     toast({
//       title: "Exported",
//       description: "Conversation exported successfully.",
//     });
//   };

//   const handleModelChange = (model: string) => {
//     setCurrentModel(model);
//     toast({
//       title: "Model Changed",
//       description: `Switched to ${MODEL_CONFIGS[model].name}`,
//     });
//   };
//   const handleRenameConversation = (id: string, newTitle: string) => {
//     renameConversation(id, newTitle);
//   };

//   return (
//     <div className="flex h-screen w-full overflow-hidden bg-background">
//       <Sidebar
//         conversations={state.conversations}
//         activeId={state.active_conversation_id}
//         activeConversation={activeConversation}
//         onNewConversation={handleNewConversation}
//         onSelectConversation={loadConversation}
//         onDeleteConversation={deleteConversation}
//         onSummarize={handleSummarize}
//         onStartFresh={handleStartFresh}
//         onExport={handleExport}
//         disabled={isLoading || isSummarizing}
//         currentModel={currentModel}
//         lastAutoSummary={lastAutoSummary}
//         onRenameConversation={handleRenameConversation}
//       />

//       <div className="flex flex-1 flex-col overflow-hidden min-w-0">
//         <header className="flex items-center justify-between border-b border-border bg-card px-4 md:px-6 py-4 flex-shrink-0">
//           <div className="min-w-0 flex-1 mr-4">
//             <h1 className="text-lg md:text-xl font-bold truncate">
//               {activeConversation?.title || "Context Manager"}
//             </h1>
//             {activeConversation && (
//               <p className="text-xs md:text-sm text-muted-foreground truncate">
//                 {activeConversation.messages.length} messages •{" "}
//                 {activeConversation.total_tokens} tokens
//               </p>
//             )}
//           </div>
//           <SettingsModal settings={state.settings} onSave={updateSettings} />
//         </header>

//         <ChatView messages={activeConversation?.messages || []} />

//         <InputBox
//           onSend={handleSendMessage}
//           disabled={isLoading || isSummarizing}
//           isLoading={isLoading || isSummarizing}
//           currentModel={currentModel}
//           onModelChange={handleModelChange}
//           hasMessages={(activeConversation?.messages.length || 0) > 0}
//           // onStop={}
//         />
//       </div>

//       <SummaryEditDialog
//         open={showSummaryDialog}
//         onOpenChange={setShowSummaryDialog}
//         summary={pendingSummary}
//         onSave={handleSaveSummary}
//         isLoading={isLoading}
//       />
//     </div>
//   );
// }

// const App = () => (
//   <QueryClientProvider client={queryClient}>
//     <TooltipProvider>
//       <Toaster />
//       <Sonner />
//       <ContextManager />
//     </TooltipProvider>
//   </QueryClientProvider>
// );

// export default App;

import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAppState } from "@/hooks/useAppState";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { ChatView } from "@/components/ChatView";
import { InputBox } from "@/components/InputBox";
import { SummaryEditDialog } from "@/components/SummaryEditDialog";
import { ErrorBoundary } from "@/components/ErrorBoundary";
// import { FocusModeOverlay } from "@/components/FocusModeOverlay";
import { sendMessage, MODEL_CONFIGS } from "@/services/api";
import { storage } from "@/services/storage";
import { Message, SummaryStyle, SidebarState } from "@/types";
import { useToast } from "@/hooks/use-toast";
import {
  shouldAutoSummarize,
  countMessageTokens,
} from "@/services/tokenCounter";
import { autoSummarize } from "@/services/summarizer";
import { toast as sonnerToast } from "sonner";
import { AnimatePresence } from "framer-motion";
import { sanitizeInput } from "@/lib/security";

const queryClient = new QueryClient();

function ContextManager() {
  const {
    state,
    activeConversation,
    createConversation,
    loadConversation,
    deleteConversation,
    addMessage,
    editMessage,
    replaceMessages,
    updateSettings,
    summarizeConversation,
    startFreshWithSummary,
    renameConversation,
    toggleSidebar,
    // toggleFocusMode,
  } = useAppState();

  const [isLoading, setIsLoading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [currentModel, setCurrentModel] = useState(state.settings.defaultModel);
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const [pendingSummary, setPendingSummary] = useState("");
  const [lastAutoSummary, setLastAutoSummary] = useState<{
    timestamp: string;
    tokensSaved: number;
  } | null>(null);
  const { toast } = useToast();

  // console.log("🎨 App render - focusMode:", state.uiPreferences.focusMode);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onToggleSidebar: toggleSidebar,
    onNewConversation: createConversation,
    // onToggleFocusMode: toggleFocusMode,
  });

  const handleNewConversation = () => {
    if (import.meta.env.DEV) {
      console.log("✨ handleNewConversation called");
    }
    createConversation();
  };

  const handleSendMessage = async (content: string) => {
    // Sanitize user input to prevent injection attacks
    const sanitizedContent = sanitizeInput(content);

    if (!sanitizedContent || sanitizedContent.trim().length === 0) {
      toast({
        title: "Invalid Input",
        description: "Message cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    if (!activeConversation) {
      const newId = createConversation();
      const conversation = state.conversations[newId];
      if (!conversation) return;
    }

    const conversationId =
      activeConversation?.id || state.active_conversation_id;
    if (!conversationId) return;

    const config = MODEL_CONFIGS[currentModel];
    const apiKey = state.settings.apiKeys[config.provider];

    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: `Please configure your ${config.provider} API key in settings.`,
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content: sanitizedContent, // Use sanitized content
      timestamp: new Date().toISOString(),
    };

    addMessage(conversationId, userMessage);
    setIsLoading(true);

    try {
      const conversation = state.conversations[conversationId];
      const allMessages = [...conversation.messages, userMessage];

      const response = await sendMessage(
        allMessages,
        currentModel,
        apiKey,
        state.settings.defaultTemperature,
        state.settings.defaultMaxTokens
      );

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: "assistant",
        content: response.content,
        timestamp: new Date().toISOString(),
        metadata: {
          model: config.name,
          provider: config.provider,
          temperature: state.settings.defaultTemperature,
          tokens: response.tokensUsed,
        },
      };

      addMessage(conversationId, assistantMessage);

      const allMessagesAfterResponse = [...allMessages, assistantMessage];
      await checkAndAutoSummarize(conversationId, allMessagesAfterResponse);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to send message. Please try again.";

      toast({
        title: "Error Sending Message",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });

      // Remove the user message if API call failed
      if (conversationId && userMessage) {
        const conversation = state.conversations[conversationId];
        if (conversation) {
          const updatedMessages = conversation.messages.filter(
            (m) => m.id !== userMessage.id
          );
          replaceMessages(
            conversationId,
            updatedMessages,
            conversation.total_tokens
          );
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const checkAndAutoSummarize = async (
    conversationId: string,
    messages: Message[]
  ) => {
    const { autoSummarization } = state.settings;

    if (!autoSummarization.enabled) return;

    const shouldSummarize = shouldAutoSummarize(
      messages,
      currentModel,
      autoSummarization.threshold
    );

    if (!shouldSummarize) return;

    if (messages.length <= autoSummarization.keepRecentCount) return;

    try {
      setIsSummarizing(true);
      sonnerToast.loading("💡 Optimizing context...", { id: "auto-summarize" });

      const config = MODEL_CONFIGS[currentModel];
      const apiKey = state.settings.apiKeys[config.provider];

      if (!apiKey) {
        sonnerToast.dismiss("auto-summarize");
        return;
      }

      const result = await autoSummarize(
        messages,
        currentModel,
        apiKey,
        autoSummarization.keepRecentCount,
        autoSummarization.style as SummaryStyle
      );

      const newTokenCount = countMessageTokens(result.messages, currentModel);
      replaceMessages(conversationId, result.messages, newTokenCount);

      setLastAutoSummary({
        timestamp: new Date().toISOString(),
        tokensSaved: result.tokensSaved,
      });

      sonnerToast.success(
        `✓ Context optimized - Summarized ${
          result.summarizedCount
        } messages, saved ${result.tokensSaved.toLocaleString()} tokens`,
        { id: "auto-summarize", duration: 5000 }
      );
    } catch (error) {
      sonnerToast.error(
        `Failed to auto-summarize: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        { id: "auto-summarize" }
      );
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleSummarize = async () => {
    if (!activeConversation) return;

    if (import.meta.env.DEV) {
      console.log("✨ handleSummarize called");
    }
    setIsLoading(true);
    try {
      const config = MODEL_CONFIGS[currentModel];
      const apiKey = state.settings.apiKeys[config.provider];

      if (!apiKey) {
        toast({
          title: "API Key Required",
          description: `Please configure your ${config.provider} API key in settings.`,
          variant: "destructive",
        });
        return;
      }

      const summaryPrompt: Message = {
        id: "summary-prompt",
        role: "user",
        content:
          "Please provide a concise summary of our conversation so far, highlighting the key points and any important context.",
        timestamp: new Date().toISOString(),
      };

      const response = await sendMessage(
        [...activeConversation.messages, summaryPrompt],
        currentModel,
        apiKey
      );

      setPendingSummary(response.content);
      setShowSummaryDialog(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate summary",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSummary = async (editedSummary: string) => {
    if (!activeConversation) return;

    if (import.meta.env.DEV) {
      console.log("💾 handleSaveSummary called");
    }
    await summarizeConversation(activeConversation.id, editedSummary);
    toast({
      title: "Summary Saved",
      description: "Conversation summary has been saved successfully.",
    });
  };

  const handleStartFresh = () => {
    if (!activeConversation) return;
    if (import.meta.env.DEV) {
      console.log("🔄 handleStartFresh called");
    }
    startFreshWithSummary(activeConversation.id);
    toast({
      title: "Fresh Start",
      description: "New conversation created with previous summary.",
    });
  };

  const handleExport = () => {
    if (!activeConversation) return;
    if (import.meta.env.DEV) {
      console.log("📥 handleExport called");
    }
    storage.exportConversation(activeConversation);
    toast({
      title: "Exported",
      description: "Conversation exported successfully.",
    });
  };

  const handleModelChange = (model: string) => {
    if (import.meta.env.DEV) {
      console.log("🔄 Model changed to:", model);
    }
    setCurrentModel(model);
    toast({
      title: "Model Changed",
      description: `Switched to ${MODEL_CONFIGS[model].name}`,
    });
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    renameConversation(id, newTitle);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar
        conversations={state.conversations}
        activeId={state.active_conversation_id}
        onNewConversation={handleNewConversation}
        onSelectConversation={loadConversation}
        onDeleteConversation={deleteConversation}
        onRenameConversation={handleRenameConversation}
        sidebarState={state.uiPreferences.sidebarState}
        sidebarWidth={300}
        onToggleSidebar={toggleSidebar}
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Header - hidden in focus mode */}
        {state.uiPreferences && (
          <Header
            sidebarState={state.uiPreferences.sidebarState}
            activeConversation={activeConversation}
            conversations={state.conversations}
            settings={state.settings}
            currentModel={currentModel}
            lastAutoSummary={lastAutoSummary}
            disabled={isLoading || isSummarizing}
            onSelectConversation={loadConversation}
            onSummarize={handleSummarize}
            onStartFresh={handleStartFresh}
            onExport={handleExport}
            onUpdateSettings={updateSettings}
            //onToggleFocusMode={toggleFocusMode} // ADD THIS
          />
        )}

        <ChatView
          messages={activeConversation?.messages || []}
          onEditMessage={(messageId, newContent) => {
            if (activeConversation) {
              editMessage(activeConversation.id, messageId, newContent);
              toast({
                title: "Message Updated",
                description: "Your message has been edited successfully.",
              });
            }
          }}
        />

        <InputBox
          onSend={handleSendMessage}
          disabled={isLoading || isSummarizing}
          isLoading={isLoading || isSummarizing}
          currentModel={currentModel}
          onModelChange={handleModelChange}
          hasMessages={(activeConversation?.messages.length || 0) > 0}
          onStop={() => {}}
        />
      </div>

      {/* Focus Mode Overlay */}
      {/* <AnimatePresence>
        {state.uiPreferences.focusMode && (
          <FocusModeOverlay onExit={toggleFocusMode} />
        )}
      </AnimatePresence> */}

      <SummaryEditDialog
        open={showSummaryDialog}
        onOpenChange={setShowSummaryDialog}
        summary={pendingSummary}
        onSave={handleSaveSummary}
        isLoading={isLoading}
      />
    </div>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ContextManager />
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
