export function sanitizeHtml(input: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(input, "text/html");

  const disallowedTags = new Set([
    "img",
    "picture",
    "source",
    "svg",
    "video",
    "audio",
    "iframe",
    "object",
    "embed",
    "canvas",
    "script",
    "style",
    "link",
    "meta",
  ]);

  // Hapus elemen terlarang
  doc.querySelectorAll(Array.from(disallowedTags).join(",")).forEach((el) => {
    el.remove();
  });

  // Bersihkan attributes berbahaya
  const treeWalker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT);
  const toClean: Element[] = [];
  // Kumpulkan elemen
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const node = treeWalker.nextNode() as Element | null;
    if (!node) break;
    toClean.push(node);
  }

  for (const el of toClean) {
    // Hapus on* attribute (onclick, onload, dll)
    Array.from(el.attributes).forEach((attr) => {
      const aName = attr.name.toLowerCase();
      const aVal = attr.value;
      if (aName.startsWith("on")) {
        el.removeAttribute(attr.name);
      }
      if (
        (aName === "href" || aName === "src") &&
        aVal.trim().toLowerCase().startsWith("javascript:")
      ) {
        el.removeAttribute(attr.name);
      }
    });

    // Khusus <a>: boleh, tapi no target=_blank baru & rel
    if (el.tagName.toLowerCase() === "a") {
      if (el.hasAttribute("target")) {
        el.setAttribute("target", "_self");
      }
      if (el.hasAttribute("rel")) {
        el.removeAttribute("rel");
      }
    }
  }

  return doc.body.innerHTML;
}