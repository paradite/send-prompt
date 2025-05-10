import { sendPrompt } from "./index";
import { ModelEnum } from "llm-info";

describe("sendPrompt", () => {
  // Skip test if OPENAI_API_KEY is not set
  const testFn = process.env.OPENAI_API_KEY ? it : it.skip;

  testFn(
    "should make a successful API call to OpenAI",
    async () => {
      const messages = [
        { role: "user" as const, content: "Hello, who are you?" },
      ];

      const response = await sendPrompt({
        messages,
        model: ModelEnum["gpt-4.1"],
        provider: "openai",
        apiKey: process.env.OPENAI_API_KEY!,
      });

      expect(response.choices[0].message.content).toBeTruthy();
      console.log("Response:", response.choices[0].message.content);
    },
    30000
  );

  test("should throw error for unsupported provider", async () => {
    const messages = [{ role: "user" as const, content: "Hello" }];

    await expect(async () => {
      await sendPrompt({
        messages,
        model: ModelEnum["gpt-4.1"],
        provider: "unsupported" as any,
        apiKey: "dummy-key",
      });
    }).rejects.toThrow("Provider unsupported is not supported yet");
  });
});
