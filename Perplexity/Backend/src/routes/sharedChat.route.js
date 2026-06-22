import { Router } from 'express';
import { getSharedChat } from '../controller/sharedChat.controller.js';

const sharedChatRouter = Router();

// Public — no authMiddleware
sharedChatRouter.get('/:sharedChatId', getSharedChat);

export default sharedChatRouter;
