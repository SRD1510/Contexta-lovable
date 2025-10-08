export type MessageRole = "user" | "assistant" | "system";

export type Provider = "openai" | "anthropic" | "google";

export interface MessageMetadata {
  model: string;
  provider: Provider;
  temperature: number;
  tokens?: number;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  metadata?: MessageMetadata;
}

export interface ConversationMetadata {
  model: string;
  provider: Provider;
  temperature: number;
  maxTokens: number;
  contextWindow: number;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  messages: Message[];
  total_tokens: number;
  summary: string | null;
  metadata: ConversationMetadata;
}

export interface Settings {
  apiKeys: {
    openai: string;
    anthropic: string;
    google: string;
  };
  defaultModel: string;
  defaultTemperature: number;
  defaultMaxTokens: number;
}

export interface AppState {
  conversations: Record<string, Conversation>;
  settings: Settings;
  active_conversation_id: string | null;
}

export interface ModelConfig {
  id: string;
  name: string;
  provider: Provider;
  contextWindow: number;
  maxOutputTokens: number;
  apiEndpoint: string;
  requiresApiKey: boolean;
}
