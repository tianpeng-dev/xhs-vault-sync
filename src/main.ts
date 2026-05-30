import { Notice, Plugin } from "obsidian";
import { DEFAULT_SETTINGS, type XhsVaultSyncSettings } from "./settings";
import { XhsVaultSyncSettingTab } from "./ui/settings-tab";

export default class XhsVaultSyncPlugin extends Plugin {
  settings: XhsVaultSyncSettings = DEFAULT_SETTINGS;

  async onload(): Promise<void> {
    await this.loadSettings();
    this.addSettingTab(new XhsVaultSyncSettingTab(this.app, this));

    this.addCommand({
      id: "xhs-vault-sync-now",
      name: "Sync bookmarks now",
      callback: () => new Notice("XHS Vault Sync is installed.")
    });
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  onunload(): void {
    // Obsidian unregisters commands automatically.
  }
}
