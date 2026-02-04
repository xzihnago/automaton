import {
  BaseInteraction,
  EmbedBuilder,
  userMention,
  inlineCode,
  codeBlock,
  time,
  type Locale,
} from "discord.js";

declare module "discord.js" {
  interface BaseInteraction {
    getLocale(): Locale;
    getColor(): ColorResolvable;
    diagnostic(): EmbedBuilder;
  }
}

BaseInteraction.prototype.getLocale = function () {
  return this.guild.features.includes("COMMUNITY")
    ? this.guildLocale
    : this.locale;
};

BaseInteraction.prototype.getColor = function () {
  return this.inCachedGuild()
    ? this.member.displayColor
    : (this.user.accentColor ?? 0);
};

BaseInteraction.prototype.diagnostic = function () {
  const wsRTT = this.client.ws.ping.toFixed();
  const msgRTT = (Date.now() - this.createdTimestamp).toFixed();
  const timestamp = Math.floor(this.createdTimestamp / 1000);

  const embed = new EmbedBuilder().addFields([
    { name: "Gateway RTT", value: inlineCode(`${wsRTT}ms`), inline: true },
    { name: "Message RTT", value: inlineCode(`${msgRTT}ms`), inline: true },
    { name: "Time", value: time(timestamp, "T"), inline: true },
    { name: "User", value: userMention(this.user.id), inline: true },
  ]);

  if (this.isChatInputCommand()) {
    embed.addFields([
      { name: "Command", value: inlineCode(this.commandName), inline: true },
      {
        name: "Options",
        value: codeBlock("json", JSON.stringify(this.options.data, null, 2)),
      },
    ]);
  } else if (this.isMessageComponent()) {
    embed.addFields([
      { name: "Custom ID", value: inlineCode(this.customId), inline: true },
    ]);
  }

  return embed;
};
