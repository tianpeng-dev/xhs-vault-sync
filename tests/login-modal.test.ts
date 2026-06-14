import { describe, expect, it, vi } from "vitest";
import XhsVaultSyncPlugin from "../src/main";
import { createDefaultSettings } from "../src/settings";
import { LoginModal } from "../src/ui/login-modal";
import { readXhsCookieHeader, XHS_PARTITION } from "../src/xhs/cookies";

vi.mock("../src/xhs/cookies", () => ({
  XHS_PARTITION: "persist:xhs-vault-sync",
  readXhsCookieHeader: vi.fn()
}));

type LoginModalHarness = {
  webviewEl: {
    executeJavaScript: (code: string) => Promise<string>;
  };
  handleLoginComplete: () => Promise<void>;
};

describe("LoginModal", () => {
  it("登录 webview 使用持久分区以保留登录态", () => {
    const plugin = new XhsVaultSyncPlugin({} as never, {} as never);
    const createdElements: Array<{
      attrs: Record<string, string>;
      setAttribute(name: string, value: string): void;
      addEventListener(): void;
    }> = [];
    vi.stubGlobal("document", {
      createElement: vi.fn(() => {
        const webview = {
          attrs: {} as Record<string, string>,
          setAttribute(name: string, value: string) {
            this.attrs[name] = value;
          },
          addEventListener() {}
        };
        createdElements.push(webview);
        return webview;
      })
    });
    const modal = new LoginModal(plugin);

    modal.open();

    expect(createdElements[0].attrs.partition).toBe(XHS_PARTITION);
    expect(createdElements[0].attrs.partition).toBe("persist:xhs-vault-sync");
    vi.unstubAllGlobals();
  });

  it("登录成功后只保存 a1 并提示可以开始同步", async () => {
    const plugin = new XhsVaultSyncPlugin({} as never, {} as never);
    plugin.settings = createDefaultSettings();
    plugin.settings.cookies = "a1=old; web_session=old_secret";
    const saveSettings = vi.spyOn(plugin, "saveSettings").mockResolvedValue(undefined);
    const updateSyncStatus = vi
      .spyOn(plugin, "updateSyncStatus")
      .mockResolvedValue(undefined);
    vi.mocked(readXhsCookieHeader).mockResolvedValue("a1=session; web_session=secret");
    const modal = new LoginModal(plugin) as unknown as LoginModalHarness;
    modal.webviewEl = {
      executeJavaScript: vi.fn().mockResolvedValue("a1=session")
    };

    await modal.handleLoginComplete();

    expect(plugin.settings.a1Cookie).toBe("session");
    expect(plugin.settings.cookies).toBe("");
    expect(readXhsCookieHeader).toHaveBeenCalledWith("a1=session");
    expect(saveSettings).toHaveBeenCalledTimes(1);
    expect(updateSyncStatus).toHaveBeenCalledWith({
      phase: "idle",
      message: "登录成功，可以开始同步",
      discoveredCount: 0,
      savedCount: 0,
      skippedCount: 0
    });
    expect(saveSettings.mock.invocationCallOrder[0]).toBeLessThan(
      updateSyncStatus.mock.invocationCallOrder[0]
    );
  });

  it("未找到 a1 时不保存也不更新状态", async () => {
    const plugin = new XhsVaultSyncPlugin({} as never, {} as never);
    plugin.settings = createDefaultSettings();
    const saveSettings = vi.spyOn(plugin, "saveSettings").mockResolvedValue(undefined);
    const updateSyncStatus = vi
      .spyOn(plugin, "updateSyncStatus")
      .mockResolvedValue(undefined);
    vi.mocked(readXhsCookieHeader).mockResolvedValue("web_session=secret");
    const modal = new LoginModal(plugin) as unknown as LoginModalHarness;
    modal.webviewEl = {
      executeJavaScript: vi.fn().mockResolvedValue("")
    };

    await modal.handleLoginComplete();

    expect(plugin.settings.a1Cookie).toBe("");
    expect(saveSettings).not.toHaveBeenCalled();
    expect(updateSyncStatus).not.toHaveBeenCalled();
  });

  it("登录窗口未准备好时不保存也不更新状态", async () => {
    const plugin = new XhsVaultSyncPlugin({} as never, {} as never);
    plugin.settings = createDefaultSettings();
    const saveSettings = vi.spyOn(plugin, "saveSettings").mockResolvedValue(undefined);
    const updateSyncStatus = vi
      .spyOn(plugin, "updateSyncStatus")
      .mockResolvedValue(undefined);
    const modal = new LoginModal(plugin) as unknown as LoginModalHarness;
    modal.webviewEl = undefined as unknown as LoginModalHarness["webviewEl"];

    await modal.handleLoginComplete();

    expect(saveSettings).not.toHaveBeenCalled();
    expect(updateSyncStatus).not.toHaveBeenCalled();
  });
});
