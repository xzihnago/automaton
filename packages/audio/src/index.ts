import { isVideo, isPlaylist, getVideoId, getPlaylistId } from "./common";
import { search, getInfo, getPlaylist } from "./innertube";
import { getStream } from "./ytdl";

export type { AudioInfo, FullAudioInfo } from "./common";
export default {
  isVideo,
  isPlaylist,
  getVideoId,
  getPlaylistId,
  search,
  getInfo,
  getPlaylist,
  getStream,
};
