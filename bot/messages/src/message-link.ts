import type { ChatCommand } from "./types.js";
import { EmbedBuilder } from "discord.js";

export const messageLink: ChatCommand<true> = {
  pattern: /https:\/\/discord\.com\/channels\/\d+\/\d+\/\d+/,
  name: "message-link",
  callback: async (message) => {
    const embeds = await Array.from(
      message.content.matchAll(/(\d+)\/\d+\/(\d+)/g),
      async ([, guildId, messageId]) => {
        if (!message.client.guilds.resolve(guildId)) {
          return [];
        }

        const msg =
          message.channel.messages.resolve(messageId) ??
          (await message.channel.messages.fetch(messageId));

        if (msg.content) {
          return [
            new EmbedBuilder()
              .setColor(msg.getColor())
              .setAuthor({
                name: msg.author.displayName,
                iconURL: msg.author.displayAvatarURL(),
              })
              .setDescription(msg.content)
              .setTimestamp(msg.createdTimestamp),
            ...msg.embeds,
          ];
        } else {
          return msg.embeds;
        }
      },
    )
      .awaitAll()
      .then((embeds) => embeds.flat().slice(0, 10));

    if (embeds.length) {
      await message.reply({ embeds });
    }
  },
};
