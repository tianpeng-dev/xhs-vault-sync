import type { App, TFile } from "obsidian";
import { normalizePath } from "obsidian";
import type { XhsNote } from "../sync/types";
import { joinVaultPath, safeFileName } from "../utils/paths";
import { renderNoteMarkdown } from "./markdown";

export class VaultWriter {
  constructor(private readonly app: App, private readonly rootFolder: string) {}

  async ensureFolder(path: string): Promise<void> {
    const normalized = normalizePath(path);
    if (this.app.vault.getAbstractFileByPath(normalized)) return;

    const parent = normalized.split("/").slice(0, -1).join("/");
    if (parent) await this.ensureFolder(parent);
    await this.app.vault.createFolder(normalized);
  }

  async writeNote(note: XhsNote): Promise<string> {
    await this.ensureFolder(this.rootFolder);
    const fileName = `${safeFileName(note.title || note.id)}.md`;
    const path = normalizePath(joinVaultPath(this.rootFolder, fileName));
    const content = renderNoteMarkdown(note);
    const existing = this.app.vault.getAbstractFileByPath(path);

    if (existing) {
      await this.app.vault.modify(existing as TFile, content);
    } else {
      await this.app.vault.create(path, content);
    }

    return path;
  }

  async writeMedia(noteId: string, index: number, data: ArrayBuffer, ext: string): Promise<string> {
    const folder = normalizePath(joinVaultPath(this.rootFolder, "Media", safeFileName(noteId)));
    await this.ensureFolder(folder);
    const path = normalizePath(joinVaultPath(folder, `image-${index}.${ext || "jpg"}`));
    const existing = this.app.vault.getAbstractFileByPath(path);
    if (existing) await this.app.vault.delete(existing);
    await this.app.vault.createBinary(path, data);
    return path;
  }
}
