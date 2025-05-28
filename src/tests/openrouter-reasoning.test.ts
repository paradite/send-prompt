import { AI_PROVIDERS } from "llm-info";
import { sendPrompt } from "../index";

// Skip test if OPENROUTER_API_KEY is not set
const openRouterTestFn = process.env.OPENROUTER_API_KEY ? test : test.skip;

describe("OpenRouter Reasoning Extraction", () => {
  //   const openRouterModel = "qwen/qwen3-235b-a22b";
  const openRouterModel = "qwen/qwen3-8b:free";

  openRouterTestFn(
    "should extract reasoning from <think> tags",
    async () => {
      const messages = [
        {
          role: "user" as const,
          content: "What is 2 + 2?",
        },
      ];

      const response = await sendPrompt(
        {
          messages,
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

      console.log("OpenRouter Response:", response.message.content);
      console.log("OpenRouter Reasoning:", response.reasoning);
      console.log("OpenRouter Usage:", response.usage);

      expect(response.message.content).toBeTruthy();
      expect(response.reasoning).toBeTruthy();
      expect(response.usage?.thoughtsTokens).toBeGreaterThan(0);
      expect(response.message.content).not.toContain("<think>");
      expect(response.message.content).not.toContain("</think>");
      expect(response.usage).toBeDefined();
      expect(response.usage?.promptTokens).toBeGreaterThan(0);
      expect(response.usage?.completionTokens).toBeGreaterThan(0);
      expect(response.usage?.totalTokens).toBeGreaterThan(0);
      expect(response.usage?.totalTokens).toBe(
        (response.usage?.promptTokens || 0) +
          (response.usage?.completionTokens || 0)
      );
    },
    30000
  );
});
