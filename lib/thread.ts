const STORAGE_KEY = "uzair-rph-thread-id";

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `thread-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getOrCreateThreadId(): string {
  if (typeof window === "undefined") return generateId();

  const existing = window.localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;

  const id = generateId();
  window.localStorage.setItem(STORAGE_KEY, id);
  return id;
}

export function resetThreadId(): string {
  const id = generateId();
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
