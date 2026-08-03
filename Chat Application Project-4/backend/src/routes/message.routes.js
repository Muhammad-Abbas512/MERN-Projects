import express from 'express';
import {getChatPartner, getMessagesById, sendMessage} from '../controller/message.controller.js';
import {getAllContacts} from '../controller/message.controller.js';
import {protectedRoute} from '../middlewares/auth.middleware.js';
import { arcjectProtection } from '../middlewares/arcjet.middeware.js';

const router = express.Router();


router.use(arcjectProtection, protectedRoute);

router.get("/contacts",getAllContacts);
router.get("/chats",getChatPartner);
router.get("/:userId", getMessagesById);

router.post("/send/:id",sendMessage);


export default router;
