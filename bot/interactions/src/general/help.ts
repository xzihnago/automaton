import {
  Locale,
  SlashCommandBuilder,
  EmbedBuilder,
  inlineCode,
} from "discord.js";
import { logger, LogCategory } from "@automaton/logger";

export const help: SlashCommand = {
  definition: new SlashCommandBuilder()
    .setName("help")
    .setNameLocalizations({
      [Locale.ChineseCN]: "帮助",
      [Locale.ChineseTW]: "幫助",
    })
    .setDescription("Show bot help")
    .setDescriptionLocalizations({
      [Locale.ChineseCN]: "显示机器人帮助",
      [Locale.ChineseTW]: "顯示機器人幫助",
    }),

  async chatInputCommand(interaction) {
    const wsRTT = interaction.client.ws.ping.toFixed();
    const msgRTT = (Date.now() - interaction.createdTimestamp).toFixed();

    logger.debug(`Gateway(${wsRTT}ms), Message(${msgRTT}ms)`, {
      category: LogCategory.Interaction,
    });

    const embed = new EmbedBuilder()
      .setColor(interaction.getColor())
      .setTitle("Help")
      .setFields([]);

    await interaction.reply({ embeds: [embed] });
  },
};
