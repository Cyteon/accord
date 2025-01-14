import mongoose from "mongoose";

export interface UserType {
  _id: mongoose.Types.ObjectId;
  email: string;
  displayName: string;
  username: string;
  password: string;
  aboutMe?: string;
  pfpUrl?: string;
}

const UserSchema = new mongoose.Schema<UserType>({
  email: {
    type: String,
    required: true,
    unique: true,
  },

  displayName: {
    type: String,
    required: true,
  },

  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },

  password: {
    type: String,
    required: true,
  },

  aboutMe: {
    type: String,
    default: "",
  },

  pfpUrl: {
    type: String,
    default: "https://placehold.co/200",
  },
});

export default mongoose.models.User ||
  mongoose.model<UserType>("User", UserSchema);
