import mongoose from "mongoose";

export interface MemberType {
  userId: mongoose.Types.ObjectId;
  placeId: mongoose.Types.ObjectId;
}

const MemberSchema = new mongoose.Schema<MemberType>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  placeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Place",
    required: true,
  },
});

export default mongoose.models.Member ||
  mongoose.model<MemberType>("Member", MemberSchema);
