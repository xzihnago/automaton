import {
  Locale,
  SlashCommandBuilder,
  EmbedBuilder,
  inlineCode,
} from "discord.js";
import { logger, LogCategory } from "@automaton/logger";

export const ping: SlashCommand = {
  definition: new SlashCommandBuilder()
    .setName("ping")
    .setNameLocalizations({
      [Locale.ChineseCN]: "延迟",
      [Locale.ChineseTW]: "延遲",
    })
    .setDescription("Show bot ping")
    .setDescriptionLocalizations({
      [Locale.ChineseCN]: "显示机器人延迟",
      [Locale.ChineseTW]: "顯示機器人延遲",
    }),

  async chatInputCommand(interaction) {
    const wsRTT = interaction.client.ws.ping.toFixed();
    const msgRTT = (Date.now() - interaction.createdTimestamp).toFixed();

    logger.debug(`Gateway(${wsRTT}ms), Message(${msgRTT}ms)`, {
      category: LogCategory.Interaction,
    });

    const embed = new EmbedBuilder()
      .setColor(interaction.getColor())
      .setTitle("Client Latency")
      .setFields([
        {
          name: "Gateway",
          value: inlineCode(`${wsRTT}ms`),
          inline: true,
        },
        {
          name: "Message",
          value: inlineCode(`${msgRTT}ms`),
          inline: true,
        },
      ]);

    await interaction.reply({ embeds: [embed] });
  },
};
