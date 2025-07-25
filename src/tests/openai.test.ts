import { sendPrompt } from "../index";
import { AI_PROVIDERS, ModelEnum } from "llm-info";

const openAIModel = ModelEnum["gpt-4.1"];

describe("OpenAI Provider", () => {
  // Skip test if OPENAI_API_KEY is not set
  const openAITestFn = process.env.OPENAI_API_KEY ? it : it.skip;

  openAITestFn(
    "should make a successful API call to OpenAI",
    async () => {
      const messages = [
        { role: "user" as const, content: "Hello, who are you?" },
      ];

      const response = await sendPrompt(
        {
          messages,
        },
        {
          model: openAIModel,
          provider: AI_PROVIDERS.OPENAI,
          apiKey: process.env.OPENAI_API_KEY!,
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
      expect(response.durationMs).toBeDefined();
      expect(response.durationMs).toBeGreaterThan(0);
      console.log("OpenAI Response:", response.message.content);
      console.log("OpenAI Usage:", response.usage);
      console.log("OpenAI Duration:", response.durationMs, "ms");

      const systemPromptResponse = await sendPrompt(
        {
          messages: [{ role: "user" as const, content: "What is your role?" }],
          systemPrompt:
            "You are a helpful assistant that always responds with 'I am an OpenAI assistant'",
        },
        {
          model: openAIModel,
          provider: AI_PROVIDERS.OPENAI,
          apiKey: process.env.OPENAI_API_KEY!,
        }
      );

      expect(systemPromptResponse.message.content).toContain(
        "I am an OpenAI assistant"
      );
      expect(systemPromptResponse.usage).toBeDefined();
      expect(systemPromptResponse.usage?.promptTokens).toBeGreaterThan(0);
      expect(systemPromptResponse.usage?.completionTokens).toBeGreaterThan(0);
      expect(systemPromptResponse.usage?.totalTokens).toBeGreaterThan(0);
      expect(systemPromptResponse.usage?.thoughtsTokens).toBeGreaterThanOrEqual(0);
      expect(systemPromptResponse.usage?.totalTokens).toBe(
        (systemPromptResponse.usage?.promptTokens || 0) +
          (systemPromptResponse.usage?.completionTokens || 0)
      );
      // completionTokens should include reasoning tokens
      expect(systemPromptResponse.usage?.completionTokens).toBeGreaterThanOrEqual(
        systemPromptResponse.usage?.thoughtsTokens || 0
      );
      expect(systemPromptResponse.durationMs).toBeDefined();
      expect(systemPromptResponse.durationMs).toBeGreaterThan(0);
      console.log(
        "OpenAI System Prompt Response:",
        systemPromptResponse.message.content
      );
      console.log("OpenAI System Prompt Usage:", systemPromptResponse.usage);
      console.log(
        "OpenAI System Prompt Duration:",
        systemPromptResponse.durationMs,
        "ms"
      );
    },
    30000
  );
});
