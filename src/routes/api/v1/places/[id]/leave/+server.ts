// TODO: implement this on frontend
import Member from "$lib/models/Member";
import { verifyRequest } from "$lib/api.server";

export async function POST({ request, params }) {
    const user = await verifyRequest(request);

    if (!user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const member = await Member.findOne({ userId: user._id, placeId: id });

    if (!member) {
        return Response.json({ error: "Not member of this place" }, { status: 400 });
    }

    await Member.findByIdAndDelete(member._id);

    return Response.json({ status: 204 });
}