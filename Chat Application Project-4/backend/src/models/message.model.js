import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    image: {
      type: String,
    },
    // Message type: regular text/image, or call-related (missed_call)
    type: {
      type: String,
      enum: ["message", "missed_call"],
      default: "message",
    },
    // Call duration in seconds (for completed calls, if tracked)
    callDuration: {
      type: Number,
      default: null,
    },
    // Message delivery status: sent, delivered, seen
    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },
    // Users who have deleted this message from their view
    // When a user "clears chat for me", their ID is added to this array
    deletedFor: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
  },
  { timestamps: true }
);

const messageModel = mongoose.model("Message", messageSchema);

export default messageModel;