import { describe, test } from "vitest";
import * as audio from "./ytdlp";
import { writeJSON, urlVideo, urlPlaylist } from "./common.test.js";

describe("ytdlp", () => {
  test("get info", async () => {
    const info = await audio.getInfo(urlVideo);
    void writeJSON("./_/ytdlp_info.json", info);
  }, 10000);

  test("get playlist", async () => {
    const playlist = await audio.getPlaylist(urlPlaylist);
    void writeJSON("./_/ytdlp_playlist.json", playlist);
  }, 10000);
});
