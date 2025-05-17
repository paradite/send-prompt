import {
  ModelEnum,
  AI_PROVIDERS,
  ModelInfoMap,
  AI_PROVIDER_CONFIG,
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

export type SystemMessage = BaseMessage & {
  role: "system";
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

export type OpenAIMessage =
  | UserMessage
  | AssistantMessage
  | DeveloperMessage
  | SystemMessage;

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
  usage?: {
    completionTokens: number;
    promptTokens: number;
    totalTokens: number;
    thoughtsTokens: number;
  };
  reasoning?: string;
  durationMs?: number;
};

export type OpenAIChatCompletionResponse =
  OpenAI.Chat.Completions.ChatCompletion;

export type AnthropicAPIResponse = Anthropic.Messages.Message;

export type PromptOptions = {
  messages: InputMessage[];
  systemPrompt?: string;
  tools?: FunctionDefinition[];
  toolCallMode?: "ANY" | "AUTO";
};

export type HeadersOptions = {
  headers?: Record<string, string>;
};

export type FirstPartyProviderOptions = {
  provider:
    | typeof AI_PROVIDERS.OPENAI
    | typeof AI_PROVIDERS.ANTHROPIC
    | typeof AI_PROVIDERS.GOOGLE;
  model: ModelEnum;
  apiKey: string;
} & HeadersOptions;

export type BaseURLProviderOptions = {
  provider:
    | typeof AI_PROVIDERS.OPENROUTER
    | typeof AI_PROVIDERS.FIREWORKS
    | typeof AI_PROVIDERS.DEEPSEEK;
  customModel: string;
  apiKey: string;
} & HeadersOptions;

export type CustomProviderOptions = {
  provider: "custom";
  baseURL: string;
  customModel: string;
  apiKey: string;
} & HeadersOptions;

export type GoogleVertexAIProviderOptions = {
  provider: typeof AI_PROVIDERS.GOOGLE_VERTEX_AI;
  model: string;
  vertexai: true;
  project: string;
  location: string;
};

export type ProviderOptions =
  | FirstPartyProviderOptions
  | BaseURLProviderOptions
  | CustomProviderOptions
  | GoogleVertexAIProviderOptions;

export type TransformSupportedProvider =
  | typeof AI_PROVIDERS.OPENAI
  | typeof AI_PROVIDERS.ANTHROPIC
  | typeof AI_PROVIDERS.GOOGLE;

export function transformMessagesForProvider({
  messages,
  provider,
  systemPrompt,
  systemRole,
}: {
  messages: InputMessage[];
  provider: TransformSupportedProvider;
  systemPrompt: string | undefined;
  systemRole: "system" | "developer";
}): TransformedMessages {
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
          role: systemRole,
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
    default: {
      const exhaustiveCheck: never = provider;
      throw new Error(`Unhandled provider case: ${exhaustiveCheck}`);
    }
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

  // Extract reasoning content if available
  if ("reasoning_content" in message) {
    standardizedResponse.reasoning = (message as any).reasoning_content;
  }

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

  if (response.usage) {
    const {
      prompt_tokens,
      completion_tokens,
      total_tokens,
      completion_tokens_details,
    } = response.usage;
    standardizedResponse.usage = {
      promptTokens: prompt_tokens,
      completionTokens: completion_tokens,
      totalTokens: total_tokens,
      thoughtsTokens: completion_tokens_details?.reasoning_tokens || 0,
    };
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

  if (response.usage) {
    const {
      input_tokens,
      output_tokens,
      cache_creation_input_tokens,
      cache_read_input_tokens,
    } = response.usage;
    standardizedResponse.usage = {
      promptTokens: input_tokens,
      completionTokens: output_tokens,
      totalTokens:
        input_tokens +
        (cache_creation_input_tokens || 0) +
        (cache_read_input_tokens || 0) +
        output_tokens,
      // Anthropic doesn't return thoughts tokens
      thoughtsTokens: 0,
    };
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

  const standardizedResponse: StandardizedResponse = {
    message: {
      role: "assistant",
      content: response.text || "",
    },
    ...(tool_calls ? { tool_calls } : {}),
  };

  if (response.usageMetadata) {
    const {
      promptTokenCount,
      candidatesTokenCount,
      totalTokenCount,
      thoughtsTokenCount,
    } = response.usageMetadata;
    standardizedResponse.usage = {
      promptTokens: promptTokenCount || 0,
      completionTokens: (candidatesTokenCount || 0) + (thoughtsTokenCount || 0),
      totalTokens: totalTokenCount || 0,
      thoughtsTokens: thoughtsTokenCount || 0,
    };
  }

  return standardizedResponse;
}

export async function sendPrompt(
  promptOptions: PromptOptions,
  providerOptions: ProviderOptions
): Promise<StandardizedResponse> {
  const startTime = Date.now();
  const { messages, systemPrompt, tools } = promptOptions;
  let providerToTransform: TransformSupportedProvider;
  let systemRole: "system" | "developer" = "developer";
  if (providerOptions.provider === AI_PROVIDERS.OPENAI) {
    providerToTransform = AI_PROVIDERS.OPENAI;
    systemRole = "developer";
  } else if (providerOptions.provider === AI_PROVIDERS.FIREWORKS) {
    providerToTransform = AI_PROVIDERS.OPENAI;
    systemRole = "system";
  } else if (providerOptions.provider === AI_PROVIDERS.OPENROUTER) {
    providerToTransform = AI_PROVIDERS.OPENAI;
    systemRole = "system";
  } else if (providerOptions.provider === AI_PROVIDERS.DEEPSEEK) {
    providerToTransform = AI_PROVIDERS.OPENAI;
    systemRole = "system";
  } else if (providerOptions.provider === AI_PROVIDERS.GOOGLE_VERTEX_AI) {
    providerToTransform = AI_PROVIDERS.GOOGLE;
    systemRole = "system";
  } else if (providerOptions.provider === "custom") {
    providerToTransform = AI_PROVIDERS.OPENAI;
    systemRole = "system";
  } else {
    providerToTransform = providerOptions.provider;
    systemRole = "system";
  }
  const transformed = transformMessagesForProvider({
    messages,
    provider: providerToTransform,
    systemPrompt,
    systemRole,
  });

  let response: StandardizedResponse;
  switch (providerOptions.provider) {
    case AI_PROVIDERS.OPENAI: {
      if (!isTransformedOpenAI(transformed)) {
        throw new Error("Messages were not properly transformed for OpenAI");
      }
      const openai = new OpenAI({
        apiKey: providerOptions.apiKey,
        dangerouslyAllowBrowser: true,
        ...(providerOptions.headers
          ? { defaultHeaders: providerOptions.headers }
          : {}),
      });
      const openaiResponse = await openai.chat.completions.create({
        model: providerOptions.model,
        messages: transformed.messages,
        tools: tools?.map((tool: FunctionDefinition) => ({
          type: tool.type,
          function: tool.function,
        })),
      });

      response = transformOpenAIResponse(openaiResponse);
      break;
    }

    case AI_PROVIDERS.ANTHROPIC: {
      if (!isTransformedAnthropic(transformed)) {
        throw new Error("Messages were not properly transformed for Anthropic");
      }
      const anthropic = new Anthropic({
        apiKey: providerOptions.apiKey,
        dangerouslyAllowBrowser: true,
        ...(providerOptions.headers
          ? { defaultHeaders: providerOptions.headers }
          : {}),
      });
      let betas: Anthropic.Beta.AnthropicBeta[] | undefined = undefined;
      if (providerOptions.model === ModelEnum["claude-3-7-sonnet-20250219"]) {
        // use token-efficient-tools-2025-02-19 beta for claude-3-7-sonnet-20250219
        betas = ["token-efficient-tools-2025-02-19"];
      }
      let maxTokens =
        ModelInfoMap[providerOptions.model].outputTokenLimit ||
        DEFAULT_MAX_TOKENS;
      if (tools && tools.length > 0) {
        // limit max tokens to default max tokens for function calling
        maxTokens = DEFAULT_MAX_TOKENS;
      }
      const claudeRes = await anthropic.beta.messages.create({
        model: providerOptions.model,
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
      response = transformAnthropicResponse(claudeRes);
      break;
    }

    case AI_PROVIDERS.GOOGLE:
    case AI_PROVIDERS.GOOGLE_VERTEX_AI: {
      if (!isTransformedGoogle(transformed)) {
        throw new Error("Messages were not properly transformed for Google");
      }
      let ai: GoogleGenAI;
      console.log("options", providerOptions);
      console.log("vertexai" in providerOptions);
      if (providerOptions.provider === AI_PROVIDERS.GOOGLE_VERTEX_AI) {
        // Google Vertex AI
        ai = new GoogleGenAI({
          vertexai: true,
          project: process.env.GOOGLE_CLOUD_PROJECT,
          location: process.env.GOOGLE_CLOUD_LOCATION,
        });
      } else {
        // Google GenAI
        ai = new GoogleGenAI({
          vertexai: false,
          apiKey: providerOptions.apiKey,
        });
      }

      console.log("model", providerOptions.model);
      console.log("ai.vertexai", ai.vertexai);

      // Prepare config for function calling if tools are provided
      let config: any = { systemInstruction: systemPrompt };
      if (tools && tools.length > 0) {
        config = {
          ...config,
          toolConfig: {
            functionCallingConfig: {
              mode:
                promptOptions.toolCallMode === "ANY"
                  ? FunctionCallingConfigMode.ANY
                  : FunctionCallingConfigMode.AUTO,
              allowedFunctionNames:
                promptOptions.toolCallMode === "ANY"
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

      const googleResponse = await ai.models.generateContent({
        model: providerOptions.model,
        contents: transformed.messages,
        config,
      });

      response = transformGoogleResponse(googleResponse);
      break;
    }

    case AI_PROVIDERS.OPENROUTER:
    case AI_PROVIDERS.DEEPSEEK:
    case AI_PROVIDERS.FIREWORKS: {
      if (!isTransformedOpenAI(transformed)) {
        throw new Error(
          "Messages were not properly transformed for OpenAI-compatible provider"
        );
      }
      const openai = new OpenAI({
        apiKey: providerOptions.apiKey,
        baseURL: AI_PROVIDER_CONFIG[providerOptions.provider].baseURL,
        dangerouslyAllowBrowser: true,
        ...(providerOptions.headers
          ? { defaultHeaders: providerOptions.headers }
          : {}),
      });
      const openaiResponse = await openai.chat.completions.create({
        model: providerOptions.customModel,
        messages: transformed.messages,
        tools: tools?.map((tool: FunctionDefinition) => ({
          type: tool.type,
          function: tool.function,
        })),
      });

      // TODO: Handle OpenRouter response errors
      // {
      //   error: {
      //     message: 'Provider returned error',
      //     code: 429,
      //     metadata: {
      //       raw: 'google/gemini-2.0-flash-exp:free is temporarily rate-limited upstream; please retry shortly.',
      //       provider_name: 'Google AI Studio'
      //     }
      //   },
      //   user_id: 'user_xyz'
      // }
      response = transformOpenAIResponse(openaiResponse);
      break;
    }

    case "custom": {
      // Handle custom providers
      if (!isTransformedOpenAI(transformed)) {
        throw new Error(
          "Messages were not properly transformed for OpenAI-compatible provider"
        );
      }
      const openai = new OpenAI({
        apiKey: providerOptions.apiKey,
        baseURL: providerOptions.baseURL,
        dangerouslyAllowBrowser: true,
        ...(providerOptions.headers
          ? { defaultHeaders: providerOptions.headers }
          : {}),
      });
      const openaiResponse = await openai.chat.completions.create({
        model: providerOptions.customModel,
        messages: transformed.messages,
        tools: tools?.map((tool: FunctionDefinition) => ({
          type: tool.type,
          function: tool.function,
        })),
      });

      response = transformOpenAIResponse(openaiResponse);
      break;
    }
  }

  const endTime = Date.now();
  const durationMs = endTime - startTime;
  return {
    ...response,
    durationMs,
  };
}
