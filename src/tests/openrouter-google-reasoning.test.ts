import { sendPrompt } from "../index";
import { AI_PROVIDERS } from "llm-info";

describe("OpenRouter Provider - Gemini Model", () => {
  // Skip test if OPENROUTER_API_KEY is not set
  const openRouterTestFn = process.env.OPENROUTER_API_KEY ? it : it.skip;

  openRouterTestFn(
    "should make a successful API call to OpenRouter with Gemini model",
    async () => {
      const messages = [
        {
          role: "user" as const,
          content: "Which one is greater, 4 to the power of 4, or 10000?",
        },
      ];

      // Test without system prompt
      const response = await sendPrompt(
        {
          messages,
        },
        {
          provider: AI_PROVIDERS.OPENROUTER,
          customModel: "google/gemini-2.5-pro-preview",
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
      expect(response.reasoning).toBeTruthy();
      expect(response.usage?.thoughtsTokens).toBeGreaterThan(0);
      expect(response.usage?.completionTokens).toBeGreaterThan(0);
      expect(response.usage?.totalTokens).toBeGreaterThan(0);
      expect(response.usage?.totalTokens).toBe(
        (response.usage?.promptTokens || 0) +
          (response.usage?.completionTokens || 0)
      );
      console.log(
        "OpenRouter Gemini Response:",
        JSON.stringify(response, null, 2)
      );
      console.log("OpenRouter Gemini Usage:", response.usage);
    },
    30000
  );
});
