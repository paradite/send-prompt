export type Base64ImageData = {
  mimeType: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
  base64Data: string;
};

/**
 * Process a base64 image URL and extract its MIME type and base64 data
 * @param url The image URL, either a data URL (base64) or a regular URL
 * @returns Object containing the MIME type and base64 data
 */
export function processBase64Image(url: string): Base64ImageData {
  let mimeType: Base64ImageData["mimeType"] = "image/jpeg";
  let base64Data = url;

  if (url.startsWith("data:")) {
    const match = url.match(/^data:image\/([^;]+);base64,(.*)$/);
    if (match) {
      const detectedType = match[1];
      if (
        detectedType === "png" ||
        detectedType === "gif" ||
        detectedType === "webp"
      ) {
        mimeType = `image/${detectedType}` as Base64ImageData["mimeType"];
      }
      base64Data = match[2];
    }
  }

  return { mimeType, base64Data };
}
