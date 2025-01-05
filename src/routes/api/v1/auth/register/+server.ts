import User from "$lib/models/User";
import Token from "$lib/models/Token";
import { typeid } from "typeid-js";
import bcrypt from "bcrypt";

export async function POST({ request }) {
    const { email, displayName, username, password } = await request.json();

    if (!email || !displayName || !username || !password) {
        return new Response("Missing fields", { status: 400 });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
        return new Response("Email or username already in use", { status: 400 });
    }

    const hash = await bcrypt.hash(password, 12);

    const user = new User({ 
        userId: typeid("user"),
        email,
        displayName,
        username,
        password: hash,
    });

    await user.save();

    const bytes = new Uint8Array(48);
    crypto.getRandomValues(bytes);
    const token = btoa(String.fromCharCode(...bytes));

    const newToken = new Token({ userId: user.userId, token });
    await newToken.save();

    const userNoPswd = user.toJSON();
    delete userNoPswd.password;

    return Response.json(
        {
            token,
            user: userNoPswd
        },
        {
            status: 201,
        }
    )
}