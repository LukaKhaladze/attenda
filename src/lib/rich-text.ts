import sanitizeHtml from "sanitize-html";
import { cleanText } from "@/lib/sanitize";

const allowedTags = ["p", "strong", "em", "br", "ul", "ol", "li"];

export function sanitizeRichText(value: string) {
  return sanitizeHtml(value, {
    allowedTags,
    allowedAttributes: {}
  }).trim();
}

export function normalizeRichText(value: string) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }

  const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(raw);
  if (!hasHtmlTags) {
    const plain = cleanText(raw);
    return plain ? `<p>${plain}</p>` : "";
  }

  return sanitizeRichText(raw);
}

export function richTextFromStored(value: unknown) {
  if (Array.isArray(value)) {
    const blocks = value
      .map((item) => cleanText(String(item || "")).trim())
      .filter(Boolean)
      .map((item) => `<p>${item}</p>`);
    return blocks.join("");
  }

  if (typeof value === "string") {
    return normalizeRichText(value);
  }

  return "";
}

export function richTextCountBlocks(value: string) {
  const matches = value.match(/<(p|li)\b/gi);
  return matches ? matches.length : 0;
}

export function richTextToPlain(value: string) {
  return sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {}
  }).trim();
}
