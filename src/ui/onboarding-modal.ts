import { Modal, Setting } from "obsidian";
import type XhsVaultSyncPlugin from "../main";

export class OnboardingModal extends Modal {
  private hasMarkedSeen = false;

  constructor(private readonly plugin: XhsVaultSyncPlugin) {
    super(plugin.app);
  }

  onOpen(): void {
    const { contentEl } = this;
    void this.markOnboardingSeen();

    contentEl.empty();
    contentEl.createEl("h2", { text: "开始同步小红书收藏" });

    const list = contentEl.createEl("ol");
    list.createEl("li", { text: "点击“登录小红书”，在弹窗中完成登录。" });
    list.createEl("li", { text: "在登录弹窗点击完成登录按钮（I am logged in）。" });
    list.createEl("li", { text: "点击“立即同步”，插件会把收藏保存到 RedNote。" });
    list.createEl("li", { text: "同步过程中可以在状态栏或“查看状态”里看进度。" });

    new Setting(contentEl)
      .addButton((button) =>
        button
          .setButtonText("登录小红书")
          .setCta()
          .onClick(async () => {
            await this.markOnboardingSeen();
            this.close();
            this.plugin.openLoginModal();
          })
      )
      .addButton((button) =>
        button.setButtonText("稍后再说").onClick(async () => {
          await this.markOnboardingSeen();
          this.close();
        })
      );
  }

  private async markOnboardingSeen(): Promise<void> {
    if (this.hasMarkedSeen || this.plugin.settings.hasSeenOnboarding) return;
    this.hasMarkedSeen = true;
    this.plugin.settings.hasSeenOnboarding = true;
    await this.plugin.saveSettings();
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
