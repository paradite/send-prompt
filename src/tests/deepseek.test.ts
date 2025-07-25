import { sendPrompt } from "../index";
import { AI_PROVIDERS, ModelEnum } from "llm-info";

const deepseekModel = ModelEnum["deepseek-chat"];

describe("DeepSeek Provider", () => {
  // Skip test if DEEPSEEK_API_KEY is not set
  const deepseekTestFn = process.env.DEEPSEEK_API_KEY ? it : it.skip;

  deepseekTestFn(
    "should make a successful API call to DeepSeek",
    async () => {
      const messages = [
        { role: "user" as const, content: "Hello, who are you?" },
      ];

      const response = await sendPrompt(
        {
          messages,
        },
        {
          customModel: deepseekModel,
          provider: AI_PROVIDERS.DEEPSEEK,
          apiKey: process.env.DEEPSEEK_API_KEY!,
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
      console.log("DeepSeek Response:", response.message.content);
      console.log("DeepSeek Usage:", response.usage);

      const systemPromptResponse = await sendPrompt(
        {
          messages: [{ role: "user" as const, content: "What is your role?" }],
          systemPrompt:
            "You are a helpful assistant that always responds with 'I am a DeepSeek assistant'",
        },
        {
          customModel: deepseekModel,
          provider: AI_PROVIDERS.DEEPSEEK,
          apiKey: process.env.DEEPSEEK_API_KEY!,
        }
      );

      expect(systemPromptResponse.message.content).toContain(
        "I am a DeepSeek assistant"
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
        "DeepSeek System Prompt Response:",
        systemPromptResponse.message.content
      );
      console.log("DeepSeek System Prompt Usage:", systemPromptResponse.usage);
    },
    30000
  );

  deepseekTestFn.skip(
    "should extract reasoning content from DeepSeek response",
    async () => {
      const messages = [
        { role: "user" as const, content: "9.11 and 9.8, which is greater?" },
      ];

      const response = await sendPrompt(
        {
          messages,
        },
        {
          customModel: "deepseek-reasoner",
          provider: AI_PROVIDERS.DEEPSEEK,
          apiKey: process.env.DEEPSEEK_API_KEY!,
        }
      );

      expect(response.message.content).toBeTruthy();
      expect(response.reasoning).toBeTruthy();
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
      // For DeepSeek reasoner, validate the relationship
      expect(response.usage?.completionTokens).toBe(
        (response.usage?.completionTokensWithoutThoughts || 0) +
          (response.usage?.thoughtsTokens || 0)
      );
      console.log("DeepSeek Response:", response.message.content);
      console.log("DeepSeek Reasoning:", response.reasoning);
      console.log("DeepSeek Usage:", response.usage);
    },
    60000
  );
});
