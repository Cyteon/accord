import { verifyRequest } from '$lib/api.server.js';
import Channel from '$lib/models/Channel';
import Message from '$lib/models/Message.js';
import Member from '$lib/models/Member.js';

export async function GET({ request, params, url }) {
    const user = await verifyRequest(request);

    if (!user) {
        return Response.json({ error: "Unauthorized", }, { status: 401, });
    }

    const id = params.id;
    
    if (!id) {
        return Response.json({ error: "Missing channel id", }, { status: 400, });
    }

    const offset = parseInt(url.searchParams.get("offset") || "0");

    const channel = await Channel.findById(id);

    if (!channel) {
        return Response.json({ error: "Channel not found" }, { status: 404 });
    }

    const member = await Member.findOne({ placeId: channel.placeId, userId: user._id });

    if (!member) {
        return Response.json({ error: "You cannot access this channel" }, { status: 403 });
    }

    let messages = await Message.find({ channelId: channel._id })
        .limit(50)
        .skip(offset)
        .sort({ createdAt: -1 })
        .populate({ path: "authorId", select: "_id username displayName pfpUrl" });

    messages = messages.toReversed();

    return Response.json({
        ...channel.toJSON(),
        messages,
    }, { status: 200 });
}