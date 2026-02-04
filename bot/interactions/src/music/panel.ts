import {
  Locale,
  SlashCommandBuilder,
  InteractionContextType,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";

export const panel: SlashCommand<"cached"> = {
  definition: new SlashCommandBuilder()
    .setName("panel")
    .setNameLocalizations({
      [Locale.ChineseCN]: "面板",
      [Locale.ChineseTW]: "面板",
    })
    .setDescription("Player control panel")
    .setDescriptionLocalizations({
      [Locale.ChineseCN]: "播放器控制面板",
      [Locale.ChineseTW]: "播放器控制面板",
    })
    .setContexts(InteractionContextType.Guild),

  async chatInputCommand(interaction) {
    const player = await interaction.guild.player;

    let message;
    if (interaction.replied || interaction.deferred) {
      message = await interaction.editReply({
        components: actionrow.panel(interaction.getLocale()),
      });
    } else {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      message = (
        await interaction.reply({
          components: actionrow.panel(interaction.getLocale()),
          withResponse: true,
        })
      ).resource!.message!;
    }

    player.panel.enable(message);
  },

  async messageComponent(interaction) {
    await interaction.update({});

    const player = await interaction.guild.player;
    player.panel.enable(interaction.message);

    if (interaction.isStringSelectMenu()) {
      switch (interaction.customId as CustomId) {
        case CustomId.Mode:
          player.queue.mode = Number(interaction.values[0]);
          break;

        case CustomId.Oper:
          await player.queue.clear(interaction.values[0] as never);
          if (interaction.values[0] === "Current") {
            player.queue.index--;
            await player.next();
          }
          break;
      }

      await player.panel.update();
    } else {
      switch (interaction.customId as CustomId) {
        case CustomId.Close:
          if (interaction.message.id === player.panel.message?.id) {
            player.pause();
            interaction.member.voice.leave();
            player.panel.disable();
          }
          return;

        case CustomId.Leave:
          interaction.member.voice.leave();
          return;

        case CustomId.Join:
          interaction.member.voice.join();
          return;

        case CustomId.Queue:
          if (player.panel.mode === player.PanelMode.Queue) {
            player.panel.mode = player.PanelMode.Audio;
          } else {
            player.panel.mode = player.PanelMode.Queue;
          }
          await player.panel.update();
          return;

        case CustomId.Previous:
          await player.prev();
          return;

        case CustomId.PlayPause:
          if (player.player.isPlaying()) {
            player.pause();
          } else {
            await player.resume();
          }
          return;

        case CustomId.Next:
          await player.next();
          return;
      }
    }
  },
};

const actionrow = {
  panel: (locale: Locale) => [
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(CustomId.Mode)
        .setPlaceholder(i18n.SelectMode[locale])
        .addOptions([
          { label: `${i18n.Repeat[locale]} ${i18n.Off[locale]}`, value: "0" },
          { label: `${i18n.Repeat[locale]} ${i18n.All[locale]}`, value: "1" },
          { label: `${i18n.Repeat[locale]} ${i18n.One[locale]}`, value: "2" },
        ]),
    ),

    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(CustomId.Oper)
        .setPlaceholder(i18n.SelectOperation[locale])
        .addOptions([
          {
            label: `${i18n.Clear[locale]} ${i18n.Before[locale]}`,
            value: "Before",
          },
          {
            label: `${i18n.Clear[locale]} ${i18n.After[locale]}`,
            value: "After",
          },
          {
            label: `${i18n.Clear[locale]} ${i18n.Current[locale]}`,
            value: "Current",
          },
          { label: `${i18n.Clear[locale]} ${i18n.All[locale]}`, value: "All" },
        ]),
    ),

    new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Danger)
          .setEmoji("\u267b\ufe0f") // ♻️
          .setLabel(i18n.ButtonClose[locale])
          .setCustomId(CustomId.Close),
      )
      .addComponents(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("\u2716\ufe0f") // ✖️
          .setLabel(i18n.ButtonLeave[locale])
          .setCustomId(CustomId.Leave),
      )
      .addComponents(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("\u2795") // ➕
          .setLabel(i18n.ButtonJoin[locale])
          .setCustomId(CustomId.Join),
      )
      .addComponents(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Primary)
          .setEmoji("\u2139\ufe0f") // ℹ️
          .setLabel(i18n.ButtonQueue[locale])
          .setCustomId(CustomId.Queue),
      ),
    new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Primary)
          .setEmoji("\u23ee\ufe0f") // ⏮️
          .setLabel(i18n.ButtonPrevious[locale])
          .setCustomId(CustomId.Previous),
      )
      .addComponents(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Primary)
          .setEmoji("\u23ef\ufe0f") // ⏯️
          .setLabel(i18n.ButtonPlayPause[locale])
          .setCustomId(CustomId.PlayPause),
      )
      .addComponents(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Primary)
          .setEmoji("\u23ed\ufe0f") // ⏭️
          .setLabel(i18n.ButtonNext[locale])
          .setCustomId(CustomId.Next),
      ),
  ],
};

enum CustomId {
  Mode = "panel.MODE",
  Oper = "panel.OPER",

  Close = "panel.CLOSE",
  Leave = "panel.LEAVE",
  Join = "panel.JOIN",
  Queue = "panel.QUEUE",
  Previous = "panel.PREV",
  PlayPause = "panel.PLAY_PAUSE",
  Next = "panel.NEXT",

  // TODO: Volume control
}

const i18n = i18nWrapper({
  // Panel components
  SelectMode: {
    [Locale.EnglishUS]: "Select mode",
    [Locale.ChineseTW]: "選擇模式",
  },
  SelectOperation: {
    [Locale.EnglishUS]: "Select operation",
    [Locale.ChineseTW]: "選擇操作",
  },
  ButtonClose: {
    [Locale.EnglishUS]: "Close",
    [Locale.ChineseTW]: "關閉",
  },
  ButtonLeave: {
    [Locale.EnglishUS]: "Leave",
    [Locale.ChineseTW]: "離開",
  },
  ButtonJoin: {
    [Locale.EnglishUS]: "Join",
    [Locale.ChineseTW]: "加入",
  },
  ButtonQueue: {
    [Locale.EnglishUS]: "Queue",
    [Locale.ChineseTW]: "佇列",
  },
  ButtonPrevious: {
    [Locale.EnglishUS]: "Previous",
    [Locale.ChineseTW]: "上一首",
  },
  ButtonPlayPause: {
    [Locale.EnglishUS]: "Play/Pause",
    [Locale.ChineseTW]: "播放／暫停",
  },
  ButtonNext: {
    [Locale.EnglishUS]: "Next",
    [Locale.ChineseTW]: "下一首",
  },

  // Panel select
  Repeat: {
    [Locale.EnglishUS]: "Repeat",
    [Locale.ChineseTW]: "重複",
  },
  Off: {
    [Locale.EnglishUS]: "Off",
    [Locale.ChineseTW]: "關閉",
  },
  All: {
    [Locale.EnglishUS]: "All",
    [Locale.ChineseTW]: "所有",
  },
  One: {
    [Locale.EnglishUS]: "One",
    [Locale.ChineseTW]: "單曲",
  },

  Clear: {
    [Locale.EnglishUS]: "Clear",
    [Locale.ChineseTW]: "清空",
  },
  Before: {
    [Locale.EnglishUS]: "Before",
    [Locale.ChineseTW]: "已播放",
  },
  After: {
    [Locale.EnglishUS]: "After",
    [Locale.ChineseTW]: "未播放",
  },
  Current: {
    [Locale.EnglishUS]: "Current",
    [Locale.ChineseTW]: "當前",
  },
});
