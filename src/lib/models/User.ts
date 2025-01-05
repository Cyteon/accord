import mongoose from "mongoose";

export interface UserType {
    userId: string;
    email: string;
    displayName: string;
    username: string;
    password: string;
}

const UserSchema = new mongoose.Schema<UserType>({
    userId: {
        type: String,
        required: true,
        unique: true,
    },
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
    },
    password: {
        type: String,
        required: true,
    },
});

export default mongoose.models.User || mongoose.model<UserType>("User", UserSchema);