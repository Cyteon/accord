import { verifyRequest } from '$lib/api.server.js';
import Channel from '$lib/models/Channel';
import Message from '$lib/models/Message.js';

export async function GET({ request, params }) {
    const user = await verifyRequest(request);

    if (!user) {
        return Response.json({ error: "Unauthorized", }, { status: 401, });
    }

    const id = params.id;
    
    if (!id) {
        return Response.json({ error: "Missing channel id", }, { status: 400, });
    }

    const channel = await Channel.findById(id);

    if (!channel) {
        return Response.json({ error: "Channel not found" }, { status: 404 });
    }

    const messages = await Message.find({ channelId: channel._id })
        .limit(100)
        .sort({ createdAt: 1 })
        .populate("authorId");

    return Response.json({
        ...channel.toJSON(),
        messages,
    }, { status: 200 });
}