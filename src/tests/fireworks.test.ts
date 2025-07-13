import { sendPrompt } from "../index";
import { AI_PROVIDERS } from "llm-info";

describe("Fireworks Provider", () => {
  // Skip test if FIREWORKS_API_KEY is not set
  const fireworksTestFn = process.env.FIREWORKS_API_KEY ? it : it.skip;

  fireworksTestFn(
    "should make a successful API call to Fireworks",
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
          customModel: "accounts/fireworks/models/deepseek-v3-0324",
          provider: AI_PROVIDERS.FIREWORKS,
          apiKey: process.env.FIREWORKS_API_KEY!,
        }
      );

      expect(response.message.content).toBeTruthy();
      expect(response.usage).toBeDefined();
      expect(response.usage?.promptTokens).toBeGreaterThan(0);
      expect(response.usage?.completionTokens).toBeGreaterThan(0);
      expect(response.usage?.totalTokens).toBeGreaterThan(0);
      expect(response.usage?.thoughtsTokens).toBeGreaterThanOrEqual(0);
      expect(response.usage?.completionTokensWithoutThoughts).toBeGreaterThan(0);
      expect(response.usage?.totalTokens).toBe(
        (response.usage?.promptTokens || 0) +
          (response.usage?.completionTokens || 0)
      );
      // completionTokens should include reasoning tokens
      expect(response.usage?.completionTokens).toBeGreaterThanOrEqual(
        response.usage?.thoughtsTokens || 0
      );
      // For non-reasoning models, both completion token fields should be equal
      expect(response.usage?.completionTokens).toBe(
        response.usage?.completionTokensWithoutThoughts
      );
      console.log("Fireworks Response:", response.message.content);
      console.log("Fireworks Usage:", response.usage);

      const systemPromptResponse = await sendPrompt(
        {
          messages: [{ role: "user" as const, content: "What is your role?" }],
          systemPrompt:
            "You are a helpful assistant that always responds with 'I am a Fireworks assistant'",
        },
        {
          customModel: "accounts/fireworks/models/deepseek-v3-0324",
          provider: AI_PROVIDERS.FIREWORKS,
          apiKey: process.env.FIREWORKS_API_KEY!,
        }
      );

      expect(systemPromptResponse.message.content).toContain(
        "I am a Fireworks assistant"
      );
      expect(systemPromptResponse.usage).toBeDefined();
      expect(systemPromptResponse.usage?.promptTokens).toBeGreaterThan(0);
      expect(systemPromptResponse.usage?.completionTokens).toBeGreaterThan(0);
      expect(systemPromptResponse.usage?.totalTokens).toBeGreaterThan(0);
      expect(systemPromptResponse.usage?.thoughtsTokens).toBeGreaterThanOrEqual(0);
      expect(systemPromptResponse.usage?.completionTokensWithoutThoughts).toBeGreaterThan(0);
      expect(systemPromptResponse.usage?.totalTokens).toBe(
        (systemPromptResponse.usage?.promptTokens || 0) +
          (systemPromptResponse.usage?.completionTokens || 0)
      );
      // completionTokens should include reasoning tokens
      expect(systemPromptResponse.usage?.completionTokens).toBeGreaterThanOrEqual(
        systemPromptResponse.usage?.thoughtsTokens || 0
      );
      // For non-reasoning models, both completion token fields should be equal
      expect(systemPromptResponse.usage?.completionTokens).toBe(
        systemPromptResponse.usage?.completionTokensWithoutThoughts
      );
      console.log(
        "Fireworks System Prompt Response:",
        systemPromptResponse.message.content
      );
      console.log("Fireworks System Prompt Usage:", systemPromptResponse.usage);
    },
    30000
  );
});
