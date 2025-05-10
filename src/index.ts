import {
  ModelEnum,
  AI_PROVIDER_TYPE,
  AI_PROVIDERS,
  ModelInfoMap,
} from "llm-info";
import { OpenAI } from "openai";
import Anthropic from "@anthropic-ai/sdk";

const DEFAULT_MAX_TOKENS = 4096;

type BaseMessage = {
  content: string;
};

type UserMessage = BaseMessage & {
  role: "user";
};

type AssistantMessage = BaseMessage & {
  role: "assistant";
};

type DeveloperMessage = BaseMessage & {
  role: "developer";
};

type InputMessage = UserMessage | AssistantMessage;

type OpenAIMessage = UserMessage | AssistantMessage | DeveloperMessage;

type AnthropicMessage = UserMessage | AssistantMessage;

type TransformedOpenAIMessages = {
  provider: typeof AI_PROVIDERS.OPENAI;
  messages: OpenAIMessage[];
};

type TransformedAnthropicMessages = {
  provider: typeof AI_PROVIDERS.ANTHROPIC;
  messages: AnthropicMessage[];
};

type TransformedMessages =
  | TransformedOpenAIMessages
  | TransformedAnthropicMessages;

type StandardizedResponse = {
  message: AssistantMessage;
};

type SendPromptOptions = {
  messages: InputMessage[];
  model: ModelEnum;
  provider: AI_PROVIDER_TYPE;
  apiKey: string;
  systemPrompt?: string;
};

function transformMessages(
  messages: InputMessage[],
  provider: AI_PROVIDER_TYPE,
  systemPrompt?: string
): TransformedMessages {
  switch (provider) {
    case AI_PROVIDERS.OPENAI: {
      const openaiMessages: OpenAIMessage[] = messages.map(
        ({ role, content }) => ({ role, content })
      );
      if (systemPrompt) {
        openaiMessages.unshift({
          role: "developer",
          content: systemPrompt,
        });
      }
      return {
        provider: AI_PROVIDERS.OPENAI,
        messages: openaiMessages,
      };
    }
    case AI_PROVIDERS.ANTHROPIC: {
      const anthropicMessages: AnthropicMessage[] = messages.map(
        ({ role, content }) => ({ role, content })
      );
      return {
        provider: AI_PROVIDERS.ANTHROPIC,
        messages: anthropicMessages,
      };
    }
    default:
      throw new Error(`Provider ${provider} is not supported yet`);
  }
}

function isTransformedOpenAI(
  messages: TransformedMessages
): messages is TransformedOpenAIMessages {
  return messages.provider === AI_PROVIDERS.OPENAI;
}

function isTransformedAnthropic(
  messages: TransformedMessages
): messages is TransformedAnthropicMessages {
  return messages.provider === AI_PROVIDERS.ANTHROPIC;
}

export async function sendPrompt(
  options: SendPromptOptions
): Promise<StandardizedResponse> {
  const { messages, model, provider, apiKey, systemPrompt } = options;
  const transformed = transformMessages(messages, provider, systemPrompt);

  switch (provider) {
    case AI_PROVIDERS.OPENAI: {
      if (!isTransformedOpenAI(transformed)) {
        throw new Error("Messages were not properly transformed for OpenAI");
      }
      const openai = new OpenAI({ apiKey });
      const response = await openai.chat.completions.create({
        model,
        messages: transformed.messages,
      });
      return {
        message: {
          role: "assistant",
          content: response.choices[0].message.content || "",
        },
      };
    }

    case AI_PROVIDERS.ANTHROPIC: {
      if (!isTransformedAnthropic(transformed)) {
        throw new Error("Messages were not properly transformed for Anthropic");
      }
      const anthropic = new Anthropic({ apiKey });
      const claudeRes = await anthropic.messages.create({
        model,
        max_tokens: ModelInfoMap[model].outputTokenLimit || DEFAULT_MAX_TOKENS,
        system: systemPrompt,
        messages: transformed.messages,
      });
      return {
        message: {
          role: "assistant",
          content: Array.isArray(claudeRes.content)
            ? claudeRes.content.map((c: any) => c.text).join("")
            : claudeRes.content,
        },
      };
    }

    default:
      throw new Error(`Provider ${provider} is not supported yet`);
  }
}
