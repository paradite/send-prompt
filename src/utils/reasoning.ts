export function extractReasoningFromTags(content: string): {
  reasoning: string | undefined;
  cleanedContent: string;
} {
  // Match content between <think> or <thinking> tags
  const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/i);
  const thinkingMatch = content.match(/<thinking>([\s\S]*?)<\/thinking>/i);

  let reasoning: string | undefined;
  let cleanedContent = content;

  // Return the first match found
  if (thinkMatch) {
    reasoning = thinkMatch[1].trim();
    cleanedContent = content.replace(/<think>[\s\S]*?<\/think>/i, "").trim();
  } else if (thinkingMatch) {
    reasoning = thinkingMatch[1].trim();
    cleanedContent = content
      .replace(/<thinking>[\s\S]*?<\/thinking>/i, "")
      .trim();
  }

  return { reasoning, cleanedContent };
}

export function extractReasoningFromMessage(message: any): string | undefined {
  if ("reasoning_content" in message) {
    // DeepSeek
    // https://api-docs.deepseek.com/guides/reasoning_model
    return message.reasoning_content;
  } else if ("reasoning" in message) {
    // OpenRouter
    // https://openrouter.ai/docs/use-cases/reasoning-tokens
    return message.reasoning;
  }
  return undefined;
}
