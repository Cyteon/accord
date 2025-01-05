import Token from "$lib/models/Token";
import User from "$lib/models/User";

export async function GET({ request }) {
    const authorization = request.headers.get("Authorization");

    if (!authorization || !authorization.startsWith("Bearer ")) {
        return new Response("Unauthorized", { status: 401 });
    }

    const token = await Token.findOne({
        token: authorization.split(" ")[1],
    });

    if (!token) {
        return new Response("Unauthorized", { status: 401 });
    }

    const user = await User.findOne({ userId: token.userId });

    if (!user) {
        return new Response("Unauthorized", { status: 401 });
    }

    const userNoPswd = user.toJSON();
    delete userNoPswd.password;

    return Response.json(
        {
            user: userNoPswd,
        },
        {
            status: 200,
        }
    );
}