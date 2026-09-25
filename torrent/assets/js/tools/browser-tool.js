/** Connected WebTorrent tools: browser downloader, torrent to direct download, health checker. */
import { createTorrent, extractMagnet, formatBytes, inspectTorrent, makeMagnet, MAX_TORRENT_BYTES, parseTrackers } from "../lib/torrent.js";
import { DEMO_TEXT, DEMO_URL, loadTorrentEngine, MAX_BROWSER_DOWNLOAD, MemoryChunkStore } from "../lib/browser-torrent.js";
import { errorMessage, guide, h, mount, saveFile } from "../dom.js";
import { toolHref } from "../catalog.js";

const LIMIT_MESSAGE = "This torrent exceeds the 256 MiB browser limit. Use a desktop client for larger torrents.";

export function renderBrowserTool(root, tool) {
  const health = tool.slug === "torrent-health-checker";
  let source = "magnet";
  let client = null;
  let torrent = null;
  let timer = null;
  let run = 0;
  let active = false;
  let selected = [];
  let saving = null;
  let fileRows = [];

  // Status area
  const statusEl = h("p", { class: "status", role: "status" });
  const warningEl = h("p", { class: "hint", hidden: true });
  const errorSlot = h("div");
  const stopSlot = h("div", { class: "actions stop-actions" });
  const liveSlot = h("div");
  const setStatus = (text) => { statusEl.textContent = text; };
  const setWarning = (text) => { warningEl.textContent = text; warningEl.hidden = !text; };
  const setError = (text) => mount(errorSlot, text ? h("p", { class: "error", role: "alert" }, text) : null);

  // Form
  const magnetInput = h("textarea", { rows: 3, required: true, maxLength: 32768, spellcheck: "false", placeholder: "magnet:?xt=urn:btih:…", oninput: clear });
  const fileInput = h("input", { required: true, type: "file", accept: ".torrent,application/x-bittorrent", onchange: clear });
  const trackersInput = h("textarea", { rows: 2, maxLength: 16384, value: "wss://tracker.openwebtorrent.com" });
  const webSeedInput = h("input", { type: "url", placeholder: "https://your-source.example/file.mp4" });
  const magnetField = h("label", { class: "field" }, "Magnet link", magnetInput);
  const fileField = h("label", { class: "field upload", hidden: true }, "Torrent file", fileInput, h("small", {}, "Metadata up to 10 MiB. Public v1 torrents only."));
  fileInput.disabled = true;
  const magnetButton = h("button", { type: "button", "aria-pressed": "true", onclick: () => setSource("magnet") }, "Magnet link");
  const fileButton = h("button", { type: "button", "aria-pressed": "false", onclick: () => setSource("file") }, ".torrent file");
  function setSource(next) {
    source = next;
    magnetButton.setAttribute("aria-pressed", String(next === "magnet"));
    fileButton.setAttribute("aria-pressed", String(next === "file"));
    magnetField.hidden = next !== "magnet"; magnetInput.disabled = next !== "magnet";
    fileField.hidden = next !== "file"; fileInput.disabled = next !== "file";
    clear();
  }
  const fieldset = h("fieldset", { class: "fields" },
    h("legend", { class: "legend" }, health ? "Check a public torrent" : "Choose a public torrent"),
    h("div", { class: "source-toggle", role: "group", "aria-label": "Input source" }, magnetButton, fileButton),
    magnetField, fileField,
    h("label", { class: "field" }, "Additional WebSocket trackers", trackersInput,
      h("small", {}, "One wss:// URL per line. The visible public tracker is contacted only after you start. You can remove or replace it.")),
    !health && h("label", { class: "field" }, "HTTP web seed (optional)", webSeedInput,
      h("small", {}, "A trusted server hosting the original matching content, with CORS and byte-range support.")),
    h("div", { class: "actions" },
      h("button", { class: "primary", type: "submit" }, health ? "Check browser peers" : "Connect to torrent"),
      !health && h("button", { class: "secondary", type: "button", onclick: () => start(null, true) }, "Try a small sample")),
  );
  const form = h("form", { onsubmit: (event) => start(event) }, fieldset);

  // Live status
  const nameEl = h("h2");
  const hashEl = h("p", { class: "hash-text", hidden: true });
  const metric = () => h("dd");
  const peersEl = metric(), secondEl = metric(), elapsedEl = metric(), downloadedEl = metric();
  const reportEl = h("p", { class: "connection-notice", hidden: true });
  const filesSlot = h("div", { class: "file-list" });
  const liveSection = h("section", { class: "results", "aria-label": "Live torrent status" },
    nameEl, hashEl,
    h("dl", { class: "metric-grid" },
      h("div", {}, h("dt", {}, "Connected peers"), peersEl),
      h("div", {}, h("dt", {}, health ? "Peak peers" : "Download speed"), secondEl),
      h("div", {}, h("dt", {}, "Elapsed"), elapsedEl),
      !health && h("div", {}, h("dt", {}, "Selected files downloaded"), downloadedEl)),
    reportEl, filesSlot);

  function setActive(value) {
    active = value;
    fieldset.disabled = value;
    mount(stopSlot, value ? h("button", { type: "button", class: "secondary", onclick: stop }, "Stop & clear session") : null);
    mount(liveSlot, value || !reportEl.hidden ? liveSection : null);
  }

  function renderStats(stats) {
    peersEl.textContent = stats.peers;
    secondEl.textContent = health ? stats.peakPeers : `${formatBytes(stats.speed)}/s`;
    elapsedEl.textContent = `${stats.seconds}s`;
    downloadedEl.textContent = formatBytes(stats.downloaded);
    if (fileRows.length) {
      progressEl.value = stats.progress;
      progressText.textContent = `${Math.round(stats.progress * 100)}% of selected content`;
      fileRows.forEach(updateRow);
    }
  }

  function dispose() {
    if (timer) clearInterval(timer);
    timer = null;
    const current = client; client = null; torrent = null;
    if (current && !current.destroyed) current.destroy();
  }

  function stop() {
    run++; dispose(); setActive(false); saving = null;
    setStatus("Stopped. Connections closed and temporary download data cleared. Saved files remain on your device.");
  }

  function clear() {
    setError(""); setWarning(""); setStatus("");
    reportEl.hidden = true; reportEl.textContent = "";
    nameEl.textContent = "Connection status"; hashEl.hidden = true;
    selected = []; fileRows = []; mount(filesSlot);
    renderStats({ peers: 0, peakPeers: 0, downloaded: 0, speed: 0, progress: 0, seconds: 0 });
    if (!active) mount(liveSlot);
  }

  // File list (downloader only), built once when metadata arrives.
  const filterSelect = h("select", { onchange: applyFilter },
    h("option", { value: "all" }, "All files"), h("option", { value: "mp4" }, "MP4 videos"), h("option", { value: "pdf" }, "PDF documents"));
  const progressEl = h("progress", { "aria-label": "Selected download progress", max: 1, value: 0 });
  const progressText = h("p", { class: "hint" });
  const filterNote = h("p", { class: "hint", hidden: true });

  function buildFileList(loaded) {
    fileRows = loaded.files.map((entry, index) => {
      const checkbox = h("input", { type: "checkbox", onchange: () => toggle(index) });
      const meta = h("small");
      const button = h("button", { type: "button", class: "secondary", onclick: () => save(index) }, "Save file");
      const row = h("div", {}, h("label", {}, checkbox, h("span", {}, entry.name, meta)), button);
      return { entry, index, row, checkbox, meta, button };
    });
    mount(filesSlot,
      h("label", { class: "field" }, "Show files", filterSelect),
      progressEl, progressText,
      h("div", { class: "download-files" }, fileRows.map(({ row }) => row)),
      filterNote);
    applyFilter();
  }

  function updateRow({ entry, index, checkbox, meta, button }) {
    checkbox.checked = selected.includes(index);
    meta.textContent = `${formatBytes(entry.length)} · ${entry.done ? "Complete" : `${Math.round(entry.progress * 100) || 0}%`}`;
    button.disabled = (!entry.done && entry.length !== 0) || saving !== null;
    button.textContent = saving === index ? "Preparing…" : "Save file";
  }

  function applyFilter() {
    const filter = filterSelect.value;
    const matches = (entry) => filter === "all" || entry.name.toLowerCase().endsWith(`.${filter}`);
    fileRows.forEach(({ entry, row }) => { row.hidden = !matches(entry); });
    const none = filter !== "all" && !fileRows.some(({ entry }) => matches(entry));
    filterNote.hidden = !none;
    filterNote.textContent = none ? `This torrent contains no ${filter.toUpperCase()} files. A torrent file cannot be converted into that format; it describes the original content.` : "";
  }

  async function start(event, demo = false) {
    event?.preventDefault();
    dispose(); clear(); setActive(true);
    const thisRun = ++run;
    const current = () => thisRun === run;
    function fail(message) {
      if (!current()) return;
      setError(message); dispose(); setActive(false);
    }
    try {
      setStatus(demo ? "Preparing a local sample…" : "Loading the browser torrent engine…");
      let input;
      let urls = [];
      let announce = [];
      if (demo) {
        input = (await createTorrent([new File([DEMO_TEXT], "readme.txt")])).bytes;
        urls = [DEMO_URL];
      } else {
        const trackers = parseTrackers(trackersInput.value);
        if (trackers.some((url) => !url.startsWith("wss://"))) throw new Error("Browser discovery needs secure WebSocket trackers (wss://). UDP/HTTP trackers need a desktop client.");
        announce = trackers;
        if (source === "file") {
          const file = fileInput.files?.[0];
          if (!file) throw new Error("Choose a .torrent file.");
          if (file.size > MAX_TORRENT_BYTES) throw new Error("Choose a torrent file up to 10 MiB.");
          const bytes = new Uint8Array(await file.arrayBuffer());
          const summary = await inspectTorrent(bytes);
          if (summary.private) throw new Error("Use your desktop client and tracker’s instructions for private torrents. This browser tool supports public torrents only.");
          if (!health && summary.totalSize > MAX_BROWSER_DOWNLOAD) throw new Error(LIMIT_MESSAGE);
          input = bytes;
        } else {
          const parsed = extractMagnet(magnetInput.value);
          input = makeMagnet(parsed.infoHash, parsed.name, parsed.trackers.filter((url) => url.startsWith("wss://")));
        }
        if (!health && webSeedInput.value.trim()) {
          const url = new URL(webSeedInput.value.trim());
          if (url.protocol !== "https:" && !(url.protocol === "http:" && url.origin === window.location.origin)) throw new Error("Use an HTTPS web seed URL (or this site’s local development origin).");
          if (url.username || url.password) throw new Error("Web seed URLs must not include login credentials.");
          urls = [url.href];
        }
      }
      const WebTorrent = await loadTorrentEngine();
      if (!current()) return;
      if (!WebTorrent.WEBRTC_SUPPORT && !demo) throw new Error("WebRTC is unavailable in this browser. Try a current browser or a desktop torrent client.");
      client = new WebTorrent({ dht: false, lsd: false, tracker: demo ? false : { announce: [] }, webSeeds: !health, maxConns: 20, uploadLimit: 256 * 1024 });
      client.on("error", (cause) => fail(errorMessage(cause, "The torrent engine could not start.")));
      let peak = 0;
      const started = Date.now();
      const added = client.add(input, { announce, urlList: urls, deselect: true, store: MemoryChunkStore, destroyStoreOnDestroy: true, storeCacheSlots: 0 }, (loaded) => {
        if (!current()) return;
        if (loaded.private) { fail("Private torrents are not supported by this browser tool."); return; }
        if (!health && loaded.length > MAX_BROWSER_DOWNLOAD) { fail(LIMIT_MESSAGE); return; }
        torrent = loaded;
        nameEl.textContent = loaded.name;
        hashEl.textContent = `Info hash: ${loaded.infoHash}`; hashEl.hidden = false;
        setStatus(health ? "Metadata received. Observing browser-compatible peers for 30 seconds…" : "Metadata ready. Select the files you want to download below.");
        if (!health) buildFileList(loaded);
        if (demo && !health) {
          loaded.files.forEach((entry) => entry.select());
          selected = loaded.files.map((_, index) => index);
          setStatus("Downloading the verified sample from this site…");
        }
      });
      torrent = added;
      added.on("error", (cause) => fail(errorMessage(cause, "The torrent could not be processed.")));
      added.on("warning", () => { if (current()) setWarning("One or more trackers or peers could not be reached. A tracker warning alone does not establish torrent health."); });
      setStatus(health ? "Checking browser-compatible peers…" : "Connecting and retrieving torrent metadata…");
      timer = setInterval(() => {
        if (!current() || added.destroyed) return;
        peak = Math.max(peak, added.numPeers || 0);
        const seconds = Math.floor((Date.now() - started) / 1000);
        const chosen = selected.map((index) => added.files?.[index]).filter(Boolean);
        const total = chosen.reduce((sum, entry) => sum + entry.length, 0);
        const downloaded = chosen.reduce((sum, entry) => sum + entry.downloaded, 0);
        const completed = chosen.length > 0 && chosen.every((entry) => entry.done || entry.length === 0);
        renderStats({ peers: added.numPeers || 0, peakPeers: peak, downloaded, speed: added.downloadSpeed || 0, progress: completed ? 1 : total ? downloaded / total : 0, seconds });
        if (completed && !health) setStatus("Selected files are complete and verified. Save them below, then stop the session.");
        if (health && seconds >= 30) {
          reportEl.textContent = peak > 0
            ? `Connected to up to ${peak} WebRTC peer${peak === 1 ? "" : "s"} during this 30-second check. This confirms browser connectivity, not a complete seed count, content safety, or future availability.`
            : "No WebRTC peers connected during this 30-second check. Result is inconclusive: the torrent may have TCP-only peers, unreachable trackers, or no browser seeders.";
          reportEl.hidden = false;
          dispose(); setActive(false); setStatus("Check complete. Connections closed.");
        } else if (!health && !added.files?.length && seconds >= 60) {
          fail("No metadata received within 60 seconds. Try a .torrent file, a reachable wss:// tracker, or a desktop client. This does not prove the torrent is dead.");
        } else if (!health && seconds >= 30 && !completed && added.numPeers === 0 && added.downloadSpeed === 0) {
          setWarning("Waiting for compatible peers or a reachable web seed. Most desktop-only swarms cannot be downloaded in a browser.");
        }
      }, 1000);
    } catch (cause) {
      if (current()) { dispose(); setActive(false); setError(errorMessage(cause, "Unable to start this torrent.")); }
    }
  }

  function toggle(index) {
    if (!torrent) return;
    selected = selected.includes(index) ? selected.filter((entry) => entry !== index) : [...selected, index];
    // Rebuild selection: files can share a boundary piece, so deselecting one must not strand another.
    if (torrent.pieces.length) torrent.deselect(0, torrent.pieces.length - 1, 0);
    selected.forEach((entry) => torrent.files[entry].select());
    setStatus(selected.length ? "Downloading selected files. Keep this tab open." : "No files selected. Connections remain open until you stop.");
    fileRows.forEach(updateRow);
  }

  async function save(index) {
    const entry = torrent?.files[index];
    if (!entry) return;
    const thisRun = run;
    saving = index; fileRows.forEach(updateRow);
    try {
      if (!entry.done && entry.length !== 0) throw new Error("Wait for this file to finish before saving.");
      const blob = await entry.blob();
      if (thisRun !== run) return;
      saveFile(blob, entry.name);
      setStatus(`Save started for ${entry.name}. Check your browser’s downloads.`);
    } catch (cause) {
      if (thisRun === run) setError(errorMessage(cause, "Unable to save this file."));
    } finally {
      if (thisRun === run) { saving = null; fileRows.forEach(updateRow); }
    }
  }

  window.addEventListener("pagehide", () => { run++; dispose(); });

  const guideExtra = [
    h("h3", {}, "Browser limits"),
    h("p", {}, "Most ordinary desktop peers use TCP/UDP and cannot connect here. A torrent can be active in a desktop client while having no browser peers."),
    health
      ? h("p", {}, "The check counts live connections during a 30-second window. It does not download the files, count all seeders, or scan the content for malware.")
      : [
        h("p", {}, "Downloads use temporary memory and are cleared when you stop or leave. Save finished files before closing this page. No permanent direct URL is generated."),
        h("h3", {}, "Torrent file to MP4 or PDF?"),
        h("p", {}, "A .torrent contains metadata, not the video or document. This tool retrieves the actual files and can filter for MP4 or PDF. It does not transcode, rename formats, or bypass missing peers."),
      ],
  ];

  clear();
  mount(root, h("div", { class: "workspace" },
    h("div", { class: "panel ph-no-capture ph-mask" },
      h("p", { class: "connection-notice" },
        health
          ? "This check makes real peer connections and retrieves metadata, without selecting content for download."
          : "Works with WebRTC peers or accessible HTTP web seeds. Maximum torrent size: 256 MiB. While connected, verified pieces may be shared with peers (upload cap: 256 KiB/s).",
        " Starting shares your torrent identifier and connection information with trackers and peers."),
      form, stopSlot, statusEl, warningEl, errorSlot, liveSlot),
    guide("How this works", tool.help, guideExtra, [
      { href: toolHref("torrent-file-to-magnet"), name: "Convert torrent to magnet" },
      { href: toolHref("torrent-file-parser"), name: "Inspect torrent files" },
    ]),
  ));
}
