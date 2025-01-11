import { verifyRequest } from "$lib/api.server.js";
import Invite from "$lib/models/Invite";
import Member from "$lib/models/Member";
import Place from "$lib/models/Place";

export async function POST({ request, params }) {
  const code = params.code;

  const user = await verifyRequest(request);

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invite = await Invite.findOne({ code });

  if (!invite) {
    // btw, we return text cause will be done on frontent ig? i will fix in future
    return new Response("Invalid invite", { status: 404 });
  }

  const existingMembership = await Member.findOne({
    placeId: invite.placeId,
    userId: user._id,
  });

  if (existingMembership) {
    return new Response("You are already a member of this server", {
      status: 409,
    });
  }

  if (invite.usesLeft <= 0 && invite.usesLeft !== -1) {
    return new Response("Invite has expired", { status: 410 });
  }

  if (invite.usesLeft !== -1) {
    invite.usesLeft--;
    await invite.save();
  }

  const member = new Member({
    userId: user._id,
    placeId: invite.placeId,
  });
  await member.save();

  const place = await Place.findById(invite.placeId);

  return Response.json(place.toJSON(), { status: 200 });
}
