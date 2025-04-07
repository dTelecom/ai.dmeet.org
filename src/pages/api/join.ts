import { AccessToken } from "@dtelecom/server-sdk-js";
import type { NextApiRequest, NextApiResponse } from "next";
import type { TypeOf } from "zod";
import { z } from "zod";
import { generateUUID } from "@/lib/client-utils";
import { env } from "@/env.mjs";
import requestIp from "request-ip";

const schema = z.object({
  slug: z.string(),
  name: z.string().min(1),
  wsUrl: z.string().optional(),
  roomName: z.string().min(3)
});

interface ApiRequest extends NextApiRequest {
  body: TypeOf<typeof schema>;
}

export interface IJoinResponse {
  identity: string;
  url: string;
  token: string;
  slug: string;
  roomName: string;
  isAdmin: boolean;
  language: string;
}

export default async function handler(req: ApiRequest, res: NextApiResponse) {
  const input = req.body;
  let identity = generateUUID();


  const token = new AccessToken(env.API_KEY, env.API_SECRET, {
    identity: identity,
    name: input.name
  });

  token.addGrant({
    room: input.slug,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    roomAdmin: false
  });

  token.webHookURL = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/api/webhook`
    : undefined;

  let url = input.wsUrl;

  if (!url) {
    const clientIp = requestIp.getClientIp(req) || undefined;
    url = await token.getWsUrl(clientIp);
  }

  res.status(200).json({
    identity,
    url,
    token: token.toJwt(),
    slug: input.slug,
    roomName: input.roomName,
    isAdmin: false
  });
}
