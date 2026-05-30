import { Modal, Notice } from "obsidian";
import type XhsVaultSyncPlugin from "../main";
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
    webview.setAttribute("partition", "persist:xhs-vault-sync");
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
      new Notice("Login webview is not ready.");
      return;
    }

    const cookies = await this.webviewEl.executeJavaScript("document.cookie");
    const a1Cookie = cookies.match(/(?:^|;\s*)a1=([^;]+)/)?.[1] ?? "";
    if (!a1Cookie) {
      new Notice("No a1 cookie found. Finish login first.");
      return;
    }

    this.plugin.settings.cookies = cookies;
    this.plugin.settings.a1Cookie = a1Cookie;
    await this.plugin.saveSettings();
    new Notice("Xiaohongshu login saved.");
    this.close();
  }

  onClose(): void {
    this.contentEl.empty();
    this.webviewEl = null;
  }
}
