import { AI_PROVIDERS } from "llm-info";
import { sendPrompt } from "../index";

// Skip test if OPENROUTER_API_KEY is not set
const openRouterTestFn = process.env.OPENROUTER_API_KEY ? test : test.skip;

describe("OpenRouter Reasoning Effort", () => {
  // Use GPT-5 for testing reasoning effort
  const reasoningModel = "openai/gpt-5-mini";

  openRouterTestFn(
    "should work with different reasoningEffort values",
    async () => {
      const messages = [
        {
          role: "user" as const,
          content:
            "A farmer has 17 sheep, and all but 9 die. How many sheep are left? Please think through this carefully and show your reasoning.",
        },
      ];

      // Test with reasoningEffort set to "low"
      const lowResponse = await sendPrompt(
        {
          messages,
        },
        {
          customModel: reasoningModel,
          provider: AI_PROVIDERS.OPENROUTER,
          apiKey: process.env.OPENROUTER_API_KEY!,
          headers: {
            "HTTP-Referer": "https://eval.16x.engineer/",
            "X-Title": "16x Eval",
          },
          reasoningEffort: "low",
        }
      );

      expect(lowResponse.message.content).toBeTruthy();
      expect(lowResponse.usage).toBeDefined();

      // Test with reasoningEffort set to "medium" (avoiding high for speed)
      const mediumResponse = await sendPrompt(
        {
          messages,
        },
        {
          customModel: reasoningModel,
          provider: AI_PROVIDERS.OPENROUTER,
          apiKey: process.env.OPENROUTER_API_KEY!,
          headers: {
            "HTTP-Referer": "https://eval.16x.engineer/",
            "X-Title": "16x Eval",
          },
          reasoningEffort: "medium",
        }
      );

      expect(mediumResponse.message.content).toBeTruthy();
      expect(mediumResponse.usage).toBeDefined();

      console.log(
        "OpenRouter Low Reasoning Effort Response:",
        lowResponse.message.content
      );
      console.log("OpenRouter Low Reasoning Effort Usage:", lowResponse.usage);
      console.log(
        "OpenRouter Medium Reasoning Effort Response:",
        mediumResponse.message.content
      );
      console.log(
        "OpenRouter Medium Reasoning Effort Usage:",
        mediumResponse.usage
      );

      // Both should have reasoning tokens since they're using GPT-5 with a tricky problem
      expect(lowResponse.usage?.thoughtsTokens).toBeGreaterThan(0);
      expect(mediumResponse.usage?.thoughtsTokens).toBeGreaterThan(0);

      // Medium effort should generally use more reasoning tokens than low effort
      expect(mediumResponse.usage?.thoughtsTokens).toBeGreaterThan(
        lowResponse.usage?.thoughtsTokens || 0
      );

      console.log(
        "OpenRouter Low effort thoughts tokens:",
        lowResponse.usage?.thoughtsTokens
      );
      console.log(
        "OpenRouter Medium effort thoughts tokens:",
        mediumResponse.usage?.thoughtsTokens
      );

      // Validate token relationships for OpenRouter
      expect(lowResponse.usage?.totalTokens).toBe(
        (lowResponse.usage?.promptTokens || 0) +
          (lowResponse.usage?.completionTokens || 0)
      );
      expect(mediumResponse.usage?.totalTokens).toBe(
        (mediumResponse.usage?.promptTokens || 0) +
          (mediumResponse.usage?.completionTokens || 0)
      );
    },
    60000
  );
});
