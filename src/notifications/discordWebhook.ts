import { WebhookClient } from "discord.js";

const sendSuccess = async (message: string) => {

  if (!process.env.DISCORD_WEBHOOK_URL) {
    return
  }

  const webhook = new WebhookClient({url: process.env.DISCORD_WEBHOOK_URL});
  await webhook.send(message);
  webhook.destroy();
}

export {sendSuccess}