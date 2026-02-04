import {
  type Message,
  Locale,
  Guild,
  EmbedBuilder,
  inlineCode,
  time,
  TimestampStyles,
  hyperlink,
} from "discord.js";
import {
  type AudioPlayer,
  type AudioResource,
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  demuxProbe,
  getVoiceConnection,
} from "@discordjs/voice";
import { prisma } from "@automaton/database";
import { logger, LogCategory } from "@automaton/logger";
import audio, { FullAudioInfo, type AudioInfo } from "@automaton/audio";

declare module "discord.js" {
  interface Guild {
    _playerPromise?: Promise<GuildVoice>;
    player: Promise<GuildVoice>;
  }
}

Object.defineProperty(Guild.prototype, "player", {
  get(this: Guild) {
    return (this._playerPromise ??= GuildVoice.create(this).catch(
      (err: unknown) => {
        this._playerPromise = undefined;
        throw err;
      },
    ));
  },
});

class GuildVoice {
  readonly PanelMode = PanelMode;

  readonly player: AudioPlayer;
  private _resource: AudioResource | null;

  constructor(
    readonly guild: Guild,
    readonly queue: GuildVoiceQueue,
    readonly panel: GuildVoicePanel,
    private _id: string,
    private _volume: number,
  ) {
    this.player = createAudioPlayer();
    this.player.on(AudioPlayerStatus.Idle, () => void this.playNext());
    this._resource = null;
  }

  get volume() {
    return this._volume;
  }
  set volume(value: number) {
    this._volume = value;
    this._resource?.volume?.setVolume(this.volume);
    prisma.audioPlayer
      .update({
        where: { id: this._id },
        data: { volume: value },
      })
      .catch((err: unknown) => {
        logger.error(err as Error, {
          category: LogCategory.GuildVoice,
          guildId: this.guild.id,
        });
      });
  }

  get connection() {
    return getVoiceConnection(this.guild.id);
  }

  get subscription() {
    return this.connection?.subscribe(this.player);
  }

  get duration() {
    return this._resource?.playbackDuration ?? 0;
  }

  static async create(guild: Guild) {
    logger.info(`Initializing GuildVoice for guild "${guild.name}"`, {
      category: LogCategory.GuildVoice,
      guildId: guild.id,
    });

    const data = await prisma.audioPlayer.upsert({
      where: { guildId: guild.id },
      create: { guildId: guild.id },
      update: {},
      include: {
        queue: {
          select: {
            id: true,
          },
        },
      },
    });

    const queue = new GuildVoiceQueue(
      guild,
      data.id,
      data.queueMode,
      data.queueIndex,
      data.queue.length,
    );
    const panel = new GuildVoicePanel(guild, queue);
    const instance = new GuildVoice(guild, queue, panel, data.id, data.volume);

    return instance;
  }

  pause() {
    if (!this.player.isPlaying() || !this.subscription) return;

    logger.debug("Pausing playback", {
      category: LogCategory.GuildVoice,
      guildId: this.guild.id,
      channelId: this.connection?.joinConfig.channelId,
    });

    this.player.pause();
    setTimeout(
      () => {
        if (this.player.isPaused()) this.panel.disable();
      },
      10 * 60 * 1000,
    );
  }
  async resume() {
    if (this.queue.isEmpty() || this.player.isPlaying() || !this.subscription)
      return;

    logger.debug("Resuming playback", {
      category: LogCategory.GuildVoice,
      guildId: this.guild.id,
      channelId: this.connection?.joinConfig.channelId,
    });

    const ainfo = await this.queue.curr();
    if (this.player.isPaused()) {
      this.player.unpause();
    } else if (this._resource) {
      this.player.play(this._resource);
    } else if (ainfo) {
      void this.play(ainfo);
    }

    return ainfo;
  }

  async prev() {
    if (this.queue.isEmpty()) return;

    this.queue.rotate(-1);
    const ainfo = await this.queue.curr();
    if (ainfo && this.subscription) {
      void this.play(ainfo);
    }

    return ainfo;
  }
  async next() {
    if (this.queue.isEmpty()) return;

    this.queue.rotate(1);
    const ainfo = await this.queue.curr();
    if (ainfo && this.subscription) {
      void this.play(ainfo);
    }

    return ainfo;
  }

  private async play(ainfo: AudioInfo) {
    logger.debug(`Playing "${ainfo.title}"`, {
      category: LogCategory.GuildVoice,
      guildId: this.guild.id,
      channelId: this.connection?.joinConfig.channelId,
    });

    void audio.getInfo(ainfo.url).then((fullInfo) => {
      this.panel.fullInfo = fullInfo;
    });

    const stream = await audio.getStream(ainfo.url);
    const probeInfo = await demuxProbe(stream);
    this._resource = createAudioResource(probeInfo.stream, {
      inputType: probeInfo.type,
      inlineVolume: true,
    });
    this._resource.volume?.setVolume(this.volume);

    this.player.play(this._resource);
  }

  private async playNext() {
    if (!this.subscription) return;

    const aInfo = await this.queue.getNext();
    if (!aInfo) {
      logger.debug("No audio in queue, stopping playback", {
        category: LogCategory.GuildVoice,
        guildId: this.guild.id,
        channelId: this.connection?.joinConfig.channelId,
      });

      this._resource = null;
      setTimeout(() => {
        if (this.player.isIdle()) this.panel.disable();
      }, 60 * 1000);
      return;
    }

    await this.play(aInfo);
  }
}

class GuildVoiceQueue {
  constructor(
    readonly guild: Guild,
    private _id: string,
    private _mode: QueueMode,
    private _index: number,
    private _length: number,
  ) {}

  get mode() {
    return this._mode;
  }
  set mode(value: QueueMode) {
    this._mode = value;
    prisma.audioPlayer
      .update({
        where: { id: this._id },
        data: { queueMode: value },
      })
      .catch((err: unknown) => {
        logger.error(err as Error, {
          category: LogCategory.GuildVoice,
          guildId: this.guild.id,
        });
      });
  }

  get index() {
    return this._index;
  }
  set index(value: number) {
    this._index = value;
    prisma.audioPlayer
      .update({
        where: { id: this._id },
        data: { queueIndex: value },
      })
      .catch((err: unknown) => {
        logger.error(err as Error, {
          category: LogCategory.GuildVoice,
          guildId: this.guild.id,
        });
      });
  }

  get length() {
    return this._length;
  }

  isEmpty() {
    return this.length === 0;
  }
  isFirst() {
    return this.index === 0;
  }
  isLast() {
    return this.index === this.length - 1;
  }

  rotate(count: number) {
    if (this.isEmpty()) return;

    const offset = count % this.length;
    this.index = (this.index + this.length + offset) % this.length;
  }

  async items() {
    return await prisma.audioInfo
      .findMany({
        where: { playerId: this._id },
        orderBy: { createdAt: "asc" },
      })
      .catch((err: unknown) => {
        logger.error(err as Error, {
          category: LogCategory.GuildVoice,
          guildId: this.guild.id,
        });
        return [];
      });
  }

  async curr() {
    if (this.isEmpty()) return;

    const items = await this.items();
    return items[this.index];
  }
  async prev() {
    if (this.isEmpty()) return;

    const items = await this.items();
    switch (this.mode) {
      case QueueMode.Default:
        if (this.isFirst()) return;
        return items[this.index - 1];

      case QueueMode.RepeatAll:
      case QueueMode.RepeatSingle:
        return items[(this.index - 1 + this.length) % this.length];
    }
  }
  async next() {
    if (this.isEmpty()) return;

    const items = await this.items();
    switch (this.mode) {
      case QueueMode.Default:
        if (this.isLast()) return;
        return items[this.index + 1];

      case QueueMode.RepeatAll:
      case QueueMode.RepeatSingle:
        return items[(this.index + 1) % this.length];
    }
  }

  async add(audios: AudioInfo[] | AudioInfo) {
    if (!Array.isArray(audios)) audios = [audios];

    const detail = JSON.stringify(
      audios.map((a) => a.title),
      null,
      2,
    );
    logger.debug(
      `Adding ${audios.length.toFixed()} audio(s) to queue\n${detail}`,
      {
        category: LogCategory.GuildVoice,
        guildId: this.guild.id,
      },
    );

    await prisma.audioInfo.createMany({
      data: audios.map((ainfo) => ({
        playerId: this._id,
        url: ainfo.url,
        title: ainfo.title,
        channelName: ainfo.channelName,
        channelUrl: ainfo.channelUrl,
        duration: ainfo.duration,
      })),
    });
    this._length += audios.length;
  }

  async clear(target: QueueClearTarget) {
    if (this.isEmpty()) return;

    logger.debug(`Clear (${target})`, {
      category: LogCategory.GuildVoice,
      guildId: this.guild.id,
    });

    const items = await this.items();
    switch (target) {
      case QueueClearTarget.All:
        await prisma.audioInfo.deleteMany({ where: { playerId: this._id } });
        this._length = 0;
        this.index = 0;
        break;

      case QueueClearTarget.Before:
        await prisma.audioInfo.deleteMany({
          where: {
            id: { in: items.slice(0, this.index).map((item) => item.id) },
          },
        });
        this._length = items.length - this.index;
        this.index = 0;
        break;

      case QueueClearTarget.After:
        await prisma.audioInfo.deleteMany({
          where: {
            id: { in: items.slice(this.index + 1).map((item) => item.id) },
          },
        });
        this._length = this.index + 1;
        break;

      case QueueClearTarget.Current:
        await prisma.audioInfo.delete({
          where: {
            id: items[this.index].id,
          },
        });
        this._length = items.length - 1;
        this.index = Math.max(0, this.index - 1);
        break;
    }
  }

  async getNext() {
    if (this.isEmpty()) return;

    switch (this.mode) {
      case QueueMode.Default:
        if (this.isLast()) return;
        this.rotate(1);
        break;

      case QueueMode.RepeatAll:
        this.rotate(1);
        break;
    }

    return await this.curr();
  }
}

class GuildVoicePanel {
  private _mode: PanelMode;
  private _updater: NodeJS.Timeout | null;
  private _message: Message | null;

  fullInfo: FullAudioInfo | null;

  constructor(
    readonly guild: Guild,
    readonly queue: GuildVoiceQueue,
  ) {
    this._mode = PanelMode.Audio;
    this._updater = null;
    this._message = null;
    this.fullInfo = null;
  }

  get locale() {
    return this.guild.preferredLocale;
  }

  get mode() {
    return this._mode;
  }
  set mode(value: PanelMode) {
    logger.debug(`GuildVoicePanel mode set to ${PanelMode[value]}`, {
      category: LogCategory.GuildVoice,
      guildId: this.guild.id,
    });
    this._mode = value;
  }

  private get updater() {
    return this._updater;
  }
  private set updater(value: NodeJS.Timeout | null) {
    if (value) {
      this._updater = value;
    } else {
      clearInterval(this._updater as never);
      this._updater = null;
    }
  }

  get message() {
    return this._message;
  }
  set message(value: Message | null) {
    if (this._message?.id !== value?.id) {
      void this._message?.delete();
    }
    this._message = value;
  }

  isEnabled() {
    return Boolean(this.updater);
  }

  disable = () => {
    if (!this.isEnabled()) return;
    this.updater = null;
    this.message = null;

    logger.debug(`GuildVoicePanel disabled`, {
      category: LogCategory.GuildVoice,
      guildId: this.guild.id,
    });
  };

  enable = (message?: Message) => {
    this.message = message ?? this.message;

    if (this.isEnabled()) return;
    this.updater = setInterval(() => void this.update(), 2000);

    logger.debug(`GuildVoicePanel enabled`, {
      category: LogCategory.GuildVoice,
      guildId: this.guild.id,
    });
  };

  update = async () => {
    if (!this.message) return;

    let embed;
    switch (this.mode) {
      case PanelMode.Audio:
        embed = await this.infoEmbed();
        break;

      case PanelMode.Queue:
        embed = await this.queueEmbed();
        break;
    }
    if (!embed) return;

    if (Date.now() - this.message.createdTimestamp < 60 * 60 * 1000) {
      await this.message.edit({
        content: null,
        embeds: [embed],
      });
    } else if (this.message.channel.isSendable()) {
      this.message = await this.message.channel.send({
        embeds: [embed],
        components: this.message.components,
      });
    }
  };

  private infoEmbed = async () => {
    if (!this.message || !this.fullInfo) return;

    const now = this.fullInfo;
    const prev = await this.queue.prev();
    const next = await this.queue.next();

    const player = await this.guild.player;
    const duration = Math.floor(player.duration / 1000);
    const progressBar = this.makeProgressBar(
      now.duration,
      duration,
      Math.min(20, Math.floor(now.thumbnailWidth / 20)),
    );

    const playMode = `${i18n.Repeat[this.locale]}${[i18n.Off[this.locale], i18n.All[this.locale], i18n.One[this.locale]][this.queue.mode]}`;
    const queueIndex = `${i18n.Queue[this.locale]}${(this.queue.index + 1).toFixed()} / ${this.queue.length.toFixed()}`;

    return new EmbedBuilder()
      .setColor(this.message.getColor())
      .setTitle(now.title)
      .setURL(now.url)
      .setDescription(
        [
          inlineCode(duration.toTimeString()),
          progressBar,
          inlineCode(now.duration.toTimeString()),
        ].join(" "),
      )
      .setImage(now.thumbnailUrl)
      .addFields(
        {
          name: i18n.Channel[this.locale],
          value: hyperlink(now.channelName, now.channelUrl),
          inline: true,
        },
        {
          name: i18n.UploadDate[this.locale],
          value: time(now.publishedAt, TimestampStyles.ShortDate),
          inline: true,
        },
        {
          name: i18n.Previous[this.locale],
          value: prev
            ? hyperlink(prev.title, prev.url)
            : i18n.None[this.locale],
          inline: false,
        },
        {
          name: i18n.Next[this.locale],
          value: next
            ? hyperlink(next.title, next.url)
            : i18n.None[this.locale],
          inline: false,
        },
      )
      .setFooter({ text: `${playMode}\n${queueIndex}` });
  };

  private queueEmbed = async () => {
    if (!this.message || this.queue.isEmpty()) return;

    const items = await this.queue.items();

    const start = Math.max(0, this.queue.index - 3);
    const embed = new EmbedBuilder()
      .setColor(this.message.getColor())
      .setTitle(i18n.Queue[this.locale])
      .addFields(
        items.slice(start, this.queue.index + 4).map((ainfo, i) => ({
          name: [
            `No. ${(start + i + 1).toFixed()}`,
            this.queue.index === start + i
              ? `\u25b6\ufe0f ${i18n.NowPlaying[this.locale]}` // ▶️
              : undefined,
          ].join(" "),
          value: [
            hyperlink(ainfo.title, ainfo.url),
            `${i18n.Channel[this.locale]} - ${hyperlink(ainfo.channelName, ainfo.channelUrl)}`,
            `${i18n.Duration[this.locale]} - ${inlineCode(ainfo.duration.toTimeString())}`,
          ].join("\n"),
        })),
      );

    return embed;
  };

  private makeProgressBar = (
    total: number,
    current: number,
    length: number,
  ) => {
    const line = "\u25ac"; // ▬
    const slider = "\ud83d\udd18"; // 🔘
    const progress = Math.min(Math.round((length * current) / total), length);
    return line.repeat(progress) + slider + line.repeat(length - progress);
  };
}

enum QueueMode {
  Default,
  RepeatAll,
  RepeatSingle,
}

enum QueueClearTarget {
  All = "All",
  Before = "Before",
  After = "After",
  Current = "Current",
}

enum PanelMode {
  Audio,
  Queue,
}

const i18n = i18nWrapper({
  // Player embed
  Repeat: {
    [Locale.EnglishUS]: "Repeat: ",
    [Locale.ChineseTW]: "重複：",
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
  Queue: {
    [Locale.EnglishUS]: "Queue: ",
    [Locale.ChineseTW]: "佇列：",
  },

  Channel: {
    [Locale.EnglishUS]: "Channel",
    [Locale.ChineseTW]: "頻道",
  },
  UploadDate: {
    [Locale.EnglishUS]: "Upload date",
    [Locale.ChineseTW]: "上傳日期",
  },
  Previous: {
    [Locale.EnglishUS]: "Previous",
    [Locale.ChineseTW]: "上一首",
  },
  Next: {
    [Locale.EnglishUS]: "Next",
    [Locale.ChineseTW]: "下一首",
  },
  None: {
    [Locale.EnglishUS]: "None",
    [Locale.ChineseTW]: "無",
  },

  // Queue embed
  Duration: {
    [Locale.EnglishUS]: "Duration",
    [Locale.ChineseTW]: "時長",
  },
  NowPlaying: {
    [Locale.EnglishUS]: "Now playing",
    [Locale.ChineseTW]: "正在播放",
  },
});
