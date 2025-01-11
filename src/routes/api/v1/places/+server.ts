import { verifyRequest } from "$lib/api.server.js";
import Place from "$lib/models/Place";
import Member from "$lib/models/Member";
import Channel from "$lib/models/Channel";

export async function PUT({ request }) {
  const user = await verifyRequest(request);

  if (!user) {
    return Response.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  const { name } = await request.json();

  if (!name) {
    return Response.json(
      {
        error: "Invalid request",
      },
      {
        status: 400,
      },
    );
  }

  const place = new Place({
    ownerId: user._id,
    name,
  });
  await place.save();

  const member = new Member({
    userId: user._id,
    placeId: place._id,
  });
  await member.save();

  const channel = new Channel({
    placeId: place._id,
    name: "general",
  });
  await channel.save();

  return Response.json(
    { channels: [channel], ...place.toJSON() },
    { status: 201 },
  );
}
