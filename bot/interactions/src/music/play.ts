import {
  Locale,
  SlashCommandBuilder,
  InteractionContextType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  inlineCode,
  hyperlink,
} from "discord.js";
import audio from "@automaton/audio";

export const play: SlashCommand<"cached"> = {
  definition: new SlashCommandBuilder()
    .setName("play")
    .setNameLocalizations({
      [Locale.ChineseCN]: "播放",
      [Locale.ChineseTW]: "播放",
    })
    .setDescription("Play audio resource from url")
    .setDescriptionLocalizations({
      [Locale.ChineseTW]: "播放音樂",
    })
    .setContexts(InteractionContextType.Guild)

    .addStringOption((option) =>
      option
        .setName("url")
        .setNameLocalizations({
          [Locale.ChineseCN]: "链接",
          [Locale.ChineseTW]: "連結",
        })
        .setDescription("Link of audio resource")
        .setDescriptionLocalizations({
          [Locale.ChineseCN]: "音乐链接",
          [Locale.ChineseTW]: "音樂連結",
        })
        .setRequired(true),
    ),

  async chatInputCommand(interaction) {
    if (!interaction.member.voice.join()) {
      await interaction.reply(i18n.CannotJoinVoiceChannel[interaction.locale]);
      return;
    }

    const url = interaction.options.getString("url", true);
    const player = await interaction.guild.player;

    if (audio.isPlaylist(url)) {
      const playlist = await audio.getPlaylist(url);

      if (!audio.isVideo(url)) {
        void player.queue.add(playlist).then(() => player.resume());
        await interaction.client.commands.panel.chatInputCommand(interaction);
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(interaction.getColor())
        .setTitle(i18n.PlaylistDiscovered[interaction.locale])
        .setFooter({
          text: `${i18n.Total[interaction.locale]} ${playlist.length.toFixed()}`,
        })
        .addFields(
          playlist.slice(0, 10).map((ainfo, index) => ({
            name: `No. ${(index + 1).toFixed()}`,
            value: [
              hyperlink(ainfo.title, ainfo.url),
              `${i18n.Channel[interaction.locale]} - ${hyperlink(ainfo.channelName, ainfo.channelUrl)}`,
              `${i18n.Duration[interaction.locale]} - ${inlineCode(ainfo.duration.toTimeString())}`,
            ].join("\n"),
          })),
        );
      if (playlist.length > 10) {
        embed.addFields({ name: "...", value: "..." });
      }

      const reply = await interaction.reply({
        embeds: [embed],
        components: actionrow.confirm(interaction.getLocale()),
        withResponse: true,
      });

      const collector = interaction.channel
        ?.createMessageComponentCollector({
          componentType: ComponentType.Button,
          filter: (collector) =>
            reply.resource?.message?.id === collector.message.id,
          time: 60000,
        })
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        .on("end", async (_, reason) => {
          if (reason === "time") {
            void interaction.deleteReply();
            return;
          }

          void player.queue
            .add(reason === "YES" ? playlist : await audio.getInfo(url))
            .then(() => player.resume());

          void interaction.client.commands.panel.chatInputCommand(interaction);
        });

      collector?.on("collect", (button) => {
        void button.update({});
        collector.stop(button.customId.split(".").pop());
      });
    } else if (audio.isVideo(url)) {
      const ainfo = await audio.getInfo(url);
      void player.queue.add(ainfo).then(() => player.resume());

      await interaction.reply(
        `${i18n.Added[interaction.locale]} ${inlineCode(ainfo.title)} ${i18n.ToQueue[interaction.locale]}`,
      );
      await interaction.client.commands.panel.chatInputCommand(interaction);
    } else {
      const sInfo = await audio.search(url);

      const embed = new EmbedBuilder()
        .setColor(interaction.getColor())
        .setTitle(i18n.SearchResults[interaction.locale])
        .addFields(
          sInfo.map((ainfo, index) => ({
            name: `No. ${(index + 1).toFixed()}`,
            value: [
              hyperlink(ainfo.title, ainfo.url),
              `${i18n.Duration[interaction.locale]} - ${inlineCode(ainfo.duration.toTimeString())}`,
              `${i18n.Channel[interaction.locale]} - ${hyperlink(ainfo.channelName, ainfo.channelUrl)}`,
            ].join("\n"),
          })),
        );

      const reply = await interaction.reply({
        embeds: [embed],
        components: actionrow.number(sInfo.length),
        withResponse: true,
      });

      const collector = interaction.channel
        ?.createMessageComponentCollector({
          componentType: ComponentType.Button,
          filter: (collector) =>
            reply.resource?.message?.id === collector.message.id,
          time: 60000,
        })
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        .on("end", async (_, reason) => {
          if (reason === "time") {
            void interaction.deleteReply();
          } else {
            const url = sInfo[Number(reason)].url;
            void player.queue
              .add(await audio.getInfo(url))
              .then(() => player.resume());

            void interaction.client.commands.panel.chatInputCommand(
              interaction,
            );
          }
        });

      collector?.on("collect", (button) => {
        void button.update({});
        collector.stop(button.customId.split(".").pop());
      });
    }
  },
};

const actionrow = {
  confirm: (locale: Locale) => [
    new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Primary)
          .setEmoji("\u274c")
          .setLabel(i18n.Ignore[locale])
          .setCustomId("play.NO"),
      )
      .addComponents(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Primary)
          .setEmoji("\u2b55")
          .setLabel(i18n.Confirm[locale])
          .setCustomId("play.YES"),
      ),
  ],

  number: (count: number) => {
    const row = [
      new ActionRowBuilder<ButtonBuilder>(),
      new ActionRowBuilder<ButtonBuilder>(),
    ];
    for (let i = 0; i < count; ++i) {
      row[Math.floor(i / 5)].addComponents(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Primary)
          .setLabel((i + 1).toFixed())
          .setCustomId(`play.${i.toFixed()}`),
      );
    }
    if (count <= 5) row.pop();
    return row;
  },
};

const i18n = i18nWrapper({
  // Exceptions
  CannotJoinVoiceChannel: {
    [Locale.EnglishUS]: "Cannot join voice channel",
    [Locale.ChineseTW]: "無法加入語音頻道",
  },

  // Player
  SearchResults: {
    [Locale.EnglishUS]: "Search results",
    [Locale.ChineseTW]: "搜尋結果",
  },
  PlaylistDiscovered: {
    [Locale.EnglishUS]: "Playlist discovered",
    [Locale.ChineseTW]: "發現播放清單",
  },
  Total: {
    [Locale.EnglishUS]: "Total",
    [Locale.ChineseTW]: "共",
  },
  Added: {
    [Locale.EnglishUS]: "Added",
    [Locale.ChineseTW]: "已加入",
  },
  ToQueue: {
    [Locale.EnglishUS]: "to queue",
    [Locale.ChineseTW]: "至佇列",
  },
  Channel: {
    [Locale.EnglishUS]: "Channel",
    [Locale.ChineseTW]: "頻道",
  },
  Duration: {
    [Locale.EnglishUS]: "Duration",
    [Locale.ChineseTW]: "時長",
  },

  // Text
  Confirm: {
    [Locale.EnglishUS]: "Confirm",
    [Locale.ChineseTW]: "確認",
  },
  Ignore: {
    [Locale.EnglishUS]: "Ignore",
    [Locale.ChineseTW]: "忽略",
  },
});
