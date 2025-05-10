# send-prompt

A lightweight library to send prompt to models, developed by [16x Prompt][https://prompt.16x.engineer] and [16x Eval][https://eval.16x.engineer].

## Installation

```bash
npm install send-prompt
```

## Usage

```typescript
import { sendPrompt } from "send-prompt";
import { ModelEnum } from "llm-info";

// Example 1: Simple chat completion
const response = await sendPrompt({
  messages: [{ role: "user", content: "Hello, who are you?" }],
  model: ModelEnum["gpt-4.1"],
  provider: "openai",
});

console.log(response.choices[0].message.content);

// Example 2: Chat with system message
const response2 = await sendPrompt({
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "What is the capital of France?" },
  ],
  model: ModelEnum["gpt-4.1"],
  provider: "openai",
});

console.log(response2.choices[0].message.content);
```
