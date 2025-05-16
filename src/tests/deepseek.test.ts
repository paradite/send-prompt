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
      expect(response.usage?.totalTokens).toBe(
        (response.usage?.promptTokens || 0) +
          (response.usage?.completionTokens || 0)
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
      expect(systemPromptResponse.usage?.totalTokens).toBe(
        (systemPromptResponse.usage?.promptTokens || 0) +
          (systemPromptResponse.usage?.completionTokens || 0)
      );
      console.log(
        "DeepSeek System Prompt Response:",
        systemPromptResponse.message.content
      );
      console.log("DeepSeek System Prompt Usage:", systemPromptResponse.usage);
    },
    30000
  );
});
