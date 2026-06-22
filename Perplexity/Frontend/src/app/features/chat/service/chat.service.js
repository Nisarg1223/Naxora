import { shareChat as shareChatApi } from './chat.api.js';

export const shareChat = async (chatId) => {
    const response = await shareChatApi(chatId);
    return response;
};
