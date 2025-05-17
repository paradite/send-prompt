import { sendPrompt } from "../index";
import { AI_PROVIDERS, ModelEnum } from "llm-info";

const anthropicModel = ModelEnum["claude-3-5-sonnet-20240620"];

describe("Anthropic Provider", () => {
  // Skip test if ANTHROPIC_API_KEY is not set
  const anthropicTestFn = process.env.ANTHROPIC_API_KEY ? it : it.skip;

  anthropicTestFn(
    "should make a successful API call to Anthropic",
    async () => {
      const messages = [
        { role: "user" as const, content: "Hello, who are you?" },
      ];

      // Test without system prompt
      const response = await sendPrompt(
        {
          messages,
        },
        {
          model: anthropicModel,
          provider: AI_PROVIDERS.ANTHROPIC,
          apiKey: process.env.ANTHROPIC_API_KEY!,
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
      console.log("Anthropic Response:", response.message.content);
      console.log("Anthropic Usage:", response.usage);

      const systemPromptResponse = await sendPrompt(
        {
          messages: [{ role: "user" as const, content: "What is your role?" }],
          systemPrompt:
            "You are a helpful assistant that always responds with 'I am a Claude assistant'",
        },
        {
          model: anthropicModel,
          provider: AI_PROVIDERS.ANTHROPIC,
          apiKey: process.env.ANTHROPIC_API_KEY!,
        }
      );

      expect(systemPromptResponse.message.content).toContain(
        "I am a Claude assistant"
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
        "Anthropic System Prompt Response:",
        systemPromptResponse.message.content
      );
      console.log("Anthropic System Prompt Usage:", systemPromptResponse.usage);
    },
    30000
  );

  anthropicTestFn(
    "should respect anthropicMaxTokens option",
    async () => {
      const messages = [
        { role: "user" as const, content: "Write a very long story." },
      ];

      const response = await sendPrompt(
        {
          messages,
          anthropicMaxTokens: 100, // Set a small max tokens to limit response length
        },
        {
          model: anthropicModel,
          provider: AI_PROVIDERS.ANTHROPIC,
          apiKey: process.env.ANTHROPIC_API_KEY!,
        }
      );

      expect(response.message.content).toBeTruthy();
      expect(response.usage).toBeDefined();
      expect(response.usage?.completionTokens).toBeLessThanOrEqual(100);
      console.log("Anthropic MaxTokens Response:", response.message.content);
      console.log("Anthropic MaxTokens Usage:", response.usage);
    },
    30000
  );
});
