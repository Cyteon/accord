import Member from "$lib/models/Member";
import { verifyRequest } from "$lib/api.server.js";

export async function GET({ request }) {
    const user = await verifyRequest(request);

    if (!user) {
        return Response.json(
            {
                error: "Unauthorized",
            },
            {
                status: 401,
            }
        );
    }

    const userNoPswd = user.toJSON();
    delete userNoPswd.password;

    const places = await Member.find({ userId: user._id }).populate("placeId");

    return Response.json(
        {
            user: userNoPswd,
            places: places.map((place) => ( place.placeId ))
        },
        {
            status: 200,
        }
    );
}