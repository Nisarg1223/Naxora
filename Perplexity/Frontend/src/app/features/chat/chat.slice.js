import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    chats: {},
    currentChatId: null,
    isLoading: false,
    error: null,
     suggestions: [],
  },
  reducers: {
    createNewChat: (state, action) => {
      const { chatId, title } = action.payload;

      // Prevent overwriting existing chat
      if (!state.chats[chatId]) {
        state.chats[chatId] = {
          id: chatId,
          title,
          messages: [],
          lastUpdated: new Date().toISOString(),
        };
      }
    },
    replaceTempChatId: (state, action) => {
      const { tempId, realId, title } = action.payload;
      if (state.chats[tempId]) {
        state.chats[realId] = {
          ...state.chats[tempId],
          id: realId,
          title: title || state.chats[tempId].title,
          lastUpdated: new Date().toISOString(),
        };
        delete state.chats[tempId];
      }
      if (state.currentChatId === tempId) {
        state.currentChatId = realId;
      }
    },
    addNewMessage: (state, action) => {
      const { chatId, content, role } = action.payload;

      if (!state.chats[chatId]) {
        state.chats[chatId] = {
          id: chatId,
          messages: [],
        };
      }

      if (!Array.isArray(state.chats[chatId].messages)) {
        state.chats[chatId].messages = [];
      }

     state.chats[chatId].messages.push({
  content,
  role,
  isImage: action.payload.isImage || false,
  imageUrl: action.payload.imageUrl || null,
  prompt: action.payload.prompt || null,
  attachedImageUrl: action.payload.attachedImageUrl || null,
});

      // Update timestamp to float active chat to the top
      state.chats[chatId].lastUpdated = new Date().toISOString();
    },
    appendLastMessageChunk: (state, action) => {
      const { chatId, content } = action.payload;
      if (state.chats[chatId] && Array.isArray(state.chats[chatId].messages)) {
        const messages = state.chats[chatId].messages;
        if (messages.length > 0) {
          const lastMsg = messages[messages.length - 1];
          if (lastMsg.role !== "user") {
            lastMsg.content = (lastMsg.content || "") + content;
          }
        }
        // Update timestamp to float active chat to the top
        state.chats[chatId].lastUpdated = new Date().toISOString();
      }
    },
    setChats: (state, action) => {
      state.chats = action.payload;
    },
    setCurrentChatId: (state, action) => {
      state.currentChatId = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setSuggestions: (state, action) => {
      state.suggestions = action.payload;
    },
    setLastMessageContent: (state, action) => {
      const { chatId, content } = action.payload;
      if (state.chats[chatId] && Array.isArray(state.chats[chatId].messages)) {
        const messages = state.chats[chatId].messages;
        if (messages.length > 0) {
          messages[messages.length - 1].content = content;
        }
      }
    },
    setLastMessageImageDetails: (state, action) => {
      const { chatId, imageUrl, prompt, isImage } = action.payload;
      if (state.chats[chatId] && Array.isArray(state.chats[chatId].messages)) {
        const messages = state.chats[chatId].messages;
        if (messages.length > 0) {
          const lastMsg = messages[messages.length - 1];
          lastMsg.isImage = isImage !== undefined ? isImage : true;
          lastMsg.imageUrl = imageUrl;
          lastMsg.prompt = prompt;
          lastMsg.content = "";
        }
      }
    },
  },
});

export const {
  setChats,
  setCurrentChatId,
  setError,
  setLoading,
  createNewChat,
  replaceTempChatId,
  addNewMessage,
  appendLastMessageChunk,
  setSuggestions,
  setLastMessageContent,
  setLastMessageImageDetails,
} = chatSlice.actions;

export default chatSlice.reducer;
