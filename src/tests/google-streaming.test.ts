import { sendPrompt } from "../index";
import { AI_PROVIDERS, ModelEnum } from "llm-info";

const googleModel = ModelEnum["gemini-2.5-flash-preview-04-17"];

describe("Google Streaming", () => {
  // Skip test if GEMINI_API_KEY is not set
  const googleTestFn = process.env.GEMINI_API_KEY ? it : it.skip;

  googleTestFn(
    "should make a successful streaming API call to Google",
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
          model: googleModel,
          provider: AI_PROVIDERS.GOOGLE,
          apiKey: process.env.GEMINI_API_KEY!,
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

      console.log("Google Streaming Response:", response.message.content);
      console.log("Google Streaming Usage:", response.usage);
      console.log("Google Streaming Duration:", response.durationMs, "ms");
      console.log("Google Streaming Chunks:", streamingChunks.length);
    },
    30000
  );

  googleTestFn(
    "should handle system prompt with streaming",
    async () => {
      const messages = [
        { role: "user" as const, content: "What is your role?" },
      ];

      let streamedContent = "";
      const streamingChunks: string[] = [];

      const response = await sendPrompt(
        {
          messages,
          systemPrompt:
            "You are a helpful assistant that always responds with 'I am a Google streaming assistant'",
          stream: true,
          onStreamingContent: (content: string) => {
            streamedContent += content;
            streamingChunks.push(content);
          },
        },
        {
          model: googleModel,
          provider: AI_PROVIDERS.GOOGLE,
          apiKey: process.env.GEMINI_API_KEY!,
        }
      );

      // Test streaming functionality
      expect(streamingChunks.length).toBeGreaterThan(0);
      expect(streamedContent).toBeTruthy();
      expect(streamedContent).toBe(response.message.content);
      expect(response.message.content).toContain(
        "I am a Google streaming assistant"
      );

      // Test response structure
      expect(response.usage).toBeDefined();
      expect(response.usage?.promptTokens).toBeGreaterThan(0);
      expect(response.usage?.completionTokens).toBeGreaterThan(0);
      expect(response.usage?.totalTokens).toBeGreaterThan(0);
      expect(response.durationMs).toBeDefined();
      expect(response.durationMs).toBeGreaterThan(0);

      console.log(
        "Google System Prompt Streaming Response:",
        response.message.content
      );
      console.log("Google System Prompt Streaming Usage:", response.usage);
      console.log(
        "Google System Prompt Streaming Duration:",
        response.durationMs,
        "ms"
      );
      console.log(
        "Google System Prompt Streaming Chunks:",
        streamingChunks.length
      );
    },
    30000
  );

  googleTestFn(
    "should handle temperature parameter with streaming",
    async () => {
      const messages = [
        {
          role: "user" as const,
          content:
            "Write a creative short story about a robot in exactly 2 sentences.",
        },
      ];

      let streamedContent = "";
      const streamingChunks: string[] = [];

      const response = await sendPrompt(
        {
          messages,
          temperature: 0.8,
          stream: true,
          onStreamingContent: (content: string) => {
            streamedContent += content;
            streamingChunks.push(content);
          },
        },
        {
          model: googleModel,
          provider: AI_PROVIDERS.GOOGLE,
          apiKey: process.env.GEMINI_API_KEY!,
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
      expect(response.durationMs).toBeDefined();
      expect(response.durationMs).toBeGreaterThan(0);

      console.log(
        "Google Temperature Streaming Response:",
        response.message.content
      );
      console.log("Google Temperature Streaming Usage:", response.usage);
      console.log(
        "Google Temperature Streaming Duration:",
        response.durationMs,
        "ms"
      );
      console.log(
        "Google Temperature Streaming Chunks:",
        streamingChunks.length
      );
    },
    30000
  );

  describe("Validation", () => {
    googleTestFn("should throw error when streaming with tools", async () => {
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
            model: googleModel,
            provider: AI_PROVIDERS.GOOGLE,
            apiKey: process.env.GEMINI_API_KEY!,
          }
        )
      ).rejects.toThrow("Streaming is not supported when using tool calls");
    });

    googleTestFn(
      "should throw error when streaming without callback",
      async () => {
        const messages = [{ role: "user" as const, content: "Hello" }];

        await expect(
          sendPrompt(
            {
              messages,
              stream: true,
            },
            {
              model: googleModel,
              provider: AI_PROVIDERS.GOOGLE,
              apiKey: process.env.GEMINI_API_KEY!,
            }
          )
        ).rejects.toThrow(
          "onStreamingContent callback is required when streaming is enabled"
        );
      }
    );
  });
});
