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

console.log(response.choices[0].message.content);
```

System message:

```typescript
import { sendPrompt } from "send-prompt";
import { ModelEnum, AI_PROVIDERS } from "llm-info";

const response2 = await sendPrompt({
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "What is the capital of France?" },
  ],
  model: ModelEnum["gpt-4.1"],
  provider: AI_PROVIDERS.OPENAI,
  apiKey: "your-api-key-here",
});

console.log(response2.choices[0].message.content);
```
