import type { BotEvents } from "./types.js";
import { Events } from "discord.js";
import { scheduleJob } from "node-schedule";
import { prisma } from "@automaton/database";
import { logger, LogCategory } from "@automaton/logger";
import tasks from "@automaton/tasks";
import commands from "@automaton/interactions";

export const ready: BotEvents<Events.ClientReady> = {
  once: true,
  event: Events.ClientReady,
  callback: async (client) => {
    await client.application.fetch();
    logger.info(`Logged in as "${client.user.tag}" (ID: ${client.user.id})`, {
      category: LogCategory.Client,
    });

    await client.guilds.cache
      .map((guild) => {
        logger.debug(`Found guild "${guild.name}" (ID: ${guild.id})`, {
          category: LogCategory.Client,
        });

        return prisma.guild.upsert({
          where: { guildId: guild.id },
          create: { guildId: guild.id },
          update: {},
        });
      })
      .awaitAll();

    tasks.forEach((task) => {
      logger.debug(`Load task "${task.name}" (${task.cron})`, {
        category: LogCategory.Task,
      });
      scheduleJob(task.cron, async () => {
        logger.info(`Execute task "${task.name}"`, {
          category: LogCategory.Task,
        });
        await task.callback(client);
      });
    });

    await Object.entries(commands)
      .filter(([, command]) => command.initialize)
      .map(([name, command]) => {
        logger.info(`Initialize command "${name}"`, {
          category: LogCategory.Client,
        });
        try {
          return command.initialize?.(client);
        } catch (error) {
          logger.error(error as Error, { category: LogCategory.Client });
        }
      })
      .awaitAll();
  },
};
