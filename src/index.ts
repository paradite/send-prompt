import {
  ModelEnum,
  AI_PROVIDER_TYPE,
  AI_PROVIDERS,
  ModelInfoMap,
} from "llm-info";
import { OpenAI } from "openai";
import Anthropic from "@anthropic-ai/sdk";
import {
  GoogleGenAI,
  FunctionCallingConfigMode,
  GenerateContentResponse,
  FunctionCall as GoogleFunctionCall,
  FunctionResponse as GoogleFunctionResponse,
} from "@google/genai";

const DEFAULT_MAX_TOKENS = 4096;

type BaseMessage = {
  content: string;
};

export type UserMessage = BaseMessage & {
  role: "user";
};

export type AssistantMessage = BaseMessage & {
  role: "assistant";
};

export type DeveloperMessage = BaseMessage & {
  role: "developer";
};

// https://googleapis.github.io/js-genai/release_docs/interfaces/types.FunctionCall.html
export type GoogleFunctionCallMessage = {
  role: "google_function_call";
  args: Record<string, unknown>;
  id: string;
  name: string;
};

// https://googleapis.github.io/js-genai/release_docs/classes/types.FunctionResponse.html
export type GoogleFunctionResponseMessage = {
  role: "google_function_response";
  id: string;
  name: string;
  response: Record<string, unknown>;
};

export type InputMessage =
  | UserMessage
  | AssistantMessage
  | GoogleFunctionCallMessage
  | GoogleFunctionResponseMessage;

export type OpenAIMessage = UserMessage | AssistantMessage | DeveloperMessage;

export type AnthropicMessage = UserMessage | AssistantMessage;

export type GoogleMessage = {
  role: "user" | "model";
  parts: (
    | { text: string }
    | { functionCall: GoogleFunctionCall }
    | { functionResponse: GoogleFunctionResponse }
  )[];
};

export type FunctionCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type FunctionDefinition = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, any>;
      required: string[];
      additionalProperties?: boolean;
    };
    strict?: boolean;
  };
};

type TransformedOpenAIMessages = {
  provider: typeof AI_PROVIDERS.OPENAI;
  messages: OpenAIMessage[];
};

type TransformedAnthropicMessages = {
  provider: typeof AI_PROVIDERS.ANTHROPIC;
  messages: AnthropicMessage[];
};

type TransformedGoogleMessages = {
  provider: typeof AI_PROVIDERS.GOOGLE;
  messages: GoogleMessage[];
};

type TransformedMessages =
  | TransformedOpenAIMessages
  | TransformedAnthropicMessages
  | TransformedGoogleMessages;

export type StandardizedResponse = {
  message: {
    role: "assistant";
    content: string;
  };
  tool_calls?: FunctionCall[];
};

export type OpenAIChatCompletionResponse = {
  choices: Array<{
    message: {
      content: string | null;
      tool_calls?: Array<{
        id: string;
        type: "function";
        function: {
          name: string;
          arguments: string;
        };
      }>;
    };
  }>;
};

export type AnthropicAPIResponse = Anthropic.Messages.Message;

export type SendPromptOptions = {
  messages: InputMessage[];
  model: ModelEnum;
  provider: AI_PROVIDER_TYPE;
  apiKey: string;
  systemPrompt?: string;
  tools?: FunctionDefinition[];
  toolCallMode?: "ANY" | "AUTO";
};

export function transformMessages(
  messages: InputMessage[],
  provider: AI_PROVIDER_TYPE,
  systemPrompt?: string
): TransformedMessages {
  switch (provider) {
    case AI_PROVIDERS.OPENAI: {
      const openaiMessages: OpenAIMessage[] = messages
        .filter(
          (msg) =>
            msg.role !== "google_function_call" &&
            msg.role !== "google_function_response"
        )
        .map(({ role, content }) => {
          return { role, content };
        });
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
      const anthropicMessages: AnthropicMessage[] = messages
        .filter(
          (msg) =>
            msg.role !== "google_function_call" &&
            msg.role !== "google_function_response"
        )
        .map(({ role, content }) => {
          return { role, content };
        });
      return {
        provider: AI_PROVIDERS.ANTHROPIC,
        messages: anthropicMessages,
      };
    }
    case AI_PROVIDERS.GOOGLE: {
      // Convert messages to Gemini format
      const googleMessages: GoogleMessage[] = messages.map((msg) => {
        if (msg.role === "google_function_call") {
          // https://googleapis.github.io/js-genai/release_docs/interfaces/types.FunctionCall.html
          const functionCall: GoogleFunctionCall = {
            id: msg.id,
            args: msg.args,
            name: msg.name,
          };
          return { role: "model", parts: [{ functionCall }] };
        } else if (msg.role === "google_function_response") {
          // https://googleapis.github.io/js-genai/release_docs/classes/types.FunctionResponse.html
          const functionResponse: GoogleFunctionResponse = {
            id: msg.id,
            name: msg.name,
            response: msg.response,
          };
          return { role: "user", parts: [{ functionResponse }] };
        }
        return {
          role: msg.role === "assistant" ? "model" : msg.role,
          parts: [{ text: msg.content }],
        };
      });
      return {
        provider: AI_PROVIDERS.GOOGLE,
        messages: googleMessages,
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

function isTransformedGoogle(
  messages: TransformedMessages
): messages is TransformedGoogleMessages {
  return messages.provider === AI_PROVIDERS.GOOGLE;
}

function transformOpenAIResponse(
  response: OpenAIChatCompletionResponse
): StandardizedResponse {
  const message = response.choices[0].message;

  const standardizedResponse: StandardizedResponse = {
    message: {
      role: "assistant",
      content: message.content || "",
    },
  };

  if (message.tool_calls && message.tool_calls.length > 0) {
    standardizedResponse.tool_calls = message.tool_calls.map((tool) => ({
      id: tool.id,
      type: tool.type,
      function: {
        name: tool.function.name,
        arguments: tool.function.arguments,
      },
    }));
  }

  return standardizedResponse;
}

function transformAnthropicResponse(
  response: AnthropicAPIResponse
): StandardizedResponse {
  const standardizedResponse: StandardizedResponse = {
    message: {
      role: "assistant",
      content:
        response.content
          .filter((c) => c.type === "text")
          .map((c) => c.text)
          .join("") || "",
    },
  };

  const toolCalls = response.content
    .filter((c) => c.type === "tool_use")
    .map((c) => ({
      id: c.id,
      type: "function" as const,
      function: {
        name: c.name,
        arguments: JSON.stringify(
          c.input && typeof c.input === "object" && !Array.isArray(c.input)
            ? (c.input as Record<string, any>)
            : {}
        ),
      },
    }));

  if (toolCalls.length > 0) {
    standardizedResponse.tool_calls = toolCalls;
  }

  return standardizedResponse;
}

function transformGoogleResponse(
  response: GenerateContentResponse
): StandardizedResponse {
  let tool_calls: FunctionCall[] | undefined = undefined;
  if (response.functionCalls && Array.isArray(response.functionCalls)) {
    tool_calls = response.functionCalls.map((call: GoogleFunctionCall) => ({
      id: call.id || "function_call",
      type: "function",
      function: {
        name: call.name || "function_call",
        arguments:
          typeof call.args === "string"
            ? call.args
            : JSON.stringify(call.args || {}),
      },
    }));
  }

  return {
    message: {
      role: "assistant",
      content: response.text || "",
    },
    ...(tool_calls ? { tool_calls } : {}),
  };
}

export async function sendPrompt(
  options: SendPromptOptions
): Promise<StandardizedResponse> {
  const { messages, model, provider, apiKey, systemPrompt, tools } = options;
  const transformed = transformMessages(messages, provider, systemPrompt);

  switch (provider) {
    case AI_PROVIDERS.OPENAI: {
      if (!isTransformedOpenAI(transformed)) {
        throw new Error("Messages were not properly transformed for OpenAI");
      }
      const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
      const response = await openai.chat.completions.create({
        model,
        messages: transformed.messages,
        tools: tools?.map((tool: FunctionDefinition) => ({
          type: tool.type,
          function: tool.function,
        })),
      });

      return transformOpenAIResponse(response);
    }

    case AI_PROVIDERS.ANTHROPIC: {
      if (!isTransformedAnthropic(transformed)) {
        throw new Error("Messages were not properly transformed for Anthropic");
      }
      const anthropic = new Anthropic({
        apiKey,
        dangerouslyAllowBrowser: true,
      });
      let betas: Anthropic.Beta.AnthropicBeta[] | undefined = undefined;
      if (model === ModelEnum["claude-3-7-sonnet-20250219"]) {
        // use token-efficient-tools-2025-02-19 beta for claude-3-7-sonnet-20250219
        betas = ["token-efficient-tools-2025-02-19"];
      }
      let maxTokens =
        ModelInfoMap[model].outputTokenLimit || DEFAULT_MAX_TOKENS;
      if (tools && tools.length > 0) {
        // limit max tokens to default max tokens for function calling
        maxTokens = DEFAULT_MAX_TOKENS;
      }
      const claudeRes = await anthropic.beta.messages.create({
        model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: transformed.messages,
        tools: tools?.map((tool) => ({
          name: tool.function.name,
          description: tool.function.description,
          input_schema: tool.function.parameters,
        })),
        betas,
      });
      return transformAnthropicResponse(claudeRes);
    }

    case AI_PROVIDERS.GOOGLE: {
      if (!isTransformedGoogle(transformed)) {
        throw new Error("Messages were not properly transformed for Google");
      }
      const ai = new GoogleGenAI({ apiKey });

      // Prepare config for function calling if tools are provided
      let config: any = { systemInstruction: systemPrompt };
      if (tools && tools.length > 0) {
        config = {
          ...config,
          toolConfig: {
            functionCallingConfig: {
              mode:
                options.toolCallMode === "ANY"
                  ? FunctionCallingConfigMode.ANY
                  : FunctionCallingConfigMode.AUTO,
              allowedFunctionNames:
                options.toolCallMode === "ANY"
                  ? tools.map((tool) => tool.function.name)
                  : undefined,
            },
          },
          tools: [
            {
              functionDeclarations: tools.map((tool) => ({
                name: tool.function.name,
                description: tool.function.description,
                parameters: {
                  ...tool.function.parameters,
                  additionalProperties: undefined,
                },
              })),
            },
          ],
        };
      }

      const response = await ai.models.generateContent({
        model,
        contents: transformed.messages,
        config,
      });

      return transformGoogleResponse(response);
    }

    default:
      throw new Error(`Provider ${provider} is not supported yet`);
  }
}
