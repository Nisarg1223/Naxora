import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true,
});

export const getSharedChat = async (sharedChatId) => {
    const response = await api.get(`/api/share/${sharedChatId}`);
    return response.data;
};
