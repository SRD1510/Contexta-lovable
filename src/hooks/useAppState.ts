import { useState, useEffect } from "react";
import { AppState, Conversation, Message, Settings } from "@/types";
import { storage } from "@/services/storage";
import { MODEL_CONFIGS } from "@/services/api";

export function useAppState() {
  const [state, setState] = useState<AppState>(() => storage.loadState());

  useEffect(() => {
    storage.saveState(state);
  }, [state]);

  const activeConversation = state.active_conversation_id
    ? state.conversations[state.active_conversation_id]
    : null;

  const createConversation = () => {
    const id = `conv-${Date.now()}`;
    const modelId = state.settings.defaultModel;
    const config = MODEL_CONFIGS[modelId];

    const newConversation: Conversation = {
      id,
      title: "New Conversation",
      created_at: new Date().toISOString(),
      messages: [],
      total_tokens: 0,
      summary: null,
      metadata: {
        model: modelId,
        provider: config.provider,
        temperature: state.settings.defaultTemperature,
        maxTokens: state.settings.defaultMaxTokens,
        contextWindow: config.contextWindow,
      },
    };

    setState((prev) => ({
      ...prev,
      conversations: {
        ...prev.conversations,
        [id]: newConversation,
      },
      active_conversation_id: id,
    }));

    return id;
  };

  const loadConversation = (id: string) => {
    setState((prev) => ({
      ...prev,
      active_conversation_id: id,
    }));
  };

  const deleteConversation = (id: string) => {
    setState((prev) => {
      const conversations = { ...prev.conversations };
      delete conversations[id];
      return {
        ...prev,
        conversations,
        active_conversation_id:
          prev.active_conversation_id === id ? null : prev.active_conversation_id,
      };
    });
  };

  const addMessage = (conversationId: string, message: Message) => {
    setState((prev) => {
      const conversation = prev.conversations[conversationId];
      if (!conversation) return prev;

      const updatedConversation: Conversation = {
        ...conversation,
        messages: [...conversation.messages, message],
        total_tokens: conversation.total_tokens + (message.metadata?.tokens || 0),
      };

      // Auto-generate title from first user message
      if (
        updatedConversation.messages.length === 1 &&
        message.role === "user" &&
        updatedConversation.title === "New Conversation"
      ) {
        updatedConversation.title =
          message.content.substring(0, 50) + (message.content.length > 50 ? "..." : "");
      }

      return {
        ...prev,
        conversations: {
          ...prev.conversations,
          [conversationId]: updatedConversation,
        },
      };
    });
  };

  const replaceMessages = (conversationId: string, messages: Message[], newTokenCount: number) => {
    setState((prev) => {
      const conversation = prev.conversations[conversationId];
      if (!conversation) return prev;

      return {
        ...prev,
        conversations: {
          ...prev.conversations,
          [conversationId]: {
            ...conversation,
            messages,
            total_tokens: newTokenCount,
          },
        },
      };
    });
  };

  const updateSettings = (settings: Partial<Settings>) => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...settings,
      },
    }));
  };

  const summarizeConversation = async (conversationId: string, summary: string) => {
    setState((prev) => {
      const conversation = prev.conversations[conversationId];
      if (!conversation) return prev;

      return {
        ...prev,
        conversations: {
          ...prev.conversations,
          [conversationId]: {
            ...conversation,
            summary,
          },
        },
      };
    });
  };

  const startFreshWithSummary = (conversationId: string) => {
    const conversation = state.conversations[conversationId];
    if (!conversation || !conversation.summary) return;

    const id = `conv-${Date.now()}`;
    const newConversation: Conversation = {
      ...conversation,
      id,
      title: `${conversation.title} (continued)`,
      created_at: new Date().toISOString(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: "system",
          content: `Previous conversation summary: ${conversation.summary}`,
          timestamp: new Date().toISOString(),
        },
      ],
      total_tokens: 0,
      summary: null,
    };

    setState((prev) => ({
      ...prev,
      conversations: {
        ...prev.conversations,
        [id]: newConversation,
      },
      active_conversation_id: id,
    }));
  };

  return {
    state,
    activeConversation,
    createConversation,
    loadConversation,
    deleteConversation,
    addMessage,
    replaceMessages,
    updateSettings,
    summarizeConversation,
    startFreshWithSummary,
  };
}
