import { writeFile } from "fs/promises";
import { assert, describe, test } from "vitest";
import { getVideoId, getPlaylistId } from "./common";

describe("innertube", () => {
  test("get video Id", () => {
    const videoId = getVideoId(urlVideo);
    assert.equal(videoId, "275b9_v0-xk");
  });

  test("get playlist Id", () => {
    const playlistId = getPlaylistId(urlPlaylist);
    assert.equal(playlistId, "PL2b8hGCzo2lWAEtB78_-VMqDEJ0GYBTBk");
  });

  test("get audio and playlist Id", () => {
    const videoId = getVideoId(urlBoth);
    assert.equal(videoId, "H1uj4En-sgg");

    const playlistId = getPlaylistId(urlBoth);
    assert.equal(playlistId, "PL2b8hGCzo2lWAEtB78_-VMqDEJ0GYBTBk");
  });
});

export const writeJSON = async (path: string, data: unknown) => {
  await writeFile(path, JSON.stringify(data, null, 2));
};

export const urlVideo = "https://www.youtube.com/watch?v=275b9_v0-xk";
export const urlPlaylist =
  "https://www.youtube.com/playlist?list=PL2b8hGCzo2lWAEtB78_-VMqDEJ0GYBTBk";
export const urlBoth =
  "https://www.youtube.com/watch?v=H1uj4En-sgg&list=PL2b8hGCzo2lWAEtB78_-VMqDEJ0GYBTBk&index=1&pp=iAQB8AUB";
