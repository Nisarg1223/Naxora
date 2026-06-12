import "dotenv/config";
import fs from "fs";
import { generateImage } from "./src/services/ai.service.js";

async function run() {
  console.log("Testing integrated generateImage function...");
  try {
    const dataUri = await generateImage("a red sports car");
    if (dataUri.startsWith("data:image/jpeg;base64,")) {
      const base64Data = dataUri.replace(/^data:image\/jpeg;base64,/, "");
      fs.writeFileSync("test_generated_image.png", Buffer.from(base64Data, "base64"));
      console.log("Success! Image generated using Hugging Face and saved as test_generated_image.png");
    } else {
      console.log("Success! Image generated using fallback provider (Pollinations):", dataUri);
    }
  } catch (error) {
    console.error("Image generation failed:", error.message);
  }
}

run();
