import OpenAI from "openai";
import s3Client from "@/app/utils/s3Client";
import { HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@auth0/nextjs-auth0";
import redisClient from "@/app/utils/redisClient";
import { CID } from "multiformats/cid";
import * as json from "multiformats/codecs/json";
import { sha256 } from "multiformats/hashes/sha2";

export async function POST(req: NextRequest): Promise<NextResponse> {
  // @ts-ignore
  const { user } = await getSession();
  const sub = user.sub;

  let isPremium, product;
  try {
    const premiumInfo = await redisClient.get(`premium:${sub}`);
    // @ts-ignore
    isPremium = premiumInfo?.subscription?.isPremium;
  } catch (e) {
    isPremium = false;
    product = null;
  }

  if (!isPremium) {
    return NextResponse.json({
      error: "premium required",
      message: "Sorry, you need a Premium subscription to use this.",
    });
  }

  let { model, input, voice, response_format, speed } = await req.json();

  const bytes = json.encode({
    model,
    input,
    voice,
    response_format,
    speed,
  });
  const hash = await sha256.digest(bytes);
  const cid = CID.create(1, json.code, hash).toString();

  try {
    await s3Client.send(
      new HeadObjectCommand({
        Bucket: "abandonai-prod",
        Key: `audio/${cid}.mp3`,
      }),
    );
    return NextResponse.json({
      cache: true,
      url: `https://s3.abandon.ai/audio/${cid}.mp3`,
    });
  } catch (e) {
    console.log("NoSuchKey:", `audio/${cid}.mp3`);
  }

  try {
    const openai = new OpenAI();
    const response = await openai.audio.speech.create({
      model,
      voice,
      input,
      response_format,
      speed,
    });

    const buffer = Buffer.from(await response.arrayBuffer());

    try {
      const jsonBuffer = Buffer.from(
        JSON.stringify({
          model,
          input,
          voice,
          response_format,
          speed,
        }),
      );
      await Promise.all([
        s3Client.send(
          new PutObjectCommand({
            Bucket: "abandonai-prod",
            Key: `audio/${cid}.mp3`,
            Body: buffer,
            ContentType: "audio/mpeg",
          }),
        ),
        s3Client.send(
          new PutObjectCommand({
            Bucket: "abandonai-prod",
            Key: `audio/${cid}`,
            Body: jsonBuffer,
            ContentType: "application/json",
          }),
        ),
      ]);
    } catch (e) {
      console.log(e);
    }
    return NextResponse.json({
      url: `https://s3.abandon.ai/audio/${cid}.mp3`,
    });
  } catch (e) {
    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}
