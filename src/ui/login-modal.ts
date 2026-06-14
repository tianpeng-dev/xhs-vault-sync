import { Modal, Notice } from "obsidian";
import type XhsVaultSyncPlugin from "../main";
import { readXhsCookieHeader, XHS_PARTITION } from "../xhs/cookies";
import { XHS_HOST } from "../xhs/hosts";

type WebviewElement = HTMLElement & {
  getURL?: () => string;
  executeJavaScript?: (code: string) => Promise<string>;
};

export class LoginModal extends Modal {
  private webviewEl: WebviewElement | null = null;

  constructor(private readonly plugin: XhsVaultSyncPlugin) {
    super(plugin.app);
  }

  onOpen(): void {
    this.modalEl.addClass("xhs-login-modal");
    this.contentEl.empty();

    const container = this.contentEl.createDiv({ cls: "xhs-webview-container" });
    const webview = document.createElement("webview") as WebviewElement;
    webview.setAttribute("src", XHS_HOST.web);
    webview.setAttribute("partition", XHS_PARTITION);
    webview.setAttribute("allowpopups", "true");
    container.appendChild(webview);
    this.webviewEl = webview;

    const actions = this.contentEl.createDiv();
    actions.createEl("button", { text: "I am logged in" }).addEventListener("click", () => {
      void this.handleLoginComplete();
    });
  }

  async handleLoginComplete(): Promise<void> {
    if (!this.webviewEl?.executeJavaScript) {
      new Notice("登录窗口尚未准备好。");
      return;
    }

    const visibleCookies = await this.webviewEl.executeJavaScript("document.cookie");
    const cookies = await readXhsCookieHeader(visibleCookies);
    const a1Cookie = cookies.match(/(?:^|;\s*)a1=([^;]+)/)?.[1] ?? "";
    if (!a1Cookie) {
      new Notice("未找到 a1 Cookie，请先完成登录。");
      return;
    }

    this.plugin.settings.cookies = "";
    this.plugin.settings.a1Cookie = a1Cookie;
    await this.plugin.saveSettings();
    await this.plugin.updateSyncStatus({
      phase: "idle",
      message: "登录成功，可以开始同步",
      discoveredCount: 0,
      savedCount: 0,
      skippedCount: 0
    });
    new Notice("小红书登录已保存。下一步执行立即同步书签。");
    this.close();
  }

  onClose(): void {
    this.contentEl.empty();
    this.webviewEl = null;
  }
}
