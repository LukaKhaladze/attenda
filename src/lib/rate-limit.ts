const memoryStore = new Map<string, number[]>();

export function checkRateLimit(key: string, max = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const entries = memoryStore.get(key) ?? [];
  const filtered = entries.filter((timestamp) => now - timestamp < windowMs);

  if (filtered.length >= max) {
    memoryStore.set(key, filtered);
    return false;
  }

  filtered.push(now);
  memoryStore.set(key, filtered);
  return true;
}
