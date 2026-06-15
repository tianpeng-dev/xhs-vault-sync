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
    return url.href.replace(/\)/g, "%29");
  } catch {
    return undefined;
  }
}

function markdownBlock(value: string): string {
  return value.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function isWenYiWenAuthor(value: string): boolean {
  return value.trim() === "问一问";
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
  const comments = (note.comments ?? [])
    .filter((comment) => isWenYiWenAuthor(comment.author))
    .filter((comment) => comment.content.trim())
    .map((comment, index) => {
      return [`### 回答 ${index + 1}`, "", markdownBlock(comment.content)].join("\n");
    })
    .join("\n\n");

  return [
    "---",
    `source: ${yamlString("xiaohongshu")}`,
    `resourceId: ${yamlString(note.id)}`,
    `title: ${yamlString(note.title)}`,
    `author: ${yamlString(note.author)}`,
    `url: ${yamlString(note.url)}`,
    note.category ? `category: ${yamlString(note.category)}` : undefined,
    note.syncTarget ? `syncTarget: ${yamlString(note.syncTarget)}` : undefined,
    note.albumId ? `albumId: ${yamlString(note.albumId)}` : undefined,
    note.albumTitle ? `albumTitle: ${yamlString(note.albumTitle)}` : undefined,
    note.syncIndex ? `syncIndex: ${note.syncIndex}` : undefined,
    note.syncedAt ? `syncedAt: ${yamlString(note.syncedAt)}` : undefined,
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
      ? media
      : undefined,
    comments ? "## 问一问回答" : undefined,
    comments ? "" : undefined,
    comments || undefined
  ]
    .filter((line) => line !== undefined)
    .join("\n")
    .trimEnd()
    .concat("\n");
}
