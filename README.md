# send-prompt

[![NPM version](https://img.shields.io/npm/v/send-prompt)](https://www.npmjs.com/package/send-prompt)

A lightweight library to send prompt to models, developed by [16x Prompt](https://prompt.16x.engineer) and [16x Eval](https://eval.16x.engineer).

The library uses [llm-info](https://www.npmjs.com/package/llm-info) for model and provider information.

## Installation

```bash
npm install llm-info send-prompt
```

## Usage

```typescript
import { sendPrompt } from "send-prompt";
import { AI_PROVIDERS, ModelEnum } from "llm-info";

const response = await sendPrompt({
  messages: [{ role: "user", content: "Hello, who are you?" }],
  model: ModelEnum["gpt-4.1"],
  provider: AI_PROVIDERS.OPENAI,
  apiKey: "your-api-key-here",
});

console.log(response.message.content);
```

System message:

```typescript
import { sendPrompt } from "send-prompt";
import { ModelEnum, AI_PROVIDERS } from "llm-info";

const response2 = await sendPrompt({
  messages: [{ role: "user", content: "What is the capital of France?" }],
  model: ModelEnum["gpt-4.1"],
  provider: AI_PROVIDERS.OPENAI,
  apiKey: "your-api-key-here",
  systemPrompt: "You are a helpful assistant.",
});

console.log(response2.message.content);
```

Google Gemini:

```typescript
import { sendPrompt } from "send-prompt";
import { ModelEnum, AI_PROVIDERS } from "llm-info";

const response3 = await sendPrompt({
  messages: [{ role: "user", content: "Hello, who are you?" }],
  model: ModelEnum["gemini-2.5-pro-exp-03-25"],
  provider: AI_PROVIDERS.GOOGLE,
  apiKey: "your-google-api-key-here",
});

console.log(response3.message.content);
```
