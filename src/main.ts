import { Notice, Plugin } from "obsidian";

export default class XhsVaultSyncPlugin extends Plugin {
  async onload(): Promise<void> {
    this.addCommand({
      id: "xhs-vault-sync-now",
      name: "Sync bookmarks now",
      callback: () => new Notice("XHS Vault Sync is installed.")
    });
  }

  onunload(): void {
    // Obsidian unregisters commands automatically.
  }
}
