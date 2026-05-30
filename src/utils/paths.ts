const INVALID_FILENAME_CHARS = /[\\/:*?"<>|#^[\]]/g;

export function safeFileName(input: string, fallback = "Untitled"): string {
  const cleaned = input
    .replace(INVALID_FILENAME_CHARS, " ")
    .replace(/\s+/g, " ")
    .trim();
  return (cleaned || fallback).slice(0, 120);
}

export function joinVaultPath(...parts: string[]): string {
  return parts
    .map((part) => part.replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .join("/");
}
