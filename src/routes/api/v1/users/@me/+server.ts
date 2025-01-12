import Member from "$lib/models/Member";
import { verifyRequest } from "$lib/api.server.js";
import { Client } from "minio";
import { S3_ENDPOINT, S3_PORT, S3_SECURE, S3_SECRET_KEY, S3_ACCESS_KEY, S3_BUCKET } from '$env/static/private';

const client = new Client({
  endPoint: S3_ENDPOINT,
  port: parseInt(S3_PORT),
  useSSL: S3_SECURE === "true",
  accessKey: S3_ACCESS_KEY,
  secretKey: S3_SECRET_KEY,
})

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

  const places = await Member.find({ userId: user._id }).populate("placeId");

  return Response.json(
    {
      user: userNoPswd,
      places: places.map((place) => place.placeId),
    },
    {
      status: 200,
    },
  );
}

export async function PATCH({ request }) {
  const user = await verifyRequest(request);

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { username, displayName, avatar } = await request.json();

  if (!username && !displayName && !avatar) {
    return Response.json({ error: "No fields to update" }, { status: 400 });
  }

  if (username) {
    user.username = username;
  }

  if (displayName) {
    user.displayName = displayName;
  }

  if (avatar) {
    if (!avatar.startsWith("data:image/")) {
      return Response.json({ error: "Invalid file type" }, { status: 400 });
    }

    if (Buffer.byteLength(avatar, "base64") > 2048 * 1024) {
      return Response.json({ error: "File too large" }, { status: 413 });
    }

    var buf = Buffer.from(avatar.replace(/^data:image\/\w+;base64,/, ""), "base64");

    const key = `avatars/${user._id}.png`;

    try {
      await client.removeObject(S3_BUCKET, key);
    } catch (e) {
      console.log(e);
    }

    await client.putObject(S3_BUCKET, key, buf, buf.length);

    user.pfpUrl = `${S3_SECURE === "true" ? "https" : "http"}://${S3_ENDPOINT}:${S3_PORT}/${S3_BUCKET}/${key}`;
  }

  await user.save();

  const userNoPswd = user.toJSON();
  delete userNoPswd.password;
  
  return Response.json(userNoPswd, { status: 200 });
}