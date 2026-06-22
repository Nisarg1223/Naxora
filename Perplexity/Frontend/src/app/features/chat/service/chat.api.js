import axios from 'axios'

const api = axios.create({
    baseURL:"http://localhost:3000",
    withCredentials:true
})

export const sendMessage = async ({ message, chatId }) => {
  const response = await api.post("api/chats/message", {
    message,
    chat: chatId,
  });

  return response.data;
};

export const getChats = async()=>{
    const response = await api.get("/api/chats");
    return response.data

}

export const getMessages = async(chatId)=>{
    const response = await api.get(`/api/chats/${chatId}/messages`);
    return response.data;

}

export const deleteChat = async(chatId)=>{
    const response = await api.delete(`/api/chats/delete/${chatId}`);
    return response.data;
}
export const getImages = async () => {
  const response =
   await api.get("/api/chats/images");

  return response.data;
};

export const uploadImage = async (base64Image) => {
  const response = await api.post("/api/chats/upload", { image: base64Image });
  return response.data;
};
export const webSearch = async (query) => {
  const response = await api.post("/api/chats/web-search", {
    query,
  });

  return response.data;
};

export const shareChat = async (chatId) => {
  const response = await api.post(`/api/chats/share/${chatId}`);
  return response.data;
};