import Channel from "$lib/models/Channel";
import Place from "$lib/models/Place";
import { verifyRequest } from "$lib/api.server";

export async function PUT({ request, params }) {
    const id = params.id;

    if (!id) {
        return Response.json({ error: "Missing channel id" }, { status: 400 });
    }

    const user = await verifyRequest(request);

    if (!user) {
        return Response.json({ error: "Unathorized" }, { status: 401 });
    }

    const place = await Place.findById(id);

    if (!place) {
        return Response.json({ error: "Place not found" }, { status: 404 });
    }

    if (place.ownerId.toString() !== user._id.toString()) {
        return Response.json({ error: "You do not own this place" }, { status: 403 });
    }

    const { name } = await request.json();

    const channel = new Channel({
        placeId: place._id,
        name,
    });
    await channel.save();

    return Response.json(channel.toJSON(), { status: 200 });
}