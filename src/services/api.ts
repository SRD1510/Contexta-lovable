import { Message, ModelConfig, Provider } from "@/types";

export const MODEL_CONFIGS: Record<string, ModelConfig> = {
  "gpt-4": {
    id: "gpt-4",
    name: "GPT-4",
    provider: "openai",
    contextWindow: 8192,
    maxOutputTokens: 4096,
    apiEndpoint: "https://api.openai.com/v1/chat/completions",
    requiresApiKey: true,
  },
  "gpt-4-turbo": {
    id: "gpt-4-turbo-preview",
    name: "GPT-4 Turbo",
    provider: "openai",
    contextWindow: 128000,
    maxOutputTokens: 4096,
    apiEndpoint: "https://api.openai.com/v1/chat/completions",
    requiresApiKey: true,
  },
  "gpt-3.5-turbo": {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    provider: "openai",
    contextWindow: 16385,
    maxOutputTokens: 4096,
    apiEndpoint: "https://api.openai.com/v1/chat/completions",
    requiresApiKey: true,
  },
  "claude-3-opus": {
    id: "claude-3-opus-20240229",
    name: "Claude 3 Opus",
    provider: "anthropic",
    contextWindow: 200000,
    maxOutputTokens: 4096,
    apiEndpoint: "https://api.anthropic.com/v1/messages",
    requiresApiKey: true,
  },
  "claude-3-sonnet": {
    id: "claude-3-sonnet-20240229",
    name: "Claude 3 Sonnet",
    provider: "anthropic",
    contextWindow: 200000,
    maxOutputTokens: 4096,
    apiEndpoint: "https://api.anthropic.com/v1/messages",
    requiresApiKey: true,
  },
  "claude-3.5-sonnet": {
    id: "claude-3-5-sonnet-20241022",
    name: "Claude 3.5 Sonnet",
    provider: "anthropic",
    contextWindow: 200000,
    maxOutputTokens: 8192,
    apiEndpoint: "https://api.anthropic.com/v1/messages",
    requiresApiKey: true,
  },
  "gemini-pro": {
    id: "gemini-pro",
    name: "Gemini Pro",
    provider: "google",
    contextWindow: 32768,
    maxOutputTokens: 8192,
    apiEndpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
    requiresApiKey: true,
  },
};

interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface AnthropicMessage {
  role: "user" | "assistant";
  content: string;
}

interface GoogleMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

function formatForProvider(
  messages: Message[],
  provider: Provider
): OpenAIMessage[] | { system: string; messages: AnthropicMessage[] } | { contents: GoogleMessage[] } {
  switch (provider) {
    case "openai":
      return messages.map((msg) => ({
        role: msg.role as "system" | "user" | "assistant",
        content: msg.content,
      }));

    case "anthropic": {
      const systemMessage = messages.find((m) => m.role === "system");
      const nonSystemMessages = messages.filter((m) => m.role !== "system");
      return {
        system: systemMessage?.content || "You are a helpful assistant.",
        messages: nonSystemMessages.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
      };
    }

    case "google":
      return {
        contents: messages
          .filter((m) => m.role !== "system")
          .map((msg) => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }],
          })),
      };

    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

export async function sendMessage(
  messages: Message[],
  modelId: string,
  apiKey: string,
  temperature: number = 0.7,
  maxTokens: number = 2000
): Promise<{ content: string; tokensUsed?: number }> {
  const config = MODEL_CONFIGS[modelId];
  if (!config) {
    throw new Error(`Unknown model: ${modelId}`);
  }

  if (!apiKey) {
    throw new Error(`API key required for ${config.provider}`);
  }

  try {
    switch (config.provider) {
      case "openai": {
        const formattedMessages = formatForProvider(messages, "openai") as OpenAIMessage[];
        const response = await fetch(config.apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: config.id,
            messages: formattedMessages,
            temperature,
            max_tokens: maxTokens,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || "OpenAI API request failed");
        }

        const data = await response.json();
        return {
          content: data.choices[0].message.content,
          tokensUsed: data.usage?.total_tokens,
        };
      }

      case "anthropic": {
        const formatted = formatForProvider(messages, "anthropic") as {
          system: string;
          messages: AnthropicMessage[];
        };
        const response = await fetch(config.apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: config.id,
            system: formatted.system,
            messages: formatted.messages,
            temperature,
            max_tokens: maxTokens,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || "Anthropic API request failed");
        }

        const data = await response.json();
        return {
          content: data.content[0].text,
          tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens,
        };
      }

      case "google": {
        const formatted = formatForProvider(messages, "google") as { contents: GoogleMessage[] };
        const url = `${config.apiEndpoint}?key=${apiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: formatted.contents,
            generationConfig: {
              temperature,
              maxOutputTokens: maxTokens,
            },
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || "Google API request failed");
        }

        const data = await response.json();
        return {
          content: data.candidates[0].content.parts[0].text,
          tokensUsed: data.usageMetadata?.totalTokenCount,
        };
      }

      default:
        throw new Error(`Unsupported provider: ${config.provider}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred while sending message");
  }
}

export function estimateTokens(text: string): number {
  // Rough estimation: ~4 characters per token
  return Math.ceil(text.length / 4);
}
