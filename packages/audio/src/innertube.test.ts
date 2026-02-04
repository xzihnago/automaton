import { describe, test } from "vitest";
import * as audio from "./innertube.js";
import { writeJSON, urlVideo, urlPlaylist, urlBoth } from "./common.test.js";

describe("innertube", () => {
  test("resolve url", async () => {
    const endpoint = await audio.innertube.resolveURL(urlBoth);
    void writeJSON("./_/innertube_endpoint.json", endpoint);
  });

  test("get info", async () => {
    const info = await audio.getInfo(urlVideo);
    void writeJSON("./_/innertube_info.json", info);
  });

  test("playlist", async () => {
    const playlist = await audio.getPlaylist(urlPlaylist);
    void writeJSON("./_/innertube_playlist.json", playlist);
  });

  test("search", async () => {
    const results = await audio.search("never gonna give you up");
    void writeJSON("./_/innertube_search.json", results);
  });
});
