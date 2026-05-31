import { Notice, requestUrl } from "obsidian";
import type XhsVaultSyncPlugin from "../main";
import { VaultWriter } from "../vault/vault-writer";
import { XhsApi } from "../xhs/api";
import { SignManager } from "../xhs/sign-manager";

export function shouldSyncNote(syncedIds: Record<string, true>, noteId: string): boolean {
  return syncedIds[noteId] !== true;
}

export function markNoteSynced(syncedIds: Record<string, true>, noteId: string): void {
  syncedIds[noteId] = true;
}

export class SyncEngine {
  private isSyncing = false;

  constructor(private readonly plugin: XhsVaultSyncPlugin) {}

  async syncBookmarks(): Promise<void> {
    if (this.isSyncing) {
      new Notice("XHS sync is already running.");
      return;
    }

    this.isSyncing = true;
    const signer = new SignManager();

    try {
      await signer.initWebview();
      const cookies = this.plugin.settings.cookies || `a1=${this.plugin.settings.a1Cookie}`;
      const api = new XhsApi(signer, cookies);
      const writer = new VaultWriter(this.plugin.app, this.plugin.settings.rootFolder);
      const user = await api.getCurrentUser();
      this.plugin.settings.userId = user.userId;
      this.plugin.settings.userName = user.userName;

      const cursor = this.plugin.settings.syncCursors.bookmark ?? "";
      const page = await api.getBookmarks(cursor, this.plugin.settings.syncBatchSize);
      let saved = 0;

      for (const item of page.notes) {
        if (!shouldSyncNote(this.plugin.settings.syncedIds, item.noteId)) continue;
        const detail = await api.getNoteDetail(item.noteId, item.xsecToken);
        if (!detail) continue;

        if (this.plugin.settings.downloadImages) {
          for (let index = 0; index < detail.media.length; index++) {
            const media = detail.media[index];
            if (media.type !== "image") continue;
            const response = await requestUrl({ url: media.url, method: "GET", throw: false });
            if (response.status >= 200 && response.status < 300) {
              media.localPath = await writer.writeMedia(
                detail.id,
                index + 1,
                response.arrayBuffer,
                media.ext ?? "jpg"
              );
            }
          }
        }

        await writer.writeNote(detail);
        markNoteSynced(this.plugin.settings.syncedIds, item.noteId);
        saved++;
      }

      this.plugin.settings.syncCursors.bookmark = page.cursor;
      this.plugin.settings.lastSyncAt = Date.now();
      await this.plugin.saveSettings();
      new Notice(`XHS sync complete: ${saved} notes saved.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      new Notice(`XHS sync failed: ${message}`);
      throw error;
    } finally {
      signer.destroy();
      this.isSyncing = false;
    }
  }
}
