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
      const response = await sendPrompt({
        messages,
        model: "accounts/fireworks/models/deepseek-v3-0324",
        provider: AI_PROVIDERS.FIREWORKS,
        apiKey: process.env.FIREWORKS_API_KEY!,
      });

      expect(response.message.content).toBeTruthy();
      console.log("Fireworks Response:", response.message.content);

      const systemPromptResponse = await sendPrompt({
        messages: [{ role: "user" as const, content: "What is your role?" }],
        model: "accounts/fireworks/models/deepseek-v3-0324",
        provider: AI_PROVIDERS.FIREWORKS,
        apiKey: process.env.FIREWORKS_API_KEY!,
        systemPrompt:
          "You are a helpful assistant that always responds with 'I am a Fireworks assistant'",
      });

      expect(systemPromptResponse.message.content).toContain(
        "I am a Fireworks assistant"
      );
      console.log(
        "Fireworks System Prompt Response:",
        systemPromptResponse.message.content
      );
    },
    30000
  );
});
