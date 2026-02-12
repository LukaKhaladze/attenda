import sanitizeHtml from "sanitize-html";

export function cleanText(value: string): string {
  return sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {}
  }).trim();
}
