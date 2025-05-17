import { sendPrompt } from "../index";
import { AI_PROVIDERS, ModelEnum } from "llm-info";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const googleModel = ModelEnum["gemini-2.5-pro-preview-05-06"];

// Get the directory name using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Google Provider with Image Input", () => {
  // Skip test if GEMINI_API_KEY is not set
  const googleTestFn = process.env.GEMINI_API_KEY ? it : it.skip;

  googleTestFn(
    "should make a successful API call to Google with image input",
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
          model: googleModel,
          provider: AI_PROVIDERS.GOOGLE,
          apiKey: process.env.GEMINI_API_KEY!,
        }
      );

      expect(response.message.content).toBeTruthy();
      expect(response.usage).toBeDefined();
      expect(response.usage?.promptTokens).toBeGreaterThan(0);
      expect(response.usage?.completionTokens).toBeGreaterThan(0);
      expect(response.usage?.totalTokens).toBeGreaterThan(0);
      expect(response.durationMs).toBeDefined();
      expect(response.durationMs).toBeGreaterThan(0);
      console.log("Google Response:", response.message.content);
      console.log("Google Usage:", response.usage);
      console.log("Google Duration:", response.durationMs, "ms");
    },
    30000
  );
});
