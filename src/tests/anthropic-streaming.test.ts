import { sendPrompt } from "../index";
import { AI_PROVIDERS, ModelEnum } from "llm-info";

const anthropicModel = ModelEnum["claude-3-5-sonnet-20240620"];

describe("Anthropic Streaming", () => {
  // Skip test if ANTHROPIC_API_KEY is not set
  const anthropicTestFn = process.env.ANTHROPIC_API_KEY ? it : it.skip;

  anthropicTestFn(
    "should make a successful streaming API call to Anthropic",
    async () => {
      const messages = [
        { role: "user" as const, content: "Count from 1 to 5" },
      ];

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
          model: anthropicModel,
          provider: AI_PROVIDERS.ANTHROPIC,
          apiKey: process.env.ANTHROPIC_API_KEY!,
        }
      );

      // Test streaming functionality
      expect(streamingChunks.length).toBeGreaterThan(0);
      expect(streamedContent).toBeTruthy();
      expect(streamedContent).toBe(response.message.content);

      // Test response structure
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

      console.log("Anthropic Streaming Response:", response.message.content);
      console.log("Anthropic Streaming Usage:", response.usage);
      console.log("Anthropic Streaming Duration:", response.durationMs, "ms");
      console.log("Anthropic Streaming Chunks:", streamingChunks.length);
    },
    30000
  );

  describe("Validation", () => {
    it("should throw error when streaming with tools", async () => {
      const messages = [{ role: "user" as const, content: "What is 2 + 2?" }];

      const tool = {
        type: "function" as const,
        function: {
          name: "calculator",
          description: "Perform basic arithmetic",
          parameters: {
            type: "object" as const,
            properties: {
              operation: { type: "string" },
              a: { type: "number" },
              b: { type: "number" },
            },
            required: ["operation", "a", "b"],
          },
        },
      };

      await expect(
        sendPrompt(
          {
            messages,
            tools: [tool],
            stream: true,
            onStreamingContent: () => {},
          },
          {
            model: anthropicModel,
            provider: AI_PROVIDERS.ANTHROPIC,
            apiKey: process.env.ANTHROPIC_API_KEY!,
          }
        )
      ).rejects.toThrow("Streaming is not supported when using tool calls");
    });

    it("should throw error when streaming without callback", async () => {
      const messages = [{ role: "user" as const, content: "Hello" }];

      await expect(
        sendPrompt(
          {
            messages,
            stream: true,
          },
          {
            model: anthropicModel,
            provider: AI_PROVIDERS.ANTHROPIC,
            apiKey: process.env.ANTHROPIC_API_KEY!,
          }
        )
      ).rejects.toThrow(
        "onStreamingContent callback is required when streaming is enabled"
      );
    });
  });
});
