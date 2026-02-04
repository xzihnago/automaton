import type { BotEvents } from "./types.js";
import { Events } from "discord.js";
import { logger, LogCategory } from "@automaton/logger";
import commands from "@automaton/messages";

export const messageCreate: BotEvents<Events.MessageCreate> = {
  once: false,
  event: Events.MessageCreate,
  callback: async (message) => {
    if (message.author.id === message.client.user.id) return;

    await commands
      .filter((command) => command.pattern.test(message.content))
      .map((command) => {
        logger.debug(`Trigger chat "${command.name}"`, {
          category: LogCategory.Client,
        });
        return command.callback(message as never);
      })
      .awaitAll();
  },
};
