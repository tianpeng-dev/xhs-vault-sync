import type { App } from "obsidian";
import { normalizePath, TFile, TFolder } from "obsidian";
import type { XhsNote } from "../sync/types";
import { joinVaultPath, safeFileName } from "../utils/paths";
import { renderNoteMarkdown } from "./markdown";

export class VaultWriter {
  constructor(private readonly app: App, private readonly rootFolder: string) {}

  async ensureFolder(path: string): Promise<void> {
    const normalized = normalizePath(path);
    const existing = this.app.vault.getAbstractFileByPath(normalized);
    if (existing instanceof TFolder) return;
    if (existing) throw new Error(`Vault path exists but is not a folder: ${normalized}`);

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

    if (existing instanceof TFile) {
      await this.app.vault.modify(existing, content);
    } else if (existing) {
      throw new Error(`Vault path exists but is not a file: ${path}`);
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
    if (existing instanceof TFile) {
      await this.app.vault.delete(existing);
    } else if (existing) {
      throw new Error(`Vault path exists but is not a file: ${path}`);
    }
    await this.app.vault.createBinary(path, data);
    return path;
  }
}
