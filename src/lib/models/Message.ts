import mongoose from "mongoose";

export interface MessageType {
    _id: mongoose.Types.ObjectId;
    channelId: mongoose.Types.ObjectId;
    authorId: mongoose.Types.ObjectId;
    createdAt: Date;
    content: string;
}

const MessageSchema = new mongoose.Schema<MessageType>({
    channelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Channel",
        required: true,
    },

    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },

    content: {
        type: String,
        required: true,
    },
});

export default mongoose.models.Message || mongoose.model<MessageType>("Message", MessageSchema);