// import { AppState, Conversation, Settings } from "@/types";

// const STORAGE_KEY = "context-manager-state";

// const DEFAULT_SETTINGS: Settings = {
//   apiKeys: {
//     openai: "",
//     anthropic: "",
//     google: "",
//   },
//   defaultModel: "gemini-2.0-flash",
//   defaultTemperature: 0.7,
//   defaultMaxTokens: 2000,
//   autoSummarization: {
//     enabled: true,
//     threshold: 0.7,
//     keepRecentCount: 10,
//     style: "structured",
//   },
// };

// export const storage = {
//   loadState(): AppState {
//     try {
//       const data = localStorage.getItem(STORAGE_KEY);
//       if (!data) {
//         return {
//           conversations: {},
//           settings: DEFAULT_SETTINGS,
//           active_conversation_id: null,
//         };
//       }
//       const loadedState = JSON.parse(data);
      
//       // Merge loaded settings with defaults to handle new settings fields
//       return {
//         ...loadedState,
//         settings: {
//           ...DEFAULT_SETTINGS,
//           ...loadedState.settings,
//           // Ensure autoSummarization exists with defaults if missing
//           autoSummarization: loadedState.settings?.autoSummarization || DEFAULT_SETTINGS.autoSummarization,
//         },
//       };
//     } catch (error) {
//       console.error("Failed to load state:", error);
//       return {
//         conversations: {},
//         settings: DEFAULT_SETTINGS,
//         active_conversation_id: null,
//       };
//     }
//   },

//   saveState(state: AppState): void {
//     try {
//       localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
//     } catch (error) {
//       console.error("Failed to save state:", error);
//     }
//   },

//   exportConversation(conversation: Conversation): void {
//     const dataStr = JSON.stringify(conversation, null, 2);
//     const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
//     const exportFileDefaultName = `conversation-${conversation.id}.json`;

//     const linkElement = document.createElement("a");
//     linkElement.setAttribute("href", dataUri);
//     linkElement.setAttribute("download", exportFileDefaultName);
//     linkElement.click();
//   },
// };


import { AppState, Conversation } from "@/types";
import {
  encryptApiKey,
  decryptApiKey,
  safeLocalStorageGet,
  safeLocalStorageSet,
} from "@/lib/security";

const STORAGE_KEY = "context-manager-state";
const API_KEYS_KEY = "context-manager-api-keys-encrypted"; // Separate storage for encrypted keys

const defaultState: AppState = {
  conversations: {},
  settings: {
    apiKeys: {
      openai: "",
      anthropic: "",
      google: "",
    },
    defaultModel: "gpt-4o",
    defaultTemperature: 0.7,
    defaultMaxTokens: 4096,
    autoSummarization: {
      enabled: true,
      threshold: 0.7,
      keepRecentCount: 10,
      style: "concise",
    },
  },
  active_conversation_id: null,
  uiPreferences: {
    sidebarState: "full",
    sidebarWidth: 300,
    focusMode: false,
  },
};

export const storage = {
  /**
   * Loads state from localStorage and decrypts API keys
   */
  async loadState(): Promise<AppState> {
    try {
      // Load main state
      const stateResult = safeLocalStorageGet(STORAGE_KEY);
      if (!stateResult.success || !stateResult.value) {
        if (import.meta.env.DEV) {
          console.log("📦 No stored state found, using defaults");
        }
        return defaultState;
      }

      const parsed = JSON.parse(stateResult.value);
      
      // Load and decrypt API keys separately
      const keysResult = safeLocalStorageGet(API_KEYS_KEY);
      if (keysResult.success && keysResult.value) {
        try {
          const encryptedKeys = JSON.parse(keysResult.value);
          const decryptedKeys = {
            openai: await decryptApiKey(encryptedKeys.openai || ""),
            anthropic: await decryptApiKey(encryptedKeys.anthropic || ""),
            google: await decryptApiKey(encryptedKeys.google || ""),
          };
          
          // Merge decrypted keys into settings
          parsed.settings = {
            ...parsed.settings,
            apiKeys: decryptedKeys,
          };
        } catch (keyError) {
          // If decryption fails, might be old unencrypted format - try to migrate
          if (parsed.settings?.apiKeys) {
            // Old format detected - will be encrypted on next save
            if (import.meta.env.DEV) {
              console.log("⚠️ Migrating unencrypted API keys");
            }
          }
        }
      }

      if (import.meta.env.DEV) {
        console.log("📦 Loaded state from localStorage");
      }

      // Merge with defaults to handle new fields
      return {
        ...defaultState,
        ...parsed,
        uiPreferences: {
          ...defaultState.uiPreferences,
          ...parsed.uiPreferences,
        },
        settings: {
          ...defaultState.settings,
          ...parsed.settings,
        },
      };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("❌ Failed to load state:", error);
      }
      return defaultState;
    }
  },

  /**
   * Saves state to localStorage, encrypting API keys separately
   */
  async saveState(state: AppState): Promise<{ success: boolean; error?: string }> {
    try {
      // Extract API keys for separate encrypted storage
      const apiKeys = state.settings.apiKeys;
      
      // Encrypt API keys
      const encryptedKeys = {
        openai: await encryptApiKey(apiKeys.openai),
        anthropic: await encryptApiKey(apiKeys.anthropic),
        google: await encryptApiKey(apiKeys.google),
      };

      // Save encrypted keys separately
      const keysResult = safeLocalStorageSet(
        API_KEYS_KEY,
        JSON.stringify(encryptedKeys)
      );
      if (!keysResult.success) {
        return keysResult;
      }

      // Save main state without API keys (for security)
      const stateWithoutKeys = {
        ...state,
        settings: {
          ...state.settings,
          apiKeys: {
            openai: "", // Don't store plaintext keys
            anthropic: "",
            google: "",
          },
        },
      };

      const stateResult = safeLocalStorageSet(
        STORAGE_KEY,
        JSON.stringify(stateWithoutKeys)
      );

      if (stateResult.success && import.meta.env.DEV) {
        console.log("💾 State saved to localStorage");
      }

      return stateResult;
    } catch (error: any) {
      const errorMessage = error?.message || "Unknown error";
      if (import.meta.env.DEV) {
        console.error("❌ Failed to save state:", error);
      }
      return {
        success: false,
        error: `Failed to save: ${errorMessage}`,
      };
    }
  },

  /**
   * Updates only API keys (for settings changes)
   */
  async saveApiKeys(apiKeys: { openai: string; anthropic: string; google: string }): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const encryptedKeys = {
        openai: await encryptApiKey(apiKeys.openai),
        anthropic: await encryptApiKey(apiKeys.anthropic),
        google: await encryptApiKey(apiKeys.google),
      };

      return safeLocalStorageSet(API_KEYS_KEY, JSON.stringify(encryptedKeys));
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || "Failed to save API keys",
      };
    }
  },

  /**
   * Exports a conversation (API keys are never included in exports)
   */
  exportConversation(conversation: Conversation): void {
    // Ensure no API keys are in the export
    const safeConversation = {
      ...conversation,
      // Remove any potential sensitive data
    };

    const dataStr = JSON.stringify(safeConversation, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `conversation-${conversation.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    if (import.meta.env.DEV) {
      console.log("📥 Exported conversation:", conversation.id);
    }
  },
};