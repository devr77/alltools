/** Page entry: mounts the tool named by <main data-tool="…">. The directory page has no data-tool. */
import { findTool, toolHref, torrentTools } from "./catalog.js";
import { renderMetadataTool } from "./tools/metadata-tool.js";
import { renderCalculatorTool } from "./tools/calculator-tool.js";
import { renderBrowserTool } from "./tools/browser-tool.js";

const renderers = { metadata: renderMetadataTool, calculator: renderCalculatorTool, browser: renderBrowserTool };

const root = document.getElementById("tool-root");
const tool = root && findTool(root.dataset.tool);
if (tool) {
  const related = torrentTools
    .filter((entry) => entry.slug !== tool.slug)
    .map((entry) => ({ href: toolHref(entry.slug), name: entry.name }));
  renderers[tool.kind](root, tool, related);
}
