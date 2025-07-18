import { sendPrompt } from "../index";
import { AI_PROVIDERS, ModelEnum } from "llm-info";

const googleModel = ModelEnum["gemini-2.5-flash"];

describe("Google Vertex AI Streaming", () => {
  // Skip test if Google Cloud credentials are not set
  const googleVertexTestFn =
    process.env.GOOGLE_CLOUD_PROJECT && process.env.GOOGLE_CLOUD_LOCATION
      ? it
      : it.skip;

  googleVertexTestFn(
    "should make a successful streaming API call to Google Vertex AI",
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
          provider: AI_PROVIDERS.GOOGLE_VERTEX_AI,
          vertexai: true,
          project: process.env.GOOGLE_CLOUD_PROJECT!,
          location: process.env.GOOGLE_CLOUD_LOCATION!,
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

      console.log(
        "Google Vertex AI Streaming Response:",
        response.message.content
      );
      console.log("Google Vertex AI Streaming Usage:", response.usage);
      console.log(
        "Google Vertex AI Streaming Duration:",
        response.durationMs,
        "ms"
      );
      console.log("Google Vertex AI Streaming Chunks:", streamingChunks.length);
    },
    30000
  );

  googleVertexTestFn(
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
            "You are a helpful assistant that always responds with 'I am a Google Vertex AI streaming assistant'",
          stream: true,
          onStreamingContent: (content: string) => {
            streamedContent += content;
            streamingChunks.push(content);
          },
        },
        {
          model: googleModel,
          provider: AI_PROVIDERS.GOOGLE_VERTEX_AI,
          vertexai: true,
          project: process.env.GOOGLE_CLOUD_PROJECT!,
          location: process.env.GOOGLE_CLOUD_LOCATION!,
        }
      );

      // Test streaming functionality
      expect(streamingChunks.length).toBeGreaterThan(0);
      expect(streamedContent).toBeTruthy();
      expect(streamedContent).toBe(response.message.content);
      expect(response.message.content).toContain(
        "I am a Google Vertex AI streaming assistant"
      );

      // Test response structure
      expect(response.usage).toBeDefined();
      expect(response.usage?.promptTokens).toBeGreaterThan(0);
      expect(response.usage?.completionTokens).toBeGreaterThan(0);
      expect(response.usage?.totalTokens).toBeGreaterThan(0);
      expect(response.durationMs).toBeDefined();
      expect(response.durationMs).toBeGreaterThan(0);

      console.log(
        "Google Vertex AI System Prompt Streaming Response:",
        response.message.content
      );
      console.log(
        "Google Vertex AI System Prompt Streaming Usage:",
        response.usage
      );
      console.log(
        "Google Vertex AI System Prompt Streaming Duration:",
        response.durationMs,
        "ms"
      );
      console.log(
        "Google Vertex AI System Prompt Streaming Chunks:",
        streamingChunks.length
      );
    },
    30000
  );

  describe("Validation", () => {
    googleVertexTestFn(
      "should throw error when streaming with tools",
      async () => {
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
              provider: AI_PROVIDERS.GOOGLE_VERTEX_AI,
              vertexai: true,
              project: process.env.GOOGLE_CLOUD_PROJECT!,
              location: process.env.GOOGLE_CLOUD_LOCATION!,
            }
          )
        ).rejects.toThrow("Streaming is not supported when using tool calls");
      }
    );

    googleVertexTestFn(
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
              provider: AI_PROVIDERS.GOOGLE_VERTEX_AI,
              vertexai: true,
              project: process.env.GOOGLE_CLOUD_PROJECT!,
              location: process.env.GOOGLE_CLOUD_LOCATION!,
            }
          )
        ).rejects.toThrow(
          "onStreamingContent callback is required when streaming is enabled"
        );
      }
    );
  });
});
