import express from 'express';
import { getChatPartner, getMessagesById, sendMessage, markChatAsRead, clearChat, deleteChatForMe, deleteChatForBoth, createMissedCallMessage } from '../controller/message.controller.js';
import { getAllContacts } from '../controller/message.controller.js';
import { protectedRoute } from '../middlewares/auth.middleware.js';
import { arcjectProtection } from '../middlewares/arcjet.middeware.js';

const router = express.Router();

router.use(arcjectProtection, protectedRoute);

router.get("/contacts", getAllContacts);
router.get("/chats", getChatPartner);
router.get("/:userId", getMessagesById);

router.post("/send/:id", sendMessage);
router.post("/missed-call/:id", createMissedCallMessage);
router.post("/read/:userId", markChatAsRead);
router.delete("/clear/:userId", clearChat);
router.delete("/clear-for-me/:userId", deleteChatForMe);
router.delete("/clear-for-both/:userId", deleteChatForBoth);

export default router;
