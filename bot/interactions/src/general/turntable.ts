import { Locale, SlashCommandBuilder } from "discord.js";

export const turntable: SlashCommand = {
  definition: new SlashCommandBuilder()
    .setName("turntable")
    .setNameLocalizations({
      [Locale.ChineseCN]: "转盘",
      [Locale.ChineseTW]: "轉盤",
    })
    .setDescription("Turntable")
    .setDescriptionLocalizations({
      [Locale.ChineseCN]: "转盘",
      [Locale.ChineseTW]: "轉盤",
    }),

  chatInputCommand: async (interaction) => {
    const table = [
      1, 3, 1, 5, 1, 3, 1, 10, 1, 3, 1, 5, 1, 5, 3, 1, 10, 1, 3, 1, 5, 1, 3, 1,
      20,
    ];

    const result = table[Math.floor(Math.random() * table.length)];
    await interaction.reply(result.toFixed());
  },
};
