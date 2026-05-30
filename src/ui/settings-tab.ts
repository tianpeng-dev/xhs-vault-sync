import { App, PluginSettingTab, Setting } from "obsidian";
import type XhsVaultSyncPlugin from "../main";

export class XhsVaultSyncSettingTab extends PluginSettingTab {
  constructor(app: App, private readonly plugin: XhsVaultSyncPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "XHS Vault Sync" });

    new Setting(containerEl)
      .setName("Root folder")
      .setDesc("Synced Markdown and media will be stored under this vault folder.")
      .addText((text) =>
        text
          .setPlaceholder("RedNote")
          .setValue(this.plugin.settings.rootFolder)
          .onChange(async (value) => {
            this.plugin.settings.rootFolder = value.trim() || "RedNote";
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Batch size")
      .setDesc("Number of notes to sync per run. Keep this between 1 and 10 to reduce rate-limit risk.")
      .addText((text) =>
        text
          .setPlaceholder("5")
          .setValue(String(this.plugin.settings.syncBatchSize))
          .onChange(async (value) => {
            const parsed = Number(value);
            this.plugin.settings.syncBatchSize = Number.isFinite(parsed)
              ? Math.min(10, Math.max(1, Math.floor(parsed)))
              : 5;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Download images")
      .setDesc("Save note images into the vault instead of linking remote URLs.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.downloadImages)
          .onChange(async (value) => {
            this.plugin.settings.downloadImages = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
