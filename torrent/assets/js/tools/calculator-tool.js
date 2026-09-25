/** Calculator tools: ISP comparison, naming. */
import { compareConnections, standardName } from "../lib/calculators.js";
import { copyText, errorMessage, guide, h, mount, saveFile } from "../dom.js";

const fieldSets = {
  "isp-throttling-detector": [
    { key: "direct", label: "Torrent speeds without VPN (Mbps)", value: "20, 22, 18", type: "textarea" },
    { key: "vpn", label: "Same torrent with VPN (Mbps)", value: "40, 42, 38", type: "textarea" },
    { key: "reference", label: "Reference HTTPS download speeds (Mbps)", value: "90, 88, 92", type: "textarea", hint: "Enter 3–20 measurements per field. Use the same device, connection, torrent, and comparable times. Convert MB/s to Mbps by multiplying by 8." },
  ],
  "torrent-naming-standard-generator": [
    { key: "title", label: "Title", value: "My Creative Project", type: "text" },
    { key: "year", label: "Year (optional)", value: "2026", type: "text" },
    { key: "type", label: "Content type", value: "movie", options: ["movie", "tv", "general"] },
    { key: "season", label: "Season (TV only)", value: "1", min: 0, max: 999, step: "1" },
    { key: "episode", label: "Episode (TV only)", value: "1", min: 0, max: 999, step: "1" },
    { key: "resolution", label: "Resolution (optional)", value: "1080p", options: ["", "480p", "720p", "1080p", "2160p"] },
    { key: "source", label: "Source (optional)", value: "WEB", options: ["", "WEB", "BluRay", "HDTV", "Original"] },
    { key: "codec", label: "Codec (optional)", value: "H264", options: ["", "H264", "H265", "AV1", "VP9"] },
    { key: "group", label: "Release group (optional)", value: "", type: "text" },
  ],
};

function compute(slug, values) {
  const n = (key) => Number(values[key]);
  switch (slug) {
    case "isp-throttling-detector": {
      const estimate = compareConnections(values.direct, values.vpn, values.reference);
      return { metrics: [["Direct median", `${estimate.directMbps.toFixed(2)} Mbps`], ["VPN median", `${estimate.vpnMbps.toFixed(2)} Mbps`], ["Reference median", `${estimate.referenceMbps.toFixed(2)} Mbps`], ["VPN difference", `${estimate.improvement >= 0 ? "+" : ""}${estimate.improvement.toFixed(1)}%`]], note: estimate.interpretation };
    }
    case "torrent-naming-standard-generator":
      return { metrics: [], text: standardName(values.title, values.year, values.type, n("season"), n("episode"), values.resolution, values.source, values.codec, values.group), note: "Use only accurate labels. Keep the real file extension when renaming a file; changing its name does not change its format." };
    default:
      throw new Error("Unknown calculator.");
  }
}

export function renderCalculatorTool(root, tool, related) {
  const { slug } = tool;
  const fields = fieldSets[slug];
  const inputs = {};
  const statusEl = h("p", { class: "status", role: "status" });
  const errorSlot = h("div");
  const resultSlot = h("div");
  let outputText = "";

  function clearOutput() { mount(resultSlot); mount(errorSlot); statusEl.textContent = ""; }

  const fieldNodes = fields.map((field) => {
    let input;
    if (field.options) {
      input = h("select", { value: field.value }, field.options.map((option) => h("option", { value: option }, option || "None")));
    } else if (field.type === "textarea") {
      input = h("textarea", { required: true, rows: 3, value: field.value });
    } else {
      input = h("input", {
        type: field.type || "number", required: !field.label.includes("optional"),
        min: field.min, max: field.max, step: field.step || "any", value: field.value,
        maxLength: field.type === "text" ? 220 : null,
      });
    }
    inputs[field.key] = input;
    return h("label", { class: "field" }, field.label, input, field.hint && h("small", {}, field.hint));
  });

  function reset() {
    for (const field of fields) inputs[field.key].value = field.value;
    clearOutput();
  }

  function calculate(event) {
    event.preventDefault();
    clearOutput();
    const values = Object.fromEntries(fields.map((field) => [field.key, inputs[field.key].value]));
    try {
      showResult(compute(slug, values));
      statusEl.textContent = "Result ready.";
    } catch (cause) {
      mount(errorSlot, h("p", { class: "error", role: "alert" }, errorMessage(cause, "Check your inputs.")));
    }
  }

  async function copy() {
    try { await copyText(outputText); statusEl.textContent = "Result copied."; }
    catch { statusEl.textContent = "Clipboard unavailable. Select and copy the output manually."; }
  }

  function showResult(result) {
    outputText = [tool.name, ...result.metrics.map(([key, value]) => `${key}: ${value}`), result.text || "", result.note || ""].filter(Boolean).join("\n");
    mount(resultSlot, h("section", { class: "results", "aria-label": "Calculation result" },
      h("h2", {}, "Your result"),
      result.metrics.length > 0 && h("dl", { class: "metric-grid" },
        result.metrics.map(([label, value]) => h("div", {}, h("dt", {}, label), h("dd", {}, value)))),
      result.text && h("label", { class: "result-field" }, "Generated name", h("textarea", { readOnly: true, rows: 3, value: result.text })),
      result.note && h("p", { class: "hint" }, result.note),
      h("div", { class: "actions" },
        h("button", { type: "button", class: "secondary", onclick: copy }, "Copy result"),
        h("button", { type: "button", class: "secondary", onclick: () => saveFile(outputText, `${slug}.txt`, "text/plain") }, "Download text")),
    ));
  }

  mount(root, h("div", { class: "workspace" },
    h("div", { class: "panel ph-no-capture ph-mask" },
      h("form", { onsubmit: calculate, oninput: clearOutput },
        h("div", { class: "calculator-fields" }, fieldNodes),
        h("div", { class: "actions" },
          h("button", { type: "submit", class: "primary" }, slug.includes("generator") ? "Generate" : "Calculate"),
          h("button", { type: "button", class: "secondary", onclick: reset }, "Reset"))),
      errorSlot, statusEl, resultSlot),
    guide("How it works", tool.help, [
      h("h3", {}, "Calculated on your device"),
      h("p", {}, "These calculations use your inputs only. No file uploads or peer connections are required."),
    ], related.slice(0, 5)),
  ));
}
