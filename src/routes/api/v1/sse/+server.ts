import { verifyRequest } from "$lib/api.server.js";
import Channel from "$lib/models/Channel";
import Member from "$lib/models/Member";
import { produce } from "sveltekit-sse";
import { channelClients, clients } from "$lib/api.server.js";

// sse go brrrrrrrrr
export async function POST({ request, params }) {
  const user = await verifyRequest(request);

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { channels } = await request.json();

  let placesShouldBeIn = [];

  await Promise.all(
    channels.map(async (id) => {
      const channel = await Channel.findById(id);

      if (!channel) {
        return Response.json({ error: "Channel not found" }, { status: 404 });
      }

      if (!placesShouldBeIn.includes(channel.placeId)) {
        placesShouldBeIn.push(channel.placeId);
      }
    }),
  );

  const members = await Member.find({
    userId: user._id,
    placeId: { $in: placesShouldBeIn },
  });

  if (!members) {
    return Response.json(
      { error: "You cannot access these channels" },
      { status: 403 },
    );
  }

  if (members.length != placesShouldBeIn.length) {
    return Response.json(
      { error: "You cannot all or some access these channels" },
      { status: 403 },
    );
  }

  const sessionId = `${user._id}-${Math.random().toString(36).slice(2)}`;

  // cooked
  return produce(
    function start({ emit }) {
      channels.map((id) => {
        if (!channelClients.has(id)) {
          channelClients.set(id, []);
        }

        const cClients = channelClients.get(id);
        cClients.push(sessionId);

        channelClients.set(id, cClients);

        if (!clients.has(sessionId)) {
          clients.set(sessionId, emit);
        }
      });
    },
    {
      stop() {
        channels.map((id) => {
          if (!channelClients.has(id)) {
            return;
          }

          const clients = channelClients.get(id);

          if (!clients.includes(sessionId)) {
            return;
          }

          clients.splice(clients.indexOf(sessionId), 1);
        });
      },
    },
  );
}
