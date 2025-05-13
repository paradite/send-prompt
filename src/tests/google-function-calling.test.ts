import { sendPrompt } from "../index";
import { AI_PROVIDERS, ModelEnum } from "llm-info";
import { calculatorTool } from "./shared/tools";

const googleModel = ModelEnum["gemini-2.5-pro-exp-03-25"];

describe("Google Function Calling", () => {
  // Skip test if GEMINI_API_KEY is not set
  const googleTestFn = process.env.GEMINI_API_KEY ? it : it.skip;

  googleTestFn(
    "should make a function call to calculator",
    async () => {
      const messages = [
        { role: "user" as const, content: "What is 5 plus 3?" },
      ];

      const response = await sendPrompt({
        messages,
        model: googleModel,
        provider: AI_PROVIDERS.GOOGLE,
        apiKey: process.env.GEMINI_API_KEY!,
        tools: [calculatorTool],
        toolCallMode: "AUTO",
      });

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

  googleTestFn(
    "should handle multiple operations in one query",
    async () => {
      const messages = [
        {
          role: "user" as const,
          content: "What is 20 minus 8? And what is 5 multiply by 3?",
        },
      ];

      const response = await sendPrompt({
        messages,
        model: googleModel,
        provider: AI_PROVIDERS.GOOGLE,
        apiKey: process.env.GEMINI_API_KEY!,
        tools: [calculatorTool],
        toolCallMode: "ANY",
      });

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

  googleTestFn(
    "should not call tools when not needed in AUTO mode",
    async () => {
      const messages = [
        {
          role: "user" as const,
          content: "What is the capital of France?",
        },
      ];

      const response = await sendPrompt({
        messages,
        model: googleModel,
        provider: AI_PROVIDERS.GOOGLE,
        apiKey: process.env.GEMINI_API_KEY!,
        tools: [calculatorTool],
        toolCallMode: "AUTO",
      });

      // Should not have any tool calls
      expect(response.tool_calls).toBeUndefined();

      // Should have a direct response
      expect(response.message.content).toBeDefined();
      expect(response.message.content.length).toBeGreaterThan(0);

      console.log("Direct response:", response.message.content);
    },
    30000
  );

  googleTestFn(
    "should handle multi-round function calling with simulated responses",
    async () => {
      const messages = [
        { role: "user" as const, content: "What is 15 plus 32?" },
        {
          role: "google_function_call" as const,
          id: "calc_1",
          name: "calculator",
          args: {
            operation: "add",
            a: 15,
            b: 32,
          },
        },
        {
          role: "google_function_response" as const,
          id: "calc_1",
          name: "calculator",
          response: {
            result: 47,
          },
        },
      ];

      const response = await sendPrompt({
        messages,
        model: googleModel,
        provider: AI_PROVIDERS.GOOGLE,
        apiKey: process.env.GEMINI_API_KEY!,
        tools: [calculatorTool],
        toolCallMode: "AUTO",
      });

      // Should not have any tool calls since we already provided the result
      expect(response.tool_calls).toBeUndefined();

      // Should have a response that acknowledges the calculation result
      expect(response.message.content).toBeDefined();
      expect(response.message.content.length).toBeGreaterThan(0);
      expect(response.message.content.toLowerCase()).toContain("47");

      console.log("Multi-round response:", response.message.content);
    },
    30000
  );

  googleTestFn(
    "should handle mismatched function call and response IDs",
    async () => {
      const messages = [
        { role: "user" as const, content: "What is 15 plus 32?" },
        {
          role: "google_function_call" as const,
          id: "calc_1",
          name: "calculator",
          args: {
            operation: "add",
            a: 15,
            b: 32,
          },
        },
        {
          role: "google_function_response" as const,
          id: "calc_2", // Different ID from the function call
          name: "calculator",
          response: {
            result: 47,
          },
        },
      ];

      const response = await sendPrompt({
        messages,
        model: googleModel,
        provider: AI_PROVIDERS.GOOGLE,
        apiKey: process.env.GEMINI_API_KEY!,
        tools: [calculatorTool],
        toolCallMode: "AUTO",
      });

      // Should not have any tool calls since we already provided the result
      expect(response.tool_calls).toBeUndefined();

      // Should have a response that acknowledges the calculation result
      expect(response.message.content).toBeDefined();
      expect(response.message.content.length).toBeGreaterThan(0);
      // The model should still be able to use the result even with mismatched IDs
      expect(response.message.content.toLowerCase()).toContain("47");

      console.log("Mismatched ID response:", response.message.content);
    },
    30000
  );
});
