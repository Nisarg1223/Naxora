import {Router} from 'express'
import { sendMessage,getChats,getMessages,deleteChat, getSuggestions, getGeneratedImages ,  webSearch,} from '../controller/chat.controller.js';
import { uploadImage } from '../controller/upload.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
const chatRouter = Router();
 
chatRouter.post("/message",authMiddleware,sendMessage);
chatRouter.post("/upload",authMiddleware,uploadImage);
chatRouter.get("/",authMiddleware,getChats);
chatRouter.get("/suggestions", getSuggestions);
chatRouter.get(
  "/images",
  authMiddleware,
  getGeneratedImages
);
chatRouter.post(
  "/web-search",
  authMiddleware,
  webSearch
);
chatRouter.get("/:chatId/messages",authMiddleware,getMessages);
chatRouter.delete("/delete/:chatId",authMiddleware,deleteChat);

export default chatRouter;