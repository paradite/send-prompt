import { sendPrompt } from "./index";
import { AI_PROVIDERS, ModelEnum } from "llm-info";

describe("sendPrompt", () => {
  // Skip test if OPENAI_API_KEY is not set
  const openAITestFn = process.env.OPENAI_API_KEY ? it : it.skip;

  openAITestFn(
    "should make a successful API call to OpenAI",
    async () => {
      const messages = [
        { role: "user" as const, content: "Hello, who are you?" },
      ];

      const response = await sendPrompt({
        messages,
        model: ModelEnum["gpt-4.1"],
        provider: AI_PROVIDERS.OPENAI,
        apiKey: process.env.OPENAI_API_KEY!,
      });

      expect(response.choices[0].message.content).toBeTruthy();
      console.log("OpenAI Response:", response.choices[0].message.content);

      const systemPromptResponse = await sendPrompt({
        messages: [{ role: "user" as const, content: "What is your role?" }],
        model: ModelEnum["gpt-4.1"],
        provider: AI_PROVIDERS.OPENAI,
        apiKey: process.env.OPENAI_API_KEY!,
        systemPrompt:
          "You are a helpful assistant that always responds with 'I am an OpenAI assistant'",
      });

      expect(systemPromptResponse.choices[0].message.content).toContain(
        "I am an OpenAI assistant"
      );
      console.log(
        "OpenAI System Prompt Response:",
        systemPromptResponse.choices[0].message.content
      );
    },
    30000
  );

  // Skip test if ANTHROPIC_API_KEY is not set
  const anthropicTestFn = process.env.ANTHROPIC_API_KEY ? it : it.skip;

  anthropicTestFn(
    "should make a successful API call to Anthropic",
    async () => {
      const messages = [
        { role: "user" as const, content: "Hello, who are you?" },
      ];

      // Test without system prompt
      const response = await sendPrompt({
        messages,
        model: ModelEnum["claude-3-5-sonnet-20240620"],
        provider: AI_PROVIDERS.ANTHROPIC,
        apiKey: process.env.ANTHROPIC_API_KEY!,
      });

      expect(response.choices[0].message.content).toBeTruthy();
      console.log("Anthropic Response:", response.choices[0].message.content);

      const systemPromptResponse = await sendPrompt({
        messages: [{ role: "user" as const, content: "What is your role?" }],
        model: ModelEnum["claude-3-5-sonnet-20240620"],
        provider: AI_PROVIDERS.ANTHROPIC,
        apiKey: process.env.ANTHROPIC_API_KEY!,
        systemPrompt:
          "You are a helpful assistant that always responds with 'I am a Claude assistant'",
      });

      expect(systemPromptResponse.choices[0].message.content).toContain(
        "I am a Claude assistant"
      );
      console.log(
        "Anthropic System Prompt Response:",
        systemPromptResponse.choices[0].message.content
      );
    },
    30000
  );

  test("should throw error for unsupported provider", async () => {
    const messages = [{ role: "user" as const, content: "Hello" }];

    await expect(async () => {
      await sendPrompt({
        messages,
        model: ModelEnum["gpt-4.1"],
        provider: "unsupported" as any,
        apiKey: "dummy-key",
      });
    }).rejects.toThrow("Provider unsupported is not supported yet");
  });
});
