import { sendPrompt } from "../index";
import { AI_PROVIDERS, AI_PROVIDER_CONFIG } from "llm-info";

describe("Fireworks Custom Provider", () => {
  // Skip test if FIREWORKS_API_KEY is not set
  const fireworksTestFn = process.env.FIREWORKS_API_KEY ? it : it.skip;

  fireworksTestFn(
    "should make a successful API call to Fireworks as a custom provider",
    async () => {
      const messages = [
        { role: "user" as const, content: "Hello, who are you?" },
      ];

      const baseURL = AI_PROVIDER_CONFIG[AI_PROVIDERS.FIREWORKS].baseURL;
      // TODO: Better type narrowing for AI_PROVIDER_CONFIG baseURL
      if (!baseURL) {
        throw new Error("Fireworks base URL is not defined");
      }

      // Test without system prompt
      const response = await sendPrompt(
        {
          messages,
        },
        {
          provider: "custom",
          customModel: "accounts/fireworks/models/deepseek-v3-0324",
          baseURL,
          apiKey: process.env.FIREWORKS_API_KEY!,
        }
      );

      expect(response.message.content).toBeTruthy();
      console.log(
        "Fireworks Custom Provider Response:",
        response.message.content
      );

      const systemPromptResponse = await sendPrompt(
        {
          messages: [{ role: "user" as const, content: "What is your role?" }],
          systemPrompt:
            "You are a helpful assistant that always responds with 'I am a Fireworks assistant'",
        },
        {
          provider: "custom",
          customModel: "accounts/fireworks/models/deepseek-v3-0324",
          baseURL,
          apiKey: process.env.FIREWORKS_API_KEY!,
        }
      );

      expect(systemPromptResponse.message.content).toContain(
        "I am a Fireworks assistant"
      );
      console.log(
        "Fireworks Custom Provider System Prompt Response:",
        systemPromptResponse.message.content
      );
    },
    30000
  );

  fireworksTestFn(
    "should support streaming with Fireworks as a custom provider",
    async () => {
      const messages = [
        {
          role: "user" as const,
          content: "Tell me a short story about a robot.",
        },
      ];

      const baseURL = AI_PROVIDER_CONFIG[AI_PROVIDERS.FIREWORKS].baseURL;
      if (!baseURL) {
        throw new Error("Fireworks base URL is not defined");
      }

      let streamedContent = "";
      const streamingChunks: string[] = [];

      const response = await sendPrompt(
        {
          messages,
          stream: true,
          onStreamingContent: (content: string) => {
            streamedContent += content;
            streamingChunks.push(content);
          },
        },
        {
          provider: "custom",
          customModel: "accounts/fireworks/models/deepseek-v3-0324",
          baseURL,
          apiKey: process.env.FIREWORKS_API_KEY!,
        }
      );

      // Verify streaming worked
      expect(streamingChunks.length).toBeGreaterThan(0);
      expect(streamedContent).toBeTruthy();
      expect(response.message.content).toBe(streamedContent);
      expect(response.message.content).toContain("robot");

      console.log(
        "Fireworks Custom Provider Streaming Response:",
        response.message.content
      );
      console.log("Number of streaming chunks:", streamingChunks.length);
    },
    30000
  );
});
