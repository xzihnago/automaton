import {
  Locale,
  SlashCommandBuilder,
  InteractionContextType,
  MessageFlags,
} from "discord.js";

export const voice: SlashCommand<"cached"> = {
  definition: new SlashCommandBuilder()
    .setName("voice")
    .setNameLocalizations({
      [Locale.ChineseCN]: "语音",
      [Locale.ChineseTW]: "語音",
    })
    .setDescription("Voice commands")
    .setDescriptionLocalizations({
      [Locale.ChineseCN]: "语音指令",
      [Locale.ChineseTW]: "語音指令",
    })
    .setContexts(InteractionContextType.Guild)

    .addSubcommand((subcommand) =>
      subcommand
        .setName("join")
        .setNameLocalizations({
          [Locale.ChineseCN]: "加入",
          [Locale.ChineseTW]: "加入",
        })
        .setDescription("Join bot to voice channel")
        .setDescriptionLocalizations({
          [Locale.ChineseCN]: "将机器人加入语音频道",
          [Locale.ChineseTW]: "將機器人加入語音頻道",
        }),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("leave")
        .setNameLocalizations({
          [Locale.ChineseCN]: "离开",
          [Locale.ChineseTW]: "離開",
        })
        .setDescription("Leave bot from voice channel")
        .setDescriptionLocalizations({
          [Locale.ChineseCN]: "将机器人离开语音频道",
          [Locale.ChineseTW]: "將機器人離開語音頻道",
        }),
    ),

  async chatInputCommand(interaction) {
    const voice = interaction.member.voice;

    switch (interaction.options.getSubcommand(true)) {
      case "join":
        await interaction.reply({
          content: voice.join()
            ? i18n.JoinedVoice[interaction.locale]
            : i18n.CannotJoinVoiceChannel[interaction.locale],
          flags: MessageFlags.Ephemeral,
        });
        return;

      case "leave":
        await interaction.reply({
          content: voice.leave()
            ? i18n.LeftVoice[interaction.locale]
            : i18n.CannotLeaveVoiceChannel[interaction.locale],
          flags: MessageFlags.Ephemeral,
        });
        return;
    }
  },
};

const i18n = i18nWrapper({
  CannotJoinVoiceChannel: {
    [Locale.EnglishUS]: "Cannot join voice channel",
    [Locale.ChineseCN]: "无法加入语音频道",
    [Locale.ChineseTW]: "無法加入語音頻道",
  },
  CannotLeaveVoiceChannel: {
    [Locale.EnglishUS]: "Cannot leave voice channel",
    [Locale.ChineseCN]: "无法离开语音频道",
    [Locale.ChineseTW]: "無法離開語音頻道",
  },
  JoinedVoice: {
    [Locale.EnglishUS]: "Joined voice channel",
    [Locale.ChineseCN]: "已加入语音频道",
    [Locale.ChineseTW]: "已加入語音頻道",
  },
  LeftVoice: {
    [Locale.EnglishUS]: "Left voice channel",
    [Locale.ChineseCN]: "已离开语音频道",
    [Locale.ChineseTW]: "已離開語音頻道",
  },
});
