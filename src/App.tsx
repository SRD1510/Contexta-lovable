import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAppState } from "@/hooks/useAppState";
import { Sidebar } from "@/components/Sidebar";
import { ChatView } from "@/components/ChatView";
import { InputBox } from "@/components/InputBox";
import { SettingsModal } from "@/components/SettingsModal";
import { SummaryEditDialog } from "@/components/SummaryEditDialog";
import { sendMessage, MODEL_CONFIGS } from "@/services/api";
import { storage } from "@/services/storage";
import { Message } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const queryClient = new QueryClient();

function ContextManager() {
  const {
    state,
    activeConversation,
    createConversation,
    loadConversation,
    deleteConversation,
    addMessage,
    updateSettings,
    summarizeConversation,
    startFreshWithSummary,
  } = useAppState();

  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState(state.settings.defaultModel);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSummaryEdit, setShowSummaryEdit] = useState(false);
  const [pendingSummary, setPendingSummary] = useState("");
  const { toast } = useToast();

  const handleNewConversation = () => {
    createConversation();
  };

  const handleSendMessage = async (content: string) => {
    if (!activeConversation) {
      const newId = createConversation();
      const conversation = state.conversations[newId];
      if (!conversation) return;
    }

    const conversationId = activeConversation?.id || state.active_conversation_id;
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
      content,
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
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!activeConversation) return;

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

      await summarizeConversation(activeConversation.id, response.content);
      setPendingSummary(response.content);
      setShowSummaryEdit(true);
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

  const handleSaveSummary = (editedSummary: string) => {
    if (!activeConversation) return;
    summarizeConversation(activeConversation.id, editedSummary);
    toast({
      title: "Summary Saved",
      description: "Your summary has been updated.",
    });
  };

  const handleStartFresh = () => {
    if (!activeConversation) return;
    startFreshWithSummary(activeConversation.id);
    toast({
      title: "Fresh Start",
      description: "New conversation created with previous summary.",
    });
  };

  const handleExport = () => {
    if (!activeConversation) return;
    storage.exportConversation(activeConversation);
    toast({
      title: "Exported",
      description: "Conversation exported successfully.",
    });
  };

  const handleModelChange = (model: string) => {
    setCurrentModel(model);
    toast({
      title: "Model Changed",
      description: `Switched to ${MODEL_CONFIGS[model].name}`,
    });
  };

  return (
    <>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        {!sidebarCollapsed && (
          <Sidebar
            conversations={state.conversations}
            activeId={state.active_conversation_id}
            activeConversation={activeConversation}
            onNewConversation={handleNewConversation}
            onSelectConversation={loadConversation}
            onDeleteConversation={deleteConversation}
            onSummarize={handleSummarize}
            onStartFresh={handleStartFresh}
            onExport={handleExport}
            disabled={isLoading}
          />
        )}

        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="transition-transform hover:scale-110"
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen className="h-5 w-5" />
                ) : (
                  <PanelLeftClose className="h-5 w-5" />
                )}
              </Button>
              <div>
                <h1 className="text-xl font-bold">
                  {activeConversation?.title || "Context"}
                </h1>
                {activeConversation && (
                  <p className="text-sm text-muted-foreground">
                    {activeConversation.messages.length} messages •{" "}
                    {activeConversation.total_tokens} tokens
                  </p>
                )}
              </div>
            </div>
            <SettingsModal settings={state.settings} onSave={updateSettings} />
          </header>

          <ChatView messages={activeConversation?.messages || []} />

          <InputBox 
            onSend={handleSendMessage} 
            disabled={isLoading} 
            isLoading={isLoading}
            currentModel={currentModel}
            onModelChange={handleModelChange}
            hasMessages={(activeConversation?.messages.length || 0) > 0}
            sidebarCollapsed={sidebarCollapsed}
            activeConversation={activeConversation}
            onSummarize={handleSummarize}
            onStartFresh={handleStartFresh}
            onExport={handleExport}
          />
        </div>
      </div>

      <SummaryEditDialog
        open={showSummaryEdit}
        onOpenChange={setShowSummaryEdit}
        summary={pendingSummary}
        onSave={handleSaveSummary}
        onStartFresh={handleStartFresh}
      />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ContextManager />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
