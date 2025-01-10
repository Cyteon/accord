import User from "$lib/models/User";
import Token from "$lib/models/Token";
import Member from "$lib/models/Member";
import bcrypt from "bcrypt";

import { DEFAULT_SERVER_ID } from "$env/static/private";

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
        email,
        displayName,
        username,
        password: hash,
    });
    await user.save();

    try {
        const member = new Member({
            placeId: DEFAULT_SERVER_ID,
            userId: user._id,
        });
        await member.save();
    } catch (e) {
        console.error(e);
    }

    const bytes = new Uint8Array(48);
    crypto.getRandomValues(bytes);
    const token = btoa(String.fromCharCode(...bytes));

    const newToken = new Token({ userId: user._id, token });
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