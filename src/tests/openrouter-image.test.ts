import { sendPrompt } from "../index";
import { AI_PROVIDERS } from "llm-info";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const openRouterModel = "meta-llama/llama-4-scout";

// Get the directory name using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("OpenRouter Provider with Image Input", () => {
  // Skip test if OPENROUTER_API_KEY is not set
  const openRouterTestFn = process.env.OPENROUTER_API_KEY ? it : it.skip;

  openRouterTestFn(
    "should make a successful API call to OpenRouter with image input",
    async () => {
      // Read the image file and convert to base64
      const imagePath = path.join(__dirname, "fixtures", "16x-128.png");
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString("base64");
      const imageUrl = `data:image/png;base64,${base64Image}`;

      const messages = [
        {
          role: "user" as const,
          content: [
            { type: "text" as const, text: "What's in this image?" },
            {
              type: "image_url" as const,
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ];

      const response = await sendPrompt(
        {
          messages,
        },
        {
          provider: AI_PROVIDERS.OPENROUTER,
          customModel: openRouterModel,
          apiKey: process.env.OPENROUTER_API_KEY!,
          headers: {
            "HTTP-Referer": "https://eval.16x.engineer/",
            "X-Title": "16x Eval",
          },
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
      console.log("OpenRouter Response:", response.message.content);
      console.log("OpenRouter Usage:", response.usage);
      console.log("OpenRouter Duration:", response.durationMs, "ms");
    },
    30000
  );
});
