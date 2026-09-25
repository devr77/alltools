/** Shared by the page (FAQ JSON-LD) and the client component (visible FAQ). */
export const MAX_FILES = 20;

export const qrReaderFaqs = [
  { question: "How do I read a QR code from an image?", answer: "Drop the image on this page, choose it with the file picker, or paste a screenshot with Ctrl+V (⌘V on Mac). The decoded text, link, or Wi‑Fi details appear below." },
  { question: "Are my images uploaded?", answer: "No. QR codes are decoded by JavaScript in your browser. Images and results stay on your device and are cleared when you leave the page." },
  { question: "Can I read several QR codes at once?", answer: `Yes. Select or drop up to ${MAX_FILES} images at a time. Each image gets its own result, and you can copy everything or download it as CSV or JSON.` },
  { question: "What data can it extract?", answer: "Any text stored in the code. Links, Wi‑Fi logins (network name, security, password), email, phone and SMS codes, vCard and MeCard contacts, and map coordinates are split into labeled fields." },
  { question: "Why does it say no QR code was found?", answer: "The code may be blurry, cropped, too small, or photographed at an angle. Retake the photo straight on in good light with the whole code visible. Only the first QR code in each image is read." },
  { question: "Is it safe to open the links?", answer: "Check the domain first. The reader warns about unencrypted links, lookalike domains, hidden usernames, and IP addresses. Only web, email, phone, and SMS links can be opened; other schemes are shown as text." },
];
