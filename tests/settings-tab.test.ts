import { beforeEach, describe, expect, it, vi } from "vitest";
import { Setting } from "obsidian";
import XhsVaultSyncPlugin from "../src/main";
import { createDefaultSettings } from "../src/settings";
import { XhsVaultSyncSettingTab } from "../src/ui/settings-tab";

type ElementNode = HTMLElement & {
  children?: ElementNode[];
  disabled?: boolean;
  inputKind?: "toggle" | "text" | "dropdown";
  click?: () => void;
  change?: (value: string | boolean) => void;
  createEl?: (tag: string, options?: { text?: string }) => ElementNode;
};

type SettingWithContainer = Setting & {
  settingEl?: ElementNode;
  containerEl?: {
    children?: ElementNode[];
  };
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

function installDropdownMock(): void {
  if ("addDropdown" in Setting.prototype) return;

  Object.defineProperty(Setting.prototype, "addDropdown", {
    configurable: true,
    value(callback: (dropdown: {
      addOption(value: string, display: string): unknown;
      setValue(value: string): unknown;
      onChange(handler: (value: string) => unknown): unknown;
    }) => unknown) {
      const setting = this as SettingWithContainer;
      const settingEl = setting.settingEl ?? setting.containerEl?.children?.at(-1);
      const dropdownEl = settingEl?.createEl?.("select") as unknown as ElementNode | undefined;
      if (!dropdownEl) throw new Error("dropdown mock requires a setting element");
      dropdownEl.inputKind = "dropdown";
      const dropdown = {
        addOption: (value: string, display: string) => {
          dropdownEl.createEl?.("option", { text: display });
          return dropdown;
        },
        setValue: () => dropdown,
        onChange: (handler: (value: string) => unknown) => {
          const changeable = dropdownEl as ElementNode & {
            __changeListeners?: Array<(value: string | boolean) => unknown>;
          };
          changeable.__changeListeners?.push(handler as (value: string | boolean) => unknown);
          return dropdown;
        }
      };
      callback(dropdown);
      return this;
    }
  });
}

describe("XhsVaultSyncSettingTab", () => {
  beforeEach(() => {
    installDropdownMock();
  });

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
    const inputs = collectInputs(container).filter((input) => input.inputKind !== "dropdown");
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

  it("提供同步目标下拉框并保存帖子和点赞目标", async () => {
    const plugin = new XhsVaultSyncPlugin({} as never, {} as never);
    plugin.settings = createDefaultSettings();
    const saveSettings = vi.spyOn(plugin, "saveSettings").mockResolvedValue(undefined);
    const tab = new XhsVaultSyncSettingTab(plugin.app, plugin);

    tab.display();

    const container = tab.containerEl as ElementNode;
    const text = collectText(container).join("\n");
    expect(text).toContain("同步目标");
    expect(text).toContain("选择本次同步读取的个人数据来源。专辑将在后续版本开放。");

    const dropdown = collectInputs(container).find((input) => input.inputKind === "dropdown");
    const dropdownText = dropdown ? collectText(dropdown).join("\n") : "";
    expect(dropdownText).toContain("收藏");
    expect(dropdownText).toContain("我的笔记");
    expect(dropdownText).toContain("点赞");
    expect(dropdownText).not.toContain("专辑");
    dropdown?.change?.("post");
    await Promise.resolve();
    expect(plugin.settings.activeSyncTarget).toBe("post");

    dropdown?.change?.("like");
    await Promise.resolve();
    expect(plugin.settings.activeSyncTarget).toBe("like");
    expect(saveSettings).toHaveBeenCalledTimes(2);
  });
});
