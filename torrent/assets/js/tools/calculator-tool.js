/** Calculator tools: download time, speed, video size, storage, ISP comparison, naming. */
import {
  compareConnections, downloadEstimate, durationLabel, sizeUnits, speedEstimate, speedUnits,
  standardName, storageEstimate, videoEstimate,
} from "../lib/calculators.js";
import { formatBytes } from "../lib/torrent.js";
import { copyText, errorMessage, guide, h, mount, saveFile } from "../dom.js";

const speedFields = [
  { key: "speed", label: "Connection speed", value: "100", min: 0.001 },
  { key: "speedUnit", label: "Speed unit", value: "Mbps", options: Object.keys(speedUnits) },
  { key: "efficiency", label: "Usable bandwidth (%)", value: "85", min: 0.1, max: 100, hint: "An assumption for overhead and swarm conditions; not a measured speed." },
];

const fieldSets = {
  "torrent-download-time-calculator": [
    { key: "size", label: "Total file size", value: "10", min: 0.001 },
    { key: "unit", label: "Size unit", value: "GB", options: Object.keys(sizeUnits) },
    ...speedFields,
    { key: "completed", label: "Already downloaded (%)", value: "0", min: 0, max: 100 },
  ],
  "internet-to-torrent-speed-converter": speedFields,
  "video-file-size-reduction-estimator": [
    { key: "minutes", label: "Video duration (minutes)", value: "120", min: 0.01 },
    { key: "video", label: "Target video bitrate (Mbps)", value: "3", min: 0.001 },
    { key: "audio", label: "Total audio bitrate (Kbps)", value: "128", min: 0, hint: "Sum the bitrates if keeping multiple audio tracks." },
    { key: "original", label: "Original file size (GB)", value: "8", min: 0.001 },
    { key: "overhead", label: "Container overhead (%)", value: "1", min: 0, max: 100 },
  ],
  "storage-requirement-calculator": [
    { key: "size", label: "Original downloads (GB)", value: "100", min: 0.001 },
    { key: "expansion", label: "Additional extracted size (× originals)", value: "1", min: 0, hint: "Use 0 when you do not need an extracted copy; 2 means extracted files take twice the original space." },
    { key: "copies", label: "Additional backup copies", value: "1", min: 0, max: 100, step: "1" },
    { key: "headroom", label: "Extra free-space allowance (%)", value: "20", min: 0, max: 100 },
    { key: "price", label: "Monthly price per GB", value: "0.02", min: 0 },
    { key: "currency", label: "Price currency", value: "USD", options: ["USD", "INR", "EUR", "GBP"] },
  ],
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
    case "torrent-download-time-calculator": {
      const estimate = downloadEstimate(n("size"), values.unit, n("speed"), values.speedUnit, n("efficiency"), n("completed"));
      return { metrics: [["Estimated remaining time", durationLabel(estimate.seconds)], ["Remaining data", formatBytes(estimate.remainingBytes)], ["Usable speed", `${formatBytes(estimate.bytesPerSecond)}/s`]], note: "Assumes a sustained download rate. Peer availability, congestion, and disk speed may increase the time." };
    }
    case "internet-to-torrent-speed-converter": {
      const estimate = speedEstimate(n("speed"), values.speedUnit, n("efficiency"));
      return { metrics: [["Decimal download rate", `${estimate.megabytes.toFixed(2)} MB/s`], ["Binary download rate", `${estimate.mebibytes.toFixed(2)} MiB/s`], ["Data per hour", `${estimate.gigabytesPerHour.toFixed(2)} GB`]], note: "Mbps ÷ 8 = MB/s before applying your efficiency factor. MB is decimal; MiB is binary." };
    }
    case "video-file-size-reduction-estimator": {
      const estimate = videoEstimate(n("minutes"), n("video"), n("audio"), n("original"), n("overhead"));
      return { metrics: [["Estimated output", formatBytes(estimate.bytes)], [estimate.savedBytes >= 0 ? "Estimated saving" : "Estimated increase", formatBytes(Math.abs(estimate.savedBytes))], ["Size change", `${Math.abs(estimate.reductionPercent).toFixed(1)}% ${estimate.reductionPercent >= 0 ? "smaller" : "larger"}`]], note: "Estimate = duration × total bitrate ÷ 8, plus container overhead. Quality and variable-bitrate output depend on the encoder and content." };
    }
    case "storage-requirement-calculator": {
      const estimate = storageEstimate(n("size"), n("expansion"), n("copies"), n("headroom"), n("price"));
      return { metrics: [["Originals + extracted files", `${estimate.originalAndExtractedGB.toFixed(2)} GB`], ["Backups", `${estimate.backupGB.toFixed(2)} GB`], ["Recommended capacity", `${estimate.totalGB.toFixed(2)} GB`], ["Monthly storage estimate", new Intl.NumberFormat("en-US", { style: "currency", currency: values.currency }).format(estimate.monthlyCost)]], note: "Backups include originals and extracted copies. Headroom is an additional allowance, not a target free-space percentage. Pricing uses your entered rate; egress, requests, taxes, and minimum charges are excluded." };
    }
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
