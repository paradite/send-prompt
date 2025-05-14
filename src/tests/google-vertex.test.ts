import { sendPrompt } from "../index";
import { AI_PROVIDERS, ModelEnum } from "llm-info";

const googleModel = ModelEnum["gemini-2.5-pro-exp-03-25"];
// const googleModel = ModelEnum["gemini-2.5-pro-preview-05-06"];

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
      const response = await sendPrompt({
        messages,
        model: googleModel,
        provider: AI_PROVIDERS.GOOGLE,
        vertexai: true,
        project: process.env.GOOGLE_CLOUD_PROJECT!,
        location: process.env.GOOGLE_CLOUD_LOCATION!,
      });

      expect(response.message.content).toBeTruthy();
      console.log("Google Response:", response.message.content);

      const systemPromptResponse = await sendPrompt({
        messages: [{ role: "user" as const, content: "What is your role?" }],
        model: googleModel,
        provider: AI_PROVIDERS.GOOGLE,
        vertexai: true,
        project: process.env.GOOGLE_CLOUD_PROJECT!,
        location: process.env.GOOGLE_CLOUD_LOCATION!,
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
});
