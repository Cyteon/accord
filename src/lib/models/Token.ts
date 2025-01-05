import mongoose from "mongoose";

export interface TokenType {
    userId: string;
    token: string;
}

const TokenSchema = new mongoose.Schema<TokenType>({
    userId: {
        type: String,
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
});

export default mongoose.models.Token || mongoose.model<TokenType>("Token", TokenSchema);