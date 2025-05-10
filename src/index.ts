import { ModelEnum, AI_PROVIDER_TYPE } from "llm-info";
import { OpenAI } from "openai";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface SendPromptOptions {
  messages: Message[];
  model: ModelEnum;
  provider: AI_PROVIDER_TYPE;
  apiKey: string;
}

export function sendPrompt(options: SendPromptOptions) {
  const { messages, model, provider, apiKey } = options;

  if (provider !== "openai") {
    throw new Error(`Provider ${provider} is not supported yet`);
  }

  const openai = new OpenAI({
    apiKey,
  });

  return openai.chat.completions.create({
    model,
    messages,
  });
}
