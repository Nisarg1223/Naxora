import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "langchain";

const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GEMINI_API_KEY,
});

async function run() {
  console.log("Testing multimodal input...");
  // Create a 1x1 white pixel base64 image representation
  const dummyBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
  const message = new HumanMessage({
    content: [
      { type: "text", text: "What is this image? Describe its color." },
      {
        type: "image_url",
        image_url: { url: `data:image/png;base64,${dummyBase64}` },
      },
    ],
  });

  try {
    const response = await geminiModel.invoke([message]);
    console.log("Response content:", response.content);
  } catch (error) {
    console.error("Multimodal invoke failed:", error);
  }
}

run();
