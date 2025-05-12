import { sendPrompt } from "../index";
import { AI_PROVIDERS, ModelEnum } from "llm-info";

const googleModel = ModelEnum["gemini-2.5-pro-exp-03-25"];

describe("Google Provider", () => {
  // Skip test if GEMINI_API_KEY is not set
  const googleTestFn = process.env.GEMINI_API_KEY ? it : it.skip;

  googleTestFn(
    "should make a successful API call to Google",
    async () => {
      const messages = [
        { role: "user" as const, content: "Hello, who are you?" },
      ];

      // Test without system prompt
      const response = await sendPrompt({
        messages,
        model: googleModel,
        provider: AI_PROVIDERS.GOOGLE,
        apiKey: process.env.GEMINI_API_KEY!,
      });

      expect(response.message.content).toBeTruthy();
      console.log("Google Response:", response.message.content);

      const systemPromptResponse = await sendPrompt({
        messages: [{ role: "user" as const, content: "What is your role?" }],
        model: googleModel,
        provider: AI_PROVIDERS.GOOGLE,
        apiKey: process.env.GEMINI_API_KEY!,
        systemPrompt:
          "You are a helpful assistant that always responds with 'I am a Google assistant'",
      });

      expect(systemPromptResponse.message.content).toContain(
        "I am a Google assistant"
      );
      console.log(
        "Google System Prompt Response:",
        systemPromptResponse.message.content
      );
    },
    30000
  );

  googleTestFn(
    "should handle role transformation correctly",
    async () => {
      const messages = [
        { role: "user" as const, content: "Hello" },
        { role: "assistant" as const, content: "Hi there!" },
        { role: "user" as const, content: "What role are you using?" },
      ];

      const response = await sendPrompt({
        messages,
        model: googleModel,
        provider: AI_PROVIDERS.GOOGLE,
        apiKey: process.env.GEMINI_API_KEY!,
        systemPrompt:
          "You are a helpful assistant. When asked about your role, respond with 'I am using the model role'",
      });

      expect(response.message.role).toBe("assistant");
      expect(response.message.content).toContain("I am using the model role");
      console.log("Role Test Response:", response.message.content);
    },
    30000
  );
});
