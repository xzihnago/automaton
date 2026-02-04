import { Client, GatewayIntentBits } from "discord.js";
import "@automaton/extension";
import { logger, LogCategory } from "@automaton/logger";
import events from "@automaton/events";
import interactions from "@automaton/interactions";

logger.debug("Initialize", { category: LogCategory.Client });
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

events.forEach((event) => {
  logger.debug(`Add Event<${event.event}> listener`, {
    category: LogCategory.Client,
  });

  if (event.once) {
    client.once(event.event, event.callback as never);
  } else {
    client.on(event.event, event.callback as never);
  }
});

client.commands = {};
Object.entries(interactions).forEach(([name, interaction]) => {
  logger.debug(`Register Interaction<${name}>`, {
    category: LogCategory.Client,
  });
  client.commands[name] = interaction;
});

logger.info("Login", { category: LogCategory.Client });
await client.login(process.env.DISCORD_TOKEN);
