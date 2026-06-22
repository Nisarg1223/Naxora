import SharedChatModel from '../models/sharedChat.model.js';

export async function getSharedChat(req, res) {
    try {
        const { sharedChatId } = req.params;

        const sharedChat = await SharedChatModel.findById(sharedChatId);

        if (!sharedChat) {
            return res.status(404).json({
                message: 'Shared chat not found or the link has expired.',
            });
        }

        res.status(200).json({
            message: 'Shared chat retrieved successfully',
            sharedChat,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message || 'Failed to retrieve shared chat.',
        });
    }
}
