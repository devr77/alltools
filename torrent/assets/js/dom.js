/** Tiny DOM helpers. All user and torrent data is inserted as text nodes, never as HTML. */

/**
 * h("button", { class: "primary", onclick: fn }, "Label")
 * Props starting with "on" become listeners; false/null props and children are skipped.
 */
export function h(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  const { value, ...rest } = props || {};
  for (const [key, prop] of Object.entries(rest)) {
    if (prop === false || prop === null || prop === undefined) continue;
    if (key.startsWith("on")) node.addEventListener(key.slice(2), prop);
    else if (key === "class") node.className = prop;
    else if (key in node && typeof prop !== "string") node[key] = prop;
    else node.setAttribute(key, prop === true ? "" : prop);
  }
  append(node, children);
  // Set after children so <select> can pick an option and <textarea> gets its content.
  if (value !== undefined && value !== null) node.value = value;
  return node;
}

function append(node, children) {
  for (const child of children.flat(Infinity)) {
    if (child === false || child === null || child === undefined) continue;
    node.append(child instanceof Node ? child : String(child));
  }
}

/** Replace all children of a node. */
export function mount(node, ...children) {
  node.replaceChildren();
  append(node, children);
}

export function saveFile(content, name, type) {
  const url = URL.createObjectURL(content instanceof Blob ? content : new Blob([content], { type }));
  const anchor = h("a", { href: url, download: name });
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

export async function copyText(value) {
  await navigator.clipboard.writeText(value);
}

export function errorMessage(cause, fallback) {
  return cause instanceof Error ? cause.message : fallback;
}

/** Shared "How to use" side panel used by every tool. */
export function guide(title, help, extra, related) {
  return h("aside", { class: "guide" },
    h("h2", {}, title),
    h("p", {}, help),
    extra,
    related?.length ? [
      h("h3", {}, "More torrent tools"),
      h("nav", { "aria-label": "Related torrent tools" },
        related.map(({ href, name }) => h("a", { href }, name, h("span", { "aria-hidden": "true" }, "→")))),
    ] : null,
  );
}
