import { sendPrompt } from "../index";
import { AI_PROVIDERS } from "llm-info";

// const openRouterModel = "deepseek/deepseek-chat-v3-0324:free";
// const openRouterModel = "google/gemini-2.0-flash-exp:free";
// const openRouterModel = "deepseek/deepseek-chat:free";
const openRouterModel = "meta-llama/llama-4-scout:free";
// const openRouterModel = "openai/codex-mini";

describe("OpenRouter Provider", () => {
  // Skip test if OPENROUTER_API_KEY is not set
  const openRouterTestFn = process.env.OPENROUTER_API_KEY ? it : it.skip;

  openRouterTestFn(
    "should make a successful API call to OpenRouter",
    async () => {
      const messages = [
        { role: "user" as const, content: "Hello, who are you?" },
      ];

      // Test without system prompt
      const response = await sendPrompt(
        {
          messages,
        },
        {
          provider: AI_PROVIDERS.OPENROUTER,
          customModel: openRouterModel,
          apiKey: process.env.OPENROUTER_API_KEY!,
          headers: {
            "HTTP-Referer": "https://eval.16x.engineer/",
            "X-Title": "16x Eval",
          },
        }
      );

      expect(response.message.content).toBeTruthy();
      expect(response.usage).toBeDefined();
      expect(response.usage?.promptTokens).toBeGreaterThan(0);
      expect(response.usage?.completionTokens).toBeGreaterThan(0);
      expect(response.usage?.totalTokens).toBeGreaterThan(0);
      expect(response.usage?.totalTokens).toBe(
        (response.usage?.promptTokens || 0) +
          (response.usage?.completionTokens || 0)
      );
      console.log("OpenRouter Response:", response.message.content);
      console.log("OpenRouter Usage:", response.usage);

      const systemPromptResponse = await sendPrompt(
        {
          messages: [{ role: "user" as const, content: "What is your role?" }],
          systemPrompt:
            "You are a helpful assistant that always responds with 'I am an OpenRouter assistant'",
        },
        {
          customModel: openRouterModel,
          provider: AI_PROVIDERS.OPENROUTER,
          apiKey: process.env.OPENROUTER_API_KEY!,
          headers: {
            "HTTP-Referer": "https://eval.16x.engineer/",
            "X-Title": "16x Eval",
          },
        }
      );

      console.log(systemPromptResponse);

      expect(systemPromptResponse.message.content).toContain(
        "I am an OpenRouter assistant"
      );
      expect(systemPromptResponse.usage).toBeDefined();
      expect(systemPromptResponse.usage?.promptTokens).toBeGreaterThan(0);
      expect(systemPromptResponse.usage?.completionTokens).toBeGreaterThan(0);
      expect(systemPromptResponse.usage?.totalTokens).toBeGreaterThan(0);
      expect(systemPromptResponse.usage?.totalTokens).toBe(
        (systemPromptResponse.usage?.promptTokens || 0) +
          (systemPromptResponse.usage?.completionTokens || 0)
      );
      console.log(
        "OpenRouter System Prompt Response:",
        systemPromptResponse.message.content
      );
      console.log(
        "OpenRouter System Prompt Usage:",
        systemPromptResponse.usage
      );
    },
    30000
  );
});
