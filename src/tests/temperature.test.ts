import { sendPrompt } from "../index";
import { AI_PROVIDERS, ModelEnum } from "llm-info";

describe("Temperature Parameter", () => {
  // Skip test if OPENAI_API_KEY is not set
  const openaiTestFn = process.env.OPENAI_API_KEY ? it : it.skip;

  openaiTestFn(
    "should accept temperature parameter for OpenAI",
    async () => {
      const messages = [{ role: "user" as const, content: "Say hello" }];

      const response = await sendPrompt(
        {
          messages,
          temperature: 0.1, // Low temperature for deterministic response
        },
        {
          model: ModelEnum["gpt-4o-mini"],
          provider: AI_PROVIDERS.OPENAI,
          apiKey: process.env.OPENAI_API_KEY!,
        }
      );

      expect(response.message.content).toBeTruthy();
      expect(response.usage).toBeDefined();
      expect(response.usage?.promptTokens).toBeGreaterThan(0);
      expect(response.usage?.completionTokens).toBeGreaterThan(0);
      console.log(
        "OpenAI Response with temperature 0.1:",
        response.message.content
      );
    },
    30000
  );

  // Skip test if ANTHROPIC_API_KEY is not set
  const anthropicTestFn = process.env.ANTHROPIC_API_KEY ? it : it.skip;

  anthropicTestFn(
    "should accept temperature parameter for Anthropic",
    async () => {
      const messages = [{ role: "user" as const, content: "Say hello" }];

      const response = await sendPrompt(
        {
          messages,
          temperature: 0.9, // High temperature for creative response
        },
        {
          model: ModelEnum["claude-3-5-haiku-20241022"],
          provider: AI_PROVIDERS.ANTHROPIC,
          apiKey: process.env.ANTHROPIC_API_KEY!,
        }
      );

      expect(response.message.content).toBeTruthy();
      expect(response.usage).toBeDefined();
      expect(response.usage?.promptTokens).toBeGreaterThan(0);
      expect(response.usage?.completionTokens).toBeGreaterThan(0);
      console.log(
        "Anthropic Response with temperature 0.9:",
        response.message.content
      );
    },
    30000
  );

  // Skip test if GEMINI_API_KEY is not set
  const googleTestFn = process.env.GEMINI_API_KEY ? it : it.skip;

  googleTestFn(
    "should accept temperature parameter for Google",
    async () => {
      const messages = [{ role: "user" as const, content: "Say hello" }];

      const response = await sendPrompt(
        {
          messages,
          temperature: 0.5, // Medium temperature
        },
        {
          model: ModelEnum["gemini-2.5-pro-preview-05-06"],
          provider: AI_PROVIDERS.GOOGLE,
          apiKey: process.env.GEMINI_API_KEY!,
        }
      );

      expect(response.message.content).toBeTruthy();
      expect(response.usage).toBeDefined();
      expect(response.usage?.promptTokens).toBeGreaterThan(0);
      expect(response.usage?.completionTokens).toBeGreaterThan(0);
      console.log(
        "Google Response with temperature 0.5:",
        response.message.content
      );
    },
    30000
  );
});
