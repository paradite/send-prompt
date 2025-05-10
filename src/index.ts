import { ModelEnum, AI_PROVIDER_TYPE, AI_PROVIDERS } from "llm-info";
import { OpenAI } from "openai";
import Anthropic from "@anthropic-ai/sdk";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface OpenAIMessage {
  role: "user" | "assistant" | "developer";
  content: string;
}

interface SendPromptOptions {
  messages: Message[];
  model: ModelEnum;
  provider: AI_PROVIDER_TYPE;
  apiKey: string;
  systemPrompt?: string;
}

export async function sendPrompt(options: SendPromptOptions) {
  const { messages, model, provider, apiKey, systemPrompt } = options;

  if (provider === AI_PROVIDERS.OPENAI) {
    const openai = new OpenAI({ apiKey });
    const openaiMessages: OpenAIMessage[] = messages.map(
      ({ role, content }) => ({ role, content })
    );
    if (systemPrompt) {
      openaiMessages.unshift({ role: "developer", content: systemPrompt });
    }
    return openai.chat.completions.create({ model, messages: openaiMessages });
  }

  if (provider === AI_PROVIDERS.ANTHROPIC) {
    const anthropic = new Anthropic({ apiKey });
    const claudeRes = await anthropic.messages.create({
      model,
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map(({ role, content }) => ({ role, content })),
    });
    return {
      choices: [
        {
          message: {
            role: "assistant",
            content: Array.isArray(claudeRes.content)
              ? claudeRes.content.map((c: any) => c.text).join("")
              : claudeRes.content,
          },
        },
      ],
    };
  }

  throw new Error(`Provider ${provider} is not supported yet`);
}
