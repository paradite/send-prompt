# send-prompt

[![NPM version](https://img.shields.io/npm/v/send-prompt)](https://www.npmjs.com/package/send-prompt)

A unified TypeScript library for AI model interactions with standardized interfaces and function calling.

Developed by the team behind [16x Prompt](https://prompt.16x.engineer) and [16x Eval](https://eval.16x.engineer).

Related projects:

- [llm-info](https://github.com/paradite/llm-info): Information on LLM models, context window token limit, output token limit, pricing and more.
- [ai-file-edit](https://github.com/paradite/ai-file-edit): A library for editing files using AI models such as GPT, Claude, and Gemini.

## Features

- 🔄 Unified interface for all major providers (OpenAI, Anthropic, Google, OpenRouter, Fireworks)
- 🤖 Support for latest models (GPT-4.1, Claude 3.7 Sonnet, Gemini 2.5 Pro)
- 🔧 Supports function calling and system prompt
- 📝 Standardized message format and response structure
- 🛠️ Full TypeScript support for type safety
- 🎯 No extra dependencies required except `llm-info` and `send-prompt`
- 🛡️ Handles all edge cases (message format, function calling, multi-round conversations)
- 🔌 Supports custom providers with OpenAI-compatible API

## Quick Demo

```typescript
import { sendPrompt } from "send-prompt";
import { AI_PROVIDERS, ModelEnum } from "llm-info";

const response = await sendPrompt({
  messages: [
    { role: "user", content: "What's the weather like in Singapore?" },
  ],
  model: ModelEnum["gpt-4.1"],
  // model: ModelEnum["claude-3-7-sonnet-20250219"],
  // model: ModelEnum["gemini-2.5-pro-exp-03-25"],
  provider: AI_PROVIDERS.OPENAI,
  // provider: AI_PROVIDERS.ANTHROPIC,
  // provider: AI_PROVIDERS.GOOGLE,
  apiKey: process.env.API_KEY,
  tools: [weatherTool],
});

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
const openaiResponse = await sendPrompt({
  messages: [{ role: "user", content: "Hello, who are you?" }],
  model: ModelEnum["gpt-4.1"],
  provider: AI_PROVIDERS.OPENAI,
  apiKey: "your-openai-api-key",
  systemPrompt: "You are a helpful assistant.",
});

// Anthropic
const anthropicResponse = await sendPrompt({
  messages: [{ role: "user", content: "Hello, who are you?" }],
  model: ModelEnum["claude-3-7-sonnet-20250219"],
  provider: AI_PROVIDERS.ANTHROPIC,
  apiKey: "your-anthropic-api-key",
  systemPrompt: "You are a helpful assistant.",
});

// Google
const googleResponse = await sendPrompt({
  messages: [{ role: "user", content: "Hello, who are you?" }],
  model: ModelEnum["gemini-2.5-pro-exp-03-25"],
  provider: AI_PROVIDERS.GOOGLE,
  apiKey: "your-google-api-key",
  systemPrompt: "You are a helpful assistant.",
});

// Google Vertex AI (requires gcloud CLI authentication)
// https://cloud.google.com/vertex-ai/generative-ai/docs/start/quickstarts/quickstart-multimodal
const googleVertexResponse = await sendPrompt({
  messages: [{ role: "user", content: "Hello, who are you?" }],
  model: ModelEnum["gemini-2.5-pro-exp-03-25"],
  provider: AI_PROVIDERS.GOOGLE,
  vertexai: true,
  project: process.env.GOOGLE_CLOUD_PROJECT!, // Your Google Cloud project ID
  location: process.env.GOOGLE_CLOUD_LOCATION!, // Your Google Cloud location (e.g., "us-central1")
  systemPrompt: "You are a helpful assistant.",
});

// OpenRouter
const openrouterResponse = await sendPrompt({
  messages: [{ role: "user", content: "Hello, who are you?" }],
  model: "meta-llama/llama-4-scout:free",
  provider: AI_PROVIDERS.OPENROUTER,
  apiKey: "your-openrouter-api-key",
  systemPrompt: "You are a helpful assistant.",
});

// Fireworks
const fireworksResponse = await sendPrompt({
  messages: [{ role: "user", content: "Hello, who are you?" }],
  model: "accounts/fireworks/models/deepseek-v3-0324",
  provider: AI_PROVIDERS.FIREWORKS,
  apiKey: "your-fireworks-api-key",
  systemPrompt: "You are a helpful assistant.",
});

// Custom Provider
const customResponse = await sendPrompt({
  messages: [{ role: "user", content: "Hello, who are you?" }],
  model: "custom-model",
  provider: "custom",
  baseURL: "https://your-custom-api.com/v1",
  apiKey: "your-custom-api-key",
  systemPrompt: "You are a helpful assistant.",
});

// All responses have the same structure
console.log(openaiResponse.message.content);
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

const response = await sendPrompt({
  messages: [{ role: "user", content: "What is 5 plus 3?" }],
  model: ModelEnum["gpt-4.1"],
  provider: AI_PROVIDERS.OPENAI,
  apiKey: "your-openai-api-key",
  tools: [calculatorTool],
});

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

### Multi-round Tool Calls (Google)

For Google's Gemini models, you can handle multi-round tool calls by including function call and response messages in the conversation:

```typescript
// First round - model makes a function call
const firstResponse = await sendPrompt({
  messages: [{ role: "user", content: "What is 15 plus 32?" }],
  model: ModelEnum["gemini-2.5-pro-exp-03-25"],
  provider: AI_PROVIDERS.GOOGLE,
  apiKey: "your-google-api-key",
  tools: [calculatorTool],
  toolCallMode: "AUTO",
});

// Handle the function call and get the result
if (firstResponse.tool_calls) {
  const toolCall = firstResponse.tool_calls[0];
  const args = JSON.parse(toolCall.function.arguments);
  const result = calculate(args.operation, args.a, args.b); // Your calculation function

  // Second round - include function call and response in messages
  const secondResponse = await sendPrompt({
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
    model: ModelEnum["gemini-2.5-pro-exp-03-25"],
    provider: AI_PROVIDERS.GOOGLE,
    apiKey: "your-google-api-key",
    tools: [calculatorTool],
    toolCallMode: "AUTO",
  });

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

- [ ] Support for DeepSeek
- [ ] Support for image input
- [ ] Support for streaming
- [ ] Better error handling
