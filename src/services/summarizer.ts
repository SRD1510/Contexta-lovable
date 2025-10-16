import { Message } from "@/types";
import { sendMessage } from "./api";

export type SummaryStyle = "structured" | "concise" | "research" | "narrative";

const SUMMARIZATION_PROMPTS: Record<SummaryStyle, string> = {
  structured: `You are summarizing a conversation to preserve context efficiently.

Create a concise summary that captures:

1. MAIN TOPIC: What is this conversation about? (1-2 sentences)

2. KEY FACTS: Important information established (bullet points)
   - Include specific details, numbers, decisions
   - Focus on facts that may be referenced later

3. USER CONTEXT: What does the user want to achieve?
   - Their goals or problems
   - Any preferences mentioned

4. CURRENT STATE: Where is the conversation now?
   - What was just discussed
   - What's likely to come next

5. OPEN QUESTIONS: Anything unresolved?

Keep the summary under 400 words while preserving ALL critical information.
Write in third person (e.g., "The user asked about..." not "You asked...").`,

  concise: `Summarize this conversation in the most concise way possible while preserving all critical facts, decisions, and context. Focus on what's essential for continuing the conversation seamlessly. Keep it under 200 words.`,

  research: `Create a detailed research-oriented summary of this conversation including:
- Main research questions or topics explored
- Key findings, facts, and data points discussed
- Methodologies or approaches mentioned
- Conclusions or insights reached
- Outstanding questions or areas for further exploration

Be thorough and academic in tone. Keep under 500 words.`,

  narrative: `Summarize this conversation as a coherent narrative that captures the flow of discussion, the user's journey through the topic, and how the conversation evolved. Maintain a natural storytelling tone while preserving all important information. Keep under 400 words.`,
};

export interface SummarizationConfig {
  enabled: boolean;
  threshold: number;
  keepRecentCount: number;
  style: SummaryStyle;
}

/**
 * Generates a summary of messages using the LLM
 */
export async function generateSummary(
  messages: Message[],
  modelId: string,
  apiKey: string,
  style: SummaryStyle = "structured"
): Promise<string> {
  if (!messages || messages.length === 0) {
    throw new Error("No messages to summarize");
  }

  const prompt = SUMMARIZATION_PROMPTS[style];
  
  // Create conversation context for the LLM
  const conversationContext = messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n\n");

  const summaryRequest: Message[] = [
    {
      id: "summary-system",
      role: "system",
      content: prompt,
      timestamp: new Date().toISOString(),
    },
    {
      id: "summary-user",
      role: "user",
      content: `<conversation>\n${conversationContext}\n</conversation>\n\nCreate the summary now:`,
      timestamp: new Date().toISOString(),
    },
  ];

  try {
    const response = await sendMessage(summaryRequest, modelId, apiKey);
    return response.content;
  } catch (error) {
    throw new Error(
      `Failed to generate summary: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Performs automatic summarization on a conversation
 * Returns new messages array with older messages replaced by summary
 */
export async function autoSummarize(
  messages: Message[],
  modelId: string,
  apiKey: string,
  keepRecentCount: number = 10,
  style: SummaryStyle = "structured"
): Promise<{
  messages: Message[];
  summary: string;
  summarizedCount: number;
  tokensSaved: number;
}> {
  if (messages.length <= keepRecentCount) {
    throw new Error("Not enough messages to summarize");
  }

  // Split messages into old (to summarize) and recent (to keep)
  const splitIndex = messages.length - keepRecentCount;
  const oldMessages = messages.slice(0, splitIndex);
  const recentMessages = messages.slice(splitIndex);

  // Generate summary of old messages
  const summary = await generateSummary(oldMessages, modelId, apiKey, style);

  // Calculate tokens saved (rough estimate)
  const oldTokens = oldMessages.reduce(
    (sum, msg) => sum + (msg.metadata?.tokens || msg.content.length / 4),
    0
  );
  const summaryTokens = summary.length / 4;
  const tokensSaved = Math.floor(oldTokens - summaryTokens);

  // Create summary message
  const summaryMessage: Message = {
    id: `summary-${Date.now()}`,
    role: "system",
    content: `[CONVERSATION SUMMARY]\n\n${summary}`,
    timestamp: new Date().toISOString(),
    metadata: {
      model: modelId,
      provider: "system" as any,
      temperature: 0,
      tokens: Math.ceil(summaryTokens),
      type: "auto_summary",
      originalMessageCount: oldMessages.length,
      messageIds: oldMessages.map((m) => m.id),
      createdAt: new Date().toISOString(),
      summaryStyle: style,
    } as any,
  };

  // Return new messages array with summary + recent messages
  return {
    messages: [summaryMessage, ...recentMessages],
    summary,
    summarizedCount: oldMessages.length,
    tokensSaved,
  };
}
