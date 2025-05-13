import { sendPrompt } from "./index";
import { ModelEnum } from "llm-info";

describe("sendPrompt", () => {
  test("should throw error for unsupported provider", async () => {
    const messages = [{ role: "user" as const, content: "Hello" }];

    await expect(async () => {
      await sendPrompt({
        messages,
        model: ModelEnum["gpt-4.1"],
        provider: "unsupported" as any,
        apiKey: "dummy-key",
      });
    }).rejects.toThrow("Unhandled provider case: unsupported");
  });
});
