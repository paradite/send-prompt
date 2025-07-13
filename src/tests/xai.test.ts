import { sendPrompt } from "../index";
import { AI_PROVIDERS } from "llm-info";

describe("XAI Provider", () => {
  // Skip test if XAI_API_KEY is not set
  const xaiTestFn = process.env.XAI_API_KEY ? it : it.skip;

  xaiTestFn(
    "should make a successful API call to XAI",
    async () => {
      const messages = [
        { role: "user" as const, content: "Hello, who are you?" },
      ];

      const response = await sendPrompt(
        {
          messages,
        },
        {
          customModel: "grok-4",
          provider: AI_PROVIDERS.XAI,
          apiKey: process.env.XAI_API_KEY!,
        }
      );

      expect(response.message.content).toBeTruthy();
      expect(response.usage).toBeDefined();
      expect(response.usage?.promptTokens).toBeGreaterThan(0);
      expect(response.usage?.completionTokens).toBeGreaterThan(0);
      expect(response.usage?.totalTokens).toBeGreaterThan(0);
      expect(response.usage?.thoughtsTokens).toBeGreaterThanOrEqual(0);
      expect(response.usage?.completionTokensWithoutThoughts).toBeGreaterThan(
        0
      );
      expect(response.usage?.totalTokens).toBe(
        (response.usage?.promptTokens || 0) +
          (response.usage?.completionTokens || 0)
      );
      // completionTokens should include reasoning tokens
      expect(response.usage?.completionTokens).toBeGreaterThanOrEqual(
        response.usage?.thoughtsTokens || 0
      );
      // completionTokens should equal completionTokensWithoutThoughts + thoughtsTokens
      expect(response.usage?.completionTokens).toBe(
        (response.usage?.completionTokensWithoutThoughts || 0) +
          (response.usage?.thoughtsTokens || 0)
      );
      console.log("XAI Response:", response.message.content);
      console.log("XAI Usage:", response.usage);

      const systemPromptResponse = await sendPrompt(
        {
          messages: [{ role: "user" as const, content: "What is your role?" }],
          systemPrompt:
            "You are a helpful assistant that always responds with 'I am Grok, an AI assistant created by xAI'",
        },
        {
          customModel: "grok-4",
          provider: AI_PROVIDERS.XAI,
          apiKey: process.env.XAI_API_KEY!,
        }
      );

      expect(systemPromptResponse.message.content).toContain("Grok");
      expect(systemPromptResponse.usage).toBeDefined();
      expect(systemPromptResponse.usage?.promptTokens).toBeGreaterThan(0);
      expect(systemPromptResponse.usage?.completionTokens).toBeGreaterThan(0);
      expect(systemPromptResponse.usage?.totalTokens).toBeGreaterThan(0);
      expect(systemPromptResponse.usage?.thoughtsTokens).toBeGreaterThanOrEqual(
        0
      );
      expect(
        systemPromptResponse.usage?.completionTokensWithoutThoughts
      ).toBeGreaterThan(0);
      expect(systemPromptResponse.usage?.totalTokens).toBe(
        (systemPromptResponse.usage?.promptTokens || 0) +
          (systemPromptResponse.usage?.completionTokens || 0)
      );
      // completionTokens should include reasoning tokens
      expect(
        systemPromptResponse.usage?.completionTokens
      ).toBeGreaterThanOrEqual(systemPromptResponse.usage?.thoughtsTokens || 0);
      // completionTokens should equal completionTokensWithoutThoughts + thoughtsTokens
      expect(systemPromptResponse.usage?.completionTokens).toBe(
        (systemPromptResponse.usage?.completionTokensWithoutThoughts || 0) +
          (systemPromptResponse.usage?.thoughtsTokens || 0)
      );
      console.log(
        "XAI System Prompt Response:",
        systemPromptResponse.message.content
      );
      console.log("XAI System Prompt Usage:", systemPromptResponse.usage);
    },
    30000
  );
});
