import { sendPrompt } from "../index";
import { AI_PROVIDERS } from "llm-info";

describe("Fireworks Streaming", () => {
  // Skip test if FIREWORKS_API_KEY is not set
  const fireworksTestFn = process.env.FIREWORKS_API_KEY ? it : it.skip;

  const testMessages = [
    { role: "user" as const, content: "Count from 1 to 5" },
  ];

  const fireworksOptions = {
    provider: AI_PROVIDERS.FIREWORKS,
    customModel: "accounts/fireworks/models/deepseek-v3-0324",
    apiKey: process.env.FIREWORKS_API_KEY!,
  };

  fireworksTestFn(
    "should support streaming for Fireworks",
    async () => {
      let streamedContent = "";
      const streamingChunks: string[] = [];

      const response = await sendPrompt(
        {
          messages: testMessages,
          stream: true,
          onStreamingContent: (content: string) => {
            streamedContent += content;
            streamingChunks.push(content);
          },
        },
        fireworksOptions
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

      console.log("Fireworks Streaming Response:", response.message.content);
      console.log("Fireworks Streaming Usage:", response.usage);
      console.log("Fireworks Streaming Duration:", response.durationMs, "ms");
      console.log("Fireworks Streaming Chunks:", streamingChunks.length);
    },
    30000
  );

  describe("Validation", () => {
    it("should throw error when streaming without onStreamingContent callback", async () => {
      await expect(
        sendPrompt(
          {
            messages: testMessages,
            stream: true,
          },
          fireworksOptions
        )
      ).rejects.toThrow(
        "onStreamingContent callback is required when streaming is enabled"
      );
    });

    it("should throw error when streaming with tool calls", async () => {
      await expect(
        sendPrompt(
          {
            messages: testMessages,
            stream: true,
            tools: [
              {
                type: "function",
                function: {
                  name: "test_function",
                  description: "A test function",
                  parameters: {
                    type: "object",
                    properties: {},
                    required: [],
                  },
                },
              },
            ],
            onStreamingContent: () => {},
          },
          fireworksOptions
        )
      ).rejects.toThrow("Streaming is not supported when using tool calls");
    });
  });
});
