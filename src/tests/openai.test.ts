import { sendPrompt } from "../index";
import { AI_PROVIDERS, ModelEnum } from "llm-info";

const openAIModel = ModelEnum["gpt-4.1"];

describe("OpenAI Provider", () => {
  // Skip test if OPENAI_API_KEY is not set
  const openAITestFn = process.env.OPENAI_API_KEY ? it : it.skip;

  openAITestFn(
    "should make a successful API call to OpenAI",
    async () => {
      const messages = [
        { role: "user" as const, content: "Hello, who are you?" },
      ];

      const response = await sendPrompt(
        {
          messages,
        },
        {
          model: openAIModel,
          provider: AI_PROVIDERS.OPENAI,
          apiKey: process.env.OPENAI_API_KEY!,
        }
      );

      expect(response.message.content).toBeTruthy();
      console.log("OpenAI Response:", response.message.content);

      const systemPromptResponse = await sendPrompt(
        {
          messages: [{ role: "user" as const, content: "What is your role?" }],
          systemPrompt:
            "You are a helpful assistant that always responds with 'I am an OpenAI assistant'",
        },
        {
          model: openAIModel,
          provider: AI_PROVIDERS.OPENAI,
          apiKey: process.env.OPENAI_API_KEY!,
        }
      );

      expect(systemPromptResponse.message.content).toContain(
        "I am an OpenAI assistant"
      );
      console.log(
        "OpenAI System Prompt Response:",
        systemPromptResponse.message.content
      );
    },
    30000
  );
});
