import messageModel from "../models/message.model.js";
import userModel from "../models/user.model.js";
import imagekit from "../utils/imagekit.js";
import { io, getReceiverSocketId } from "../lib/socket.js";

export const getAllContacts = async (req, res) => {
    try {
        const loggedInUserId = req.user.id;
        const filteredUsers = await userModel.find({ _id: { $ne: loggedInUserId } }).select("-password");

        res.status(200).json({
            filteredUsers
        });
    } catch (error) {
        console.error("Error in getAllContacts:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};

export const getMessagesById = async (req, res) => {
    try {
        const myId = req.user._id;
        const { userId: userToChatId } = req.params;

        const messages = await messageModel.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ],
            // Exclude messages the current user has deleted for themselves
            deletedFor: { $nin: [myId] }
        }).sort({ createdAt: 1 }).populate('senderId', 'username fullName profilePic').populate('receiverId', 'username fullName profilePic');

        // Mark messages as read when user opens the chat
        await userModel.updateOne(
            { _id: myId },
            { $set: { [`lastReadAt.${userToChatId}`]: new Date() } }
        );

        // Update message status to 'seen' for messages from the other user
        const seenResult = await messageModel.updateMany(
            {
                senderId: userToChatId,
                receiverId: myId,
                status: { $ne: "seen" }
            },
            { $set: { status: "seen" } }
        );

        // Re-fetch messages with updated status
        const updatedMessages = await messageModel.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ],
            deletedFor: { $nin: [myId] }
        }).sort({ createdAt: 1 }).populate('senderId', 'username fullName profilePic').populate('receiverId', 'username fullName profilePic');

        res.status(200).json({
            messages: updatedMessages
        });
    } catch (error) {
        console.error("Error in getMessagesById:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        if (!text && !image) {
            return res.status(400).json({
                message: "Message text or image is required"
            });
        }

        if (senderId.equals(receiverId)) {
            return res.status(400).json({
                message: "You cannot send message to yourself"
            });
        }

        const receiverIdExists = await userModel.findById({
            _id: receiverId
        });

        if (!receiverIdExists) {
            return res.status(404).json({
                message: "Receiver not found"
            });
        }

        let imageUrl;
        if (image) {
            // upload base64 image to ImageKit
            const uploadResponse = await imagekit.files.upload({
                file: image,
                fileName: `message-${Date.now()}.jpg`
            });
            imageUrl = uploadResponse.url;
        }

        const newMessage = new messageModel({
            senderId,
            receiverId,
            text,
            image: imageUrl,
            status: "sent"
        });

        await newMessage.save();

        // Populate sender info before sending
        const populatedMessage = await newMessage.populate("senderId", "fullName username profilePic");

        // Emit to receiver via socket if online
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", populatedMessage);
            // Also notify sender that message was delivered
            const senderSocketId = getReceiverSocketId(senderId);
            if (senderSocketId) {
                io.to(senderSocketId).emit("messageStatusUpdated", {
                    messageId: newMessage._id,
                    status: "delivered",
                    partnerId: receiverId
                });
            }
        } else {
            // Receiver offline - just emit to sender
            const senderSocketId = getReceiverSocketId(senderId);
            if (senderSocketId) {
                io.to(senderSocketId).emit("newMessage", populatedMessage);
            }
        }

        res.status(201).json({
            newMessage: populatedMessage
        });
    } catch (error) {
        console.error("Error in sendMessage:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};

export const getChatPartner = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        // Find all messages where the logged in user is either the sender or the receiver
        // and exclude messages deleted for this user
        const messages = await messageModel.find({
            $or: [
                { senderId: loggedInUserId },
                { receiverId: loggedInUserId }
            ],
            deletedFor: { $nin: [loggedInUserId] }
        }).sort({ createdAt: -1 });

        // Group messages by partner and get last message info
        const chatMap = new Map();

        for (const message of messages) {
            const partnerId = message.senderId.toString() === loggedInUserId.toString()
                ? message.receiverId.toString()
                : message.senderId.toString();

            if (!chatMap.has(partnerId)) {
                chatMap.set(partnerId, {
                    lastMessage: message.text || (message.image ? "📷 Photo" : ""),
                    lastMessageTime: message.createdAt,
                    lastMessageSenderId: message.senderId.toString(),
                    lastMessageImage: message.image || null
                });
            }
        }

        const chatPartnerIds = [...chatMap.keys()];

        const chatPartners = await userModel.find({
            _id: { $in: chatPartnerIds }
        }).select("-password");

        // Get current user's lastReadAt map
        const currentUser = await userModel.findById(loggedInUserId).select("lastReadAt");
        const lastReadAtRaw = currentUser?.lastReadAt || {};
        // Convert Mongoose Map to plain object for easier access
        const lastReadAtMap = {};
        if (lastReadAtRaw instanceof Map) {
            for (const [key, value] of lastReadAtRaw.entries()) {
                lastReadAtMap[key] = value;
            }
        } else {
            Object.assign(lastReadAtMap, lastReadAtRaw);
        }

        // Attach last message info and unread count to each partner
        const enrichedChatPartners = chatPartners.map(partner => {
            const partnerId = partner._id.toString();
            const chatInfo = chatMap.get(partnerId) || {};

            // Count unread messages: messages from partner after lastReadAt
            let unreadCount = 0;
            if (chatInfo.lastMessageSenderId && chatInfo.lastMessageSenderId !== loggedInUserId.toString()) {
                const lastReadAt = lastReadAtMap[partnerId];
                if (lastReadAt) {
                    unreadCount = messages.filter(m => {
                        const mPartnerId = m.senderId.toString() === loggedInUserId.toString()
                            ? m.receiverId.toString()
                            : m.senderId.toString();
                        return mPartnerId === partnerId &&
                            m.senderId.toString() !== loggedInUserId.toString() &&
                            new Date(m.createdAt) > new Date(lastReadAt);
                    }).length;
                } else {
                    // No read timestamp yet - count all messages from partner
                    unreadCount = messages.filter(m => {
                        const mPartnerId = m.senderId.toString() === loggedInUserId.toString()
                            ? m.receiverId.toString()
                            : m.senderId.toString();
                        return mPartnerId === partnerId &&
                            m.senderId.toString() !== loggedInUserId.toString();
                    }).length;
                }
            }

            return {
                ...partner.toObject(),
                lastMessage: chatInfo.lastMessage || "",
                lastMessageTime: chatInfo.lastMessageTime || null,
                lastMessageSenderId: chatInfo.lastMessageSenderId || null,
                lastMessageImage: chatInfo.lastMessageImage || null,
                unreadCount
            };
        });

        // Sort by last message time (most recent first)
        enrichedChatPartners.sort((a, b) => {
            const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
            const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
            return timeB - timeA;
        });

        res.status(200).json({
            chatPartners: enrichedChatPartners
        });
    } catch (error) {
        console.error("Error in getChatPartner:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};

// Mark a chat as read for the current user
export const markChatAsRead = async (req, res) => {
    try {
        const myId = req.user._id;
        const { userId: partnerId } = req.params;

        await userModel.updateOne(
            { _id: myId },
            { $set: { [`lastReadAt.${partnerId}`]: new Date() } }
        );

        res.status(200).json({
            message: "Chat marked as read"
        });
    } catch (error) {
        console.error("Error in markChatAsRead:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};

// Delete messages for the current user only (soft delete)
export const deleteChatForMe = async (req, res) => {
    try {
        const myId = req.user._id;
        const { userId: partnerId } = req.params;

        // Soft delete: add current user to deletedFor for all messages in this conversation
        await messageModel.updateMany(
            {
                $or: [
                    { senderId: myId, receiverId: partnerId },
                    { senderId: partnerId, receiverId: myId }
                ]
            },
            { $addToSet: { deletedFor: myId } }
        );

        // Reset lastReadAt for this partner
        await userModel.updateOne(
            { _id: myId },
            { $unset: { [`lastReadAt.${partnerId}`]: "" } }
        );

        // Notify the partner that chat was cleared (so they can update their side in real-time if needed)
        const partnerSocketId = getReceiverSocketId(partnerId);
        if (partnerSocketId) {
            io.to(partnerSocketId).emit("chatCleared", {
                userId: myId.toString(),
                type: "forMe"
            });
        }

        // Notify current user's other devices
        const mySocketId = getReceiverSocketId(myId);
        if (mySocketId) {
            io.to(mySocketId).emit("chatCleared", {
                userId: partnerId.toString(),
                type: "forMe"
            });
        }

        res.status(200).json({
            message: "Chat deleted for you"
        });
    } catch (error) {
        console.error("Error in deleteChatForMe:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};

// Delete messages for both users (hard delete)
export const deleteChatForBoth = async (req, res) => {
    try {
        const myId = req.user._id;
        const { userId: partnerId } = req.params;

        // Hard delete all messages between the two users
        await messageModel.deleteMany({
            $or: [
                { senderId: myId, receiverId: partnerId },
                { senderId: partnerId, receiverId: myId }
            ]
        });

        // Reset lastReadAt for this partner
        await userModel.updateOne(
            { _id: myId },
            { $unset: { [`lastReadAt.${partnerId}`]: "" } }
        );

        // Reset lastReadAt for the partner too
        await userModel.updateOne(
            { _id: partnerId },
            { $unset: { [`lastReadAt.${myId}`]: "" } }
        );

        // Notify the partner that chat was cleared for both
        const partnerSocketId = getReceiverSocketId(partnerId);
        if (partnerSocketId) {
            io.to(partnerSocketId).emit("chatCleared", {
                userId: myId.toString(),
                type: "forBoth"
            });
        }

        // Notify current user's other devices
        const mySocketId = getReceiverSocketId(myId);
        if (mySocketId) {
            io.to(mySocketId).emit("chatCleared", {
                userId: partnerId.toString(),
                type: "forBoth"
            });
        }

        res.status(200).json({
            message: "Chat cleared successfully"
        });
    } catch (error) {
        console.error("Error in deleteChatForBoth:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};

// Create a missed call message (called by frontend when a call is missed/rejected/timed out)
export const createMissedCallMessage = async (req, res) => {
    try {
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        if (senderId.equals(receiverId)) {
            return res.status(400).json({
                message: "You cannot call yourself"
            });
        }

        const receiverExists = await userModel.findById(receiverId);
        if (!receiverExists) {
            return res.status(404).json({
                message: "Receiver not found"
            });
        }

        const newMessage = new messageModel({
            senderId,
            receiverId,
            type: "missed_call",
            text: "Missed voice call",
            status: "sent"
        });

        await newMessage.save();

        const populatedMessage = await newMessage.populate("senderId", "fullName username profilePic");

        // Emit to receiver via socket if online
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", populatedMessage);
            const senderSocketId = getReceiverSocketId(senderId);
            if (senderSocketId) {
                io.to(senderSocketId).emit("messageStatusUpdated", {
                    messageId: newMessage._id,
                    status: "delivered",
                    partnerId: receiverId
                });
            }
        } else {
            const senderSocketId = getReceiverSocketId(senderId);
            if (senderSocketId) {
                io.to(senderSocketId).emit("newMessage", populatedMessage);
            }
        }

        res.status(201).json({
            newMessage: populatedMessage
        });
    } catch (error) {
        console.error("Error in createMissedCallMessage:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};

// Keep the existing clearChat as alias for deleteChatForBoth for backward compatibility
export const clearChat = deleteChatForBoth;
