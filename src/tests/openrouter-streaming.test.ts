import { sendPrompt } from "../index";
import { AI_PROVIDERS } from "llm-info";

describe("OpenRouter Streaming", () => {
  // Skip test if OPENROUTER_API_KEY is not set
  const openRouterTestFn = process.env.OPENROUTER_API_KEY ? it : it.skip;

  const testMessages = [
    { role: "user" as const, content: "Say 'Hello World' and nothing else." },
  ];

  const openRouterOptions = {
    provider: AI_PROVIDERS.OPENROUTER,
    customModel: "openai/gpt-4.1-mini",
    apiKey: process.env.OPENROUTER_API_KEY!,
  };

  openRouterTestFn(
    "should support streaming for OpenRouter",
    async () => {
      const streamedContent: string[] = [];

      const response = await sendPrompt(
        {
          messages: testMessages,
          stream: true,
          onStreamingContent: (content: string) => {
            streamedContent.push(content);
          },
        },
        openRouterOptions
      );

      // Verify streaming worked
      expect(streamedContent.length).toBeGreaterThan(0);
      expect(streamedContent.join("")).toBe(response.message.content);
      expect(response.message.content).toBeTruthy();
      expect(response.durationMs).toBeGreaterThan(0);

      console.log("OpenRouter Streaming Content Chunks:", streamedContent);
      console.log("OpenRouter Streaming Response:", response.message.content);
      console.log("OpenRouter Streaming Usage:", response.usage);
      console.log("OpenRouter Streaming Duration:", response.durationMs, "ms");
    },
    30000
  );

  openRouterTestFn(
    "should work without streaming for OpenRouter",
    async () => {
      const response = await sendPrompt(
        {
          messages: testMessages,
        },
        openRouterOptions
      );

      expect(response.message.content).toBeTruthy();
      expect(response.durationMs).toBeGreaterThan(0);

      console.log(
        "OpenRouter Non-Streaming Response:",
        response.message.content
      );
      console.log("OpenRouter Non-Streaming Usage:", response.usage);
      console.log(
        "OpenRouter Non-Streaming Duration:",
        response.durationMs,
        "ms"
      );
    },
    30000
  );

  openRouterTestFn(
    "should support streaming with system prompt for OpenRouter",
    async () => {
      const streamedContent: string[] = [];

      const response = await sendPrompt(
        {
          messages: [{ role: "user" as const, content: "What is your role?" }],
          systemPrompt:
            "You are a helpful assistant that always responds with 'I am an OpenRouter assistant'",
          stream: true,
          onStreamingContent: (content: string) => {
            streamedContent.push(content);
          },
        },
        openRouterOptions
      );

      // Verify streaming worked
      expect(streamedContent.length).toBeGreaterThan(0);
      expect(streamedContent.join("")).toBe(response.message.content);
      expect(response.message.content).toContain("OpenRouter assistant");
      expect(response.durationMs).toBeGreaterThan(0);

      console.log(
        "OpenRouter System Prompt Streaming Content Chunks:",
        streamedContent
      );
      console.log(
        "OpenRouter System Prompt Streaming Response:",
        response.message.content
      );
      console.log("OpenRouter System Prompt Streaming Usage:", response.usage);
      console.log(
        "OpenRouter System Prompt Streaming Duration:",
        response.durationMs,
        "ms"
      );
    },
    30000
  );

  openRouterTestFn(
    "should support streaming with temperature for OpenRouter",
    async () => {
      const streamedContent: string[] = [];

      const response = await sendPrompt(
        {
          messages: [
            { role: "user" as const, content: "Tell me a very short joke." },
          ],
          temperature: 0.9,
          stream: true,
          onStreamingContent: (content: string) => {
            streamedContent.push(content);
          },
        },
        openRouterOptions
      );

      // Verify streaming worked
      expect(streamedContent.length).toBeGreaterThan(0);
      expect(streamedContent.join("")).toBe(response.message.content);
      expect(response.message.content).toBeTruthy();
      expect(response.durationMs).toBeGreaterThan(0);

      console.log(
        "OpenRouter Temperature Streaming Content Chunks:",
        streamedContent
      );
      console.log(
        "OpenRouter Temperature Streaming Response:",
        response.message.content
      );
      console.log("OpenRouter Temperature Streaming Usage:", response.usage);
      console.log(
        "OpenRouter Temperature Streaming Duration:",
        response.durationMs,
        "ms"
      );
    },
    30000
  );

  openRouterTestFn(
    "should support streaming with reasoning model for OpenRouter (reasoning not available in streaming)",
    async () => {
      const streamedContent: string[] = [];

      const response = await sendPrompt(
        {
          messages: [
            {
              role: "user" as const,
              content:
                "A farmer has 17 sheep. All but 9 die. How many sheep are left alive? Think through this step by step.",
            },
          ],
          stream: true,
          onStreamingContent: (content: string) => {
            streamedContent.push(content);
          },
        },
        {
          provider: AI_PROVIDERS.OPENROUTER,
          customModel: "qwen/qwen3-8b:free",
          apiKey: process.env.OPENROUTER_API_KEY!,
          headers: {
            "HTTP-Referer": "https://eval.16x.engineer/",
            "X-Title": "16x Eval",
          },
        }
      );

      // Verify streaming worked
      expect(streamedContent.length).toBeGreaterThan(0);
      expect(streamedContent.join("")).toBe(response.message.content);
      expect(response.message.content).toBeTruthy();

      // Note: Reasoning is not available in streaming mode with OpenRouter
      // but the model may still generate reasoning tokens internally
      expect(response.reasoning).toBeUndefined();
      expect(response.usage?.thoughtsTokens).toBeGreaterThanOrEqual(0);
      expect(response.message.content).not.toContain("<think>");
      expect(response.message.content).not.toContain("</think>");
      expect(response.usage).toBeDefined();
      expect(response.usage?.promptTokens).toBeGreaterThan(0);
      expect(response.usage?.completionTokens).toBeGreaterThan(0);
      expect(response.usage?.totalTokens).toBeGreaterThan(0);
      expect(response.usage?.totalTokens).toBe(
        (response.usage?.promptTokens || 0) +
          (response.usage?.completionTokens || 0)
      );
      expect(response.durationMs).toBeGreaterThan(0);

      console.log(
        "OpenRouter Reasoning Streaming Content Chunks:",
        streamedContent
      );
      console.log(
        "OpenRouter Reasoning Streaming Response:",
        response.message.content
      );
      console.log(
        "OpenRouter Reasoning Streaming Reasoning:",
        response.reasoning
      );
      console.log("OpenRouter Reasoning Streaming Usage:", response.usage);
      console.log(
        "OpenRouter Reasoning Streaming Duration:",
        response.durationMs,
        "ms"
      );
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
          openRouterOptions
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
          openRouterOptions
        )
      ).rejects.toThrow("Streaming is not supported when using tool calls");
    });
  });
});
