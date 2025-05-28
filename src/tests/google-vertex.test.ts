import { sendPrompt } from "../index";
import { AI_PROVIDERS, ModelEnum } from "llm-info";

const googleModel = ModelEnum["gemini-2.5-flash-preview-04-17"];

describe("Google Vertex AI Provider", () => {
  // Skip test if GOOGLE_GENAI_USE_VERTEXAI is not set
  const googleTestFn = process.env.GOOGLE_GENAI_USE_VERTEXAI ? it : it.skip;

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
          provider: AI_PROVIDERS.GOOGLE_VERTEX_AI,
          vertexai: true,
          project: process.env.GOOGLE_CLOUD_PROJECT!,
          location: process.env.GOOGLE_CLOUD_LOCATION!,
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
          provider: AI_PROVIDERS.GOOGLE_VERTEX_AI,
          vertexai: true,
          project: process.env.GOOGLE_CLOUD_PROJECT!,
          location: process.env.GOOGLE_CLOUD_LOCATION!,
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
});
