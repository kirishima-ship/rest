import { REST } from "../src/index";
import { LoadTypeEnum } from "lavalink-api-types/dist/enums/index";

const rest = new REST("https://lavalink.oops.wtf:443", { Authorization: "www.freelavalink.ga" });

jest.setTimeout(30000);

test("Test for load tracks", async () => {
    const { tracks, loadType } = await rest.loadTracks("Never Gonna Give You Up");
    expect(tracks.length).toBeGreaterThan(0);
    expect(loadType).toBe(LoadTypeEnum.SEARCH_RESULT)
})

test("Test for decde tracks", async () => {
    const { tracks, loadType } = await rest.loadTracks("Never Gonna Give You Up");
    const decodedTracks = await rest.decodeTracks(tracks.map(x => x.track));
    expect(decodedTracks.length).toEqual(tracks.length);
})