import {
  Locale,
  SlashCommandBuilder,
  InteractionContextType,
  inlineCode,
} from "discord.js";

export const player: SlashCommand<"cached"> = {
  definition: new SlashCommandBuilder()
    .setName("player")
    .setNameLocalizations({
      [Locale.ChineseCN]: "播放器",
      [Locale.ChineseTW]: "播放器",
    })
    .setDescription("Player operation")
    .setDescriptionLocalizations({
      [Locale.ChineseCN]: "播放器操作",
      [Locale.ChineseTW]: "播放器操作",
    })
    .setContexts(InteractionContextType.Guild)

    .addSubcommand((subcommand) =>
      subcommand
        .setName("stop")
        .setNameLocalizations({
          [Locale.ChineseCN]: "停止",
          [Locale.ChineseTW]: "停止",
        })
        .setDescription("Stop player")
        .setDescriptionLocalizations({
          [Locale.ChineseCN]: "停止播放音乐",
          [Locale.ChineseTW]: "停止播放音樂",
        }),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("pause")
        .setNameLocalizations({
          [Locale.ChineseCN]: "暂停",
          [Locale.ChineseTW]: "暫停",
        })
        .setDescription("Pause player")
        .setDescriptionLocalizations({
          [Locale.ChineseCN]: "暂停音乐",
          [Locale.ChineseTW]: "暫停音樂",
        }),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("resume")
        .setNameLocalizations({
          [Locale.ChineseCN]: "继续",
          [Locale.ChineseTW]: "繼續",
        })
        .setDescription("Resume player")
        .setDescriptionLocalizations({
          [Locale.ChineseCN]: "继续播放音乐",
          [Locale.ChineseTW]: "繼續播放音樂",
        }),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("previous")
        .setNameLocalizations({
          [Locale.ChineseCN]: "上一首",
          [Locale.ChineseTW]: "上一首",
        })
        .setDescription("Play previous")
        .setDescriptionLocalizations({
          [Locale.ChineseCN]: "播放上一首音乐",
          [Locale.ChineseTW]: "播放上一首音樂",
        }),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("next")
        .setNameLocalizations({
          [Locale.ChineseCN]: "下一首",
          [Locale.ChineseTW]: "下一首",
        })
        .setDescription("Play next")
        .setDescriptionLocalizations({
          [Locale.ChineseCN]: "播放下一首音乐",
          [Locale.ChineseTW]: "播放下一首音樂",
        }),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("volume")
        .setNameLocalizations({
          [Locale.ChineseCN]: "音量",
          [Locale.ChineseTW]: "音量",
        })
        .setDescription("Set volume")
        .setDescriptionLocalizations({
          [Locale.ChineseCN]: "设置音量",
          [Locale.ChineseTW]: "設置音量",
        })
        .addNumberOption((option) =>
          option
            .setName("level")
            .setNameLocalizations({
              [Locale.ChineseCN]: "等级",
              [Locale.ChineseTW]: "等級",
            })
            .setDescription("Volume level (0.0 - 1.0)")
            .setDescriptionLocalizations({
              [Locale.ChineseCN]: "音量等级 (0.0 - 1.0)",
              [Locale.ChineseTW]: "音量等級 (0.0 - 1.0)",
            })
            .setMinValue(0)
            .setMaxValue(1)
            .setRequired(true),
        ),
    ),

  async chatInputCommand(interaction) {
    const player = await interaction.guild.player;

    switch (interaction.options.getSubcommand(true)) {
      case "pause":
        player.pause();
        await interaction.reply(i18n.AudioPause[interaction.locale]);
        return;

      case "resume":
        {
          if (!player.connection) {
            await interaction.reply(i18n.NotInVoiceChannel[interaction.locale]);
            return;
          }

          const ainfo = await player.resume();
          if (ainfo) {
            await interaction.reply(
              i18n.AudioResume[interaction.locale] + inlineCode(ainfo.title),
            );
          } else {
            await interaction.reply(i18n.QueueEmpty[interaction.locale]);
          }
        }
        return;

      case "previous":
        {
          if (!player.connection) {
            await interaction.reply(i18n.NotInVoiceChannel[interaction.locale]);
            return;
          }

          const ainfo = await player.prev();
          if (ainfo) {
            await interaction.reply(
              i18n.AudioPlay[interaction.locale] + inlineCode(ainfo.title),
            );
          } else {
            await interaction.reply(i18n.QueueEmpty[interaction.locale]);
          }
        }
        return;

      case "next":
        {
          if (!player.connection) {
            await interaction.reply(i18n.NotInVoiceChannel[interaction.locale]);
            return;
          }

          const ainfo = await player.next();
          if (ainfo) {
            await interaction.reply(
              i18n.AudioPlay[interaction.locale] + inlineCode(ainfo.title),
            );
          } else {
            await interaction.reply(i18n.QueueEmpty[interaction.locale]);
          }
        }
        return;

      case "volume": {
        const level = interaction.options.getNumber("level", true);
        player.volume = level;
        await interaction.reply(
          i18n.VolumeSet[interaction.locale] + inlineCode(String(level)),
        );
        return;
      }
    }
  },
};

const i18n = i18nWrapper({
  NotInVoiceChannel: {
    [Locale.EnglishUS]: "Bot is not in a voice channel",
    [Locale.ChineseTW]: "機器人不在語音頻道中",
  },
  QueueEmpty: {
    [Locale.EnglishUS]: "Queue is empty",
    [Locale.ChineseTW]: "佇列為空",
  },

  AudioPause: {
    [Locale.EnglishUS]: "Audio paused",
    [Locale.ChineseTW]: "已暫停播放",
  },
  AudioResume: {
    [Locale.EnglishUS]: "Resuming playback ",
    [Locale.ChineseTW]: "繼續播放 ",
  },
  AudioPlay: {
    [Locale.EnglishUS]: "Play ",
    [Locale.ChineseTW]: "播放 ",
  },

  VolumeSet: {
    [Locale.EnglishUS]: "Volume set to ",
    [Locale.ChineseTW]: "音量設置為 ",
  },
});
