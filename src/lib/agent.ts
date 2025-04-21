const { AccessToken } = require("@dtelecom/server-sdk-js");
import axios from 'axios';

export const createTokenForAgent = async (slug: string, url: string, language: string, admin: string, agent: string) => {
  if (!process.env.CREATE_AI_AGENT_ENDPOINT) {
    throw new Error("CREATE_AI_AGENT_ENDPOINT is not defined");
  }

  const token = new AccessToken(process.env.API_KEY, process.env.API_SECRET, {
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
};
