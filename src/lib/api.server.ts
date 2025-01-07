import Token from "./models/Token";
import type { UserType } from "./models/User";
import mongoose from "mongoose";

export async function verifyRequest(request: Request): Promise<UserType & mongoose.Document | null> {
    const authorization = request.headers.get("Authorization");

    if (!authorization || !authorization.startsWith("Bearer ")) {
        return null;
    }

    const token = await Token.findOne({
        token: authorization.split(" ")[1],
    }).populate("userId");

    if (!token) {
        return null;
    }

    const user = token.userId;

    if (!user) {
        return null;
    }

    return user;
}