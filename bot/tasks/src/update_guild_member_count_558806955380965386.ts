import type { Task } from "./types";
import { logger, LogCategory } from "@automaton/logger";

export const updateGuildMemberCount558806955380965386: Task = {
  name: "updateGuildMemberCount-558806955380965386",
  cron: "0/6 * * * *", // Every 6 minutes
  callback: async (client) => {
    const guild = client.guilds.resolve("558806955380965386");
    if (!guild) {
      logger.warn("Guild(558806955380965386) not found", {
        category: LogCategory.Task,
      });
      return;
    }

    let audioCount = 0;
    for (const channel of guild.channels.cache.values()) {
      if (channel.isVoiceBased()) {
        audioCount += channel.members.size;
      }
    }

    const channel = guild.channels.resolve("1202908225335328768");
    const name = `伺服器人數：${guild.memberCount.toFixed()}┃語音人數：${audioCount.toFixed()}`;

    if (channel?.name !== name) await channel?.setName(name);
  },
};
