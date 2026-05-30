import type { XhsNote } from "../sync/types";

function yamlString(value: string): string {
  return JSON.stringify(value);
}

function wikiLinkPath(value: string): string {
  return value.replace(/[\[\]]+/g, " ").trim();
}

function htmlAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function markdownUrl(value: string): string | undefined {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
    return value.replace(/\)/g, "%29");
  } catch {
    return undefined;
  }
}

export function renderNoteMarkdown(note: XhsNote): string {
  const tags = note.tags.map((tag) => `  - ${yamlString(tag)}`).join("\n");
  const media = note.media
    .map((item) => {
      if (item.localPath && item.type === "image") return `![[${wikiLinkPath(item.localPath)}]]`;
      if (item.localPath && item.type === "video") return `<video controls src="${htmlAttribute(item.localPath)}"></video>`;

      const url = markdownUrl(item.url);
      if (!url) return `[${item.type} link unavailable]`;
      return `[${item.type} link](${url})`;
    })
    .join("\n\n");

  return [
    "---",
    `source: ${yamlString("xiaohongshu")}`,
    `resourceId: ${yamlString(note.id)}`,
    `title: ${yamlString(note.title)}`,
    `author: ${yamlString(note.author)}`,
    `url: ${yamlString(note.url)}`,
    note.createdAt ? `createdAt: ${yamlString(note.createdAt)}` : undefined,
    note.updatedAt ? `updatedAt: ${yamlString(note.updatedAt)}` : undefined,
    "tags:",
    tags || "  - \"xhs\"",
    "---",
    "",
    `# ${note.title || "Untitled"}`,
    "",
    note.content || "(No content)",
    "",
    media
  ]
    .filter((line) => line !== undefined)
    .join("\n")
    .trimEnd()
    .concat("\n");
}
