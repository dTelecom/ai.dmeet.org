import { WebhookReceiver } from "@dtelecom/server-sdk-js";
import type { NextApiRequest, NextApiResponse } from "next";
import jwt_decode from "jwt-decode";
import { getNodeByAddress } from "@dtelecom/server-sdk-js/dist/contract/contract";

export interface JwtKey {
  iss: string;
  video: {
    roomAdmin: boolean;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST" && req.headers.authorization) {
    const jwt = jwt_decode<JwtKey>(req.headers.authorization);

    const node = await getNodeByAddress(jwt.iss);

    if (!node) {
      throw new Error("node not found");
    }

    const receiver = new WebhookReceiver(jwt.iss, node.key.replace("0x", ""));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const event = receiver.receive(req.body, req.headers.authorization);

    console.log(event);
  }
  res.status(200).send("ok");
}
