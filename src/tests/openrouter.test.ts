import { sendPrompt } from "../index";
import { AI_PROVIDERS } from "llm-info";

const openRouterModel = "deepseek/deepseek-chat-v3-0324:free";

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
      const response = await sendPrompt({
        messages,
        model: openRouterModel,
        provider: AI_PROVIDERS.OPENROUTER,
        apiKey: process.env.OPENROUTER_API_KEY!,
      });

      expect(response.message.content).toBeTruthy();
      console.log("OpenRouter Response:", response.message.content);

      const systemPromptResponse = await sendPrompt({
        messages: [{ role: "user" as const, content: "What is your role?" }],
        model: openRouterModel,
        provider: AI_PROVIDERS.OPENROUTER,
        apiKey: process.env.OPENROUTER_API_KEY!,
        systemPrompt:
          "You are a helpful assistant that always responds with 'I am an OpenRouter assistant'",
      });

      expect(systemPromptResponse.message.content).toContain(
        "I am an OpenRouter assistant"
      );
      console.log(
        "OpenRouter System Prompt Response:",
        systemPromptResponse.message.content
      );
    },
    30000
  );
});
