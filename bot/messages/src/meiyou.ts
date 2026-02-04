import type { ChatCommand } from "./types.js";

const meiyouRecords: Record<string, number> = {};

export const meiyou: ChatCommand<true> = {
  pattern: /.*/,
  name: "meiyou",
  callback: async (message) => {
    if (message.content === "沒有") {
      meiyouRecords[message.channelId] =
        ((meiyouRecords[message.channelId] as number | undefined) ?? 0) + 1;
      if (meiyouRecords[message.channelId] < 3) return;

      await message.channel.send("通過");
    }

    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete meiyouRecords[message.channelId];
  },
};
