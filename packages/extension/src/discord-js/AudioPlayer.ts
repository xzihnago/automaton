import { AudioPlayer, AudioPlayerStatus } from "@discordjs/voice";

declare module "@discordjs/voice" {
  interface AudioPlayer {
    isIdle(): boolean;
    isPaused(): boolean;
    isPlaying(): boolean;
  }
}

AudioPlayer.prototype.isIdle = function () {
  return this.state.status === AudioPlayerStatus.Idle;
};

AudioPlayer.prototype.isPaused = function () {
  return this.state.status === AudioPlayerStatus.Paused;
};

AudioPlayer.prototype.isPlaying = function () {
  return this.state.status === AudioPlayerStatus.Playing;
};
