import { describe, test } from "vitest";
import * as audio from "./ytdl";
import { writeJSON, urlVideo } from "./common.test.js";

describe("ytdl", () => {
  test("get info", async () => {
    const info = await audio.getInfo(urlVideo);
    void writeJSON("./_/ytdl_info.json", info);
  }, 10000);
});
