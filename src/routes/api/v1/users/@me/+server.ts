import Member from "$lib/models/Member";
import Token from "$lib/models/Token";
import User from "$lib/models/User";
import Relation, { RelationStatus } from "$lib/models/Relation";

import { verifyRequest } from "$lib/api.server";
import { Client } from "minio";
import sharp from "sharp";
import {
  S3_ENDPOINT,
  S3_PORT,
  S3_SECURE,
  S3_SECRET_KEY,
  S3_ACCESS_KEY,
  S3_BUCKET,
} from "$env/static/private";

const client = new Client({
  endPoint: S3_ENDPOINT,
  port: parseInt(S3_PORT),
  useSSL: S3_SECURE === "true",
  accessKey: S3_ACCESS_KEY,
  secretKey: S3_SECRET_KEY,
});

export async function GET({ request }) {
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

  const userNoPswd = user.toJSON();
  delete userNoPswd.password;

  const [places, relations] = await Promise.all([
    Member.find({ userId: user._id }).populate("placeId"),
    Relation.find({ $or: [{ userId: user._id }, { targetId: user._id }] }),
  ]);

  const friendReqs = relations.filter(
    (relation) => relation.status === RelationStatus.PENDING,
  );

  const friends = relations.filter(
    // just get friend relation me -> other, as other -> me would be exactly same
    (relation) =>
      relation.status === RelationStatus.FRIENDS &&
      relation.userId.toString() === user._id.toString(),
  );

  let friendReqsNew = [];
  let friendsNew = [];

  await Promise.all([
    Promise.all(
      friendReqs.map(async (req) => {
        if (req.userId.toString() === user._id.toString()) {
          const user = await User.findById(req.targetId);

          friendReqsNew.push({
            userId: req.userId,
            targetId: {
              _id: user._id,
              username: user.username,
              displayName: user.displayName,
              pfpUrl: user.pfpUrl,
            },
            status: req.status,
          });
        } else {
          const user = await User.findById(req.userId);

          friendReqsNew.push({
            userId: {
              _id: user._id,
              username: user.username,
              displayName: user.displayName,
              pfpUrl: user.pfpUrl,
            },
            targetId: req.targetId,
            status: req.status,
          });
        }
      }),
    ),

    Promise.all(
      friends.map(async (friend) => {
        const user = await User.findById(friend.targetId);

        friendsNew.push({
          userId: friend.userId,
          targetId: {
            _id: user._id,
            username: user.username,
            displayName: user.displayName,
            pfpUrl: user.pfpUrl,
          },
          status: friend.status,
        });
      }),
    ),
  ]);

  return Response.json(
    {
      user: userNoPswd,
      places: places.map((place) => place.placeId),
      friendReqs: friendReqsNew,
      friends: friendsNew,
    },
    {
      status: 200,
    },
  );
}

export async function DELETE({ request }) {
  const user = await verifyRequest(request);

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await Token.deleteMany({ userId: user._id });
  await Member.deleteMany({ userId: user._id });

  await User.findByIdAndDelete(user._id);

  return Response.json({}, { status: 204 });
}

export async function PATCH({ request }) {
  const user = await verifyRequest(request);

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { username, displayName, aboutMe, avatar } = await request.json();

  if (!username && !displayName && !avatar && !aboutMe) {
    return Response.json({ error: "No fields to update" }, { status: 400 });
  }

  if (username) {
    user.username = username;
  }

  if (displayName) {
    user.displayName = displayName;
  }

  if (aboutMe) {
    user.aboutMe = aboutMe;
  }

  if (avatar) {
    if (!avatar.startsWith("data:image/")) {
      return Response.json({ error: "Invalid file type" }, { status: 400 });
    }

    if (Buffer.byteLength(avatar, "base64") > 2048 * 1024) {
      return Response.json({ error: "File too large" }, { status: 413 });
    }

    var buf = Buffer.from(
      avatar.replace(/^data:image\/\w+;base64,/, ""),
      "base64",
    );

    const key = `avatars/${user._id}.webp`;

    try {
      await client.removeObject(S3_BUCKET, key);
    } catch (e) {
      console.log(e);
    }

    const webpBuf = await sharp(buf).webp().toBuffer();

    await client.putObject(S3_BUCKET, key, webpBuf, webpBuf.length);

    user.pfpUrl = `${S3_SECURE === "true" ? "https" : "http"}://${S3_ENDPOINT}:${S3_PORT}/${S3_BUCKET}/${key}`;
  }

  await user.save();

  const userNoPswd = user.toJSON();
  delete userNoPswd.password;

  return Response.json(userNoPswd, { status: 200 });
}
