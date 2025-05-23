import { sendPrompt } from "../index";
import { AI_PROVIDERS, ModelEnum } from "llm-info";
import { calculatorTool } from "./shared/tools";

const openAIModel = ModelEnum["gpt-4.1"];

describe("OpenAI Function Calling", () => {
  // Skip test if OPENAI_API_KEY is not set
  const openAITestFn = process.env.OPENAI_API_KEY ? it : it.skip;

  openAITestFn(
    "should make a function call to calculator",
    async () => {
      const messages = [
        { role: "user" as const, content: "What is 5 plus 3?" },
      ];

      const response = await sendPrompt(
        {
          messages,
          tools: [calculatorTool],
        },
        {
          model: openAIModel,
          provider: AI_PROVIDERS.OPENAI,
          apiKey: process.env.OPENAI_API_KEY!,
        }
      );

      // Check if we got a function call
      expect(response.tool_calls).toBeDefined();
      expect(response.tool_calls?.length).toBeGreaterThan(0);

      const toolCall = response.tool_calls![0];
      expect(toolCall.function.name).toBe("calculator");

      // Parse the arguments
      const args = JSON.parse(toolCall.function.arguments);
      expect(args.operation).toBe("add");
      expect(args.a).toBe(5);
      expect(args.b).toBe(3);

      console.log("Calculator function call:", toolCall);
    },
    30000
  );

  openAITestFn(
    "should handle multiple operations in one query",
    async () => {
      const messages = [
        {
          role: "user" as const,
          content: "What is 20 minus 8? And what is 5 multiply by 3?",
        },
      ];

      const response = await sendPrompt(
        {
          messages,
          tools: [calculatorTool],
        },
        {
          model: openAIModel,
          provider: AI_PROVIDERS.OPENAI,
          apiKey: process.env.OPENAI_API_KEY!,
        }
      );

      expect(response.tool_calls).toBeDefined();
      expect(response.tool_calls?.length).toBeGreaterThan(0);

      // The model should make two function calls
      const firstCall = response.tool_calls![0];
      expect(firstCall.function.name).toBe("calculator");
      const firstArgs = JSON.parse(firstCall.function.arguments);
      expect(firstArgs.operation).toBe("subtract");
      expect(firstArgs.a).toBe(20);
      expect(firstArgs.b).toBe(8);

      const secondCall = response.tool_calls![1];
      expect(secondCall.function.name).toBe("calculator");
      const secondArgs = JSON.parse(secondCall.function.arguments);
      expect(secondArgs.operation).toBe("multiply");
      expect(secondArgs.a).toBe(5);
      expect(secondArgs.b).toBe(3);

      console.log("Message:", response.message.content);
      console.log("First calculator call:", firstCall);
      console.log("Second calculator call:", secondCall);
    },
    30000
  );
});
