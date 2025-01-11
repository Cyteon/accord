import Invite from "$lib/models/Invite.js";
import Place from "$lib/models/Place";
import { verifyRequest } from "$lib/api.server";

export async function PUT({ request, params }) {
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
  const place = await Place.findById(id);

  const { maxUses } = await request.json();

  const code =
    Math.random().toString(36).substring(8) +
    Math.random().toString(36).substring(8);

  const invite = new Invite({
    placeId: place._id,
    usesLeft: maxUses,
    code,
  });
  await invite.save();

  return Response.json({ code, maxUses }, { status: 200 });
}
