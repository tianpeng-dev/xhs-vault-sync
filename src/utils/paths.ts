const INVALID_FILENAME_CHARS = /[\\/:*?"<>|#^[\]]/g;

export function safeFileName(input: string, fallback = "Untitled"): string {
  const cleaned = input
    .replace(INVALID_FILENAME_CHARS, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned || cleaned === "." || cleaned === "..") return fallback.slice(0, 120);
  return cleaned.slice(0, 120);
}

export function joinVaultPath(...parts: string[]): string {
  return parts
    .flatMap((part) => part.replace(/^\/+|\/+$/g, "").split("/"))
    .filter((part) => part && part !== "." && part !== "..")
    .join("/");
}
