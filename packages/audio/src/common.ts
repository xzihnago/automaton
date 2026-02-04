export const isVideo = (url: string) => /v=([0-9A-Za-z_-]+)/.test(url);

export const isPlaylist = (url: string) => /list=([0-9A-Za-z_-]+)/.test(url);

export const getVideoId = (url: string) => {
  const re = /v=([0-9A-Za-z_-]+)/;
  const match = re.exec(url);
  return match?.[1];
};

export const getPlaylistId = (url: string) => {
  const re = /list=([0-9A-Za-z_-]+)/;
  const match = re.exec(url);
  return match?.[1];
};

export interface AudioInfo {
  url: string;
  title: string;
  channelName: string;
  channelUrl: string;
  duration: number;
}

export interface FullAudioInfo extends AudioInfo {
  publishedAt: Date;
  thumbnailUrl: string;
  thumbnailWidth: number;
}
