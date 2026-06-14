import { describe, expect, it, vi } from "vitest";
import XhsVaultSyncPlugin from "../src/main";
import { createDefaultSettings } from "../src/settings";
import { XhsVaultSyncSettingTab } from "../src/ui/settings-tab";

type ElementNode = HTMLElement & {
  children?: ElementNode[];
  disabled?: boolean;
  inputKind?: "toggle" | "text";
  click?: () => void;
  change?: (value: string | boolean) => void;
};

function collectText(element: ElementNode): string[] {
  const ownText = element.textContent ? [element.textContent] : [];
  const childText = [...(element.children ?? [])].flatMap((child) =>
    collectText(child)
  );
  return [...ownText, ...childText];
}

function findNodeByText(element: ElementNode, text: string): ElementNode | undefined {
  if (element.textContent === text) return element;
  for (const child of element.children ?? []) {
    const found = findNodeByText(child, text);
    if (found) return found;
  }
  return undefined;
}

function collectInputs(element: ElementNode): ElementNode[] {
  const own = element.inputKind ? [element] : [];
  const childInputs = [...(element.children ?? [])].flatMap((child) =>
    collectInputs(child)
  );
  return [...own, ...childInputs];
}

describe("XhsVaultSyncSettingTab", () => {
  it("在标题后展示当前状态摘要且不泄露登录凭据", () => {
    const plugin = new XhsVaultSyncPlugin({} as never, {} as never);
    plugin.settings = {
      ...createDefaultSettings(),
      a1Cookie: "a1=secret_cookie_value_123456",
      lastSyncAt: new Date("2026-06-13T12:00:00Z").getTime(),
      syncedIds: {
        note1: true,
        note2: true
      }
    };
    const tab = new XhsVaultSyncSettingTab(plugin.app, plugin);

    tab.display();

    const text = collectText(tab.containerEl as ElementNode).join("\n");
    expect(text).toContain("XHS Vault Sync");
    expect(text).toContain("当前状态");
    expect(text).toContain("登录状态：已保存登录态");
    expect(text).toContain("上次同步：");
    expect(text).toContain("已同步：2 条");
    expect(text).not.toContain("secret_cookie_value_123456");
  });

  it("提供登录、立即同步和查看状态操作按钮并调用插件方法", () => {
    const plugin = new XhsVaultSyncPlugin({} as never, {} as never);
    plugin.settings = {
      ...createDefaultSettings(),
      a1Cookie: "logged-in"
    };
    const openLoginModal = vi
      .spyOn(plugin, "openLoginModal")
      .mockImplementation(() => undefined);
    const syncNow = vi.spyOn(plugin, "syncNow").mockResolvedValue(undefined);
    const openStatusModal = vi
      .spyOn(plugin, "openStatusModal")
      .mockImplementation(() => undefined);
    const tab = new XhsVaultSyncSettingTab(plugin.app, plugin);

    tab.display();

    const container = tab.containerEl as ElementNode;
    expect(collectText(container)).toContain("操作");
    expect(collectText(container)).toContain("登录后即可同步小红书收藏。");
    findNodeByText(container, "登录小红书")?.click?.();
    findNodeByText(container, "立即同步")?.click?.();
    findNodeByText(container, "查看状态")?.click?.();

    expect(openLoginModal).toHaveBeenCalledTimes(1);
    expect(syncNow).toHaveBeenCalledTimes(1);
    expect(openStatusModal).toHaveBeenCalledTimes(1);
  });

  it("未登录时提示先登录并禁用立即同步按钮", () => {
    const plugin = new XhsVaultSyncPlugin({} as never, {} as never);
    plugin.settings = createDefaultSettings();
    const syncNow = vi.spyOn(plugin, "syncNow").mockResolvedValue(undefined);
    const tab = new XhsVaultSyncSettingTab(plugin.app, plugin);

    tab.display();

    const container = tab.containerEl as ElementNode;
    const syncButton = findNodeByText(container, "立即同步");
    expect(collectText(container)).toContain("请先登录小红书，再执行同步。");
    expect(syncButton?.disabled).toBe(true);
    syncButton?.click?.();
    expect(syncNow).not.toHaveBeenCalled();
  });

  it("设置项变更会保存并更新同步配置", async () => {
    const plugin = new XhsVaultSyncPlugin({} as never, {} as never);
    plugin.settings = createDefaultSettings();
    const saveSettings = vi.spyOn(plugin, "saveSettings").mockResolvedValue(undefined);
    const startSyncInterval = vi
      .spyOn(plugin, "startSyncInterval")
      .mockImplementation(() => undefined);
    const tab = new XhsVaultSyncSettingTab(plugin.app, plugin);

    tab.display();

    const container = tab.containerEl as ElementNode;
    expect(collectText(container)).toContain("下载视频");
    const inputs = collectInputs(container);
    inputs[0].change?.(true);
    inputs[1].change?.("3");
    inputs[2].change?.("  ");
    inputs[3].change?.("20");
    inputs[4].change?.(false);
    inputs[5].change?.(true);

    await Promise.resolve();
    expect(plugin.settings.autoSyncEnabled).toBe(true);
    expect(plugin.settings.syncIntervalMinutes).toBe(5);
    expect(plugin.settings.rootFolder).toBe("RedNote");
    expect(plugin.settings.syncBatchSize).toBe(10);
    expect(plugin.settings.downloadImages).toBe(false);
    expect(plugin.settings.downloadVideos).toBe(true);
    expect(saveSettings).toHaveBeenCalledTimes(6);
    expect(startSyncInterval).toHaveBeenCalledTimes(2);
  });
});
