import type { NextApiRequest, NextApiResponse } from "next";
import type { TypeOf } from "zod";
import { z } from "zod";
import { generateUUID } from "@/lib/client-utils";
import { AccessToken } from "@dtelecom/server-sdk-js";
import { env } from "@/env.mjs";
import requestIp from "request-ip";
import { createTokenForAgent } from "@/pages/api/createRoom";
import { languageOptions } from "@/lib/languageOptions";

const schema = z.object({
  roomName: z.string().min(3),
  name: z.string().min(1),
  identity: z.string().optional(),
  wsUrl: z.string().optional(),
  language: z.string().optional()
});

interface ApiRequest extends NextApiRequest {
  body: TypeOf<typeof schema>;
}

export default async function handler(req: ApiRequest, res: NextApiResponse) {
  const identity = generateUUID();
  const slug = generateUUID();
  const { name, roomName, language } = req.body;

  const token = new AccessToken(env.API_KEY, env.API_SECRET, {
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

  token.webHookURL = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/api/webhook`
    : undefined;

  const clientIp = requestIp.getClientIp(req) || undefined;
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

  res.status(200).json({
    url,
    token: token.toJwt(),
    slug,
    roomName: roomName
  });
}
