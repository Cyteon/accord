import User from "$lib/models/User";
import Token from "$lib/models/Token";
import bcrypt from "bcrypt";

export async function POST({ request }) {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
        return new Response("Missing fields", { status: 400 });
    }

    let user;

    if (identifier.includes("@")) {
        user = await User.findOne({ email: identifier });
    } else {
        user = await User.findOne({ username: identifier });
    }

    if (!user) {
        return new Response("User not found", { status: 404 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
        return new Response("Incorrect password", { status: 401 });
    }

    const userNoPswd = user.toJSON();
    delete userNoPswd.password;

    const bytes = new Uint8Array(48);
    crypto.getRandomValues(bytes);
    const token = btoa(String.fromCharCode(...bytes));

    const newToken = new Token({ userId: user._id, token });
    await newToken.save();

    return Response.json(
        {
            user: userNoPswd,
            token,
        },
        {
            status: 200,
        }
    )
}