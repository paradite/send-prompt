import { sendPrompt } from "../index";
import { AI_PROVIDERS, ModelEnum } from "llm-info";

// const googleModel = ModelEnum["gemini-2.5-pro-exp-03-25"];
const googleModel = ModelEnum["gemini-2.5-flash"];

describe("Google Provider", () => {
  // Skip test if GEMINI_API_KEY is not set
  const googleTestFn = process.env.GEMINI_API_KEY ? it : it.skip;

  googleTestFn(
    "should make a successful API call to Google",
    async () => {
      const messages = [
        // { role: "user" as const, content: "Hello, who are you?" },
        { role: "user" as const, content: "What's the weather in Tokyo?" },
      ];

      // Test without system prompt
      const response = await sendPrompt(
        {
          messages,
        },
        {
          model: googleModel,
          provider: AI_PROVIDERS.GOOGLE,
          apiKey: process.env.GEMINI_API_KEY!,
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
      console.log("Google Response:", response.message.content);
      console.log("Google Usage:", response.usage);

      const systemPromptResponse = await sendPrompt(
        {
          messages: [{ role: "user" as const, content: "What is your role?" }],
          systemPrompt:
            "You are a helpful assistant that always responds with 'I am a Google assistant'",
        },
        {
          model: googleModel,
          provider: AI_PROVIDERS.GOOGLE,
          apiKey: process.env.GEMINI_API_KEY!,
        }
      );

      expect(systemPromptResponse.message.content).toContain(
        "I am a Google assistant"
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
        "Google System Prompt Response:",
        systemPromptResponse.message.content
      );
      console.log("Google System Prompt Usage:", systemPromptResponse.usage);
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

      const response = await sendPrompt(
        {
          messages,
          systemPrompt:
            "You are a helpful assistant. When asked about your role, respond with 'I am using the model role'",
        },
        {
          model: googleModel,
          provider: AI_PROVIDERS.GOOGLE,
          apiKey: process.env.GEMINI_API_KEY!,
        }
      );

      expect(response.message.role).toBe("assistant");
      expect(response.message.content).toContain("I am using the model role");
      expect(response.usage).toBeDefined();
      expect(response.usage?.promptTokens).toBeGreaterThan(0);
      expect(response.usage?.completionTokens).toBeGreaterThan(0);
      expect(response.usage?.totalTokens).toBeGreaterThan(0);
      expect(response.usage?.totalTokens).toBe(
        (response.usage?.promptTokens || 0) +
          (response.usage?.completionTokens || 0)
      );
      console.log("Role Test Response:", response.message.content);
      console.log("Role Test Usage:", response.usage);
    },
    30000
  );
});
