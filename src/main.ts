import { Notice, Plugin } from "obsidian";
import { createDefaultSettings, type XhsVaultSyncSettings } from "./settings";
import { LoginModal } from "./ui/login-modal";
import { XhsVaultSyncSettingTab } from "./ui/settings-tab";

export default class XhsVaultSyncPlugin extends Plugin {
  settings: XhsVaultSyncSettings = createDefaultSettings();

  async onload(): Promise<void> {
    await this.loadSettings();
    this.addSettingTab(new XhsVaultSyncSettingTab(this.app, this));

    this.addCommand({
      id: "xhs-vault-sync-login",
      name: "Log in to Xiaohongshu",
      callback: () => new LoginModal(this).open()
    });

    this.addCommand({
      id: "xhs-vault-sync-now",
      name: "Sync bookmarks now",
      callback: () => new Notice("XHS Vault Sync is installed.")
    });
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

  onunload(): void {
    // Obsidian unregisters commands automatically.
  }
}
