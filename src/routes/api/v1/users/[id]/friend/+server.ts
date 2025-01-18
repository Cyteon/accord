import { verifyRequest } from "$lib/api.server";
import User from "$lib/models/User";
import Relation, { RelationStatus } from "$lib/models/Relation";

export async function POST({ request, params }) {
  const me = await verifyRequest(request);

  if (!me) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  if (!id) {
    return Response.json({ error: "Missing identifier" }, { status: 400 });
  }

  if (id == me.username || id == me._id.toString()) {
    return Response.json(
      { error: "You cannot friend yourself" },
      { status: 400 },
    );
  }

  const queryBody = { $or: [{ username: id }] };

  if (id.length == 24) {
    queryBody.$or.push({ _id: id });
  }

  const target = await User.findOne(queryBody);

  if (!target) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const existingRelationToTarget = await Relation.findOne({
    userId: me._id,
    targetId: target._id,
  });

  if (existingRelationToTarget) {
    if (existingRelationToTarget.status == RelationStatus.FRIENDS) {
      return Response.json({ error: "Already friends" }, { status: 400 });
    }

    if (existingRelationToTarget.status == RelationStatus.BLOCKED) {
      return Response.json(
        { error: "You have blocked this user" },
        { status: 400 },
      );
    }

    if (existingRelationToTarget.status == RelationStatus.PENDING) {
      return Response.json(
        { error: "Friend request already sent" },
        { status: 400 },
      );
    }
  }

  const existingRelationToMe = await Relation.findOne({
    userId: target._id,
    targetId: me._id,
  });

  if (existingRelationToMe) {
    if (existingRelationToMe.status == RelationStatus.FRIENDS) {
      return Response.json({ error: "Already friends" }, { status: 400 });
    }

    if (existingRelationToMe.status == RelationStatus.BLOCKED) {
      // we are NOT letting bro know with this one
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    if (existingRelationToMe.status == RelationStatus.PENDING) {
      existingRelationToMe.status = RelationStatus.FRIENDS;

      await existingRelationToMe.save();

      if (existingRelationToTarget) {
        existingRelationToTarget.status = RelationStatus.FRIENDS;
        await existingRelationToTarget.save();
      } else {
        const newRelationToTarget = new Relation({
          userId: me._id,
          targetId: target._id,
          status: RelationStatus.FRIENDS,
        });
        await newRelationToTarget.save();
      }

      return Response.json({
        relationStatus: RelationStatus.FRIENDS,
        targetId: {
          _id: target._id,
          username: target.username,
          displayName: target.displayName,
          pfpUrl: target.pfpUrl,
        },
      });
    }
  }

  const newRelation = new Relation({
    userId: me._id,
    targetId: target._id,
    status: RelationStatus.PENDING,
  });
  await newRelation.save();

  return Response.json({
    status: RelationStatus.PENDING,
    targetId: {
      _id: target._id,
      username: target.username,
      displayName: target.displayName,
      pfpUrl: target.pfpUrl,
    },
  });
}

export async function DELETE({ params, request }) {
  const user = await verifyRequest(request);

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  if (!id) {
    return Response.json({ error: "Missing identifier" }, { status: 400 });
  }

  const queryBody = { $or: [{ username: id }] };

  if (id.length == 24) {
    queryBody.$or.push({ _id: id });
  }

  const target = await User.findOne(queryBody);

  if (!target) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  await Relation.deleteMany({
    $or: [
      { userId: user._id, targetId: target._id },
      { userId: target._id, targetId: user._id },
    ],
  });

  return Response.json({ success: true });
}
