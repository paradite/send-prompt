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
      console.log("Anthropic Response:", response.message.content);

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
      console.log(
        "Anthropic System Prompt Response:",
        systemPromptResponse.message.content
      );
    },
    30000
  );
});
