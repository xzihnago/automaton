import { PermissionFlagsBits, VoiceState } from "discord.js";
import {
  type VoiceConnection,
  getVoiceConnection,
  joinVoiceChannel,
} from "@discordjs/voice";

declare module "discord.js" {
  interface VoiceState {
    join(): VoiceConnection | undefined;
    leave(): VoiceConnection | undefined;
  }
}

VoiceState.prototype.join = function () {
  const voicePermissions = [
    PermissionFlagsBits.Connect,
    PermissionFlagsBits.Speak,
  ];

  if (!this.channel?.permissionsFor(this.client.user)?.has(voicePermissions))
    return;

  return joinVoiceChannel({
    channelId: this.channel.id,
    guildId: this.guild.id,
    adapterCreator: this.guild.voiceAdapterCreator,
  });
};

VoiceState.prototype.leave = function () {
  const connection = getVoiceConnection(this.guild.id);
  connection?.destroy();

  return connection;
};
