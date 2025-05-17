import { sendPrompt } from "../index";
import { AI_PROVIDERS, ModelEnum } from "llm-info";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const anthropicModel = ModelEnum["claude-3-7-sonnet-20250219"];

// Get the directory name using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Anthropic Provider with Image Input", () => {
  // Skip test if ANTHROPIC_API_KEY is not set
  const anthropicTestFn = process.env.ANTHROPIC_API_KEY ? it : it.skip;

  anthropicTestFn(
    "should make a successful API call to Anthropic with image input",
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
          anthropicMaxTokens: 1024, // Set a reasonable max tokens limit
        },
        {
          model: anthropicModel,
          provider: AI_PROVIDERS.ANTHROPIC,
          apiKey: process.env.ANTHROPIC_API_KEY!,
        }
      );

      expect(response.message.content).toBeTruthy();
      expect(response.usage).toBeDefined();
      expect(response.usage?.promptTokens).toBeGreaterThan(0);
      expect(response.usage?.completionTokens).toBeGreaterThan(0);
      expect(response.usage?.totalTokens).toBeGreaterThan(0);
      expect(response.durationMs).toBeDefined();
      expect(response.durationMs).toBeGreaterThan(0);
      console.log("Anthropic Response:", response.message.content);
      console.log("Anthropic Usage:", response.usage);
      console.log("Anthropic Duration:", response.durationMs, "ms");
    },
    30000
  );
});
