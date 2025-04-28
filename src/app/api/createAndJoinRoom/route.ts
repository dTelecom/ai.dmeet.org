import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateUUID } from "@/lib/client-utils";
import { getClientIP } from '@/lib/getClientIp';
import { createTokenForAgent } from '@/lib/agent';
import { languageOptions } from '@/lib/languageOptions';

const { AccessToken } = require("@dtelecom/server-sdk-js");

const schema = z.object({
  roomName: z.string().min(3),
  name: z.string().min(1),
  language: z.string().optional()
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedBody = schema.parse(body);

    const identity = generateUUID();
    const slug = generateUUID();
    const { name, roomName, language } = parsedBody;

    const token = new AccessToken(process.env.API_KEY, process.env.API_SECRET, {
      identity: identity,
      name: name
    });

    token.addGrant({
      room: slug,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      roomAdmin: true
    });

    const clientIp = getClientIP(req) || undefined;
    const url = await token.getWsUrl(clientIp);

    await createTokenForAgent(
      slug,
      url,
      languageOptions.find((opt) => {
        return opt.name === language;
      })?.code || "en",
      identity,
      "landing"
    );

    return NextResponse.json({
      url,
      token: token.toJwt(),
      slug,
      roomName: roomName,
      isAdmin: true,
    });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { error: "Invalid request or server error" },
      { status: 400 }
    );
  }
}
