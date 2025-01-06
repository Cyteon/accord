import Token from "./models/Token";
import { UserType } from "./models/User";

export async function verifyRequest(request: Request): Promise<UserType | null> {
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