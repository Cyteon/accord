import Channel from "$lib/models/Channel";
import Place from "$lib/models/Place";
import { verifyRequest } from "$lib/api.server";

export async function GET({ request, params }) {
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

  const { id } = params;

  let place;

  // sneaky trick to be fast fast fast
  const channels = await Channel.find({ placeId: id }).populate("placeId");

  if (channels.length) {
    place = channels[0].placeId;
  } else {
    place = await Place.findById(id);
  }

  if (!place) {
    return Response.json(
      {
        error: "Not found",
      },
      {
        status: 404,
      },
    );
  }

  return Response.json(
    { channels: channels, ...place.toJSON() },
    { status: 200 },
  );
}
