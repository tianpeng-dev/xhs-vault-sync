import { App, PluginSettingTab, Setting } from "obsidian";
import type { SyncTarget } from "../settings";
import type XhsVaultSyncPlugin from "../main";
import { sanitizeStatusMessage } from "../sync/status";

function syncTargetLabel(target: SyncTarget): string {
  if (target === "post") return "我的笔记";
  if (target === "like") return "点赞";
  if (target === "album") return "专辑";
  return "收藏";
}

export class XhsVaultSyncSettingTab extends PluginSettingTab {
  constructor(app: App, private readonly plugin: XhsVaultSyncPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "XHS Vault Sync" });

    containerEl.createEl("h3", { text: "当前状态" });
    containerEl.createEl("p", {
      text: this.plugin.settings.a1Cookie ? "登录状态：已保存登录态" : "登录状态：未登录"
    });
    containerEl.createEl("p", {
      text: `当前账号：${this.plugin.settings.userName || this.plugin.settings.userId || "未识别"}`
    });
    containerEl.createEl("p", {
      text: `同步目标：${syncTargetLabel(this.plugin.settings.activeSyncTarget)}`
    });
    containerEl.createEl("p", {
      text: this.plugin.settings.lastSyncAt
        ? `上次同步：${new Date(this.plugin.settings.lastSyncAt).toLocaleString()}`
        : "上次同步：暂无"
    });
    containerEl.createEl("p", {
      text: `已同步：${Object.keys(this.plugin.settings.syncedIds).length} 条`
    });
    if (this.plugin.settings.lastSyncError) {
      containerEl.createEl("p", {
        text: `最近错误：${sanitizeStatusMessage(this.plugin.settings.lastSyncError)}`
      });
    }
    const isLoggedIn = Boolean(this.plugin.settings.a1Cookie);

    new Setting(containerEl)
      .setName("操作")
      .setDesc(isLoggedIn ? "登录后即可同步小红书收藏。" : "请先登录小红书，再执行同步。")
      .addButton((button) =>
        button.setButtonText("登录小红书").onClick(() => {
          this.plugin.openLoginModal();
        })
      )
      .addButton((button) =>
        button
          .setButtonText("立即同步")
          .setCta()
          .setDisabled(!isLoggedIn)
          .onClick(() => {
            void this.plugin.syncNow();
          })
      )
      .addButton((button) =>
        button.setButtonText("查看状态").onClick(() => {
          this.plugin.openStatusModal();
        })
      );

    new Setting(containerEl)
      .setName("自动同步")
      .setDesc("按固定间隔同步收藏，最小间隔为 5 分钟。")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.autoSyncEnabled).onChange(async (value) => {
          this.plugin.settings.autoSyncEnabled = value;
          await this.plugin.saveSettings();
          this.plugin.startSyncInterval();
        })
      );

    new Setting(containerEl)
      .setName("同步间隔（分钟）")
      .setDesc("最小 5 分钟。")
      .addText((text) =>
        text.setValue(String(this.plugin.settings.syncIntervalMinutes)).onChange(async (value) => {
          const parsed = Number(value);
          this.plugin.settings.syncIntervalMinutes = Number.isFinite(parsed) ? Math.max(5, Math.floor(parsed)) : 10;
          await this.plugin.saveSettings();
          this.plugin.startSyncInterval();
        })
      );

    new Setting(containerEl)
      .setName("保存目录")
      .setDesc("同步的 Markdown 和媒体文件会保存到此目录下。")
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
      .setName("单次同步数量")
      .setDesc("每次同步的笔记数量，范围为 1 到 10，降低触发限流的风险。")
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
      .setName("同步目标")
      .setDesc("选择本次同步读取的个人数据来源。")
      .addDropdown((dropdown) => {
        dropdown
          .addOption("bookmark", "收藏")
          .addOption("post", "我的笔记")
          .addOption("like", "点赞")
          .addOption("album", "专辑")
          .setValue(this.plugin.settings.activeSyncTarget)
          .onChange(async (value) => {
            this.plugin.settings.activeSyncTarget = value as SyncTarget;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("专辑白名单")
      .setDesc("仅同步已选择的专辑。")
      .addButton((button) =>
        button.setButtonText("刷新专辑列表").onClick(() => {
          void this.plugin.refreshAlbums();
        })
      );

    const albums = this.plugin.settings.lastAlbumSnapshot ?? [];
    if (!albums.length) {
      containerEl.createEl("p", { text: "暂无专辑快照，请先刷新专辑列表。" });
    }
    for (const album of albums) {
      const countText = album.noteCount === undefined ? "" : `（${album.noteCount} 条）`;
      new Setting(containerEl)
        .setName(`${album.title}${countText}`)
        .setDesc(album.id)
        .addToggle((toggle) =>
          toggle
            .setValue(Boolean(this.plugin.settings.albumWhitelist[album.id]))
            .onChange(async (value) => {
              if (value) {
                this.plugin.settings.albumWhitelist[album.id] = true;
              } else {
                delete this.plugin.settings.albumWhitelist[album.id];
              }
              await this.plugin.saveSettings();
            })
        );
    }

    new Setting(containerEl)
      .setName("下载图片")
      .setDesc("将笔记图片保存到库中，而不是引用远程链接。")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.downloadImages)
          .onChange(async (value) => {
            this.plugin.settings.downloadImages = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("下载视频")
      .setDesc("将视频笔记保存到库中，而不是引用远程链接。")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.downloadVideos)
          .onChange(async (value) => {
            this.plugin.settings.downloadVideos = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
