import mongoose from "mongoose";

export interface TokenType {
  userId: mongoose.Types.ObjectId;
  token: string;
}

const TokenSchema = new mongoose.Schema<TokenType>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
});

export default mongoose.models.Token ||
  mongoose.model<TokenType>("Token", TokenSchema);
