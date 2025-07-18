import { sendPrompt } from "../index";
import { AI_PROVIDERS } from "llm-info";

// Skip test if OPENROUTER_API_KEY is not set
const openRouterTestFn = process.env.OPENROUTER_API_KEY ? it : it.skip;

describe("OpenRouter Provider Options", () => {
  openRouterTestFn("should work with order provider preference", async () => {
    const response = await sendPrompt(
      {
        messages: [
          {
            role: "user",
            content: "Hello, world!",
          },
        ],
      },
      {
        provider: AI_PROVIDERS.OPENROUTER,
        customModel: "openai/gpt-4o-mini",
        apiKey: process.env.OPENROUTER_API_KEY!,
        providerOptions: {
          order: ["openai", "azure"]
        }
      }
    );

    expect(response.message.content).toBeTruthy();
    expect(response.message.role).toBe("assistant");
    expect(response.durationMs).toBeGreaterThan(0);
  });

  openRouterTestFn("should work with only specific providers", async () => {
    const response = await sendPrompt(
      {
        messages: [
          {
            role: "user",
            content: "Hello, world!",
          },
        ],
      },
      {
        provider: AI_PROVIDERS.OPENROUTER,
        customModel: "openai/gpt-4o-mini",
        apiKey: process.env.OPENROUTER_API_KEY!,
        providerOptions: {
          only: ["openai"]
        }
      }
    );

    expect(response.message.content).toBeTruthy();
    expect(response.message.role).toBe("assistant");
    expect(response.durationMs).toBeGreaterThan(0);
  });

  openRouterTestFn("should work with ignore specific providers", async () => {
    const response = await sendPrompt(
      {
        messages: [
          {
            role: "user",
            content: "Hello, world!",
          },
        ],
      },
      {
        provider: AI_PROVIDERS.OPENROUTER,
        customModel: "meta-llama/llama-3.1-8b-instruct",
        apiKey: process.env.OPENROUTER_API_KEY!,
        providerOptions: {
          ignore: ["fireworks"]
        }
      }
    );

    expect(response.message.content).toBeTruthy();
    expect(response.message.role).toBe("assistant");
    expect(response.durationMs).toBeGreaterThan(0);
  });

  openRouterTestFn("should work with multiple provider options combined", async () => {
    const response = await sendPrompt(
      {
        messages: [
          {
            role: "user",
            content: "Hello, world!",
          },
        ],
      },
      {
        provider: AI_PROVIDERS.OPENROUTER,
        customModel: "openai/gpt-4o-mini",
        apiKey: process.env.OPENROUTER_API_KEY!,
        providerOptions: {
          order: ["openai", "azure"],
          only: ["openai", "azure"],
          ignore: ["fireworks"]
        }
      }
    );

    expect(response.message.content).toBeTruthy();
    expect(response.message.role).toBe("assistant");
    expect(response.durationMs).toBeGreaterThan(0);
  });

  openRouterTestFn("should work without provider options (backward compatibility)", async () => {
    const response = await sendPrompt(
      {
        messages: [
          {
            role: "user",
            content: "Hello, world!",
          },
        ],
      },
      {
        provider: AI_PROVIDERS.OPENROUTER,
        customModel: "openai/gpt-4o-mini",
        apiKey: process.env.OPENROUTER_API_KEY!,
        // No providerOptions - should work as before
      }
    );

    expect(response.message.content).toBeTruthy();
    expect(response.message.role).toBe("assistant");
    expect(response.durationMs).toBeGreaterThan(0);
  });
});