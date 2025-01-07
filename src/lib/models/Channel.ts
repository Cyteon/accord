import mongoose from "mongoose";

export interface ChannelType {
    placeId: mongoose.Types.ObjectId;
    name: string;
}

const ChannelSchema = new mongoose.Schema<ChannelType>({
    placeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Place",
        required: true,
    },

    name: {
        type: String,
        required: true,
    },
});

export default mongoose.models.Channel || mongoose.model<ChannelType>("Channel", ChannelSchema);