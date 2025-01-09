import Token from "$lib/models/Token";

export async function POST({ request }) {
    const { token } = await request.json();

    if (!token) {
        return new Response("Missing fields", { status: 400 });
    }

    const existing = await Token.findOne({ token });

    if (!existing) {
        return new Response("Invalid token", { status: 400 });
    }

    await Token.findByIdAndDelete(existing._id);

    return new Response(null, { status: 204 });
}