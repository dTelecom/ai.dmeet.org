import { getClientIP } from '@/lib/getClientIp';
import { createTokenForAgent } from '@/lib/agent';

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateUUID } from "@/lib/client-utils";
import { getUserIdFromHeaders } from "@/lib/dtel-auth/server";
import { formatUserId } from "@/lib/dtel-auth/helpers";
import { roomParticipants } from '@/lib';

const { AccessToken } = require("@dtelecom/server-sdk-js");


const schema = z.object({
  roomName: z.string().min(3),
  name: z.string().min(1),
  wsUrl: z.string().optional(),
  language: z.string().optional()
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedBody = schema.parse(body);

    const userId = await getUserIdFromHeaders(req);
    const formattedUserId = formatUserId(userId);

    const identity = formattedUserId || generateUUID();
    const slug = generateUUID();
    const { name, roomName, wsUrl, language } = parsedBody;

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

    token.metadata = JSON.stringify({ admin: true, project: process.env.PROJECT_NAME });

    token.webHookURL = userId && process.env.NEXT_PUBLIC_POINTS_BACKEND_URL
      ? `https://${process.env.NEXT_PUBLIC_POINTS_BACKEND_URL}/api/webhook`
      : undefined;

    let url = wsUrl;

    if (!url) {
      const clientIp = getClientIP(req) || undefined;
      url = await token.getWsUrl(clientIp);
    }

    roomParticipants[slug] = {
      count: 0,
      createdAt: Math.floor(new Date().getTime() / 1000),
      adminWsUrl: url,
    };

    if (!url) {
      return NextResponse.json(
        { error: "Invalid request or server error" },
        { status: 400 }
      );
    }

    await createTokenForAgent(slug, url, language || 'en', identity, "dmeet");

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


