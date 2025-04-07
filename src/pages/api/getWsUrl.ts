import { AccessToken } from "@dtelecom/server-sdk-js";
import type { NextApiRequest, NextApiResponse } from "next";
import requestIp from "request-ip";

export interface IGetWsUrl {
  wsUrl: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const clientIp = requestIp.getClientIp(req) || undefined;
    const token = new AccessToken();
    const wsUrl = await token.getWsUrl(clientIp);

    res.status(200).json({
      wsUrl,
      clientIp: clientIp || null,
    });
  } catch (error) {
    console.error("Error in getWsUrl API:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
