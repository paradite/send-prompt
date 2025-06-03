import { sendPrompt } from "../index";
import { AI_PROVIDERS } from "llm-info";

describe("Custom Models for First Party Providers", () => {
  // Skip test if OPENAI_API_KEY is not set
  const openAITestFn = process.env.OPENAI_API_KEY ? it : it.skip;

  openAITestFn(
    "should make a successful API call to OpenAI with custom model",
    async () => {
      const messages = [
        { role: "user" as const, content: "Hello, who are you?" },
      ];

      const response = await sendPrompt(
        {
          messages,
        },
        {
          customModel: "gpt-4o-mini", // Using custom model string instead of enum
          provider: AI_PROVIDERS.OPENAI,
          apiKey: process.env.OPENAI_API_KEY!,
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
      expect(response.durationMs).toBeDefined();
      expect(response.durationMs).toBeGreaterThan(0);
      console.log("OpenAI Custom Model Response:", response.message.content);
      console.log("OpenAI Custom Model Usage:", response.usage);
      console.log("OpenAI Custom Model Duration:", response.durationMs, "ms");

      const systemPromptResponse = await sendPrompt(
        {
          messages: [{ role: "user" as const, content: "What is your role?" }],
          systemPrompt:
            "You are a helpful assistant that always responds with 'I am an OpenAI assistant with custom model'",
        },
        {
          customModel: "gpt-4o-mini",
          provider: AI_PROVIDERS.OPENAI,
          apiKey: process.env.OPENAI_API_KEY!,
        }
      );

      expect(systemPromptResponse.message.content).toContain(
        "I am an OpenAI assistant with custom model"
      );
      expect(systemPromptResponse.usage).toBeDefined();
      expect(systemPromptResponse.usage?.promptTokens).toBeGreaterThan(0);
      expect(systemPromptResponse.usage?.completionTokens).toBeGreaterThan(0);
      expect(systemPromptResponse.usage?.totalTokens).toBeGreaterThan(0);
      expect(systemPromptResponse.usage?.totalTokens).toBe(
        (systemPromptResponse.usage?.promptTokens || 0) +
          (systemPromptResponse.usage?.completionTokens || 0)
      );
      expect(systemPromptResponse.durationMs).toBeDefined();
      expect(systemPromptResponse.durationMs).toBeGreaterThan(0);
      console.log(
        "OpenAI Custom Model System Prompt Response:",
        systemPromptResponse.message.content
      );
      console.log(
        "OpenAI Custom Model System Prompt Usage:",
        systemPromptResponse.usage
      );
      console.log(
        "OpenAI Custom Model System Prompt Duration:",
        systemPromptResponse.durationMs,
        "ms"
      );
    },
    30000
  );

  // Skip test if ANTHROPIC_API_KEY is not set
  const anthropicTestFn = process.env.ANTHROPIC_API_KEY ? it : it.skip;

  anthropicTestFn(
    "should make a successful API call to Anthropic with custom model",
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
          customModel: "claude-3-5-sonnet-20241022", // Using custom model string instead of enum
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
      console.log("Anthropic Custom Model Response:", response.message.content);
      console.log("Anthropic Custom Model Usage:", response.usage);

      const systemPromptResponse = await sendPrompt(
        {
          messages: [{ role: "user" as const, content: "What is your role?" }],
          systemPrompt:
            "You are a helpful assistant that always responds with 'I am a Claude assistant with custom model'",
        },
        {
          customModel: "claude-3-5-sonnet-20241022",
          provider: AI_PROVIDERS.ANTHROPIC,
          apiKey: process.env.ANTHROPIC_API_KEY!,
        }
      );

      expect(systemPromptResponse.message.content).toContain(
        "I am a Claude assistant with custom model"
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
        "Anthropic Custom Model System Prompt Response:",
        systemPromptResponse.message.content
      );
      console.log(
        "Anthropic Custom Model System Prompt Usage:",
        systemPromptResponse.usage
      );
    },
    30000
  );

  // Skip test if GEMINI_API_KEY is not set
  const googleTestFn = process.env.GEMINI_API_KEY ? it : it.skip;

  googleTestFn(
    "should make a successful API call to Google with custom model",
    async () => {
      const messages = [
        { role: "user" as const, content: "Hello, who are you?" },
      ];

      const response = await sendPrompt(
        {
          messages,
        },
        {
          customModel: "gemini-1.5-flash", // Using custom model string instead of enum
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
          (response.usage?.completionTokens || 0) +
          (response.usage?.thoughtsTokens || 0)
      );
      expect(response.durationMs).toBeDefined();
      expect(response.durationMs).toBeGreaterThan(0);
      console.log("Google Custom Model Response:", response.message.content);
      console.log("Google Custom Model Usage:", response.usage);
      console.log("Google Custom Model Duration:", response.durationMs, "ms");

      const systemPromptResponse = await sendPrompt(
        {
          messages: [{ role: "user" as const, content: "What is your role?" }],
          systemPrompt:
            "You are a helpful assistant that always responds with 'I am a Gemini assistant with custom model'",
        },
        {
          customModel: "gemini-1.5-flash",
          provider: AI_PROVIDERS.GOOGLE,
          apiKey: process.env.GEMINI_API_KEY!,
        }
      );

      expect(systemPromptResponse.message.content).toContain(
        "I am a Gemini assistant with custom model"
      );
      expect(systemPromptResponse.usage).toBeDefined();
      expect(systemPromptResponse.usage?.promptTokens).toBeGreaterThan(0);
      expect(systemPromptResponse.usage?.completionTokens).toBeGreaterThan(0);
      expect(systemPromptResponse.usage?.totalTokens).toBeGreaterThan(0);
      expect(systemPromptResponse.usage?.totalTokens).toBe(
        (systemPromptResponse.usage?.promptTokens || 0) +
          (systemPromptResponse.usage?.completionTokens || 0) +
          (systemPromptResponse.usage?.thoughtsTokens || 0)
      );
      expect(systemPromptResponse.durationMs).toBeDefined();
      expect(systemPromptResponse.durationMs).toBeGreaterThan(0);
      console.log(
        "Google Custom Model System Prompt Response:",
        systemPromptResponse.message.content
      );
      console.log(
        "Google Custom Model System Prompt Usage:",
        systemPromptResponse.usage
      );
      console.log(
        "Google Custom Model System Prompt Duration:",
        systemPromptResponse.durationMs,
        "ms"
      );
    },
    30000
  );
});
