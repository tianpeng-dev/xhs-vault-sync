import type { XhsNote } from "../sync/types";

function yamlString(value: string): string {
  return JSON.stringify(value);
}

export function renderNoteMarkdown(note: XhsNote): string {
  const tags = note.tags.map((tag) => `  - ${yamlString(tag)}`).join("\n");
  const media = note.media
    .map((item) => {
      if (item.localPath && item.type === "image") return `![[${item.localPath}]]`;
      if (item.localPath && item.type === "video") return `<video controls src="${item.localPath}"></video>`;
      return `[${item.type} link](${item.url})`;
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
