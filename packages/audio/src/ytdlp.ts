import { YtDlp } from "ytdlp-nodejs";
import { logger, LogCategory } from "@automaton/logger";
import type { AudioInfo, FullAudioInfo } from "./common";

export const ytdlp = new YtDlp();

export const getInfo = async (url: string): Promise<FullAudioInfo> => {
  logger.debug(`Fetching info for "${url}"`, {
    category: LogCategory.Audio,
  });

  const info = await ytdlp.getInfoAsync<"video">(url);
  const thumbnail = info.thumbnails.pop();
  return {
    url: info.original_url,
    title: info.title,
    channelName: info.channel,
    channelUrl: info.channel_url,
    duration: info.duration,
    publishedAt: new Date(info.timestamp * 1000),
    thumbnailUrl: thumbnail?.url ?? "",
    thumbnailWidth: Number(thumbnail?.width ?? 400),
  };
};

export const getPlaylist = async (url: string): Promise<AudioInfo[]> => {
  logger.debug(`Fetching playlist "${url}"`, {
    category: LogCategory.Audio,
  });

  const playlist = await ytdlp.getInfoAsync<"playlist">(url);
  return playlist.entries.map((vinfo) => ({
    url: vinfo.url,
    title: vinfo.title,
    channelName: vinfo.channel,
    channelUrl: vinfo.channel_url,
    duration: vinfo.duration,
  }));
};

export const getStream = (url: string) => {
  logger.debug(`Creating stream for "${url}"`, {
    category: LogCategory.Audio,
  });

  return ytdlp.stream(url, { format: { filter: "audioonly" } });
};
