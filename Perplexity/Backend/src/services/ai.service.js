import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { ChatMistralAI } from "@langchain/mistralai";
import axios from "axios";
import imagekit from "../config/imagekit.js";
import fs from "fs";
import path from "path";
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
} from "langchain";

const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GEMINI_API_KEY,
});

const groqModel = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
});

const mistralModel = new ChatMistralAI({
  model: "mistral-large-latest",
  apiKey: process.env.MISTRAL_API_KEY,
});

async function formatMessagesForAI(messages) {
  const formattedMessages = [
    new SystemMessage("Your name is Nexora AI. You are a helpful AI assistant. If the user asks what your name is or who you are, you must answer: 'hi i am a nexora ai.'")
  ];
  for (const e of messages) {
    if (e.role === "user") {
      if (e.attachedImageUrl) {
        let base64 = "";
        let mimeType = "image/png";
        const imageUrl = e.attachedImageUrl;

        if (imageUrl.includes("/public/uploads/")) {
          try {
            const filename = imageUrl.split("/public/uploads/").pop();
            const filepath = path.join(process.cwd(), "public", "uploads", filename);
            if (fs.existsSync(filepath)) {
              const buffer = fs.readFileSync(filepath);
              base64 = buffer.toString("base64");
              const ext = path.extname(filepath).toLowerCase();
              if (ext === ".jpg" || ext === ".jpeg") {
                mimeType = "image/jpeg";
              } else if (ext === ".gif") {
                mimeType = "image/gif";
              } else if (ext === ".webp") {
                mimeType = "image/webp";
              }
            }
          } catch (err) {
            console.error("Error reading local image file:", err);
          }
        }

        if (!base64 && imageUrl.startsWith("http")) {
          try {
            const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
            base64 = Buffer.from(response.data).toString("base64");
            const contentType = response.headers["content-type"];
            if (contentType) {
              mimeType = contentType;
            }
          } catch (err) {
            console.error("Failed to fetch remote image:", err);
          }
        }

        if (base64) {
          formattedMessages.push(
            new HumanMessage({
              content: [
                { type: "text", text: e.content || "" },
                {
                  type: "image_url",
                  image_url: { url: `data:${mimeType};base64,${base64}` },
                },
              ],
            })
          );
        } else {
          formattedMessages.push(new HumanMessage(e.content || ""));
        }
      } else {
        formattedMessages.push(new HumanMessage(e.content || ""));
      }
    } else if (e.role === "system") {
      formattedMessages.push(new SystemMessage(e.content || ""));
    } else {
      formattedMessages.push(new AIMessage(e.content || ""));
    }
  }
  return formattedMessages;
}

function formatMessagesTextOnly(messages) {
  const formatted = [
    new SystemMessage("Your name is Nexora AI. You are a helpful AI assistant. If the user asks what your name is or who you are, you must answer: 'hi i am a nexora ai.'")
  ];
  return formatted.concat(messages.map((e) => {
    if (e.role === "user") {
      return new HumanMessage(e.content || "");
    } else if (e.role === "system") {
      return new SystemMessage(e.content || "");
    } else {
      return new AIMessage(e.content || "");
    }
  }));
}

export async function generateRresponse(messages) {
  let formattedMessages;
  try {
    formattedMessages = await formatMessagesForAI(messages);
  } catch (error) {
    console.error("Error formatting messages for AI:", error);
    formattedMessages = formatMessagesTextOnly(messages);
  }

  try {
    // MAIN AI
    const response = await geminiModel.invoke(formattedMessages);
    return response.text;
  } catch (error) {
    console.log("Gemini failed. Switching to Groq...");
    const textOnlyMessages = formatMessagesTextOnly(messages);
    // FALLBACK AI
    const fallbackResponse = await groqModel.invoke(textOnlyMessages);
    return fallbackResponse.content;
  }
}

export async function generateChatTitle(message) {
  try {
    const response = await mistralModel.invoke([
      new SystemMessage(
        "Generate a short 2-3 word title for this chat."
      ),
      new HumanMessage(message),
    ]);

    return response.content;
  } catch (error) {
    console.log("Mistral failed for title. Switching to Groq...");
    const fallbackResponse = await groqModel.invoke([
      new SystemMessage(
        "Generate a short 2-3 word title for this chat."
      ),
      new HumanMessage(message),
    ]);

    return fallbackResponse.content;
  }
}
// export async function generateSuggestions() {
//   try {
//     const response = await mistralModel.invoke([
//       new SystemMessage(`
// Return ONLY a JSON array.

// Example:
// ["News 1","News 2","News 3","News 4","News 5"]

// Give 5 trending world news headlines.
//       `),
//     ]);

//     const cleaned = response.content
//       .replace(/```json/g, "")
//       .replace(/```/g, "")
//       .trim();

//     return JSON.parse(cleaned);

//   } catch (error) {
//     console.log("Mistral failed. Switching to Groq...");

//     const fallbackResponse = await groqModel.invoke([
//       new SystemMessage(`
// Return ONLY a JSON array.

// Example:
// ["News 1","News 2","News 3","News 4","News 5"]

// Give 5 trending world news headlines.
//       `),
//     ]);

//     const cleaned = fallbackResponse.content
//       .replace(/```json/g, "")
//       .replace(/```/g, "")
//       .trim();

//     return JSON.parse(cleaned);
//   }
// }
export async function streamResponse(messages, onChunk) {
  let formattedMessages;
  try {
    formattedMessages = await formatMessagesForAI(messages);
  } catch (error) {
    console.error("Error formatting messages for AI stream:", error);
    formattedMessages = formatMessagesTextOnly(messages);
  }

  try {
    const stream = await geminiModel.stream(formattedMessages);
    for await (const chunk of stream) {
      if (chunk.content) {
        onChunk(chunk.content);
      }
    }
  } catch (error) {
    console.log("Gemini stream failed. Switching to Groq stream...");
    const textOnlyMessages = formatMessagesTextOnly(messages);
    const stream = await groqModel.stream(textOnlyMessages);
    for await (const chunk of stream) {
      if (chunk.content) {
        onChunk(chunk.content);
      }
    }
  }
}
export async function getTrendingNews() {
  const response = await axios.get(
    `https://gnews.io/api/v4/top-headlines?category=world&lang=en&max=5&apikey=${process.env.GNEWS_API_KEY}`
  );

  return response.data.articles.map(
    (article) => article.title
  );
}

export async function generateImage(prompt) {
  // Ensure the uploads directory exists
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filename = `image_${Date.now()}_${Math.floor(Math.random() * 1000)}.png`;
  const filepath = path.join(uploadDir, filename);
  const fileUrl = `http://localhost:3000/public/uploads/${filename}`;

  // 1. Try Hugging Face FLUX.1-schnell if HUGGING_FACE token is configured in .env
  const token = process.env.HUGGING_FACE ? process.env.HUGGING_FACE.trim() : undefined;
  console.log("Token in server:", JSON.stringify(token));
  if (token) {
    try {
      console.log("Attempting image generation using Hugging Face FLUX.1-schnell...");
      const response = await axios.post(
        "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
        { inputs: prompt },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "image/png"
          },
          responseType: "arraybuffer"
        }
      );
     const uploadResponse = await imagekit.upload({
  file: Buffer.from(response.data),
  fileName: filename,
  folder: "/generated-images",
});

return uploadResponse.url;
    } catch (hfError) {
      console.error("Hugging Face generation failed, falling back to Gemini/Pollinations:", hfError.message);
    }
  }

  // 2. Try Gemini Imagen 4.0 (requires paid tier billing)
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${process.env.GEMINI_API_KEY}`,
      {
        instances: [
          {
            prompt: prompt
          }
        ],
        parameters: {
          sampleCount: 1,
          aspectRatio: "1:1",
          outputMimeType: "image/jpeg"
        }
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    if (response.data && response.data.predictions && response.data.predictions[0]) {
      const base64Bytes = response.data.predictions[0].bytesBase64Encoded;
      const buffer = Buffer.from(
  base64Bytes,
  "base64"
);

const uploadResponse =
 await imagekit.upload({
   file: buffer,
   fileName: filename,
   folder: "/generated-images",
 });

return uploadResponse.url;
    }
    throw new Error("Invalid response structure from Gemini Imagen 4.0 API");
  } catch (error) {
    console.error("Gemini Imagen 4.0 generation failed. Falling back to Pollinations AI URL...");
    // Fall back to returning the Pollinations AI URL directly.
    // This allows the client browser to fetch it from their own IP address,
    // avoiding proxy/shared server IP rate-limit blocks (like "Queue full" status 402).
    const seed = Math.floor(Math.random() * 1000000);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&private=true&enhance=true&seed=${seed}`;
    return pollinationsUrl;
  }
}