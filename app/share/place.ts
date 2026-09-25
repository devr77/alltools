import { MAIN_URL } from "./domain";

/** How links are written on each host serving Share. The pages are static, so each host gets its own prerendered copy. */
export type Place = {
  /** Prefix for tool links: /share/<slug>, or /<slug> on the share domain. */
  path: string;
  /** The hub's href. */
  home: string;
  /** Prefix for links to the main ToolsBase site (about, privacy, contact). */
  main: string;
};

export const onMain: Place = { path: "/share", home: "/share", main: "" };
export const onDomain: Place = { path: "", home: "/", main: MAIN_URL };
