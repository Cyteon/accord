import mongoose from "mongoose";

export interface InviteType {
    _id: mongoose.Types.ObjectId;
    placeId: mongoose.Types.ObjectId;
    usesLeft: number;
    code: string;
}

const InviteSchema = new mongoose.Schema<InviteType>({
    placeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Place",
        required: true,
    },

    usesLeft: {
        type: Number,
        required: true,
    },

    code: {
        type: String,
        required: true,
    },
});

export default mongoose.models.Invite || mongoose.model<InviteType>("Invite", InviteSchema);