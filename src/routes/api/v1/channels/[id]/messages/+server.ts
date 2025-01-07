import { verifyRequest } from '$lib/api.server.js';
import Message from '$lib/models/Message';
import Channel from '$lib/models/Channel';

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

    const message = new Message({
        channelId: channel._id,
        authorId: user._id,
        content,
    });
    await message.save();

    // TODO: fire event to gateway here

    return Response.json(message.toJSON(), { status: 201 });
}