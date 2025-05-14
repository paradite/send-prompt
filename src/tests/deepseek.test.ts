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

      const response = await sendPrompt({
        messages,
        model: deepseekModel,
        provider: AI_PROVIDERS.DEEPSEEK,
        apiKey: process.env.DEEPSEEK_API_KEY!,
      });

      expect(response.message.content).toBeTruthy();
      console.log("DeepSeek Response:", response.message.content);

      const systemPromptResponse = await sendPrompt({
        messages: [{ role: "user" as const, content: "What is your role?" }],
        model: deepseekModel,
        provider: AI_PROVIDERS.DEEPSEEK,
        apiKey: process.env.DEEPSEEK_API_KEY!,
        systemPrompt:
          "You are a helpful assistant that always responds with 'I am a DeepSeek assistant'",
      });

      expect(systemPromptResponse.message.content).toContain(
        "I am a DeepSeek assistant"
      );
      console.log(
        "DeepSeek System Prompt Response:",
        systemPromptResponse.message.content
      );
    },
    30000
  );
});
