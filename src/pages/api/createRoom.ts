import type { NextApiRequest, NextApiResponse } from "next";
import type { TypeOf } from "zod";
import { z } from "zod";
import { generateUUID } from "@/lib/client-utils";
import { AccessToken } from "@dtelecom/server-sdk-js";
import { env } from "@/env.mjs";
import requestIp from "request-ip";
import axios from "axios";

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
  const input = req.body;

  const token = new AccessToken(env.API_KEY, env.API_SECRET, {
    identity: identity,
    name: input.name
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

  let url = input.wsUrl;

  if (!url) {
    const clientIp = requestIp.getClientIp(req) || undefined;
    url = await token.getWsUrl(clientIp);
  }

  await createTokenForAgent(slug, url, input.language || 'en', identity, "dmeet");

  res.status(200).json({
    identity,
    url,
    token: token.toJwt(),
    slug,
    roomName: input.roomName,
    isAdmin: true
  });
}

export const createTokenForAgent = async (slug: string, url: string, language: string, admin: string, agent: string) => {
  if (!process.env.CREATE_AI_AGENT_ENDPOINT) {
    throw new Error("CREATE_AI_AGENT_ENDPOINT is not defined");
  }

  const token = new AccessToken(env.API_KEY, env.API_SECRET, {
    identity: "ai_agent",
    name: "AI Agent"
  });

  token.addGrant({
    room: slug,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    roomAdmin: true
  });

  await axios.post(process.env.CREATE_AI_AGENT_ENDPOINT, {
    token: token.toJwt(),
    url: url,
    language: language,
    admin: admin,
    agent: agent,
  });
}
