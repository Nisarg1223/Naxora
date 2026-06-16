import {
  generateRresponse,
  generateChatTitle,
  streamResponse,
  getTrendingNews,
  generateImage,
   searchWeb,
} from "../services/ai.service.js";
import ChatModel from "../models/chat.model.js";
import MessageModel from "../models/message.model.js";

export async function sendMessage(req, res) {
  try {
    const { message, chat: chatId, isImage, attachedImageUrl, isVoice, isWebSearch } = req.body;

    const imageRegex = /^\s*(\/image\s+|generate\s+(an?|the)\s+image\s+|generate\s+image\s+|draw\s+|create\s+(an?|the)\s+(image|picture|artwork)\s+|create\s+(image|picture|artwork)\s+)/i;
    const hasImagePrefix = imageRegex.test(message) || message.toLowerCase() === "generate image";
    const isImageRequest = isImage || hasImagePrefix;

    let chat = null,
      title = null;
    if (!chatId) {
      title = await generateChatTitle(message);
      chat = await ChatModel.create({
        user: req.user.id,
        title: title,
      });
    }

    const userMessage = await MessageModel.create({
      chat: chatId || chat._id,
      content: message,
      role: "user",
      attachedImageUrl: attachedImageUrl || null,
    });

    const currentChatId = chatId || chat._id;
    const messages = await MessageModel.find({ chat: currentChatId }).sort({
      createdAt: 1,
    });

    // Set headers for SSE streaming
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Send the chat/title details first
    res.write(`data: ${JSON.stringify({ type: "start", chat, title })}\n\n`);

    if (isImageRequest) {
      // 1. Send status loading text
      res.write(`data: ${JSON.stringify({ type: "chunk", content: "🎨 *Generating your image... Please wait.*" })}\n\n`);

      // 2. Call image service
      let cleanPrompt = message;
      const imageRegex = /^\s*(\/image\s+|generate\s+(an?|the)\s+image\s+|generate\s+image\s+|draw\s+|create\s+(an?|the)\s+(image|picture|artwork)\s+|create\s+(image|picture|artwork)\s+)/i;
      const match = message.match(imageRegex);
      if (match) {
        cleanPrompt = message.slice(match[0].length).trim();
        // Remove leading "of ", "about ", "a ", "an " if present
        cleanPrompt = cleanPrompt.replace(/^(of|about|a|an)\s+/i, "");
      }
      // Remove trailing punctuation and clean up
      cleanPrompt = cleanPrompt.replace(/^[.,\s!?:]+|[.,\s!?:]+$/g, "").trim();
      if (!cleanPrompt || cleanPrompt.toLowerCase() === "generate image") {
        cleanPrompt = "a beautiful artwork";
      }

      const imageUrl = await generateImage(cleanPrompt);

      const AiMessages = await MessageModel.create({
        chat: currentChatId,
        content: cleanPrompt,
        role: "ai",
        isImage: true,
        imageUrl: imageUrl,
        prompt: cleanPrompt,
      });

      res.write(
        `data: ${JSON.stringify({
          type: "image-done",
          imageUrl: imageUrl,
          prompt: cleanPrompt,
        })}\n\n`
      );

      res.end();
      return;
    }

    let fullResponse = "";
    let searchContext = "";

    if (isWebSearch) {
      // 1. Send immediate web search feedback
      res.write(`data: ${JSON.stringify({ type: "chunk", content: "🔍 *Searching the web...*\n\n" })}\n\n`);
      fullResponse += "🔍 *Searching the web...*\n\n";

      try {
        const searchResult = await searchWeb(message);
        if (searchResult) {
          if (searchResult.results && searchResult.results.length > 0) {
            searchResult.results.slice(0, 5).forEach((r) => {
              searchContext += `Title: ${r.title}\nURL: ${r.url}\nContent: ${r.content}\n\n`;
            });
          }
          if (searchResult.images && searchResult.images.length > 0) {
            searchContext += `Related Images found on the Web (you can include these in your response if relevant using markdown):\n`;
            searchResult.images.slice(0, 5).forEach((img) => {
              const url = typeof img === "string" ? img : img?.url;
              const desc = typeof img === "object" ? img?.description || "Web Image" : "Web Image";
              if (url) {
                searchContext += `- ![${desc}](${url})\n`;
              }
            });
            searchContext += `\n`;
          }
        }
      } catch (err) {
        console.error("Web search failed:", err);
      }
    }

    // Stream the AI response
    const messagesToSend = [...messages];
    if (searchContext) {
      const currentDateString = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });
      messagesToSend.push({
        role: "system",
        content: `Today's date is ${currentDateString}. Below are the web search results for the user query. Use these results to answer the query in detail. Cite sources when appropriate.\n\nWeb Search Results:\n${searchContext}`
      });
    }
    if (isVoice) {
      messagesToSend.push({
        role: "system",
        content: "Keep your response extremely brief, no more than 2 or 3 lines of conversational text. Do not use markdown formatting, bullet points, list items, or code blocks."
      });
    }

    await streamResponse(messagesToSend, (chunk) => {
      fullResponse += chunk;
      res.write(`data: ${JSON.stringify({ type: "chunk", content: chunk })}\n\n`);
    });

    // Save full AI message to database
    const AiMessages = await MessageModel.create({
      chat: currentChatId,
      content: fullResponse,
      role: "ai",
    });

    // Send final done signal with full message object
    res.write(`data: ${JSON.stringify({ type: "done", AiMessages })}\n\n`);
    res.end();

  } catch (error) {
    console.error(error);
    // If headers are not sent yet, return 500 JSON, otherwise close the connection
    if (!res.headersSent) {
      const status = error?.response?.status || 500;
      res.status(status).json({
        message: error.message || "Server error",
      });
    } else {
      res.write(`data: ${JSON.stringify({ type: "error", message: error.message })}\n\n`);
      res.end();
    }
  }
}

export async function getChats(req,res){
  const user = req.user;

  const chats = await ChatModel.find({user:user.id}).sort({ updatedAt: -1 });

  res.status(200).json({
    message:"chat recieved sucessfully",
    chats
  });
}

export async function getMessages(req,res){
  const {chatId} = req.params;

  const chat = await ChatModel.findOne({
    _id:chatId,
    user:req.user.id
  })

  if(!chat){
    return res.status(404).json({
      message:"chat not found"
    })

  }

  const allMessages = await MessageModel.find({
    chat: chatId
  })

  res.status(200).json({
    message:"messages recives successfully",
    allMessages
  })
}
export async function getGeneratedImages(req,res){
  try{
    const chats = await ChatModel.find({ user: req.user.id });
    const chatIds = chats.map(c => c._id);

    const images = await MessageModel.find({
      chat: { $in: chatIds },
      isImage: true
    }).sort({ createdAt: -1 });

    res.status(200).json({
      images
    });
  }catch(error){
    res.status(500).json({
      message:error.message
    });
  }
}
export async function deleteChat(req,res){
  
  const {chatId} = req.params;

   const chat = await ChatModel.findOneAndDelete({
    _id:chatId,
    user:req.user.id
   })

  await MessageModel.deleteMany({
    chat:chatId
  })

   if(!chat){
    return res.status(404).json({
      message:"chat not found"
    })
   }

   res.status(200).json({
    message:"chat deleted successfully"
   })
}
export async function getSuggestions(req, res) {
  try {
    const suggestions = await getTrendingNews();

    res.status(200).json({
      suggestions,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
}
export async function webSearch(req, res) {
  try {
    const { query } = req.body;

    if (!query || query.trim() === "") {
      return res.status(400).json({
        message: "Search query is required.",
      });
    }

    const result = await searchWeb(query);

    res.status(200).json({
      message: "Web search successful.",
      data: result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message || "Failed to search the web.",
    });
  }
}