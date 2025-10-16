import { Message } from "@/types";
import { MODEL_CONFIGS } from "./api";

/**
 * Estimates token count for a message based on the model
 * Uses rough estimation: ~4 characters per token for most models
 */
export function estimateTokens(text: string, modelId?: string): number {
  // More accurate estimation based on model type
  const baseEstimate = Math.ceil(text.length / 4);
  
  // Add overhead for message formatting
  const overhead = 4; // tokens for message role, formatting, etc.
  
  return baseEstimate + overhead;
}

/**
 * Counts total tokens for an array of messages
 */
export function countMessageTokens(messages: Message[], modelId: string): number {
  let totalTokens = 0;
  
  for (const message of messages) {
    // Use metadata tokens if available, otherwise estimate
    if (message.metadata?.tokens) {
      totalTokens += message.metadata.tokens;
    } else {
      totalTokens += estimateTokens(message.content, modelId);
    }
  }
  
  return totalTokens;
}

/**
 * Determines if conversation should be auto-summarized
 */
export function shouldAutoSummarize(
  messages: Message[],
  modelId: string,
  threshold: number = 0.7
): boolean {
  const config = MODEL_CONFIGS[modelId];
  if (!config) return false;
  
  const totalTokens = countMessageTokens(messages, modelId);
  const contextWindow = config.contextWindow;
  const usagePercent = totalTokens / contextWindow;
  
  return usagePercent >= threshold;
}

/**
 * Gets context usage information
 */
export function getContextUsage(messages: Message[], modelId: string) {
  const config = MODEL_CONFIGS[modelId];
  if (!config) {
    return {
      totalTokens: 0,
      contextWindow: 8192,
      usagePercent: 0,
      state: "healthy" as const,
    };
  }
  
  const totalTokens = countMessageTokens(messages, modelId);
  const contextWindow = config.contextWindow;
  const usagePercent = (totalTokens / contextWindow) * 100;
  
  let state: "healthy" | "warning" | "critical" | "danger";
  if (usagePercent < 50) {
    state = "healthy";
  } else if (usagePercent < 70) {
    state = "warning";
  } else if (usagePercent < 90) {
    state = "critical";
  } else {
    state = "danger";
  }
  
  return {
    totalTokens,
    contextWindow,
    usagePercent,
    state,
  };
}
