import { useState } from 'react';
import { shareChat as shareChatService } from '../service/chat.service.js';

export function useShareChat() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [sharedUrl, setSharedUrl] = useState(null);

    async function shareChat(chatId) {
        if (loading) return;

        try {
            setLoading(true);
            setError(null);
            setSuccess(false);
            setSharedUrl(null);

            const data = await shareChatService(chatId);
            const url = data.url;

            await navigator.clipboard.writeText(url);

            setSharedUrl(url);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to share chat');
        } finally {
            setLoading(false);
        }
    }

    return {
        shareChat,
        loading,
        error,
        success,
        sharedUrl,
    };
}
