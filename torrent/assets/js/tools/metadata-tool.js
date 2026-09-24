/** Local metadata tools: magnet generator, BTIH, parser, creator, info-hash extractor, torrent to magnet. */
import {
  createTorrent, extractMagnet, formatBytes, inspectTorrent, makeMagnet,
  MAX_CONTENT_BYTES, MAX_FILES, MAX_TORRENT_BYTES, normalizeInfoHash, parseTrackers, toBase32,
} from "../lib/torrent.js";
import { copyText, errorMessage, guide, h, mount, saveFile } from "../dom.js";

const ACTIONS = {
  "torrent-file-creator": "Create torrent",
  "magnet-link-generator": "Generate magnet link",
  "info-hash-extractor": "Extract info hash",
  "btih-hash-generator": "Calculate BTIH hash",
  "torrent-file-to-magnet": "Convert to magnet link",
  "torrent-file-parser": "Parse torrent",
};

export function renderMetadataTool(root, tool, related) {
  const { slug } = tool;
  const isCreator = slug === "torrent-file-creator";
  const isMagnet = slug === "magnet-link-generator";
  const isExtractor = slug === "info-hash-extractor";
  let source = "magnet";
  let files = [];
  let controller = null;

  const statusEl = h("p", { class: "status", role: "status", "aria-live": "polite" });
  const errorSlot = h("div");
  const progressSlot = h("div");
  const resultSlot = h("div");
  const selectionEl = h("p", { class: "selection", hidden: true });

  function setStatus(text) { statusEl.textContent = text; }
  function setError(text) { mount(errorSlot, text ? h("p", { class: "error", role: "alert" }, text) : null); }
  function clearResult() { mount(resultSlot); setError(""); setStatus(""); }

  // Inputs
  const hashInput = h("input", { required: true, placeholder: "40 hex characters or 32 Base32 characters", autocomplete: "off", spellcheck: "false", maxLength: 128 });
  const magnetInput = h("textarea", { required: true, rows: 4, placeholder: "magnet:?xt=urn:btih:…", spellcheck: "false", maxLength: 32768 });
  const fileInput = h("input", {
    required: true, type: "file", multiple: isCreator,
    accept: isCreator ? null : ".torrent,application/x-bittorrent",
    onchange: () => { files = Array.from(fileInput.files || []); updateSelection(); clearResult(); },
  });
  const nameInput = h("input", { maxLength: 255, placeholder: isCreator ? "Defaults to the file name or my-files" : "A readable name for your magnet" });
  const trackersInput = h("textarea", { rows: 3, placeholder: "One tracker URL per line", maxLength: 16384, spellcheck: "false" });
  const commentInput = h("input", { maxLength: 1000, placeholder: "A note included in the torrent metadata" });
  const privateInput = h("input", { type: "checkbox" });
  const pieceSelect = h("select", { value: String(256 * 1024) },
    [256, 512, 1024, 2048, 4096].map((size) => h("option", { value: String(size * 1024) }, `${formatBytes(size * 1024)}${size === 256 ? " (default)" : ""}`)));

  function updateSelection() {
    if (!files.length) { selectionEl.hidden = true; return; }
    const total = files.reduce((sum, file) => sum + file.size, 0);
    selectionEl.hidden = false;
    selectionEl.textContent = `${files.length} ${files.length === 1 ? "file" : "files"} selected · ${formatBytes(total)}${files.length > 1 ? " · Stored in selection order, in a single folder." : ""}`;
  }

  const magnetField = h("label", { class: "field" }, "Magnet link", magnetInput);
  const fileField = h("label", { class: "field upload" },
    isCreator ? "Choose source files" : "Choose a .torrent file",
    fileInput,
    h("small", {}, isCreator
      ? `Up to ${MAX_FILES.toLocaleString()} files, ${formatBytes(MAX_CONTENT_BYTES)} total. Files stay on your device.`
      : "Maximum 10 MiB. BitTorrent v1 and hybrid .torrent files."));

  const magnetButton = h("button", { type: "button", "aria-pressed": "true", onclick: () => setSource("magnet") }, "Magnet link");
  const fileButton = h("button", { type: "button", "aria-pressed": "false", onclick: () => setSource("file") }, ".torrent file");
  function setSource(next) {
    source = next;
    magnetButton.setAttribute("aria-pressed", String(next === "magnet"));
    fileButton.setAttribute("aria-pressed", String(next === "file"));
    // Hidden fields must not block submission with `required`.
    magnetField.hidden = next !== "magnet"; magnetInput.disabled = next !== "magnet";
    fileField.hidden = next !== "file"; fileInput.disabled = next !== "file";
    selectionEl.hidden = next !== "file" || !files.length;
    clearResult();
  }

  const submitButton = h("button", { class: "primary", type: "submit" }, ACTIONS[slug]);
  const fieldset = h("fieldset", { class: "fields" },
    h("legend", { class: "legend" }, "1. Add your input"),
    isExtractor && h("div", { class: "source-toggle", role: "group", "aria-label": "Input source" }, magnetButton, fileButton),
    isMagnet && h("label", { class: "field" }, "Info hash", hashInput, h("small", {}, "A BitTorrent v1 info hash, not a regular file checksum.")),
    isExtractor && magnetField,
    !isMagnet && fileField,
    !isMagnet && selectionEl,
    (isCreator || isMagnet) && [
      h("label", { class: "field" }, isCreator ? "Torrent name (optional)" : "Display name (optional)", nameInput),
      h("label", { class: "field" }, "Trackers (optional)", trackersInput, h("small", {}, "HTTP(S), UDP, or WS(S). Leave blank for a trackerless public torrent.")),
    ],
    isCreator && [
      h("div", { class: "options-row" },
        h("label", { class: "field" }, "Piece size", pieceSelect),
        h("label", { class: "checkbox" }, privateInput, "Private torrent")),
      h("label", { class: "field" }, "Comment (optional)", commentInput),
      h("p", { class: "hint" }, "Private torrents require a tracker. The private flag asks clients to disable decentralized peer discovery; it does not encrypt your files."),
    ],
    h("div", { class: "actions" }, submitButton, h("button", { type: "button", class: "secondary", onclick: reset }, "Reset")),
  );
  const form = h("form", { onsubmit: process, oninput: clearResult }, fieldset);
  if (isExtractor) setSource("magnet");

  function setBusy(busy) {
    fieldset.disabled = busy;
    submitButton.textContent = busy ? "Processing…" : ACTIONS[slug];
  }

  function reset() {
    controller?.abort();
    form.reset();
    pieceSelect.value = String(256 * 1024);
    files = []; updateSelection();
    mount(progressSlot); setBusy(false); clearResult();
  }

  function showProgress(percent) {
    mount(progressSlot, h("div", { class: "progress" },
      h("label", { for: "torrent-progress" }, `Hashing files… ${percent}%`),
      h("progress", { id: "torrent-progress", max: 100, value: percent }),
      h("button", { class: "secondary", type: "button", onclick: cancel }, "Cancel")));
  }

  function cancel() {
    controller?.abort();
    mount(progressSlot); setBusy(false);
    setStatus("Torrent creation canceled. You can change your files and try again.");
  }

  async function process(event) {
    event.preventDefault();
    clearResult();
    setBusy(true);
    const current = new AbortController();
    controller = current;
    if (isCreator) showProgress(0);
    try {
      let output;
      if (isMagnet) {
        const infoHash = normalizeInfoHash(hashInput.value);
        output = { infoHash, base32: toBase32(infoHash), magnet: makeMagnet(infoHash, nameInput.value, parseTrackers(trackersInput.value)) };
      } else if (isExtractor && source === "magnet") {
        const extracted = extractMagnet(magnetInput.value);
        output = { ...extracted, magnet: makeMagnet(extracted.infoHash, extracted.name, extracted.trackers) };
      } else if (isCreator) {
        const created = await createTorrent(files, {
          name: nameInput.value, trackers: parseTrackers(trackersInput.value), comment: commentInput.value,
          private: privateInput.checked, pieceLength: Number(pieceSelect.value), signal: current.signal,
          onProgress: (value) => { if (!current.signal.aborted) showProgress(value); },
        });
        output = { ...created.summary, summary: created.summary, bytes: created.bytes };
      } else {
        const file = files[0];
        if (!file) throw new Error("Choose a .torrent file first.");
        if (file.size > MAX_TORRENT_BYTES) throw new Error("Choose a .torrent file up to 10 MiB.");
        const summary = await inspectTorrent(new Uint8Array(await file.arrayBuffer()));
        output = { ...summary, summary };
      }
      if (!current.signal.aborted) { showResult(output); setStatus("Done. Your result is ready below."); }
    } catch (cause) {
      if (!current.signal.aborted) setError(errorMessage(cause, "Unable to process this input. Please try another file or hash."));
    } finally {
      if (!current.signal.aborted) { setBusy(false); mount(progressSlot); }
    }
  }

  async function copy(value, label) {
    try { await copyText(value); setStatus(`${label} copied.`); }
    catch { setStatus("Clipboard access is unavailable. Select the result and copy it manually."); }
  }

  function resultField(id, label, value, buttonLabel, copyLabel) {
    return h("div", { class: "result-field" },
      h("label", { for: id }, label),
      h("div", {},
        h("input", { id, value, readOnly: true, spellcheck: "false" }),
        h("button", { type: "button", onclick: () => copy(value, copyLabel) }, buttonLabel)));
  }

  function showResult(result) {
    const summary = result.summary;
    const meta = (term, detail) => h("div", {}, h("dt", {}, term), h("dd", {}, detail));
    mount(resultSlot, h("section", { class: "results", "aria-labelledby": "result-title" },
      h("h2", { id: "result-title" }, "2. Your result"),
      result.bytes && h("button", { type: "button", class: "primary", onclick: () => saveFile(result.bytes, `${summary.name}.torrent`, "application/x-bittorrent") }, "Download .torrent"),
      resultField("hex-result", "Info hash · Hexadecimal", result.infoHash, "Copy hash", "Hexadecimal hash"),
      resultField("base32-result", "Info hash · Base32", result.base32, "Copy Base32", "Base32 hash"),
      h("div", { class: "result-field" },
        h("label", { for: "magnet-result" }, "Magnet link"),
        h("textarea", { id: "magnet-result", rows: 3, readOnly: true, spellcheck: "false", value: result.magnet }),
        h("button", { type: "button", class: "secondary", onclick: () => copy(result.magnet, "Magnet link") }, "Copy magnet link")),
      summary && [
        h("dl", { class: "metadata" },
          meta("Name", summary.name),
          meta("Total content size", formatBytes(summary.totalSize)),
          meta("Piece size / count", `${formatBytes(summary.pieceLength)} / ${summary.pieceCount.toLocaleString()}`),
          meta("Private torrent", summary.private ? "Yes" : "No"),
          summary.creationDate && meta("Created (UTC)", summary.creationDate),
          summary.createdBy && meta("Created by", summary.createdBy),
          summary.comment && meta("Comment", summary.comment)),
        summary.private && h("p", { class: "hint" }, "For private torrents, share the .torrent file according to your tracker’s instructions. A magnet link alone does not include its private flag."),
        h("details", { class: "details", open: slug === "torrent-file-parser" },
          h("summary", {}, `Files (${summary.files.length.toLocaleString()})`),
          h("div", { class: "table-wrap" }, h("table", {},
            h("thead", {}, h("tr", {}, h("th", {}, "Path"), h("th", {}, "Size"))),
            h("tbody", {}, summary.files.map((file) => h("tr", {}, h("td", {}, file.path), h("td", {}, formatBytes(file.length)))))))),
        h("details", { class: "details" },
          h("summary", {}, `Trackers (${summary.trackers.length})`),
          summary.trackers.length ? h("ul", {}, summary.trackers.map((tracker) => h("li", {}, tracker))) : h("p", {}, "No trackers listed.")),
        h("button", { type: "button", class: "secondary", onclick: () => saveFile(JSON.stringify(summary, null, 2), "torrent-metadata.json", "application/json") }, "Download metadata JSON"),
      ],
    ));
  }

  window.addEventListener("pagehide", () => controller?.abort());

  mount(root, h("div", { class: "workspace" },
    h("div", { class: "panel" }, form, progressSlot, errorSlot, statusEl, resultSlot),
    guide("How to use this tool", tool.help, [
      h("div", { class: "local-badge" }, "Processed on your device"),
      h("p", {}, "Your file contents are processed in this browser. These tools do not upload files or contact trackers."),
      h("h3", {}, "Good to know"),
      h("p", {}, isCreator
        ? "Keep your original files after creating a torrent. A BitTorrent client needs them to seed. Multiple files are stored in one folder; folder uploads are not supported."
        : "Supports BitTorrent v1 and v1 hashes from hybrid torrents. V2-only torrents are not supported."),
    ], related),
  ));
}
