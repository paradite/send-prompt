# send-prompt

[![NPM version](https://img.shields.io/npm/v/send-prompt)](https://www.npmjs.com/package/send-prompt)

A TypeScript library for interacting with models across providers with standardized interfaces and tool calling.

Related projects:

- [llm-info](https://github.com/paradite/llm-info): Information on LLM models, context window token limit, output token limit, pricing and more.
- [ai-file-edit](https://github.com/paradite/ai-file-edit): A library for editing files using AI models.
- [model-quirks](https://github.com/paradite/model-quirks): Quirks, edge cases, and interesting bits of various models.
- [16x Eval](https://eval.16x.engineer): Your personal workspace for prompt engineering and model evaluation.

## Features

- 🔄 Unified interface with comprehensive model support:
  - First-party providers (OpenAI, Anthropic, Google, DeepSeek)
  - Third-party providers (Vertex AI, Azure OpenAI, OpenRouter, Fireworks)
  - Custom providers with OpenAI-compatible API
- 🔧 Supports function calling and system prompt
- 📝 Standardized message format and response structure
- 🛠️ Full TypeScript support for type safety
- 🎯 No additional dependencies for each provider
- 🛡️ Handles all edge cases (message format, function calling, multi-round conversations)
- 🎨 Provider specific options (headers, reasoning extraction)
- 🖼️ Support for image input in messages (base64 and URL formats)
- ⚡ Streaming support for real-time responses across all providers

## Quick Demo

```typescript
import { sendPrompt } from "send-prompt";
import { AI_PROVIDERS, ModelEnum } from "llm-info";

const response = await sendPrompt(
  {
    messages: [
      { role: "user", content: "What's the weather like in Singapore?" },
    ],
    tools: [weatherTool],
  },
  {
    model: ModelEnum["gpt-4.1"],
    // model: ModelEnum["claude-3-7-sonnet-20250219"],
    // model: ModelEnum["gemini-2.5-pro-exp-03-25"],
    provider: AI_PROVIDERS.OPENAI,
    // provider: AI_PROVIDERS.ANTHROPIC,
    // provider: AI_PROVIDERS.GOOGLE,
    apiKey: process.env.API_KEY,
  }
);

console.log(response.message.content);
```

## Installation

```bash
# Install llm-info to get the model and provider information
npm install llm-info
# Install send-prompt to send prompt to models
npm install send-prompt
```

## Usage

### Basic Usage

The same function `sendPrompt` works across all providers:

```typescript
import { sendPrompt } from "send-prompt";
import { AI_PROVIDERS, ModelEnum } from "llm-info";

// OpenAI
const openaiResponse = await sendPrompt(
  {
    messages: [{ role: "user", content: "Hello, who are you?" }],
    systemPrompt: "You are a helpful assistant.",
  },
  {
    model: ModelEnum["gpt-4.1"],
    provider: AI_PROVIDERS.OPENAI,
    apiKey: "your-openai-api-key",
  }
);

// Anthropic
const anthropicResponse = await sendPrompt(
  {
    messages: [{ role: "user", content: "Hello, who are you?" }],
    systemPrompt: "You are a helpful assistant.",
  },
  {
    model: ModelEnum["claude-3-7-sonnet-20250219"],
    provider: AI_PROVIDERS.ANTHROPIC,
    apiKey: "your-anthropic-api-key",
  }
);

// Google
const googleResponse = await sendPrompt(
  {
    messages: [{ role: "user", content: "Hello, who are you?" }],
    systemPrompt: "You are a helpful assistant.",
  },
  {
    model: ModelEnum["gemini-2.5-pro-exp-03-25"],
    provider: AI_PROVIDERS.GOOGLE,
    apiKey: "your-google-api-key",
  }
);

// Google Vertex AI (requires gcloud CLI authentication)
// https://cloud.google.com/vertex-ai/generative-ai/docs/start/quickstarts/quickstart-multimodal
const googleVertexResponse = await sendPrompt(
  {
    messages: [{ role: "user", content: "Hello, who are you?" }],
    systemPrompt: "You are a helpful assistant.",
  },
  {
    model: ModelEnum["gemini-2.5-pro-exp-03-25"],
    provider: AI_PROVIDERS.GOOGLE_VERTEX_AI,
    vertexai: true,
    project: process.env.GOOGLE_CLOUD_PROJECT!, // Your Google Cloud project ID
    location: process.env.GOOGLE_CLOUD_LOCATION!, // Your Google Cloud location (e.g., "us-central1")
  }
);

// OpenRouter
const openrouterResponse = await sendPrompt(
  {
    messages: [{ role: "user", content: "Hello, who are you?" }],
    systemPrompt: "You are a helpful assistant.",
  },
  {
    customModel: "meta-llama/llama-4-scout:free",
    provider: AI_PROVIDERS.OPENROUTER,
    apiKey: "your-openrouter-api-key",
    headers: {
      "HTTP-Referer": "https://eval.16x.engineer/",
      "X-Title": "16x Eval",
    },
  }
);

// Fireworks
const fireworksResponse = await sendPrompt(
  {
    messages: [{ role: "user", content: "Hello, who are you?" }],
    systemPrompt: "You are a helpful assistant.",
  },
  {
    customModel: "accounts/fireworks/models/deepseek-v3-0324",
    provider: AI_PROVIDERS.FIREWORKS,
    apiKey: "your-fireworks-api-key",
  }
);

// DeepSeek
const deepseekResponse = await sendPrompt(
  {
    messages: [{ role: "user", content: "Hello, who are you?" }],
    systemPrompt: "You are a helpful assistant.",
  },
  {
    customModel: "deepseek-chat",
    provider: AI_PROVIDERS.DEEPSEEK,
    apiKey: "your-deepseek-api-key",
  }
);

// Custom Provider
const customResponse = await sendPrompt(
  {
    messages: [{ role: "user", content: "Hello, who are you?" }],
    systemPrompt: "You are a helpful assistant.",
  },
  {
    customModel: "custom-model",
    provider: "custom",
    baseURL: "https://your-custom-api.com/v1",
    apiKey: "your-custom-api-key",
  }
);

// All responses have the same structure
console.log(openaiResponse.message.content);
```

### Custom Models for First Party Providers

The `model` field is an enum of all models supported by the library, this is useful to avoid typos and to get the correct model information.

In case you want to use a model that is not yet available in the enum, you can use `customModel` field instead. This is supported for all first party providers (OpenAI, Anthropic, Google).

```typescript
// Using custom model string for new models
const response = await sendPrompt(
  {
    messages: [{ role: "user", content: "Hello, who are you?" }],
  },
  {
    customModel: "gpt-4o-mini", // Custom model string
    provider: AI_PROVIDERS.OPENAI,
    apiKey: "your-openai-api-key",
  }
);
```

Note that the `model` and `customModel` fields are mutually exclusive.

### Image Input

You can send images to models that support vision capabilities:

```typescript
const imageResponse = await sendPrompt(
  {
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "What's in this image?" },
          {
            type: "image_url",
            image_url: {
              url: "data:image/jpeg;base64,/9j/4AAQSkZJRg...", // base64 image data
            },
          },
        ],
      },
    ],
  },
  {
    model: ModelEnum["gpt-4.1"],
    provider: AI_PROVIDERS.OPENAI,
    apiKey: "your-openai-api-key",
  }
);
```

### Function Calling

```typescript
// Define your tool
const calculatorTool = {
  type: "function",
  function: {
    name: "calculator",
    description: "Perform basic arithmetic calculations",
    parameters: {
      type: "object",
      properties: {
        operation: {
          type: "string",
          enum: ["add", "subtract", "multiply", "divide"],
          description: "The arithmetic operation to perform",
        },
        a: {
          type: "number",
          description: "First number",
        },
        b: {
          type: "number",
          description: "Second number",
        },
      },
      required: ["operation", "a", "b"],
      additionalProperties: false,
    },
    strict: true,
  },
};

const response = await sendPrompt(
  {
    messages: [{ role: "user", content: "What is 5 plus 3?" }],
    tools: [calculatorTool],
  },
  {
    model: ModelEnum["gpt-4.1"],
    provider: AI_PROVIDERS.OPENAI,
    apiKey: "your-openai-api-key",
  }
);

// Expected response structure:
// {
//   tool_calls: [
//     {
//       id: "call_123",
//       type: "function",
//       function: {
//         name: "calculator",
//         arguments: '{"operation":"add","a":5,"b":3}'
//       }
//     }
//   ]
// }

// Handle the function call
if (response.tool_calls) {
  const toolCall = response.tool_calls[0];
  console.log("Tool called:", toolCall.function.name);
  console.log("Arguments:", JSON.parse(toolCall.function.arguments));
}
```

### Provider Options

#### Headers

You can pass custom headers to providers using the `headers` option:

```typescript
const response = await sendPrompt(
  {
    messages: [{ role: "user", content: "Hello" }],
  },
  {
    model: ModelEnum["gpt-4.1"],
    provider: AI_PROVIDERS.OPENAI,
    apiKey: "your-api-key",
    headers: {
      "Custom-Header": "value",
      "X-Title": "My App",
    },
  }
);
```

#### Temperature

You can control the randomness of the model's responses using the `temperature` parameter. Temperature ranges from 0 to 2, where lower values make the output more focused and deterministic, while higher values make it more random and creative:

```typescript
const response = await sendPrompt(
  {
    messages: [{ role: "user", content: "Write a creative story" }],
    temperature: 0.8, // More creative and random
  },
  {
    model: ModelEnum["gpt-4.1"],
    provider: AI_PROVIDERS.OPENAI,
    apiKey: "your-api-key",
  }
);

// For more deterministic responses
const deterministicResponse = await sendPrompt(
  {
    messages: [{ role: "user", content: "What is 2 + 2?" }],
    temperature: 0.1, // More focused and deterministic
  },
  {
    model: ModelEnum["claude-3-7-sonnet-20250219"],
    provider: AI_PROVIDERS.ANTHROPIC,
    apiKey: "your-api-key",
  }
);
```

The temperature parameter is supported across all providers (OpenAI, Anthropic, Google, OpenRouter, Fireworks, DeepSeek, Azure OpenAI, and custom providers). If not specified, each provider will use its default temperature value.

#### Anthropic Max Tokens

For Anthropic models, you can control the maximum number of tokens in the response using the `anthropicMaxTokens` option:

```typescript
const response = await sendPrompt(
  {
    messages: [{ role: "user", content: "Write a long story" }],
    anthropicMaxTokens: 2000, // Limit response to 2000 tokens
  },
  {
    model: ModelEnum["claude-3-7-sonnet-20250219"],
    provider: AI_PROVIDERS.ANTHROPIC,
    apiKey: "your-anthropic-api-key",
  }
);
```

If not specified, it will use the model's default output token limit or 4096 tokens, whichever is smaller. When using function calling, it will default to 4096 tokens.

#### Reasoning Extraction

For providers that support it (like DeepSeek), you can extract the model's reasoning from the response:

```typescript
const response = await sendPrompt(
  {
    messages: [
      { role: "user", content: "Solve this math problem: 2x + 5 = 15" },
    ],
  },
  {
    model: ModelEnum["deepseek-reasoner"],
    provider: AI_PROVIDERS.DEEPSEEK,
    apiKey: "your-api-key",
  }
);

if (response.reasoning) {
  console.log("Model's reasoning:", response.reasoning);
}
```

#### OpenRouter Provider Options

For OpenRouter, you can control provider routing using the `providerOptions` field. This allows you to specify which providers to use, their order, and which ones to avoid:

```typescript
const response = await sendPrompt(
  {
    messages: [{ role: "user", content: "Hello, world!" }],
  },
  {
    provider: AI_PROVIDERS.OPENROUTER,
    customModel: "openai/gpt-4o-mini",
    apiKey: "your-openrouter-api-key",
    providerOptions: {
      // Specify the order of providers to try
      order: ["openai", "azure"],
      
      // Only allow specific providers
      only: ["openai", "azure"],
      
      // Ignore specific providers
      ignore: ["fireworks"],
    },
  }
);
```

**Available Provider Options:**

- `order`: Array of provider slugs to try in order (e.g., `["openai", "azure"]`)
- `only`: Array of provider slugs to allow for this request (e.g., `["openai"]`)
- `ignore`: Array of provider slugs to skip for this request (e.g., `["fireworks"]`)

You can use these options individually or combine them:

```typescript
// Use only the order preference
const orderResponse = await sendPrompt(
  { messages: [{ role: "user", content: "Hello!" }] },
  {
    provider: AI_PROVIDERS.OPENROUTER,
    customModel: "openai/gpt-4o-mini",
    apiKey: "your-api-key",
    providerOptions: {
      order: ["openai", "azure"]
    }
  }
);

// Restrict to specific providers only
const restrictedResponse = await sendPrompt(
  { messages: [{ role: "user", content: "Hello!" }] },
  {
    provider: AI_PROVIDERS.OPENROUTER,
    customModel: "openai/gpt-4o-mini", 
    apiKey: "your-api-key",
    providerOptions: {
      only: ["openai"]
    }
  }
);

// Ignore certain providers
const filteredResponse = await sendPrompt(
  { messages: [{ role: "user", content: "Hello!" }] },
  {
    provider: AI_PROVIDERS.OPENROUTER,
    customModel: "meta-llama/llama-3.1-8b-instruct",
    apiKey: "your-api-key",
    providerOptions: {
      ignore: ["fireworks", "together"]
    }
  }
);
```

### Streaming

You can stream responses from supported providers to get real-time content as it's generated. Streaming is supported for all providers.

```typescript
const response = await sendPrompt(
  {
    messages: [{ role: "user", content: "Write a short story about a robot" }],
    stream: true,
    onStreamingContent: (content: string) => {
      // This callback is called for each chunk of content
      process.stdout.write(content);
    },
  },
  {
    model: ModelEnum["gpt-4o-mini"],
    provider: AI_PROVIDERS.OPENAI,
    apiKey: "your-openai-api-key",
  }
);

// The function still returns the complete response at the end
console.log("\n\nComplete response:", response.message.content);
console.log("Duration:", response.durationMs, "ms");
if (response.usage) {
  console.log("Token usage:", response.usage);
}
```

**Streaming Limitations:**

- Cannot be used with function calling (`tools` parameter)

### Response Format

The response from `sendPrompt` follows a standardized format across all providers:

- `message`: The main response content
- `tool_calls`: Any function calls made by the model
- `reasoning`: The model's reasoning process (if available)
- `usage`: Token usage information
  - `promptTokens`: Number of tokens in the input messages
  - `thoughtsTokens`: Number of tokens used for reasoning (if available)
  - `completionTokens`: Number of tokens in the model's response (includes thoughts tokens)
  - `completionTokensWithoutThoughts`: Number of tokens in the visible output only (excludes reasoning tokens)
  - `totalTokens`: Total tokens used (includes thoughts tokens)
- `durationMs`: The time taken by the API call in milliseconds

Example response (non-reasoning model):

```typescript
{
  message: {
    role: "assistant",
    content: "I am a helpful assistant."
  },
  usage: {
    completionTokens: 10,
    completionTokensWithoutThoughts: 10, // Same as completionTokens for non-reasoning models
    promptTokens: 20,
    totalTokens: 30,
    thoughtsTokens: 0
  },
  durationMs: 1234
}
```

Example response (reasoning model like XAI's Grok):

```typescript
{
  message: {
    role: "assistant",
    content: "The answer is 4."
  },
  usage: {
    completionTokens: 150,          // Includes both visible output and reasoning
    completionTokensWithoutThoughts: 25, // Only the visible output tokens
    promptTokens: 10,
    totalTokens: 285,               // May include additional overhead
    thoughtsTokens: 125             // Internal reasoning tokens
  },
  durationMs: 2500
}
```

### Multi-round Tool Calls (Google)

For Google's Gemini models, you can handle multi-round tool calls by including function call and response messages in the conversation:

```typescript
// First round - model makes a function call
const firstResponse = await sendPrompt(
  {
    messages: [{ role: "user", content: "What is 15 plus 32?" }],
    tools: [calculatorTool],
    toolCallMode: "AUTO",
  },
  {
    model: ModelEnum["gemini-2.5-pro-exp-03-25"],
    provider: AI_PROVIDERS.GOOGLE,
    apiKey: "your-google-api-key",
  }
);

// Handle the function call and get the result
if (firstResponse.tool_calls) {
  const toolCall = firstResponse.tool_calls[0];
  const args = JSON.parse(toolCall.function.arguments);
  const result = calculate(args.operation, args.a, args.b); // Your calculation function

  // Second round - include function call and response in messages
  const secondResponse = await sendPrompt(
    {
      messages: [
        { role: "user", content: "What is 15 plus 32?" },
        {
          role: "google_function_call",
          id: toolCall.id,
          name: toolCall.function.name,
          args: args,
        },
        {
          role: "google_function_response",
          id: toolCall.id,
          name: toolCall.function.name,
          response: { result },
        },
      ],
      tools: [calculatorTool],
      toolCallMode: "AUTO",
    },
    {
      model: ModelEnum["gemini-2.5-pro-exp-03-25"],
      provider: AI_PROVIDERS.GOOGLE,
      apiKey: "your-google-api-key",
    }
  );

  // The model will now respond with the final answer
  console.log("Final response:", secondResponse.message.content);
}
```

The multi-round tool calling process involves:

1. First round: Model makes a function call
2. Your code executes the function and gets the result
3. Second round: Include both the function call and its response in the messages
4. Model provides the final response using the function result

## Roadmap

- [x] Support for DeepSeek
- [x] Support for image input
- [x] Support for streaming
- [ ] Better error handling
