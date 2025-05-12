# send-prompt

[![NPM version](https://img.shields.io/npm/v/send-prompt)](https://www.npmjs.com/package/send-prompt)

A lightweight library to send prompt to models, developed by [16x Prompt](https://prompt.16x.engineer) and [16x Eval](https://eval.16x.engineer).

The library uses [llm-info](https://www.npmjs.com/package/llm-info) for model and provider information.

## Features

- 🔄 Unified interface with single entry point for all providers
- 🤖 Support for multiple AI providers:
  - OpenAI (GPT-4.1)
  - Anthropic (Claude 3.7 Sonnet)
  - Google (Gemini 2.5 Pro)
- 🔧 Function calling support for all providers
- 💬 Standardized message format across providers
- 🛠️ Tool definitions with TypeScript support
- 🔒 Browser-safe with proper API key handling
- 📝 System prompt support
- 🎯 Consistent response format

## Installation

```bash
npm install llm-info send-prompt
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

// All responses have the same structure
console.log(openaiResponse.message.content);
console.log(anthropicResponse.message.content);
console.log(googleResponse.message.content);
```

### Function Calling

```typescript
// Define your tool
const calculatorTool = {
  type: "function",
  function: {
    name: "calculator",
    description: "Perform basic arithmetic operations",
    //
};

const openaiResponse = await sendPrompt({
  messages: [{ role: "user", content: "What is 5 plus 3?" }],
  model: ModelEnum["gemini-2.5-flash-preview-04-17"],
  provider: AI_PROVIDERS.GOOGLE,
  apiKey: "your-google-api-key",
  tools: [calculatorTool],
});

// All responses have the same structure for tool calls
if (openaiResponse.tool_calls) {
  const toolCall = openaiResponse.tool_calls[0];
  console.log("Tool called:", toolCall.function.name);
  console.log("Arguments:", JSON.parse(toolCall.function.arguments));
}
```
