import { MAIN_URL } from "./domain";

/** How links are written on each host serving HLS. The pages are static, so each host gets its own prerendered copy. */
export type Place = {
  /** Prefix for tool links: /hls/<slug>, or /<slug> on the HLS domain. */
  path: string;
  /** The hub's href. */
  home: string;
  /** Prefix for links to the main ToolsBase site (about, privacy, contact). */
  main: string;
};

export const onMain: Place = { path: "/hls", home: "/hls", main: "" };
export const onDomain: Place = { path: "", home: "/", main: MAIN_URL };

/** Where the stream tools live on a host, so panels can hand a stream URL to another tool (?url=...). */
export const toolLinks = (place: Place) => ({
  download: `${place.path}/hls-downloader`, player: `${place.path}/m3u8-player`, checker: `${place.path}/m3u8-checker`,
});
export type ToolLinks = ReturnType<typeof toolLinks>;
