export function isInlineImageDataUrl(value?: string | null) {
  return Boolean(value?.startsWith("data:image/"));
}

export function normalizeStoredImageUrl(value?: string | null) {
  if (!value || isInlineImageDataUrl(value)) {
    return null;
  }

  return value;
}
