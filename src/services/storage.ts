import { AppState, Conversation, Settings } from "@/types";

const STORAGE_KEY = "context-manager-state";

const DEFAULT_SETTINGS: Settings = {
  apiKeys: {
    openai: "",
    anthropic: "",
    google: "",
  },
  defaultModel: "gemini-2.0-flash",
  defaultTemperature: 0.7,
  defaultMaxTokens: 2000,
  autoSummarization: {
    enabled: true,
    threshold: 0.7,
    keepRecentCount: 10,
    style: "structured",
  },
};

export const storage = {
  loadState(): AppState {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return {
          conversations: {},
          settings: DEFAULT_SETTINGS,
          active_conversation_id: null,
        };
      }
      const loadedState = JSON.parse(data);
      
      // Merge loaded settings with defaults to handle new settings fields
      return {
        ...loadedState,
        settings: {
          ...DEFAULT_SETTINGS,
          ...loadedState.settings,
          // Ensure autoSummarization exists with defaults if missing
          autoSummarization: loadedState.settings?.autoSummarization || DEFAULT_SETTINGS.autoSummarization,
        },
      };
    } catch (error) {
      console.error("Failed to load state:", error);
      return {
        conversations: {},
        settings: DEFAULT_SETTINGS,
        active_conversation_id: null,
      };
    }
  },

  saveState(state: AppState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save state:", error);
    }
  },

  exportConversation(conversation: Conversation): void {
    const dataStr = JSON.stringify(conversation, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `conversation-${conversation.id}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  },
};
