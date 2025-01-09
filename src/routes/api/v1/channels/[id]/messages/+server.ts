import { verifyRequest } from '$lib/api.server.js';
import Message from '$lib/models/Message';
import Channel from '$lib/models/Channel';
import Member from '$lib/models/Member';
import { produce } from "sveltekit-sse";

let clients = new Map();

export async function PUT({ params, request }) {
    const user = await verifyRequest(request);

    if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = params.id;

    if (!id) {
        return Response.json({ error: 'Missing channel id' }, { status: 400 });
    }

    const { content } = await request.json();

    if (!content) {
        return Response.json({ error: 'Missing content' }, { status: 400 });
    }

    if (content.length > 2000) {
        return Response.json({ error: "Content too large" }, { status: 413 });
    }

    const channel = await Channel.findById(id);

    if (!channel) {
        return Response.json({ error: 'Channel not found' }, { status: 404 });
    }

    const member = await Member.findOne({ placeId: channel.placeId, userId: user._id });

    if (!member) {
        return Response.json({ error: 'You cannot access this channel' }, { status: 403 });
    }

    const message = new Message({
        channelId: channel._id,
        authorId: user._id,
        content,
    });
    await message.save();

    clients.forEach((emit) => {
        emit("message", JSON.stringify({
            ...message.toJSON(),
            authorId: {
                _id: user._id,
                username: user.username,
                displayName: user.displayName,
                pfpUrl: user.pfpUrl,
            }
        }));
    });

    return Response.json({
        ...message.toJSON(),
        authorId: user.toJSON(),
    }, { status: 201 });
}

// websocket go brrrrrrrrr
export async function POST({ request, params }) {
    const id = params.id;

    if (!id) {
        return Response.json({ error: "Missing channel id" }, { status: 400 });
    }

    const user = await verifyRequest(request);

    if (!user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const channel = await Channel.findById(id);

    if (!channel) {
        return Response.json({ error: "Channel not found" }, { status: 404 });
    }

    const member = await Member.findOne({ placeId: channel.placeId, userId: user._id });

    if (!member) {
        return Response.json({ error: "You cannot access this channel" }, { status: 403 });
    }

    // cooked
    return produce(
        function start({ emit }) {
            const sessionId = request.headers.get("session-id") ?? `${user._id}-${Math.random().toString(36).slice(2)}`;
            clients.set(sessionId, emit);
        },
        {
            stop() {
                const sessionId = request.headers.get("session-id") ?? `${user._id}-${Math.random().toString(36).slice(2)}`;

                if (!clients.has(sessionId)) {
                    return;
                }

                clients.delete(sessionId);
            }
        }
    )
}