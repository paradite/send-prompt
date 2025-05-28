import { AI_PROVIDERS } from "llm-info";
import { sendPrompt } from "../index";

// Skip test if FIREWORKS_API_KEY is not set
const fireworksTestFn = process.env.FIREWORKS_API_KEY ? test : test.skip;

describe("Fireworks Reasoning Extraction", () => {
  //   const fireworksModel = "accounts/fireworks/models/qwen3-235b-a22b";
  const fireworksModel = "accounts/fireworks/models/deepseek-r1";

  fireworksTestFn(
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
          customModel: fireworksModel,
          provider: AI_PROVIDERS.FIREWORKS,
          apiKey: process.env.FIREWORKS_API_KEY!,
        }
      );

      expect(response.message.content).toBeTruthy();
      expect(response.reasoning).toBeTruthy();
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
      console.log("Fireworks Response:", response.message.content);
      console.log("Fireworks Reasoning:", response.reasoning);
      console.log("Fireworks Usage:", response.usage);
    },
    60000
  );
});
