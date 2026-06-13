import { initializeSocketConnection } from "../service/chat.socket";
import { sendMessage, getChats, getMessages, deleteChat } from '../service/chat.api.js';
import { setChats, setCurrentChatId, setError, setLoading, createNewChat, replaceTempChatId, addNewMessage, appendLastMessageChunk, setLastMessageContent, setLastMessageImageDetails } from '../chat.slice.js';
import { useDispatch, useSelector } from "react-redux";

// Module-level typewriter queuing variables
let typingQueue = [];
let isTyping = false;
let typingTimer = null;

function queueText(chatId, text, dispatch) {
  // Add characters to the typewriter queue
  typingQueue.push(...text.split(""));

  if (!isTyping) {
    isTyping = true;
    typingTimer = setInterval(() => {
      if (typingQueue.length === 0) {
        clearInterval(typingTimer);
        typingTimer = null;
        isTyping = false;
        return;
      }

      // To prevent lag, dynamically increase characters typed per tick if queue grows
      let batchSize = 1;
      if (typingQueue.length > 80) {
        batchSize = 5;
      } else if (typingQueue.length > 40) {
        batchSize = 3;
      } else if (typingQueue.length > 15) {
        batchSize = 2;
      }

      const chunk = typingQueue.splice(0, batchSize).join("");
      dispatch(
        appendLastMessageChunk({
          chatId,
          content: chunk,
        })
      );
    }, 20); // 20ms typewriter character flow speed
  }
}

export const useChat = () => {
  const dispatch = useDispatch();
  const chats = useSelector((state) => state.chat.chats);

  async function handleSendMessage({ message, chatId, isImage, attachedImageUrl, isVoice }) {
    try {
      // Clear any remaining queue from previous streams
      if (typingTimer) {
        clearInterval(typingTimer);
        typingTimer = null;
      }
      typingQueue = [];
      isTyping = false;

      let activeChatId = chatId;
      let tempId = null;

      // 1. If starting a new chat, generate a tempId, create the chat, and set it active optimistically
      if (!activeChatId) {
        tempId = `temp_${Date.now()}`;
        activeChatId = tempId;
        dispatch(
          createNewChat({
            chatId: tempId,
            title: message,
          })
        );
        dispatch(setCurrentChatId(tempId));
      }

      // 2. Optimistically add user's message immediately so it goes to the top
      dispatch(
        addNewMessage({
          chatId: activeChatId,
          content: message,
          role: "user",
          attachedImageUrl: attachedImageUrl || null,
        })
      );

      dispatch(setLoading(true));

      // 3. Perform background server call to send message with streaming response (SSE)
      const response = await fetch("http://localhost:3000/api/chats/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, chat: chatId || null, isImage, attachedImageUrl, isVoice }),
        credentials: "include", // Send session cookies for authMiddleware
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      
      let isFirstChunk = true;
      let realChatId = chatId;
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop(); // Keep incomplete line in the buffer

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ")) {
            const jsonStr = trimmed.slice(6);
            try {
              const data = JSON.parse(jsonStr);

              if (data.type === "start") {
                const { chat, title } = data;
                realChatId = chatId || chat?._id;
                
                // If starting a new chat, swap the tempId for the real database chatId
                if (tempId && realChatId) {
                  dispatch(
                    replaceTempChatId({
                      tempId: tempId,
                      realId: realChatId,
                      title: chat?.title || title || "New Chat",
                    })
                  );
                }
              } else if (data.type === "chunk") {
                const { content } = data;
                if (content) {
                  fullText += content;
                  if (isFirstChunk) {
                    isFirstChunk = false;
                    dispatch(setLoading(false)); // Hide thinking dots when typing begins
                    dispatch(
                      addNewMessage({
                        chatId: realChatId,
                        content: "",
                        role: "ai",
                      })
                    );
                  }
                  // Queue the content for typewriter rendering
                  queueText(realChatId, content, dispatch);
                }
              }
              else if (data.type === "image-done") {

  if (typingTimer) {
    clearInterval(typingTimer);
    typingTimer = null;
  }

  typingQueue = [];
  isTyping = false;

  dispatch(setLoading(false));

  dispatch(
    addNewMessage({
      chatId: realChatId,
      role: "ai",
      content: "",
      isImage: true,
      imageUrl: data.imageUrl,
      prompt: data.prompt,
    })
  );
}
              else if (data.type === "done") {
                // Stream finished successfully
              } else if (data.type === "error") {
                throw new Error(data.message || "Error during streaming");
              }
            } catch (err) {
              console.error("Error parsing stream chunk:", err);
            }
          }
        }
      }

      return { chatId: realChatId, content: fullText };
    } catch (error) {
      const status = error.response?.status;
      if (status === 429) {
        dispatch(setError("Too many requests. Please wait a moment and try again."));
      } else {
        dispatch(setError(error.message));
      }
      console.log(error);
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleGetChat() {
    dispatch(setLoading(true));
    const data = await getChats();
    const { chats } = data;
    dispatch(setChats(chats.reduce((acc, chat) => {
      acc[chat._id] = {
        id: chat._id,
        title: chat.title,
        messages: [],
        lastUpdated: chat.updatedAt,
      }
      return acc
    }, {})))
    dispatch(setLoading(false));
  }

  async function handleGetMessages(chatId) {
    try {
      dispatch(setLoading(true));

      const data = await getMessages(chatId);

      const { allMessages } = data;

      dispatch(
        setChats({
          ...chats,
          [chatId]: {
            ...chats[chatId],
            messages: allMessages.map((msg) => ({
              content: msg.content,
              role: msg.role,
              isImage: msg.isImage,
              imageUrl: msg.imageUrl,
              prompt: msg.prompt,
              attachedImageUrl: msg.attachedImageUrl || null,
            })),
          },
        })
      );

      dispatch(setCurrentChatId(chatId));
    } catch (error) {
      dispatch(setError(error.message));
      console.log(error);
    } finally {
      dispatch(setLoading(false));
    }
  }

  return {
    initializeSocketConnection,
    handleSendMessage,
    handleGetChat,
    handleGetMessages
  }
}