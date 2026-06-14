import { describe, expect, it, vi } from "vitest";
import XhsVaultSyncPlugin from "../src/main";
import { createDefaultSettings } from "../src/settings";
import { OnboardingModal } from "../src/ui/onboarding-modal";

type ElementNode = HTMLElement & {
  children?: ElementNode[];
  click?: () => void;
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

async function flushAsyncClick(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe("OnboardingModal", () => {
  it("展示首次同步的 4 步引导并标记已看", async () => {
    const plugin = new XhsVaultSyncPlugin({} as never, {} as never);
    plugin.settings = createDefaultSettings();
    const saveSettings = vi.spyOn(plugin, "saveSettings").mockResolvedValue(undefined);
    const modal = new OnboardingModal(plugin);

    modal.open();
    await flushAsyncClick();

    const text = collectText(modal.contentEl as ElementNode).join("\n");
    expect(text).toContain("开始同步小红书收藏");
    expect(text).toContain("点击“登录小红书”，在弹窗中完成登录。");
    expect(text).toContain("在登录弹窗点击完成登录按钮（I am logged in）。");
    expect(text).toContain("点击“立即同步”，插件会把收藏保存到 RedNote。");
    expect(text).toContain("同步过程中可以在状态栏或“查看状态”里看进度。");
    expect(text).toContain("登录小红书");
    expect(text).toContain("稍后再说");
    expect(plugin.settings.hasSeenOnboarding).toBe(true);
    expect(saveSettings).toHaveBeenCalledTimes(1);
  });

  it("点击登录小红书后标记已看引导、保存、关闭并打开登录 Modal", async () => {
    const plugin = new XhsVaultSyncPlugin({} as never, {} as never);
    plugin.settings = createDefaultSettings();
    const saveSettings = vi.spyOn(plugin, "saveSettings").mockResolvedValue(undefined);
    const openLoginModal = vi
      .spyOn(plugin, "openLoginModal")
      .mockImplementation(() => undefined);
    const modal = new OnboardingModal(plugin);

    modal.open();
    await flushAsyncClick();
    findNodeByText(modal.contentEl as ElementNode, "登录小红书")?.click?.();
    await flushAsyncClick();

    expect(plugin.settings.hasSeenOnboarding).toBe(true);
    expect(saveSettings).toHaveBeenCalledTimes(1);
    expect(openLoginModal).toHaveBeenCalledTimes(1);
    expect(collectText(modal.contentEl as ElementNode)).toEqual([]);
  });

  it("点击稍后再说后只标记已看引导并关闭", async () => {
    const plugin = new XhsVaultSyncPlugin({} as never, {} as never);
    plugin.settings = createDefaultSettings();
    const saveSettings = vi.spyOn(plugin, "saveSettings").mockResolvedValue(undefined);
    const openLoginModal = vi
      .spyOn(plugin, "openLoginModal")
      .mockImplementation(() => undefined);
    const modal = new OnboardingModal(plugin);

    modal.open();
    await flushAsyncClick();
    findNodeByText(modal.contentEl as ElementNode, "稍后再说")?.click?.();
    await flushAsyncClick();

    expect(plugin.settings.hasSeenOnboarding).toBe(true);
    expect(saveSettings).toHaveBeenCalledTimes(1);
    expect(openLoginModal).not.toHaveBeenCalled();
    expect(collectText(modal.contentEl as ElementNode)).toEqual([]);
  });

  it("直接关闭时清空内容且不会再次触发引导", async () => {
    const plugin = new XhsVaultSyncPlugin({} as never, {} as never);
    plugin.settings = createDefaultSettings();
    const saveSettings = vi.spyOn(plugin, "saveSettings").mockResolvedValue(undefined);
    const modal = new OnboardingModal(plugin);

    modal.open();
    await flushAsyncClick();
    expect(collectText(modal.contentEl as ElementNode).join("")).not.toBe("");

    modal.close();

    expect(plugin.settings.hasSeenOnboarding).toBe(true);
    expect(saveSettings).toHaveBeenCalledTimes(1);
    expect(collectText(modal.contentEl as ElementNode)).toEqual([]);
  });
});
