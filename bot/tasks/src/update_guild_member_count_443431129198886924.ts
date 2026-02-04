import type { Task } from "./types";
import { logger, LogCategory } from "@automaton/logger";

export const updateGuildMemberCount443431129198886924: Task = {
  name: "updateGuildMemberCount-443431129198886924",
  cron: "0 * * * * *", // Every minute
  callback: async (client) => {
    const guild = client.guilds.resolve("443431129198886924");
    if (!guild) {
      logger.warn("Guild(443431129198886924) not found", {
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

    await guild.channels
      .resolve("1462291734456172554")
      ?.setName(
        `伺服器人數：${guild.memberCount.toFixed()}┃語音人數：${audioCount.toFixed()}`,
      );
  },
};
