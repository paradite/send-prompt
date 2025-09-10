import { sendPrompt } from "../index";
import { AI_PROVIDERS, ModelEnum } from "llm-info";

const azureOpenAIModel = ModelEnum["gpt-4.1"];

describe("Azure OpenAI Provider", () => {
  // Skip test if AZURE_OPENAI_API_KEY is not set
  const azureOpenAITestFn = process.env.AZURE_OPENAI_API_KEY ? it : it.skip;

  azureOpenAITestFn.skip(
    "should make a successful API call to Azure OpenAI",
    async () => {
      const messages = [
        { role: "user" as const, content: "Hello, who are you?" },
      ];

      const response = await sendPrompt(
        {
          messages,
        },
        {
          model: azureOpenAIModel,
          provider: AI_PROVIDERS.AZURE_OPENAI,
          apiKey: process.env.AZURE_OPENAI_API_KEY!,
          endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
          deployment: process.env.AZURE_OPENAI_DEPLOYMENT!,
          apiVersion: process.env.AZURE_OPENAI_API_VERSION!,
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
      console.log("Azure OpenAI Response:", response.message.content);
      console.log("Azure OpenAI Usage:", response.usage);
      console.log("Azure OpenAI Duration:", response.durationMs, "ms");

      const systemPromptResponse = await sendPrompt(
        {
          messages: [{ role: "user" as const, content: "What is your role?" }],
          systemPrompt:
            "You are a helpful assistant that always responds with 'I am an Azure OpenAI assistant'",
        },
        {
          model: azureOpenAIModel,
          provider: AI_PROVIDERS.AZURE_OPENAI,
          apiKey: process.env.AZURE_OPENAI_API_KEY!,
          endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
          deployment: process.env.AZURE_OPENAI_DEPLOYMENT!,
          apiVersion: process.env.AZURE_OPENAI_API_VERSION!,
        }
      );

      expect(systemPromptResponse.message.content).toContain(
        "I am an Azure OpenAI assistant"
      );
      expect(systemPromptResponse.usage).toBeDefined();
      expect(systemPromptResponse.usage?.promptTokens).toBeGreaterThan(0);
      expect(systemPromptResponse.usage?.completionTokens).toBeGreaterThan(0);
      expect(systemPromptResponse.usage?.totalTokens).toBeGreaterThan(0);
      expect(systemPromptResponse.usage?.totalTokens).toBe(
        (systemPromptResponse.usage?.promptTokens || 0) +
          (systemPromptResponse.usage?.completionTokens || 0)
      );
    }
  );

  azureOpenAITestFn.skip(
    "should support streaming with Azure OpenAI",
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
          model: azureOpenAIModel,
          provider: AI_PROVIDERS.AZURE_OPENAI,
          apiKey: process.env.AZURE_OPENAI_API_KEY!,
          endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
          deployment: process.env.AZURE_OPENAI_DEPLOYMENT!,
          apiVersion: process.env.AZURE_OPENAI_API_VERSION!,
        }
      );

      // Verify streaming worked
      expect(streamingChunks.length).toBeGreaterThan(0);
      expect(streamedContent).toBeTruthy();
      expect(response.message.content).toBe(streamedContent);
      expect(response.usage).toBeDefined();
      expect(response.usage?.promptTokens).toBeGreaterThan(0);
      expect(response.usage?.completionTokens).toBeGreaterThan(0);
      expect(response.usage?.totalTokens).toBeGreaterThan(0);
      expect(response.durationMs).toBeDefined();
      expect(response.durationMs).toBeGreaterThan(0);

      console.log("Azure OpenAI Streaming Response:", response.message.content);
      console.log("Azure OpenAI Streaming Usage:", response.usage);
      console.log(
        "Azure OpenAI Streaming Duration:",
        response.durationMs,
        "ms"
      );
      console.log("Azure OpenAI Streaming Chunks:", streamingChunks.length);
    }
  );

  azureOpenAITestFn.skip(
    "should reject streaming when tools are provided for Azure OpenAI",
    async () => {
      const messages = [
        { role: "user" as const, content: "What's the weather like?" },
      ];

      const weatherTool = {
        type: "function" as const,
        function: {
          name: "get_weather",
          description: "Get the current weather",
          parameters: {
            type: "object" as const,
            properties: {
              location: {
                type: "string",
                description: "The location to get weather for",
              },
            },
            required: ["location"],
            additionalProperties: false,
          },
        },
      };

      await expect(
        sendPrompt(
          {
            messages,
            tools: [weatherTool],
            stream: true,
            onStreamingContent: (content: string) => {
              console.log(content);
            },
          },
          {
            model: azureOpenAIModel,
            provider: AI_PROVIDERS.AZURE_OPENAI,
            apiKey: process.env.AZURE_OPENAI_API_KEY!,
            endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
            deployment: process.env.AZURE_OPENAI_DEPLOYMENT!,
            apiVersion: process.env.AZURE_OPENAI_API_VERSION!,
          }
        )
      ).rejects.toThrow("Streaming is not supported when using tool calls");
    }
  );
});
