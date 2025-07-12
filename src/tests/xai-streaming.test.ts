import { sendPrompt } from "../index";
import { AI_PROVIDERS } from "llm-info";

describe("XAI Streaming", () => {
  // Skip test if XAI_API_KEY is not set
  const xaiTestFn = process.env.XAI_API_KEY ? it : it.skip;

  xaiTestFn(
    "should make a successful streaming API call to XAI",
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
          customModel: "grok-4",
          provider: AI_PROVIDERS.XAI,
          apiKey: process.env.XAI_API_KEY!,
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
      expect(response.usage?.totalTokens).toBeGreaterThanOrEqual(
        (response.usage?.promptTokens || 0) +
          (response.usage?.completionTokens || 0)
      );
      expect(response.durationMs).toBeDefined();
      expect(response.durationMs).toBeGreaterThan(0);

      console.log("XAI Streaming Response:", response.message.content);
      console.log("XAI Streaming Usage:", response.usage);
      console.log("XAI Streaming Duration:", response.durationMs, "ms");
      console.log("XAI Streaming Chunks:", streamingChunks.length);
    },
    30000
  );

  describe("Validation", () => {
    it("should throw error when streaming without onStreamingContent callback", async () => {
      const messages = [{ role: "user" as const, content: "Hello" }];

      await expect(
        sendPrompt(
          {
            messages,
            stream: true,
          },
          {
            customModel: "grok-4",
            provider: AI_PROVIDERS.XAI,
            apiKey: process.env.XAI_API_KEY!,
          }
        )
      ).rejects.toThrow(
        "onStreamingContent callback is required when streaming is enabled"
      );
    });

    it("should throw error when streaming with tool calls", async () => {
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
            customModel: "grok-4",
            provider: AI_PROVIDERS.XAI,
            apiKey: process.env.XAI_API_KEY!,
          }
        )
      ).rejects.toThrow("Streaming is not supported when using tool calls");
    });
  });
});