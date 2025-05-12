import { FunctionDefinition } from "../../index";

export const calculatorTool: FunctionDefinition = {
  type: "function",
  function: {
    name: "calculator",
    description: "Perform basic arithmetic calculations",
    parameters: {
      type: "object",
      properties: {
        operation: {
          type: "string",
          enum: ["add", "subtract", "multiply", "divide"],
          description: "The arithmetic operation to perform",
        },
        a: {
          type: "number",
          description: "First number",
        },
        b: {
          type: "number",
          description: "Second number",
        },
      },
      required: ["operation", "a", "b"],
      additionalProperties: false,
    },
    strict: true,
  },
};
