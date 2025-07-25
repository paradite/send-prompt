import {
  ModelEnum,
  AI_PROVIDERS,
  ModelInfoMap,
  AI_PROVIDER_CONFIG,
} from "llm-info";
import { OpenAI, AzureOpenAI } from "openai";
import Anthropic from "@anthropic-ai/sdk";
import {
  GoogleGenAI,
  FunctionCallingConfigMode,
  GenerateContentResponse,
  FunctionCall as GoogleFunctionCall,
  FunctionResponse as GoogleFunctionResponse,
  GenerateContentResponseUsageMetadata,
} from "@google/genai";
import { processBase64Image } from "./utils/image";
import {
  extractReasoningFromTags,
  extractReasoningFromMessage,
} from "./utils/reasoning";
import { CompletionUsage } from "openai/resources/completions";
import {
  BetaMessageDeltaUsage,
  BetaUsage,
} from "@anthropic-ai/sdk/resources/beta/messages/messages";

// Re-export commonly used types from llm-info
export { ModelEnum, AI_PROVIDERS };

type TextContent = {
  type: "text";
  text: string;
};

type ImageContent = {
  type: "image_url";
  image_url: {
    url: string;
  };
};

type BaseImageMessage = {
  content: (ImageContent | TextContent)[];
};

type BaseTextMessage = {
  content: string;
};

export type UserTextMessage = BaseTextMessage & {
  role: "user";
};

export type UserImageMessage = BaseImageMessage & {
  role: "user";
};

export type AssistantTextMessage = BaseTextMessage & {
  role: "assistant";
};

export type DeveloperMessage = BaseTextMessage & {
  role: "developer";
};

export type SystemMessage = BaseTextMessage & {
  role: "system";
};

// https://googleapis.github.io/js-genai/release_docs/interfaces/types.FunctionCall.html
export type GoogleFunctionCallMessage = {
  role: "google_function_call";
  args: Record<string, unknown>;
  id: string | undefined;
  name: string;
};

// https://googleapis.github.io/js-genai/release_docs/classes/types.FunctionResponse.html
export type GoogleFunctionResponseMessage = {
  role: "google_function_response";
  id: string | undefined;
  name: string;
  response: Record<string, unknown>;
};

export type InputMessage =
  | UserTextMessage
  | UserImageMessage
  | AssistantTextMessage
  | GoogleFunctionCallMessage
  | GoogleFunctionResponseMessage;

export type OpenAIMessage =
  | UserTextMessage
  | UserImageMessage
  | AssistantTextMessage
  | DeveloperMessage
  | SystemMessage;

export type AnthropicMessage = {
  role: "user" | "assistant";
  content: (
    | { type: "text"; text: string }
    | {
        type: "image";
        source: {
          type: "base64";
          media_type: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
          data: string;
        };
      }
  )[];
};

// TODO: support image messages for google
export type GoogleMessage = {
  role: "user" | "model";
  parts: (
    | { text: string }
    | { functionCall: GoogleFunctionCall }
    | { functionResponse: GoogleFunctionResponse }
    | { inlineData: { mimeType: string; data: string } }
  )[];
};

// helper predicate to check if a message is google message
function isGoogleMessage(
  message:
    | UserTextMessage
    | UserImageMessage
    | AssistantTextMessage
    | DeveloperMessage
    | SystemMessage
    | GoogleMessage
): message is GoogleMessage {
  return (
    (message.role === "user" || message.role === "model") &&
    "parts" in message &&
    !("content" in message)
  );
}

// helper predicate to check if a message is a user text message
function isUserTextMessage(
  message:
    | UserTextMessage
    | UserImageMessage
    | AssistantTextMessage
    | DeveloperMessage
    | SystemMessage
    | GoogleMessage
): message is UserTextMessage {
  if (isGoogleMessage(message)) {
    return false;
  }
  return typeof message.content === "string";
}

// helper predicate to check if a message is a user image message
function isUserImageMessage(
  message:
    | UserTextMessage
    | UserImageMessage
    | AssistantTextMessage
    | DeveloperMessage
    | SystemMessage
    | GoogleMessage
): message is UserImageMessage {
  if (isGoogleMessage(message)) {
    return false;
  }
  return Array.isArray(message.content);
}

export type FunctionCall = {
  id: string | undefined;
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
    completionTokensWithoutThoughts: number;
    promptTokens: number;
    totalTokens: number;
    thoughtsTokens: number;
  };
  reasoning?: string;
  durationMs: number;
};

export type OpenAIChatCompletionResponse =
  OpenAI.Chat.Completions.ChatCompletion;

export type AnthropicAPIResponse = Anthropic.Messages.Message;

// Streaming callback types
export type StreamingContentCallback = (content: string) => void;

export type PromptOptions = {
  messages: InputMessage[];
  systemPrompt?: string;
  tools?: FunctionDefinition[];
  toolCallMode?: "ANY" | "AUTO";
  anthropicMaxTokens?: number;
  temperature?: number;
  // Streaming options
  stream?: boolean;
  onStreamingContent?: StreamingContentCallback;
};

export type HeadersOptions = {
  headers?: Record<string, string>;
};

export type FirstPartyProviderOptions = {
  provider:
    | typeof AI_PROVIDERS.OPENAI
    | typeof AI_PROVIDERS.ANTHROPIC
    | typeof AI_PROVIDERS.GOOGLE;
  apiKey: string;
} & HeadersOptions &
  (
    | { model: ModelEnum; customModel?: never }
    | { model?: never; customModel: string }
  );

export type OpenRouterProviderOptions = {
  order?: string[];
  only?: string[];
  ignore?: string[];
};

export type BaseURLProviderOptions = {
  provider:
    | typeof AI_PROVIDERS.OPENROUTER
    | typeof AI_PROVIDERS.FIREWORKS
    | typeof AI_PROVIDERS.DEEPSEEK
    | typeof AI_PROVIDERS.XAI;
  customModel: string;
  apiKey: string;
} & HeadersOptions &
  (
    | { provider: typeof AI_PROVIDERS.OPENROUTER; providerOptions?: OpenRouterProviderOptions }
    | { provider: typeof AI_PROVIDERS.FIREWORKS; providerOptions?: never }
    | { provider: typeof AI_PROVIDERS.DEEPSEEK; providerOptions?: never }
    | { provider: typeof AI_PROVIDERS.XAI; providerOptions?: never }
  );

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

export type AzureOpenAIProviderOptions = {
  provider: typeof AI_PROVIDERS.AZURE_OPENAI;
  model: string;
  apiKey: string;
  endpoint: string;
  deployment: string;
  apiVersion: string;
} & HeadersOptions;

export type ProviderOptions =
  | FirstPartyProviderOptions
  | BaseURLProviderOptions
  | CustomProviderOptions
  | GoogleVertexAIProviderOptions
  | AzureOpenAIProviderOptions;

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
      const openaiMessages: OpenAIMessage[] = messages.filter(
        (msg) =>
          msg.role !== "google_function_call" &&
          msg.role !== "google_function_response"
      );
      if (systemPrompt) {
        const systemMessage: SystemMessage | DeveloperMessage = {
          role: systemRole,
          content: systemPrompt,
        };
        openaiMessages.unshift(systemMessage);
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
        .map((msg) => {
          if (isUserImageMessage(msg)) {
            // Convert UserImageMessage to AnthropicMessage format
            return {
              role: msg.role,
              content: msg.content.map((content) => {
                if (content.type === "text") {
                  return content;
                } else {
                  const { mimeType, base64Data } = processBase64Image(
                    content.image_url.url
                  );
                  return {
                    type: "image",
                    source: {
                      type: "base64",
                      media_type: mimeType,
                      data: base64Data,
                    },
                  };
                }
              }),
            };
          } else if (isUserTextMessage(msg)) {
            return {
              role: msg.role,
              content: [{ type: "text", text: msg.content }],
            };
          }
          throw new Error(
            `Unsupported message type for Anthropic: ${msg.role}`
          );
        });
      return {
        provider: AI_PROVIDERS.ANTHROPIC,
        messages: anthropicMessages,
      };
    }
    case AI_PROVIDERS.GOOGLE: {
      // Convert messages to Gemini format
      const googleMessages: GoogleMessage[] = messages
        .map((msg) => {
          if (msg.role === "google_function_call") {
            // https://googleapis.github.io/js-genai/release_docs/interfaces/types.FunctionCall.html
            const functionCall: GoogleFunctionCall = {
              ...(msg.id ? { id: msg.id } : {}),
              args: msg.args,
              name: msg.name,
            };
            const functionCallMessage: GoogleMessage = {
              role: "model",
              parts: [{ functionCall }],
            };
            return functionCallMessage;
          } else if (msg.role === "google_function_response") {
            // https://googleapis.github.io/js-genai/release_docs/classes/types.FunctionResponse.html
            const functionResponse: GoogleFunctionResponse = {
              ...(msg.id ? { id: msg.id } : {}),
              name: msg.name,
              response: msg.response,
            };
            const functionResponseMessage: GoogleMessage = {
              role: "user",
              parts: [{ functionResponse }],
            };
            return functionResponseMessage;
          }
          const role: "user" | "model" =
            msg.role === "assistant" ? "model" : msg.role;

          if (isUserImageMessage(msg)) {
            // Convert UserImageMessage to GoogleMessage format
            const parts = msg.content.map((content) => {
              if (content.type === "text") {
                return { text: content.text };
              } else {
                const { mimeType, base64Data } = processBase64Image(
                  content.image_url.url
                );
                return {
                  inlineData: {
                    mimeType,
                    data: base64Data,
                  },
                };
              }
            });
            return {
              role,
              parts,
            };
          } else if (isUserTextMessage(msg)) {
            return {
              role,
              parts: [{ text: msg.content }],
            };
          }
          throw new Error(`Unsupported message type for Google: ${msg.role}`);
        })
        .filter((msg) => msg.parts.length > 0);
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
  response: OpenAIChatCompletionResponse,
  options?: {
    countThoughtsTokensInCompletionTokens?: boolean;
  }
): Omit<StandardizedResponse, "durationMs"> {
  const message = response.choices[0].message;
  const content = message.content || "";

  const standardizedResponse: Omit<StandardizedResponse, "durationMs"> = {
    message: {
      role: "assistant",
      content: content,
    },
  };

  // Extract reasoning content if available
  const reasoning = extractReasoningFromMessage(message);
  if (reasoning) {
    standardizedResponse.reasoning = reasoning;
  } else {
    // Try to extract reasoning from tags if not found in reasoning_content
    const { reasoning, cleanedContent } = extractReasoningFromTags(content);
    if (reasoning) {
      standardizedResponse.reasoning = reasoning;
      standardizedResponse.message.content = cleanedContent;
    }
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
    const thoughtsTokens = completion_tokens_details?.reasoning_tokens || 0;
    // Add thoughtsTokens to completionTokens if countThoughtsTokensInCompletionTokens is true (for most providers we need to do this)
    // Otherwise, completionTokens is the same as completionTokensWithoutThoughts (for OpenRouter, we need to do this)
    const countThoughtsTokensInCompletionTokens =
      options?.countThoughtsTokensInCompletionTokens ?? true;
    standardizedResponse.usage = {
      promptTokens: prompt_tokens,
      completionTokens: countThoughtsTokensInCompletionTokens
        ? completion_tokens + thoughtsTokens
        : completion_tokens,
      // completionTokensWithoutThoughts excludes reasoning tokens
      completionTokensWithoutThoughts: countThoughtsTokensInCompletionTokens
        ? completion_tokens
        : completion_tokens - thoughtsTokens,
      // totalTokens from API already includes all tokens
      totalTokens: total_tokens,
      thoughtsTokens: thoughtsTokens,
    };
  }

  return standardizedResponse;
}

function transformAnthropicResponse(
  response: AnthropicAPIResponse
): Omit<StandardizedResponse, "durationMs"> {
  const standardizedResponse: Omit<StandardizedResponse, "durationMs"> = {
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
      // For Anthropic, completion tokens are the same with or without thoughts
      completionTokensWithoutThoughts: output_tokens,
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
): Omit<StandardizedResponse, "durationMs"> {
  let tool_calls: FunctionCall[] | undefined = undefined;
  if (response.functionCalls && Array.isArray(response.functionCalls)) {
    tool_calls = response.functionCalls.map((call: GoogleFunctionCall) => ({
      id: call.id,
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

  const standardizedResponse: Omit<StandardizedResponse, "durationMs"> = {
    message: {
      role: "assistant",
      content: response.text || "",
    },
    ...(tool_calls ? { tool_calls } : {}),
  };

  if (response.usageMetadata) {
    const { promptTokenCount, candidatesTokenCount, thoughtsTokenCount } =
      response.usageMetadata;
    const promptTokens = promptTokenCount || 0;
    const thoughtsTokens = thoughtsTokenCount || 0;
    const candidatesOnly = candidatesTokenCount || 0;
    const completionTokens = candidatesOnly + thoughtsTokens;
    standardizedResponse.usage = {
      promptTokens: promptTokens,
      completionTokens: completionTokens,
      // Google's candidatesTokenCount excludes reasoning tokens
      completionTokensWithoutThoughts: candidatesOnly,
      // totalTokens should equal promptTokens + completionTokens
      totalTokens: promptTokens + completionTokens,
      thoughtsTokens: thoughtsTokens,
    };
  }

  return standardizedResponse;
}

export async function sendPrompt(
  promptOptions: PromptOptions,
  providerOptions: ProviderOptions
): Promise<StandardizedResponse> {
  const startTime = Date.now();
  const {
    messages,
    systemPrompt,
    tools,
    temperature,
    stream,
    onStreamingContent,
  } = promptOptions;

  // Validate streaming options
  if (stream) {
    // Support OpenAI, Anthropic, Google, Google Vertex AI, OpenRouter, DeepSeek, Fireworks, XAI, Azure OpenAI, and custom providers for streaming
    if (
      providerOptions.provider !== AI_PROVIDERS.OPENAI &&
      providerOptions.provider !== AI_PROVIDERS.ANTHROPIC &&
      providerOptions.provider !== AI_PROVIDERS.GOOGLE &&
      providerOptions.provider !== AI_PROVIDERS.GOOGLE_VERTEX_AI &&
      providerOptions.provider !== AI_PROVIDERS.OPENROUTER &&
      providerOptions.provider !== AI_PROVIDERS.DEEPSEEK &&
      providerOptions.provider !== AI_PROVIDERS.FIREWORKS &&
      providerOptions.provider !== AI_PROVIDERS.XAI &&
      providerOptions.provider !== AI_PROVIDERS.AZURE_OPENAI &&
      providerOptions.provider !== "custom"
    ) {
      throw new Error(
        "Streaming is only supported for OpenAI, Anthropic, Google, Google Vertex AI, OpenRouter, DeepSeek, Fireworks, XAI, Azure OpenAI, and custom providers"
      );
    }

    // Don't support streaming with tool calls
    if (tools && tools.length > 0) {
      throw new Error("Streaming is not supported when using tool calls");
    }

    // Require streaming callbacks
    if (!onStreamingContent) {
      throw new Error(
        "onStreamingContent callback is required when streaming is enabled"
      );
    }
  }

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
  } else if (providerOptions.provider === AI_PROVIDERS.XAI) {
    providerToTransform = AI_PROVIDERS.OPENAI;
    systemRole = "system";
  } else if (providerOptions.provider === AI_PROVIDERS.GOOGLE_VERTEX_AI) {
    providerToTransform = AI_PROVIDERS.GOOGLE;
    systemRole = "system";
  } else if (providerOptions.provider === AI_PROVIDERS.AZURE_OPENAI) {
    providerToTransform = AI_PROVIDERS.OPENAI;
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

  let response: Omit<StandardizedResponse, "durationMs">;
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

      // Get the model name from either model or customModel field
      const modelName = providerOptions.model || providerOptions.customModel;

      // Create unified parameters for both streaming and non-streaming
      const createParams = {
        model: modelName,
        messages: transformed.messages,
        tools: tools?.map((tool: FunctionDefinition) => ({
          type: tool.type,
          function: tool.function,
        })),
        ...(temperature !== undefined ? { temperature } : {}),
      };

      if (stream && onStreamingContent) {
        // Handle streaming
        const streamResponse = await openai.chat.completions.create({
          ...createParams,
          stream: true,
          stream_options: {
            include_usage: true,
          },
        });

        let fullContent = "";
        let finalUsage: CompletionUsage | undefined = undefined;

        for await (const chunk of streamResponse) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            fullContent += content;
            onStreamingContent(content);
          }

          // Capture usage information from the final chunk
          if (chunk.usage) {
            finalUsage = chunk.usage;
          }
        }

        // Create standardized response directly from streaming data
        const standardizedResponse: Omit<StandardizedResponse, "durationMs"> = {
          message: {
            role: "assistant",
            content: fullContent,
          },
        };

        // Add usage information if available
        if (finalUsage) {
          const thoughtsTokens =
            finalUsage.completion_tokens_details?.reasoning_tokens || 0;
          standardizedResponse.usage = {
            promptTokens: finalUsage.prompt_tokens,
            completionTokens: finalUsage.completion_tokens + thoughtsTokens,
            completionTokensWithoutThoughts: finalUsage.completion_tokens,
            totalTokens: finalUsage.total_tokens,
            thoughtsTokens: thoughtsTokens,
          };
        }

        response = standardizedResponse;
      } else {
        // Handle non-streaming
        const openaiResponse = await openai.chat.completions.create(
          createParams
        );
        response = transformOpenAIResponse(openaiResponse);
      }
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

      // Get the model name from either model or customModel field
      const modelName = providerOptions.model || providerOptions.customModel;

      let betas: Anthropic.Beta.AnthropicBeta[] | undefined = undefined;
      if (providerOptions.model === ModelEnum["claude-3-7-sonnet-20250219"]) {
        // use token-efficient-tools-2025-02-19 beta for claude-3-7-sonnet-20250219
        betas = ["token-efficient-tools-2025-02-19"];
      }

      // Default value for max tokens in case anthropicMaxTokens is not provided
      // Anthropic API requires max_tokens to be set
      const ANTHROPIC_DEFAULT_MAX_TOKENS = 4096;

      let maxTokens =
        promptOptions.anthropicMaxTokens || ANTHROPIC_DEFAULT_MAX_TOKENS;

      // Only use ModelInfoMap if we have a model enum, not a custom model string
      if (providerOptions.model && ModelInfoMap[providerOptions.model]) {
        maxTokens =
          promptOptions.anthropicMaxTokens ||
          ModelInfoMap[providerOptions.model].outputTokenLimit ||
          ANTHROPIC_DEFAULT_MAX_TOKENS;
      }

      if (tools && tools.length > 0) {
        // limit max tokens to default max tokens for function calling
        maxTokens =
          promptOptions.anthropicMaxTokens || ANTHROPIC_DEFAULT_MAX_TOKENS;
      }

      // Create unified parameters for both streaming and non-streaming
      const createParams = {
        model: modelName,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: transformed.messages,
        tools: tools?.map((tool) => ({
          name: tool.function.name,
          description: tool.function.description,
          input_schema: tool.function.parameters,
        })),
        betas,
        ...(temperature !== undefined ? { temperature } : {}),
      };

      if (stream && onStreamingContent) {
        // Handle streaming
        const streamResponse = await anthropic.beta.messages.create({
          ...createParams,
          stream: true,
        });

        let fullContent = "";
        let initialUsage: BetaUsage | undefined = undefined;
        let finalUsage: BetaMessageDeltaUsage | undefined = undefined;

        for await (const chunk of streamResponse) {
          if (chunk.type === "message_start" && chunk.message.usage) {
            // Capture initial usage information from message_start
            initialUsage = chunk.message.usage;
          } else if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            const content = chunk.delta.text || "";
            if (content) {
              fullContent += content;
              onStreamingContent(content);
            }
          } else if (chunk.type === "message_delta" && chunk.usage) {
            // Capture final usage information from the message_delta event
            finalUsage = chunk.usage;
          }
        }

        // Create standardized response directly from streaming data
        const standardizedResponse: Omit<StandardizedResponse, "durationMs"> = {
          message: {
            role: "assistant",
            content: fullContent,
          },
        };

        // Add usage information if available
        if (initialUsage && finalUsage) {
          const {
            input_tokens,
            cache_creation_input_tokens,
            cache_read_input_tokens,
          } = initialUsage;
          const { output_tokens } = finalUsage;
          standardizedResponse.usage = {
            promptTokens: input_tokens || 0,
            completionTokens: output_tokens || 0,
            // For Anthropic, completion tokens are the same with or without thoughts
            completionTokensWithoutThoughts: output_tokens || 0,
            totalTokens:
              (input_tokens || 0) +
              (cache_creation_input_tokens || 0) +
              (cache_read_input_tokens || 0) +
              (output_tokens || 0),
            // Anthropic doesn't return thoughts tokens
            thoughtsTokens: 0,
          };
        }

        response = standardizedResponse;
      } else {
        // Handle non-streaming
        const claudeRes = await anthropic.beta.messages.create(createParams);
        response = transformAnthropicResponse(claudeRes);
      }
      break;
    }

    case AI_PROVIDERS.GOOGLE:
    case AI_PROVIDERS.GOOGLE_VERTEX_AI: {
      if (!isTransformedGoogle(transformed)) {
        throw new Error("Messages were not properly transformed for Google");
      }
      let ai: GoogleGenAI;
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

      // Get the model name from either model or customModel field
      let modelName: string;
      if (providerOptions.provider === AI_PROVIDERS.GOOGLE_VERTEX_AI) {
        modelName = providerOptions.model;
      } else {
        modelName = providerOptions.model || providerOptions.customModel;
      }

      // Prepare config for function calling if tools are provided
      let config: any = {
        ...(systemPrompt ? { systemInstruction: systemPrompt } : {}),
        ...(temperature !== undefined ? { temperature } : {}),
      };
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

      if (stream && onStreamingContent) {
        // Handle streaming
        const streamResponse = await ai.models.generateContentStream({
          model: modelName,
          contents: transformed.messages,
          config,
        });

        let fullContent = "";
        let finalUsageMetadata:
          | GenerateContentResponseUsageMetadata
          | undefined = undefined;

        for await (const chunk of streamResponse) {
          const content = chunk.text || "";
          if (content) {
            fullContent += content;
            onStreamingContent(content);
          }

          // Capture usage information from the chunk
          if (chunk.usageMetadata) {
            finalUsageMetadata = chunk.usageMetadata;
          }
        }

        console.log("finalUsageMetadata", finalUsageMetadata);

        // Create standardized response directly from streaming data
        const standardizedResponse: Omit<StandardizedResponse, "durationMs"> = {
          message: {
            role: "assistant",
            content: fullContent,
          },
        };

        // Add usage information if available
        if (finalUsageMetadata) {
          const { promptTokenCount, candidatesTokenCount, thoughtsTokenCount } =
            finalUsageMetadata;
          const promptTokens = promptTokenCount || 0;
          const thoughtsTokens = thoughtsTokenCount || 0;
          const candidatesOnly = candidatesTokenCount || 0;
          const completionTokens = candidatesOnly + thoughtsTokens;
          standardizedResponse.usage = {
            promptTokens: promptTokens,
            completionTokens: completionTokens,
            // Google's candidatesTokenCount excludes reasoning tokens
            completionTokensWithoutThoughts: candidatesOnly,
            // totalTokens should equal promptTokens + completionTokens
            totalTokens: promptTokens + completionTokens,
            thoughtsTokens: thoughtsTokens,
          };
        }

        response = standardizedResponse;
      } else {
        // Handle non-streaming
        const googleResponse = await ai.models.generateContent({
          model: modelName,
          contents: transformed.messages,
          config,
        });

        response = transformGoogleResponse(googleResponse);
      }
      break;
    }

    case AI_PROVIDERS.OPENROUTER: {
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

      // Create unified parameters for both streaming and non-streaming
      const createParams = {
        model: providerOptions.customModel,
        messages: transformed.messages,
        tools: tools?.map((tool: FunctionDefinition) => ({
          type: tool.type,
          function: tool.function,
        })),
        ...(temperature !== undefined ? { temperature } : {}),
        ...(providerOptions.provider === AI_PROVIDERS.OPENROUTER && providerOptions.providerOptions 
          ? { provider: providerOptions.providerOptions }
          : {}),
      };

      if (stream && onStreamingContent) {
        // Handle streaming
        const streamResponse = await openai.chat.completions.create({
          ...createParams,
          stream: true,
          stream_options: {
            include_usage: true,
          },
        });

        let fullContent = "";
        let finalUsage: CompletionUsage | undefined = undefined;

        for await (const chunk of streamResponse) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            fullContent += content;
            onStreamingContent(content);
          }

          // Capture usage information from the final chunk
          if (chunk.usage) {
            finalUsage = chunk.usage;
          }
        }

        // Create standardized response directly from streaming data
        const standardizedResponse: Omit<StandardizedResponse, "durationMs"> = {
          message: {
            role: "assistant",
            content: fullContent,
          },
        };

        // Add usage information if available
        if (finalUsage) {
          const thoughtsTokens =
            finalUsage.completion_tokens_details?.reasoning_tokens || 0;
          standardizedResponse.usage = {
            promptTokens: finalUsage.prompt_tokens,
            // OpenRouter already includes thoughtsTokens in completionTokens
            completionTokens: finalUsage.completion_tokens,
            completionTokensWithoutThoughts:
              finalUsage.completion_tokens - thoughtsTokens,
            totalTokens: finalUsage.total_tokens,
            thoughtsTokens: thoughtsTokens,
          };
        }

        response = standardizedResponse;
      } else {
        // Handle non-streaming
        const openaiResponse = await openai.chat.completions.create({
          ...createParams,
          // @ts-expect-error
          usage: {
            include: true,
          },
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
        // OpenRouter already includes thoughtsTokens in completionTokens, so we don't need to count them again
        response = transformOpenAIResponse(openaiResponse, {
          countThoughtsTokensInCompletionTokens: false,
        });
      }
      break;
    }

    case AI_PROVIDERS.DEEPSEEK:
    case AI_PROVIDERS.FIREWORKS:
    case AI_PROVIDERS.XAI: {
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

      // Create unified parameters for both streaming and non-streaming
      const createParams = {
        model: providerOptions.customModel,
        messages: transformed.messages,
        tools: tools?.map((tool: FunctionDefinition) => ({
          type: tool.type,
          function: tool.function,
        })),
        ...(temperature !== undefined ? { temperature } : {}),
      };

      if (stream && onStreamingContent) {
        // Handle streaming
        const streamResponse = await openai.chat.completions.create({
          ...createParams,
          stream: true,
          stream_options: {
            include_usage: true,
          },
        });

        let fullContent = "";
        let finalUsage: CompletionUsage | undefined = undefined;

        for await (const chunk of streamResponse) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            fullContent += content;
            onStreamingContent(content);
          }

          // Capture usage information from the final chunk
          if (chunk.usage) {
            finalUsage = chunk.usage;
          }
        }

        // Create standardized response directly from streaming data
        const standardizedResponse: Omit<StandardizedResponse, "durationMs"> = {
          message: {
            role: "assistant",
            content: fullContent,
          },
        };

        // Add usage information if available
        if (finalUsage) {
          const thoughtsTokens =
            finalUsage.completion_tokens_details?.reasoning_tokens || 0;
          standardizedResponse.usage = {
            promptTokens: finalUsage.prompt_tokens,
            completionTokens: finalUsage.completion_tokens + thoughtsTokens,
            completionTokensWithoutThoughts: finalUsage.completion_tokens,
            totalTokens: finalUsage.total_tokens,
            thoughtsTokens: thoughtsTokens,
          };
        }

        response = standardizedResponse;
      } else {
        // Handle non-streaming
        const openaiResponse = await openai.chat.completions.create(
          createParams
        );
        response = transformOpenAIResponse(openaiResponse);
      }
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

      // Create unified parameters for both streaming and non-streaming
      const createParams = {
        model: providerOptions.customModel,
        messages: transformed.messages,
        tools: tools?.map((tool: FunctionDefinition) => ({
          type: tool.type,
          function: tool.function,
        })),
        ...(temperature !== undefined ? { temperature } : {}),
      };

      if (stream && onStreamingContent) {
        // Handle streaming
        const streamResponse = await openai.chat.completions.create({
          ...createParams,
          stream: true,
          stream_options: {
            include_usage: true,
          },
        });

        let fullContent = "";
        let finalUsage: CompletionUsage | undefined = undefined;

        for await (const chunk of streamResponse) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            fullContent += content;
            onStreamingContent(content);
          }

          // Capture usage information from the final chunk
          if (chunk.usage) {
            finalUsage = chunk.usage;
          }
        }

        // Create standardized response directly from streaming data
        const standardizedResponse: Omit<StandardizedResponse, "durationMs"> = {
          message: {
            role: "assistant",
            content: fullContent,
          },
        };

        // Add usage information if available
        if (finalUsage) {
          const thoughtsTokens =
            finalUsage.completion_tokens_details?.reasoning_tokens || 0;
          standardizedResponse.usage = {
            promptTokens: finalUsage.prompt_tokens,
            completionTokens: finalUsage.completion_tokens + thoughtsTokens,
            completionTokensWithoutThoughts: finalUsage.completion_tokens,
            totalTokens: finalUsage.total_tokens,
            thoughtsTokens: thoughtsTokens,
          };
        }

        response = standardizedResponse;
      } else {
        // Handle non-streaming
        const openaiResponse = await openai.chat.completions.create(
          createParams
        );
        response = transformOpenAIResponse(openaiResponse);
      }
      break;
    }

    case AI_PROVIDERS.AZURE_OPENAI: {
      if (!isTransformedOpenAI(transformed)) {
        throw new Error(
          "Messages were not properly transformed for Azure OpenAI"
        );
      }
      const azureOpenAI = new AzureOpenAI({
        apiKey: providerOptions.apiKey,
        endpoint: providerOptions.endpoint,
        apiVersion: providerOptions.apiVersion,
        deployment: providerOptions.deployment,
        dangerouslyAllowBrowser: true,
        ...(providerOptions.headers
          ? { defaultHeaders: providerOptions.headers }
          : {}),
      });

      // Create unified parameters for both streaming and non-streaming
      const createParams = {
        model: providerOptions.deployment,
        messages: transformed.messages,
        tools: tools?.map((tool: FunctionDefinition) => ({
          type: tool.type,
          function: tool.function,
        })),
        ...(temperature !== undefined ? { temperature } : {}),
      };

      if (stream && onStreamingContent) {
        // Handle streaming
        const streamResponse = await azureOpenAI.chat.completions.create({
          ...createParams,
          stream: true,
          stream_options: {
            include_usage: true,
          },
        });

        let fullContent = "";
        let finalUsage: CompletionUsage | undefined = undefined;

        for await (const chunk of streamResponse) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            fullContent += content;
            onStreamingContent(content);
          }

          // Capture usage information from the final chunk
          if (chunk.usage) {
            finalUsage = chunk.usage;
          }
        }

        // Create standardized response directly from streaming data
        const standardizedResponse: Omit<StandardizedResponse, "durationMs"> = {
          message: {
            role: "assistant",
            content: fullContent,
          },
        };

        // Add usage information if available
        if (finalUsage) {
          const thoughtsTokens =
            finalUsage.completion_tokens_details?.reasoning_tokens || 0;
          standardizedResponse.usage = {
            promptTokens: finalUsage.prompt_tokens,
            completionTokens: finalUsage.completion_tokens + thoughtsTokens,
            completionTokensWithoutThoughts: finalUsage.completion_tokens,
            totalTokens: finalUsage.total_tokens,
            thoughtsTokens: thoughtsTokens,
          };
        }

        response = standardizedResponse;
      } else {
        // Handle non-streaming
        const azureOpenAIResponse = await azureOpenAI.chat.completions.create(
          createParams
        );
        response = transformOpenAIResponse(azureOpenAIResponse);
      }
      break;
    }
    default: {
      const unknownProvider: never = providerOptions;
      throw new Error(`Unhandled provider case: ${unknownProvider}`);
    }
  }

  const endTime = Date.now();
  const durationMs = endTime - startTime;
  return {
    ...response,
    durationMs,
  };
}
