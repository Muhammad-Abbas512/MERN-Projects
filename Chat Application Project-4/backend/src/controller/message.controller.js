import messageModel from "../models/message.model.js";
import userModel from "../models/user.model.js";
import cloudinary from "../utils/cloudinary.js";
import { io, getReceiverSocketId } from "../lib/socket.js";

export const getAllContacts = async (req, res) => {

    try{
        const loggedInUserId = req.user.id;
        const filteredUsers = await userModel.find({_id: {$ne: loggedInUserId}}).select("-password");

        res.status(200).json({
            filteredUsers
        })
    }
    catch(error){
        console.error("Error in getAllContacts:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}


export const getMessagesById = async (req, res) =>{
    try{
        const myId = req.user._id;
        const {userId:userToChatId} = req.params;

        //me and you
        // i send you messages
        //you send me messages. 
        //in this case all the messages. 

        const messages = await messageModel.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        }).sort({ createdAt: 1 }).populate('senderId', 'username fullName profilePic').populate('receiverId', 'username fullName profilePic');

        res.status(200).json({
            messages
        })


    }
    catch(error){
        console.error("Error in getMessagesById:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}


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
            // upload base64 image to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new messageModel({
            senderId,
            receiverId,
            text,
            image: imageUrl
        });

        await newMessage.save();
        
        // Populate sender info before sending
        const populatedMessage = await newMessage.populate("senderId", "fullName username profilePic");

        // Emit to receiver via socket if online
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", populatedMessage);
        }

        // Also emit to sender's other devices (if logged in elsewhere)
        const senderSocketId = getReceiverSocketId(senderId);
        if (senderSocketId) {
            io.to(senderSocketId).emit("newMessage", populatedMessage);
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

    try{

        const loggedInUserId = req.user._id;

        //find all the messages where the looged in user is either the sender or the receiver
        const messages = await messageModel.find({
            $or: [
                { senderId: loggedInUserId },
                { receiverId: loggedInUserId }
            ]
        });

        const chatPartnerIds =[
            ...new Set( messages.map(message => {
            if(message.senderId.toString() === loggedInUserId.toString()){
                return message.receiverId.toString();
            } else {
                return message.senderId.toString();
            }
        })),
    ];

    const chatPartners = await userModel.find({
        _id: { $in: chatPartnerIds }
    }).select("-password")
       res.status(200).json({
        chatPartners
       })

    }catch(error){
        console.error("Error in getChatPartner:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }

}