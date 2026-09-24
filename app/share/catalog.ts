/**
 * Catalog: the single source for the /share pages, their SEO copy, and uploader behavior.
 * Each tool becomes /share/<slug> with its own title, description, H1, intro, features, use cases, and FAQ.
 * Keep copy specific to the content type; shared facts (lifetime, privacy) are generated from `site`.
 */
export type ShareTool = {
  slug: string; name: string; icon: string; hue: string[]; mode: "file" | "text" | "base64";
  accept?: { types: string[]; extensions: string[] }; picker?: string; label: string; noun?: string; formats: string;
  pasteFirst?: boolean; textType?: string; extension?: string; json?: boolean; placeholder?: string;
  title: string; description: string; lead: string; intro: string[];
  features: string[][]; useCases: string[][]; faqs: string[][];
};

export const site = {
  name: "Temporary File to URL Tools",
  brand: "ToolsBase Share",
  path: "/share",
  url: "https://toolsbase.org/share",
  api: "https://app.toolsbase.org/v1/uploads",
  // Seconds the presigned upload URL stays valid (the upload must start within this window).
  uploadWindow: 300,
  // Link lifetimes offered to visitors, in days. Values must be accepted by the API's deleteAfterDays.
  lifetimes: [
    { days: 1, label: "24 hours" },
    { days: 7, label: "7 days" },
  ],
  defaultLifetime: 7,
  // Per-file limit enforced in the browser. Keep it at or below the API's own limit.
  maxBytes: 100 * 1000 * 1000,
  // Files per batch; the API currently allows 10 upload requests per rate-limit window.
  maxFiles: 10,
  contactUrl: "/contact",
  title: "Upload a File and Get a Temporary Link – Free, No Sign-up",
  description: "Upload images, videos, PDFs, audio, documents, or text and get a shareable temporary URL in seconds. Links delete themselves automatically. Free, no account.",
};

/*
 * mode: "file" (drop/pick/paste files), "text" (write or paste text), or "base64" (decode then upload).
 * accept: { types: [MIME or "family/"], extensions: [...] } for validation; `picker` feeds <input accept>.
 * hue: [accent, soft highlight] for the page; the accent must stay readable as text on the light background.
 */
export const tools: ShareTool[] = [
  {
    slug: "image-to-url",
    name: "Image to URL",
    icon: "image",
    hue: ["#e11d48", "#fb7185"],
    mode: "file",
    accept: { types: ["image/"], extensions: [] },
    picker: "image/*",
    label: "an image",
    formats: "JPG, PNG, WebP, GIF, AVIF, HEIC, BMP",
    title: "Image to URL – Upload a Photo and Get a Link Instantly",
    description: "Convert an image to a URL in seconds. Upload JPG, PNG, WebP, or GIF and get a direct image link for chats, forums, docs, and code. Free, no sign-up.",
    lead: "Turn any picture into a direct link you can paste anywhere. Drop a JPG, PNG, WebP, or GIF, and the link is ready to share or embed a few seconds later.",
    intro: [
      "An image URL is a web address that points straight at the picture file. Chat apps, forums, issue trackers, and HTML all accept image URLs, so a link is often easier than attaching the file again and again.",
      "This converter uploads your image as it is, without recompressing or resizing it, and serves it with its original image type. The address ends in the file extension, so it works in an <img> tag, a Markdown image, or a browser tab.",
    ],
    features: [
      ["Direct image link", "The URL opens the image itself, not a download page, so it embeds in HTML, Markdown, and most chat previews."],
      ["Original quality", "Files are stored byte for byte. Nothing is resized, recompressed, or stripped on upload."],
      ["Paste from clipboard", "Copied an image? Press Ctrl+V (⌘V on Mac) anywhere on this page to upload it."],
    ],
    useCases: [
      ["Bug reports", "Attach a screenshot link to a GitHub issue, Jira ticket, or support email."],
      ["Forums and communities", "Share a photo on boards that accept image URLs but not uploads."],
      ["Quick previews", "Send a mockup or design draft to a client without a shared drive."],
      ["Testing and prototyping", "Use a real image URL in HTML, CSS, or an API request while you build."],
    ],
    faqs: [
      ["How do I convert an image to a URL?", "Drop the image in the upload box, choose how long the link should last, and wait a few seconds. Copy the link that appears, or open it to check the result."],
      ["Which image formats can I upload?", "Any common image format, including JPG, PNG, WebP, GIF, AVIF, HEIC, BMP, and ICO. SVG files are served as downloads rather than displayed, because SVG can contain scripts."],
      ["Can I embed the image link in HTML or Markdown?", "Yes. Use <img src=\"your-link\"> in HTML or ![alt text](your-link) in Markdown. Remember that the image disappears when the link expires."],
      ["Is my image compressed?", "No. The file is stored exactly as you upload it. To make it smaller first, use an image compressor, then upload the result."],
    ],
  },
  {
    slug: "video-to-url",
    name: "Video to URL",
    icon: "video",
    hue: ["#0e7490", "#22d3ee"],
    mode: "file",
    accept: { types: ["video/"], extensions: ["mkv", "avi", "mov", "m4v"] },
    picker: "video/*,.mkv,.avi,.mov,.m4v",
    label: "a video",
    formats: "MP4, MOV, WebM, MKV, AVI",
    title: "Video to URL – Upload a Video and Get a Shareable Link",
    description: "Convert a video to a URL for free. Upload MP4, MOV, WebM, or MKV and share a direct video link that plays in the browser. Auto-deletes, no account needed.",
    lead: "Share a clip without a video platform. Upload an MP4, MOV, or WebM and get a direct link that plays in the browser and expires on its own.",
    intro: [
      "Sending a video as an attachment often hits size limits, and a video platform means an account, processing time, and a public page. A direct video URL skips both: the recipient opens the link and the browser plays the file.",
      "Videos are stored unchanged. MP4 (H.264) and WebM play in every modern browser. MOV, MKV, and AVI are stored the same way, but some browsers download them instead of playing them, depending on the codec.",
    ],
    features: [
      ["Plays in the browser", "MP4 and WebM links open in the browser's built-in player, with no app or sign-in needed."],
      ["No re-encoding", "Your file keeps its original resolution, bitrate, and audio. What you upload is what they get."],
      ["Upload progress", "A live progress bar shows how much of a large video has been sent."],
    ],
    useCases: [
      ["Client reviews", "Send a draft cut or a demo reel for feedback without publishing it."],
      ["Bug reproduction", "Link a screen recording in a ticket so developers can see the problem."],
      ["HTML5 video testing", "Use a real video URL in a <video> tag while you build a player or page."],
      ["Team updates", "Share a short walkthrough in chat without clogging everyone's storage."],
    ],
    faqs: [
      ["How do I get a link for a video?", "Drop your video in the upload box, pick a link lifetime, and wait for the upload to finish. The link appears with Copy and Open buttons."],
      ["Will the video play in the browser?", "MP4 with H.264 video and WebM play in all modern browsers. MOV, MKV, and AVI depend on the codec and browser, and may download instead of playing."],
      ["Can I embed the video on a website?", "Yes. Use <video src=\"your-link\" controls></video>. The embed stops working when the link expires, so this suits previews and testing rather than a permanent site."],
      ["Why is my video upload slow?", "Upload speed depends on your connection's upload bandwidth, which is usually much lower than download speed. A 100 MB video takes about 80 seconds on a 10 Mbps upload."],
    ],
  },
  {
    slug: "pdf-to-url",
    name: "PDF to URL",
    icon: "pdf",
    hue: ["#c2410c", "#fb923c"],
    mode: "file",
    accept: { types: ["application/pdf"], extensions: ["pdf"] },
    picker: "application/pdf,.pdf",
    label: "a PDF",
    formats: "PDF",
    title: "PDF to URL – Upload a PDF and Get a Link to Share",
    description: "Convert a PDF to a link in seconds. Upload a PDF and share a URL that opens in any browser's PDF viewer. Free, temporary, no sign-up or email required.",
    lead: "Share a PDF as a link that opens in any browser's built-in viewer. No email attachment limits, and no account for you or the person you send it to.",
    intro: [
      "A PDF link is handy when an attachment is too big, when a form only accepts a URL, or when you want to share one document without granting access to a whole folder.",
      "Your PDF is served as application/pdf, so browsers open it in their own viewer with page navigation, zoom, search, and print. Nothing is converted, flattened, or watermarked.",
    ],
    features: [
      ["Opens in the browser", "Chrome, Edge, Firefox, and Safari show the PDF in their built-in viewer."],
      ["Unchanged document", "Text, links, fonts, and form fields stay exactly as they were in your file."],
      ["Link, not attachment", "Share a large brochure or report in a message that would reject the attachment."],
    ],
    useCases: [
      ["Resumes and portfolios", "Send a CV link to a recruiter, or paste it into an application form."],
      ["Invoices and quotes", "Share a one-off document with a client without a shared folder."],
      ["Handouts", "Put a slide deck or worksheet link in a meeting chat or on a QR code."],
      ["Review drafts", "Circulate a draft report for comments before the final version."],
    ],
    faqs: [
      ["How do I turn a PDF into a link?", "Drop the PDF in the upload box and choose how long the link should last. When the upload finishes, copy the link and share it."],
      ["Will the PDF open in the browser or download?", "It opens in the browser's built-in PDF viewer on desktop and most mobile browsers. The reader can still download it from the viewer."],
      ["Can I password-protect the link?", "No. Anyone with the link can open the PDF until it expires. If the document is confidential, protect the PDF itself with a password before uploading, and share the password separately."],
      ["Does this change my PDF?", "No. The file is stored byte for byte. Fillable fields, bookmarks, and embedded links still work."],
    ],
  },
  {
    slug: "gif-to-url",
    name: "GIF to URL",
    icon: "gif",
    hue: ["#4d7c0f", "#a3e635"],
    mode: "file",
    accept: { types: ["image/gif", "image/webp"], extensions: ["gif", "webp"] },
    picker: "image/gif,image/webp,.gif,.webp",
    label: "a GIF or animated WebP",
    noun: "a GIF",
    formats: "GIF, animated WebP",
    title: "GIF to URL – Upload an Animated GIF and Get a Direct Link",
    description: "Convert a GIF to a URL and keep the animation. Upload an animated GIF or WebP and get a direct link for chats, READMEs, forums, and email. Free, no account.",
    lead: "Get a direct link to an animated GIF that keeps playing wherever you paste it: chat, a GitHub README, a forum post, or an email signature.",
    intro: [
      "Many apps flatten GIFs to a still image or convert them to video when you upload them directly. A direct GIF URL keeps the original file, so every frame and the loop timing stay intact.",
      "Animated WebP files are accepted too. They're often much smaller than the equivalent GIF and play in all current browsers.",
    ],
    features: [
      ["Animation preserved", "Frames, timing, looping, and transparency stay exactly as in your file."],
      ["README friendly", "Paste the link into Markdown to show a demo animation in a README or wiki."],
      ["Works in chat", "Most chat apps unfurl a direct GIF URL into a playing preview."],
    ],
    useCases: [
      ["Product demos", "Show a feature in action in a README, changelog, or pull request."],
      ["Reaction GIFs", "Share your own GIF with anyone who has the link."],
      ["Tutorials", "Embed a short step-by-step animation in documentation."],
    ],
    faqs: [
      ["How do I get a link for a GIF?", "Drop the GIF in the upload box and wait a moment. Copy the link that appears and paste it wherever you want the animation to show."],
      ["Will the GIF still be animated?", "Yes. The file is stored unchanged, so it animates anywhere that supports GIFs. Some apps choose to show only the first frame of external images; that's a setting in the app, not the link."],
      ["Can I use the GIF in a GitHub README?", "Yes, with ![demo](your-link). Because the link expires, it suits pull requests and discussions better than a README you want to keep for a long time."],
    ],
  },
  {
    slug: "audio-to-url",
    name: "Audio to URL",
    icon: "audio",
    hue: ["#b45309", "#fbbf24"],
    mode: "file",
    accept: { types: ["audio/"], extensions: ["mp3", "wav", "m4a", "aac", "ogg", "oga", "opus", "flac"] },
    picker: "audio/*,.mp3,.wav,.m4a,.aac,.ogg,.opus,.flac",
    label: "an audio file",
    formats: "MP3, WAV, M4A, AAC, OGG, FLAC",
    title: "Audio to URL – Convert MP3 or WAV to a Shareable Link",
    description: "Convert audio to a link. Upload MP3, WAV, M4A, OGG, or FLAC and get a URL that plays in the browser. Free, temporary audio hosting with no sign-up.",
    lead: "Share a voice note, demo track, or podcast cut as a link that plays straight in the browser. MP3, WAV, M4A, OGG, and FLAC all work.",
    intro: [
      "An audio URL lets someone listen without downloading an attachment or installing anything. The link opens the browser's audio player, and it also works as the source of an HTML <audio> element.",
      "Files keep their original encoding and quality. MP3, M4A (AAC), WAV, and OGG play in all major browsers; FLAC plays in most current ones.",
    ],
    features: [
      ["Plays instantly", "The browser streams the audio, so listening can start before the whole file loads."],
      ["Lossless stays lossless", "WAV and FLAC are stored unchanged, which suits mastering feedback and sample sharing."],
      ["Embeddable", "Use the link as the src of an <audio> tag while testing a site or player."],
    ],
    useCases: [
      ["Music feedback", "Send a mix or demo to a bandmate, producer, or client."],
      ["Voice notes", "Share a long voice memo where the messaging app limits file size."],
      ["Podcast production", "Pass an edit or raw recording to a co-host or editor."],
    ],
    faqs: [
      ["How do I convert an MP3 to a link?", "Drop the MP3 in the upload box, choose a link lifetime, and copy the URL when the upload finishes. The same steps work for WAV, M4A, OGG, and FLAC."],
      ["Will the audio play on phones?", "MP3 and M4A play on every phone browser. WAV plays on most. OGG and FLAC depend on the browser; older iPhones may not play OGG."],
      ["Is the audio converted or compressed?", "No. The link serves exactly the file you uploaded."],
    ],
  },
  {
    slug: "document-to-url",
    name: "Document to URL",
    icon: "doc",
    hue: ["#1d4ed8", "#60a5fa"],
    mode: "file",
    accept: { types: [], extensions: ["doc", "docx", "xls", "xlsx", "ppt", "pptx", "odt", "ods", "odp", "rtf", "csv", "txt", "md", "epub", "pdf"] },
    picker: ".doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp,.rtf,.csv,.txt,.md,.epub,.pdf",
    label: "a document",
    formats: "Word, Excel, PowerPoint, ODF, CSV, EPUB",
    title: "Word, Excel & PowerPoint to URL – Share Documents as Links",
    description: "Convert Word, Excel, or PowerPoint files to a link. Upload DOCX, XLSX, PPTX, CSV, or ODF documents and share a temporary download URL. Free, no sign-up.",
    lead: "Share a Word document, spreadsheet, or slide deck as a download link. Upload DOCX, XLSX, PPTX, CSV, or OpenDocument files without an account.",
    intro: [
      "Office files usually travel as email attachments or through a shared drive that asks the recipient to sign in. A plain download link works for anyone: they click it and the file downloads, ready to open in Word, Excel, PowerPoint, LibreOffice, or Google Docs.",
      "Browsers download Office files rather than displaying them, so the recipient needs an app that opens the format. If you want the document to open in the browser, save it as a PDF and use the PDF to URL tool instead.",
    ],
    features: [
      ["All Office formats", "DOCX, XLSX, PPTX, the older DOC, XLS, and PPT, OpenDocument, RTF, CSV, and EPUB."],
      ["No sign-in for recipients", "Anyone with the link can download the file, unlike many shared-drive links."],
      ["Exact copy", "Formulas, tracked changes, comments, and speaker notes stay in the file."],
    ],
    useCases: [
      ["Contracts and forms", "Send an editable document for someone to fill in and return."],
      ["Data handoffs", "Share a spreadsheet or CSV export with a colleague or vendor."],
      ["Presentations", "Get your deck to the presenter's laptop before a meeting."],
    ],
    faqs: [
      ["How do I share a Word document as a link?", "Drop the .docx file in the upload box, choose how long the link should last, and copy the URL. The recipient clicks it to download the document."],
      ["Can people view the document without downloading it?", "Browsers don't display Office formats directly, so the link downloads the file. For in-browser viewing, export the document as a PDF and use PDF to URL."],
      ["Can recipients edit my original?", "No. They download their own copy. Changes they make don't affect your file or the uploaded link."],
    ],
  },
  {
    slug: "zip-to-url",
    name: "ZIP to URL",
    icon: "archive",
    hue: ["#6d28d9", "#a78bfa"],
    mode: "file",
    accept: { types: ["application/zip", "application/x-7z-compressed", "application/vnd.rar", "application/gzip", "application/x-tar"], extensions: ["zip", "7z", "rar", "gz", "tgz", "tar"] },
    picker: ".zip,.7z,.rar,.gz,.tgz,.tar",
    label: "an archive",
    noun: "a ZIP or archive",
    formats: "ZIP, 7Z, RAR, TAR, GZ",
    title: "ZIP to URL – Upload an Archive and Get a Download Link",
    description: "Share many files with one link. Upload a ZIP, 7Z, RAR, or TAR.GZ archive and get a temporary download URL. Free file transfer with no account needed.",
    lead: "Bundle a folder into a ZIP, upload it, and send one download link instead of a dozen attachments.",
    intro: [
      "When you need to send many files at once, such as a photo set, a design handoff, or project source files, an archive keeps them together with their folder structure. One link gives the recipient everything in a single download.",
      "Compressing first also saves upload time for text-heavy content like code and documents. Photos and videos are already compressed, so zipping them mostly helps by keeping them together.",
    ],
    features: [
      ["One link, many files", "Folder structure and file names are preserved inside the archive."],
      ["Any archive format", "ZIP, 7Z, RAR, TAR, GZ, and TGZ are all accepted."],
      ["Straight to download", "The link downloads the archive immediately, with no waiting page or captcha."],
    ],
    useCases: [
      ["Design handoffs", "Deliver exported assets, fonts, and source files to a developer."],
      ["Photo sets", "Send a batch of event photos without a gallery app."],
      ["Code and builds", "Share a build artifact or sample project for testing."],
    ],
    faqs: [
      ["How do I send a folder as a link?", "Compress the folder first: right-click it and choose Compress (Mac) or Send to → Compressed folder (Windows). Then drop the ZIP here and copy the link."],
      ["Are archives scanned or opened?", "No. The archive is stored as it is. Recipients should only open archives from people they trust."],
      ["Can I upload a password-protected ZIP?", "Yes. Encrypted archives are stored unchanged. Share the password through a different channel than the link."],
    ],
  },
  {
    slug: "screenshot-to-url",
    name: "Screenshot to URL",
    icon: "screenshot",
    hue: ["#0f766e", "#2dd4bf"],
    mode: "file",
    accept: { types: ["image/"], extensions: [] },
    picker: "image/*",
    label: "an image",
    noun: "a screenshot",
    formats: "Clipboard, PNG, JPG, WebP",
    pasteFirst: true,
    title: "Screenshot to URL – Paste a Screenshot and Get a Link",
    description: "Paste a screenshot with Ctrl+V and get a shareable link instantly. No saving to a file, no sign-up. Share screenshots in tickets, chats, and docs in seconds.",
    lead: "Take a screenshot, press Ctrl+V (⌘V on Mac) on this page, and the link is ready before you switch windows. You don't need to save a file first.",
    intro: [
      "The fastest route from screen to shareable link skips the file step entirely. Capture with your usual shortcut, paste here, and the image goes straight from your clipboard to a link.",
      "Use Win+Shift+S on Windows, ⌘⇧4 while holding Control on a Mac, or PrtSc on most Linux desktops. Pasted screenshots are uploaded as PNG, which keeps text sharp.",
    ],
    features: [
      ["Clipboard paste", "Paste anywhere on the page. You don't need to click into the upload box first."],
      ["Crisp text", "Clipboard screenshots are sent as lossless PNG, so small UI text stays readable."],
      ["Several at once", "Paste or drop several screenshots; each gets its own link."],
    ],
    useCases: [
      ["Support tickets", "Show exactly what went wrong instead of describing it."],
      ["Design feedback", "Point out a spacing or color issue with a quick capture."],
      ["Remote pairing", "Share what's on your screen in a chat thread during a call."],
    ],
    faqs: [
      ["How do I paste a screenshot to get a link?", "Copy a screenshot to your clipboard (Win+Shift+S on Windows, or ⌘⇧4 while holding Control on a Mac), then press Ctrl+V or ⌘V on this page. The upload starts right away."],
      ["Why doesn't pasting work?", "Your clipboard may hold a file path rather than image data, or the browser may block clipboard access in private windows. Save the screenshot and drop the file instead."],
      ["Is anything else on my clipboard sent?", "No. Only image data you paste on this page is uploaded. Text on your clipboard is ignored."],
    ],
  },
  {
    slug: "text-to-url",
    name: "Text to URL",
    icon: "text",
    hue: ["#4338ca", "#818cf8"],
    mode: "text",
    textType: "text/plain",
    extension: "txt",
    placeholder: "Paste or type the text you want to share…",
    label: "text",
    formats: "Plain text, Markdown, code, logs",
    title: "Text to URL – Share Text Online with a Temporary Link",
    description: "Paste text and get a shareable link. Share notes, code snippets, logs, or Markdown as a plain-text URL that expires automatically. Free, no sign-up needed.",
    lead: "Paste notes, a code snippet, or a long log and share it as a plain-text link. It's quicker than a document and cleaner than a wall of text in chat.",
    intro: [
      "Chat apps mangle long text: they wrap it, collapse it, or turn code into emoji. A text link keeps every space and line break exactly as you wrote it, and the reader sees plain text in any browser.",
      "Text is saved as UTF-8, so accents, non-Latin scripts, and emoji display correctly. It's shown as plain text rather than a web page, so any HTML or scripts you paste are shown as code and never run.",
    ],
    features: [
      ["Keeps formatting", "Indentation, tabs, blank lines, and long lines are preserved exactly."],
      ["Unicode safe", "Saved as UTF-8 so every language and emoji displays correctly."],
      ["Safe by design", "Always served as plain text, so pasted HTML is never rendered."],
    ],
    useCases: [
      ["Code snippets", "Share a function or config file without a gist account."],
      ["Logs and stack traces", "Send a long error log to a developer without flooding the chat."],
      ["Notes and drafts", "Pass a draft to your phone or another computer quickly."],
    ],
    faqs: [
      ["How do I share text as a link?", "Paste or type your text in the box, choose how long the link should last, and select Create link. Copy the URL and send it."],
      ["Is there a length limit?", "Text can be as large as the per-file limit, which is millions of characters and far more than any note or log."],
      ["Can I share HTML as a working web page?", "No. Text is always shown as plain text so that shared links can't be used to run scripts. The HTML appears as source code."],
    ],
  },
  {
    slug: "json-to-url",
    name: "JSON to URL",
    icon: "json",
    hue: ["#a16207", "#facc15"],
    mode: "text",
    textType: "application/json",
    extension: "json",
    json: true,
    placeholder: "{\n  \"hello\": \"world\"\n}",
    label: "JSON",
    formats: "JSON",
    title: "JSON to URL – Host JSON and Get a Mock API Endpoint",
    description: "Paste JSON and get a URL that returns it with application/json. Use it as a quick mock API endpoint, a fixture, or to share data. Free, validated, temporary.",
    lead: "Paste JSON and get a URL that serves it as application/json. Use it as a throwaway mock API endpoint, a test fixture, or a way to share a payload.",
    intro: [
      "Front-end work often needs an endpoint before the back end exists. A hosted JSON file is the simplest mock: fetch(url) returns your data with the correct content type, and no server is required.",
      "The JSON is checked before upload, so a missing comma is caught here rather than in your app. Use Format to pretty-print it first, or keep it minified for a smaller response.",
    ],
    features: [
      ["Validated", "Invalid JSON is flagged with the parser's message before anything is uploaded."],
      ["Correct content type", "Served as application/json, so fetch() and API clients parse it directly."],
      ["Format or keep as is", "Pretty-print with one click, or upload your text exactly as pasted."],
    ],
    useCases: [
      ["Mock APIs", "Point a prototype at a JSON URL while the real API is in progress."],
      ["Fixtures and demos", "Load sample data in a CodePen, JSFiddle, or tutorial."],
      ["Sharing payloads", "Send an API response or webhook body to a teammate for debugging."],
    ],
    faqs: [
      ["How do I host a JSON file online?", "Paste your JSON, select Create link, and copy the URL. Requesting that URL returns your JSON with the application/json content type."],
      ["Can I fetch the JSON from JavaScript?", "Usually yes: fetch(url).then(r => r.json()). If your page runs on another domain, the storage server's CORS settings decide whether the browser allows the request, so test it from your page."],
      ["Can I update the JSON at the same URL?", "No. Each upload creates a new, unchangeable link. Upload the new version and use its link."],
    ],
  },
  {
    slug: "base64-to-url",
    name: "Base64 to URL",
    icon: "binary",
    hue: ["#0369a1", "#38bdf8"],
    mode: "base64",
    label: "Base64 data",
    formats: "Base64, data: URIs",
    placeholder: "data:image/png;base64,iVBORw0KGgo…  or raw Base64",
    title: "Base64 to URL – Convert a Base64 String or Data URI to a Link",
    description: "Decode Base64 or a data: URI into a real file and get a hosted URL. Converts Base64 images, PDFs, and more in your browser. Free, fast, no sign-up.",
    lead: "Paste a Base64 string or a data: URI. It's decoded in your browser, uploaded as a real file, and returned as a short URL you can use anywhere.",
    intro: [
      "Base64 data URIs are handy inside code, but they're long, they bloat HTML and JSON, and many apps won't accept them. Converting one into a hosted file gives you a short, normal URL.",
      "Decoding happens in your browser. If the input is a data: URI, its declared type is used. For raw Base64, the file type is detected from the first bytes, recognizing PNG, JPEG, GIF, WebP, PDF, ZIP, MP3, MP4, and more.",
    ],
    features: [
      ["Decoded locally", "Your Base64 is decoded in the browser, and only the resulting file is uploaded."],
      ["Type detection", "The file type comes from the data: prefix or the file's own signature bytes."],
      ["Forgiving input", "Line breaks, spaces, URL-safe characters, and missing padding are handled."],
    ],
    useCases: [
      ["Shorten data URIs", "Replace a huge inline image in HTML, CSS, or email with a short URL."],
      ["Debug API output", "See the actual image or PDF an API returned as Base64."],
      ["Canvas exports", "Turn a canvas.toDataURL() result into a shareable image link."],
    ],
    faqs: [
      ["How do I convert Base64 to an image URL?", "Paste the Base64 string or data:image/… URI and select Create link. The tool decodes it, detects the image type, uploads it, and gives you the URL."],
      ["What if the type can't be detected?", "The file is uploaded as generic binary data (application/octet-stream), and the link downloads it. Add a data:<type>;base64, prefix to set the type yourself."],
      ["Is Base64 encryption?", "No. Base64 is an encoding that anyone can reverse. Don't treat it as a way to protect sensitive data."],
    ],
  },
  {
    slug: "file-to-url",
    name: "File to URL",
    icon: "file",
    hue: ["#be185d", "#f472b6"],
    mode: "file",
    accept: { types: [], extensions: [] },
    picker: "",
    label: "a file",
    formats: "Any file type",
    title: "File to URL – Upload Any File and Get a Download Link",
    description: "Upload any file and get a shareable download link in seconds. Free temporary file hosting with automatic deletion. No account, no email, no waiting page.",
    lead: "Upload any file, whether that's an installer, a dataset, a font, or a 3D model, and get a direct link. Files the browser can show open in a tab; everything else downloads.",
    intro: [
      "Sometimes a file doesn't fit any category. It's too big for email, it's needed on another device, or someone just needs to grab it once. File to URL accepts any file type and gives it a direct link that works without an account on either end.",
      "Common types such as images, video, audio, PDF, and text open in the browser. Other types download. HTML, SVG, XML, and JavaScript files are always served as downloads, so a shared link can't run code in someone's browser.",
    ],
    features: [
      ["Any file type", "No format list to check. If it's a file, you can upload it."],
      ["Batch upload", `Select or drop up to ${site.maxFiles} files at once; each gets its own link.`],
      ["Recent links", "Links you create are remembered in this browser until they expire."],
    ],
    useCases: [
      ["Move files between devices", "Upload on your laptop, open the link on your phone."],
      ["One-off transfers", "Send something once, without a cloud drive folder to clean up."],
      ["Temporary downloads", "Give testers or clients a build, font, or dataset for a few days."],
    ],
    faqs: [
      ["How do I create a download link for a file?", "Drop the file in the upload box or click to choose it, pick how long the link should last, and copy the link when the upload completes."],
      ["Which file types are allowed?", "Any type. Active web formats (HTML, SVG, XML, JavaScript) are served as downloads rather than opened, to keep links safe for the people who click them."],
      ["Can I upload several files at once?", `Yes, up to ${site.maxFiles} at a time. Each file gets its own link. To share them as one link, put them in a ZIP first.`],
    ],
  },
];

/** Tools shown in the header navigation, in order. */
export const navSlugs = ["image-to-url", "video-to-url", "pdf-to-url", "file-to-url", "text-to-url"];

export function findTool(slug: string) {
  return tools.find((tool) => tool.slug === slug);
}

const lifetimeLabel = (days: number) => site.lifetimes.find((entry) => entry.days === days)?.label || `${days} days`;

/** FAQs shared by every page, generated from the site settings so the facts stay consistent. */
export function sharedFaqs(): string[][] {
  const longest = Math.max(...site.lifetimes.map((entry) => entry.days));
  return [
    ["How long does the link last?", `You choose: ${site.lifetimes.map((entry) => entry.label).join(" or ")}. After that the file is deleted automatically and the link stops working. Links can't be extended. Upload the file again for a new link.`],
    ["Who can see my upload?", "Anyone who has the link. Links are long and random, so they can't be guessed, but anything you share can be forwarded. Don't upload passwords, ID documents, or other sensitive data."],
    ["Is it free? Do I need an account?", `Yes, it's free, and no account, email, or sign-up is needed. Each file can be up to ${formatLimit(site.maxBytes)}, and the service limits how many uploads you can make in a short time.`],
    ["Can I delete a link before it expires?", `Not from this page yet; every link is removed automatically after its lifetime (at most ${lifetimeLabel(longest)}). To report content that breaks the rules, use the contact page.`],
  ];
}

function formatLimit(bytes: number) {
  return bytes >= 1e9 ? `${bytes / 1e9} GB` : `${Math.round(bytes / 1e6)} MB`;
}

export const limitLabel = formatLimit(site.maxBytes);
