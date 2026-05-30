import { Notice, Plugin } from "obsidian";
import { createDefaultSettings, type XhsVaultSyncSettings } from "./settings";
import { SyncEngine } from "./sync/sync-engine";
import { LoginModal } from "./ui/login-modal";
import { XhsVaultSyncSettingTab } from "./ui/settings-tab";

export default class XhsVaultSyncPlugin extends Plugin {
  settings: XhsVaultSyncSettings = createDefaultSettings();
  private syncEngine: SyncEngine | null = null;
  private syncIntervalId: number | null = null;

  async onload(): Promise<void> {
    await this.loadSettings();
    this.syncEngine = new SyncEngine(this);
    this.addSettingTab(new XhsVaultSyncSettingTab(this.app, this));

    this.addCommand({
      id: "xhs-vault-sync-login",
      name: "Log in to Xiaohongshu",
      callback: () => new LoginModal(this).open()
    });

    this.addCommand({
      id: "xhs-vault-sync-now",
      name: "Sync bookmarks now",
      callback: () => void this.syncNow()
    });

    this.startSyncInterval();
  }

  async loadSettings(): Promise<void> {
    const defaults = createDefaultSettings();
    const loaded = (await this.loadData()) as Partial<XhsVaultSyncSettings> | null;

    this.settings = Object.assign(defaults, loaded, {
      syncCursors: { ...(loaded?.syncCursors ?? {}) },
      syncedIds: { ...(loaded?.syncedIds ?? {}) }
    });
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  async syncNow(): Promise<void> {
    if (!this.settings.a1Cookie) {
      new Notice("Log in to Xiaohongshu before syncing.");
      return;
    }
    await this.syncEngine?.syncBookmarks();
  }

  startSyncInterval(): void {
    this.stopSyncInterval();
    if (!this.settings.autoSyncEnabled) return;
    const minutes = Math.max(5, this.settings.syncIntervalMinutes);
    this.syncIntervalId = this.registerInterval(
      window.setInterval(() => void this.syncNow(), minutes * 60 * 1000)
    );
  }

  stopSyncInterval(): void {
    if (this.syncIntervalId !== null) {
      window.clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }
  }

  onunload(): void {
    this.stopSyncInterval();
  }
}
