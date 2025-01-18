import mongoose from "mongoose";

export enum RelationStatus {
  FRIENDS,
  BLOCKED,
  PENDING,
}

export interface RelationType {
  userId: mongoose.Types.ObjectId;
  targetId: mongoose.Types.ObjectId;
  status: RelationStatus;
}

const RelationSchema = new mongoose.Schema<RelationType>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  status: {
    type: Number,
    required: true,
    enum: [0, 1, 2],
  },
});

// uh without ? it caused 500????
export default mongoose.models?.Relation ||
  mongoose.model<RelationType>("Relation", RelationSchema);
