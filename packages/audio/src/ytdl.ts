import type { FullAudioInfo } from "./common";
import ytdl from "@distube/ytdl-core";
import { logger, LogCategory } from "@automaton/logger";

export const getInfo = async (url: string): Promise<FullAudioInfo> => {
  logger.debug(`Fetching info for "${url}"`, {
    category: LogCategory.Audio,
  });

  const vInfo = await ytdl.getInfo(url);
  const vDetails = vInfo.videoDetails;
  const thumbnail = vDetails.thumbnails.pop();
  return {
    url: vDetails.video_url,
    title: vDetails.title,
    channelName: vDetails.author.name,
    channelUrl: vDetails.author.channel_url,
    duration: Number(vDetails.lengthSeconds),
    publishedAt: new Date(vDetails.uploadDate),
    thumbnailUrl: thumbnail?.url ?? "",
    thumbnailWidth: thumbnail?.width ?? 400,
  };
};

export const getStream = async (url: string) => {
  const options: ytdl.downloadOptions = {
    liveBuffer: 1 << 30,
    highWaterMark: 1 << 30,
    dlChunkSize: 0,
    filter: "audio",
    quality: [93, 251, 250, 249, 140], // HLS(H.264 360p + AAC 128kbps), Opus <=160kbps, Opus ~70kbps, Opus ~50kbps, AAC 128kbps
  };

  logger.debug(`Creating stream for "${url}"`, {
    category: LogCategory.Audio,
  });

  const info = await ytdl.getInfo(url);
  return ytdl.downloadFromInfo(info, options);
};
