import { Readable } from "stream";
import { Innertube, UniversalCache, YTNodes } from "youtubei.js";
import { logger, LogCategory } from "@automaton/logger";
import {
  type AudioInfo,
  type FullAudioInfo,
  getVideoId,
  getPlaylistId,
} from "./common";
import "./decipher";

export const innertube = await Innertube.create({
  cache: new UniversalCache(false),
});

await innertube.getAttestationChallenge("ENGAGEMENT_TYPE_UNBOUND");

export const getInfo = async (url: string): Promise<FullAudioInfo> => {
  logger.debug(`Fetching info for "${url}"`, {
    category: LogCategory.Audio,
  });

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const vinfo = await innertube.getInfo(getVideoId(url)!);
  const thumbnails = vinfo.basic_info.thumbnail?.[0];
  return {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    url: `https://www.youtube.com/watch?v=${vinfo.basic_info.id!}`,
    title: vinfo.basic_info.title ?? "Unknown",
    channelName: vinfo.basic_info.channel?.name ?? "Unknown",
    channelUrl: vinfo.basic_info.channel?.url ?? "",
    duration: vinfo.basic_info.duration ?? 0,
    publishedAt: new Date(vinfo.primary_info?.published.text ?? Date.now()),
    thumbnailUrl: thumbnails?.url ?? "",
    thumbnailWidth: thumbnails?.width ?? 400,
  };
};

export const getPlaylist = async (url: string): Promise<AudioInfo[]> => {
  logger.debug(`Fetching playlist "${url}"`, {
    category: LogCategory.Audio,
  });

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const playlist = await innertube.getPlaylist(getPlaylistId(url)!);
  return playlist.videos.map((node) => {
    const vinfo = node.as(YTNodes.PlaylistVideo);
    return {
      url: `https://www.youtube.com/watch?v=${vinfo.id}`,
      title: vinfo.title.text ?? "Unknown",
      channelName: vinfo.author.name,
      channelUrl: vinfo.author.url,
      duration: vinfo.duration.seconds,
    };
  });
};

export const search = async (query: string): Promise<AudioInfo[]> => {
  logger.debug(`Searching "${query}"`, {
    category: LogCategory.Audio,
  });

  const results = await innertube.search(query, { type: "video" });
  const ainfo = results.videos.slice(0, 10).map((node) => {
    const vinfo = node.as(YTNodes.Video);
    return {
      url: `https://www.youtube.com/watch?v=${vinfo.video_id}`,
      title: vinfo.title.text ?? "Unknown",
      channelName: vinfo.author.name,
      channelUrl: vinfo.author.url,
      duration: vinfo.duration.seconds,
    };
  });

  return ainfo;
};

export const getStream = async (url: string) => {
  logger.debug(`Creating stream for "${url}"`, {
    category: LogCategory.Audio,
  });

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const stream = await innertube.download(getVideoId(url)!, {
    type: "audio",
  });
  return Readable.from(stream.values(), { objectMode: false });
};
